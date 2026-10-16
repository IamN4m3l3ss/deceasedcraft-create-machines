# Reactor and turbine simulation

`sim.py` is a line-by-line port of Extreme Reactors 2's reactor and turbine logic (ReactorLogic,
ReactorFuelRodEntity, MultiblockReactor, FluidContainer, TurbineLogic, TurbineData) with
DeceasedCraft's config (all multipliers 1.0) and the Reinforced variant. The numbers on the reactor
page come from it.

    python3 sim.py            # one example layout
    python3 study.py          # compare passive layouts
    python3 study2.py         # active (steam) layouts
    python3 tsearch.py 2000   # turbine shapes for 2,000 mB/t of steam
