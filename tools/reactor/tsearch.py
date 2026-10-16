from sim import turbine
import sys
steam=int(sys.argv[1]) if len(sys.argv)>1 else 2000
res=[]
for w in (3,5,7):
  arm=(w-1)//2; bpl=4*arm
  for coil in ('electrum','gold'):
    for lb in range(2,23):
      for lc in range(1,22):
        h=lb+lc
        if h>23: continue
        blades=bpl*lb; coils=8*lc
        fe,rpm=turbine(blades,h,coil,coils,steam,40000)
        if rpm>1950: continue
        shell=(w+2)**2*(h+2)-w*w*h
        res.append((round(fe),round(rpm),w,coil,lb,lc,blades,coils,shell,round(fe/shell,1)))
for r in sorted(res,key=lambda r:-r[9])[:10]: print(r)
print('--')
for r in sorted(res,key=lambda r:-r[0])[:6]: print(r)
