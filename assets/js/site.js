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
  }

  // count-up
  var nums=d.querySelectorAll('[data-count]');
  function run(el){
    var t=parseFloat(el.dataset.count), fmt=el.dataset.fmt==='comma', start=null, dur=1800;
    function f(n){n=Math.round(n);return fmt?n.toLocaleString('en-IN'):String(n);}
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

  var y=d.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
})();
