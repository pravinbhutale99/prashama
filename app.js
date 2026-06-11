const { useState, useCallback, useRef, useEffect } = React;
const h = React.createElement;

// ── EXACT THEME FROM REFERENCE SCREENSHOTS ────────────────────
const T = {
  bg:         '#f5f0e8',   // very light warm cream — matches reference exactly
  card:       '#ffffff',
  cardAlt:    '#faf8f5',   // emotion cards bg
  border:     '#ede8df',   // very soft border
  text:       '#2d2420',   // dark warm brown
  muted:      '#a09485',   // medium warm grey
  mutedLight: '#b8afa4',   // lighter muted for placeholders
  accent:     '#c4a267',   // gold — eyebrows, dots, active nav
  navBg:      '#ffffff',
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

const DHARMA = [
  {source:'Bhagavad Gita 2.47',sanskrit:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',meaning:'"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."',reflection:'The effort is yours. The outcome belongs to the universe.'},
  {source:'Bhagavad Gita 18.66',sanskrit:'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',meaning:'"Abandon all varieties of dharma and simply surrender to Me. I shall free you from all sinful reactions. Do not fear."',reflection:'True surrender is not weakness. It is the deepest form of trust.'},
  {source:'Bhagavad Gita 2.20',sanskrit:'न जायते म्रियते वा कदाचिन्।',meaning:'"The soul is never born nor dies. It is not slain when the body is slain."',reflection:'What you truly are is eternal. Only the body is temporary.'},
  {source:'Bhagavad Gita 6.5',sanskrit:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',meaning:'"Lift yourself up by your own self; do not let yourself fall."',reflection:'You are both the one who struggles and the one who can offer a kinder hand.'},
  {source:'Bhagavad Gita 14.25',sanskrit:'समः शत्रौ च मित्रे च तथा मानापमानयोः।',meaning:'"One equal to friend and foe, in honour and dishonour — such a person has gone beyond."',reflection:'Equanimity in all situations is the highest form of spiritual maturity.'},
  {source:'Bhagavad Gita 2.62',sanskrit:'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।',meaning:'"Contemplating the objects of the senses, one develops attachment. From attachment comes desire, and from desire, suffering."',reflection:'What you dwell on, you become. Guard your attention.'},
  {source:'Bhagavad Gita 16.2',sanskrit:'अहिंसा सत्यमक्रोधस्त्यागः शान्तिरपैशुनम्।',meaning:'"Non-violence, truthfulness, freedom from anger, renunciation, peacefulness — these divine qualities are born within you."',reflection:'You do not need to be perfect. Simply move toward these, one day at a time.'},
  {source:'Bhagavad Gita 6.27',sanskrit:'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।',meaning:'"Supreme happiness comes to the yogi whose mind is peaceful, whose passions are quieted."',reflection:'Peace is not something you find. It is something you return to.'},
];

const DEFAULT_MANTRAS = ['Radhe','Hare Krishna','Om Namah Shivaya','Ram','Mahadev'];

function getTodayVerse(){
  const d=new Date(), n=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  return DHARMA[n%DHARMA.length];
}

// ── PERSISTENCE ───────────────────────────────────────────────
const KEY='prashama_v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function today(){return new Date().toISOString().slice(0,10);}
function wasYesterday(ds){if(!ds)return false;const y=new Date();y.setDate(y.getDate()-1);return ds===y.toISOString().slice(0,10);}
function initState(){
  const s=load(),t=today(),nd=s&&s.lastDate!==t;
  const base={count:0,malas:0,lastDate:t,totalCount:0,streak:0,reflections:[],lastGuidance:null,mantra:'Radhe',mantras:[...DEFAULT_MANTRAS],dark:false,beadSound:true,haptic:true};
  if(!s)return base;
  return{...base,...s,lastDate:t,count:nd?0:s.count,malas:nd?0:s.malas,streak:nd?(wasYesterday(s.lastDate)?(s.streak||0)+1:0):(s.streak||0),mantras:s.mantras||[...DEFAULT_MANTRAS]};
}

function reducer(state,action){
  let n;
  switch(action.type){
    case'TAP':if(state.count>=108)return state;n={...state,count:state.count+1,totalCount:state.totalCount+1};break;
    case'NEW_MALA':n={...state,count:0,malas:state.malas+1};break;
    case'RESET_DAY':n={...state,count:0,malas:0};break;
    case'SET_MANTRA':n={...state,mantra:action.v};break;
    case'ADD_MANTRA':if(!action.v.trim()||state.mantras.includes(action.v.trim()))return state;n={...state,mantras:[...state.mantras,action.v.trim()]};break;
    case'SET_DARK':n={...state,dark:action.v};break;
    case'SET_BEAD':n={...state,beadSound:action.v};break;
    case'SET_HAPTIC':n={...state,haptic:action.v};break;
    case'SET_GUIDANCE':n={...state,lastGuidance:action.p};break;
    case'SAVE_REFLECTION':n={...state,reflections:[...(state.reflections||[]),action.p]};break;
    default:return state;
  }
  save(n);return n;
}

// ── CSS — matched exactly to reference screenshots ────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior: none;
    background: #f5f0e8;
    color: #2d2420;
  }

  .app {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f0e8;
    color: #2d2420;
  }
  .app.dark {
    background: #1c1917;
    color: #e8e3d9;
  }

  /* PAGE */
  .page {
    flex: 1;
    padding: 44px 24px 108px;
    overflow-y: auto;
    animation: fu .18s ease;
  }
  @keyframes fu { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:translateY(0); } }

  /* EYEBROW — exactly as in reference: short rule + spaced caps */
  .eb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .eb-line {
    width: 22px;
    height: 1px;
    background: #c4a267;
    flex-shrink: 0;
  }
  .eb-txt {
    font-family: 'Inter', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: #c4a267;
  }
  /* centered eyebrow with rules both sides */
  .eb-c {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .eb-c .eb-line { width: 28px; }

  /* HEADINGS — Cormorant light, matches reference weight exactly */
  .title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 300;
    line-height: 1.18;
    color: #2d2420;
    margin-bottom: 8px;
    letter-spacing: -.01em;
  }
  .app.dark .title { color: #e8e3d9; }

  .title-xl {
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px;
    font-weight: 300;
    line-height: 1.1;
    color: #2d2420;
    margin-bottom: 8px;
    letter-spacing: -.01em;
  }
  .app.dark .title-xl { color: #e8e3d9; }

  .subtitle {
    font-size: 13px;
    font-weight: 300;
    color: #a09485;
    line-height: 1.55;
    margin-bottom: 30px;
  }

  /* STAT PILLS — matches reference: white pill, number large Cormorant, label tiny caps */
  .spill {
    flex: 1;
    background: #ffffff;
    border-radius: 100px;
    padding: 14px 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,.04);
  }
  .app.dark .spill { background: #2a2522; }
  .sv {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 300;
    line-height: 1;
    color: #2d2420;
  }
  .app.dark .sv { color: #e8e3d9; }
  .sl {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: #a09485;
  }

  /* RING */
  .rring {
    position: relative;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .rpulse {
    position: absolute;
    inset: -14px;
    border-radius: 50%;
    background: rgba(196,162,103,.06);
    opacity: 0;
    pointer-events: none;
  }
  .ractive { animation: rp .3s ease-out forwards; }
  @keyframes rp { 0%{opacity:.45;transform:scale(.93)} 100%{opacity:0;transform:scale(1.04)} }

  /* ICON BUTTONS top-right */
  .ico-btn {
    width: 36px;
    height: 36px;
    border-radius: 100px;
    border: none;
    background: rgba(196,162,103,.1);
    color: #a09485;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .ico-btn svg { width: 16px; height: 16px; }

  /* SETTINGS SHEET */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.3);
    z-index: 200;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .sheet {
    width: 100%;
    max-width: 430px;
    background: #ffffff;
    border-radius: 24px 24px 0 0;
    padding: 20px 20px 40px;
    max-height: 82vh;
    overflow-y: auto;
  }
  .app.dark .sheet { background: #27221f; }
  .sheet-drag {
    width: 34px; height: 4px; border-radius: 2px;
    background: #e0dbd2; margin: 0 auto 18px;
  }
  .m-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 16px;
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 300;
    color: #2d2420;
    background: #f7f3ec;
    border: 1.5px solid transparent;
  }
  .app.dark .m-row { background: #332e2a; color: #e8e3d9; }
  .m-row.sel { border-color: #c4a267; }
  .m-add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #a09485;
    background: #f7f3ec;
  }
  .app.dark .m-add { background: #332e2a; }
  .t-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 4px;
    border-bottom: 1px solid #f0ece4;
    font-size: 13px;
    font-weight: 300;
    color: #2d2420;
  }
  .app.dark .t-row { border-color: #3a3530; color: #e8e3d9; }
  .t-row:last-child { border-bottom: none; }
  .t-row-left { display: flex; align-items: center; gap: 9px; }
  .tog {
    width: 42px; height: 24px; border-radius: 100px;
    border: none; cursor: pointer; position: relative;
    transition: background .18s; flex-shrink: 0;
  }
  .tog.off { background: #d4cfc8; }
  .tog.on  { background: #c4a267; }
  .tog-k {
    position: absolute; top: 3px; left: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; transition: transform .18s;
    box-shadow: 0 1px 2px rgba(0,0,0,.15);
  }
  .tog.on .tog-k { transform: translateX(18px); }
  .sheet-note {
    font-size: 11px; color: #a09485; margin-top: 18px;
    line-height: 1.6; padding: 0 2px;
  }

  /* EMOTION CARDS — matches reference exactly */
  .egrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 28px;
  }
  .ecard {
    background: #faf8f5;
    border-radius: 16px;
    padding: 14px 14px 16px;
    min-height: 130px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    border: 1.5px solid transparent;
    box-shadow: 0 1px 2px rgba(0,0,0,.03);
    transition: border-color .12s;
  }
  .app.dark .ecard { background: #27221f; }
  .ecard.on { border-color: #c4a267; }
  .e-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #c4a267;
  }
  .e-label {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 300;
    color: #2d2420;
    margin-top: auto;
    padding-top: 24px;
  }
  .app.dark .e-label { color: #e8e3d9; }

  /* GUIDANCE RESULT CARD */
  .g-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 28px 24px 28px;
    box-shadow: 0 1px 4px rgba(0,0,0,.05);
    margin-bottom: 0;
  }
  .app.dark .g-card { background: #27221f; }
  .g-src {
    display: flex; align-items: center; justify-content: center;
    gap: 10px; margin-bottom: 22px;
  }
  .g-src-line { width: 28px; height: 1px; background: #c4a267; }
  .g-src-txt {
    font-size: 10px; font-weight: 500; letter-spacing: .15em;
    text-transform: uppercase; color: #c4a267;
  }
  .g-verse {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px; font-weight: 300; line-height: 1.72;
    text-align: center; color: #2d2420; margin-bottom: 20px;
  }
  .app.dark .g-verse { color: #e8e3d9; }
  .g-dotsep {
    display: flex; justify-content: center;
    margin: 16px 0;
  }
  .g-dotsep::after {
    content: '·'; font-size: 18px; color: #c4a267; line-height: 1;
  }
  .g-lbl {
    font-size: 10px; font-weight: 500; letter-spacing: .14em;
    text-transform: uppercase; color: #a09485;
    text-align: center; margin-bottom: 10px;
  }
  .g-q {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-style: italic; font-weight: 300;
    line-height: 1.65; text-align: center; color: #2d2420;
  }
  .app.dark .g-q { color: #e8e3d9; }
  .g-step {
    font-size: 13px; font-weight: 300; line-height: 1.8;
    text-align: center; color: #2d2420;
  }
  .app.dark .g-step { color: #d0cbc4; }
  .g-affirm {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px; font-style: italic; font-weight: 300;
    color: #a09485; text-align: center;
    line-height: 1.7; margin-top: 28px; white-space: pre-line;
  }

  /* DHARMA CARD */
  .d-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 24px 22px;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    margin-bottom: 12px;
  }
  .app.dark .d-card { background: #27221f; }
  .d-src {
    display: flex; align-items: center; gap: 7px;
    font-size: 10px; font-weight: 500; letter-spacing: .14em;
    text-transform: uppercase; color: #c4a267;
    margin-bottom: 14px;
  }
  .d-src::before {
    content: ''; display: inline-block;
    width: 7px; height: 7px; border-radius: 50%; background: #c4a267; flex-shrink: 0;
  }
  .d-sk {
    font-family: 'Cormorant Garamond', serif;
    font-size: 21px; font-weight: 300; line-height: 1.6; margin-bottom: 16px;
  }
  .d-div { height: 1px; background: #f0ece4; margin: 14px 0; }
  .app.dark .d-div { background: #3a3530; }
  .d-meaning {
    font-family: 'Cormorant Garamond', serif;
    font-size: 15px; font-style: italic; font-weight: 300;
    line-height: 1.8; margin-bottom: 14px;
  }
  .d-rlbl {
    font-size: 10px; font-weight: 500; letter-spacing: .13em;
    text-transform: uppercase; color: #a09485; margin-bottom: 7px;
  }
  .d-refl {
    font-size: 13px; font-weight: 300; line-height: 1.75; margin-bottom: 18px;
  }
  .d-acts { display: flex; align-items: center; gap: 9px; }
  .d-listen {
    background: #2d2420; color: #fff; border: none;
    border-radius: 100px; padding: 10px 18px;
    font-size: 12px; font-family: 'Inter',sans-serif;
    cursor: pointer; display: flex; align-items: center; gap: 7px;
  }
  .app.dark .d-listen { background: #e8e3d9; color: #2d2420; }
  .d-ico {
    width: 38px; height: 38px; border-radius: 100px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; background: #ffffff; border: 1px solid #ede8df;
  }
  .app.dark .d-ico { background: #2a2522; border-color: #3a3530; }
  .rem {
    background: #ffffff; border-radius: 18px; padding: 14px 16px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,.04);
  }
  .app.dark .rem { background: #27221f; }
  .rem-ico {
    width: 36px; height: 36px; border-radius: 100px;
    background: #f5f0e8; display: flex; align-items: center;
    justify-content: center; font-size: 16px; flex-shrink: 0;
  }
  .app.dark .rem-ico { background: #332e2a; }

  /* REFLECTION CARD */
  .rf-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 22px 20px 20px;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
    margin-bottom: 0;
  }
  .app.dark .rf-card { background: #27221f; }
  .rf-lbl {
    font-size: 10px; font-weight: 500; letter-spacing: .14em;
    text-transform: uppercase; color: #a09485;
    margin-bottom: 8px; display: block;
  }
  .rf-in {
    width: 100%; background: none; border: none;
    border-bottom: 1px solid #ede8df;
    padding: 6px 0 10px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-style: italic; font-weight: 300;
    color: #2d2420; outline: none;
    transition: border-color .15s;
    margin-bottom: 18px;
  }
  .app.dark .rf-in { color: #e8e3d9; border-bottom-color: #3a3530; }
  .rf-in:focus { border-bottom-color: #c4a267; }
  .rf-in::placeholder { color: #b8afa4; font-style: italic; }
  .app.dark .rf-in::placeholder { color: #5e5a52; }
  .btn-save {
    width: 100%; padding: 13px; border-radius: 100px;
    border: none; font-family: 'Inter',sans-serif;
    font-size: 13px; font-weight: 300; cursor: pointer;
    transition: background .18s;
    background: #ccc7be; color: #ffffff;
  }
  .btn-save.active { background: #c4a267; }
  .past-row {
    display: flex; align-items: center; gap: 8px; margin: 26px 0 14px;
  }
  .past-line { flex: 1; height: 1px; background: #ede8df; }
  .app.dark .past-line { background: #3a3530; }
  .past-lbl {
    font-size: 10px; font-weight: 500; letter-spacing: .14em;
    text-transform: uppercase; color: #a09485;
  }
  .past-empty {
    font-family: 'Cormorant Garamond', serif;
    font-size: 14px; font-style: italic; font-weight: 300;
    color: #a09485; line-height: 1.6;
  }

  /* BACK LINK */
  .back {
    background: none; border: none; cursor: pointer;
    font-size: 13px; font-weight: 300; color: #a09485;
    font-family: 'Inter',sans-serif; padding: 0;
    display: flex; align-items: center; gap: 4px;
    margin-bottom: 22px;
  }

  /* CONTINUE BUTTON */
  .btn-continue {
    width: 100%; padding: 13px; border-radius: 100px;
    border: none; background: #c4a267; color: #fff;
    font-family: 'Inter',sans-serif; font-size: 13px;
    font-weight: 300; cursor: pointer;
  }

  /* NAV — floating pill, matches reference exactly */
  .nav-wrap {
    position: fixed; bottom: 14px; left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 40px); max-width: 390px;
    z-index: 100;
  }
  .nav {
    background: #ffffff;
    border-radius: 100px;
    display: flex;
    padding: 5px;
    box-shadow: 0 3px 18px rgba(0,0,0,.09);
  }
  .app.dark .nav { background: #222018; }
  .nb {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 2px;
    padding: 8px 4px 7px;
    background: none; border: none; cursor: pointer;
    color: #a09485; font-family: 'Inter',sans-serif;
    font-size: 10px; font-weight: 300;
    border-radius: 100px;
    transition: color .15s;
    letter-spacing: .01em;
  }
  .nb.on { color: #c4a267; }
  .nb svg { width: 17px; height: 17px; }
`;

// ── ICONS ─────────────────────────────────────────────────────
const Ico = {
  Jap: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M12 2l2.09 6.26L21 10l-5.45 4.27L17.18 21 12 17.27 6.82 21l1.63-6.73L3 10l6.91-1.74z'})),
  Guidance: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'10'}),h('path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'})),
  Today: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'4'}),h('path',{d:'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'})),
  Reflect: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('path',{d:'M12 22C6.48 22 2 17.52 2 12c0-2.76 1.12-5.26 2.93-7.07'}),h('path',{d:'M12 2c5.52 0 10 4.48 10 10 0 2.76-1.12 5.26-2.93 7.07'}),h('path',{d:'M8 12l2 2 4-4'})),
  Settings: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'3'}),h('path',{d:'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'})),
  Sun: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},h('circle',{cx:'12',cy:'12',r:'4'}),h('path',{d:'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41'})),
  Play: () => h('svg',{viewBox:'0 0 24 24',fill:'currentColor',width:'12',height:'12'},h('polygon',{points:'5,3 19,12 5,21'})),
  Bookmark: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'15',height:'15'},h('path',{d:'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'})),
  Share: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'15',height:'15'},h('circle',{cx:'18',cy:'5',r:'3'}),h('circle',{cx:'6',cy:'12',r:'3'}),h('circle',{cx:'18',cy:'19',r:'3'}),h('path',{d:'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98'})),
  Reset: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'13',height:'13'},h('path',{d:'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}),h('path',{d:'M3 3v5h5'})),
  Check: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'#c4a267',strokeWidth:'2',strokeLinecap:'round',strokeLinejoin:'round',width:'15',height:'15'},h('polyline',{points:'20 6 9 17 4 12'})),
  Plus: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',width:'13',height:'13'},h('line',{x1:'12',y1:'5',x2:'12',y2:'19'}),h('line',{x1:'5',y1:'12',x2:'19',y2:'12'})),
  Sound: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'15',height:'15'},h('polygon',{points:'11 5 6 9 2 9 2 15 6 15 11 19 11 5'}),h('path',{d:'M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07'})),
  Haptic: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'15',height:'15'},h('path',{d:'M8 19H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3'}),h('path',{d:'M16 5h3c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2h-3'}),h('rect',{x:'8',y:'2',width:'8',height:'20',rx:'2'})),
  Moon: () => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'15',height:'15'},h('path',{d:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'})),
};

// ── TOGGLE ────────────────────────────────────────────────────
function Tog({on,onChange}){
  return h('button',{className:`tog ${on?'on':'off'}`,onClick:()=>onChange(!on)},h('div',{className:'tog-k'}));
}

// ── EYEBROW ───────────────────────────────────────────────────
function Eb({text,center}){
  if(center) return h('div',{className:'eb-c'},h('div',{className:'eb-line'}),h('span',{className:'eb-txt'},text),h('div',{className:'eb-line'}));
  return h('div',{className:'eb'},h('div',{className:'eb-line'}),h('span',{className:'eb-txt'},text));
}

// ── SETTINGS SHEET ────────────────────────────────────────────
function Sheet({state,dispatch,onClose}){
  const [adding,setAdding]=useState(false);
  const [val,setVal]=useState('');
  function add(){if(!val.trim())return;dispatch({type:'ADD_MANTRA',v:val.trim()});setVal('');setAdding(false);}
  return h('div',{className:'overlay',onClick:e=>{if(e.target===e.currentTarget)onClose();}},
    h('div',{className:'sheet'},
      h('div',{className:'sheet-drag'}),
      state.mantras.map(m=>h('div',{key:m,className:`m-row${state.mantra===m?' sel':''}`,onClick:()=>dispatch({type:'SET_MANTRA',v:m})},m,state.mantra===m&&h(Ico.Check))),
      adding
        ? h('div',{style:{marginBottom:16}},
            h('input',{autoFocus:true,value:val,
              onChange:e=>setVal(e.target.value),
              onKeyDown:e=>{if(e.key==='Enter')add();if(e.key==='Escape'){setAdding(false);setVal('');}},
              placeholder:'Type your mantra…',
              style:{width:'100%',background:'none',border:'none',borderBottom:'1px solid #ede8df',padding:'8px 0',fontFamily:'Cormorant Garamond,serif',fontSize:'18px',fontWeight:300,outline:'none',color:'inherit',marginBottom:10}}),
            h('div',{style:{display:'flex',gap:8}},
              h('button',{onClick:add,style:{flex:1,padding:'10px',borderRadius:'100px',border:'none',background:'#c4a267',color:'#fff',fontFamily:'Inter,sans-serif',fontSize:'12px',cursor:'pointer'}},'Add'),
              h('button',{onClick:()=>{setAdding(false);setVal('');},style:{flex:1,padding:'10px',borderRadius:'100px',border:'1px solid #ede8df',background:'none',fontFamily:'Inter,sans-serif',fontSize:'12px',cursor:'pointer',color:'#a09485'}},'Cancel')
            )
          )
        : h('div',{className:'m-add',onClick:()=>setAdding(true)},h(Ico.Plus),'Add your mantra'),
      h('div',null,
        h('div',{className:'t-row'},h('div',{className:'t-row-left'},h(Ico.Sound),'Bead click sound'),h(Tog,{on:state.beadSound,onChange:v=>dispatch({type:'SET_BEAD',v})})),
        h('div',{className:'t-row'},h('div',{className:'t-row-left'},h(Ico.Haptic),'Haptic feedback'),h(Tog,{on:state.haptic,onChange:v=>dispatch({type:'SET_HAPTIC',v})})),
        h('div',{className:'t-row'},h('div',{className:'t-row-left'},h(Ico.Moon),'Dark mode'),h(Tog,{on:state.dark,onChange:v=>dispatch({type:'SET_DARK',v})}))
      ),
      h('p',{className:'sheet-note'},'Volume buttons count inside the mobile app. On web, Space or arrow keys also count.')
    )
  );
}

// ── JAP PAGE ──────────────────────────────────────────────────
function JapPage({state,dispatch}){
  const {count,malas,streak,mantra}=state;
  const [sheet,setSheet]=useState(false);
  const ripRef=useRef(null);
  const R=106, circ=2*Math.PI*R, offset=circ*(1-count/108), done=count>=108;

  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    if(ripRef.current){ripRef.current.classList.remove('ractive');void ripRef.current.offsetWidth;ripRef.current.classList.add('ractive');}
  }
  useEffect(()=>{
    function onKey(e){if((e.code==='Space'||e.code==='ArrowDown'||e.code==='ArrowRight')&&!sheet){e.preventDefault();tap();}}
    window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);
  },[count,done,sheet]);

  return h('div',{className:'page',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
    // header
    h('div',{style:{width:'100%',display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:0}},
      h('div',null, h(Eb,{text:'Jap'}), h('div',{className:'title'},'A quiet practice')),
      h('div',{style:{display:'flex',gap:8,paddingTop:2}},
        h('button',{className:'ico-btn',onClick:()=>setSheet(true)},h(Ico.Settings)),
        h('button',{className:'ico-btn',onClick:()=>dispatch({type:'SET_DARK',v:!state.dark})},h(Ico.Sun))
      )
    ),
    // stat pills
    h('div',{style:{display:'flex',gap:8,width:'100%',marginTop:20,marginBottom:32}},
      [{v:count,l:'Today'},{v:malas,l:'Malas'},{v:`${streak}d`,l:'Streak'}].map(s=>
        h('div',{key:s.l,className:'spill'},h('div',{className:'sv'},s.v),h('div',{className:'sl'},s.l))
      )
    ),
    // ring
    h('div',{className:'rring',onClick:tap,style:{width:260,height:260,position:'relative',marginBottom:16}},
      h('div',{ref:ripRef,className:'rpulse'}),
      h('svg',{width:260,height:260,style:{position:'absolute',top:0,left:0}},
        h('circle',{cx:130,cy:130,r:R,fill:'none',stroke:state.dark?'#3a3530':'#ede8df',strokeWidth:'1'}),
        count>0&&h('circle',{cx:130,cy:130,r:R,fill:'none',stroke:'#c4a267',strokeWidth:'1.5',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:offset,transform:'rotate(-90 130 130)',
          style:{transition:'stroke-dashoffset .12s ease'}})
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}},
        done
          ? h(React.Fragment,null,
              h('div',{style:{fontSize:36}},'🙏'),
              h('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:'#c4a267',marginTop:10,letterSpacing:'.1em',textTransform:'uppercase',fontWeight:300}},'mala complete')
            )
          : h(React.Fragment,null,
              h('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:34,fontWeight:300,letterSpacing:'.02em',color:state.dark?'#e8e3d9':'#2d2420'}},mantra||'Radhe'),
              h('div',{style:{fontSize:12,color:'#a09485',marginTop:7,letterSpacing:'.05em'}},`${count} / 108`)
            )
      )
    ),
    !done&&h('div',{style:{fontSize:10,fontWeight:500,letterSpacing:'.16em',textTransform:'uppercase',color:'#a09485',marginBottom:14,marginTop:4}},'Tap to count'),
    h('button',{onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'});},
      style:{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5,color:'#a09485',fontSize:12,fontFamily:'Inter,sans-serif',fontWeight:300}},
      h(Ico.Reset),' Reset today'
    ),
    done&&h('div',{style:{marginTop:24,textAlign:'center'}},
      h('button',{onClick:()=>dispatch({type:'NEW_MALA'}),
        style:{background:'#c4a267',color:'#fff',border:'none',borderRadius:'100px',padding:'11px 26px',fontFamily:'Inter,sans-serif',fontSize:13,fontWeight:300,cursor:'pointer'}},
        'Begin next mala')
    ),
    sheet&&h(Sheet,{state,dispatch,onClose:()=>setSheet(false)})
  );
}

// ── GUIDANCE PAGE ─────────────────────────────────────────────
const EMOTIONS = Object.entries(WISDOM).map(([id,w])=>({id,label:w.label}));

function GuidancePage({state,dispatch}){
  const [sel,setSel]=useState(null);
  const [view,setView]=useState('select');

  useEffect(()=>{if(state.lastGuidance?.date===today()){setSel(state.lastGuidance.emotion);setView('result');};},[]);

  function receive(){if(!sel)return;dispatch({type:'SET_GUIDANCE',p:{date:today(),emotion:sel}});setView('result');}
  function back(){setSel(null);setView('select');}

  if(view==='select') return h('div',{className:'page'},
    h(Eb,{text:'Guidance'}),
    h('div',{className:'title-xl'},'How are you, really?'),
    h('p',{className:'subtitle'},"Choose what's closest. A quiet verse will meet you there — no rush."),
    h('div',{className:'egrid'},
      EMOTIONS.map(e=>h('div',{key:e.id,className:`ecard${sel===e.id?' on':''}`,onClick:()=>setSel(e.id)},
        h('div',{className:'e-dot'}),
        h('div',{className:'e-label'},e.label)
      ))
    ),
    sel&&h('button',{className:'btn-continue',onClick:receive},'Continue')
  );

  const w=WISDOM[sel];
  return h('div',{className:'page'},
    h('button',{className:'back',onClick:back},'← back'),
    h(Eb,{text:'You feel',center:true}),
    h('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:40,fontWeight:300,textAlign:'center',color:state.dark?'#e8e3d9':'#2d2420',marginBottom:28,letterSpacing:'-.01em'}},w.label),
    h('div',{className:'g-card'},
      h('div',{className:'g-src'},h('div',{className:'g-src-line'}),h('span',{className:'g-src-txt'},w.source),h('div',{className:'g-src-line'})),
      h('div',{className:'g-verse'},w.verse),
      h('div',{className:'g-dotsep'}),
      h('div',{className:'g-lbl'},'A quiet question'),
      h('div',{className:'g-q'},w.question),
      h('div',{className:'g-dotsep'}),
      h('div',{className:'g-lbl'},'One small step'),
      h('div',{className:'g-step'},w.step)
    ),
    h('div',{className:'g-affirm'},w.affirmation)
  );
}

// ── TODAY PAGE ────────────────────────────────────────────────
function TodayPage({state}){
  const v=getTodayVerse();
  const [reminder,setReminder]=useState(false);
  const d=new Date();
  const label=`${d.toLocaleDateString('en-US',{weekday:'long'}).toUpperCase()}, ${d.toLocaleDateString('en-US',{month:'long',day:'numeric'}).toUpperCase()}`;

  function share(){
    const t=`${v.meaning}\n\n— ${v.source}\n\nPrashama 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied'));
  }

  return h('div',{className:'page'},
    h(Eb,{text:label}),
    h('div',{className:'title'},"Today's Dharma"),
    h('p',{className:'subtitle'},'One verse. One breath at a time.'),
    h('div',{className:'d-card'},
      h('div',{className:'d-src'},v.source),
      h('div',{className:'d-sk'},v.sanskrit),
      h('div',{className:'d-div'}),
      h('div',{className:'d-meaning'},v.meaning),
      h('div',{className:'d-rlbl'},'Reflection'),
      h('div',{className:'d-refl'},v.reflection),
      h('div',{className:'d-acts'},
        h('button',{className:'d-listen'},h(Ico.Play),' Listen'),
        h('div',{className:'d-ico',onClick:()=>{}},h(Ico.Bookmark)),
        h('div',{className:'d-ico',onClick:share},h(Ico.Share))
      )
    ),
    h('div',{className:'rem'},
      h('div',{className:'rem-ico'},'🔔'),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:13,fontWeight:400,marginBottom:2,color:state.dark?'#e8e3d9':'#2d2420'}},'Daily Dharma reminders'),
        h('div',{style:{fontSize:12,color:'#a09485',fontWeight:300,lineHeight:1.5}},'A gentle nudge each morning — never more than one.')
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
  const has=!!(g.trim()||p.trim()||l.trim());

  function doSave(){
    if(!has)return;
    dispatch({type:'SAVE_REFLECTION',p:{date:new Date().toISOString(),grateful:g,peaceful:p,lesson:l}});
    setG('');setP('');setL('');setSaved(true);setTimeout(()=>setSaved(false),2000);
  }

  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
  const recent=(state.reflections||[]).filter(r=>new Date(r.date)>=cutoff).slice(-5).reverse();

  return h('div',{className:'page'},
    h(Eb,{text:'Reflection'}),
    h('div',{className:'title'},'Three quiet gratitudes'),
    h('p',{className:'subtitle'},'A small, soft ritual. Write only what comes easily.'),
    h('div',{className:'rf-card'},
      h('span',{className:'rf-lbl'},'Grateful for'),
      h('input',{className:'rf-in',placeholder:'A quiet morning, an honest conversation…',value:g,onChange:e=>setG(e.target.value)}),
      h('span',{className:'rf-lbl'},'Something peaceful'),
      h('input',{className:'rf-in',placeholder:'A pause that felt like home…',value:p,onChange:e=>setP(e.target.value)}),
      h('span',{className:'rf-lbl'},'One lesson'),
      h('input',{className:'rf-in',placeholder:'What today gently taught me…',value:l,onChange:e=>setL(e.target.value),style:{marginBottom:16}}),
      h('button',{className:`btn-save${has?' active':''}`,disabled:!has,onClick:doSave},saved?'Saved ✓':'Save reflection')
    ),
    h('div',{className:'past-row'},
      h('div',{className:'past-line'}),
      h('span',{className:'past-lbl'},'Past reflections'),
      h('div',{className:'past-line'})
    ),
    recent.length===0
      ? h('div',{className:'past-empty'},'Your reflections will gather here, quietly.')
      : recent.map((r,i)=>h('div',{key:i,style:{marginBottom:14,paddingBottom:14,borderBottom:'1px solid #ede8df'}},
          h('div',{style:{fontSize:10,color:'#a09485',marginBottom:5}},new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})),
          r.grateful&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,marginBottom:2}},r.grateful),
          r.peaceful&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65,marginBottom:2}},r.peaceful),
          r.lesson&&h('div',{style:{fontSize:13,fontWeight:300,lineHeight:1.65}},r.lesson)
        ))
  );
}

// ── TABS ──────────────────────────────────────────────────────
const TABS=[
  {id:'jap',     label:'Jap',        I:Ico.Jap},
  {id:'guidance',label:'Guidance',   I:Ico.Guidance},
  {id:'today',   label:'Today',      I:Ico.Today},
  {id:'reflect', label:'Reflection', I:Ico.Reflect},
];

// ── APP ROOT ──────────────────────────────────────────────────
function App(){
  const [tab,setTab]=useState('jap');
  const [state,setState]=useState(initState);
  const dispatch=useCallback(a=>setState(p=>reducer(p,a)),[]);

  const pages={
    jap:     h(JapPage,{state,dispatch}),
    guidance:h(GuidancePage,{state,dispatch}),
    today:   h(TodayPage,{state}),
    reflect: h(ReflectionPage,{state,dispatch}),
  };

  return h(React.Fragment,null,
    h('style',null,CSS),
    h('div',{className:`app${state.dark?' dark':''}`},
      pages[tab],
      h('div',{className:'nav-wrap'},
        h('nav',{className:'nav'},
          TABS.map(t=>h('button',{key:t.id,className:`nb${tab===t.id?' on':''}`,onClick:()=>setTab(t.id)},h(t.I),t.label))
        )
      )
    )
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));
