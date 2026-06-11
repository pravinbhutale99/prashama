const { useState, useCallback, useRef, useEffect } = React;

// ── THEME ─────────────────────────────────────────────────────
const T = {
  bg:        '#f0ece4',
  bgDark:    '#1a1714',
  card:      '#ffffff',
  cardDark:  '#2a2522',
  border:    '#e8e3d9',
  borderDark:'#3a3530',
  text:      '#2c2620',
  textDark:  '#e8e3d9',
  muted:     '#9e9689',
  mutedDark: '#6e6a62',
  accent:    '#b07d4a',
  accentDim: '#c4a472',
  navBg:     '#ffffff',
  navBgDark: '#222018',
};

// ── WISDOM DATABASE ───────────────────────────────────────────
const WISDOM = {
  angry:{label:'angry',source:'Bhagavad Gita 2.63',
    verse:'From anger comes delusion. From delusion, loss of memory. From loss of memory, destruction of discrimination — and from that, one perishes.',
    question:'"What am I actually protecting right now?"',
    step:'Pause. Breathe three times before you respond to anything.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  anxious:{label:'anxious',source:'Bhagavad Gita 2.23',
    verse:'What you truly are cannot be harmed. The soul is untouched by weapons, fire, water, or wind.',
    question:'"What is actually happening right now — not in my imagination?"',
    step:'Name five things you can see. Come back to this moment.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  overthinking:{label:'overthinking',source:'Bhagavad Gita 2.47',
    verse:'Focus on the next right action. Release the outcome you cannot hold.',
    question:'"What is one small step I can take right now?"',
    step:'Write down a single next action and close the rest of the tabs.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  distracted:{label:'distracted',source:'Bhagavad Gita 6.26',
    verse:'Wherever the restless mind wanders, gently bring it back. Again and again, quietly return.',
    question:'"What actually matters to me today?"',
    step:'Close one tab. Do one thing for ten minutes without switching.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  lonely:{label:'lonely',source:'Bhagavad Gita 9.29',
    verse:'I am equally present in all beings. Those who turn toward Me with devotion — they are in Me, and I am in them.',
    question:'"Who could I reach out to today — even briefly?"',
    step:'Send one message. Not to explain how you feel. Just to connect.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  unmotivated:{label:'unmotivated',source:'Bhagavad Gita 3.8',
    verse:'Do what must be done. Action is better than inaction. Even the body cannot be maintained without movement.',
    question:'"What is the smallest possible beginning?"',
    step:'Do two minutes of the thing you have been avoiding. Only two minutes.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  peaceful:{label:'peaceful',source:'Bhagavad Gita 6.27',
    verse:'Supreme happiness comes to the one whose mind is still, whose passions are quiet, who has become one with what is.',
    question:'"How can I protect this feeling for the rest of today?"',
    step:'Less input today. Guard the quiet you have found.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  grateful:{label:'grateful',source:'Bhagavad Gita 4.11',
    verse:'In whatever way people come to Me, I meet them there. The Divine meets you exactly where you are.',
    question:'"Who or what made this feeling possible?"',
    step:'Tell one person today that you appreciate them. Specifically.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
};

// ── DHARMA VERSES ─────────────────────────────────────────────
const DHARMA = [
  {source:'Bhagavad Gita 2.47',
   sanskrit:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
   meaning:'"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."',
   reflection:'The effort is yours. The outcome belongs to the universe.'},
  {source:'Bhagavad Gita 18.66',
   sanskrit:'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',
   meaning:'"Abandon all varieties of dharma and simply surrender to Me. I shall free you from all sinful reactions. Do not fear."',
   reflection:'True surrender is not weakness. It is the deepest form of trust.'},
  {source:'Bhagavad Gita 2.20',
   sanskrit:'न जायते म्रियते वा कदाचिन्।',
   meaning:'"The soul is never born nor dies. It is not slain when the body is slain."',
   reflection:'What you truly are is eternal. Only the body is temporary.'},
  {source:'Bhagavad Gita 6.5',
   sanskrit:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',
   meaning:'"Lift yourself up by your own self; do not let yourself fall."',
   reflection:'You are both the one who struggles and the one who can offer a kinder hand.'},
  {source:'Bhagavad Gita 14.25',
   sanskrit:'समः शत्रौ च मित्रे च तथा मानापमानयोः।',
   meaning:'"One equal to friend and foe, in honour and dishonour — such a person has gone beyond."',
   reflection:'Equanimity in all situations is the highest form of spiritual maturity.'},
  {source:'Bhagavad Gita 2.62',
   sanskrit:'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।',
   meaning:'"Contemplating the objects of the senses, one develops attachment. From attachment comes desire, and from desire, suffering."',
   reflection:'What you dwell on, you become. Guard your attention.'},
  {source:'Bhagavad Gita 16.2',
   sanskrit:'अहिंसा सत्यमक्रोधस्त्यागः शान्तिरपैशुनम्।',
   meaning:'"Non-violence, truthfulness, freedom from anger, renunciation, peacefulness — these divine qualities are born within you."',
   reflection:'You do not need to be perfect. Simply move toward these, one day at a time.'},
  {source:'Bhagavad Gita 6.27',
   sanskrit:'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।',
   meaning:'"Supreme happiness comes to the yogi whose mind is peaceful, whose passions are quieted."',
   reflection:'Peace is not something you find. It is something you return to.'},
];

const DEFAULT_MANTRAS = ['Radhe','Hare Krishna','Om Namah Shivaya','Ram','Mahadev'];

function getTodayVerse(){
  const d=new Date();
  const n=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  return DHARMA[n%DHARMA.length];
}

// ── PERSISTENCE ───────────────────────────────────────────────
const KEY='prashama_v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function today(){return new Date().toISOString().slice(0,10);}
function wasYesterday(ds){
  if(!ds)return false;
  const y=new Date();y.setDate(y.getDate()-1);
  return ds===y.toISOString().slice(0,10);
}
function initState(){
  const s=load(),t=today(),nd=s&&s.lastDate!==t;
  const base={count:0,malas:0,lastDate:t,totalCount:0,streak:0,
    reflections:[],lastGuidance:null,
    mantra:'Radhe',mantras:[...DEFAULT_MANTRAS],
    dark:false,beadSound:true,haptic:true};
  if(!s)return base;
  return{...base,...s,lastDate:t,
    count:nd?0:s.count,malas:nd?0:s.malas,
    streak:nd?(wasYesterday(s.lastDate)?(s.streak||0)+1:0):(s.streak||0),
    mantras:s.mantras||[...DEFAULT_MANTRAS]};
}

// ── REDUCER ───────────────────────────────────────────────────
function reducer(state,action){
  let n;
  switch(action.type){
    case'TAP':if(state.count>=108)return state;n={...state,count:state.count+1,totalCount:state.totalCount+1};break;
    case'NEW_MALA':n={...state,count:0,malas:state.malas+1};break;
    case'RESET_DAY':n={...state,count:0,malas:0};break;
    case'SET_MANTRA':n={...state,mantra:action.v};break;
    case'ADD_MANTRA':if(!action.v.trim()||state.mantras.includes(action.v.trim()))return state;
      n={...state,mantras:[...state.mantras,action.v.trim()]};break;
    case'SET_DARK':n={...state,dark:action.v};break;
    case'SET_BEAD':n={...state,beadSound:action.v};break;
    case'SET_HAPTIC':n={...state,haptic:action.v};break;
    case'SET_GUIDANCE':n={...state,lastGuidance:action.p};break;
    case'SAVE_REFLECTION':n={...state,reflections:[...(state.reflections||[]),action.p]};break;
    default:return state;
  }
  save(n);return n;
}

// ── GLOBAL CSS ────────────────────────────────────────────────
const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html,body,#root{height:100%;}
  body{font-family:'Inter',sans-serif;font-weight:300;-webkit-tap-highlight-color:transparent;overscroll-behavior:none;}

  .app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;position:relative;transition:background .3s,color .3s;}
  .app.light{background:#f0ece4;color:#2c2620;}
  .app.dark{background:#1a1714;color:#e8e3d9;}

  .page{flex:1;padding:44px 24px 120px;overflow-y:auto;animation:fu .2s ease;}
  @keyframes fu{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

  /* EYEBROW */
  .eb{display:flex;align-items:center;gap:8px;margin-bottom:12px;}
  .eb-rule{width:20px;height:1px;background:#b07d4a;flex-shrink:0;}
  .eb-text{font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:#b07d4a;}
  .eb-center{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;}
  .eb-center .eb-rule{width:28px;}

  /* HEADINGS */
  .h1{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:400;line-height:1.15;margin-bottom:8px;}
  .h1-lg{font-family:'Cormorant Garamond',serif;font-size:42px;font-weight:400;line-height:1.1;margin-bottom:8px;}
  .sub{font-size:13px;font-weight:300;color:#9e9689;margin-bottom:32px;line-height:1.55;}
  .app.dark .sub{color:#6e6a62;}

  /* CARD */
  .card{border-radius:20px;padding:28px 24px;margin-bottom:14px;}
  .app.light .card{background:#ffffff;box-shadow:0 1px 4px rgba(0,0,0,.05);}
  .app.dark .card{background:#2a2522;box-shadow:0 1px 4px rgba(0,0,0,.2);}

  /* STAT PILLS */
  .spill{border-radius:100px;padding:16px 20px;display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;}
  .app.light .spill{background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,.05);}
  .app.dark .spill{background:#2a2522;}
  .sv{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:400;line-height:1;}
  .sl{font-size:9px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;color:#9e9689;}

  /* RING */
  .rring{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;margin-bottom:20px;}
  .rpulse{position:absolute;inset:-14px;border-radius:50%;background:rgba(176,125,74,.07);opacity:0;pointer-events:none;}
  .ractive{animation:rp .32s ease-out forwards;}
  @keyframes rp{0%{opacity:.5;transform:scale(.93)}100%{opacity:0;transform:scale(1.04)}}

  /* TOP ICON BUTTONS */
  .ico-btn{width:36px;height:36px;border-radius:100px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
  .app.light .ico-btn{background:rgba(176,125,74,.08);color:#9e9689;}
  .app.dark .ico-btn{background:rgba(176,125,74,.12);color:#9e9689;}
  .ico-btn:hover{background:rgba(176,125,74,.15)!important;}

  /* SETTINGS SHEET */
  .sheet-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
  .sheet{width:100%;max-width:430px;border-radius:24px 24px 0 0;padding:24px 20px 40px;max-height:85vh;overflow-y:auto;}
  .app.light .sheet{background:#ffffff;}
  .app.dark .sheet{background:#2a2522;}
  .sheet-handle{width:36px;height:4px;border-radius:2px;background:#e0dbd2;margin:0 auto 20px;}
  .mantra-row{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:12px;margin-bottom:8px;cursor:pointer;border:1.5px solid transparent;font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;}
  .app.light .mantra-row{background:#f7f4ef;}
  .app.dark .mantra-row{background:#332e2a;}
  .mantra-row.sel{border-color:#b07d4a;}
  .add-mantra-row{display:flex;align-items:center;justify-content:center;gap:8px;padding:13px 18px;border-radius:12px;margin-bottom:20px;cursor:pointer;font-size:13px;font-weight:400;letter-spacing:.04em;}
  .app.light .add-mantra-row{background:#f7f4ef;color:#9e9689;}
  .app.dark .add-mantra-row{background:#332e2a;color:#6e6a62;}
  .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:14px 4px;border-bottom:1px solid;}
  .app.light .toggle-row{border-color:#f0ece4;}
  .app.dark .toggle-row{border-color:#3a3530;}
  .toggle-row:last-child{border-bottom:none;}
  .tog{width:44px;height:26px;border-radius:100px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0;}
  .tog.off{background:#d4cfc8;}
  .tog.on{background:#b07d4a;}
  .tog-k{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2);}
  .tog.on .tog-k{transform:translateX(18px);}
  .sheet-note{font-size:12px;color:#9e9689;margin-top:20px;line-height:1.6;padding:0 4px;}

  /* GUIDANCE EMOTION GRID */
  .egrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:28px;}
  .ecard{border-radius:18px;padding:20px 18px 18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;min-height:120px;border:1.5px solid transparent;transition:border-color .15s,box-shadow .15s;}
  .app.light .ecard{background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .app.dark .ecard{background:#2a2522;}
  .ecard.on{border-color:#b07d4a !important;}
  .app.light .ecard.on{box-shadow:0 2px 10px rgba(176,125,74,.12);}
  .edot{width:7px;height:7px;border-radius:50%;background:#c4a472;}
  .elabel{font-family:'Cormorant Garamond',serif;font-size:19px;font-weight:400;color:#2c2620;margin-top:auto;}
  .app.dark .elabel{color:#e8e3d9;}

  /* GUIDANCE RESULT */
  .src-row{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:22px;}
  .src-rule{width:28px;height:1px;background:#c4a472;flex-shrink:0;}
  .src-txt{font-size:10px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;color:#c4a472;}
  .verse-txt{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;line-height:1.7;text-align:center;margin-bottom:18px;}
  .dot-sep{text-align:center;margin:16px 0;color:#c4a472;font-size:18px;line-height:1;}
  .sec-lbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9e9689;text-align:center;margin-bottom:10px;}
  .quiet-q{font-family:'Cormorant Garamond',serif;font-size:18px;font-style:italic;line-height:1.65;text-align:center;margin-bottom:0;}
  .step-txt{font-size:14px;font-weight:300;line-height:1.8;text-align:center;}
  .affirm{font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:#9e9689;text-align:center;line-height:1.7;margin-top:28px;white-space:pre-line;}
  .back-btn{background:none;border:none;cursor:pointer;font-size:13px;font-weight:300;color:#9e9689;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:4px;padding:0;margin-bottom:24px;}

  /* DHARMA */
  .d-src{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#b07d4a;display:flex;align-items:center;gap:7px;margin-bottom:14px;}
  .d-src::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#b07d4a;flex-shrink:0;}
  .d-sk{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;line-height:1.6;margin-bottom:18px;}
  .d-rule{height:1px;margin:16px 0;}
  .app.light .d-rule{background:#f0ece4;}
  .app.dark .d-rule{background:#3a3530;}
  .d-meaning{font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;line-height:1.8;margin-bottom:16px;}
  .d-rlbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9e9689;margin-bottom:8px;}
  .d-refl{font-size:13px;font-weight:300;line-height:1.75;}
  .d-acts{display:flex;align-items:center;gap:10px;margin-top:20px;}
  .btn-listen{background:#2c2620;color:#fff;border:none;border-radius:100px;padding:11px 20px;font-size:13px;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;gap:8px;}
  .app.dark .btn-listen{background:#e8e3d9;color:#2c2620;}
  .btn-ico{width:40px;height:40px;border-radius:100px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid;}
  .app.light .btn-ico{background:#ffffff;border-color:#e8e3d9;}
  .app.dark .btn-ico{background:#2a2522;border-color:#3a3530;}
  .rem-card{border-radius:18px;padding:16px 18px;display:flex;align-items:center;gap:14px;}
  .app.light .rem-card{background:#ffffff;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .app.dark .rem-card{background:#2a2522;}
  .rem-ico{width:38px;height:38px;border-radius:100px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
  .app.light .rem-ico{background:#f7f4ef;}
  .app.dark .rem-ico{background:#332e2a;}

  /* REFLECTION */
  .rf-lbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9e9689;margin-bottom:10px;display:block;}
  .rf-in{width:100%;background:none;border:none;border-bottom:1px solid #e8e3d9;padding:8px 0 12px;font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;font-weight:300;outline:none;color:#2c2620;transition:border-color .15s;}
  .rf-in::placeholder{color:#b0a99e;font-style:italic;}
  .rf-in:focus{border-bottom-color:#b07d4a;}
  .app.dark .rf-in{color:#e8e3d9;border-bottom-color:#3a3530;}
  .app.dark .rf-in::placeholder{color:#5e5a52;}
  .btn-save{width:100%;padding:14px;border-radius:100px;border:none;font-family:'Inter',sans-serif;font-size:14px;font-weight:400;cursor:pointer;transition:background .2s,color .2s;margin-top:6px;}
  .btn-save.off{background:#ccc8c0;color:#fff;cursor:default;}
  .btn-save.on{background:#b07d4a;color:#fff;}
  .past-row{display:flex;align-items:center;gap:10px;margin:28px 0 16px;}
  .past-rule{flex:1;height:1px;background:#e8e3d9;}
  .app.dark .past-rule{background:#3a3530;}
  .past-lbl{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:#9e9689;}
  .past-empty{font-family:'Cormorant Garamond',serif;font-size:15px;font-style:italic;color:#9e9689;line-height:1.6;}

  /* NAV — floating pill */
  .nav-wrap{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:382px;z-index:100;}
  .nav{border-radius:100px;display:flex;padding:5px;box-shadow:0 4px 24px rgba(0,0,0,.1);}
  .app.light .nav{background:#ffffff;}
  .app.dark .nav{background:#222018;}
  .nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px 7px;background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:10px;border-radius:100px;transition:all .15s;color:#9e9689;letter-spacing:.02em;}
  .nb.on{color:#b07d4a;}
  .app.light .nb.on{background:#f0ece4;}
  .app.dark .nb.on{background:#2a2522;}
  .nb svg{width:18px;height:18px;}
`;

// ── ICONS ─────────────────────────────────────────────────────
const Ic={
  Jap:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'5'}),h('path',{d:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'})),
  Guidance:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'10'}),h('path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'})),
  Today:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'5'}),h('path',{d:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'})),
  Reflect:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M12 2a9 9 0 0 1 0 18c-2.39 0-4.68-.94-6.36-2.64'}),h('path',{d:'M2.11 12.4A9 9 0 0 1 12 3'}),h('path',{d:'M6 12l-4 2 2-4'})),
  Settings:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'}),h('path',{d:'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'})),
  Display:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'5'}),h('path',{d:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'})),
  Play:()=>h('svg',{viewBox:'0 0 24 24',fill:'currentColor',width:'13',height:'13'},h('polygon',{points:'5,3 19,12 5,21'})),
  Bookmark:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},h('path',{d:'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'})),
  Share:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},h('circle',{cx:'18',cy:'5',r:'3'}),h('circle',{cx:'6',cy:'12',r:'3'}),h('circle',{cx:'18',cy:'19',r:'3'}),h('path',{d:'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98'})),
  Reset:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'13',height:'13'},h('path',{d:'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}),h('path',{d:'M3 3v5h5'})),
  Check:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'#b07d4a',strokeWidth:'2',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},h('polyline',{points:'20 6 9 17 4 12'})),
  Plus:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',width:'14',height:'14'},h('line',{x1:'12',y1:'5',x2:'12',y2:'19'}),h('line',{x1:'5',y1:'12',x2:'19',y2:'12'})),
  Sound:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},h('polygon',{points:'11 5 6 9 2 9 2 15 6 15 11 19 11 5'}),h('path',{d:'M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07'})),
  Vibrate:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},h('path',{d:'M8 19H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3'}),h('path',{d:'M16 5h3c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3'}),h('rect',{x:'8',y:'2',width:'8',height:'20',rx:'2'})),
  Moon:()=>h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},h('path',{d:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'})),
};

const h=React.createElement;

// ── EYEBROW ───────────────────────────────────────────────────
function Eb({text,center}){
  if(center)return h('div',{className:'eb-center'},h('div',{className:'eb-rule'}),h('span',{className:'eb-text'},text),h('div',{className:'eb-rule'}));
  return h('div',{className:'eb'},h('div',{className:'eb-rule'}),h('span',{className:'eb-text'},text));
}

// ── TOGGLE ────────────────────────────────────────────────────
function Tog({on,onChange}){
  return h('button',{className:`tog ${on?'on':'off'}`,onClick:()=>onChange(!on)},h('div',{className:'tog-k'}));
}

// ── SETTINGS SHEET ────────────────────────────────────────────
function SettingsSheet({state,dispatch,onClose}){
  const [adding,setAdding]=useState(false);
  const [newM,setNewM]=useState('');

  function addMantra(){
    if(!newM.trim())return;
    dispatch({type:'ADD_MANTRA',v:newM.trim()});
    setNewM('');setAdding(false);
  }

  return h('div',{className:'sheet-overlay',onClick:e=>{if(e.target===e.currentTarget)onClose()}},
    h('div',{className:'sheet'},
      h('div',{className:'sheet-handle'}),
      // mantra list
      state.mantras.map(m=>h('div',{key:m,className:`mantra-row${state.mantra===m?' sel':''}`,onClick:()=>{dispatch({type:'SET_MANTRA',v:m});}},
        m,
        state.mantra===m&&h(Ic.Check)
      )),
      // add mantra
      adding
        ? h('div',{style:{marginBottom:20}},
            h('input',{autoFocus:true,value:newM,onChange:e=>setNewM(e.target.value),
              onKeyDown:e=>{if(e.key==='Enter')addMantra();if(e.key==='Escape'){setAdding(false);setNewM('');}},
              placeholder:'Type your mantra…',
              style:{width:'100%',background:'none',border:'none',borderBottom:'1px solid #e8e3d9',padding:'10px 0',fontFamily:'Cormorant Garamond,serif',fontSize:'18px',outline:'none',color:'inherit'}}),
            h('div',{style:{display:'flex',gap:10,marginTop:10}},
              h('button',{onClick:addMantra,style:{flex:1,padding:'10px',borderRadius:'100px',border:'none',background:'#b07d4a',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:'13px',cursor:'pointer'}},'Add'),
              h('button',{onClick:()=>{setAdding(false);setNewM('');},style:{flex:1,padding:'10px',borderRadius:'100px',border:'1px solid #e8e3d9',background:'none',fontFamily:'Inter,sans-serif',fontSize:'13px',cursor:'pointer',color:'#9e9689'}},'Cancel')
            )
          )
        : h('div',{className:'add-mantra-row',onClick:()=>setAdding(true)},
            h(Ic.Plus),' ADD YOUR MANTRA'
          ),
      // toggles
      h('div',null,
        h('div',{className:'toggle-row'},
          h('div',{style:{display:'flex',alignItems:'center',gap:10,fontSize:14}},h(Ic.Sound),'Bead click sound'),
          h(Tog,{on:state.beadSound,onChange:v=>dispatch({type:'SET_BEAD',v})})
        ),
        h('div',{className:'toggle-row'},
          h('div',{style:{display:'flex',alignItems:'center',gap:10,fontSize:14}},h(Ic.Vibrate),'Haptic feedback'),
          h(Tog,{on:state.haptic,onChange:v=>dispatch({type:'SET_HAPTIC',v})})
        ),
        h('div',{className:'toggle-row'},
          h('div',{style:{display:'flex',alignItems:'center',gap:10,fontSize:14}},h(Ic.Moon),'Dark mode'),
          h(Tog,{on:state.dark,onChange:v=>dispatch({type:'SET_DARK',v})})
        )
      ),
      h('p',{className:'sheet-note'},'Volume buttons count inside the mobile app. On web, Space or arrow keys also count.')
    )
  );
}

// ── JAP PAGE ──────────────────────────────────────────────────
function JapPage({state,dispatch}){
  const {count,malas,streak,mantra}=state;
  const [showSettings,setShowSettings]=useState(false);
  const ripRef=useRef(null);
  const R=105,circ=2*Math.PI*R,offset=circ*(1-count/108),done=count>=108;

  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    if(ripRef.current){ripRef.current.classList.remove('ractive');void ripRef.current.offsetWidth;ripRef.current.classList.add('ractive');}
  }

  // keyboard: space/arrow keys count
  useEffect(()=>{
    function onKey(e){
      if(e.code==='Space'||e.code==='ArrowDown'||e.code==='ArrowRight'){e.preventDefault();tap();}
    }
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[count,done]);

  return h('div',{className:'page',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
    // header row
    h('div',{style:{width:'100%',display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}},
      h('div',null,
        h(Eb,{text:'Jap'}),
        h('div',{className:'h1'},'A quiet practice')
      ),
      h('div',{style:{display:'flex',gap:8,paddingTop:4}},
        h('button',{className:'ico-btn',onClick:()=>setShowSettings(true)},h(Ic.Settings)),
        h('button',{className:'ico-btn',onClick:()=>dispatch({type:'SET_DARK',v:!state.dark})},h(Ic.Display))
      )
    ),
    // stat pills
    h('div',{style:{display:'flex',gap:10,marginBottom:44,width:'100%',marginTop:16}},
      [{v:count,l:'Today'},{v:malas,l:'Malas'},{v:`${streak}d`,l:'Streak'}].map(s=>
        h('div',{key:s.l,className:'spill'},h('div',{className:'sv'},s.v),h('div',{className:'sl'},s.l))
      )
    ),
    // ring
    h('div',{className:'rring',onClick:tap,style:{width:260,height:260,position:'relative',marginBottom:12}},
      h('div',{ref:ripRef,className:'rpulse'}),
      h('svg',{width:260,height:260,style:{position:'absolute',top:0,left:0}},
        h('circle',{cx:130,cy:130,r:R,fill:'none',stroke:state.dark?'#3a3530':'#e8e3d9',strokeWidth:'1'}),
        count>0&&h('circle',{cx:130,cy:130,r:R,fill:'none',
          stroke:'#b07d4a',strokeWidth:'1.5',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:offset,
          transform:'rotate(-90 130 130)',
          style:{transition:'stroke-dashoffset .15s ease'}})
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}},
        done
          ? h(React.Fragment,null,
              h('div',{style:{fontSize:38}},'🙏'),
              h('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:'#b07d4a',marginTop:10,letterSpacing:'.1em',textTransform:'uppercase'}},`${malas} mala${malas!==1?'s':''} complete`)
            )
          : h(React.Fragment,null,
              h('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:36,fontWeight:400,letterSpacing:'.02em'}},mantra||'Radhe'),
              h('div',{style:{fontSize:13,color:'#9e9689',marginTop:7,letterSpacing:'.04em'}},`${count} / 108`)
            )
      )
    ),
    // tap hint
    !done&&h('div',{style:{fontSize:11,fontWeight:500,letterSpacing:'.15em',textTransform:'uppercase',color:'#9e9689',marginBottom:18,marginTop:8}},'Tap to count'),
    // reset
    h('button',{
      onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'});},
      style:{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,color:'#9e9689',fontSize:13,fontFamily:'Inter,sans-serif',fontWeight:300}},
      h(Ic.Reset),'Reset today'
    ),
    done&&h('div',{style:{marginTop:28,textAlign:'center'}},
      h('button',{onClick:()=>dispatch({type:'NEW_MALA'}),
        style:{background:'#b07d4a',color:'#fff',border:'none',borderRadius:'100px',padding:'11px 28px',fontFamily:'Inter,sans-serif',fontSize:13,cursor:'pointer'}},
        'Begin next mala')
    ),
    showSettings&&h(SettingsSheet,{state,dispatch,onClose:()=>setShowSettings(false)})
  );
}

// ── GUIDANCE PAGE ─────────────────────────────────────────────
const EMOTIONS=Object.entries(WISDOM).map(([id,w])=>({id,label:w.label}));

function GuidancePage({state,dispatch}){
  const [sel,setSel]=useState(null);
  const [view,setView]=useState('select');

  useEffect(()=>{
    if(state.lastGuidance?.date===today()){setSel(state.lastGuidance.emotion);setView('result');}
  },[]);

  function receive(){if(!sel)return;dispatch({type:'SET_GUIDANCE',p:{date:today(),emotion:sel}});setView('result');}
  function back(){setSel(null);setView('select');}

  if(view==='select') return h('div',{className:'page'},
    h(Eb,{text:'Guidance'}),
    h('div',{className:'h1-lg'},'How are you, really?'),
    h('p',{className:'sub'},"Choose what's closest. A quiet verse will meet you there — no rush."),
    h('div',{className:'egrid'},
      EMOTIONS.map(e=>h('div',{key:e.id,className:`ecard${sel===e.id?' on':''}`,onClick:()=>setSel(e.id)},
        h('div',{className:'edot'}),
        h('div',{className:'elabel'},e.label)
      ))
    ),
    sel&&h('button',{onClick:receive,
      style:{width:'100%',padding:'14px',borderRadius:'100px',border:'none',background:'#b07d4a',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:14,fontWeight:400,cursor:'pointer'}},
      'Continue')
  );

  const w=WISDOM[sel];
  return h('div',{className:'page'},
    h('button',{className:'back-btn',onClick:back},'← back'),
    h(Eb,{text:'You feel',center:true}),
    h('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:42,fontWeight:400,textAlign:'center',marginBottom:32}},w.label),
    h('div',{className:'card'},
      h('div',{className:'src-row'},h('div',{className:'src-rule'}),h('span',{className:'src-txt'},w.source),h('div',{className:'src-rule'})),
      h('div',{className:'verse-txt'},w.verse),
      h('div',{className:'dot-sep'},'·'),
      h('div',{className:'sec-lbl'},'A quiet question'),
      h('div',{className:'quiet-q'},w.question),
      h('div',{className:'dot-sep'},'·'),
      h('div',{className:'sec-lbl'},'One small step'),
      h('div',{className:'step-txt'},w.step)
    ),
    h('div',{className:'affirm'},w.affirmation)
  );
}

// ── TODAY PAGE ────────────────────────────────────────────────
function TodayPage({dark}){
  const v=getTodayVerse();
  const [reminder,setReminder]=useState(false);
  const d=new Date();
  const dow=d.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase();
  const mo=d.toLocaleDateString('en-US',{month:'long',day:'numeric'}).toUpperCase();

  function share(){
    const t=`${v.meaning}\n\n— ${v.source}\n\nPrashama 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied'));
  }

  return h('div',{className:'page'},
    h(Eb,{text:`${dow}, ${mo}`}),
    h('div',{className:'h1'},"Today's Dharma"),
    h('p',{className:'sub'},'One verse. One breath at a time.'),
    h('div',{className:'card'},
      h('div',{className:'d-src'},v.source),
      h('div',{className:'d-sk'},v.sanskrit),
      h('div',{className:'d-rule'}),
      h('div',{className:'d-meaning'},v.meaning),
      h('div',{className:'d-rlbl'},'Reflection'),
      h('div',{className:'d-refl'},v.reflection),
      h('div',{className:'d-acts'},
        h('button',{className:'btn-listen'},h(Ic.Play),' Listen'),
        h('div',{className:'btn-ico',onClick:()=>{}},h(Ic.Bookmark)),
        h('div',{className:'btn-ico',onClick:share},h(Ic.Share))
      )
    ),
    h('div',{className:'rem-card'},
      h('div',{className:'rem-ico'},'🔔'),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:14,fontWeight:400,marginBottom:2}},'Daily Dharma reminders'),
        h('div',{style:{fontSize:12,color:'#9e9689',fontWeight:300,lineHeight:1.5}},'A gentle nudge each morning — never more than one.')
      ),
      h(Tog,{on:reminder,onChange:setReminder})
    )
  );
}

// ── REFLECTION PAGE ───────────────────────────────────────────
function ReflectionPage({state,dispatch}){
  const [g,setG]=useState('');
  const [p,setP]=useState('');
  const [l,setL]=useState('');
  const [saved,setSaved]=useState(false);
  const has=g.trim()||p.trim()||l.trim();

  function doSave(){
    if(!has)return;
    dispatch({type:'SAVE_REFLECTION',p:{date:new Date().toISOString(),grateful:g,peaceful:p,lesson:l}});
    setG('');setP('');setL('');setSaved(true);setTimeout(()=>setSaved(false),2000);
  }

  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
  const recent=(state.reflections||[]).filter(r=>new Date(r.date)>=cutoff).slice(-5).reverse();

  return h('div',{className:'page'},
    h(Eb,{text:'Reflection'}),
    h('div',{className:'h1'},'Three quiet gratitudes'),
    h('p',{className:'sub'},'A small, soft ritual. Write only what comes easily.'),
    h('div',{className:'card'},
      h('div',{style:{marginBottom:22}},
        h('span',{className:'rf-lbl'},'Grateful for'),
        h('input',{className:'rf-in',placeholder:'A quiet morning, an honest conversation…',value:g,onChange:e=>setG(e.target.value)})
      ),
      h('div',{style:{marginBottom:22}},
        h('span',{className:'rf-lbl'},'Something peaceful'),
        h('input',{className:'rf-in',placeholder:'A pause that felt like home…',value:p,onChange:e=>setP(e.target.value)})
      ),
      h('div',{style:{marginBottom:22}},
        h('span',{className:'rf-lbl'},'One lesson'),
        h('input',{className:'rf-in',placeholder:'What today gently taught me…',value:l,onChange:e=>setL(e.target.value)})
      ),
      h('button',{className:`btn-save ${has?'on':'off'}`,disabled:!has,onClick:doSave},saved?'Saved ✓':'Save reflection')
    ),
    h('div',{className:'past-row'},
      h('div',{className:'past-rule'}),
      h('span',{className:'past-lbl'},'Past reflections'),
      h('div',{className:'past-rule'})
    ),
    recent.length===0
      ? h('div',{className:'past-empty'},'Your reflections will gather here, quietly.')
      : recent.map((r,i)=>h('div',{key:i,style:{marginBottom:16,paddingBottom:16,borderBottom:'1px solid #e8e3d9'}},
          h('div',{style:{fontSize:11,color:'#9e9689',marginBottom:6}},new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})),
          r.grateful&&h('div',{style:{fontSize:13,lineHeight:1.65,marginBottom:3}},r.grateful),
          r.peaceful&&h('div',{style:{fontSize:13,lineHeight:1.65,marginBottom:3}},r.peaceful),
          r.lesson&&h('div',{style:{fontSize:13,lineHeight:1.65}},r.lesson)
        ))
  );
}

// ── TABS ──────────────────────────────────────────────────────
const TABS=[
  {id:'jap',    label:'Jap',        Ico:Ic.Jap},
  {id:'guidance',label:'Guidance',  Ico:Ic.Guidance},
  {id:'today',  label:'Today',      Ico:Ic.Today},
  {id:'reflect',label:'Reflection', Ico:Ic.Reflect},
];

// ── APP ROOT ──────────────────────────────────────────────────
function App(){
  const [tab,setTab]=useState('jap');
  const [state,setState]=useState(initState);
  const dispatch=useCallback(a=>setState(p=>reducer(p,a)),[]);

  const cls=`app ${state.dark?'dark':'light'}`;
  const pages={
    jap:h(JapPage,{state,dispatch}),
    guidance:h(GuidancePage,{state,dispatch}),
    today:h(TodayPage,{dark:state.dark}),
    reflect:h(ReflectionPage,{state,dispatch}),
  };

  return h(React.Fragment,null,
    h('style',null,CSS),
    h('div',{className:cls},
      pages[tab],
      h('div',{className:'nav-wrap'},
        h('nav',{className:'nav'},
          TABS.map(t=>h('button',{key:t.id,className:`nb${tab===t.id?' on':''}`,onClick:()=>setTab(t.id)},
            h(t.Ico),t.label
          ))
        )
      )
    )
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));
