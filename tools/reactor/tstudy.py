from sim import turbine
for steam in (2000,):
  for coil in ('gold','electrum','steel','aluminum','copper','iron'):
    best=None
    for shafts in (10,):
      blades=80
      for coils in range(8,160,2):
        fe,rpm=turbine(blades,shafts,coil,coils,steam,ticks=60000)
        if rpm<2000 and (best is None or fe>best[0]): best=(fe,rpm,coils)
    print(coil, steam, 'best FE/t %.0f at %.0f RPM with %d coils'%best)
