/* B&B Enterprises — "Build your vision" consultation configurator
   Front-end only. Three.js r169 is vendored at assets/vendor/three-0.169.0 (MIT).
   Source is split in _build/consult-src/ and concatenated by _build/build.py. */
const VENDOR = new URL('../vendor/three-0.169.0/', import.meta.url).href;
// PLACEHOLDER WhatsApp number — replace with B&B Enterprises' real number (country code + number, digits only).
const WA_NUMBER = '910000000000';
const WA_IS_PLACEHOLDER = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FT = 0.3048;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ questions */
const Q = [
  { id: 'type', label: 'Project', title: 'What do you want to <em>build?</em>', sub: 'Choose the closest fit — everything can be refined with our team.', hint: 'Sets the massing of the model.',
    opts: [['villa', 'Villa', 'Independent luxury home'], ['apartment', 'Apartment building', 'Multi-family residential'], ['commercial', 'Commercial', 'Offices, retail or mixed-use'], ['row', 'Row houses', 'A terrace of homes'], ['farm', 'Farmhouse', 'Weekend or estate living'], ['unsure', 'Not sure yet', 'We’ll help you decide']] },
  { id: 'variant', label: 'Design', kind: 'variant', title: 'Choose a <em>design</em>', sub: 'Three distinct directions — each with its own silhouette. Materials and finish come next.', hint: 'The whole massing and roofline change.' },
  { id: 'plot', label: 'Plot', title: 'How large is your <em>plot?</em>', sub: 'Width × depth, in feet.', hint: 'The plot and footprint rescale to match.',
    opts: [['30x40', '30 × 40', '1,200 sq ft'], ['30x50', '30 × 50', '1,500 sq ft'], ['40x60', '40 × 60', '2,400 sq ft'], ['60x80', '60 × 80', '4,800 sq ft'], ['acre', '1 acre +', '43,560 sq ft and above'], ['custom', 'Custom', 'Enter your dimensions']] },
  { id: 'loc', label: 'Location', title: 'Where in <em>Bangalore?</em>', sub: 'Roughly is fine.', hint: 'The surroundings change around your plot.',
    opts: [['north', 'North', 'Devanahalli · Hebbal · Yelahanka'], ['east', 'East', 'Whitefield · Sarjapur'], ['south', 'South', 'JP Nagar · Kanakapura Rd · E-City'], ['west', 'West', 'Rajajinagar · Mysore Rd'], ['central', 'Central', 'CBD · Indiranagar · Koramangala'], ['outside', 'Outside Bangalore', 'Elsewhere in Karnataka & beyond']] },
  { id: 'floors', label: 'Floors', title: 'How many <em>floors?</em>', sub: 'G = ground floor.', hint: 'Watch it rise floor by floor.',
    opts: [['g1', 'G + 1', 'Ground + 1 floor'], ['g2', 'G + 2', 'Ground + 2 floors'], ['g3', 'G + 3', 'Ground + 3 floors'], ['hr', 'High-rise', 'G + 10 and above · apartments']] },
  { id: 'cons', label: 'Construction', title: 'Construction <em>system</em>', sub: 'Our two core systems — or let us recommend.', hint: 'Shows the site set-up: aluminium formwork & crane, or scaffolding & blockwork.',
    opts: [['mivan', 'Mivan', 'Aluminium formwork · monolithic walls & slabs'], ['block', 'Block masonry', 'Supervised masonry crews'], ['advise', 'Advise me', 'We’ll recommend the right fit']] },
  { id: 'tier', label: 'Finish', title: 'Quality & <em>finish</em>', sub: 'The level of specification you have in mind.', hint: 'Glazing size, railings, trims and lighting upgrade.',
    opts: [['standard', 'Standard', 'Durable, well-specified'], ['premium', 'Premium', 'Upgraded finishes & detailing'], ['luxury', 'Luxury', 'Bespoke materials, statement design']] },
  { id: 'style', label: 'Style', title: 'Architectural <em>style</em>', sub: 'How should it look and feel?', hint: 'Facade materials, colours, windows and roof change.',
    opts: [['modern', 'Modern minimal', 'Clean planes, white render, ribbon windows'], ['glass', 'Contemporary glass', 'Full-height glazing, slim frames'], ['classic', 'Classic / colonial', 'Columns, cornices, hipped roof'], ['tropical', 'Tropical', 'Timber, stone, deep overhangs'], ['indian', 'Indian traditional', 'Tiled roofs, chhajjas, warm ochre']] },
  { id: 'park', label: 'Parking', title: 'Parking', sub: 'How many cars should we plan for?', hint: 'Adds a carport, stilt parking or a basement ramp.',
    opts: [['none', 'None', 'No dedicated parking'], ['cov', '1–2 cars, covered', 'Carport in the front setback'], ['three', '3+ cars', 'Stilt or multi-bay parking'], ['base', 'Basement', 'Ramp down to basement parking']] },
  { id: 'extras', label: 'Extras', kind: 'multi', title: 'Anything <em>extra?</em>', sub: 'Select all that apply — or skip.', hint: 'Each extra appears on the model.',
    opts: [['pool', 'Swimming pool', ''], ['garden', 'Garden & landscaping', ''], ['terrace', 'Terrace garden', ''], ['lift', 'Home lift', ''], ['solar', 'Solar panels', ''], ['rwh', 'Rainwater harvesting', ''], ['theatre', 'Home theatre', ''], ['servant', 'Servant quarters', ''], ['wall', 'Boundary wall & gate', '']] },
  { id: 'plan', label: 'Timeline & budget', kind: 'plan', title: 'Timeline & <em>budget</em>', sub: 'Ranges only — this simply helps us prepare.',
    groups: [['timeline', 'When would you like to start?', [['t3', 'Within 3 months'], ['t6', '3–6 months'], ['t12', '6–12 months'], ['t0', 'Just exploring']]],
             ['budget', 'Approximate budget range', [['b1', 'Under ₹1 Cr'], ['b3', '₹1 – 3 Cr'], ['b10', '₹3 – 10 Cr'], ['b10p', '₹10 Cr +'], ['bx', 'Prefer to discuss']]]] },
  { id: 'contact', label: 'Contact', kind: 'contact', title: 'How should we <em>reach you?</em>', sub: 'Nothing is sent from this page — your details only prefill your brief.' },
];
// design variants per building type: [id, name, description, suggested style]
const VARIANTS = {
  villa: [['cantilever', 'Cantilever Modern', 'Floating volumes over a glass pavilion', 'modern'], ['courtyard', 'Courtyard Tropical', 'Low wings wrapped around a planted court', 'tropical'], ['palladian', 'Classic Palladian', 'Symmetry, a columned portico and pediment', 'classic']],
  apartment: [['tower', 'Glass Tower', 'A slender tower on a glazed podium', 'glass'], ['terraced', 'Terraced Green', 'Stepped floors with planted terraces', 'modern'], ['deco', 'Art Deco', 'Vertical fins and a stepped crown', 'classic']],
  commercial: [['podium', 'Podium & Tower', 'Retail podium with an offset tower', 'glass'], ['campus', 'Low-rise Campus', 'Twin blocks linked by a glass atrium', 'modern'], ['twist', 'Sculpted Twist', 'Floor plates that rotate as they rise', 'glass']],
  row: [['gabled', 'Gabled Terrace', 'Street-facing gables, front porches', 'indian'], ['staggered', 'Staggered Modern', 'Alternating heights and depths', 'modern'], ['sawtooth', 'Sawtooth Mews', 'Mono-pitch roofs and front courts', 'tropical']],
  farm: [['ranch', 'Long Ranch', 'Long and low with a deep verandah', 'tropical'], ['barn', 'Modern Barn', 'Twin timber barns with glazed gables', 'modern'], ['hacienda', 'Hacienda Courtyard', 'Tiled wings around a fountain court', 'indian']],
  unsure: [['compact', 'Compact', 'One efficient, simple volume', 'modern'], ['spread', 'Spread Out', 'Low, wide and garden-facing', 'tropical'], ['stacked', 'Stacked', 'Offset volumes with more height', 'glass']],
};
const variantsOf = t => VARIANTS[t] || [];
const variantRow = (st = S) => variantsOf(st.type).find(v => v[0] === st.variant) || null;
const LIGHTS = [['day', 'Day'], ['golden', 'Golden hour'], ['night', 'Night']];
const TIMES = [['morning', 'Morning'], ['afternoon', 'Afternoon'], ['evening', 'Evening'], ['any', 'Any time']];
const QI = Object.fromEntries(Q.map((q, i) => [q.id, i]));
const optLabel = (id, v) => { const q = Q[QI[id]]; const o = q && q.opts && q.opts.find(o => o[0] === v); return o ? o[1] : ''; };
const groupLabel = (g, v) => { const gr = Q[QI.plan].groups.find(x => x[0] === g); const o = gr[2].find(o => o[0] === v); return o ? o[1] : ''; };

/* ------------------------------------------------------------------ state */
const KEY = 'bnb-consult-v2';
let S = { extras: [], light: 'golden' }, step = -1;
try { const j = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (j && j.S) { S = Object.assign({ extras: [], light: 'golden' }, j.S); step = clamp(j.step | 0, -1, Q.length); } } catch (e) {}
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ S, step })); } catch (e) {} };

function plotFt(st = S) {
  const m = { '30x40': [30, 40], '30x50': [30, 50], '40x60': [40, 60], '60x80': [60, 80], 'acre': [200, 218] };
  if (st.plot === 'custom') return [clamp(+st.cw || 40, 15, 1500), clamp(+st.cd || 60, 15, 1500)];
  return m[st.plot] || [40, 60];
}
function plotLabel() {
  if (!S.plot) return '';
  if (S.plot === 'custom') { const [w, d] = plotFt(); return `${w} × ${d} ft (custom)`; }
  if (S.plot === 'acre') return '1 acre +';
  return optLabel('plot', S.plot) + ' ft';
}
function floorOpts() { return Q[QI.floors].opts.filter(o => o[0] !== 'hr' || S.type === 'apartment'); }
function valid(i) {
  const q = Q[i]; if (!q) return true;
  if (q.kind === 'multi') return true;
  if (q.kind === 'plan') return !!(S.timeline && S.budget);
  if (q.kind === 'contact') return contactErrors().length === 0;
  if (q.id === 'plot' && S.plot === 'custom') return +S.cw >= 15 && +S.cd >= 15;
  if (q.kind === 'variant') return !!variantRow();
  return !!S[q.id];
}
function contactErrors() {
  const e = [];
  if (!(S.name || '').trim()) e.push('name');
  if (!/^[+0-9 ()-]{8,}$/.test((S.phone || '').trim())) e.push('phone');
  if ((S.email || '').trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email.trim())) e.push('email');
  return e;
}
