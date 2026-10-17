import json
from playwright.sync_api import sync_playwright
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
O='/workspace/bnb-shots/v2/'
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=ARGS)
    # 1) payload + summary + perf, full flow at high tier
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page(); E=[]; R={}
    pg.on('console',lambda m: E.append(m.type+': '+m.text) if m.type in('error','warning') else None); pg.on('pageerror',lambda e:E.append('PAGEERR '+str(e)))
    def onresp(r):
        try: R[r.url]=len(r.body())
        except Exception: pass
    pg.on('response',onresp)
    pg.goto('http://localhost:8811/index.html',wait_until='networkidle'); base=sum(R.values()); R0=dict(R)
    pg.click('.hdr .nav .btn'); pg.wait_for_selector('.cx.open'); pg.evaluate('window.__bnbConsult.ready()'); pg.wait_for_timeout(1500)
    pg.evaluate("window.__bnbConsult.set({type:'villa',variant:'courtyard',plot:'60x80',loc:'south',floors:'g1',cons:'advise',tier:'luxury',park:'cov',extras:['pool','garden','solar'],timeline:'t3',budget:'b3',name:'Test Person',phone:'+91 90000 00000'})")
    pg.evaluate('window.__bnbConsult.go(1)'); pg.evaluate('window.__bnbConsult.thumbs()'); pg.wait_for_timeout(1000)
    pg.evaluate('window.__bnbConsult.go(12)'); pg.wait_for_timeout(2500); pg.evaluate('window.__bnbConsult.settle()'); pg.wait_for_timeout(2500)
    pg.screenshot(path=O+'d-summary.png')
    print('perf high villa-courtyard:',pg.evaluate('window.__bnbConsult.perf()'))
    wa=pg.evaluate("document.querySelector('.cx-wa').href"); print('WA:', (wa or '')[:400])
    print('design row:', pg.evaluate("[...document.querySelectorAll('.cx-sum dt, .cx-sum th, .cx-row b, dt')].map(e=>e.textContent).join('|')")[:300])
    add={u:n for u,n in R.items() if u not in R0}
    tot=sum(add.values()); print('CONFIGURATOR PAYLOAD bytes', tot, '=%.2f MB'%(tot/1048576))
    for u,n in sorted(add.items(), key=lambda x:-x[1])[:40]: print('   %8d %s'%(n,u.replace('http://localhost:8811/','')))
    print('errors:',E); ctx.close()
    # 2) tower highrise perf
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page()
    pg.goto('http://localhost:8811/consult.html?q=high'); pg.wait_for_function('window.__bnbConsult'); pg.evaluate('window.__bnbConsult.ready()')
    pg.evaluate("window.__bnbConsult.set({type:'apartment',variant:'tower',plot:'acre',floors:'hr',tier:'luxury',park:'base',extras:['pool','garden','lift','wall']})"); pg.evaluate('window.__bnbConsult.go(9)'); pg.wait_for_timeout(2500); pg.evaluate('window.__bnbConsult.settle()'); pg.wait_for_timeout(500)
    print('perf high tower hr:',pg.evaluate('window.__bnbConsult.perf()')); ctx.close()
    # 3) low tier screenshot
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page(); E=[]
    pg.on('pageerror',lambda e:E.append('PAGEERR '+str(e)))
    pg.goto('http://localhost:8811/consult.html?q=low'); pg.wait_for_function('window.__bnbConsult'); pg.evaluate('window.__bnbConsult.ready()')
    pg.evaluate("window.__bnbConsult.set({type:'row',variant:'staggered',plot:'60x80',floors:'g2',tier:'premium',light:'day'})"); pg.evaluate("window.__bnbConsult.light('day')"); pg.evaluate('window.__bnbConsult.go(5)'); pg.wait_for_timeout(2500); pg.evaluate('window.__bnbConsult.settle()'); pg.wait_for_timeout(1500)
    pg.locator('.cx-stage').screenshot(path=O+'d-row-staggered-day-LOW.png'); print('low stats', pg.evaluate('window.__bnbConsult.stats()'), E); ctx.close()
    # 4) adaptive (no ?q) — SwiftShader is slow, so it should step down
    ctx=b.new_context(viewport={'width':1440,'height':900}); pg=ctx.new_page()
    pg.goto('http://localhost:8811/consult.html'); pg.wait_for_function('window.__bnbConsult'); pg.evaluate('window.__bnbConsult.ready()')
    pg.evaluate("window.__bnbConsult.set({type:'villa',variant:'cantilever'})")
    for t in range(6): pg.wait_for_timeout(4000); print('adaptive t=%ds'%((t+1)*4), pg.evaluate('window.__bnbConsult.stats().q'))
    ctx.close(); b.close()
