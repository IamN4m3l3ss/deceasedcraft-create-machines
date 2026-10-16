from sim import Reactor
def lay(rows,h): return [rows]*h
D = {
 '3x3x3 1 rod': lay(['F'],1),
 '4x4x4 2x2 all': lay(['FF','FF'],2),
 '5^3 cur (15 rods, water)': lay(['FWF','WFW','FWF'],3),
 '5^3 all rods': lay(['FFF','FFF','FFF'],3),
 '5^3 center+water': lay(['WWW','WFW','WWW'],3),
 '5^3 plus water': lay(['WFW','FFF','WFW'],3),
 '5x5x7 cur pattern': lay(['FWF','WFW','FWF'],5),
 '7^3 checker': lay(['FWFWF','WFWFW','FWFWF','WFWFW','FWFWF'],5),
 '7^3 checker odd': lay(['WFWFW','FWFWF','WFWFW','FWFWF','WFWFW'],5),
 '7^3 grid2': lay(['FWFWF','WWWWW','FWFWF','WWWWW','FWFWF'],5),
 '7^3 all': lay(['FFFFF']*5,5),
 '7x7x9 checker': lay(['FWFWF','WFWFW','FWFWF','WFWFW','FWFWF'],7),
}
print('%-26s %5s %4s %8s %9s %8s %7s'%('design','rods','cas','FE/t','ingots/h','MFE/ing','fuelC'))
for k,l in D.items():
    R=Reactor(l); o=R.run(30000,4000)
    X,Y,Z=o['size']; cas=X*Y*Z-(X-2)*(Y-2)*(Z-2)-R.n_cr
    print('%-26s %5d %4d %8.0f %9.2f %8.2f %7.0f'%(k,R.n_rods,cas,o['fe'],o['ingots_per_hour'],o['fe_per_ingot']/1e6,o['fuel_heat']))
