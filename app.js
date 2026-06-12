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
  angry:       {label:'angry',       source:'Bhagavad Gita 2.63', verse:'From anger comes delusion. From delusion, loss of memory. From loss of memory, the destruction of discrimination — and from that, one perishes.', question:'"What am I actually protecting right now?"', step:'Pause. Breathe three times before you respond to anything.'},
  anxious:     {label:'anxious',     source:'Bhagavad Gita 2.23', verse:'What you truly are cannot be harmed. The soul is untouched by weapons, fire, water, or wind.', question:'"What is actually happening right now — not in my imagination?"', step:'Name five things you can see. Come back to this moment.'},
  overthinking:{label:'overthinking',source:'Bhagavad Gita 2.47', verse:'Focus on the next right action. Release the outcome you cannot hold.', question:'"What is one small step I can take right now?"', step:'Write down a single next action and close the rest of the tabs.'},
  distracted:  {label:'distracted',  source:'Bhagavad Gita 6.26', verse:'Wherever the restless mind wanders, gently bring it back. Again and again, quietly return.', question:'"What actually matters to me today?"', step:'Close one tab. Do one thing for ten minutes without switching.'},
  lonely:      {label:'lonely',      source:'Bhagavad Gita 9.29', verse:'I am equally present in all beings. Those who turn toward Me with devotion — they are in Me, and I am in them.', question:'"Who could I reach out to today — even briefly?"', step:'Send one message. Not to explain how you feel. Just to connect.'},
  unmotivated: {label:'unmotivated', source:'Bhagavad Gita 3.8',  verse:'Do what must be done. Action is better than inaction. Even the body cannot be maintained without movement.', question:'"What is the smallest possible beginning?"', step:'Do two minutes of the thing you have been avoiding. Only two minutes.'},
  peaceful:    {label:'peaceful',    source:'Bhagavad Gita 6.27', verse:'Supreme happiness comes to the one whose mind is still, whose passions are quiet, who has become one with what is.', question:'"How can I protect this feeling for the rest of today?"', step:'Less input today. Guard the quiet you have found.'},
  grateful:    {label:'grateful',    source:'Bhagavad Gita 4.11', verse:'In whatever way people come to Me, I meet them there. The Divine meets you exactly where you are.', question:'"Who or what made this feeling possible?"', step:'Tell one person today that you appreciate them. Specifically.'},
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
function load(){try{return JSON.parse(localStorage.getItem(SKEY));}catch{return null;}}
function persist(s){try{localStorage.setItem(SKEY,JSON.stringify(s));}catch{}}
function todayStr(){return new Date().toISOString().slice(0,10);}
function wasYday(ds){if(!ds)return false;const y=new Date();y.setDate(y.getDate()-1);return ds===y.toISOString().slice(0,10);}
function initState(){
  const s=load(), t=todayStr(), nd=s&&s.lastDate!==t;
  const base={count:0,malas:0,lastDate:t,totalCount:0,streak:0,reflections:[],lastGuidance:null,
    mantra:'Radhe',mantras:[...DEFAULT_MANTRAS],dark:false,beadSound:true,haptic:true};
  if(!s)return base;
  return{...base,...s,lastDate:t,
    count:nd?0:s.count, malas:nd?0:s.malas,
    streak:nd?(wasYday(s.lastDate)?(s.streak||0)+1:0):(s.streak||0),
    mantras:s.mantras||[...DEFAULT_MANTRAS]};
}
function reducer(state,action){
  let n;
  switch(action.type){
    case'TAP':        if(state.count>=108)return state; n={...state,count:state.count+1,totalCount:state.totalCount+1}; break;
    case'NEW_MALA':   n={...state,count:0,malas:state.malas+1}; break;
    case'RESET_DAY':  n={...state,count:0,malas:0}; break;
    case'SET_MANTRA': n={...state,mantra:action.v}; break;
    case'ADD_MANTRA': if(!action.v.trim()||state.mantras.includes(action.v.trim()))return state;
                      n={...state,mantras:[...state.mantras,action.v.trim()]}; break;
    case'TOGGLE_DARK':n={...state,dark:!state.dark}; break;
    case'SET_BEAD':   n={...state,beadSound:action.v}; break;
    case'SET_HAPTIC': n={...state,haptic:action.v}; break;
    case'SET_GUIDANCE':n={...state,lastGuidance:action.p}; break;
    case'SAVE_REFL':  n={...state,reflections:[...(state.reflections||[]),action.p]}; break;
    default: return state;
  }
  persist(n); return n;
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
.app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:#f6f3ec;color:#1a1612;position:relative;}
.app.dk{background:#1b1814;color:#e4ddd4;}

/* ── PAGE ── */
.pg{flex:1;padding:28px 22px 90px;overflow-y:auto;animation:fu .16s ease;display:flex;flex-direction:column;}
@keyframes fu{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}

/* ── EYEBROW — short gold rule + spaced caps ── */
.eb{display:flex;align-items:center;gap:6px;margin-bottom:5px;}
.eb-r{width:20px;height:1px;background:#b8924a;flex-shrink:0;}
.eb-t{font-family:'Inter',sans-serif;font-size:10.5px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#b8924a;}
/* centered eyebrow — rules on both sides */
.eb-c{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;}
.eb-c .eb-r{width:26px;}

/* ── HEADINGS ── */
/* Main page titles: Cormorant 300, ~32px — matches ref */
.ttl{font-family:'Fraunces',serif;font-size:33px;font-weight:600;line-height:1.18;letter-spacing:-.005em;margin-bottom:8px;color:#1f1a14;font-variation-settings:'opsz' 38,'SOFT' 45;}
.ttl-xl{font-family:'Fraunces',serif;font-size:37px;font-weight:600;line-height:1.15;letter-spacing:-.005em;margin-bottom:8px;color:#1f1a14;font-variation-settings:'opsz' 42,'SOFT' 45;}
.ttl-em{font-family:'Fraunces',serif;font-size:47px;font-weight:600;line-height:1.1;letter-spacing:-.005em;text-align:center;margin-bottom:22px;color:#1f1a14;font-variation-settings:'opsz' 60,'SOFT' 45;}
.sub{font-size:13.5px;font-weight:400;color:#9c9080;line-height:1.6;margin-bottom:22px;letter-spacing:.005em;}

/* ── STAT PILLS ── */
.pills{display:flex;gap:10px;width:100%;margin-top:18px;margin-bottom:30px;}
.pill{flex:1;background:#efece4;border-radius:100px;padding:13px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;}
.app.dk .pill{background:#272219;}
.pv{font-family:'Fraunces',serif;font-size:27px;font-weight:600;line-height:1;color:#1a1612;font-variation-settings:'opsz' 28,'SOFT' 50;}
.app.dk .pv{color:#e4ddd4;}
.pl{font-size:9px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9c9080;}

/* ── RING ── */
.ring{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-bottom:0;}
.ring-pulse{position:absolute;inset:-14px;border-radius:50%;background:rgba(184,146,74,.06);opacity:0;pointer-events:none;}
.ring-pulse.go{animation:rp .3s ease-out forwards;}
@keyframes rp{0%{opacity:.4;transform:scale(.93)}100%{opacity:0;transform:scale(1.04)}}

.plus-one{
  position:absolute; top:38%; left:50%;
  transform:translate(-50%,-50%);
  font-family:'Fraunces',serif;
  font-size:22px; font-weight:600;
  color:#b8924a;
  pointer-events:none;
  animation:floatUp .7s ease-out forwards;
  z-index:5;
}
@keyframes floatUp{
  0%{opacity:0; transform:translate(-50%,-50%) scale(.8);}
  20%{opacity:1; transform:translate(-50%,-65%) scale(1.1);}
  100%{opacity:0; transform:translate(-50%,-130%) scale(1);}
}

/* Wave/ripple between the two rings on tap */
.ring-wave{
  position:absolute; inset:0; border-radius:50%;
  border:1px solid rgba(184,146,74,.35);
  opacity:0; pointer-events:none;
}
.ring-wave.go{ animation:wave .6s ease-out forwards; }
@keyframes wave{
  0%{opacity:.6; transform:scale(.78);}
  100%{opacity:0; transform:scale(1.02);}
}

/* ── TOP-RIGHT ICON BUTTONS ── */
.hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0;}
.hdr-btns{display:flex;gap:7px;padding-top:2px;}
.ibtn{width:34px;height:34px;border-radius:100px;border:none;background:rgba(0,0,0,.04);color:#b5a89a;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.ibtn svg{width:15px;height:15px;}

/* ── SETTINGS SHEET ── */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.28);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.sh{width:100%;max-width:430px;background:#fff;border-radius:22px 22px 0 0;padding:18px 18px 38px;max-height:80vh;overflow-y:auto;}
.app.dk .sh{background:#272219;}
.sh-drag{width:32px;height:3px;border-radius:2px;background:#ddd8ce;margin:0 auto 16px;}
.mrow{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:11px;margin-bottom:7px;cursor:pointer;font-family:'Fraunces',serif;font-size:17px;font-weight:600;background:#f5f0e8;border:1.5px solid transparent;color:#1f1a14;font-variation-settings:'opsz' 20,'SOFT' 35;}
.app.dk .mrow{background:#312b25;color:#e4ddd4;}
.mrow.on{border-color:#b8924a;}
.madd{display:flex;align-items:center;justify-content:center;gap:6px;padding:11px 14px;border-radius:11px;margin-bottom:18px;cursor:pointer;font-size:10px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9c9080;background:#f5f0e8;}
.app.dk .madd{background:#312b25;}
.trow{display:flex;align-items:center;justify-content:space-between;padding:13px 2px;border-bottom:1px solid #f0ebe2;font-size:13px;font-weight:300;}
.app.dk .trow{border-color:#38322a;}
.trow:last-child{border-bottom:none;}
.trow-l{display:flex;align-items:center;gap:8px;}
.tog{width:40px;height:23px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .15s;flex-shrink:0;}
.tog.off{background:#cec9c0;}
.tog.on{background:#b8924a;}
.tog-k{position:absolute;top:2.5px;left:2.5px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s;box-shadow:0 1px 2px rgba(0,0,0,.14);}
.tog.on .tog-k{transform:translateX(17px);}
.sh-note{font-size:11px;color:#9c9080;margin-top:16px;line-height:1.6;padding:0 2px;}

/* ── EMOTION GRID ── */
/* Reference: tall cards ~130px, dot top-left, label bottom-left serif */
.egrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;}
.ecard{background:#faf7f2;border-radius:15px;padding:14px 14px 15px;min-height:128px;display:flex;flex-direction:column;justify-content:space-between;cursor:pointer;border:1.5px solid transparent;transition:border-color .12s;box-shadow:0 1px 2px rgba(0,0,0,.03);}
.app.dk .ecard{background:#272219;}
.ecard.on{border-color:#b8924a;}
.edot{width:6px;height:6px;border-radius:50%;background:#b8924a;}
.elbl{font-family:'Fraunces',serif;font-size:17px;font-weight:600;line-height:1.2;margin-top:auto;padding-top:16px;letter-spacing:0;color:#1f1a14;font-variation-settings:'opsz' 20,'SOFT' 35;}

/* ── GUIDANCE RESULT ── */
/* White card, very roomy, verse centered Cormorant */
.gcard{background:#fff;border-radius:18px;padding:20px 20px;box-shadow:0 1px 6px rgba(0,0,0,.04);margin-bottom:0;}
.app.dk .gcard{background:#272219;}
.gsrc{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:14px;}
.gsrc-l{width:26px;height:1px;background:#b8924a;flex-shrink:0;}
.gsrc-t{font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:#b8924a;}
.gverse{font-family:'Fraunces',serif;font-size:18px;font-weight:500;line-height:1.6;text-align:center;margin-bottom:16px;letter-spacing:0;color:#1f1a14;font-variation-settings:'opsz' 24,'SOFT' 35;}
.gdot{text-align:center;font-size:14px;color:#b8924a;margin:10px 0;line-height:1;}
.glbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9c9080;text-align:center;margin-bottom:6px;}
.gq{font-family:'Fraunces',serif;font-size:17px;font-style:italic;font-weight:500;line-height:1.55;text-align:center;color:#1f1a14;font-variation-settings:'opsz' 20,'SOFT' 35;}
.gstep{font-size:13.5px;font-weight:300;line-height:1.9;text-align:center;color:#1a1612;letter-spacing:.01em;}
.app.dk .gstep{color:#ccc6bc;}
.gaff{font-family:'Fraunces',serif;font-size:13px;font-style:italic;font-weight:600;color:#9c9080;text-align:center;line-height:1.85;margin-top:28px;white-space:pre-line;letter-spacing:0;font-variation-settings:'opsz' 16,'SOFT' 25;}
.back-btn{background:none;border:none;cursor:pointer;font-size:13px;font-weight:300;color:#9c9080;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:4px;padding:0;margin-bottom:14px;}

/* ── DHARMA CARD ── */
.dcard{background:#fff;border-radius:18px;padding:18px 18px;box-shadow:0 1px 6px rgba(0,0,0,.04);margin-bottom:14px;}
.app.dk .dcard{background:#272219;}
.dsrc{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#b8924a;margin-bottom:13px;}
.dsrc::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:#b8924a;flex-shrink:0;}
.dsk{font-family:'Fraunces',serif;font-size:20px;font-weight:600;line-height:1.45;margin-bottom:10px;color:#1f1a14;font-variation-settings:'opsz' 24,'SOFT' 35;}
.ddiv{height:1px;background:#ede8df;margin:10px 0;}
.app.dk .ddiv{background:#38322a;}
.dmt{font-family:'Fraunces',serif;font-size:15px;font-style:italic;font-weight:500;line-height:1.6;margin-bottom:10px;color:#1f1a14;font-variation-settings:'opsz' 18,'SOFT' 35;}
.drlbl{font-size:10px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9c9080;margin-bottom:4px;}
.drefl{font-size:13px;font-weight:300;line-height:1.65;margin-bottom:14px;letter-spacing:.005em;}
.dacts{display:flex;align-items:center;gap:8px;}
.dlisten{background:#28211a;color:#fff;border:none;border-radius:100px;padding:9px 16px;font-size:12px;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;}
.app.dk .dlisten{background:#e4ddd4;color:#1a1612;}
.dico{width:36px;height:36px;border-radius:100px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;border:1px solid #e8e2d8;}
.app.dk .dico{background:#2e2820;border-color:#38322a;}
/* Reminder card */
.remcard{background:#fff;border-radius:16px;padding:13px 15px;display:flex;align-items:center;gap:11px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
.app.dk .remcard{background:#272219;}
.remico{width:34px;height:34px;border-radius:100px;background:#f6f3ec;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.app.dk .remico{background:#312b25;}

/* ── REFLECTION CARD ── */
/* Matches ref exactly: white card, underline inputs, Cormorant italic placeholder */
.rfcard{background:#fff;border-radius:18px;padding:18px 18px 16px;box-shadow:0 1px 6px rgba(0,0,0,.04);margin-bottom:0;}
.app.dk .rfcard{background:#272219;}
.rflbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9c9080;margin-bottom:4px;display:block;}
.rfin{width:100%;background:none;border:none;border-bottom:1px solid #e8e2d8;padding:2px 0 6px;font-family:'Fraunces',serif;font-size:15px;font-style:italic;font-weight:500;color:#1f1a14;outline:none;transition:border-color .14s;display:block;margin-bottom:10px;font-variation-settings:'opsz' 18,'SOFT' 35;}
.rfin::placeholder{color:#b5a99a;font-style:italic;}
.rfin:focus{border-bottom-color:#b8924a;}
.app.dk .rfin{color:#e4ddd4;border-bottom-color:#38322a;}
.app.dk .rfin::placeholder{color:#5c554e;}
/* Save button: grey until active */
.savebtn{width:100%;padding:12px;border-radius:100px;border:none;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;cursor:pointer;transition:background .15s;background:#c8c2b8;color:#fff;margin-top:2px;}
.savebtn.on{background:#b8924a;}
/* Past reflections */
.past-hdr{display:flex;align-items:center;gap:8px;margin:18px 0 10px;}
.past-line{flex:1;height:1px;background:#e8e2d8;}
.app.dk .past-line{background:#38322a;}
.past-lbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9c9080;}
.past-empty{font-family:'Fraunces',serif;font-size:14px;font-style:italic;font-weight:600;color:#9c9080;line-height:1.6;font-variation-settings:'opsz' 18,'SOFT' 25;}

/* ── CONTINUE BUTTON ── */
.cont-btn{width:100%;padding:13px;border-radius:100px;border:none;background:#b8924a;color:#fff;font-family:'Inter',sans-serif;font-size:13px;font-weight:300;cursor:pointer;}

/* ── BOTTOM NAV — floating pill exactly as reference ── */
/* Reference: white rounded pill, shadow, no active bg — only color change */
.nav-wrap{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:calc(100% - 40px);max-width:390px;z-index:100;}
.nav{background:#fff;border-radius:100px;display:flex;padding:4px;box-shadow:0 2px 20px rgba(0,0,0,.07);}
.app.dk .nav{background:#1e1b17;}
.nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 6px;background:none;border:none;cursor:pointer;color:#9c9080;font-family:'Inter',sans-serif;font-size:10px;font-weight:300;border-radius:100px;transition:color .12s;letter-spacing:.01em;}
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
  const R=122, circ=2*Math.PI*R, ofs=circ*(1-count/108), done=count>=108;

  const [pulses,setPulses]=useState([]);
  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    if(pRef.current){pRef.current.classList.remove('go');void pRef.current.offsetWidth;pRef.current.classList.add('go');}
    if(wRef.current){wRef.current.classList.remove('go');void wRef.current.offsetWidth;wRef.current.classList.add('go');}
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

  return h('div',{className:'pg',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
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
      [{v:count,l:'Today'},{v:malas,l:'Malas'},{v:`${streak}d`,l:'Streak'}].map(s=>
        h('div',{key:s.l,className:'pill'},h('div',{className:'pv'},s.v),h('div',{className:'pl'},s.l))
      )
    ),
    // ring — single ring, ref shows one circle with subtle tone
    h('div',{className:'ring',onClick:tap,style:{width:'min(296px,calc(100vw - 76px))',height:'min(296px,calc(100vw - 76px))',position:'relative'}},
      h('div',{ref:pRef,className:'ring-pulse'}),
      h('div',{ref:wRef,className:'ring-wave'}),
      pulses.map(id=>h('div',{key:id,className:'plus-one'},'+1')),
      h('svg',{viewBox:'0 0 296 296',width:'100%',height:'100%',style:{position:'absolute',top:0,left:0}},
        h('circle',{cx:148,cy:148,r:138,fill:'none',stroke:dark?'#2e2820':'#dedad2',strokeWidth:'1'}),
        h('circle',{cx:148,cy:148,r:R,fill:'none',stroke:dark?'#38322a':'#d0cbc2',strokeWidth:'1'}),
        count>0&&h('circle',{cx:148,cy:148,r:R,fill:'none',stroke:'#b8924a',strokeWidth:'1.5',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:ofs,transform:'rotate(-90 148 148)',
          style:{transition:'stroke-dashoffset .1s ease'}})
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}},
        done
          ? h(React.Fragment,null,
              h('div',{style:{fontSize:36}},'🙏'),
              h('div',{style:{fontFamily:'Fraunces,serif',fontSize:11,color:'#b8924a',marginTop:9,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:400}})
            )
          : h(React.Fragment,null,
              h('div',{style:{fontFamily:'Fraunces,serif',fontSize:36,fontWeight:600,letterSpacing:'0',color:dark?'#e4ddd4':'#1f1a14',fontVariationSettings:"'opsz' 48,'SOFT' 35"}},mantra||'Radhe'),
              h('div',{style:{fontSize:12,color:'#9c9080',marginTop:7,letterSpacing:'.05em'}},`${count} / 108`)
            )
      )
    ),
    !done&&h('div',{style:{fontSize:10,fontWeight:500,letterSpacing:'.16em',textTransform:'uppercase',color:'#9c9080',marginTop:18,marginBottom:6}},'Tap to count'),
    done&&h('div',{style:{marginTop:18,marginBottom:6}}),
    // reset
    h('button',{
      onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'});},
      style:{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5,color:'#9c9080',fontSize:12,fontFamily:'Inter,sans-serif',fontWeight:300}},
      h(SvgRst),' Reset today'
    ),
    done&&h('div',{style:{marginTop:24,textAlign:'center'}},
      h('div',{style:{fontFamily:'Fraunces,serif',fontSize:17,fontWeight:500,color:'#b8924a',marginBottom:14,fontVariationSettings:"'opsz' 18,'SOFT' 50"}},'Mala complete'),
      h('button',{onClick:()=>dispatch({type:'NEW_MALA'}),
        style:{background:'#b8924a',color:'#fff',border:'none',borderRadius:'100px',padding:'10px 24px',fontFamily:'Inter,sans-serif',fontSize:12,fontWeight:300,cursor:'pointer'}},
        'Begin next mala')
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

  function choose(id){setSel(id);}

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
      h('button',{className:'back-btn',onClick:back},'← back'),
      h(Eb,{t:'You feel',center:true}),
      h('div',{className:'ttl-em'},w.label),
      h('div',{className:'gcard'},
        // source line
        h('div',{className:'gsrc'},h('div',{className:'gsrc-l'}),h('span',{className:'gsrc-t'},w.source),h('div',{className:'gsrc-l'})),
        // verse
        h('div',{className:'gverse'},w.verse),
        // dot separator
        h('div',{className:'gdot'},'·'),
        // quiet question
        h('div',{className:'glbl'},'A quiet question'),
        h('div',{className:'gq'},w.question),
        // dot separator
        h('div',{className:'gdot'},'·'),
        // one small step
        h('div',{className:'glbl'},'One small step'),
        h('div',{className:'gstep'},w.step)
      ),
      h('div',{className:'gaff'},'Take what helps. Leave the rest.\nReturn whenever you need.')
    );
  }

  // ── SELECT ──
  return h('div',{className:'pg'},
    h(Eb,{t:'Guidance'}),
    h('div',{className:'ttl-xl'},'How are you, really?'),
    h('p',{className:'sub'},"Choose what's closest. A quiet verse will meet you there — no rush."),
    h('div',{className:'egrid'},
      EMOTIONS.map(e=>
        h('div',{key:e.id,className:`ecard${sel===e.id?' on':''}`,onClick:()=>choose(e.id)},
          h('div',{className:'edot'}),
          h('div',{className:'elbl'},e.label)
        )
      )
    ),
    sel&&h('button',{className:'cont-btn',onClick:receive},'Continue')
  );
}

// ── TODAY PAGE ────────────────────────────────────────────────
function TodayPage({dark}){
  const v=getDayVerse();
  const [reminder,setReminder]=useState(false);
  const d=new Date();
  const eyebrow=`${d.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}, ${d.toLocaleDateString('en-US',{month:'long',day:'numeric'}).toUpperCase()}`;

  function share(){
    const t=`${v.meaning}\n\n— ${v.source}\n\nPrashama 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied'));
  }

  return h('div',{className:'pg'},
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
  const [g,setG]=useState('');
  const [p,setP]=useState('');
  const [l,setL]=useState('');
  const [saved,setSaved]=useState(false);
  const has=!!(g.trim()||p.trim()||l.trim());

  function doSave(){
    if(!has)return;
    dispatch({type:'SAVE_REFL',p:{date:new Date().toISOString(),grateful:g,peaceful:p,lesson:l}});
    setG('');setP('');setL('');setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
  const recent=(state.reflections||[]).filter(r=>new Date(r.date)>=cutoff).slice(-5).reverse();

  return h('div',{className:'pg'},
    h(Eb,{t:'Reflection'}),
    h('div',{className:'ttl'},'Three quiet gratitudes'),
    h('p',{className:'sub'},'A small, soft ritual. Write only what comes easily.'),
    h('div',{className:'rfcard'},
      h('span',{className:'rflbl'},'Grateful for'),
      h('input',{className:'rfin',placeholder:'A quiet morning, an honest conversation…',value:g,onChange:e=>setG(e.target.value)}),
      h('span',{className:'rflbl'},'Something peaceful'),
      h('input',{className:'rfin',placeholder:'A pause that felt like home…',value:p,onChange:e=>setP(e.target.value)}),
      h('span',{className:'rflbl'},'One lesson'),
      h('input',{className:'rfin',placeholder:'What today gently taught me…',value:l,onChange:e=>setL(e.target.value),style:{marginBottom:14}}),
      h('button',{className:`savebtn${has?' on':''}`,disabled:!has,onClick:doSave},saved?'Saved ✓':'Save reflection')
    ),
    h('div',{className:'past-hdr'},
      h('div',{className:'past-line'}),
      h('span',{className:'past-lbl'},'Past reflections'),
      h('div',{className:'past-line'})
    ),
    recent.length===0
      ? h('div',{className:'past-empty'},'Your reflections will gather here, quietly.')
      : recent.map((r,i)=>h('div',{key:i,style:{marginBottom:12,paddingBottom:12,borderBottom:'1px solid #e8e2d8'}},
          h('div',{style:{fontSize:10,color:'#9c9080',marginBottom:4,fontWeight:300}},new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})),
          r.grateful&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,marginBottom:2}},r.grateful),
          r.peaceful&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,marginBottom:2}},r.peaceful),
          r.lesson&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65}},r.lesson)
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
function App(){
  const [tab,setTab]=useState('jap');
  const [state,setState]=useState(initState);
  const dispatch=useCallback(a=>setState(p=>reducer(p,a)),[]);

  const pages={
    jap:     h(JapPage,{state,dispatch}),
    guidance:h(GuidancePage,{state,dispatch}),
    today:   h(TodayPage,{dark:state.dark}),
    reflect: h(ReflectionPage,{state,dispatch}),
  };

  return h(React.Fragment,null,
    h('style',null,CSS),
    h('div',{className:`app${state.dark?' dk':''}`},
      pages[tab],
      h('div',{className:'nav-wrap'},
        h('nav',{className:'nav'},
          TABS.map(t=>h('button',{key:t.id,className:`nb${tab===t.id?' on':''}`,onClick:()=>setTab(t.id)},
            h(t.I), t.label
          ))
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
