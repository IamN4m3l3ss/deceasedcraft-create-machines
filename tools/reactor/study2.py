from sim import Reactor, turbine
def lay(rows,h): return [rows]*h
D = {
 '5^3 cur': lay(['FWF','WFW','FWF'],3),
 '5^3 all': lay(['FFF']*3,3),
 '5x5x7 cur': lay(['FWF','WFW','FWF'],5),
 '7^3 grid2': lay(['FWFWF','WWWWW','FWFWF','WWWWW','FWFWF'],5),
 '7^3 checker': lay(['FWFWF','WFWFW','FWFWF','WFWFW','FWFWF'],5),
}
for k,l in D.items():
    R=Reactor(l,active=True); o=R.run(30000,4000)
    print('%-12s steam %.0f mB/t  ingots/h %.2f  fuelC %.0f caseC %.0f'%(k,o['steam'],o['ingots_per_hour'],o['fuel_heat'],o['case_heat']))
