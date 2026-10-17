import json
from playwright.sync_api import sync_playwright
B="http://localhost:8811/"; O="/workspace/bnb-shots/v2/x-"
ARGS=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"]
VAR={
 "v-classic-villa":dict(type="villa",variant="palladian",plot="60x80",floors="g1",style="classic",tier="premium",park="cov",extras=["garden","solar","wall"]),
 "v-indian-villa":dict(type="villa",variant="courtyard",plot="30x40",floors="g2",style="indian",tier="standard",park="none",extras=["terrace","rwh","pool"]),
 "v-row-tropical":dict(type="row",variant="sawtooth",plot="60x80",floors="g1",style="tropical",tier="premium",park="cov",extras=["garden","solar"]),
 "v-commercial":dict(type="commercial",variant="podium",plot="60x80",floors="g3",style="glass",tier="luxury",park="base",extras=["pool","solar"]),
 "v-highrise":dict(type="apartment",variant="terraced",plot="acre",floors="hr",style="modern",tier="luxury",park="base",extras=["pool","garden","lift","wall"]),
 "v-unsure":dict(type="unsure",plot="40x60",floors="g2",tier="standard",park="none",extras=[]),
}
def errs_of(pg):
    e=[]; pg.on("pageerror",lambda x: e.append("PAGEERR "+str(x))); pg.on("console",lambda m: e.append(m.type+": "+m.text) if m.type in ("error","warning") else None); return e
with sync_playwright() as p:
    br=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=ARGS)
    ctx=br.new_context(viewport={"width":1280,"height":800},accept_downloads=True); pg=ctx.new_page(); E=errs_of(pg)
    pg.goto(B+"consult.html"); pg.evaluate("sessionStorage.clear()"); pg.reload(); pg.wait_for_function("window.__bnbConsult"); pg.evaluate("window.__bnbConsult.ready()")
    for n,c in VAR.items():
        c=dict(c); c.setdefault("loc","south"); c.setdefault("cons","advise")
        pg.evaluate("window.__bnbConsult.set({extras:[],style:null,park:null,floors:null})")
        pg.evaluate(f"window.__bnbConsult.set({json.dumps(c)})"); pg.evaluate("window.__bnbConsult.go(9)")
        pg.wait_for_timeout(2500); pg.evaluate("window.__bnbConsult.settle()"); pg.wait_for_timeout(500)
        pg.screenshot(path=f"{O}{n}.png"); print(n, pg.evaluate("window.__bnbConsult.stats()"), flush=True)
    # download brief
    pg.evaluate("window.__bnbConsult.set({timeline:'t3',budget:'b3',name:'Test Person',phone:'+91 90000 00000'})"); pg.evaluate("window.__bnbConsult.go(12)"); pg.wait_for_timeout(2500); pg.evaluate("window.__bnbConsult.settle()"); pg.wait_for_timeout(400)
    with pg.expect_download() as d: pg.click("[data-act=download]")
    d.value.save_as(O+"brief-download.png"); print("download", d.value.suggested_filename)
    print("errors(variants):",E); ctx.close()

    # open from homepage + history + keyboard
    ctx=br.new_context(viewport={"width":1280,"height":800}); pg=ctx.new_page(); E=errs_of(pg)
    pg.goto(B+"index.html",wait_until="networkidle"); pg.evaluate("sessionStorage.clear()")
    pg.click(".hdr .nav .btn"); pg.wait_for_selector(".cx.open"); pg.wait_for_timeout(1500)
    print("url after open:",pg.url, "title:",pg.title())
    print("focused:",pg.evaluate("document.activeElement.id||document.activeElement.className"))
    pg.keyboard.press("Tab"); print("tab1:",pg.evaluate("document.activeElement.className||document.activeElement.tagName"))
    pg.keyboard.press("Enter"); pg.wait_for_timeout(400); print("after Enter on begin -> step", pg.evaluate("window.__bnbConsult.state().step"))
    pg.keyboard.press("Tab"); print("tab->", pg.evaluate("document.activeElement.name+'='+document.activeElement.value"))
    pg.keyboard.press("ArrowDown"); pg.wait_for_timeout(200); print("arrow sel:", pg.evaluate("window.__bnbConsult.state().S.type"))
    pg.keyboard.press("Enter"); pg.wait_for_timeout(400); print("enter->step", pg.evaluate("window.__bnbConsult.state().step"))
    pg.keyboard.press("Enter") if False else None
    # Next without selecting -> error
    pg.click(".cx-next",force=True); pg.wait_for_timeout(200); print("err shown:", pg.evaluate("document.querySelector('.cx-err').className"), pg.inner_text(".cx-err"))
    # tab cycle trap
    for i in range(30): pg.keyboard.press("Tab")
    print("still inside overlay:", pg.evaluate("!!document.activeElement.closest('.cx')"))
    pg.keyboard.press("Escape"); pg.wait_for_timeout(700)
    print("after Esc url:",pg.url,"open:",pg.evaluate("!!document.querySelector('.cx.open')"),"title:",pg.title())
    pg.click(".cta .btn[data-consult]"); pg.wait_for_selector(".cx.open"); print("cta reopen url",pg.url, "step", pg.evaluate("window.__bnbConsult.state().step"))
    pg.go_back(); pg.wait_for_timeout(600); print("browser back closes:", not pg.evaluate("!!document.querySelector('.cx.open')"), pg.url)
    print("errors(home):",E); ctx.close()

    # mobile menu link
    ctx=br.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True); pg=ctx.new_page(); E=errs_of(pg)
    pg.goto(B+"services.html",wait_until="networkidle"); pg.click(".burger"); pg.wait_for_timeout(500); pg.click(".mnav a[data-consult]"); pg.wait_for_selector(".cx.open"); pg.wait_for_timeout(1500)
    print("mobile menu ->", pg.url, "menu closed:", not pg.evaluate("document.body.classList.contains('menu-open')"))
    pg.screenshot(path=O+"mobile-0-start.png"); print("errors(mobile):",E); ctx.close()

    # reduced motion
    ctx=br.new_context(viewport={"width":1280,"height":800},reduced_motion="reduce"); pg=ctx.new_page(); E=errs_of(pg)
    pg.goto(B+"consult.html"); pg.wait_for_function("window.__bnbConsult"); pg.evaluate("window.__bnbConsult.ready()")
    pg.evaluate("window.__bnbConsult.set({type:'villa',plot:'40x60',floors:'g2'})"); pg.wait_for_timeout(120)
    pg.screenshot(path=O+"reduced-motion-120ms.png"); print("errors(reduced):",E); ctx.close()
    br.close()

    # no WebGL
    br=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--disable-3d-apis","--disable-webgl","--disable-gpu"])
    ctx=br.new_context(viewport={"width":1280,"height":800}); pg=ctx.new_page(); E=errs_of(pg)
    pg.goto(B+"consult.html"); pg.wait_for_function("window.__bnbConsult"); pg.evaluate("window.__bnbConsult.ready()"); pg.wait_for_timeout(500)
    print("fallback visible:", pg.evaluate("!document.querySelector('.cx-fallback').hidden"))
    pg.evaluate("window.__bnbConsult.set({type:'villa',timeline:'t3',budget:'b3',name:'A',phone:'+91 90000 00000'})"); pg.evaluate("window.__bnbConsult.go(12)"); pg.wait_for_timeout(500)
    pg.screenshot(path=O+"no-webgl-summary.png")
    pg.evaluate("window.__bnbConsult.set({type:'farm'})"); pg.evaluate("window.__bnbConsult.go(1)"); pg.wait_for_timeout(500)
    print("nowebgl svg thumbs:", pg.evaluate("document.querySelectorAll('.cx-thumb svg').length"), "light toggle hidden:", pg.evaluate("getComputedStyle(document.querySelector('.cx-light')).display"))
    pg.screenshot(path=O+"no-webgl-variants.png"); print("errors(nowebgl):",E); br.close()
