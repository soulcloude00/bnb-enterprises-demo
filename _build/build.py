import os, html, sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from standout import SD, WA_NUM, WA_DISPLAY, home_teaser, home_testimonials, track_page
OUT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG="assets/img/"
PH=lambda t="Placeholder": f'<span class="ph">{t}</span>'
WA_SVG='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.42 1.3-1.95 1.35-.5.05-1.13.07-1.83-.12-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.26-.29.58-.36.77-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.37-.43.5-.14.14-.29.3-.13.59.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.14.46.12.62-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.14.26.1 1.68.79 1.97.94.29.14.48.22.55.34.07.12.07.7-.17 1.38z"/></svg>'
WA_HREF="https://wa.me/"+WA_NUM+"?text="+__import__("urllib.parse").parse.quote("Hello B&B Enterprises — I would like a construction quote for my project.")
WA_MSG="WhatsApp number to be added — placeholder. In the live site this opens a WhatsApp chat with B&B Enterprises."

NAV=[("index.html","Home"),("projects.html","Projects"),("services.html","Services"),("track-record.html","Track Record"),("about.html","About")]

def head(title,desc):
    return f'''<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#0a0a0b">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{html.escape(desc)}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/site.css">
<link rel="stylesheet" href="assets/css/consult.css">
<link rel="stylesheet" href="assets/css/standout.css">
<link rel="stylesheet" href="assets/css/polish.css">
<script>document.documentElement.classList.add('js')</script>
</head>
'''

BRAND='<span class="mono">B<i>&amp;</i>B</span><span class="wm"><b>Enterprises</b><span>Real Estate Construction</span></span>'

def header(cur,battr=''):
    links="".join(f'<a href="{h}"{" aria-current=\"page\"" if h==cur else ""}>{t}</a>' for h,t in NAV)
    mlinks="".join(f'<a href="{h}">{t}<small>0{i+1}</small></a>' for i,(h,t) in enumerate(NAV+[("contact.html","Contact")]))+'<a href="consult.html" data-consult>Build your vision<small>3D</small></a>'
    return f'''<body{battr}>
<a class="skip" href="#main">Skip to content</a>
<header class="hdr">
 <div class="wrap">
  <a class="brand" href="index.html" aria-label="B&amp;B Enterprises — home">{BRAND}</a>
  <nav class="nav" aria-label="Primary">{links}<a class="btn" href="consult.html" data-consult{" aria-current=\"page\"" if cur=="consult.html" else ""}>Request a consultation</a></nav>
  <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span><span></span></button>
 </div>
</header>
<nav class="mnav" id="mnav" aria-label="Mobile">{mlinks}<div class="mfoot">B&amp;B Enterprises · Rooted in Bangalore</div></nav>
'''

def footer():
    return f'''<footer class="ftr">
 <div class="wrap">
  <div class="ftr-top">
   <div>
    <a class="brand" href="index.html" aria-label="B&amp;B Enterprises — home">{BRAND}</a>
    <p class="tagl">Built on experience.<br>Reaching higher.</p>
    <p class="small">Burman and Burman Enterprises — a family construction enterprise, rooted in Bangalore.</p>
   </div>
   <div><h5>Explore</h5><ul><li><a href="index.html">Home</a></li><li><a href="projects.html">Projects</a></li><li><a href="services.html">Services</a></li><li><a href="track-record.html">Track Record</a></li><li><a href="about.html">About</a></li><li><a href="contact.html">Contact</a></li></ul></div>
   <div><h5>Expertise</h5><ul><li><a href="services.html#mivan">Mivan construction</a></li><li><a href="services.html#block">Block construction</a></li><li><a href="projects.html#completed">Completed work</a></li><li><a href="track-record.html#live-sites">Live sites</a></li><li><a href="track-record.html#profile">Company profile (PDF)</a></li></ul></div>
   <div><h5>Reach us</h5><ul>
    <li>Phone {PH()}</li><li>Email {PH()}</li><li>Office address, Bangalore {PH()}</li>
    <li><a href="consult.html" data-consult>Request a consultation →</a></li></ul></div>
  </div>
  <div class="ftr-bot">
   <p>© <span id="yr">2026</span> B&amp;B Enterprises. Demo website — content in progress.</p>
   <p>Project imagery © respective developers (credited on each image). Other imagery: Unsplash (illustrative).</p>
  </div>
 </div>
</footer>
<a class="wa" href="{WA_HREF}" target="_blank" rel="noopener" aria-label="Get a quote in 24 hours on WhatsApp — placeholder number {WA_DISPLAY}"><span class="wi">{WA_SVG}</span><span class="wt"><b>Get a quote in 24 hours</b><small>WhatsApp · <span class="sd">Placeholder no.</span></small></span><span class="wt-m">Quote in 24h</span></a>
<script src="assets/js/site.js" defer></script>
</body>
</html>
'''

def page(fn,title,desc,body,cur=None,battr=''):
    with open(os.path.join(OUT,fn),"w") as f:
        f.write(head(title,desc)+header(cur or fn,battr)+'<main id="main">'+body+'</main>\n'+footer())

def cta(img="stock-dusk-villa.jpg",h="Let&rsquo;s build what&rsquo;s <em>next</em>, together.",p="Developers planning a high-rise, a villa community or a residential tower in Bangalore — share your brief and our team will respond with a considered proposal."):
    return f'''<section class="cta"><img src="{IMG}{img}" alt="" loading="lazy">
 <div class="wrap"><p class="eyebrow center rv">Request a consultation</p><h2 class="rv">{h}</h2><p class="rv d1">{p}</p>
 <div class="ctas rv d2"><a class="btn" href="consult.html" data-consult>Request a consultation <span class="arr"></span></a><a class="btn ghost" href="projects.html">View our work</a></div></div></section>'''

# ---------- PROJECTS DATA ----------
P=[
 dict(slug="project-mvn-aero-one.html",name="MVN Aero One",dev="MVN",loc="Devanahalli, Bangalore",typ="2 &amp; 3 BHK luxury apartments",cat="High-rise residential",status="completed",
   credit="mvnaeroone.com",hero="mvn-tower-night.jpg",card="mvn-tower-night.jpg",
   intro="A luxury residential high-rise at Devanahalli, in Bangalore&rsquo;s fast-growing north near the international airport, developed by MVN.",
   gal=[("mvn-tower-night.jpg","Tower at night"),("mvn-tower-day.jpg","Tower elevation"),("mvn-infinity-pool.jpg","Rooftop infinity pool"),("mvn-living.jpg","Living &amp; dining"),("mvn-interior.jpg","Apartment interior")]),
 dict(slug="project-ellegenza.html",name="Ellegenza",dev="Nambiar Builders",loc="Sarjapur Road, Bangalore",typ="Independent luxury villas",cat="Luxury villas",status="completed",
   credit="nambiarbuilders.com",hero="ell-phase1.jpg",card="ell-bungalows.jpg",
   intro="A community of independent luxury villas off Sarjapur Road, developed by Nambiar Builders.",
   gal=[("ell-phase1.jpg","Ellegenza villas"),("ell-bungalows.jpg","Villa elevations"),("ell-avenue.jpg","Villa avenue"),("ell-dusk.jpg","Villas at dusk")]),
 dict(slug="project-east-park-residences.html",name="Ramsons East Park Residences",dev="Ramsons",loc="Sarjapur Road, Bangalore East",typ="Residential apartments",cat="Residential",status="completed",
   credit="ramsonstrendsquares.com",hero="epr-landscape.jpg",card="epr-garden.jpg",
   intro="A residential community on Sarjapur Road in Bangalore East.",
   gal=[("epr-landscape.jpg","Landscaped grounds"),("epr-garden.jpg","Gardens and towers"),("epr-balcony.jpg","Balcony view"),("epr-bedroom.jpg","Bedroom interior")]),
]
# NB gallery file for mvn pool is .jpg after optimisation

PHP=[ # placeholder projects
 dict(status="ongoing",img="stock-site-aerial.jpg",cat="Category — placeholder"),
 dict(status="ongoing",img="stock-site-workers.jpg",cat="Category — placeholder"),
 dict(status="upcoming",img="stock-architecture.jpg",cat="Category — placeholder"),
]

# ---------- HOME ----------
feat=""
for i,p in enumerate(P):
    feat+=f'''<article class="feat{" rev" if i%2 else ""}">
  <a class="feat-media rv-img" href="{p["slug"]}" aria-label="{p["name"]}"><img src="{IMG}{p["card"] if i!=0 else p["hero"]}" alt="{p["name"]}, {p["loc"]}" loading="lazy"><span class="credit">Image: {p["credit"]}</span></a>
  <div>
   <span class="feat-idx rv">0{i+1} — Completed</span>
   <h3 class="rv">{p["name"]}</h3>
   <div class="loc rv">{p["loc"]}</div>
   <p class="rv d1">{p["intro"]}</p>
   <dl class="meta rv d1"><div><dt>Developer</dt><dd>{p["dev"]}</dd></div><div><dt>Typology</dt><dd>{p["typ"]}</dd></div><div><dt>B&amp;B scope</dt><dd>{PH("To confirm")}</dd></div><div><dt>Year</dt><dd>{PH("To confirm")}</dd></div></dl>
   <a class="link rv d2" href="{p["slug"]}">View project <span aria-hidden="true">→</span></a>
  </div>
 </article>'''

icons={
 "family":'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M8 40V20L24 8l16 12v20"/><path d="M18 40V28h12v12"/><path d="M4 23 24 8l20 15"/></svg>',
 "formwork":'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="8" y="6" width="32" height="36"/><path d="M8 18h32M8 30h32M20 6v36M28 6v36"/></svg>',
 "people":'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="16" cy="16" r="6"/><circle cx="32" cy="16" r="6"/><path d="M4 40c0-7 5-12 12-12s12 5 12 12M20 40c0-7 5-12 12-12s12 5 12 12"/></svg>',
 "rise":'<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 42h36"/><path d="M12 42V26h8v16M22 42V14h8v28M32 42V6h8v36"/></svg>',
}

home=f'''
<section class="hero">
 <div class="hero-media"><img src="{IMG}hero-towers.jpg" alt="Glass high-rise towers rising toward the sky" fetchpriority="high"></div>
 <div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap">
  <p class="eyebrow"><span class="hide-m">B&amp;B Enterprises ·&nbsp;</span>Real Estate Construction</p>
  <h1><span class="l"><span>Built on experience.</span></span><span class="l"><span><em>Reaching higher.</em></span></span></h1>
  <p class="sub">A Bangalore family construction enterprise, building high-rise towers and luxury residences for the city&rsquo;s leading developers — with Mivan precision and the care of a name we carry ourselves.</p>
  <div class="ctas"><a class="btn" href="consult.html" data-consult>Request a consultation <span class="arr"></span></a><a class="btn ghost" href="projects.html">Explore our work</a></div>
 </div>
 <div class="hero-side"><span class="cap">Rooted in Bangalore</span><span class="scroll-cue"><i></i>Scroll</span></div>
 <span class="credit">Illustrative image · Unsplash</span>
</section>

<section class="sec promise">
 <div class="wrap">
  <p class="eyebrow center rv">Burman and Burman Enterprises</p>
  <p class="lead rv">For 20+ years, B&amp;B has built the structures that Bangalore&rsquo;s developers put their names on — <em>towers, villas and homes</em> delivered with discipline, scale and a family&rsquo;s sense of responsibility.</p>
  <div class="sig rv d1"><span class="orn"></span><small>A family enterprise. Looking ahead.</small></div>
 </div>
</section>

<section class="sec tight" style="padding-top:0">
 <div class="wrap">
  <div class="stats">
   <div class="stat rv"><div class="n"><span data-count="20">20</span><sup>+</sup></div><div class="lbl">Years in construction</div></div>
   <div class="stat rv d1"><div class="n"><span data-count="50">50</span><sup>+</sup></div><div class="lbl">Completed projects</div></div>
   <div class="stat rv d2"><div class="n"><span data-count="5000" data-fmt="comma">5,000</span><sup>+</sup></div><div class="lbl">Workforce</div></div>
   <div class="stat rv d3"><div class="n"><span data-count="2">2</span></div><div class="lbl">Core construction systems</div></div>
  </div>
  <p class="stats-note">Completed projects &amp; construction systems · to be confirmed before launch.</p>
 </div>
</section>

<section class="svc-duo" aria-label="Core services">
 <a class="svc-card" href="services.html#mivan"><img src="{IMG}stock-site-workers.jpg" alt="Construction crew working on a reinforced concrete deck" loading="lazy"><span class="credit">Illustrative · Unsplash</span>
  <div class="in"><span class="num">i.</span><h3>Mivan construction</h3><p>Aluminium-formwork construction for residential high-rises — walls and slabs cast together for speed, strength and a remarkably true finish.</p><span class="link">Discover <span aria-hidden="true">→</span></span></div></a>
 <a class="svc-card" href="services.html#block"><img src="{IMG}stock-site-aerial.jpg" alt="Aerial view of a construction site with columns and reinforcement" loading="lazy"><span class="credit">Illustrative · Unsplash</span>
  <div class="in"><span class="num">ii.</span><h3>Block construction</h3><p>Block masonry executed by skilled, supervised crews — the dependable choice for villas, low- and mid-rise homes.</p><span class="link">Discover <span aria-hidden="true">→</span></span></div></a>
</section>

<section class="sec">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Selected work</p><h2 class="rv">Landmarks we have <em>helped raise</em></h2></div><p class="rv d1">A selection of completed projects across Bangalore, built by B&amp;B for some of the city&rsquo;s most respected developers.</p></div>
  {feat}
  <div class="center" style="margin-top:80px"><a class="btn ghost rv" href="projects.html">All projects <span class="arr"></span></a></div>
 </div>
</section>

<section class="builders" aria-label="Developers we have worked with">
 <p class="lbl">Trusted by Bangalore&rsquo;s builders</p>
 <div class="marquee"><ul><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul><ul aria-hidden="true"><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul><ul aria-hidden="true"><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul><ul aria-hidden="true"><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul></div>
</section>

{home_teaser()}

<section class="sec ivory on-ivory">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Why B&amp;B</p><h2 class="rv">The contractor developers <em>keep returning to</em></h2></div><p class="rv d1">What a developer needs from a construction partner is simple to say and hard to deliver: certainty. This is how we provide it.</p></div>
  <div class="pillars">
   <div class="pillar rv"><div class="ic">{icons["family"]}</div><h4>A family name on every site</h4><p>Founder-led and family-run. Decisions are made close to the work, and accountability never gets delegated away.</p></div>
   <div class="pillar rv d1"><div class="ic">{icons["formwork"]}</div><h4>Systemised Mivan expertise</h4><p>Aluminium-formwork construction run as a disciplined, repeatable cycle — the backbone of fast, consistent high-rise delivery.</p></div>
   <div class="pillar rv d2"><div class="ic">{icons["people"]}</div><h4>Workforce at real scale</h4><p>A 5,000+ workforce lets us mobilise quickly and run multiple fronts without compromising supervision.</p></div>
   <div class="pillar rv d3"><div class="ic">{icons["rise"]}</div><h4>20+ years, 50+ projects</h4><p>From independent villas to high-rise towers — experience earned across Bangalore&rsquo;s most demanding sites.</p></div>
  </div>
 </div>
</section>

<section class="sec night">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">How we work</p><h2 class="rv">From brief to <em>handover</em></h2></div><p class="rv d1">An indicative outline of how a typical engagement runs. The exact process is shaped with each developer.</p></div>
  <div class="process">
   <div class="step rv"><div class="dot">i</div><div><h4>Brief &amp; review</h4><p>We study drawings, structure and programme with your team.</p></div></div>
   <div class="step rv d1"><div class="dot">ii</div><div><h4>Proposal</h4><p>A clear scope, method and schedule — Mivan, block or both.</p></div></div>
   <div class="step rv d2"><div class="dot">iii</div><div><h4>Mobilisation</h4><p>Crews, formwork and supervision are deployed to site.</p></div></div>
   <div class="step rv d3"><div class="dot">iv</div><div><h4>Structure</h4><p>Floor-by-floor execution with quality checks at every cycle.</p></div></div>
   <div class="step rv d3"><div class="dot">v</div><div><h4>Handover</h4><p>A finished structure, delivered to the developer&rsquo;s standard.</p></div></div>
  </div>
 </div>
</section>

<section class="sec night">
 <div class="wrap team-teaser">
  <div>
   <p class="eyebrow rv">Core Team</p>
   <h2 class="rv">The family <em>behind the work</em></h2>
   <p class="rv d1">Led by Founder &amp; Managing Director Prakash Burman — with 20+ years in construction and a 5,000+ workforce across Bangalore.</p>
  </div>
  <a class="btn ghost rv d1" href="about.html#core-team">Meet the Core Team <span class="arr"></span></a>
 </div>
</section>

{home_testimonials()}
{cta()}
'''
page("index.html","B&amp;B Enterprises — Real Estate Construction, Bangalore","B&B Enterprises (Burman and Burman Enterprises) — a Bangalore family construction contractor with 20+ years and a 5,000+ workforce, specialising in Mivan and block construction for leading developers.",home)

# ---------- PROJECTS ----------
cards=""
for p in P:
    cards+=f'''<a class="pcard rv" href="{p["slug"]}" data-status="{p["status"]}">
  <div class="pm"><img src="{IMG}{p["card"]}" alt="{p["name"]}" loading="lazy"><span class="status">Completed</span><span class="credit">Image: {p["credit"]}</span></div>
  <div class="pb"><h3>{p["name"]}</h3><div class="pl">{p["loc"]} · {p["dev"]}</div><p class="pd">{p["typ"]}</p></div></a>'''
for i,q in enumerate(PHP):
    lab={"ongoing":"Ongoing","upcoming":"Upcoming"}[q["status"]]
    cards+=f'''<div class="pcard placeholder rv" data-status="{q["status"]}">
  <div class="pm"><img src="{IMG}{q["img"]}" alt="" loading="lazy"><span class="status">{lab}</span><div class="phbox"><span>Project name — Placeholder</span></div></div>
  <div class="pb"><h3>Project Name {PH()}</h3><div class="pl">Location · Developer — placeholder</div><p class="pd">{lab} project to be added with real details.</p></div></div>'''
n_all=len(P)+len(PHP); n_c=len(P); n_o=sum(1 for q in PHP if q["status"]=="ongoing"); n_u=n_all-n_c-n_o
projects=f'''
<section class="phero short">
 <div class="hero-media"><img src="{IMG}ell-avenue.jpg" alt="Avenue of luxury villas at Ellegenza"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span>Projects</div><p class="eyebrow">Our work</p><h1>Projects that <em>stand tall</em></h1><p class="sub">50+ completed projects across Bangalore — high-rise towers, luxury villas and residential communities, built for the city&rsquo;s leading developers.</p></div>
 <span class="credit">Image: nambiarbuilders.com</span>
</section>
<section class="sec">
 <div class="wrap">
  <div class="filters" role="group" aria-label="Filter projects by status"><span class="flab">Filter</span>
   <button class="chip" data-f="all" aria-pressed="true">All <span class="c">{n_all}</span></button>
   <button class="chip" data-f="completed" aria-pressed="false">Completed <span class="c">{n_c}</span></button>
   <button class="chip" data-f="ongoing" aria-pressed="false">Ongoing <span class="c">{n_o}</span></button>
   <button class="chip" data-f="upcoming" aria-pressed="false">Upcoming <span class="c">{n_u}</span></button>
  </div>
  <p id="filter-live" class="sr" aria-live="polite"></p>
  <div class="pgrid">{cards}</div>
  <p class="small" style="margin-top:56px;color:var(--mute-2)">Showing three verified completed projects. The remaining 50+ projects, plus ongoing and upcoming work, are to be added {PH()} — placeholder cards use illustrative stock imagery.</p>
 </div>
</section>
<section class="builders" aria-label="Developers we have worked with">
 <p class="lbl">Developers we have built for</p>
 <div class="marquee"><ul><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul><ul aria-hidden="true"><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul><ul aria-hidden="true"><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul><ul aria-hidden="true"><li>Keya</li><li>Adarsh</li><li>Brigade</li><li>Sumadhura</li><li>MVN</li></ul></div>
</section>
{cta("stock-architecture.jpg","Have a project <em>in the pipeline?</em>")}
'''
page("projects.html","Projects — B&amp;B Enterprises","Completed, ongoing and upcoming construction projects by B&B Enterprises in Bangalore.",projects)

# ---------- PROJECT DETAILS ----------
cls=["g-a","g-b","g-c","g-d","g-e","g-f","g-g"]
for i,p in enumerate(P):
    nxt=P[(i+1)%len(P)]
    gal="".join(f'<button class="{cls[j] if len(p["gal"])>4 else ["g-a","g-b","g-c","g-g"][j]} rv" data-full="{IMG}{f}" data-cap="{c} · Image: {p["credit"]}" aria-label="Open image: {c}"><img src="{IMG}{f}" alt="{p["name"]} — {c}" loading="lazy"><span class="credit">Image: {p["credit"]}</span></button>' for j,(f,c) in enumerate(p["gal"]))
    body=f'''
<section class="phero">
 <div class="hero-media"><img src="{IMG}{p["hero"]}" alt="{p["name"]}, {p["loc"]}" style="object-position:center 35%"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span><a href="projects.html">Projects</a><span>/</span>{p["name"]}</div>
 <p class="eyebrow">Completed · {p["cat"]}</p><h1>{p["name"]}</h1><p class="sub">{p["loc"]} — built for {p["dev"]}.</p></div>
 <span class="credit">Image: {p["credit"]}</span>
</section>
<section class="sec tight">
 <div class="wrap">
  <dl class="facts rv">
   <div><dt>Developer</dt><dd>{p["dev"]}</dd></div>
   <div><dt>Location</dt><dd>{p["loc"]}</dd></div>
   <div><dt>Typology</dt><dd>{p["typ"]}</dd></div>
   <div><dt>B&amp;B scope</dt><dd>{PH("To confirm")}</dd></div>
   <div><dt>Construction system</dt><dd>{PH("Mivan / Block — confirm")}</dd></div>
   <div><dt>Status</dt><dd>Completed</dd></div>
   <div><dt>Year of completion</dt><dd>{PH()}</dd></div>
   <div><dt>Built-up area</dt><dd>{PH()}</dd></div>
   <div><dt>Towers / units / floors</dt><dd>{PH()}</dd></div>
  </dl>
 </div>
</section>
<section class="sec ivory on-ivory">
 <div class="wrap grid2" style="align-items:start">
  <div><p class="eyebrow rv">The project</p><h2 class="rv">{p["intro"].split(",")[0].replace("A ","A <em>",1)+"</em>" if False else "About the <em>project</em>"}</h2></div>
  <div><p class="lead rv" style="color:#2b2823">{p["intro"]}</p><p class="rv d1">B&amp;B Enterprises served as construction contractor. A fuller account of the brief, the challenges on site and how the team delivered will be added here. {PH()}</p></div>
 </div>
 <div class="wrap" style="margin-top:80px">
  <p class="eyebrow rv">What B&amp;B built</p>
  <ul class="scope rv">
   <li><b>01</b><span>Structural scope — e.g. Mivan shell for towers / block masonry for villas</span>{PH("Confirm")}</li>
   <li><b>02</b><span>Scale delivered — floors, units or built-up area</span>{PH("Confirm")}</li>
   <li><b>03</b><span>Programme — duration and key milestones</span>{PH("Confirm")}</li>
   <li><b>04</b><span>Peak workforce deployed on site</span>{PH("Confirm")}</li>
  </ul>
 </div>
</section>
<section class="sec">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Gallery</p><h2 class="rv">The finished <em>work</em></h2></div><p class="rv d1">Images courtesy of the developer, {p["credit"]}. Select any image to enlarge.</p></div>
  <div class="gallery">{gal}</div>
 </div>
</section>
<section class="sec tight" style="padding-top:0">
 <div class="wrap">
  <div class="locbox rv">
   <div class="lt"><p class="eyebrow">Location</p><h3 style="margin-bottom:18px">{p["loc"]}</h3><p>Developed by {p["dev"]}. B&amp;B Enterprises&rsquo; role on this project: construction contractor.</p><p class="small">Map embed to be added {PH()}</p></div>
   <div class="mapph" role="img" aria-label="Map placeholder for {p["loc"]}"><div class="pin"><i></i><b>{p["loc"].split(",")[0]}</b><small>Map placeholder</small></div></div>
  </div>
 </div>
</section>
<section>
 <div class="wrap"><a class="nextp" href="{nxt["slug"]}"><div><p class="eyebrow">Next project</p><h3>{nxt["name"]}</h3></div><span class="link">View <span aria-hidden="true">→</span></span></a></div>
</section>
{cta(p["card"] if p["slug"]!="project-mvn-aero-one.html" else "mvn-infinity-pool.jpg","Planning a project <em>like this?</em>")}
<div class="lb" role="dialog" aria-modal="true" aria-label="Image viewer"><button class="x" aria-label="Close">✕</button><button class="pv" aria-label="Previous image">‹</button><button class="nx" aria-label="Next image">›</button><figure><img src="" alt=""><figcaption></figcaption></figure></div>
'''
    page(p["slug"],f'{p["name"]} — Projects — B&amp;B Enterprises',f'{p["name"]}, {html.unescape(p["loc"])} — built by B&B Enterprises for {p["dev"]}.',body,cur="projects.html")

# ---------- SERVICES ----------
services=f'''
<section class="phero short">
 <div class="hero-media"><img src="{IMG}stock-site-workers.jpg" alt="Construction crew on a concrete deck"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span>Services</div><p class="eyebrow">What we do</p><h1>Two systems. <em>One standard.</em></h1><p class="sub">B&amp;B Enterprises builds for developers. We specialise in Mivan aluminium-formwork construction and block construction — each run with the same discipline.</p></div>
 <span class="credit">Illustrative · Unsplash</span>
</section>
<div class="wrap">
 <section class="svc-row" id="mivan">
  <div class="svc-media rv-img"><img src="{IMG}mvn-tower-day.jpg" alt="MVN Aero One residential tower" loading="lazy" style="object-position:center 20%"><span class="tag">i.</span><span class="credit">MVN Aero One · Image: mvnaeroone.com</span></div>
  <div>
   <p class="eyebrow rv">Core service</p><h2 class="rv">Mivan <em>construction</em></h2>
   <p class="lead rv d1">Aluminium-formwork construction for residential buildings — where walls and slabs are cast together, floor after floor, in a precise repeating cycle.</p>
   <ul class="ticks rv d1">
    <li>Monolithic casting of walls and slabs for a strong, seamless structure</li>
    <li>A fast, repeatable floor cycle suited to high-rise residential towers</li>
    <li>Accurate, smooth concrete surfaces that reduce plastering and rework</li>
    <li>Consistent quality across every floor and every tower</li>
   </ul>
   <p class="small rv">Typical cycle time, tower heights handled and formwork sets owned {PH("To confirm")} · <a class="gold" href="track-record.html#mivan-speed">See sample speed numbers →</a></p>
   <a class="btn rv d2" href="consult.html" data-consult>Discuss a Mivan project <span class="arr"></span></a>
  </div>
 </section>
 <section class="svc-row rev" id="block">
  <div class="svc-media rv-img"><img src="{IMG}ell-bungalows.jpg" alt="Ellegenza independent luxury villas" loading="lazy"><span class="tag">ii.</span><span class="credit">Ellegenza · Image: nambiarbuilders.com</span></div>
  <div>
   <p class="eyebrow rv">Core service</p><h2 class="rv">Block <em>construction</em></h2>
   <p class="lead rv d1">Block masonry built by skilled, supervised crews — the dependable, flexible method for villas and low- to mid-rise residences.</p>
   <ul class="ticks rv d1">
    <li>Well-suited to independent villas and varied architectural layouts</li>
    <li>Experienced masonry crews with on-site supervision</li>
    <li>Flexible sequencing alongside structural and services work</li>
    <li>Built to the developer&rsquo;s specification and finish standard</li>
   </ul>
   <p class="small rv">Block types used and typical project scale {PH("To confirm")}</p>
   <a class="btn rv d2" href="consult.html" data-consult>Discuss a block project <span class="arr"></span></a>
  </div>
 </section>
</div>
<section class="sec">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Beyond the core</p><h2 class="rv">Additional <em>capabilities</em></h2></div><p class="rv d1">{PH()} Shown for layout only — keep, edit or remove depending on what B&amp;B actually offers.</p></div>
  <div class="extra">
   <div class="card rv">{PH()}<h4>Service name</h4><p>e.g. structural works / civil contracting — describe only if B&amp;B offers it.</p></div>
   <div class="card rv d1">{PH()}<h4>Service name</h4><p>e.g. finishing works — describe only if B&amp;B offers it.</p></div>
   <div class="card rv d2">{PH()}<h4>Service name</h4><p>e.g. labour &amp; site management — describe only if B&amp;B offers it.</p></div>
  </div>
 </div>
</section>
<section class="sec night">
 <div class="wrap center">
  <p class="eyebrow center rv">Capacity</p>
  <h2 class="rv" style="max-width:18ch;margin:0 auto 30px">A <em>5,000+</em> workforce, ready to mobilise.</h2>
  <p class="rv d1" style="max-width:620px;margin:0 auto">Scale is what lets a contractor keep its promises when programmes tighten. Our 5,000+ workforce and 20+ years of site experience let us run multiple fronts while keeping supervision close.</p>
 </div>
</section>
{cta("stock-dusk-villa.jpg")}
'''
page("services.html","Services — Mivan &amp; Block Construction — B&amp;B Enterprises","Mivan aluminium-formwork construction and block construction for residential developers in Bangalore.",services)

# ---------- ABOUT ----------
about=f'''
<section class="phero short">
 <div class="hero-media"><img src="{IMG}stock-site-aerial.jpg" alt="Aerial view of a construction site"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span>About</div><p class="eyebrow">About Us</p><h1>A family enterprise. <em>Looking ahead.</em></h1><p class="sub">Burman and Burman Enterprises — rooted in Bangalore, built over 20+ years on site.</p></div>
 <span class="credit">Illustrative · Unsplash</span>
</section>

<section class="sec about-flow" id="about-us">
 <div class="wrap">
  <div class="grid2 about-story">
   <div class="story-img rv-img"><img src="{IMG}stock-drafting.jpg" alt="Hands drafting construction drawings" loading="lazy" style="object-position:30% center"><span class="credit">Illustrative · Unsplash</span></div>
   <div>
    <p class="eyebrow rv">Our story</p>
    <h2 class="rv" style="margin-bottom:30px">Built on <em>experience</em></h2>
    <p class="lead rv d1">B&amp;B Enterprises was founded by Prakash Burman, who has led the company for 20+ years in construction.</p>
    <p class="rv d1">What began as a family business has grown into a contractor trusted by Bangalore&rsquo;s leading developers — with 50+ completed projects, including high-rise towers, and a 5,000+ workforce.</p>
    <p class="rv d2">The founding story — how and when it began, the first projects, and the moments that shaped the company — will be told here in the family&rsquo;s own words. {PH()}</p>
   </div>
  </div>

  <div class="about-belief center">
   <p class="eyebrow center rv">Our belief</p>
   <p class="big-quote rv" style="margin:0 auto">&ldquo;Every structure we raise carries our family&rsquo;s name — so it must be built to <em>last for generations</em>.&rdquo;</p>
   <p class="rv d1" style="margin-top:28px">{PH("Sample quote — confirm wording with Prakash Burman")}</p>
  </div>

  <div class="about-values">
   <div class="sec-head"><div><p class="eyebrow rv">Values</p><h2 class="rv">What we <em>stand on</em></h2></div></div>
   <div class="values">
    <div class="value rv"><div class="vn">i.</div><h4>Responsibility</h4><p>We treat a developer&rsquo;s project as if our own name were on it — because it is.</p></div>
    <div class="value rv d1"><div class="vn">ii.</div><h4>Discipline</h4><p>Systems like Mivan reward rigour. We plan the cycle and keep to it.</p></div>
    <div class="value rv d2"><div class="vn">iii.</div><h4>Care for people</h4><p>A 5,000+ workforce is a responsibility as much as a capability.</p></div>
   </div>
   <p class="small" style="margin-top:20px;color:var(--mute-2)">Value statements are suggested copy {PH("Confirm")}</p>
  </div>
 </div>
</section>

<section class="sec night" id="core-team">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Core Team</p><h2 class="rv">The people who <em>lead the work</em></h2></div><p class="rv d1">Founder-led, family-rooted — with room for the wider leadership to be named as the family confirms each role.</p></div>
  <div class="team-layout">
   <article class="member founder rv">
    <div class="portrait photo"><picture><source type="image/webp" srcset="assets/team/founder-800.webp 800w, assets/team/founder.webp 1600w" sizes="(max-width:560px) 92vw, 420px"><img src="assets/team/founder.jpg" alt="Prakash Burman, Founder &amp; Managing Director, B&amp;B Enterprises" width="1600" height="2000" loading="lazy"></picture></div>
    <div class="fb">
     <h4>Prakash Burman</h4>
     <div class="role">Founder &amp; Managing Director</div>
     <p>Founder of B&amp;B Enterprises, with 20+ years in construction. Full biography {PH()}</p>
    </div>
   </article>
   <!-- CORE TEAM SLOTS — to add a real photo: save it as assets/team/member-N.jpg (portrait, ~4:5, min 800px tall),
        replace the comment inside that slot's .portrait with the <img> tag shown, remove the .mono-tag/.soon spans
        and the "silhouette" class, then set the name in <h4> and the role in .role. -->
   <div class="team-grid">
    <article class="member slot rv d1">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-1.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv d2">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-2.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv d3">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-3.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-4.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv d1">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-5.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv d2">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-6.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv d3">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-7.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
    <article class="member slot rv">
     <div class="portrait silhouette"><!-- swap: <img src="assets/team/member-8.jpg" alt="Name, Role" loading="lazy"> --><span class="mono-tag" aria-hidden="true">B&amp;B</span><span class="soon">Photo coming soon</span></div>
     <h4>Team member</h4>
     <div class="role">Role</div>
    </article>
   </div>
  </div>
  </div>
 </div>
</section>

<section class="sec">
 <div class="wrap">
  <div class="sec-head"><div><p class="eyebrow rv">Milestones</p><h2 class="rv">Reaching <em>higher</em></h2></div><p class="rv d1">{PH()} Years and events to be supplied by the family.</p></div>
  <div class="timeline">
   <div class="tl rv"><div class="yr">Year<br>{PH()}</div><div class="tx"><h4>B&amp;B Enterprises founded</h4><p>Prakash Burman establishes the company in Bangalore.</p></div></div>
   <div class="tl rv"><div class="yr">Year<br>{PH()}</div><div class="tx"><h4>First high-rise</h4><p>Milestone to be confirmed.</p></div></div>
   <div class="tl rv"><div class="yr">Year<br>{PH()}</div><div class="tx"><h4>Mivan construction</h4><p>When B&amp;B adopted aluminium-formwork construction — to be confirmed.</p></div></div>
   <div class="tl rv"><div class="yr">Today</div><div class="tx"><h4>50+ projects, 5,000+</h4><p>Building for Keya, Adarsh, Brigade, Sumadhura, MVN and more — with 20+ years behind us.</p></div></div>
  </div>
 </div>
</section>
{cta("ell-dusk.jpg")}
'''
page("about.html","About Us — B&amp;B Enterprises","About Us — B&B Enterprises, a Bangalore family construction enterprise founded by Prakash Burman. 20+ years in construction and a 5,000+ workforce.",about)

# ---------- CONTACT ----------
contact=f'''
<section class="phero short">
 <div class="hero-media"><img src="{IMG}stock-dusk-villa.jpg" alt="Modern residence at dusk"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span>Contact</div><p class="eyebrow">Request a consultation</p><h1>Begin with a <em>conversation</em></h1><p class="sub">Tell us about your project — tower, villa community or residential development — and our team will respond with a considered proposal.</p><div class="ctas" style="margin-top:30px"><a class="btn" href="consult.html" data-consult>Build your vision in 3D <span class="arr"></span></a></div></div>
 <span class="credit">Illustrative · Unsplash</span>
</section>
<section class="sec">
 <div class="wrap cgrid">
  <div class="cinfo" id="direct">
   <p class="eyebrow rv">Direct</p>
   <h2 class="rv" style="margin-bottom:24px">Speak with <em>B&amp;B</em></h2>
   <p class="rv">For developers and project teams planning construction in and around Bangalore.</p>
   <dl class="rv d1">
    <div><dt>Phone</dt><dd>+91 — {PH()}</dd></div>
    <div><dt>Email</dt><dd>— {PH()}</dd></div>
    <div><dt>WhatsApp</dt><dd><a class="link" href="{WA_HREF}" target="_blank" rel="noopener">Get a quote in 24 hours</a>{SD("Placeholder no. "+WA_DISPLAY)}</dd></div>
    <div><dt>Office</dt><dd>Bangalore {PH("Full address")}</dd></div>
    <div><dt>Hours</dt><dd>— {PH()}</dd></div>
   </dl>
  </div>
  <div class="form rv d1">
   <form id="enquiry" novalidate>
    <h3>Project enquiry</h3>
    <p class="small">Fields marked * are required.</p>
    <div class="frow">
     <div class="fld"><label for="f-name">Full name *</label><input id="f-name" name="name" autocomplete="name" required><div class="err">Please enter your name.</div></div>
     <div class="fld"><label for="f-co">Company / developer</label><input id="f-co" name="company" autocomplete="organization"></div>
    </div>
    <div class="frow">
     <div class="fld"><label for="f-ph">Phone *</label><input id="f-ph" name="phone" type="tel" autocomplete="tel" inputmode="tel" required><div class="err">Please enter a valid phone number.</div></div>
     <div class="fld"><label for="f-em">Email *</label><input id="f-em" name="email" type="email" autocomplete="email" required><div class="err">Please enter a valid email.</div></div>
    </div>
    <div class="frow">
     <div class="fld"><label for="f-type">Project type *</label><select id="f-type" name="type" required><option value="">Select</option><option>High-rise residential</option><option>Villas / row houses</option><option>Mid-rise residential</option><option>Commercial</option><option>Other</option></select><div class="err">Please choose a project type.</div></div>
     <div class="fld"><label for="f-sys">Construction system</label><select id="f-sys" name="system"><option value="">Select</option><option>Mivan (aluminium formwork)</option><option>Block construction</option><option>Not sure yet</option></select></div>
    </div>
    <div class="frow">
     <div class="fld"><label for="f-loc">Project location</label><input id="f-loc" name="location" placeholder="e.g. North Bangalore"></div>
     <div class="fld"><label for="f-when">Expected start</label><select id="f-when" name="start"><option value="">Select</option><option>Within 3 months</option><option>3–6 months</option><option>6–12 months</option><option>Exploring</option></select></div>
    </div>
    <div class="fld"><label for="f-msg">Project brief</label><textarea id="f-msg" name="message" placeholder="Scale, towers / units, timelines…"></textarea></div>
    <label class="consent fld"><input type="checkbox" id="f-ok" required> <span>I agree to be contacted by B&amp;B Enterprises about this enquiry. *</span><span class="err" style="margin-left:6px">Required.</span></label>
    <button class="btn" type="submit">Send enquiry <span class="arr"></span></button>
    <p class="demo-note">Demo form — submissions are not sent anywhere yet. {PH("Connect to email / CRM")}</p>
   </form>
   <div class="form-ok" id="form-ok" tabindex="-1" role="status"><div class="seal">✓</div><h3>Thank you.</h3><p>This is a demo — your enquiry was not sent. In the live site, the B&amp;B team would receive it and respond.</p></div>
  </div>
 </div>
</section>
<section class="sec tight" style="padding-top:0">
 <div class="wrap"><div class="mapph rv" role="img" aria-label="Office map placeholder" style="min-height:440px;border:1px solid var(--line)"><div class="pin"><i></i><b>B&amp;B Enterprises, Bangalore</b><small>Map embed placeholder — office address to be added</small></div></div></div>
</section>
'''
page("contact.html","Contact — Request a Consultation — B&amp;B Enterprises","Request a consultation with B&B Enterprises, Bangalore — Mivan and block construction for developers.",contact)


# ---------- BUILD YOUR VISION (3D configurator) ----------
_src=os.path.join(os.path.dirname(os.path.abspath(__file__)),"consult-src")
with open(os.path.join(OUT,"assets/js/consult.js"),"w") as f:
    f.write("".join(open(os.path.join(_src,n)).read() for n in sorted(os.listdir(_src)) if n.endswith(".js")))
consult=f'''
<section class="phero cxpage">
 <div class="hero-media"><img src="{IMG}stock-architecture.jpg" alt="Contemporary architecture at dusk"></div><div class="hero-frame" aria-hidden="true"></div>
 <div class="wrap"><div class="crumbs"><a href="index.html">Home</a><span>/</span>Build your vision</div><p class="eyebrow">Request a consultation</p><h1>Build your <em>vision</em></h1>
 <p class="sub">Answer 12 short questions, pick one of three designs and watch a 3D concept of your project rise on its plot — then share the brief with our team on WhatsApp or download it.</p>
 <div class="ctas"><a class="btn" href="consult.html" data-consult>Start the configurator <span class="arr"></span></a><a class="btn ghost" href="contact.html">Prefer a simple form?</a></div>
 <noscript><p class="small" style="margin-top:24px">The 3D configurator needs JavaScript. Please use the <a class="gold" href="contact.html">enquiry form</a> instead.</p></noscript></div>
 <span class="credit">Illustrative · Unsplash</span>
</section>
'''
page("consult.html","Build your vision — Request a Consultation — B&amp;B Enterprises","Configure your villa, apartment building, commercial project, row houses or farmhouse in 3D and share the brief with B&B Enterprises, Bangalore.",consult,cur="consult.html",battr=' data-consult-page')

# ---------- TRACK RECORD (standout sections) ----------
page("track-record.html","Track Record — Why B&amp;B — B&amp;B Enterprises","B&B Enterprises track record: live project tracker, Mivan speed, safety, workforce, equipment, quality checks and company profile. Demo with sample data.",track_page()+cta("tl-08.jpg","Put this track record <em>to work</em> on your project."))

# ---------- 404 ----------
page("404.html","Page not found — B&amp;B Enterprises","Page not found.",f'''<section class="phero"><div class="hero-media"><img src="{IMG}hero-towers.jpg" alt=""></div><div class="hero-frame"></div><div class="wrap"><p class="eyebrow">404</p><h1>This floor isn&rsquo;t <em>built yet.</em></h1><p class="sub">The page you were looking for doesn&rsquo;t exist.</p><div style="margin-top:36px"><a class="btn" href="index.html">Return home <span class="arr"></span></a></div></div></section>''',cur="")
print("built")
