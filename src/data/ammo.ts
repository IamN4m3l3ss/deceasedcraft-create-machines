// Calibers and gun-part kits, from the pack's kubejs/server_scripts/recipes/deceasedcraft/bullets.js and gun_parts.js.
export interface Caliber {
  id: string // short id used in URLs
  label: string
  casing: string // casing item id
  mold: string
  round: string // round item id (our id for the tacz:ammo NBT variant)
  roundTex: string // the round's icon from the bundled TaCZ gun packs
  perBrass: number // casings per brass ingot (37mm: per brass block)
  brassBlock?: boolean
  steps: string[] // deployer items, in order (D1, D2, D3)
  tier: 'early' | 'mid' | 'late'
  use: string
}
const std = (id: string, label: string, casingSuffix: string, moldSuffix: string, ammoId: string, tier: Caliber['tier'], use: string): Caliber => ({
  id, label, casing: 'deceasedcraft:bullet_casing_' + casingSuffix, mold: 'deceasedcraft:mold_bullet_casing_' + moldSuffix,
  round: 'tacz:ammo_' + ammoId, roundTex: 'tacz:ammo/slot/' + ammoId, perBrass: 4,
  steps: ['createbigcannons:gunpowder_pinch', 'immersiveengineering:nugget_lead'], tier, use,
})
export const CALIBERS: Caliber[] = [
  std('9mm', '9mm', '9mm_round', '9mm', '9mm', 'early', 'Pistols and SMGs'),
  std('45acp', '.45 ACP', '45acp', '45acp', '45acp', 'early', 'Pistols and SMGs'),
  std('357', '.357 Magnum', '357magnum', '357magnum', '357mag', 'mid', 'Revolvers'),
  std('50ae', '.50 AE', 'ae50', 'ae50', '50ae', 'mid', 'Heavy pistols'),
  std('12g', '12 Gauge', '12g', '12g', '12g', 'early', 'Shotguns'),
  std('556', '5.56×45', '556x45', '556x45', '556x45', 'mid', 'Assault rifles'),
  std('57', '5.7×28', '57x28', '57x28', '57x28', 'mid', 'PDWs'),
  std('762x39', '7.62×39', '762x39', '762x39', '762x39', 'mid', 'AK-type rifles'),
  std('3006', '.30-06', '30_06', '30_06', '30_06', 'mid', 'Battle and hunting rifles'),
  std('308', '.308', '308', '308', '308', 'mid', 'Marksman rifles'),
  std('762x54', '7.62×54R', '762x54', '762x54', '762x54', 'late', 'Machine guns, DMRs'),
  std('338', '.338', '338', '338', '338', 'late', 'Sniper rifles'),
  { id: '50bmg', label: '.50 BMG', casing: 'deceasedcraft:bullet_casing_50bmg', mold: 'deceasedcraft:mold_bullet_casing_50bmg', round: 'tacz:ammo_50bmg', roundTex: 'tacz:ammo/slot/50bmg', perBrass: 2, steps: ['minecraft:gunpowder', 'immersiveengineering:ingot_lead'], tier: 'late', use: 'Anti-materiel rifles, HMGs' },
  { id: '40mm', label: '40mm Grenade', casing: 'deceasedcraft:bullet_casing_40mm', mold: 'deceasedcraft:mold_bullet_casing_40mm', round: 'tacz:ammo_40mm', roundTex: 'tacz:ammo/slot/40mm', perBrass: 1, steps: ['minecraft:gunpowder', 'minecraft:tnt'], tier: 'late', use: 'Grenade launchers' },
  { id: '37mm', label: '37mm APHE', casing: 'deceasedcraft:bullet_casing_37mm', mold: 'deceasedcraft:mold_bullet_casing_37mm', round: 'rebel:ammo_37aphe', roundTex: 'rebel:ammo/slot/37aphe', perBrass: 2, brassBlock: true, steps: ['quark:gunpowder_sack', 'minecraft:tnt', 'immersiveengineering:storage_lead'], tier: 'late', use: 'Vehicle cannons' },
]

export interface Kit { id: string; label: string; item: string; blueprint: string; special: string; loops: number; attachment?: boolean; use: string }
const kit = (id: string, label: string, special: string, use: string): Kit => ({ id, label, item: `deceasedcraft:${id}_assembly_parts`, blueprint: `deceasedcraft:${id}_assembly_parts_blueprint`, special, loops: 4, use })
export const KITS: Kit[] = [
  kit('pistol', 'Pistol', 'minecraft:iron_ingot', 'Pistols'),
  kit('smg', 'SMG', 'minecraft:iron_ingot', 'Submachine guns'),
  kit('shotgun', 'Shotgun', 'immersiveengineering:ingot_steel', 'Shotguns'),
  kit('rifle', 'Rifle', 'immersiveengineering:ingot_steel', 'Rifles'),
  kit('sniper', 'Sniper', 'minecraft:netherite_scrap', 'Sniper rifles'),
  kit('hmg', 'HMG', 'minecraft:netherite_scrap', 'Heavy machine guns'),
  kit('special', 'Special', 'minecraft:netherite_scrap', 'Special weapons'),
  { ...kit('attachment', 'Attachment', 'deceasedcraft:rubber', 'Scopes, grips and other attachments'), loops: 1, attachment: true },
]
