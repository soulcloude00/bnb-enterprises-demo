import sys
from playwright.sync_api import sync_playwright
B="http://localhost:8811/"
pages=["index","projects","project-mvn-aero-one","project-ellegenza","project-east-park-residences","services","about","contact","404"]
O="/workspace/bnb-shots/"
with sync_playwright() as p:
    br=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    for name,vp,mob in [("desktop",{"width":1440,"height":900},False),("mobile",{"width":390,"height":844},True)]:
        ctx=br.new_context(viewport=vp,is_mobile=mob,has_touch=mob,device_scale_factor=1)
        pg=ctx.new_page(); errs=[]; bad=[]
        pg.on("pageerror",lambda e: errs.append(str(e)))
        pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        pg.on("response",lambda r: bad.append(f"{r.status} {r.url}") if r.status>=400 and "localhost" in r.url and "404.html" not in pg.url else None)
        for f in pages:
            errs.clear(); bad.clear()
            pg.goto(B+f+".html",wait_until="networkidle"); pg.wait_for_timeout(500)
            # scroll to trigger lazy+reveals
            h=pg.evaluate("document.body.scrollHeight")
            for y in range(0,h,600): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(60)
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(300)
            pg.evaluate("document.querySelectorAll('.rv,.rv-img').forEach(e=>e.classList.add('in'));document.querySelectorAll('[data-count]').forEach(e=>e.textContent=Number(e.dataset.count).toLocaleString('en-IN'))")
            pg.wait_for_timeout(1700)
            ow=pg.evaluate("document.documentElement.scrollWidth")
            pg.screenshot(path=f"{O}{f}-{name}.png",full_page=True)
            pg.screenshot(path=f"{O}{f}-{name}-fold.png")
            broken=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.getAttribute('src')).map(i=>i.src)")
            print(name,f,"scrollW",ow,"errs",errs,"bad",bad,"broken",broken,flush=True)
