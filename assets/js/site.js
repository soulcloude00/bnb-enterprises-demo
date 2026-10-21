(function(){
  var d=document, root=d.documentElement;
  root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header
  var hdr=d.querySelector('.hdr');
  function onScroll(){ if(hdr) hdr.classList.toggle('solid', window.scrollY>40); }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});

  // mobile menu
  var burger=d.querySelector('.burger');
  if(burger){
    burger.addEventListener('click',function(){
      var open=d.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded',open);
    });
    d.querySelectorAll('.mnav a').forEach(function(a){a.addEventListener('click',function(){d.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false');});});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&d.body.classList.contains('menu-open')){d.body.classList.remove('menu-open');burger.setAttribute('aria-expanded','false');burger.focus();}});
  }

  // reveal
  var els=d.querySelectorAll('.rv,.rv-img');
  if(reduce||!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); }
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    els.forEach(function(e){io.observe(e);});
    // safety net: never leave content hidden if an observer callback is missed
    setTimeout(function(){ els.forEach(function(e){ var r=e.getBoundingClientRect(); if(r.top<innerHeight&&r.bottom>0) e.classList.add('in'); }); },1800);
  }

  // count-up
  // sample "days since" counters (accident-free days) — computed from data-since
  d.querySelectorAll('[data-since]').forEach(function(el){ var t0=new Date(el.dataset.since+'T00:00:00'); var n=Math.max(0,Math.floor((Date.now()-t0)/864e5)); el.dataset.count=n; el.textContent=n.toLocaleString('en-IN'); });
  var nums=d.querySelectorAll('[data-count]');
  function run(el){
    var t=parseFloat(el.dataset.count), fmt=el.dataset.fmt==='comma', dec=parseInt(el.dataset.dec||'0',10), start=null, dur=1800;
    function f(n){if(dec) return n.toFixed(dec); n=Math.round(n);return fmt?n.toLocaleString('en-IN'):String(n);}
    if(reduce){el.textContent=f(t);return;}
    function step(ts){ if(!start) start=ts; var p=Math.min((ts-start)/dur,1); p=1-Math.pow(1-p,3); el.textContent=f(t*p); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){run(en.target);cio.unobserve(en.target);}});},{threshold:.4});
    nums.forEach(function(n){cio.observe(n);});
  } else nums.forEach(run);

  // toast
  var toast;
  function say(msg){
    if(!toast){toast=d.createElement('div');toast.className='toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');d.body.appendChild(toast);}
    toast.textContent=msg; toast.classList.add('show'); clearTimeout(say.t); say.t=setTimeout(function(){toast.classList.remove('show');},3800);
  }
  d.querySelectorAll('[data-placeholder-msg]').forEach(function(b){
    b.addEventListener('click',function(e){e.preventDefault();say(b.getAttribute('data-placeholder-msg'));});
  });

  // project filters
  var chips=d.querySelectorAll('.chip[data-f]'), cards=d.querySelectorAll('.pcard');
  chips.forEach(function(c){
    c.addEventListener('click',function(){
      var f=c.dataset.f;
      chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false');});
      var shown=0;
      cards.forEach(function(card){var ok=f==='all'||card.dataset.status===f;card.classList.toggle('hide',!ok);if(ok){shown++;card.classList.add('in');}});
      var live=d.getElementById('filter-live'); if(live) live.textContent=shown+' project'+(shown===1?'':'s')+' shown';
      if(history.replaceState) history.replaceState(null,'',f==='all'?location.pathname:'#'+f);
    });
  });
  function fromHash(){ if(!chips.length||!location.hash) return; var pre=d.querySelector('.chip[data-f="'+location.hash.slice(1)+'"]'); if(pre) pre.click(); }
  fromHash(); window.addEventListener('hashchange',fromHash);

  // lightbox
  var lb=d.querySelector('.lb');
  if(lb){
    var items=[].slice.call(d.querySelectorAll('.gallery button')), idx=0, img=lb.querySelector('img'), cap=lb.querySelector('figcaption'), last;
    function show(i){idx=(i+items.length)%items.length; var b=items[idx]; img.src=b.dataset.full; img.alt=b.querySelector('img').alt; cap.textContent=b.dataset.cap||'';}
    function open(i){last=d.activeElement;show(i);lb.classList.add('open');lb.querySelector('.x').focus();d.body.style.overflow='hidden';}
    function close(){lb.classList.remove('open');d.body.style.overflow='';if(last)last.focus();}
    items.forEach(function(b,i){b.addEventListener('click',function(){open(i);});});
    lb.querySelector('.x').addEventListener('click',close);
    lb.querySelector('.pv').addEventListener('click',function(){show(idx-1);});
    lb.querySelector('.nx').addEventListener('click',function(){show(idx+1);});
    lb.addEventListener('click',function(e){if(e.target===lb)close();});
    var tx=null,ty=0; lb.addEventListener('touchstart',function(e){if(e.touches.length===1){tx=e.touches[0].clientX;ty=e.touches[0].clientY;}},{passive:true});
    lb.addEventListener('touchend',function(e){if(tx===null)return; var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty; tx=null; if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){show(idx+(dx<0?1:-1));} else if(dy>90&&Math.abs(dy)>Math.abs(dx)*1.5){close();}},{passive:true});
    d.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return; if(e.key==='Escape')close(); if(e.key==='ArrowLeft')show(idx-1); if(e.key==='ArrowRight')show(idx+1);});
  }

  // enquiry form (front-end only)
  var form=d.getElementById('enquiry');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault(); var ok=true, first=null;
      form.querySelectorAll('[required]').forEach(function(f){
        var w=f.closest('.fld'); var v=f.type==='checkbox'?f.checked:f.value.trim(); var good=!!v;
        if(good&&f.type==='email') good=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
        if(good&&f.type==='tel') good=/^[+0-9 ()-]{8,}$/.test(f.value.trim());
        if(w) w.classList.toggle('bad',!good);
        f.setAttribute('aria-invalid',!good);
        if(!good){ok=false; if(!first) first=f;}
      });
      if(!ok){first.focus();return;}
      form.style.display='none';
      var okBox=d.getElementById('form-ok'); okBox.classList.add('show'); okBox.focus();
    });
    form.querySelectorAll('input,select,textarea').forEach(function(f){f.addEventListener('input',function(){var w=f.closest('.fld');if(w)w.classList.remove('bad');});});
  }


  // "Build your vision" consultation configurator — lazy-loaded ES module (3D only loads when opened)
  var cxP=null, cxPage=d.body.hasAttribute('data-consult-page');
  function cxLoad(){
    if(!cxP){ try{ cxP=(new Function('u','return import(u)'))(new URL('assets/js/consult.js',d.baseURI).href); }catch(err){ cxP=Promise.reject(err); } }
    return cxP;
  }
  function cxOpen(push){ cxLoad().then(function(m){ m.open({push:push}); }).catch(function(){ if(!cxPage) location.href='consult.html'; }); }
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('[data-consult]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button>0) return;
    e.preventDefault();
    if(d.body.classList.contains('menu-open')){ d.body.classList.remove('menu-open'); if(burger) burger.setAttribute('aria-expanded','false'); }
    cxOpen(!cxPage);
  });
  d.addEventListener('pointerover',function(e){ if(e.target.closest&&e.target.closest('[data-consult]')) cxLoad().catch(function(){}); },{passive:true});
  if(cxPage) cxOpen(false);

  // before / after slider
  d.querySelectorAll('.ba').forEach(function(ba){
    var r=ba.querySelector('input'); if(!r) return;
    function set(){ ba.style.setProperty('--x',r.value+'%'); }
    function at(e){ var b=ba.getBoundingClientRect(); r.value=Math.max(0,Math.min(100,(e.clientX-b.left)/b.width*100)); set(); }
    var drag=false;
    ba.addEventListener('dragstart',function(e){ e.preventDefault(); });
    ba.addEventListener('pointerdown',function(e){ if(e.button>0) return; e.preventDefault(); drag=true; at(e); try{ba.setPointerCapture(e.pointerId);}catch(_){} });
    ba.addEventListener('pointermove',function(e){ if(drag) at(e); });
    ['pointerup','pointercancel','lostpointercapture'].forEach(function(t){ ba.addEventListener(t,function(){ drag=false; }); });
    r.addEventListener('input',set); set();
  });

  // time-lapse sequence (auto-advances while visible; paused under reduced motion)
  d.querySelectorAll('.tlapse').forEach(function(tl){
    var fr=[].slice.call(tl.querySelectorAll('.tl-f')), dots=[].slice.call(tl.querySelectorAll('.tl-dots button')), bar=tl.querySelector('.tl-prog span'), btn=tl.querySelector('.tl-play'), i=0, timer=null, playing=!reduce, vis=false;
    function show(k){ i=(k+fr.length)%fr.length; fr.forEach(function(f,j){f.classList.toggle('on',j===i);}); dots.forEach(function(b,j){ if(j===i) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current'); }); if(bar) bar.style.width=(fr.length>1?i/(fr.length-1)*100:100)+'%'; var nx=fr[(i+1)%fr.length].querySelector('img'); if(nx&&nx.loading==='lazy') nx.loading='eager'; }
    function tick(){ clearTimeout(timer); if(playing&&vis) timer=setTimeout(function(){ show(i+1); tick(); }, i===fr.length-1?2600:1500); }
    function ui(){ btn.setAttribute('aria-pressed',playing?'true':'false'); btn.setAttribute('aria-label',playing?'Pause time-lapse':'Play time-lapse'); }
    btn.addEventListener('click',function(){ playing=!playing; ui(); tick(); });
    dots.forEach(function(b,j){ b.addEventListener('click',function(){ playing=false; ui(); show(j); tick(); }); });
    if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ vis=es[0].isIntersecting; tick(); },{threshold:.35}).observe(tl); } else { vis=true; }
    ui(); show(0); tick();
  });

  // track-record sub-nav: highlight the section in view
  var sn=d.querySelectorAll('.subnav a');
  if(sn.length&&'IntersectionObserver' in window){
    var map={}; sn.forEach(function(a){ map[a.getAttribute('href').slice(1)]=a; });
    var so=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ sn.forEach(function(a){a.classList.remove('on');}); var a=map[en.target.id]; if(a){ a.classList.add('on'); if(a.parentNode.scrollTo) a.parentNode.scrollTo({left:a.offsetLeft-24,behavior:reduce?'auto':'smooth'}); } } }); },{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(map).forEach(function(id){ var s=d.getElementById(id); if(s) so.observe(s); });
  }

  var y=d.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();

  // ---- v4 motion layer ----
  (function(){
    if(reduce) return;
    var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    // scroll progress hairline
    var bar=d.createElement('div'); bar.className='sprog'; d.body.appendChild(bar);
    // auto-stagger siblings in grids
    d.querySelectorAll('.team-grid,.pgrid,.pillars,.stats,.values,.process').forEach(function(g){
      [].forEach.call(g.children,function(c,i){ if(c.classList.contains('rv')) c.style.transitionDelay=(i%4*0.09+Math.floor(i/4)*0.05)+'s'; });
    });
    // hero word stagger on the sub line
    var sub=d.querySelector('.hero .sub');
    if(sub&&!sub.querySelector('.w')){ sub.innerHTML=sub.textContent.trim().split(/\s+/).map(function(w,i){return '<span class="w" style="animation-delay:'+(0.75+i*0.025).toFixed(3)+'s">'+w+'</span>';}).join(' '); sub.classList.add('words'); }
    // parallax targets
    var heroImg=d.querySelector('.hero .hero-media'), par=[].slice.call(d.querySelectorAll('.feat-media img,.story-img img,.svc-media img,.fv-media img,.cta .hero-media'));
    var ticking=false;
    function frame(){
      ticking=false; var y=window.scrollY, vh=innerHeight;
      var h=d.documentElement.scrollHeight-vh; bar.style.transform='scaleX('+(h>0?y/h:0)+')';
      if(heroImg&&y<vh*1.2) heroImg.style.transform='translate3d(0,'+(y*0.28).toFixed(1)+'px,0)';
      for(var i=0;i<par.length;i++){ var el=par[i], r=el.parentNode.getBoundingClientRect(); if(r.bottom<0||r.top>vh) continue;
        var p=((r.top+r.height/2)-vh/2)/vh; el.style.setProperty('--py',(p*-6).toFixed(2)+'%'); }
    }
    function req(){ if(!ticking){ticking=true;requestAnimationFrame(frame);} }
    window.addEventListener('scroll',req,{passive:true}); window.addEventListener('resize',req); frame();
    // magnetic buttons (desktop only)
    if(fine) d.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*0.15).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*0.25-1).toFixed(1)+'px)';});
      b.addEventListener('mouseleave',function(){b.style.transform='';});
    });
  })();
})();
