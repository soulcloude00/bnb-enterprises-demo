import asyncio, json, sys, time
from playwright.async_api import async_playwright
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
OUT='/workspace/bnb-shots/v2/'
CFG=json.loads(sys.argv[1]) if len(sys.argv)>1 else [{"name":"villa-cant","q":"high","vp":[1440,900],"S":{"type":"villa","variant":"cantilever","plot":"40x60","floors":"g1","tier":"premium"},"light":"golden","step":2}]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
        for c in CFG:
            ctx=await b.new_context(viewport={'width':c['vp'][0],'height':c['vp'][1]},device_scale_factor=c.get('dpr',1),is_mobile=c.get('mobile',False),has_touch=c.get('mobile',False))
            pg=await ctx.new_page(); errs=[]
            pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
            pg.on('pageerror',lambda e: errs.append('PAGEERR '+str(e)))
            await pg.goto('http://localhost:8811/consult.html?q='+c['q'])
            await pg.wait_for_function('window.__bnbConsult')
            await pg.evaluate('window.__bnbConsult.ready()')
            await pg.wait_for_timeout(500)
            st=dict(c['S']); st['light']=c.get('light','golden')
            await pg.evaluate('o=>{window.__bnbConsult.set(o.S);window.__bnbConsult.go(o.step);window.__bnbConsult.light(o.S.light)}',{'S':st,'step':c.get('step',2)})
            await pg.wait_for_timeout(c.get('wait',2500))
            await pg.evaluate('window.__bnbConsult.settle()')
            if c.get('thumbs'): await pg.evaluate('window.__bnbConsult.thumbs()')
            await pg.wait_for_timeout(c.get('wait2',4000))
            t=time.time()
            sel='.cx' if c.get('full') else '.cx-stage'
            await pg.locator(sel).screenshot(path=OUT+c['name']+'.png')
            stats=await pg.evaluate('window.__bnbConsult.stats()')
            print(c['name'],json.dumps(stats),'shot %.1fs'%(time.time()-t))
            for e in errs[:8]: print('   ',e[:300])
            await ctx.close()
        await b.close()
asyncio.run(main())
