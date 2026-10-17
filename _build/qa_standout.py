import re,os,glob,sys,html as H
from urllib.parse import urlparse,unquote
from playwright.sync_api import sync_playwright
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B="http://localhost:8811/"; O="/workspace/bnb-shots/standout/"
os.makedirs(O,exist_ok=True)
# --- static link/asset check
pages=sorted(os.path.basename(f) for f in glob.glob(R+"/*.html"))
ids={p:set(re.findall(r'\bid="([^"]+)"',open(R+"/"+p).read())) for p in pages}
bad=[]
for p in pages:
    s=open(R+"/"+p).read()
    for attr,u in re.findall(r'\b(href|src)="([^"]*)"',s):
        u=H.unescape(u)
        if not u or u.startswith(("http","mailto:","tel:","data:","//")): continue
        path,_,frag=u.partition("#")
        tgt=path or p
        if not os.path.exists(R+"/"+unquote(tgt)): bad.append((p,u,"missing")); continue
        if frag and tgt.endswith(".html") and frag not in ids.get(tgt,set()): bad.append((p,u,"no anchor"))
    for u in re.findall(r'url\(([^)]+)\)',s): pass
print("static link problems:",bad)
only=sys.argv[1:] or [p[:-5] for p in pages]
with sync_playwright() as pw:
    br=pw.chromium.launch(executable_path="/usr/bin/google-chrome")
    for name,vp,mob in [("desktop",{"width":1440,"height":900},False),("mobile",{"width":390,"height":844},True)]:
        ctx=br.new_context(viewport=vp,is_mobile=mob,has_touch=mob,device_scale_factor=1)
        pg=ctx.new_page(); errs=[]; badr=[]
        pg.on("pageerror",lambda e: errs.append(str(e)))
        pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None)
        pg.on("response",lambda r: badr.append(f"{r.status} {r.url}") if r.status>=400 and "localhost" in r.url else None)
        for f in only:
            errs.clear(); badr.clear()
            pg.goto(B+f+".html",wait_until="networkidle"); pg.wait_for_timeout(300)
            h=pg.evaluate("document.body.scrollHeight")
            for y in range(0,h,500): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(70)
            pg.wait_for_timeout(2000)
            ow=pg.evaluate("[document.documentElement.scrollWidth, [...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&getComputedStyle(e).position!=='fixed'&&!e.closest('.marquee,.subnav,.builders,.tl-f,.ba,.hero-media,.cx')}).slice(0,6).map(e=>e.tagName+'.'+e.className)]")
            broken=pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.getAttribute('src')).map(i=>i.src)")
            pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(400)
            pg.screenshot(path=f"{O}{f}-{name}.png",full_page=True)
            print(name,f,"scrollW",ow,"errs",errs,"bad",badr,"broken",broken,flush=True)
        ctx.close()
    br.close()
