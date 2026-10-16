#!/usr/bin/env python3
"""Extreme Reactors 2 (1.20.1) reactor + turbine simulation, ported line by line from the mod's
ReactorLogic, ReactorFuelRodEntity, MultiblockReactor, FluidContainer, TurbineLogic and TurbineData,
with DeceasedCraft's config (all multipliers 1.0) and the Reinforced variant. Used to pick the
reactor and turbine designs on the site; run it to check a layout.

Layout: interior only, list of y-layers (bottom first), each a list of rows (z), each a string (x):
  F fuel rod   W water   . air   G graphite block   I iron block   D diamond block   L lead block
  C copper block  S steel block  A aluminum block  Au gold block  E emerald block  N netherite block
The walls/roof/floor are casing. Every fuel rod column must reach the roof (a control rod sits on it).
"""
import math, sys

# ---- constants (EnergyConversion, IHeatEntity, FuelProperties.DEFAULT, Reaction.STANDARD_*) ----
E_PER_RAD = 10.0
E_PER_C_PER_VOL = 10.0
AMBIENT = 20.0
COND = dict(air=0.05, water=0.1, stone=0.15, glass=0.3, iron=0.6, copper=1.0, silver=1.5, gold=2.0, emerald=2.5, diamond=3.0)
FUEL = dict(moderation=1.5, absorption=0.5, hardness_div=1.0, fission_per_unit=0.01, units_per_fission=0.0007)
REACTIVITY = 1.05
FUEL_PER_ROD = 4000  # 4 ingots
# Moderator(absorption, heatEfficiency, moderation, heatConductivity)
MOD = {
    '.': (0.10, 0.25, 1.10, COND['air']),
    'W': (0.33, 0.50, 1.33, COND['water']),
    'G': (0.10, 0.50, 2.00, COND['gold']),       # forge:storage_blocks/graphite
    'I': (0.50, 0.75, 1.40, COND['iron']),
    'Au': (0.52, 0.80, 1.45, COND['gold']),
    'D': (0.55, 0.85, 1.50, COND['diamond']),
    'E': (0.55, 0.85, 1.50, COND['emerald']),
    'N': (0.55, 0.95, 1.65, COND['diamond']),
    'C': (0.50, 0.75, 1.40, COND['copper']),
    'L': (0.75, 0.75, 1.75, COND['silver']),
    'S': (0.50, 0.78, 1.42, COND['iron']),
    'A': (0.50, 0.78, 1.42, COND['iron']),
}
# reinforced variant
VAPOR_EFF = 0.85
PASSIVE_TRANSFER = 0.2
PASSIVE_POWER = 0.5
WATER_BOIL = 100.0
WATER_ENTHALPY = 4.0


def parse(layers):
    """returns dict (x,y,z)->token for the interior, and size"""
    cells = {}
    for y, L in enumerate(layers):
        for z, row in enumerate(L):
            toks = row.split() if ' ' in row else list(row)
            for x, t in enumerate(toks):
                cells[(x, y, z)] = t
    X = max(k[0] for k in cells) + 1; Y = len(layers); Z = max(k[2] for k in cells) + 1
    return cells, (X, Y, Z)


class Reactor:
    def __init__(self, layers, active=False, insertion=0.0):
        self.cells, (self.X, self.Y, self.Z) = parse(layers)
        self.active = active
        self.ins = insertion  # 0..1, same for every control rod
        self.rods = sorted([k for k, t in self.cells.items() if t == 'F'], key=lambda k: (k[1], k[0], k[2]))
        cols = {(x, z) for (x, y, z) in self.rods}
        self.n_rods = len(self.rods)
        self.n_cr = len(cols)
        for (x, z) in cols:
            for y in range(self.Y):
                assert self.cells[(x, y, z)] == 'F', 'fuel rod columns must run floor to roof'
        self.vol = self.X * self.Y * self.Z
        ext = (self.X + 2, self.Y + 2, self.Z + 2)
        self.k_fuel = sum(self.rod_conductivity(r) for r in self.rods)
        self.k_cool = COND['iron'] * 2 * (self.X * self.Y + self.X * self.Z + self.Y * self.Z)
        self.k_loss = 0.001 * 2 * (ext[0] * ext[1] + ext[0] * ext[2] + ext[1] * ext[2])
        self.fuel = FUEL_PER_ROD * self.n_rods
        self.fuel_heat = AMBIENT; self.heat = AMBIENT; self.fert = 1.0; self.src = 0
        # active: the coolant tank holds water ((outer volume - interior) * 1000, max 200k)
        self.coolant_cap = min(200000, (ext[0] * ext[1] * ext[2] - self.vol) * 1000)

    def rod_conductivity(self, r):
        x, y, z = r; k = 0.0
        for dx, dz in ((0, 1), (-1, 0), (0, -1), (1, 0)):
            t = self.cells.get((x + dx, y, z + dz))
            if t is None: k += COND['iron']              # casing: an IHeatEntity
            elif t == 'F': k += COND['air']              # fuel rods don't pool heat; fall back to air
            else: k += MOD[t][3]
        return k

    def temp_from(self, vol, e): return e / (vol * E_PER_C_PER_VOL)
    def energy_of(self, vol, t): return t * vol * E_PER_C_PER_VOL

    def tick(self):
        out = dict(fe=0.0, steam=0.0, fuel=0.0)
        # ---- irradiation (one fuel rod per tick, in turn)
        r = self.rods[self.src % self.n_rods]; self.src += 1
        fh = self.fuel_heat
        pen = math.exp(-15 * math.exp(-0.0025 * fh))
        raw = self.fuel * FUEL['fission_per_unit']
        scaled = raw ** REACTIVITY
        scaled = (scaled / self.n_cr) ** REACTIVITY * self.n_cr
        crm = (100 - self.ins * 100) / 100
        scaled *= crm; raw *= crm
        eff = scaled * (1 + (-0.95 * math.exp(-10 * math.exp(-0.0012 * fh))))
        hard = 0.2 + 0.8 * pen
        fmod = 1.0 if self.fert <= 1 else math.log10(self.fert) + 1
        usage = FUEL['units_per_fission'] * raw / fmod
        env_e = 0.0; fuel_e = E_PER_RAD * eff; fert_abs = 0.0
        eff *= 0.25
        for dx, dz in ((0, 1), (-1, 0), (0, -1), (1, 0)):   # SOUTH, WEST, NORTH, EAST
            inten, hd = eff, hard
            p = list(r); ttl = 4
            while ttl > 0 and inten > 0.0001:
                ttl -= 1; p[0] += dx; p[2] += dz
                x, y, z = p
                if not (-1 <= x <= self.X and -1 <= z <= self.Z):
                    continue  # outside the bounding box: no effect
                t = self.cells.get((x, y, z))
                if t is None:  # casing / control rod etc: swallows everything
                    inten = 0.0; continue
                if t == 'F':
                    ba = (1.0 - 0.95 * math.exp(-10 * math.exp(-0.0022 * fh))) * (1 - hd / FUEL['hardness_div'])
                    sa = min(1.0, ba * FUEL['absorption'])
                    bonus = (1 - sa) * self.ins * 0.5; pen2 = sa * self.ins * 0.5
                    absorbed = (sa + bonus) * inten; fabs = (sa - pen2) * inten
                    m = FUEL['moderation']; m += m * self.ins + self.ins
                    inten = max(0.0, inten - absorbed); hd /= m
                    fuel_e += absorbed * E_PER_RAD; fert_abs += fabs
                else:
                    a, he, m, _ = MOD[t]
                    absorbed = inten * a * (1 - hd)
                    inten = max(0.0, inten - absorbed); hd /= m
                    env_e += he * absorbed * E_PER_RAD
        self.fert += fert_abs
        self.fuel_heat += self.temp_from(self.n_rods, fuel_e)
        self.heat += self.temp_from(self.vol, env_e)
        out['fuel'] = usage
        # ---- decay
        self.fert = max(0.0, self.fert - max(0.1, self.fert / 20))
        # ---- fuel -> reactor
        d = self.fuel_heat - self.heat
        if d > 0.01:
            tr = d * self.k_fuel
            fe = self.energy_of(self.n_rods, self.fuel_heat) - tr
            re = self.energy_of(self.vol, self.heat) + tr
            self.fuel_heat = self.temp_from(self.n_rods, fe); self.heat = self.temp_from(self.vol, re)
        # ---- reactor -> coolant
        cool_t = min(self.heat, WATER_BOIL) if self.active else AMBIENT
        d = self.heat - cool_t
        if d > 0.01:
            tr = d * self.k_cool
            re = self.energy_of(self.vol, self.heat)
            if not self.active:
                tr *= PASSIVE_TRANSFER
                out['fe'] = tr * PASSIVE_POWER
            else:
                # vaporize: the tank never runs dry here (water in = steam out)
                steam = int(tr / WATER_ENTHALPY)
                out['water'] = steam
                out['steam'] = steam * VAPOR_EFF
                tr = steam * WATER_ENTHALPY if steam >= 1 else 0
            re -= tr
            self.heat = self.temp_from(self.vol, re)
        # ---- passive heat loss
        d = self.heat - AMBIENT
        if d > 0.000001:
            lost = max(1.0, d * self.k_loss)
            self.heat = self.temp_from(self.vol, max(0.0, self.energy_of(self.vol, self.heat) - lost))
        self.heat = max(0.0, self.heat); self.fuel_heat = max(0.0, self.fuel_heat)
        return out

    def run(self, ticks=60000, avg=6000):
        acc = dict(fe=0.0, steam=0.0, fuel=0.0)
        for i in range(ticks):
            o = self.tick()
            if i >= ticks - avg:
                for k in acc: acc[k] += o.get(k, 0.0)
        res = {k: v / avg for k, v in acc.items()}
        res.update(fuel_heat=self.fuel_heat, case_heat=self.heat, rods=self.n_rods, control_rods=self.n_cr,
                   size=(self.X + 2, self.Y + 2, self.Z + 2))
        # fuel in ingots per in-game day / per hour (1 ingot = 1000 mB)
        res['ingots_per_hour'] = res['fuel'] * 72000 / 1000
        res['fe_per_ingot'] = res['fe'] / res['fuel'] * 1000 if res['fuel'] else 0
        return res


# ---------------- turbine ----------------
COIL = {'iron': (1.0, 1.0, 1.0), 'gold': (2.0, 1.0, 1.75), 'copper': (1.2, 1.0, 1.2), 'lead': (1.35, 1.01, 1.3),
        'aluminum': (1.5, 1.0, 1.3), 'steel': (1.5, 1.0, 1.3), 'silver': (1.7, 1.0, 1.5), 'electrum': (2.5, 1.0, 2.0),
        'nickel': (1.15, 1.06, 1.0), 'zinc': (1.35, 1.0, 1.3), 'brass': (1.4, 1.0, 1.2), 'netherite': (2.2, 1.02, 1.8)}


def turbine(blades, shafts, coil, coils, steam, ticks=200000):
    """steam mB/t in; returns (FE/t, RPM). Reinforced: 25 mB per blade, mass 10 per blade/shaft, 2000 mB/t max."""
    eff, bonus, drag = COIL[coil]
    mass = (blades + shafts) * 10
    frict = mass * 0.01
    blade_drag = 0.00025 * blades
    ind_eff = (eff * coils * 0.33) / coils
    ind_bonus = max(1.0, bonus * coils / coils)
    ind_drag = (drag * coils / coils) * 0.1
    energy = 0.0; fe = 0.0; rpm = 0.0
    steam = min(steam, 2000)
    for i in range(ticks):
        speed = energy / (blades * mass) if blades and mass else 0
        aero = speed * blade_drag
        proc = min(blades * 25, steam)
        lift = proc * 10.0  # steam energy density
        if proc < steam:
            rest = steam - proc
            need = steam // 25; missing = need - blades
            lift += rest * 10.0 * (1 - missing / need)
        induct = speed * ind_drag * coils
        gen = induct ** ind_bonus * ind_eff
        e = 0.25 * math.cos(speed / (45.5 * math.pi)) + 0.75
        if speed < 500: e = min(0.5, e)
        fe = gen * e
        energy = max(0.0, energy + lift - induct - aero - frict)
        rpm = speed
    return fe, rpm


if __name__ == '__main__':
    lay = [['F.F', '.F.', 'F.F']] * 3
    print(Reactor(lay).run())
