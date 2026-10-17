import sys, json, time
from playwright.sync_api import sync_playwright
B="http://localhost:8811/"
O="/workspace/bnb-shots/consult/"
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
CONFIGS={
 "villa":dict(type="villa",plot="40x60",loc="east",floors="g2",cons="block",tier="luxury",style="modern",park="cov",extras=["pool","garden","solar","lift","wall"],timeline="t6",budget="b3",name="Ananya Rao",phone="+91 98450 00000",email="ananya@example.com",time="evening"),
 "apartment":dict(type="apartment",plot="60x80",loc="central",floors="g3",cons="mivan",tier="premium",style="glass",park="three",extras=["terrace","solar","rwh","wall"],timeline="t3",budget="b10",name="Rahul Menon",phone="+91 99000 00000",email="",time="morning"),
 "farm":dict(type="farm",plot="acre",loc="outside",floors="g1",cons="advise",tier="premium",style="tropical",park="base",extras=["pool","garden","servant","rwh","wall","theatre"],timeline="t12",budget="bx",name="Kavya",phone="+91 90000 00000",email="kavya@example.com",time="any"),
}
order=["type","plot","loc","floors","cons","tier","style","park","extras","plan","contact"]
only=sys.argv[1:] 
with sync_playwright() as p:
    br=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=ARGS)
    for dev,vp,mob in [("desktop",{"width":1440,"height":900},False),("mobile",{"width":390,"height":844},True)]:
        for name,cfg in CONFIGS.items():
            if only and name not in only: continue
            ctx=br.new_context(viewport=vp,is_mobile=mob,has_touch=mob,device_scale_factor=2 if mob else 1)
            pg=ctx.new_page(); errs=[]
            pg.on("pageerror",lambda e: errs.append("PAGEERR "+str(e)))
            pg.on("console",lambda m: errs.append(m.type+": "+m.text) if m.type in("error","warning") else None)
            pg.goto(B+"consult.html",wait_until="networkidle")
            pg.evaluate("sessionStorage.clear()"); pg.reload(wait_until="networkidle")
            pg.wait_for_function("window.__bnbConsult && document.querySelector('.cx.open')")
            pg.evaluate("window.__bnbConsult.ready()"); pg.wait_for_timeout(1800)
            if name=="villa": pg.screenshot(path=f"{O}{dev}-0-start.png")
            # mid flow: answer up to style step (index 6) by clicking real UI on first steps
            pg.click("[data-act=begin]"); pg.wait_for_timeout(300)
            pg.click(f"input[name=type][value={cfg['type']}] + .cx-card"); pg.wait_for_timeout(200)
            pg.click(".cx-next"); pg.wait_for_timeout(200)
            pg.click(f"input[name=plot][value='{cfg['plot']}'] + .cx-card"); pg.click(".cx-next")
            part={k:cfg[k] for k in ["loc","floors","cons","tier"]}
            pg.evaluate(f"window.__bnbConsult.set({json.dumps(part)})"); pg.evaluate("window.__bnbConsult.go(4)")
            pg.wait_for_timeout(2600); pg.evaluate("window.__bnbConsult.settle()"); pg.wait_for_timeout(500)
            pg.screenshot(path=f"{O}{dev}-{name}-1-construction.png")
            pg.evaluate(f"window.__bnbConsult.set({json.dumps({'style':cfg['style'],'park':cfg['park']})})"); pg.evaluate("window.__bnbConsult.go(6)")
            pg.wait_for_timeout(2600); pg.evaluate("window.__bnbConsult.settle()"); pg.wait_for_timeout(500)
            pg.screenshot(path=f"{O}{dev}-{name}-2-style.png")
            pg.evaluate(f"window.__bnbConsult.set({json.dumps({'extras':cfg['extras']})})"); pg.evaluate("window.__bnbConsult.go(8)")
            pg.wait_for_timeout(2600); pg.evaluate("window.__bnbConsult.settle()"); pg.wait_for_timeout(500)
            pg.screenshot(path=f"{O}{dev}-{name}-3-extras.png")
            rest={k:cfg[k] for k in ["timeline","budget","name","phone","email","time"]}
            pg.evaluate(f"window.__bnbConsult.set({json.dumps(rest)})"); pg.evaluate("window.__bnbConsult.go(10)"); pg.wait_for_timeout(300)
            pg.click(".cx-next"); pg.wait_for_timeout(2400); pg.evaluate("window.__bnbConsult.settle()"); pg.wait_for_timeout(600)
            pg.screenshot(path=f"{O}{dev}-{name}-4-summary.png")
            st=pg.evaluate("window.__bnbConsult.stats()")
            # fps sample (auto-rotate running)
            fps=pg.evaluate("new Promise(r=>{let n=0,t0=performance.now();function f(){n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/((performance.now()-t0)/1000));} requestAnimationFrame(f);})")
            wa=pg.get_attribute(".cx-wa","href")
            print(dev,name,"step",pg.evaluate("window.__bnbConsult.state().step"),"stats",st,"fps",round(fps,1),"wa",wa[:60],"errs",errs,flush=True)
            ctx.close()
    br.close()
