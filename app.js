// v1781216436
const { useState, useCallback, useRef, useEffect } = React;
const h = React.createElement;

// ── THEME — exact values from reference screenshots ───────────
const C = {
  bg:      '#f2ede4',   // the exact warm-but-light cream from reference
  card:    '#ffffff',
  ecard:   '#faf7f2',   // emotion cards — very slightly off-white
  border:  '#e8e2d8',
  text:    '#28211a',   // dark warm brown
  muted:   '#9c9080',   // mid warm grey
  faint:   '#b5a99a',   // placeholder text
  accent:  '#b8924a',   // gold — eyebrows, dots, active
  navBg:   '#ffffff',
};

// ── WISDOM ────────────────────────────────────────────────────
const WISDOM = {
  angry:       {label:'angry',       source:'Bhagavad Gita 2.63', verse:'From anger comes delusion. From delusion, loss of memory. From loss of memory, the destruction of discrimination — and from that, one perishes.', question:'"What underneath this anger is asking to be seen?"', step:'Before anything else — one slow breath. Let that be enough for now.'},
  anxious:     {label:'anxious',     source:'Bhagavad Gita 2.23', verse:'What you truly are cannot be harmed. The soul is untouched by weapons, fire, water, or wind.', question:'"What is actually present right now — not what might be?"', step:'Rest in what is here. This moment does not require resolution.'},
  overthinking:{label:'overthinking',source:'Bhagavad Gita 2.47', verse:'Focus on the next right action. Release the outcome you cannot hold.', question:'"What is the one thing that actually needs my attention today?"', step:'Perhaps the mind needs less to carry, not more to solve.'},
  distracted:  {label:'distracted',  source:'Bhagavad Gita 6.26', verse:'Wherever the restless mind wanders, gently bring it back. Again and again, quietly return.', question:'"What would feel like presence, right now?"', step:'Return gently. Not once — as many times as needed.'},
  lonely:      {label:'lonely',      source:'Bhagavad Gita 9.29', verse:'I am equally present in all beings. Those who turn toward Me with devotion — they are in Me, and I am in them.', question:'"Is there someone whose quiet company I could invite today?"', step:'A small reaching-out. Without needing to explain the whole of it.'},
  unmotivated: {label:'unmotivated', source:'Bhagavad Gita 3.8',  verse:'Do what must be done. Action is better than inaction. Even the body cannot be maintained without movement.', question:'"What is the softest possible beginning I could make?"', step:'Even quiet effort has meaning. One small thing is enough.'},
  peaceful:    {label:'peaceful',    source:'Bhagavad Gita 6.27', verse:'Supreme happiness comes to the one whose mind is still, whose passions are quiet, who has become one with what is.', question:'"What brought me here — to this stillness?"', step:'You do not need to do anything with this feeling. Let it remain.'},
  grateful:    {label:'grateful',    source:'Bhagavad Gita 4.11', verse:'In whatever way people come to Me, I meet them there. The Divine meets you exactly where you are.', question:'"What made this feeling possible today?"', step:'Perhaps let someone know. Quietly. Without needing a reason.'},
};
const EMOTIONS = Object.entries(WISDOM).map(([id,w])=>({id, label:w.label}));

// ── DHARMA ────────────────────────────────────────────────────
const DHARMA = [
  {source:'Bhagavad Gita 2.47', sanskrit:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',        meaning:'"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."', reflection:'The effort is yours. The outcome belongs to the universe.'},
  {source:'Bhagavad Gita 18.66',sanskrit:'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',      meaning:'"Abandon all varieties of dharma and simply surrender to Me. I shall free you from all sinful reactions. Do not fear."', reflection:'True surrender is not weakness. It is the deepest form of trust.'},
  {source:'Bhagavad Gita 2.20', sanskrit:'न जायते म्रियते वा कदाचिन्।',                  meaning:'"The soul is never born nor dies. It is not slain when the body is slain."', reflection:'What you truly are is eternal. Only the body is temporary.'},
  {source:'Bhagavad Gita 6.5',  sanskrit:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',        meaning:'"Lift yourself up by your own self; do not let yourself fall."', reflection:'You are both the one who struggles and the one who can offer a kinder hand.'},
  {source:'Bhagavad Gita 14.25',sanskrit:'समः शत्रौ च मित्रे च तथा मानापमानयोः।',       meaning:'"One equal to friend and foe, in honour and dishonour — such a person has gone beyond."', reflection:'Equanimity in all situations is the highest form of spiritual maturity.'},
  {source:'Bhagavad Gita 2.62', sanskrit:'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।',      meaning:'"Contemplating the objects of the senses, one develops attachment. From attachment comes desire, and from desire, suffering."', reflection:'What you dwell on, you become. Guard your attention.'},
  {source:'Bhagavad Gita 16.2', sanskrit:'अहिंसा सत्यमक्रोधस्त्यागः शान्तिरपैशुनम्।',  meaning:'"Non-violence, truthfulness, freedom from anger, renunciation, peacefulness — these divine qualities are born within you."', reflection:'You do not need to be perfect. Simply move toward these, one day at a time.'},
  {source:'Bhagavad Gita 6.27', sanskrit:'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।',    meaning:'"Supreme happiness comes to the yogi whose mind is peaceful, whose passions are quieted."', reflection:'Peace is not something you find. It is something you return to.'},
];

const DEFAULT_MANTRAS = ['Radhe','Hare Krishna','Om Namah Shivaya','Ram','Mahadev'];

function getDayVerse(){
  const d=new Date(), n=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  return DHARMA[n%DHARMA.length];
}

// ── PERSISTENCE ───────────────────────────────────────────────
const SKEY='prashama_v1';
const DKEY='prashama_draft_v1';  // separate key for reflection drafts (high-write)
const NKEY='prashama_nav_v1';    // separate key for last tab

// ── SAFE LOAD ─────────────────────────────────────────────────
function load(){
  try{
    const raw=localStorage.getItem(SKEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    // sanity check — must be an object with at least a lastDate
    if(typeof parsed!=='object'||parsed===null)return null;
    return parsed;
  }catch{return null;}
}

// ── DEBOUNCED PERSIST ─────────────────────────────────────────
// During rapid tapping, we batch writes so localStorage isn't hit 108x per mala.
// Non-TAP actions (settings, reflection save) write immediately.
let _persistTimer=null;
let _persistState=null;
function persist(s,immediate=false){
  _persistState=s;
  if(immediate){
    clearTimeout(_persistTimer);
    _persistTimer=null;
    try{localStorage.setItem(SKEY,JSON.stringify(s));}catch{}
    return;
  }
  if(!_persistTimer){
    _persistTimer=setTimeout(()=>{
      _persistTimer=null;
      if(_persistState){
        try{localStorage.setItem(SKEY,JSON.stringify(_persistState));}catch{}
      }
    },400);
  }
}

// ── DRAFT PERSISTENCE ─────────────────────────────────────────
// High-frequency text input — kept separate from main state to avoid
// polluting the reducer write cycle.
function saveDraft(d){try{localStorage.setItem(DKEY,JSON.stringify(d));}catch{}}
function loadDraft(){try{const r=localStorage.getItem(DKEY);return r?JSON.parse(r):{g:'',p:'',l:''};}catch{return{g:'',p:'',l:''};}}
function clearDraft(){try{localStorage.removeItem(DKEY);}catch{}}

// ── NAV PERSISTENCE ───────────────────────────────────────────
function saveNav(tab){try{localStorage.setItem(NKEY,tab);}catch{}}
function loadNav(){try{return localStorage.getItem(NKEY)||'jap';}catch{return'jap';}}

// ── DATE HELPERS ──────────────────────────────────────────────
function todayStr(){return new Date().toISOString().slice(0,10);}
function wasYday(ds){
  if(!ds)return false;
  const y=new Date();
  y.setDate(y.getDate()-1);
  return ds===y.toISOString().slice(0,10);
}

// ── STATE INIT ────────────────────────────────────────────────
// Runs once synchronously before first render — no flicker.
function initState(){
  const s=load(), t=todayStr(), nd=s&&s.lastDate!==t;
  const base={
    count:0,malas:0,lastDate:t,totalCount:0,streak:0,
    reflections:[],lastGuidance:null,
    mantra:'Radhe',mantras:[...DEFAULT_MANTRAS],
    dark:false,beadSound:true,haptic:true
  };
  if(!s)return base;

  // Daily rollover: reset count/malas, recalculate streak
  // Streak only increments if yesterday had meaningful practice (count>0 OR malas>0)
  const hadPractice=nd?(s.count>0||s.malas>0):true;
  const newStreak=nd
    ?(wasYday(s.lastDate)&&hadPractice?(s.streak||0)+1:0)
    :(s.streak||0);

  return{
    ...base,...s,
    lastDate:t,
    count:nd?0:Math.min(s.count||0,108),
    malas:nd?0:(s.malas||0),
    totalCount:Math.max(s.totalCount||0,0),
    streak:newStreak,
    mantras:Array.isArray(s.mantras)&&s.mantras.length?s.mantras:[...DEFAULT_MANTRAS],
    reflections:Array.isArray(s.reflections)?s.reflections.slice(-90):[],
    dark:typeof s.dark==='boolean'?s.dark:false,
    beadSound:typeof s.beadSound==='boolean'?s.beadSound:true,
    haptic:typeof s.haptic==='boolean'?s.haptic:true,
  };
}
function reducer(state,action){
  let n;
  switch(action.type){
    case'TAP':        if(state.count>=108)return state; n={...state,count:state.count+1,totalCount:state.totalCount+1}; persist(n,false); return n;
    case'NEW_MALA':   n={...state,count:0,malas:state.malas+1}; break;
    case'RESET_DAY':  n={...state,count:0,malas:0}; break;
    case'SET_MANTRA': n={...state,mantra:action.v}; break;
    case'ADD_MANTRA': if(!action.v.trim()||state.mantras.includes(action.v.trim()))return state;
                      n={...state,mantras:[...state.mantras,action.v.trim()]}; break;
    case'TOGGLE_DARK':n={...state,dark:!state.dark}; break;
    case'SET_BEAD':   n={...state,beadSound:action.v}; break;
    case'SET_HAPTIC': n={...state,haptic:action.v}; break;
    case'SET_GUIDANCE':n={...state,lastGuidance:action.p}; break;
    case'SAVE_REFL':  n={...state,reflections:[...(state.reflections||[]),action.p].slice(-90)}; break;
    default: return state;
  }
  persist(n,true); return n;
}

// ── HAPTICS ───────────────────────────────────────────────────
// Light, native-feeling vibration. No-ops on desktop/unsupported devices.
// ── COMPACT NUMBER FORMAT ─────────────────────────────────────
// 11958 -> "11.9K", 120000 -> "120K", 950 -> "950"
function compactNum(n){
  if(n>=1000000) return (n/1000000).toFixed(n%1000000===0?0:1)+'M';
  if(n>=10000)   return Math.round(n/1000)+'K';
  if(n>=1000)    return (n/1000).toFixed(1)+'K';
  return String(n);
}

function haptic(kind){
  try{
    if(typeof navigator==='undefined'||!navigator.vibrate) return;
    if(kind==='light') navigator.vibrate(8);
    else if(kind==='select') navigator.vibrate(4);
    else if(kind==='success') navigator.vibrate([6,30,10]);
  }catch(e){}
}

// ── BEAD TAP SOUND ────────────────────────────────────────────
// Tiny synthesized wooden "click" — no audio file needed.
// Extremely low volume, short decay, mobile-only (gestures unlock AudioContext).
let _beadCtx=null;
function playBeadTap(){
  try{
    if(typeof window==='undefined') return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    if(!_beadCtx) _beadCtx=new AC();
    if(_beadCtx.state==='suspended') _beadCtx.resume();

    const ctx=_beadCtx;
    const now=ctx.currentTime;

    const osc=ctx.createOscillator();
    osc.type='sine';
    osc.frequency.setValueAtTime(420,now);
    osc.frequency.exponentialRampToValueAtTime(180,now+0.05);

    const gain=ctx.createGain();
    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.exponentialRampToValueAtTime(0.045,now+0.006); // very low volume
    gain.gain.exponentialRampToValueAtTime(0.0001,now+0.07); // quick soft decay

    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now+0.08);
  }catch(e){}
}

// ── CSS ───────────────────────────────────────────────────────
// Every value derived from careful reading of the reference screenshots.
// No interpretation — pure extraction.
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;}
body{font-family:'Inter',sans-serif;font-weight:300;-webkit-tap-highlight-color:transparent;overscroll-behavior:none;color:#28211a;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}

/* ── APP SHELL ── */
.app{width:100%;max-width:520px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:radial-gradient(ellipse 80% 60% at 50% 0%,#f0e8d8 0%,#f5f1e8 55%,#f5f1e8 100%);color:#1a1612;position:relative;}
.app.dk{background:radial-gradient(ellipse 80% 50% at 50% 0%,#1e170e 0%,#0f0b08 50%,#0f0b08 100%);color:#f3eee7;}
.app.dk .ttl,.app.dk .ttl-xl,.app.dk .ttl-em{color:#f3eee7;}
.app.dk .sub{color:rgba(243,238,231,.58);}
.app.dk .gverse,.app.dk .gq,.app.dk .dmt{color:rgba(243,238,231,.9);}
.app.dk .gstep,.app.dk .drefl{color:rgba(243,238,231,.82);}
.app.dk .glbl,.app.dk .drlbl,.app.dk .rflbl,.app.dk .gsrc-t,.app.dk .dsrc{color:#caa56a;opacity:.95;}


/* ── PAGE ── */
.pg{padding:calc(20px + env(safe-area-inset-top, 0px)) 16px 90px;animation:fu .32s cubic-bezier(.4,0,.2,1);}
.today-page{padding-top:52px;}
.reflection-page{padding-top:48px;}
.jap-page{padding-bottom:72px;}
/* Wrapper for vertically centering the main content block below a fixed header */
.pg-center{display:flex;flex-direction:column;gap:22px;margin-top:20px;}
@keyframes fu{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes cardIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInL{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideInR{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
.pg.slide-l{animation:slideInL .28s cubic-bezier(.4,0,.2,1)!important;}
.pg.slide-r{animation:slideInR .28s cubic-bezier(.4,0,.2,1)!important;}

/* ── ONBOARDING ──────────────────────────────────────────────── */
@keyframes obIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes obOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-6px)}}
.ob-wrap{
  position:fixed;inset:0;z-index:200;
  background:#f5f1e8;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:48px 32px 64px;
  transition:opacity .55s ease;
}
.ob-wrap.leaving{opacity:0;pointer-events:none;}
.ob-slide{
  display:flex;flex-direction:column;align-items:center;gap:0;
  text-align:center;animation:obIn .45s cubic-bezier(.4,0,.2,1) both;
}
.ob-line{
  font-family:'Fraunces',serif;
  font-size:26px;font-weight:400;line-height:1.45;
  color:#3a3128;letter-spacing:-.01em;
  font-variation-settings:'opsz' 30,'SOFT' 35;
  margin-bottom:14px;
}
.ob-sub{
  font-size:13px;font-weight:400;color:#9c9080;
  line-height:1.7;letter-spacing:.01em;
  margin-bottom:0;
}
.ob-dot-row{
  display:flex;gap:7px;margin-top:52px;
}
.ob-dot{
  width:5px;height:5px;border-radius:50%;
  background:#d5cdc0;transition:background .3s ease;
}
.ob-dot.on{background:#b8924a;}
.ob-btn{
  margin-top:52px;
  background:none;border:none;cursor:pointer;
  font-family:'Fraunces',serif;font-size:14px;font-weight:400;
  color:#9c9080;letter-spacing:.06em;
  padding:10px 0;
  font-variation-settings:'opsz' 16,'SOFT' 30;
  transition:color .22s ease;
}
.ob-btn:hover,.ob-btn:focus{color:#3a3128;}
.ob-begin{
  margin-top:52px;
  background:#3a3128;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:400;
  color:#f3eee7;letter-spacing:.14em;text-transform:uppercase;
  padding:14px 36px;border-radius:100px;
  transition:background .28s ease,opacity .28s ease;
  opacity:.92;
}
.ob-begin:hover,.ob-begin:focus{opacity:1;}
.ob-skip{
  position:absolute;bottom:40px;
  background:none;border:none;cursor:pointer;
  font-family:'Inter',sans-serif;font-size:11px;font-weight:300;
  color:#b5a99a;letter-spacing:.08em;
  padding:8px;transition:color .2s;
}
.ob-skip:hover{color:#9c9080;}
.ob-dot-wrap{display:flex;flex-direction:column;align-items:center;}


/* ── EYEBROW — short gold rule + spaced caps ── */
.eb{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
.eb-r{width:20px;height:1px;background:#b8924a;flex-shrink:0;}
.eb-t{font-family:'Inter',sans-serif;font-size:10.5px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#b8924a;}
/* centered eyebrow — rules on both sides */
.eb-c{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;}
.eb-c .eb-r{width:26px;}

/* ── HEADINGS ── */
/* Main page titles: Cormorant 300, ~32px — matches ref */
.ttl{font-family:'Fraunces',serif;font-size:32px;font-weight:500;line-height:1.2;letter-spacing:-.005em;margin-bottom:8px;color:#3a3128;font-variation-settings:'opsz' 34,'SOFT' 35;}
.ttl-xl{font-family:'Fraunces',serif;font-size:36px;font-weight:500;line-height:1.18;letter-spacing:-.005em;margin-bottom:8px;color:#3a3128;font-variation-settings:'opsz' 38,'SOFT' 35;}
.ttl-em{font-family:'Fraunces',serif;font-size:50px;font-weight:500;line-height:1.1;letter-spacing:-.005em;text-align:center;margin-bottom:24px;color:#3a3128;font-variation-settings:'opsz' 60,'SOFT' 35;}
.sub{font-size:13.5px;font-weight:400;color:#9c9080;line-height:1.65;margin-bottom:22px;letter-spacing:.003em;}

/* ── STAT PILLS ── */
.pills{display:flex;gap:10px;width:100%;margin-top:46px;margin-bottom:34px;}
.pill{flex:1;background:#efece4;border-radius:100px;padding:13px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;}
.pill-warm{background:#f0e8d4;}
.pill-warm .pv{color:#b8924a;}
.app.dk .pill{background:#272219;}
.pv{font-family:'Fraunces',serif;font-size:27px;font-weight:600;line-height:1;color:#1a1612;font-variation-settings:'opsz' 28,'SOFT' 35;font-variant-numeric:tabular-nums;}
.app.dk .pv{color:#e4ddd4;}
.pl{font-size:9px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9c9080;}

/* ── RING ── */
.ring{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-top:26px;margin-bottom:0;}
/* Center-out ripple: starts as a small dot at the center, expands outward */
.ring-pulse{
  position:absolute; top:50%; left:50%;
  width:30px; height:30px;
  margin:-15px 0 0 -15px;
  border-radius:50%;
  background:radial-gradient(circle, rgba(184,146,74,.18) 0%, rgba(184,146,74,.05) 50%, rgba(184,146,74,0) 80%);
  opacity:0; pointer-events:none;
}
.ring-pulse.go{animation:rp 1.1s cubic-bezier(0,0,.15,1) forwards;}
@keyframes rp{
  0%{opacity:.55; transform:scale(.3);}
  100%{opacity:0; transform:scale(11);}
}

.plus-one{
  position:absolute; top:40%; left:50%;
  transform:translate(-50%,-50%);
  font-family:'Fraunces',serif;
  font-size:18px; font-weight:400;
  color:rgba(184,146,74,.8);
  pointer-events:none;
  animation:floatUp .85s cubic-bezier(0,0,.2,1) forwards;
  z-index:5;
  font-variation-settings:'opsz' 20,'SOFT' 35;
}
@keyframes floatUp{
  0%{opacity:0; transform:translate(-50%,-50%);}
  18%{opacity:.8;}
  100%{opacity:0; transform:translate(-50%,-120%);}
}

/* Wave/ripple between the two rings on tap */
/* Soft ring ripple expanding from center toward the ring edge */
.ring-wave{
  position:absolute; top:50%; left:50%;
  width:20px; height:20px;
  margin:-10px 0 0 -10px;
  border-radius:50%;
  border:1px solid rgba(184,146,74,.36);
  opacity:0; pointer-events:none;
}
.ring-wave.go{ animation:wave 1.3s cubic-bezier(0,0,.1,1) forwards; }
@keyframes wave{
  0%{opacity:.4; transform:scale(1);}
  100%{opacity:0; transform:scale(17);}
}
.prog-arc.catch{animation:arcCatch .6s cubic-bezier(0,0,.2,1);}
@keyframes arcCatch{
  0%{stroke-width:2; filter:drop-shadow(0 0 0 rgba(184,146,74,0));}
  30%{stroke-width:2.8; filter:drop-shadow(0 0 3px rgba(184,146,74,.38));}
  100%{stroke-width:2; filter:drop-shadow(0 0 0 rgba(184,146,74,0));}
}
.outer-ring.catch{animation:outerCatch .65s cubic-bezier(0,0,.2,1);}
@keyframes outerCatch{
  0%{opacity:1; filter:drop-shadow(0 0 0 rgba(184,146,74,0));}
  35%{opacity:.9; filter:drop-shadow(0 0 3px rgba(184,146,74,.28));}
  100%{opacity:1; filter:drop-shadow(0 0 0 rgba(184,146,74,0));}
}

/* ── TOP-RIGHT ICON BUTTONS ── */
.hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0;}
.hdr-btns{display:flex;gap:7px;padding-top:2px;}
.ibtn{width:34px;height:34px;border-radius:100px;border:none;background:rgba(0,0,0,.04);color:#b5a89a;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.ibtn svg{width:15px;height:15px;}

/* ── SETTINGS SHEET ── */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.sh{width:100%;max-width:430px;background:#fdfcf9;border-radius:22px 22px 0 0;padding:18px 18px 38px;max-height:80vh;overflow-y:auto;box-shadow:0 -4px 32px rgba(30,20,10,.08);}
.app.dk .sh{background:#272219;}
.sh-drag{width:32px;height:3px;border-radius:2px;background:#ddd8ce;margin:0 auto 16px;}
.mrow{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:11px;margin-bottom:7px;cursor:pointer;font-family:'Fraunces',serif;font-size:17px;font-weight:400;background:#f3ede2;border:1.5px solid transparent;color:#3a3128;font-variation-settings:'opsz' 18,'SOFT' 35;}
.app.dk .mrow{background:#312b25;color:#e4ddd4;}
.mrow.on{border-color:#b8924a;}
.madd{display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 14px;border-radius:11px;margin-bottom:18px;cursor:pointer;font-size:10px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9c9080;background:#f5f0e8;}
.app.dk .madd{background:#312b25;}
.trow{display:flex;align-items:center;justify-content:space-between;padding:13px 2px;border-bottom:1px solid #f0ebe2;font-size:13px;font-weight:300;}
.app.dk .trow{border-color:#38322a;}
.trow:last-child{border-bottom:none;}
.trow-l{display:flex;align-items:center;gap:8px;}
.tog{width:40px;height:23px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .22s ease;flex-shrink:0;}
.tog.off{background:#cec9c0;}
.tog.on{background:#b8924a;}
.tog-k{position:absolute;top:2.5px;left:2.5px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .22s cubic-bezier(.4,0,.2,1);box-shadow:0 1px 2px rgba(0,0,0,.14);}
.tog.on .tog-k{transform:translateX(17px);}
.sh-note{font-size:11px;color:#9c9080;margin-top:16px;line-height:1.6;padding:0 2px;}

/* ── EMOTION GRID ── */
/* Reference: tall cards ~130px, dot top-left, label bottom-left serif */
.egrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.ecard{background:#faf7f2;border-radius:15px;padding:14px 14px 15px;min-height:128px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;border:1.5px solid transparent;transition:border-color .25s ease,background .25s ease;box-shadow:0 2px 8px rgba(30,20,10,.05);}
.app.dk .ecard{background:#272219;}
.app.dk .elbl{color:rgba(243,238,231,.92);}
.app.dk .ecard.on{border-color:#caa56a;background:#2e2419;}
.app.dk .ecard.on .elbl{color:#f3eee7;}
.ecard.on{border-color:#b8924a;}
.edot{width:6px;height:6px;border-radius:50%;background:#b8924a;}
.elbl{font-family:'Fraunces',serif;font-size:17px;font-weight:400;line-height:1.25;margin-top:auto;padding-top:18px;letter-spacing:0;color:#3a3128;font-variation-settings:'opsz' 18,'SOFT' 35;}

/* ── GUIDANCE RESULT ── */
/* White card, very roomy, verse centered Cormorant */
.gcard{background:#fdfcf9;border-radius:20px;padding:34px 24px 30px;box-shadow:0 2px 8px rgba(30,20,10,.05),0 8px 28px rgba(30,20,10,.04);margin-bottom:0;width:100%;animation:cardIn .36s cubic-bezier(.4,0,.2,1) .1s both;}
.app.dk .gcard{background:rgba(28,20,14,.92);border:1px solid rgba(255,255,255,.03);box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.02);}
.gsrc{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:28px;}
.gsrc-l{width:26px;height:1px;background:#b8924a;flex-shrink:0;}
.gsrc-t{font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:#b8924a;}
.gverse{font-family:'Fraunces',serif;font-size:21px;font-weight:400;line-height:1.72;text-align:center;margin-bottom:22px;letter-spacing:.005em;color:#3a3128;font-variation-settings:'opsz' 28,'SOFT' 35;}
.gdot{display:flex;align-items:center;justify-content:center;gap:10px;margin:26px 0;}
.gdot-line{width:32px;height:1px;background:#ede8df;}
.gdot-mark{font-size:13px;color:#c4a267;line-height:1;}
.glbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9c9080;text-align:center;margin-bottom:14px;}
.gq{font-family:'Fraunces',serif;font-size:19px;font-style:italic;font-weight:400;line-height:1.8;text-align:center;color:#3a3128;font-variation-settings:'opsz' 24,'SOFT' 35;}
.gstep{font-size:15px;font-weight:400;line-height:1.82;text-align:center;color:#28211a;letter-spacing:.005em;}
.app.dk .gstep{color:#ccc6bc;}
.gaff{font-family:'Fraunces',serif;font-size:12.5px;font-style:italic;font-weight:500;color:#9c9080;text-align:center;line-height:1.85;margin-top:14px;margin-bottom:0;white-space:pre-line;letter-spacing:0;font-variation-settings:'opsz' 14,'SOFT' 30;}
.back-btn{
  background:none;border:none;cursor:pointer;
  display:inline-flex;align-items:center;gap:5px;
  padding:6px 10px 6px 2px;margin-bottom:12px;margin-left:-2px;
  color:#b5a89a;
  font-family:'Inter',sans-serif;font-size:12px;font-weight:300;
  letter-spacing:.04em;
  transition:color .22s ease,opacity .22s ease;
  border-radius:8px;
  -webkit-tap-highlight-color:transparent;
  opacity:.85;
}
.back-btn:hover,.back-btn:active{color:#3a3128;opacity:1;}
.back-btn svg{width:14px;height:14px;flex-shrink:0;}

/* ── DHARMA CARD ── */
.dcard{background:#fdfcf9;border-radius:20px;padding:40px 28px 42px;box-shadow:0 2px 8px rgba(30,20,10,.05),0 8px 28px rgba(30,20,10,.04);margin-bottom:28px;width:100%;animation:cardIn .36s cubic-bezier(.4,0,.2,1) .08s both;}
.app.dk .dcard{background:rgba(28,20,14,.92);border:1px solid rgba(255,255,255,.03);box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.02);}
.dsrc{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#b8924a;margin-bottom:18px;}
.dsrc::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#b8924a;flex-shrink:0;}
.dsk{font-family:'Fraunces',serif;font-size:21px;font-weight:300;line-height:1.72;margin-bottom:18px;color:#3a3128;font-variation-settings:'opsz' 24,'SOFT' 35;}
.ddiv{height:1px;background:#ede8df;margin:18px 0;}
.app.dk .ddiv{background:rgba(214,185,120,.16);}
.dmt{font-family:'Fraunces',serif;font-size:15.5px;font-style:italic;font-weight:400;line-height:1.82;margin-top:22px;margin-bottom:22px;color:#3a3128;font-variation-settings:'opsz' 18,'SOFT' 35;}
.drlbl{font-size:10px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9c9080;margin-bottom:8px;margin-top:26px;}
.drefl{font-size:13.5px;font-weight:300;line-height:1.75;margin-bottom:22px;letter-spacing:.005em;}
.dacts{display:flex;align-items:center;gap:8px;margin-top:34px;}
.dlisten{background:#28211a;color:#fff;border:none;border-radius:100px;padding:9px 16px;font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;}
.app.dk .dlisten{background:#e4ddd4;color:#1a1612;}
.dico{width:36px;height:36px;border-radius:100px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;border:1px solid #e8e2d8;}
.app.dk .dico{background:#2e2820;border-color:#38322a;}
/* Reminder card */
.remcard{background:#fdfcf9;border-radius:18px;padding:22px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 2px 8px rgba(30,20,10,.05),0 8px 28px rgba(30,20,10,.03);animation:cardIn .36s cubic-bezier(.4,0,.2,1) .14s both;}
.app.dk .remcard{background:#272219;}
.remico{width:34px;height:34px;border-radius:100px;background:#f6f3ec;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.app.dk .remico{background:#312b25;}

/* ── REFLECTION CARD ── */
/* Matches ref exactly: white card, underline inputs, Cormorant italic placeholder */
.rfcard{background:#fdfcf9;border-radius:20px;padding:40px 28px 42px;box-shadow:0 2px 8px rgba(30,20,10,.05),0 8px 28px rgba(30,20,10,.04);margin-bottom:42px;width:100%;animation:cardIn .36s cubic-bezier(.4,0,.2,1) .08s both;}
.app.dk .rfcard{background:rgba(28,20,14,.92);border:1px solid rgba(255,255,255,.03);box-shadow:0 10px 30px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.02);}
.rflbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9c9080;margin-bottom:6px;margin-top:8px;display:block;}
.rfin{width:100%;background:none;border:none;border-bottom:1px solid #e8e2d8;padding:3px 0 7px;font-family:'Fraunces',serif;font-size:15px;font-style:italic;font-weight:400;color:#3a3128;outline:none;transition:border-color .22s ease;display:block;margin-bottom:34px;font-variation-settings:'opsz' 16,'SOFT' 35;resize:none;overflow:hidden;line-height:1.6;word-wrap:break-word;-webkit-appearance:none;}
.rfin::placeholder{color:#b5a99a;font-style:italic;}
.rfin:focus{border-bottom-color:#b8924a;}
.app.dk .rfin{color:#e4ddd4;border-bottom-color:#38322a;}
.app.dk .rfin::placeholder{color:#5c554e;}
/* Save button: grey until active */
.savebtn{width:100%;padding:12px;border-radius:100px;border:none;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;cursor:pointer;transition:background .28s ease,opacity .28s ease;background:#c8c2b8;color:#fff;margin-top:2px;}
.savebtn.on{background:#b8924a;}
/* Past reflections */
.past-hdr{display:flex;align-items:center;gap:8px;margin:40px 0 14px;}
.past-line{flex:1;height:1px;background:#e8e2d8;}
.app.dk .past-line{background:rgba(214,185,120,.16);}
.past-lbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9c9080;}
.past-empty{font-family:'Fraunces',serif;font-size:14px;font-style:italic;font-weight:400;color:#9c9080;line-height:1.7;font-variation-settings:'opsz' 16,'SOFT' 30;}

/* ── CONTINUE BUTTON ── */
.cont-btn{width:100%;padding:13px;border-radius:100px;border:none;background:#b8924a;color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;cursor:pointer;}

/* ── BOTTOM NAV — floating pill exactly as reference ── */
/* Reference: white rounded pill, shadow, no active bg — only color change */
.nav-wrap{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:calc(100% - 28px);max-width:492px;z-index:100;}
.nav{background:#fdfcf9;border-radius:100px;display:flex;padding:4px;box-shadow:0 4px 28px rgba(30,20,10,.09),0 1px 4px rgba(30,20,10,.05);}
.app.dk .nav{background:#1e1b17;}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 6px;background:none;border:none;cursor:pointer;color:#9c9080;font-family:'Inter',sans-serif;font-size:10px;font-weight:300;border-radius:100px;transition:color .22s ease;letter-spacing:.01em;}
.nb.on{color:#b8924a;}
.nb svg{width:17px;height:17px;}
`;

// ── ICONS ─────────────────────────────────────────────────────
function SvgJap(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M12 2l1.8 5.5H20l-4.8 3.5 1.8 5.5L12 13l-5 3.5 1.8-5.5L4 7.5h6.2z'}));}
function SvgGuidance(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'10'}),h('path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'}));}
function SvgToday(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'4'}),h('path',{d:'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'}));}
function SvgReflect(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M12 20h9'}),h('path',{d:'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z'}));}
function SvgSettings(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'3'}),h('path',{d:'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'}));}
function SvgSun(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'4'}),h('path',{d:'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'}));}
function SvgPlay(){return h('svg',{viewBox:'0 0 24 24',fill:'currentColor',width:'11',height:'11'},h('polygon',{points:'5,3 19,12 5,21'}));}
function SvgBkm(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('path',{d:'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'}));}
function SvgShr(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('circle',{cx:'18',cy:'5',r:'3'}),h('circle',{cx:'6',cy:'12',r:'3'}),h('circle',{cx:'18',cy:'19',r:'3'}),h('path',{d:'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98'}));}
function SvgRst(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'12',height:'12'},h('path',{d:'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}),h('path',{d:'M3 3v5h5'}));}
function SvgChk(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'#b8924a',strokeWidth:'2',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('polyline',{points:'20 6 9 17 4 12'}));}
function SvgPls(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',width:'12',height:'12'},h('line',{x1:'12',y1:'5',x2:'12',y2:'19'}),h('line',{x1:'5',y1:'12',x2:'19',y2:'12'}));}
function SvgSnd(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('polygon',{points:'11 5 6 9 2 9 2 15 6 15 11 19 11 5'}),h('path',{d:'M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07'}));}
function SvgVib(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('path',{d:'M8 19H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3'}),h('path',{d:'M16 5h3c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3'}),h('rect',{x:'8',y:'2',width:'8',height:'20',rx:'2'}));}
function SvgMoon(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('path',{d:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'}));}

// ── SMALL COMPONENTS ──────────────────────────────────────────
function Eb({t,center}){
  if(center) return h('div',{className:'eb-c'},h('div',{className:'eb-r'}),h('span',{className:'eb-t'},t),h('div',{className:'eb-r'}));
  return h('div',{className:'eb'},h('div',{className:'eb-r'}),h('span',{className:'eb-t'},t));
}

function Tog({on,set}){
  return h('button',{className:`tog ${on?'on':'off'}`,onClick:()=>set(!on)},h('div',{className:'tog-k'}));
}

// ── SETTINGS SHEET ────────────────────────────────────────────
function SettingsSheet({state,dispatch,close}){
  const [adding,setAdding]=useState(false);
  const [val,setVal]=useState('');

  function add(){
    const v=val.trim();
    if(!v)return;
    dispatch({type:'ADD_MANTRA',v});
    setVal(''); setAdding(false);
  }

  return h('div',{className:'ov',onClick:e=>{if(e.target===e.currentTarget)close();}},
    h('div',{className:'sh'},
      h('div',{className:'sh-drag'}),
      state.mantras.map(m=>
        h('div',{key:m,className:`mrow${state.mantra===m?' on':''}`,onClick:()=>dispatch({type:'SET_MANTRA',v:m})},
          m, state.mantra===m&&h(SvgChk)
        )
      ),
      adding
        ? h('div',{style:{marginBottom:14}},
            h('input',{autoFocus:true,value:val,
              onChange:e=>setVal(e.target.value),
              onKeyDown:e=>{if(e.key==='Enter')add();if(e.key==='Escape'){setAdding(false);setVal('');}},
              placeholder:'Type your mantra…',
              style:{width:'100%',background:'none',border:'none',borderBottom:'1px solid #e8e2d8',padding:'7px 0',fontFamily:'Fraunces,serif',fontSize:'17px',fontWeight:400,outline:'none',color:'inherit',marginBottom:8}}),
            h('div',{style:{display:'flex',gap:7}},
              h('button',{onClick:add,style:{flex:1,padding:'9px',borderRadius:'100px',border:'none',background:'#b8924a',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:'12px',cursor:'pointer'}},'Add'),
              h('button',{onClick:()=>{setAdding(false);setVal('');},style:{flex:1,padding:'9px',borderRadius:'100px',border:'1px solid #e8e2d8',background:'none',fontFamily:'Inter,sans-serif',fontSize:'12px',cursor:'pointer',color:'#9c9080'}},'Cancel')
            )
          )
        : h('div',{className:'madd',onClick:()=>setAdding(true)},h(SvgPls),' ADD YOUR MANTRA'),
      h('div',null,
        h('div',{className:'trow'},h('div',{className:'trow-l'},h(SvgSnd),' Bead click sound'),h(Tog,{on:state.beadSound,set:v=>dispatch({type:'SET_BEAD',v})})),
        h('div',{className:'trow'},h('div',{className:'trow-l'},h(SvgVib),' Haptic feedback'),h(Tog,{on:state.haptic,set:v=>dispatch({type:'SET_HAPTIC',v})})),
        h('div',{className:'trow'},h('div',{className:'trow-l'},h(SvgMoon),' Dark mode'),h(Tog,{on:state.dark,set:()=>dispatch({type:'TOGGLE_DARK'})}))
      ),
      h('p',{className:'sh-note'},'Volume buttons count inside the mobile app. On web, Space or arrow keys also count.')
    )
  );
}

// ── JAP PAGE ──────────────────────────────────────────────────
function JapPage({state,dispatch}){
  const {count,malas,streak,mantra,dark}=state;
  const [sheet,setSheet]=useState(false);
  const pRef=useRef(null);
  const wRef=useRef(null);
  const arcRef=useRef(null);
  const outerRef=useRef(null);
  const R=140, OUTER_R=158, circ=2*Math.PI*OUTER_R, ofs=circ*(1-count/108), done=count>=108;

  const [pulses,setPulses]=useState([]);
  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    haptic('light');
    if(state.beadSound) playBeadTap();
    if(pRef.current){pRef.current.classList.remove('go');void pRef.current.offsetWidth;pRef.current.classList.add('go');}
    if(wRef.current){wRef.current.classList.remove('go');void wRef.current.offsetWidth;wRef.current.classList.add('go');}
    if(arcRef.current){arcRef.current.classList.remove('catch');void arcRef.current.getBBox&&arcRef.current.getBBox();arcRef.current.classList.add('catch');}
    if(outerRef.current){
      const el=outerRef.current;
      el.classList.remove('catch');
      setTimeout(()=>el.classList.add('catch'),650);
      setTimeout(()=>el.classList.remove('catch'),1100);
    }
    const id=Date.now();
    setPulses(p=>[...p,id]);
    setTimeout(()=>setPulses(p=>p.filter(x=>x!==id)),700);
  }

  useEffect(()=>{
    function onKey(e){
      if(sheet)return;
      if(e.code==='Space'||e.code==='ArrowDown'||e.code==='ArrowRight'){e.preventDefault();tap();}
    }
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[count,done,sheet]);

  return h('div',{className:'pg jap-page',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
    // header row
    h('div',{className:'hdr',style:{width:'100%'}},
      h('div',null, h(Eb,{t:'Jap'}), h('div',{className:'ttl'},'A quiet practice')),
      h('div',{className:'hdr-btns'},
        h('button',{className:'ibtn',onClick:()=>setSheet(true)},h(SvgSettings)),
        h('button',{className:'ibtn',onClick:()=>dispatch({type:'TOGGLE_DARK'})},h(SvgSun))
      )
    ),
    // stat pills
    h('div',{className:'pills'},
      [{v:count,l:'Today',k:'today'},{v:malas,l:'Malas',k:'malas'},{v:`${streak}d`,l:'Streak',k:'streak'}].map(s=>
        h('div',{key:s.k,className:`pill${s.k==='streak'&&streak>1?' pill-warm':''}`},h('div',{className:'pv'},s.v),h('div',{className:'pl'},s.l))
      )
    ),
    // ring — single ring, ref shows one circle with subtle tone
    h('div',{className:'ring',onClick:tap,style:{width:'min(336px,calc(100vw - 48px))',height:'min(336px,calc(100vw - 48px))',position:'relative'}},
      h('div',{ref:pRef,className:'ring-pulse'}),
      h('div',{ref:wRef,className:'ring-wave'}),
      pulses.map(id=>h('div',{key:id,className:'plus-one'},'+1')),
      h('svg',{viewBox:'0 0 336 336',width:'100%',height:'100%',style:{position:'absolute',top:0,left:0}},
        h('defs',null,
          h('radialGradient',{id:'ringGlow',cx:'50%',cy:'50%',r:'50%'},
            h('stop',{offset:'0%',stopColor:dark?'rgba(184,146,74,.07)':'rgba(184,146,74,.05)'}),
            h('stop',{offset:'55%',stopColor:dark?'rgba(184,146,74,.02)':'rgba(184,146,74,.01)'}),
            h('stop',{offset:'100%',stopColor:'rgba(184,146,74,0)'})
          )
        ),
        h('circle',{cx:168,cy:168,r:138,fill:'url(#ringGlow)'}),
        h('circle',{ref:outerRef,className:'outer-ring',cx:168,cy:168,r:158,fill:'none',stroke:dark?'#38302a':'#d8d0c4',strokeWidth:'1.2'}),
        h('circle',{cx:168,cy:168,r:R,fill:'none',stroke:dark?'#2e2820':'#ccc4b6',strokeWidth:'.8'}),
        count>0&&h('circle',{ref:arcRef,className:'prog-arc',cx:168,cy:168,r:OUTER_R,fill:'none',stroke:'#c4a060',strokeWidth:'2.2',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:ofs,transform:'rotate(-90 168 168)',
          style:{transition:'stroke-dashoffset .4s cubic-bezier(.4,0,.2,1)'}})
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}},
        done
          ? h(React.Fragment,null,
              h('div',{style:{fontFamily:'Fraunces,serif',fontSize:28,fontWeight:400,letterSpacing:'.01em',color:dark?'#f3eee7':'#3a3128',fontVariationSettings:"'opsz' 32,'SOFT' 35",lineHeight:1.35}},'You arrived.'),
              h('div',{style:{fontSize:9,color:'#c4a060',marginTop:12,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:300,opacity:.85}},`${state.malas>0?state.malas+' mala':'first mala'}`)
            )
          : h(React.Fragment,null,
              h('div',{style:{fontFamily:'Fraunces,serif',fontSize:36,fontWeight:400,letterSpacing:'.01em',color:dark?'#f3eee7':'#3a3128',fontVariationSettings:"'opsz' 42,'SOFT' 35"}},mantra||'Radhe'),
              h('div',{style:{fontSize:11,color:dark?'rgba(243,238,231,.45)':'#b5a89a',marginTop:9,letterSpacing:'.08em',fontVariantNumeric:'tabular-nums',fontWeight:300}},`${count} / 108`)
            )
      )
    ),
    !done&&h('div',{style:{fontSize:9,fontWeight:400,letterSpacing:'.18em',textTransform:'uppercase',color:'#b5a89a',marginTop:24,marginBottom:4}},'tap to count'),
    done&&h('div',{style:{marginTop:28,marginBottom:4}}),
    // reset
    h('button',{
      onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'});},
      style:{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5,color:'#9c9080',fontSize:12,fontFamily:'Inter,sans-serif',fontWeight:300}},
      h(SvgRst),' Reset today'
    ),
    h('div',{style:{marginTop:14,fontSize:10,fontWeight:500,letterSpacing:'.16em',textTransform:'uppercase',color:'#bdb3a4',fontVariantNumeric:'tabular-nums'}},
      `${compactNum(state.totalCount)} lifetime`
    ),
    done&&h('div',{style:{marginTop:24,textAlign:'center'}},
      h('div',{style:{fontFamily:'Fraunces,serif',fontSize:13,fontStyle:'italic',fontWeight:400,color:'#9c9080',lineHeight:1.8,marginBottom:20,fontVariationSettings:"'opsz' 16,'SOFT' 30"}},'Carry this stillness with you.'),
      h('button',{onClick:()=>dispatch({type:'NEW_MALA'}),
        style:{background:'none',border:'1px solid #e0d8cd',borderRadius:'100px',padding:'9px 22px',fontFamily:'Inter,sans-serif',fontSize:11,fontWeight:300,cursor:'pointer',color:'#9c9080',letterSpacing:'.08em'}},
        'continue')
    ),
    sheet&&h(SettingsSheet,{state,dispatch,close:()=>setSheet(false)})
  );
}

// ── GUIDANCE PAGE ─────────────────────────────────────────────
// Bug fix: store selected emotion directly in one state, use a separate
// boolean for showing result. This avoids the null-wisdom crash entirely.
function GuidancePage({state,dispatch}){
  const [sel,setSel]=useState('');           // emotion id string, '' = none
  const [showResult,setShowResult]=useState(false);

  // Restore today's guidance on mount
  useEffect(()=>{
    const g=state.lastGuidance;
    if(g && g.date===todayStr() && g.emotion && WISDOM[g.emotion]){
      setSel(g.emotion);
      setShowResult(true);
    }
  },[]);

  function choose(id){haptic('select');setSel(id);}

  function receive(){
    if(!sel||!WISDOM[sel])return;
    dispatch({type:'SET_GUIDANCE',p:{date:todayStr(),emotion:sel}});
    setShowResult(true);
  }

  function back(){
    setShowResult(false);
    // keep sel so card is still highlighted on return
  }

  // ── RESULT ──
  if(showResult && sel && WISDOM[sel]){
    const w=WISDOM[sel];
    return h('div',{className:'pg'},
      h('button',{className:'back-btn',onClick:back,style:{marginTop:'env(safe-area-inset-top, 0px)'}},
        h('svg',{viewBox:'0 0 16 16',fill:'none',stroke:'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'},
          h('path',{d:'M10 12L6 8l4-4'})
        ),
        'return'
      ),
      h('div',{className:'pg-center'},
        h(Eb,{t:'You feel',center:true}),
        h('div',{className:'ttl-em'},w.label),
        h('div',{className:'gcard'},
          h('div',{className:'gsrc'},h('div',{className:'gsrc-l'}),h('span',{className:'gsrc-t'},w.source),h('div',{className:'gsrc-l'})),
          h('div',{className:'gverse'},w.verse),
          h('div',{className:'gdot'},h('div',{className:'gdot-line'}),h('span',{className:'gdot-mark'},'·'),h('div',{className:'gdot-line'})),
          h('div',{className:'glbl'},'A quiet question'),
          h('div',{className:'gq'},w.question),
          h('div',{className:'gdot'},h('div',{className:'gdot-line'}),h('span',{className:'gdot-mark'},'·'),h('div',{className:'gdot-line'})),
          h('div',{className:'glbl'},'One small step'),
          h('div',{className:'gstep'},w.step)
        ),
        h('div',{className:'gaff'},'Take what helps. Leave the rest.\nReturn whenever you need.')
      )
    );
  }

  // ── SELECT ──
  return h('div',{className:'pg'},
    h(Eb,{t:'Guidance'}),
    h('div',{className:'ttl-xl'},'How are you, really?'),
    h('p',{className:'sub'},"Name what is present. A verse will meet you there."),
    h('div',{className:'egrid'},
      EMOTIONS.map(e=>
        h('div',{key:e.id,className:`ecard${sel===e.id?' on':''}`,onClick:()=>choose(e.id)},
          h('div',{className:'edot'}),
          h('div',{className:'elbl'},e.label)
        )
      )
    ),
    sel&&h('button',{className:'cont-btn',onClick:receive},'Receive')
  );
}

// ── TODAY PAGE ────────────────────────────────────────────────
function TodayPage({dark}){
  const v=getDayVerse();
  const [reminder,setReminderRaw]=useState(false);
  const setReminder=v=>{haptic('light');setReminderRaw(v);};
  const d=new Date();
  const eyebrow=`${d.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}, ${d.toLocaleDateString('en-US',{month:'long',day:'numeric'}).toUpperCase()}`;

  function share(){
    const t=`${v.meaning}\n\n— ${v.source}\n\nPrashama 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied'));
  }

  return h('div',{className:'pg today-page'},
    h(Eb,{t:eyebrow}),
    h('div',{className:'ttl'},"Today's Dharma"),
    h('p',{className:'sub'},'One verse. One breath at a time.'),
    h('div',{className:'dcard'},
      h('div',{className:'dsrc'},v.source),
      h('div',{className:'dsk'},v.sanskrit),
      h('div',{className:'ddiv'}),
      h('div',{className:'dmt'},v.meaning),
      h('div',{className:'drlbl'},'Reflection'),
      h('div',{className:'drefl'},v.reflection),
      h('div',{className:'dacts'},
        h('button',{className:'dlisten'},h(SvgPlay),' Listen'),
        h('div',{className:'dico',onClick:()=>{}},h(SvgBkm)),
        h('div',{className:'dico',onClick:share},h(SvgShr))
      )
    ),
    h('div',{className:'remcard'},
      h('div',{className:'remico'},'🔔'),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:13,fontWeight:400,marginBottom:2}},'Daily Dharma reminders'),
        h('div',{style:{fontSize:11,color:'#9c9080',fontWeight:300,lineHeight:1.5}},'A gentle nudge each morning — never more than one.')
      ),
      h(Tog,{on:reminder,set:setReminder})
    )
  );
}

// ── REFLECTION PAGE ───────────────────────────────────────────
function ReflectionPage({state,dispatch}){
  const draft=loadDraft();
  const [g,setG]=useState(draft.g||'');
  const [p,setP]=useState(draft.p||'');
  const [l,setL]=useState(draft.l||'');
  const [saved,setSaved]=useState(false);

  // Auto-grow: resize a textarea to fit its content, capped so it never runs away
  function autoGrow(el){
    if(!el)return;
    el.style.height='auto';
    const max=240; // generous cap — long reflections scroll inside the textarea past this
    const h=Math.min(el.scrollHeight,max);
    el.style.height=h+'px';
    el.style.overflowY=el.scrollHeight>max?'auto':'hidden';
  }
  const gRef=useRef(null), pRef=useRef(null), lRef=useRef(null);
  useEffect(()=>{autoGrow(gRef.current);autoGrow(pRef.current);autoGrow(lRef.current);},[]);

  // Persist draft whenever input changes
  function updateG(v,el){setG(v);saveDraft({g:v,p,l});autoGrow(el);}
  function updateP(v,el){setP(v);saveDraft({g,p:v,l});autoGrow(el);}
  function updateL(v,el){setL(v);saveDraft({g,p,l:v});autoGrow(el);}
  const has=!!(g.trim()||p.trim()||l.trim());

  function doSave(){
    if(!has)return;
    dispatch({type:'SAVE_REFL',p:{date:new Date().toISOString(),grateful:g,peaceful:p,lesson:l}});
    haptic('success');
    clearDraft();
    setG('');setP('');setL('');setSaved(true);
    // reset textarea heights immediately so the card collapses back to its calm resting size
    [gRef,pRef,lRef].forEach(r=>{if(r.current){r.current.style.height='auto';}});
    setTimeout(()=>setSaved(false),3500);
  }

  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
  const recent=(state.reflections||[]).filter(r=>new Date(r.date)>=cutoff).slice(-5).reverse();

  return h('div',{className:'pg reflection-page'},
    h(Eb,{t:'Reflection'}),
    h('div',{className:'ttl'},'Three quiet gratitudes'),
    h('p',{className:'sub'},'A small, soft ritual. Write only what comes easily.'),
    h('div',{className:'rfcard'},
      h('span',{className:'rflbl'},'Grateful for'),
      h('textarea',{ref:gRef,className:'rfin',rows:1,placeholder:'A quiet morning, an honest conversation…',value:g,onChange:e=>updateG(e.target.value,e.target)}),
      h('span',{className:'rflbl'},'Something peaceful'),
      h('textarea',{ref:pRef,className:'rfin',rows:1,placeholder:'A pause that felt like home…',value:p,onChange:e=>updateP(e.target.value,e.target)}),
      h('span',{className:'rflbl'},'One lesson'),
      h('textarea',{ref:lRef,className:'rfin',rows:1,placeholder:'What today gently taught me…',value:l,onChange:e=>updateL(e.target.value,e.target),style:{marginBottom:48}}),
      h('button',{className:`savebtn${has?' on':''}`,disabled:!has||saved,onClick:doSave},saved?'A quiet moment kept.':'Save reflection')
    ),
    saved&&h('div',{style:{
      textAlign:'center',padding:'18px 0 0',
      fontFamily:'Fraunces,serif',fontSize:13,fontStyle:'italic',fontWeight:400,
      color:'#b8924a',lineHeight:1.8,letterSpacing:'.01em',
      animation:'fu .45s cubic-bezier(.4,0,.2,1)',
      fontVariationSettings:"'opsz' 14,'SOFT' 30"
    }},'Return whenever you need.'),
    h('div',{className:'past-hdr'},
      h('div',{className:'past-line'}),
      h('span',{className:'past-lbl'},'Past reflections'),
      h('div',{className:'past-line'})
    ),
    recent.length===0
      ? h('div',{className:'past-empty'},'Your reflections will gather here, quietly.')
      : recent.map((r,i)=>h('div',{key:i,style:{marginBottom:12,paddingBottom:12,borderBottom:'1px solid #e8e2d8'}},
          h('div',{style:{fontSize:10,color:'#9c9080',marginBottom:4,fontWeight:300}},new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})),
          r.grateful&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,marginBottom:2,whiteSpace:'pre-wrap',wordBreak:'break-word'}},r.grateful),
          r.peaceful&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,marginBottom:2,whiteSpace:'pre-wrap',wordBreak:'break-word'}},r.peaceful),
          r.lesson&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,whiteSpace:'pre-wrap',wordBreak:'break-word'}},r.lesson)
        ))
  );
}

// ── TABS ──────────────────────────────────────────────────────
const TABS=[
  {id:'jap',      label:'Jap',        I:SvgJap},
  {id:'guidance', label:'Guidance',   I:SvgGuidance},
  {id:'today',    label:'Today',      I:SvgToday},
  {id:'reflect',  label:'Reflection', I:SvgReflect},
];

// ── APP ───────────────────────────────────────────────────────
// ── ONBOARDING ────────────────────────────────────────────────
const OB_SCREENS = [
  {
    line: 'A quiet space\nfor your inner life.',
    sub:  '',
  },
  {
    line: 'Return gently\nto yourself.',
    sub:  'Each day, one breath.\nOne verse. One moment of stillness.',
  },
  {
    line: 'Begin\nwhenever you are ready.',
    sub:  '',
  },
];

function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  const [leaving,setLeaving]=useState(false);
  const [stepKey,setStepKey]=useState(0); // remount slide on step change

  function next(){
    if(step<OB_SCREENS.length-1){
      setStep(s=>s+1);
      setStepKey(k=>k+1);
    } else {
      finish();
    }
  }

  function finish(){
    setLeaving(true);
    setTimeout(onDone, 560);
  }

  const s = OB_SCREENS[step];
  const isLast = step === OB_SCREENS.length - 1;

  return h('div',{className:`ob-wrap${leaving?' leaving':''}`},
    h('div',{key:stepKey,className:'ob-slide'},
      h('div',{className:'ob-line'},
        ...s.line.split('\n').reduce((acc,line,i)=>{
          if(i>0) acc.push(h('br',{key:i}));
          acc.push(line);
          return acc;
        },[])
      ),
      s.sub && h('div',{className:'ob-sub'},
        ...s.sub.split('\n').reduce((acc,line,i)=>{
          if(i>0) acc.push(h('br',{key:i}));
          acc.push(line);
          return acc;
        },[])
      ),
    ),
    h('div',{className:'ob-dot-wrap'},
      isLast
        ? h('button',{className:'ob-begin',onClick:finish},'Enter')
        : h('button',{className:'ob-btn',onClick:next},'Continue'),
      h('div',{className:'ob-dot-row'},
        OB_SCREENS.map((_,i)=>h('div',{key:i,className:`ob-dot${i===step?' on':''}`}))
      )
    ),
    h('button',{className:'ob-skip',onClick:finish},'skip')
  );
}

function App(){
  const [tab,setTab]=useState(()=>loadNav());
  const [slideDir,setSlideDir]=useState(null);
  const [state,setState]=useState(initState);
  const dispatch=useCallback(a=>setState(p=>reducer(p,a)),[]);

  // First-open detection — show onboarding only when localStorage is empty
  const [showOb,setShowOb]=useState(()=>load()===null);

  function finishOnboarding(){
    setShowOb(false);
    if(load()===null) persist(initState(),true);
  }

  const tabIds=TABS.map(t=>t.id);
  const touchRef=useRef({x:0,y:0,active:false});

  function goTab(nextTab,dir){
    if(nextTab===tab) return;
    setSlideDir(dir);
    setTab(nextTab);
    saveNav(nextTab);
    haptic('select');
  }

  function onTouchStart(e){
    const t=e.touches[0];
    touchRef.current={x:t.clientX,y:t.clientY,active:true};
  }
  function onTouchMove(e){
    // no-op: we decide on touchend to avoid interfering with vertical scroll
  }
  function onTouchEnd(e){
    const ref=touchRef.current;
    if(!ref.active) return;
    ref.active=false;
    const t=e.changedTouches[0];
    const dx=t.clientX-ref.x;
    const dy=t.clientY-ref.y;
    // Require a clearly horizontal, intentional swipe
    if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.4) return;

    const idx=tabIds.indexOf(tab);
    if(dx<0){ // swipe left -> next tab
      if(idx<tabIds.length-1) goTab(tabIds[idx+1],'l');
    }else{ // swipe right -> previous tab
      if(idx>0) goTab(tabIds[idx-1],'r');
    }
  }

  useEffect(()=>{
    if(!slideDir) return;
    const t=setTimeout(()=>setSlideDir(null),240);
    return ()=>clearTimeout(t);
  },[tab]);

  const pages={
    jap:     h(JapPage,{state,dispatch}),
    guidance:h(GuidancePage,{state,dispatch}),
    today:   h(TodayPage,{dark:state.dark}),
    reflect: h(ReflectionPage,{state,dispatch}),
  };

  const pgEl=pages[tab];
  const slideClass=slideDir==='l'?' slide-l':slideDir==='r'?' slide-r':'';
  const pgWithSlide=slideClass
    ? React.cloneElement(pgEl,{className:`${pgEl.props.className||''}${slideClass}`})
    : pgEl;

  return h(React.Fragment,null,
    h('style',null,CSS),
    showOb && h(Onboarding,{onDone:finishOnboarding}),
    h('div',{
      className:`app${state.dark?' dk':''}`,
      onTouchStart,onTouchEnd,
      style:{touchAction:'pan-y'}
    },
      pgWithSlide,
      h('div',{className:'nav-wrap'},
        h('nav',{className:'nav'},
          TABS.map(t=>h('button',{key:t.id,className:`nb${tab===t.id?' on':''}`,onClick:()=>{
            if(t.id===tab) return;
            const idx=tabIds.indexOf(tab), nidx=tabIds.indexOf(t.id);
            goTab(t.id, nidx>idx?'l':'r');
          }},
            h(t.I), t.label
          ))
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
