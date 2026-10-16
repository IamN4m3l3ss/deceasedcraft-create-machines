import itertools, sys
from sim import Reactor
def casings(X,Y,Z):  # shell blocks minus the control rods on the roof (count separately)
    return (X+2)*(Y+2)*(Z+2) - X*Y*Z
def layout(n, h, pat, mod='W'):
    rows=[]
    for z in range(n):
        r=''
        for x in range(n):
            r += 'F' if pat(x,z,n) else mod
        rows.append(r)
    return [rows]*h
pats = {
 'checker': lambda x,z,n: (x+z)%2==0,
 'checker_odd': lambda x,z,n: (x+z)%2==1,
 'grid2': lambda x,z,n: x%2==0 and z%2==0,
 'grid2o': lambda x,z,n: x%2==1 and z%2==1,
 'all': lambda x,z,n: True,
 'center': lambda x,z,n: x==n//2 and z==n//2,
 'cross': lambda x,z,n: x==n//2 or z==n//2,
 'ring': lambda x,z,n: (x in (0,n-1) or z in (0,n-1)) and False,
}
res=[]
for n in range(1,10):
  for h in sorted(set([n, max(1,n-1), n+1, n+2, 2*n])):
    for pn,p in pats.items():
      for mod in ['W','.']:
        lay=layout(n,h,p,mod)
        if not any('F' in r for r in lay[0]): continue
        R=Reactor(lay); o=R.run(30000,4000)
        cas=casings(n,h,n) - R.n_cr
        res.append((n,h,pn,mod,R.n_rods,R.n_cr,cas,round(o['fe']),round(o['fe']/cas,1),round(o['ingots_per_hour'],2),round(o['fuel_heat'])))
res.sort(key=lambda r:-r[8])
print('n h pat mod rods crs casings FE/t FE/t/casing ingots/h fuelheat')
for r in res[:40]: print(*r)
print('--- by FE/t')
for r in sorted(res,key=lambda r:-r[7])[:15]: print(*r)
