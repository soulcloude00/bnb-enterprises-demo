# "Standout" sections for B&B Enterprises demo — Track Record page + Home teasers.
# EVERY example figure / quote / photo here is SAMPLE data and carries a visible .sd chip.
IMG="assets/img/"
SD=lambda t="Sample data": f'<span class="sd">{t}</span>'
PH=lambda t="Placeholder": f'<span class="ph">{t}</span>'
WA_NUM="910000000000"          # PLACEHOLDER WhatsApp number — replace with B&B's real number (digits only)
WA_DISPLAY="+91 00000 00000"
PROFILE_PDF="assets/docs/bnb-company-profile-SAMPLE.pdf"
STOCK_CREDIT="Illustrative stock — not a B&amp;B site"

def ic(name):
    P={
    "helmet":'<path d="M8 32h32M10 32c0-9 6-16 14-16s14 7 14 16"/><path d="M20 16v-4h8v4M24 12v8"/><path d="M6 32h36v4H6z"/>',
    "talk":'<path d="M8 10h32v20H22l-8 7v-7H8z"/><path d="M15 18h18M15 23h12"/>',
    "net":'<path d="M6 8v32M42 8v32M6 14h36M6 22h36M6 30h36M12 14v24M18 14v24M24 14v24M30 14v24M36 14v24"/>',
    "scaffold":'<path d="M10 6v36M38 6v36M10 12h28M10 24h28M10 36h28M10 12l28 12M38 24 10 36"/>',
    "med":'<rect x="8" y="12" width="32" height="26" rx="2"/><path d="M18 12V8h12v4M24 18v14M17 25h14"/>',
    "permit":'<path d="M12 6h18l8 8v28H12z"/><path d="M30 6v8h8M17 24l4 4 9-9M17 34h14"/>',
    "home":'<path d="M6 22 24 8l18 14"/><path d="M10 19v21h28V19"/><path d="M20 40V28h8v12"/>',
    "cap":'<path d="M4 18 24 10l20 8-20 8z"/><path d="M12 22v9c3 3 7 4 12 4s9-1 12-4v-9M44 18v10"/>',
    "heart":'<path d="M24 40S8 30 8 18a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 12-16 22-16 22z"/>',
    "crane":'<path d="M14 42V8M8 42h14M14 8h28M14 8l-6 6h6M38 8v12M35 20h6v4h-6z"/><path d="M14 14l6-6M14 20l6-6M14 26l6-6"/>',
    "pump":'<path d="M6 34h22v-8l6-4h6l4 6v6h-4"/><circle cx="12" cy="36" r="3"/><circle cx="34" cy="36" r="3"/><path d="M28 22 14 8l-6 4"/>',
    "frame":'<rect x="8" y="6" width="32" height="36"/><path d="M8 18h32M8 30h32M20 6v36M28 6v36"/>',
    "lift":'<rect x="12" y="4" width="24" height="40"/><path d="M18 14l6-6 6 6M18 34l6 6 6-6M18 22h12v6H18z"/>',
    "sites":'<path d="M4 42h40"/><path d="M8 42V24h8v18M20 42V14h8v28M32 42V20h8v22"/><circle cx="24" cy="8" r="2"/>',
    "tower":'<path d="M14 42V6h20v36M10 42h28M19 12h3M26 12h3M19 18h3M26 18h3M19 24h3M26 24h3M19 30h3M26 30h3"/>',
    }
    return f'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true">{P[name]}</svg>'

# ---------- 1. LIVE PROJECT TRACKER (sample) ----------
SITES=[
 dict(name="Twin Residential Towers",where="Thanisandra, North Bangalore",sys="Mivan",scope="2 towers · G+28",pct=68,done=19,tot=28,unit="floors cast",upd="12 Oct 2026",status=("On schedule","ok"),
      photos=[("prog-s04.jpg","Jul"),("prog-s05.jpg","Aug"),("prog-s06.jpg","Sep"),("prog-s10.jpg","Oct")]),
 dict(name="Luxury Villa Community",where="Sarjapur Road, Bangalore East",sys="Block",scope="84 villas · G+2",pct=61,done=52,tot=84,unit="villa shells complete",upd="09 Oct 2026",status=("Ahead of plan","ahead"),
      photos=[("prog-s19.jpg","Jul"),("prog-s20.jpg","Aug"),("prog-s14.jpg","Sep"),("prog-s07.jpg","Oct")]),
 dict(name="High-rise Residential Tower",where="Whitefield, Bangalore East",sys="Mivan",scope="1 tower · G+18",pct=31,done=6,tot=18,unit="floors cast",upd="14 Oct 2026",status=("Early structure","early"),
      photos=[("prog-s00.jpg","Jul"),("prog-s01.jpg","Aug"),("prog-s02.jpg","Sep"),("prog-s11.jpg","Oct")]),
]
def site_card(s,compact=False):
    strip="" if compact else '<div class="trk-strip" role="list" aria-label="Monthly progress photos (illustrative stock)">'+"".join(
        f'<figure role="listitem"><img src="{IMG}{f}" alt="Illustrative construction progress photo — {m} 2026" loading="lazy"><figcaption>{m} \u201926</figcaption></figure>' for f,m in s["photos"]
    )+f'</div><p class="trk-cred">{SD("Illustrative photos")} Stock imagery — not this site. Photos: Biswarup Ganguly / Saad Akhtar / WTF Formwork, Wikimedia Commons (CC BY / BY-SA).</p>'
    return f'''<article class="trk rv">
  <header class="trk-h"><span class="badge b-{s["status"][1]}"><i></i>{s["status"][0]}</span>{SD()}</header>
  <h3>{s["name"]}</h3>
  <p class="trk-l">{s["where"]} · {s["sys"]} · {s["scope"]}</p>
  <div class="trk-p"><div class="trk-n"><span data-count="{s["pct"]}">{s["pct"]}</span><sup>%</sup><small>complete</small></div>
   <div class="trk-f"><b>{s["done"]}</b> / {s["tot"]}<small>{s["unit"]}</small></div></div>
  <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{s["pct"]}" aria-label="{s["name"]} progress (sample)"><span style="--p:{s["pct"]}%"></span>{"".join(f'<i style="left:{round(k/s["tot"]*100,2)}%"></i>' for k in range(1,s["tot"]) if s["tot"]<=30)}</div>
  <p class="trk-u">Last update · <time>{s["upd"]}</time></p>
  {strip}
 </article>'''

# ---------- 2. MIVAN SPEED ----------
def mivan_band(compact=False):
    tiles=[("7","","Day floor cycle","per floor, wall + slab"),("96","%","Towers on time","structure handed over to plan"),("4.2","M","Sq ft delivered","Mivan structure, cumulative"),("28","","Towers in Mivan","residential high-rises")]
    if compact: tiles=tiles[:2]
    t="".join(f'<div class="mv-t rv d{i}"><div class="n"><span data-count="{n}"{" data-dec=\"1\"" if "." in n else ""}>{n}</span><sup>{u}</sup></div><div class="lbl">{l}</div><p>{p}</p>{SD()}</div>' for i,(n,u,l,p) in enumerate(tiles))
    return f'<div class="mv-band">{t}</div>'
def mivan_chart():
    return f'''<figure class="mv-chart rv" aria-label="Sample comparison: structure cycle time per floor, Mivan versus conventional">
  <figcaption><span>Cycle time per floor</span>{SD("Sample comparison")}</figcaption>
  <div class="mv-row"><b>Mivan aluminium formwork</b><div class="mv-bar"><span style="--w:33%"></span><em>7 days</em></div></div>
  <div class="mv-row conv"><b>Conventional timber / ply formwork</b><div class="mv-bar"><span style="--w:100%"></span><em>21 days</em></div></div>
  <div class="mv-row"><b>G+24 tower · structure</b><div class="mv-bar"><span style="--w:35%"></span><em>~6 months</em></div></div>
  <div class="mv-row conv"><b>G+24 tower · conventional</b><div class="mv-bar"><span style="--w:100%"></span><em>~17 months</em></div></div>
  <p class="mv-note">Indicative, for illustration only. Actual cycle depends on floor plate, crew and design — B&amp;B&rsquo;s real numbers to be supplied.</p>
 </figure>'''

# ---------- 3. SAFETY ----------
def safety_counter(compact=False):
    return f'''<div class="sf-count rv">
  <div class="sf-ring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54"/><circle class="arc" cx="60" cy="60" r="54"/></svg><span class="sf-ic">{ic("helmet")}</span></div>
  <div><div class="n"><span data-since="2025-03-01" data-count="595">595</span></div><div class="lbl">Accident-free days</div>
  <p>Across all active sites, counted since 1 Mar 2025 {SD()}</p></div>
 </div>'''

PRACTICES=[("helmet","PPE, every person, every shift","Helmets, harnesses, safety shoes and high-visibility vests issued and checked at the gate."),
 ("talk","Daily toolbox talks","A ten-minute briefing before work: the day&rsquo;s hazards, the method, who to call."),
 ("net","Edge protection &amp; safety nets","Perimeter barricading, cantilever nets and covered shafts on every Mivan floor."),
 ("scaffold","Scaffold &amp; formwork inspection","Tagged inspections before use; Mivan panels and props checked each cycle."),
 ("permit","Permit-to-work","Written permits for hot work, work at height, lifting and electrical isolation."),
 ("med","First aid &amp; medical cover","Trained first-aiders on every site, tie-ups with nearby hospitals, on-call ambulance.")]

# ---------- 5. TESTIMONIALS (sample, unnamed roles) ----------
TESTI=[("Brigade","Project Head","The floor cycle never slipped once the formwork was on site. Their supervisors knew every pour before it happened."),
 ("Sumadhura","Construction Manager","What stood out was the discipline on safety — nets, permits, toolbox talks — even on the busiest weeks."),
 ("Keya","Director — Projects","They mobilised a full crew within a fortnight and handed over the structure with a snag list we could actually close."),
 ("Adarsh","Project Head","Consistent quality from the first floor to the last. The cube results and checklists came to us without asking."),
 ("MVN","Site Lead","A family business that behaves like a large contractor, and answers the phone like a small one.")]
def testi_cards(n=5):
    return "".join(f'''<figure class="quote sq rv{" d"+str(i%3) if i%3 else ""}"><blockquote>{q}</blockquote><cite>{r}, {b} <span>(sample)</span></cite><span class="sd">Sample testimonial — not a real quote</span></figure>''' for i,(b,r,q) in enumerate(TESTI[:n]))

# ---------- HOME TEASER ----------
def home_teaser():
    trk="".join(f'''<a class="ht-site" href="track-record.html#live-sites"><span class="badge b-{s["status"][1]}"><i></i>{s["status"][0]}</span><b>{s["name"]}</b><small>{s["where"]} · {s["done"]}/{s["tot"]} {s["unit"]}</small><div class="bar"><span style="--p:{s["pct"]}%"></span></div><em>{s["pct"]}%</em></a>''' for s in SITES[:2])
    return f'''<section class="sec night ht" aria-labelledby="ht-h">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Track record</p><h2 class="rv" id="ht-h">Proof, <em>floor by floor</em></h2></div><p class="rv d1">Live progress from our sites, the speed of our Mivan cycle and the safety record behind it. {SD("Sample data — illustrative")}</p></div>
  <div class="ht-grid">
   <div class="ht-card rv"><p class="ht-k">01 · Live project tracker {SD()}</p>{trk}<a class="link" href="track-record.html#live-sites">See all live sites <span aria-hidden="true">→</span></a></div>
   <div class="ht-card rv d1"><p class="ht-k">02 · Mivan speed {SD()}</p><div class="ht-big"><span data-count="7">7</span><small>day floor cycle</small></div>
    <div class="ht-mini"><div><span style="--w:33%"></span><b>Mivan · 7 days</b></div><div class="conv"><span style="--w:100%"></span><b>Conventional · 21 days</b></div></div>
    <ul class="ht-list"><li><b>96%</b> towers handed over on time</li></ul>
    <a class="link" href="track-record.html#mivan-speed">See the numbers <span aria-hidden="true">→</span></a></div>
   <div class="ht-card rv d2"><p class="ht-k">03 · Safety record {SD()}</p><div class="ht-big"><span data-since="2025-03-01" data-count="595">595</span><small>accident-free days</small></div>
    <ul class="ht-list"><li><b>48,000</b> training hours this year</li><li><b>1,200+</b> toolbox talks a year</li></ul>
    <a class="link" href="track-record.html#safety">Our safety record <span aria-hidden="true">→</span></a></div>
  </div>
  <div class="center" style="margin-top:56px"><a class="btn ghost rv" href="track-record.html">Explore the full track record <span class="arr"></span></a></div>
 </div>
</section>'''

def home_testimonials():
    return f'''<section class="sec">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">In their words</p><h2 class="rv">What our partners <em>say</em></h2></div><p class="rv d1">Shown to preview the layout. Real, approved quotes from developer partners will replace these before launch. {SD("Sample testimonials")}</p></div>
  <div class="testi">{testi_cards(3)}</div>
  <div class="center" style="margin-top:48px"><a class="link rv" href="track-record.html#testimonials">More from our builders <span aria-hidden="true">→</span></a></div>
 </div>
</section>'''

# ---------- TRACK RECORD PAGE ----------
SUBNAV=[("live-sites","Live sites"),("mivan-speed","Mivan speed"),("safety","Safety"),("time-lapse","Time-lapse"),("testimonials","Builders"),("workforce","Workforce"),("equipment","Equipment"),("quality","Quality"),("profile","Profile")]
TL=[("tl-01.jpg","Feb 2013","Site cleared, cranes up"),("tl-02.jpg","Jun 2013","Podium & first floors"),("tl-03.jpg","Nov 2013","Core rising"),("tl-04.jpg","Dec 2013","Mid-rise floors"),("tl-05.jpg","May 2014","Towers climbing"),("tl-06.jpg","Sep 2014","Upper floors"),("tl-07.jpg","Oct 2014","Near topping out"),("tl-08.jpg","Sep 2016","Structure complete")]
TL_CREDIT="Illustrative stock — Forum Atmosphere, Kolkata (not a B&amp;B project). Photos: Biswarup Ganguly, Wikimedia Commons, CC BY 3.0."

def track_page():
    sub="".join(f'<a href="#{a}">{t}</a>' for a,t in SUBNAV)
    sites="".join(site_card(s) for s in SITES)
    prac="".join(f'<li class="rv"><span class="pi">{ic(i)}</span><div><h4>{h}</h4><p>{p}</p></div></li>' for i,h,p in PRACTICES)
    tlframes="".join(f'<figure class="tl-f{" on" if k==0 else ""}" data-i="{k}"><img src="{IMG}{f}" alt="Illustrative time-lapse frame: tower construction, {d}" {"" if k==0 else "loading=\"lazy\""}><figcaption><b>{d}</b> {c}</figcaption></figure>' for k,(f,d,c) in enumerate(TL))
    tldots="".join(f'<button type="button" data-i="{k}" aria-label="Frame {k+1}: {d}"{" aria-current=\"true\"" if k==0 else ""}><span>{d}</span></button>' for k,(f,d,c) in enumerate(TL))
    equip=[("frame","14","Mivan formwork sets","owned, not hired — ready to mobilise"),("crane","9","Tower cranes","up to 10 t capacity, 60 m jib"),("sites","12","Concurrent projects","run in parallel at full supervision"),("tower","G+32","Tallest structure","handled in Mivan to date"),("pump","6","Concrete pumps","boom &amp; stationary"),("lift","18","Hoists","passenger &amp; material")]
    eq="".join(f'<div class="eq rv{" d"+str(i%3) if i%3 else ""}"><span class="eq-i">{ic(a)}</span>{SD()}<div class="eq-n">{n}</div><h4>{h}</h4><p>{p}</p></div>' for i,(a,n,h,p) in enumerate(equip))
    steps=[("Material testing","Cement, steel and aggregates accepted only against mill certificates and third-party lab results.","Every batch"),
           ("Cube tests","Concrete cubes cast from every pour and crushed at 7 and 28 days; results shared with the developer.","Every pour"),
           ("Stage inspections","Pre-pour sign-off for formwork alignment, reinforcement, cover blocks and MEP sleeves.","Every floor"),
           ("Snag list","Floor-by-floor walk-through; each snag logged with a photo, an owner and a close-out date.","Every flat"),
           ("Handover checklist","Structure handed over with test records, as-built notes and a closed snag register.","Every tower")]
    qs="".join(f'<li class="qs rv"><span class="qn">{i+1:02d}</span><div><h4>{h}</h4><p>{p}</p><small>{f}</small></div></li>' for i,(h,p,f) in enumerate(steps))
    chk=[(1,"Formwork panels aligned, plumb within ±3 mm"),(1,"Reinforcement as per drawing; cover blocks fixed"),(1,"MEP sleeves &amp; conduits placed and tied"),(1,"Pins, wedges &amp; props checked by formwork lead"),(1,"Cube moulds ready · slump test 100 ± 25 mm"),(0,"Structural engineer sign-off"),(0,"Developer QA sign-off")]
    ck="".join(f'<li class="{"y" if d else "n"}"><span class="cb" aria-hidden="true">{"✓" if d else ""}</span>{t}<span class="sr">{" — done" if d else " — pending"}</span></li>' for d,t in chk)
    return f'''
<section class="phero short">
 <div class="hero-media"><img src="{IMG}tl-07.jpg" alt="Illustrative: residential towers under construction beside a lake"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span>Track Record</div><p class="eyebrow">Why B&amp;B</p><h1>A track record you can <em>see</em></h1>
 <p class="sub">20+ years, 50+ projects and a 5,000+ workforce — shown the way developers judge a contractor: live progress, cycle speed, safety, people, equipment and quality.</p>
 <p class="hero-sd">{SD("Sample data")} Figures, quotes and photos on this page marked &ldquo;Sample&rdquo; are illustrative examples for the demo — to be replaced with B&amp;B&rsquo;s real records.</p></div>
 <span class="credit">{STOCK_CREDIT} · Photo: Biswarup Ganguly, CC BY 3.0</span>
</section>
<nav class="subnav" aria-label="On this page"><div class="wrap">{sub}</div></nav>

<section class="sec" id="live-sites">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">01 · Live project tracker</p><h2 class="rv">On site, <em>right now</em></h2></div><p class="rv d1">Every active B&amp;B site, updated monthly: progress, floors cast and a photo from each month. Shown here with sample sites. {SD("Sample sites")}</p></div>
  <div class="trk-grid">{sites}</div>
 </div>
</section>

<section class="sec night" id="mivan-speed">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">02 · Mivan speed</p><h2 class="rv">A floor every <em>seven days</em></h2></div><p class="rv d1">Aluminium formwork casts walls and slabs together in one repeating cycle — the reason Mivan towers rise in months, not years. {SD()}</p></div>
  {mivan_band()}
  <div class="mv-split">
   <div><h3 class="rv">Mivan vs <em>conventional</em></h3><p class="rv d1">With conventional formwork, every floor is shuttered, cast and de-shuttered piece by piece. Mivan panels move up as a complete set — so the cycle is predictable, the finish is true, and plastering is largely avoided.</p><a class="link rv d2" href="services.html#mivan">About Mivan construction <span aria-hidden="true">→</span></a></div>
   {mivan_chart()}
  </div>
 </div>
</section>

<section class="sec" id="safety">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">03 · Safety record</p><h2 class="rv">Everyone goes <em>home</em></h2></div><p class="rv d1">With 5,000+ people on our sites, safety is the first measure of how well we build.</p></div>
  <div class="sf-top">
   {safety_counter()}
   <div class="sf-stats">
    <div class="rv"><div class="n">48,000</div><div class="lbl">Safety training hours · FY 2025–26</div>{SD()}</div>
    <div class="rv d1"><div class="n">1,200+</div><div class="lbl">Toolbox talks a year</div>{SD()}</div>
    <div class="rv d2"><div class="n">99.2%</div><div class="lbl">PPE compliance at gate audits</div>{SD()}</div>
    <div class="rv d3"><div class="n">0.08</div><div class="lbl">Lost-time injury frequency rate</div>{SD()}</div>
   </div>
  </div>
  <ul class="practices">{prac}</ul>
  <div class="certs">
   <p class="eyebrow rv">Certifications</p>
   <div class="cert-row">
    <div class="cert rv"><span class="seal">ISO<br>45001</span><div><h4>Occupational health &amp; safety</h4>{PH("Certification to confirm")}</div></div>
    <div class="cert rv d1"><span class="seal">ISO<br>9001</span><div><h4>Quality management</h4>{PH("Certification to confirm")}</div></div>
    <div class="cert rv d2"><span class="seal">ISO<br>14001</span><div><h4>Environmental management</h4>{PH("Certification to confirm")}</div></div>
   </div>
   <p class="small" style="color:var(--mute-2);margin-top:18px">Certificate logos and numbers shown only once B&amp;B confirms them — do not publish placeholders.</p>
  </div>
 </div>
</section>

<section class="sec night" id="time-lapse">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">04 · Before / after &amp; time-lapse</p><h2 class="rv">Watch a tower <em>go up</em></h2></div><p class="rv d1">Drag the handle to compare the same skyline before and after the structure. B&amp;B&rsquo;s own site photography will replace this stock series. {SD("Illustrative photos")}</p></div>
  <div class="ba rv" style="--x:50%">
   <img src="{IMG}ba-after.jpg" alt="After: completed residential towers (illustrative stock)" loading="lazy">
   <div class="ba-b"><img src="{IMG}ba-before.jpg" alt="Before: towers at mid-rise (illustrative stock)" loading="lazy"></div>
   <span class="ba-l l">Before · Dec 2013</span><span class="ba-l r">After · Sep 2016</span>
   <div class="ba-h" aria-hidden="true"><i></i></div>
   <input type="range" min="0" max="100" value="50" aria-label="Before / after comparison — drag to reveal">
   <span class="sd ba-sd">Illustrative photos</span>
  </div>
  <p class="trk-cred">{TL_CREDIT}</p>
  <div class="tlapse rv" aria-roledescription="time-lapse" aria-label="Time-lapse image sequence (illustrative stock)">
   <div class="tl-stage">{tlframes}<span class="sd ba-sd">Illustrative photos</span>
    <button class="tl-play" type="button" aria-pressed="true" aria-label="Pause time-lapse"><span class="i-pause" aria-hidden="true"></span><span class="i-play" aria-hidden="true"></span></button></div>
   <div class="tl-track"><div class="tl-prog"><span></span></div><div class="tl-dots">{tldots}</div></div>
  </div>
  <div class="vidph rv"><div><span class="playc" aria-hidden="true"></span><h4>Drone time-lapse — 60 seconds</h4><p>Reserved for a real B&amp;B time-lapse video of a tower from foundation to terrace.</p>{PH("Video to be supplied")}</div></div>
 </div>
</section>

<section class="sec" id="testimonials">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">05 · Builder testimonials</p><h2 class="rv">From the builders <em>we build for</em></h2></div><p class="rv d1">Keya, Adarsh, Brigade, Sumadhura and MVN. The quotes below are written examples to preview the layout — each will be replaced with an approved quote from a named person. {SD("Sample testimonials")}</p></div>
  <div class="testi t5">{testi_cards()}</div>
 </div>
</section>

<section class="sec ivory on-ivory" id="workforce">
 <div class="wrap">
  <div class="grid2 wf-top">
   <div class="wf-img rv"><img src="{IMG}stock-worker.jpg" alt="Construction worker in a hard hat (illustrative stock)" loading="lazy"><span class="sd ba-sd">Illustrative photo</span><span class="credit">Illustrative · Photo: Saad Akhtar, CC BY 2.0</span></div>
   <div>
    <p class="eyebrow rv">06 · Workforce strength</p>
    <h2 class="rv">5,000+ people. <em>One standard of care.</em></h2>
    <p class="rv d1 wf-lead">Our workforce is our capacity — and our responsibility. How they live, learn and are looked after shows up in every floor they build.</p>
    <div class="wf-stats">
     <div class="rv"><div class="n">5,000+</div><div class="lbl">Workforce</div></div>
     <div class="rv d1"><div class="n">1,800</div><div class="lbl">Beds in 4 labour camps</div>{SD()}</div>
     <div class="rv d2"><div class="n">1,200</div><div class="lbl">Trained Mivan crew</div>{SD()}</div>
     <div class="rv d3"><div class="n">100%</div><div class="lbl">ESI &amp; PF enrolment</div>{SD()}</div>
    </div>
   </div>
  </div>
  <div class="wf-cols">
   <div class="wf rv"><span class="pi">{ic("home")}</span><h4>Housing</h4><ul><li>Purpose-built camps near each site, with ventilated rooms and RO drinking water</li><li>Separate family quarters and crèche at larger camps</li><li>Daily cleaning, pest control and weekly camp audits</li></ul>{SD()}</div>
   <div class="wf rv d1"><span class="pi">{ic("cap")}</span><h4>Training</h4><ul><li>5-day induction for every new worker — safety, site rules, first aid</li><li>Mivan fixer, bar-bending and shuttering skill programmes</li><li>11,500 skill-training hours last year</li></ul>{SD()}</div>
   <div class="wf rv d2"><span class="pi">{ic("heart")}</span><h4>Welfare</h4><ul><li>Hot meals from site canteens, three times a day</li><li>Quarterly health camps; insurance cover for every worker</li><li>Wages on time, paid directly to bank accounts</li></ul>{SD()}</div>
  </div>
 </div>
</section>

<section class="sec" id="equipment">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">07 · Equipment &amp; capacity</p><h2 class="rv">Owned, maintained, <em>ready</em></h2></div><p class="rv d1">Owning our formwork and lifting equipment means we can start when the developer is ready, not when the hire yard is. {SD()}</p></div>
  <div class="eq-grid">{eq}</div>
 </div>
</section>

<section class="sec night" id="quality">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">08 · Quality checks</p><h2 class="rv">Checked at every <em>stage</em></h2></div><p class="rv d1">Five gates between raw material and handover. Nothing moves to the next stage until the last one is signed.</p></div>
  <div class="q-split">
   <ol class="qsteps">{qs}</ol>
   <div class="chk rv d1">
    <div class="chk-h"><div><p class="ht-k">Pre-pour checklist</p><h4>Tower B · Floor 14 · Slab &amp; walls</h4></div>{SD("Sample checklist")}</div>
    <ul>{ck}</ul>
    <div class="chk-f"><span>5 of 7 complete</span><span>Inspected by: Site QA Engineer (sample)</span></div>
    <div class="chk-cubes"><div><b>99.6%</b><small>28-day cube pass rate</small></div><div><b>M40</b><small>Typical slab grade</small></div><div><b>2,140</b><small>Cubes tested this year</small></div>{SD()}</div>
   </div>
  </div>
 </div>
</section>

<section class="sec" id="profile">
 <div class="wrap">
  <div class="prof rv">
   <a class="prof-img" href="{PROFILE_PDF}" download><img src="{IMG}profile-cover.png" alt="Cover of the B&amp;B Enterprises sample company profile PDF" loading="lazy"><span class="sd ba-sd">Sample document</span></a>
   <div>
    <p class="eyebrow">09 · Company profile</p>
    <h2>The B&amp;B profile, <em>ready to share</em></h2>
    <p class="lead">A four-page company profile for your project team and board — capabilities, track record, safety and quality, and how to reach us.</p>
    <p>This demo version is marked SAMPLE throughout; its figures are the same illustrative examples shown on this page.</p>
    <div class="ctas"><a class="btn" href="{PROFILE_PDF}" download>Download company profile <span class="arr"></span></a><span class="small" style="color:var(--mute-2)">PDF · 4 pages · {SD("Sample")}</span></div>
   </div>
  </div>
 </div>
</section>
'''
