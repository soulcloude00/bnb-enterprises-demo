"""Generate the SAMPLE company-profile PDF (4 pages, A4) with headless Chrome.
Run: python3 _build/profile.py  (needs network for Google Fonts). Output: assets/docs/bnb-company-profile-SAMPLE.pdf + assets/img/profile-cover.png"""
import os, pathlib, subprocess
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
import tempfile
from PIL import Image, ImageEnhance
_T=pathlib.Path(tempfile.mkdtemp())
for _n in ["hero-towers.jpg","stock-worker.jpg","mvn-tower-night.jpg","ell-phase1.jpg","epr-garden.jpg"]:
    _im=Image.open(ROOT/"assets/img"/_n).convert("RGB"); _im.thumbnail((1100,1100))
    if _n=="hero-towers.jpg": _im=ImageEnhance.Brightness(ImageEnhance.Color(_im).enhance(.45)).enhance(.45)
    if _n=="stock-worker.jpg": _im=ImageEnhance.Color(_im).enhance(.7)
    _im.save(_T/_n,quality=72,optimize=True)
IMG=_T.as_uri()+"/"
OUT=ROOT/"assets/docs/bnb-company-profile-SAMPLE.pdf"
SD='<span class="sd">Sample data</span>'
CSS="""
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:Manrope,sans-serif;color:#f4efe6;background:#0a0a0b;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always;padding:20mm 18mm 18mm;background:#0e1218}
.pg.iv{background:#f4efe6;color:#0a0a0b}
h1,h2,h3{font-family:'Cormorant Garamond',serif;font-weight:300;margin:0;line-height:1.05}
em{color:#e6cc98;font-style:italic}.iv em{color:#8f7444}
.ey{font-size:8pt;letter-spacing:.32em;text-transform:uppercase;color:#c9a96e;font-weight:700;margin:0 0 4mm}
.iv .ey{color:#8f7444}
p{font-size:9.5pt;line-height:1.6;color:#a7a196;margin:0 0 3mm}.iv p{color:#5d574e}
.wm{position:absolute;left:50%;top:52%;transform:translate(-50%,-50%) rotate(-30deg);font-family:'Cormorant Garamond',serif;font-size:150pt;letter-spacing:.12em;color:rgba(201,169,110,.08);font-weight:600;pointer-events:none;white-space:nowrap}
.iv .wm{color:rgba(143,116,68,.09)}
.strip{position:absolute;left:0;right:0;top:0;background:#c9a96e;color:#0a0a0b;font-size:7pt;letter-spacing:.22em;text-transform:uppercase;font-weight:700;text-align:center;padding:2.2mm}
.foot{position:absolute;left:18mm;right:18mm;bottom:10mm;display:flex;justify-content:space-between;font-size:7pt;letter-spacing:.14em;text-transform:uppercase;color:#6f6a62;border-top:.3mm solid rgba(201,169,110,.3);padding-top:3mm}
.sd{display:inline-block;font-size:6pt;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#e6cc98;border:.25mm solid rgba(201,169,110,.5);background:rgba(201,169,110,.12);border-radius:10mm;padding:.6mm 2.2mm;vertical-align:middle;font-style:normal}
.iv .sd{color:#7a5d2c;border-color:rgba(143,116,68,.5);background:rgba(143,116,68,.1)}
.mono{font-family:'Cormorant Garamond',serif;font-size:30pt;font-weight:500}.mono i{color:#c9a96e;font-style:normal}
.cover{padding:0}
.cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cover .sh{position:absolute;inset:0;background-image:linear-gradient(180deg,rgba(10,10,11,.6),rgba(10,10,11,.2) 40%,rgba(10,10,11,.95))}
.cover .fr{position:absolute;inset:9mm;border:.3mm solid rgba(201,169,110,.4)}
.cover .in{position:absolute;left:20mm;right:20mm;bottom:28mm}
.cover h1{font-size:52pt;margin:6mm 0}
.cover .brand{position:absolute;left:20mm;top:22mm;display:flex;align-items:center;gap:5mm}
.cover .brand b{font-size:8pt;letter-spacing:.42em;text-transform:uppercase;border-left:.3mm solid rgba(201,169,110,.5);padding-left:4mm;font-weight:600;line-height:1.6}
.cover .samp{position:absolute;right:20mm;top:22mm;border:.4mm solid #c9a96e;color:#e6cc98;font-size:8pt;letter-spacing:.3em;font-weight:700;padding:2mm 4mm}
.grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:.3mm solid rgba(201,169,110,.3);border-bottom:.3mm solid rgba(201,169,110,.3);margin:8mm 0}
.grid div{padding:6mm 3mm;text-align:center;border-right:.3mm solid rgba(201,169,110,.2)}.grid div:last-child{border:0}
.grid b{display:block;font-family:'Cormorant Garamond',serif;font-weight:300;font-size:30pt;line-height:1;color:#f4efe6}.iv .grid b{color:#0a0a0b}
.grid small{display:block;font-size:6.5pt;letter-spacing:.2em;text-transform:uppercase;color:#c9a96e;margin:2mm 0 1.5mm}.iv .grid small{color:#8f7444}
.two{display:grid;grid-template-columns:1fr 1fr;gap:9mm}
.card{border:.3mm solid rgba(201,169,110,.3);padding:5mm}
.iv .card{border-color:rgba(10,10,11,.15)}
.card h3{font-size:17pt;margin-bottom:2mm}
ul{margin:0;padding:0;list-style:none}li{font-size:9pt;padding:1.6mm 0 1.6mm 5mm;position:relative;color:#a7a196;border-bottom:.2mm solid rgba(244,239,230,.08)}
.iv li{color:#5d574e;border-color:rgba(10,10,11,.08)}
li::before{content:"";position:absolute;left:0;top:3.6mm;width:2.6mm;height:.3mm;background:#c9a96e}
.ph{width:100%;height:58mm;object-fit:cover;display:block;margin-bottom:2mm}
.cap{font-size:6.5pt;color:#6f6a62}
.bars div{display:grid;grid-template-columns:38mm 1fr;align-items:center;gap:3mm;margin:2.5mm 0;font-size:8pt;color:#f4efe6}
.bars span{display:block;height:6mm;}
.bars span+span{background:linear-gradient(90deg,#8f7444,#e6cc98)}
.bars .c span{background:repeating-linear-gradient(135deg,rgba(244,239,230,.2) 0 1.5mm,rgba(244,239,230,.07) 1.5mm 3mm)}
.builders{font-family:'Cormorant Garamond',serif;font-size:20pt;letter-spacing:.12em;text-transform:uppercase;color:#0a0a0b;display:flex;flex-wrap:wrap;gap:3mm 8mm;margin:4mm 0 8mm}
.proj{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
.proj img{width:100%;height:40mm;object-fit:cover}
.proj h3{font-size:15pt;margin:2.5mm 0 1mm;color:#0a0a0b}
.proj p{font-size:8pt;margin:0}
.ct{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin-top:6mm}
.ct div{border-top:.3mm solid rgba(10,10,11,.2);padding-top:3mm;font-size:8.5pt}
.ct small{display:block;font-size:6.5pt;letter-spacing:.22em;text-transform:uppercase;color:#8f7444;margin-bottom:1mm}
"""
def foot(n): return f'<div class="foot"><span>B&amp;B Enterprises · Company profile</span><span>SAMPLE — demo document</span><span>{n} / 4</span></div>'
STRIP='<div class="strip">Sample document · figures marked “Sample data” are illustrative examples, not B&amp;B records</div>'
HTML=f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
<section class="pg cover"><img src="{IMG}hero-towers.jpg"><div class="sh"></div><div class="fr"></div>
 <div class="brand"><span class="mono">B<i>&amp;</i>B</span><b>Enterprises<br><span style="color:#a7a196;letter-spacing:.3em;font-size:6.5pt">Real Estate Construction</span></b></div>
 <div class="samp">SAMPLE</div>
 <div class="in"><p class="ey">Company profile · 2026</p><h1>Built on experience.<br><em>Reaching higher.</em></h1>
 <p style="color:#e9e1d3;font-size:11pt;max-width:130mm">Burman and Burman Enterprises — a Bangalore family construction enterprise. Mivan and block construction for the city’s leading developers.</p>
 <p style="margin-top:8mm;font-size:7.5pt;letter-spacing:.14em;text-transform:uppercase;color:#c9a96e">Demo document — marked SAMPLE. Not for distribution.</p></div></section>

<section class="pg">{STRIP}<div class="wm">SAMPLE</div>
 <p class="ey" style="margin-top:6mm">About B&amp;B</p><h2 style="font-size:34pt">A family enterprise.<br><em>Looking ahead.</em></h2>
 <p style="margin-top:6mm;font-size:10.5pt;color:#e9e1d3;max-width:150mm">Founded and led by Prakash Burman, B&amp;B Enterprises has spent 20+ years building the structures Bangalore’s developers put their names on — high-rise towers, villa communities and residential homes.</p>
 <div class="grid"><div><b>20+</b><small>Years</small></div><div><b>50+</b><small>Projects</small></div><div><b>5,000+</b><small>Workforce</small></div><div><b>2</b><small>Construction systems</small></div></div>
 <div class="two">
  <div class="card"><p class="ey">Core service i.</p><h3>Mivan construction</h3><p>Aluminium-formwork construction: walls and slabs cast together in a fast, repeating floor cycle with a true, smooth finish.</p></div>
  <div class="card"><p class="ey">Core service ii.</p><h3>Block construction</h3><p>Block masonry by skilled, supervised crews — the dependable method for villas and low- to mid-rise homes.</p></div>
 </div>
 <p class="ey" style="margin-top:10mm">Mivan speed {SD}</p>
 <div class="grid" style="margin-top:2mm"><div><b>7</b><small>Day floor cycle</small></div><div><b>96%</b><small>Towers on time</small></div><div><b>4.2M</b><small>Sq ft delivered</small></div><div><b>28</b><small>Towers in Mivan</small></div></div>
 <div class="bars"><div><span style="color:#a7a196;height:auto">Mivan · 7 days / floor</span><span style="width:33%"></span></div><div class="c"><span style="color:#a7a196;height:auto">Conventional · 21 days / floor</span><span style="width:100%"></span></div></div>
 <p style="font-size:7.5pt;color:#6f6a62">Indicative comparison: ~7 days vs ~21 days per floor. Illustrative only.</p>
 {foot(2)}</section>

<section class="pg">{STRIP}<div class="wm">SAMPLE</div>
 <p class="ey" style="margin-top:6mm">Safety · people · capacity</p><h2 style="font-size:32pt">Everyone goes <em>home</em>.</h2>
 <div class="grid"><div><b>595</b><small>Accident-free days</small><span class="sd">Sample</span></div><div><b>48,000</b><small>Training hours</small><span class="sd">Sample</span></div><div><b>1,800</b><small>Camp beds</small><span class="sd">Sample</span></div><div><b>100%</b><small>ESI &amp; PF</small><span class="sd">Sample</span></div></div>
 <div class="two">
  <div><img class="ph" src="{IMG}stock-worker.jpg"><p class="cap">Illustrative stock photo — Saad Akhtar, CC BY 2.0</p>
   <ul><li>PPE for every person, every shift</li><li>Daily toolbox talks &amp; permit-to-work</li><li>Edge protection and safety nets on every Mivan floor</li><li>Trained first-aiders on every site</li></ul></div>
  <div><p class="ey">Equipment &amp; capacity {SD}</p>
   <ul><li><b style="color:#f4efe6">14</b> Mivan formwork sets, owned</li><li><b style="color:#f4efe6">9</b> tower cranes</li><li><b style="color:#f4efe6">12</b> concurrent projects</li><li><b style="color:#f4efe6">G+32</b> tallest Mivan structure</li><li><b style="color:#f4efe6">6</b> concrete pumps · <b style="color:#f4efe6">18</b> hoists</li></ul>
   <p class="ey" style="margin-top:7mm">Quality gates</p>
   <ul><li>Material testing — every batch</li><li>Cube tests at 7 &amp; 28 days — every pour</li><li>Stage inspections — every floor</li><li>Snag list — every flat</li><li>Handover checklist — every tower</li></ul>
   <p style="margin-top:4mm;font-size:8pt">28-day cube pass rate <b style="color:#f4efe6">99.6%</b> {SD}</p></div>
 </div>
 {foot(3)}</section>

<section class="pg iv">{STRIP.replace('class="strip"','class="strip"')}<div class="wm">SAMPLE</div>
 <p class="ey" style="margin-top:6mm">Track record</p><h2 style="font-size:32pt">Built for Bangalore’s <em>leading developers</em></h2>
 <div class="builders"><span>Keya</span><span>Adarsh</span><span>Brigade</span><span>Sumadhura</span><span>MVN</span></div>
 <div class="proj">
  <div><img src="{IMG}mvn-tower-night.jpg"><h3>MVN Aero One</h3><p>Devanahalli · MVN</p><p class="cap">Image: mvnaeroone.com</p></div>
  <div><img src="{IMG}ell-phase1.jpg"><h3>Ellegenza</h3><p>Sarjapur Road · Nambiar Builders</p><p class="cap">Image: nambiarbuilders.com</p></div>
  <div><img src="{IMG}epr-garden.jpg"><h3>Ramsons East Park Residences</h3><p>Sarjapur Road · Ramsons</p><p class="cap">Image: ramsonstrendsquares.com</p></div>
 </div>
 <div class="card" style="margin-top:9mm"><p class="ey">From a builder partner <span class="sd">Sample testimonial — not a real quote</span></p>
  <p style="font-family:'Cormorant Garamond',serif;font-size:15pt;font-style:italic;color:#2b2823;line-height:1.4">“The floor cycle never slipped once the formwork was on site. Their supervisors knew every pour before it happened.”</p>
  <p style="font-size:7.5pt;letter-spacing:.18em;text-transform:uppercase">Project Head, Brigade (sample)</p></div>
 <p class="ey" style="margin-top:9mm">Request a consultation</p>
 <div class="ct"><div><small>WhatsApp</small>+91 00000 00000 <span class="sd">Placeholder</span></div><div><small>Email</small>To be added <span class="sd">Placeholder</span></div><div><small>Office</small>Bangalore <span class="sd">Placeholder</span></div></div>
 <div class="foot" style="color:#6f6a62"><span>B&amp;B Enterprises · Company profile</span><span>SAMPLE — demo document</span><span>4 / 4</span></div></section>
</body></html>"""
src=ROOT/"_build/profile.html"; src.write_text(HTML)
OUT.parent.mkdir(exist_ok=True)
with sync_playwright() as p:
    br=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=br.new_page(); pg.goto(src.as_uri(),wait_until="networkidle"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
    pg.pdf(path=str(OUT),format="A4",print_background=True,prefer_css_page_size=True)
    br.close()
src.unlink()
import shutil
if shutil.which("gs"):
    tmp=str(OUT)+".tmp.pdf"; subprocess.run(["gs","-q","-sDEVICE=pdfwrite","-dPDFSETTINGS=/ebook","-dCompatibilityLevel=1.6","-dNOPAUSE","-dBATCH","-sOutputFile="+tmp,str(OUT)],check=True); os.replace(tmp,OUT)
subprocess.run(["pdftoppm","-png","-r","70","-f","1","-l","1","-singlefile",str(OUT),str(ROOT/"assets/img/profile-cover")],check=True)
print("pdf",OUT,OUT.stat().st_size)
