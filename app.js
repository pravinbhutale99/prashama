const { useState, useCallback, useRef, useEffect } = React;

// ── THEME ─────────────────────────────────────────────────────
const T = {
  bg:       '#f0ece4',
  card:     '#ffffff',
  border:   '#e8e3d9',
  text:     '#2c2620',
  muted:    '#9e9689',
  accent:   '#b07d4a',
  accentDim:'#c4a472',
  navBg:    '#ffffff',
};

// ── WISDOM DATABASE ───────────────────────────────────────────
const WISDOM = {
  angry:{emoji:'🔥',label:'angry',
    source:'Bhagavad Gita 2.63',
    verse:'From anger comes delusion. From delusion, loss of memory. From loss of memory, destruction of discrimination — and from that, one perishes.',
    question:'"What am I actually protecting right now?"',
    step:'Pause. Breathe three times before you respond to anything.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  anxious:{emoji:'😰',label:'anxious',
    source:'Bhagavad Gita 2.23',
    verse:'What you truly are cannot be harmed. The soul is untouched by weapons, fire, water, or wind.',
    question:'"What is actually happening right now — not in my imagination?"',
    step:'Name five things you can see. Come back to this moment.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  overthinking:{emoji:'🌀',label:'overthinking',
    source:'Bhagavad Gita 2.47',
    verse:'Focus on the next right action. Release the outcome you cannot hold.',
    question:'"What is one small step I can take right now?"',
    step:'Write down a single next action and close the rest of the tabs.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  distracted:{emoji:'🍃',label:'distracted',
    source:'Bhagavad Gita 6.26',
    verse:'Wherever the restless mind wanders, gently bring it back. Again and again, quietly return.',
    question:'"What actually matters to me today?"',
    step:'Close one tab. Do one thing for ten minutes without switching.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  lonely:{emoji:'🕯️',label:'lonely',
    source:'Bhagavad Gita 9.29',
    verse:'I am equally present in all beings. Those who turn toward Me with devotion — they are in Me, and I am in them.',
    question:'"Who could I reach out to today — even briefly?"',
    step:'Send one message. Not to explain how you feel. Just to connect.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  unmotivated:{emoji:'🌑',label:'unmotivated',
    source:'Bhagavad Gita 3.8',
    verse:'Do what must be done. Action is better than inaction. Even the body cannot be maintained without movement.',
    question:'"What is the smallest possible beginning?"',
    step:'Do two minutes of the thing you have been avoiding. Only two minutes.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  peaceful:{emoji:'☮️',label:'peaceful',
    source:'Bhagavad Gita 6.27',
    verse:'Supreme happiness comes to the one whose mind is still, whose passions are quiet, who has become one with what is.',
    question:'"How can I protect this feeling for the rest of today?"',
    step:'Less input today. Guard the quiet you have found.',
    affirmation:'Take what helps. Leave the rest.\nReturn whenever you need.'},
  grateful:{emoji:'🙏',label:'grateful',
    source:'Bhagavad Gita 4.11',
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
  const base={count:0,malas:0,lastDate:t,totalCount:0,streak:0,reflections:[],lastGuidance:null};
  if(!s)return base;
  return{...base,...s,lastDate:t,
    count:nd?0:s.count,malas:nd?0:s.malas,
    streak:nd?(wasYesterday(s.lastDate)?(s.streak||0)+1:0):(s.streak||0)};
}

// ── REDUCER ───────────────────────────────────────────────────
function reducer(state,action){
  let n;
  switch(action.type){
    case'TAP':if(state.count>=108)return state;n={...state,count:state.count+1,totalCount:state.totalCount+1};break;
    case'NEW_MALA':n={...state,count:0,malas:state.malas+1};break;
    case'RESET_DAY':n={...state,count:0,malas:0};break;
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
  html,body{height:100%;background:${T.bg};}
  body{font-family:'Inter',sans-serif;font-weight:300;-webkit-tap-highlight-color:transparent;overscroll-behavior:none;color:${T.text};}
  #root{height:100%;}

  .app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:${T.bg};position:relative;}

  /* PAGE */
  .page{flex:1;padding:48px 24px 120px;overflow-y:auto;animation:fu .2s ease;}
  @keyframes fu{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

  /* EYEBROW */
  .eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
  .eyebrow-rule{flex:0 0 20px;height:1px;background:${T.accent};}
  .eyebrow-text{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.accent};}
  .eyebrow-rule-both{display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:6px;}
  .eyebrow-rule-both .eyebrow-rule{flex:0 0 28px;}

  /* HEADINGS */
  .page-title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:400;line-height:1.15;color:${T.text};margin-bottom:6px;}
  .page-title-sm{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:400;line-height:1.2;color:${T.text};margin-bottom:6px;}
  .page-sub{font-size:13px;font-weight:300;color:${T.muted};margin-bottom:32px;line-height:1.5;}

  /* CARD */
  .card{background:${T.card};border-radius:18px;padding:28px 24px;margin-bottom:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);}

  /* STAT PILLS */
  .stat-pill{background:${T.card};border-radius:100px;padding:14px 24px;display:flex;flex-direction:column;align-items:center;gap:4px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .stat-v{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:400;color:${T.text};line-height:1;}
  .stat-l{font-size:9px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:${T.muted};}

  /* RING */
  .rring{position:relative;cursor:pointer;-webkit-tap-highlight-color:transparent;}
  .rpulse{position:absolute;inset:-12px;border-radius:50%;background:rgba(176,125,74,.08);opacity:0;pointer-events:none;}
  .ractive{animation:rp .35s ease-out forwards;}
  @keyframes rp{0%{opacity:.6;transform:scale(.92)}100%{opacity:0;transform:scale(1.04)}}

  /* EMOTION CARDS */
  .egrid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:32px;}
  .ecard{background:${T.card};border-radius:16px;padding:24px 18px 18px;cursor:pointer;
    box-shadow:0 1px 3px rgba(0,0,0,.04);transition:box-shadow .15s;
    display:flex;flex-direction:column;justify-content:flex-end;min-height:110px;
    border:1.5px solid transparent;text-align:left;}
  .ecard.on{border-color:${T.accent};box-shadow:0 2px 8px rgba(176,125,74,.15);}
  .ecard-dot{width:6px;height:6px;border-radius:50%;background:${T.accentDim};margin-bottom:auto;}
  .ecard-label{font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:400;color:${T.text};margin-top:16px;}

  /* GUIDANCE RESULT */
  .verse-source-row{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:20px;}
  .verse-source-rule{flex:0 0 28px;height:1px;background:${T.accentDim};}
  .verse-source-text{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.accentDim};}
  .verse-text{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:400;line-height:1.7;color:${T.text};text-align:center;margin-bottom:20px;}
  .dot-sep{display:flex;justify-content:center;margin:18px 0;}
  .dot-sep::after{content:'·';color:${T.muted};font-size:16px;}
  .section-label{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.muted};text-align:center;margin-bottom:10px;}
  .quiet-q{font-family:'Cormorant Garamond',serif;font-size:18px;font-style:italic;font-weight:400;line-height:1.6;color:${T.text};text-align:center;}
  .step-text{font-size:14px;font-weight:300;color:${T.text};line-height:1.75;text-align:center;}
  .affirmation{font-family:'Cormorant Garamond',serif;font-size:13px;font-style:italic;color:${T.muted};text-align:center;line-height:1.7;margin-top:32px;white-space:pre-line;}

  /* BACK LINK */
  .back-btn{background:none;border:none;cursor:pointer;font-size:13px;font-weight:300;color:${T.muted};font-family:'Inter',sans-serif;padding:0;display:flex;align-items:center;gap:5px;}
  .back-btn:hover{color:${T.text};}

  /* DHARMA */
  .dharma-source{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.accent};margin-bottom:14px;display:flex;align-items:center;gap:7px;}
  .dharma-source::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:${T.accent};}
  .dharma-sanskrit{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:400;line-height:1.6;color:${T.text};margin-bottom:16px;}
  .dharma-meaning{font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;font-weight:400;line-height:1.75;color:${T.text};margin-bottom:16px;}
  .dharma-reflection-label{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.muted};margin-bottom:8px;}
  .dharma-reflection{font-size:13px;font-weight:300;color:${T.text};line-height:1.75;}
  .dharma-actions{display:flex;align-items:center;gap:10px;margin-top:4px;}
  .btn-listen{background:${T.text};color:#fff;border:none;border-radius:100px;padding:10px 20px;font-size:13px;font-weight:400;font-family:'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;gap:7px;}
  .btn-icon{background:${T.card};border:1px solid ${T.border};border-radius:100px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;}
  .reminder-card{background:${T.card};border-radius:18px;padding:18px 20px;display:flex;align-items:center;gap:14px;box-shadow:0 1px 3px rgba(0,0,0,.04);}
  .reminder-icon{width:36px;height:36px;border-radius:100px;background:${T.bg};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
  .toggle{width:40px;height:24px;border-radius:100px;background:#d4cfc8;border:none;cursor:pointer;flex-shrink:0;position:relative;transition:background .2s;}
  .toggle.on{background:${T.accent};}
  .toggle-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .2s;}
  .toggle.on .toggle-knob{transform:translateX(16px);}

  /* REFLECTION */
  .refl-input-group{margin-bottom:0;}
  .refl-field-label{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.muted};margin-bottom:10px;display:block;}
  .refl-input{width:100%;background:none;border:none;border-bottom:1px solid ${T.border};padding:8px 0 10px;font-family:'Cormorant Garamond',serif;font-size:16px;font-style:italic;font-weight:300;color:${T.text};outline:none;font-style:italic;}
  .refl-input::placeholder{color:${T.muted};font-style:italic;}
  .refl-input:focus{border-bottom-color:${T.accent};}
  .btn-save{width:100%;padding:14px;border-radius:100px;border:none;background:#ccc8c0;color:#fff;font-family:'Inter',sans-serif;font-size:14px;font-weight:400;cursor:pointer;transition:background .2s;margin-top:8px;}
  .btn-save.active{background:${T.accent};}
  .past-sep{display:flex;align-items:center;gap:10px;margin:28px 0 16px;}
  .past-sep-rule{flex:1;height:1px;background:${T.border};}
  .past-sep-text{font-size:10px;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:${T.muted};}
  .past-empty{font-family:'Cormorant Garamond',serif;font-size:15px;font-style:italic;color:${T.muted};line-height:1.6;}

  /* NAV */
  .nav-wrap{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);width:calc(100% - 48px);max-width:382px;z-index:100;}
  .nav{background:${T.navBg};border-radius:100px;display:flex;padding:6px;box-shadow:0 4px 20px rgba(0,0,0,.1);}
  .nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px 7px;background:none;border:none;cursor:pointer;color:${T.muted};font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.03em;border-radius:100px;transition:all .15s;}
  .nb.on{background:${T.bg};color:${T.accent};}
  .nb svg{width:18px;height:18px;}

  /* MISC */
  .txt-btn{background:none;border:none;font-family:'Inter',sans-serif;font-size:13px;color:${T.muted};cursor:pointer;padding:0;letter-spacing:.03em;}
  .txt-btn:hover{color:${T.text};}
  .divider-rule{height:1px;background:${T.border};margin:18px 0;}
`;

// ── ICONS ──────────────────────────────────────────────────────
const Ic={
  Jap:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'9'}),React.createElement('circle',{cx:'12',cy:'12',r:'3'}),React.createElement('path',{d:'M12 3v2M12 19v2M3 12h2M19 12h2'})),
  Guidance:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'10'}),React.createElement('path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'})),
  Today:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'5'}),React.createElement('path',{d:'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42'})),
  Reflection:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}),React.createElement('path',{d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'})),
  Play:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'currentColor',width:'14',height:'14'},React.createElement('polygon',{points:'5,3 19,12 5,21'})),
  Bookmark:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},React.createElement('path',{d:'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'})),
  Share:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'16',height:'16'},React.createElement('circle',{cx:'18',cy:'5',r:'3'}),React.createElement('circle',{cx:'6',cy:'12',r:'3'}),React.createElement('circle',{cx:'18',cy:'19',r:'3'}),React.createElement('path',{d:'M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98'})),
  Reset:()=>React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round',width:'13',height:'13'},React.createElement('path',{d:'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'}),React.createElement('path',{d:'M3 3v5h5'})),
};

// ── EYEBROW COMPONENT ─────────────────────────────────────────
function Eyebrow({text,center}){
  if(center) return React.createElement('div',{className:'eyebrow-rule-both'},
    React.createElement('div',{className:'eyebrow-rule'}),
    React.createElement('span',{className:'eyebrow-text'},text),
    React.createElement('div',{className:'eyebrow-rule'})
  );
  return React.createElement('div',{className:'eyebrow'},
    React.createElement('div',{className:'eyebrow-rule'}),
    React.createElement('span',{className:'eyebrow-text'},text)
  );
}

// ── JAP PAGE ──────────────────────────────────────────────────
function JapPage({state,dispatch}){
  const {count,malas,streak}=state;
  const ripRef=useRef(null);
  const R=90,circ=2*Math.PI*R,offset=circ*(1-count/108),done=count>=108;

  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    if(ripRef.current){ripRef.current.classList.remove('ractive');void ripRef.current.offsetWidth;ripRef.current.classList.add('ractive');}
  }

  return React.createElement('div',{className:'page',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
    // eyebrow + title
    React.createElement('div',{style:{width:'100%',marginBottom:28}},
      React.createElement(Eyebrow,{text:'Jap'}),
      React.createElement('div',{className:'page-title'},'A quiet practice')
    ),
    // stat pills row
    React.createElement('div',{style:{display:'flex',gap:10,marginBottom:40,width:'100%',justifyContent:'center'}},
      [{v:count,l:'Today'},{v:malas,l:'Malas'},{v:`${streak}d`,l:'Streak'}].map(s=>
        React.createElement('div',{key:s.l,className:'stat-pill',style:{flex:1}},
          React.createElement('div',{className:'stat-v'},s.v),
          React.createElement('div',{className:'stat-l'},s.l)
        )
      )
    ),
    // ring
    React.createElement('div',{className:'rring',onClick:tap,style:{width:240,height:240,position:'relative',marginBottom:28}},
      React.createElement('div',{ref:ripRef,className:'rpulse'}),
      React.createElement('svg',{width:240,height:240,style:{position:'absolute',top:0,left:0}},
        React.createElement('circle',{cx:120,cy:120,r:R,fill:'none',stroke:T.border,strokeWidth:'1'}),
        count>0&&React.createElement('circle',{cx:120,cy:120,r:R,fill:'none',
          stroke:T.accent,strokeWidth:'1.5',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:offset,
          transform:'rotate(-90 120 120)',
          style:{transition:'stroke-dashoffset .15s ease'}})
      ),
      React.createElement('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}},
        done
          ? React.createElement(React.Fragment,null,
              React.createElement('div',{style:{fontSize:36}},'🙏'),
              React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:13,color:T.accent,marginTop:8,letterSpacing:'.06em',fontWeight:400,textTransform:'uppercase',fontSize:11}})
            )
          : React.createElement(React.Fragment,null,
              React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:36,fontWeight:400,color:T.text,letterSpacing:'.02em'}},'Radhe'),
              React.createElement('div',{style:{fontSize:13,color:T.muted,marginTop:6,letterSpacing:'.04em'}},`${count} / 108`)
            )
      )
    ),
    // tap hint
    !done&&React.createElement('div',{style:{fontSize:11,fontWeight:500,letterSpacing:'.14em',textTransform:'uppercase',color:T.muted,marginBottom:20}},'Tap to count'),
    // reset
    React.createElement('button',{
      onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'});},
      style:{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:5,color:T.muted,fontSize:13,fontFamily:'Inter,sans-serif',fontWeight:300}},
      React.createElement(Ic.Reset),'Reset today'
    ),
    // mala complete overlay
    done&&React.createElement('div',{style:{marginTop:28,textAlign:'center'}},
      React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:18,color:T.accent,marginBottom:8}},`${malas} mala${malas!==1?'s':''} complete today`),
      React.createElement('button',{
        onClick:()=>dispatch({type:'NEW_MALA'}),
        style:{background:T.accent,color:'#fff',border:'none',borderRadius:'100px',padding:'10px 24px',fontFamily:'Inter,sans-serif',fontSize:13,cursor:'pointer'}},
        'Begin next mala')
    )
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

  function receive(){
    if(!sel)return;
    dispatch({type:'SET_GUIDANCE',p:{date:today(),emotion:sel}});
    setView('result');
  }
  function back(){setSel(null);setView('select');}

  if(view==='select') return React.createElement('div',{className:'page'},
    React.createElement(Eyebrow,{text:'Guidance'}),
    React.createElement('div',{className:'page-title'},'How are you, really?'),
    React.createElement('p',{className:'page-sub'},'Choose what\'s closest. A quiet verse will meet you there — no rush.'),
    React.createElement('div',{className:'egrid'},
      EMOTIONS.map(e=>React.createElement('div',{
        key:e.id,className:`ecard${sel===e.id?' on':''}`,
        onClick:()=>setSel(e.id)},
        React.createElement('div',{className:'ecard-dot'}),
        React.createElement('div',{className:'ecard-label'},e.label)
      ))
    ),
    sel&&React.createElement('button',{
      onClick:receive,
      style:{width:'100%',padding:'14px',borderRadius:'100px',border:'none',background:T.accent,color:'#fff',fontFamily:'Inter,sans-serif',fontSize:14,fontWeight:400,cursor:'pointer'}},
      'Continue'
    )
  );

  const w=WISDOM[sel];
  return React.createElement('div',{className:'page'},
    // back + you feel
    React.createElement('div',{style:{display:'flex',alignItems:'center',marginBottom:24}},
      React.createElement('button',{className:'back-btn',onClick:back},'← back')
    ),
    React.createElement(Eyebrow,{text:'You feel',center:true}),
    React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:40,fontWeight:400,textAlign:'center',color:T.text,marginBottom:32}},w.label),
    // main card
    React.createElement('div',{className:'card'},
      // source
      React.createElement('div',{className:'verse-source-row'},
        React.createElement('div',{className:'verse-source-rule'}),
        React.createElement('span',{className:'verse-source-text'},w.source),
        React.createElement('div',{className:'verse-source-rule'})
      ),
      // verse meaning
      React.createElement('div',{className:'verse-text'},w.verse),
      // dot sep
      React.createElement('div',{className:'dot-sep'}),
      // quiet question
      React.createElement('div',{className:'section-label'},'A quiet question'),
      React.createElement('div',{className:'quiet-q'},w.question),
      // dot sep
      React.createElement('div',{className:'dot-sep'}),
      // one small step
      React.createElement('div',{className:'section-label'},'One small step'),
      React.createElement('div',{className:'step-text'},w.step)
    ),
    // affirmation
    React.createElement('div',{className:'affirmation'},w.affirmation)
  );
}

// ── TODAY / DHARMA PAGE ───────────────────────────────────────
function TodayPage(){
  const v=getTodayVerse();
  const [reminder,setReminder]=useState(false);
  const dow=new Date().toLocaleDateString('en-US',{weekday:'long'}).toUpperCase();
  const dateStr=new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'});
  const eyebrowDate=`${dow}, ${dateStr.toUpperCase()}`;

  function share(){
    const t=`${v.meaning}\n\n— ${v.source}\n\nPrashama 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied'));
  }

  return React.createElement('div',{className:'page'},
    React.createElement(Eyebrow,{text:eyebrowDate}),
    React.createElement('div',{className:'page-title'},"Today's Dharma"),
    React.createElement('p',{className:'page-sub'},'One verse. One breath at a time.'),

    // main card
    React.createElement('div',{className:'card',style:{marginBottom:12}},
      React.createElement('div',{className:'dharma-source'},v.source),
      React.createElement('div',{className:'dharma-sanskrit'},v.sanskrit),
      React.createElement('div',{className:'divider-rule'}),
      React.createElement('div',{className:'dharma-meaning'},v.meaning),
      React.createElement('div',{className:'dharma-reflection-label'},'Reflection'),
      React.createElement('div',{className:'dharma-reflection'},v.reflection),
      // actions row
      React.createElement('div',{className:'dharma-actions',style:{marginTop:20}},
        React.createElement('button',{className:'btn-listen'},React.createElement(Ic.Play),' Listen'),
        React.createElement('div',{className:'btn-icon',onClick:()=>{}},React.createElement(Ic.Bookmark)),
        React.createElement('div',{className:'btn-icon',onClick:share},React.createElement(Ic.Share))
      )
    ),

    // reminder card
    React.createElement('div',{className:'reminder-card'},
      React.createElement('div',{className:'reminder-icon'},'🔔'),
      React.createElement('div',{style:{flex:1}},
        React.createElement('div',{style:{fontSize:14,fontWeight:400,color:T.text,marginBottom:2}},'Daily Dharma reminders'),
        React.createElement('div',{style:{fontSize:12,color:T.muted,fontWeight:300}},'A gentle nudge each morning — never more than one.')
      ),
      React.createElement('button',{
        className:`toggle${reminder?' on':''}`,
        onClick:()=>setReminder(r=>!r)},
        React.createElement('div',{className:'toggle-knob'})
      )
    )
  );
}

// ── REFLECTION PAGE ───────────────────────────────────────────
function ReflectionPage({state,dispatch}){
  const [g,setG]=useState('');
  const [p,setP]=useState('');
  const [l,setL]=useState('');
  const [saved,setSaved]=useState(false);
  const hasContent=g.trim()||p.trim()||l.trim();

  function doSave(){
    if(!hasContent)return;
    dispatch({type:'SAVE_REFLECTION',p:{date:new Date().toISOString(),grateful:g,peaceful:p,lesson:l}});
    setG('');setP('');setL('');setSaved(true);setTimeout(()=>setSaved(false),2000);
  }

  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-30);
  const recent=(state.reflections||[]).filter(r=>new Date(r.date)>=cutoff).slice(-5).reverse();

  return React.createElement('div',{className:'page'},
    React.createElement(Eyebrow,{text:'Reflection'}),
    React.createElement('div',{className:'page-title'},'Three quiet gratitudes'),
    React.createElement('p',{className:'page-sub'},'A small, soft ritual. Write only what comes easily.'),

    // card with 3 fields
    React.createElement('div',{className:'card'},
      // grateful for
      React.createElement('div',{style:{marginBottom:24}},
        React.createElement('span',{className:'refl-field-label'},'Grateful for'),
        React.createElement('input',{className:'refl-input',placeholder:'A quiet morning, an honest conversation…',value:g,onChange:e=>setG(e.target.value)})
      ),
      // something peaceful
      React.createElement('div',{style:{marginBottom:24}},
        React.createElement('span',{className:'refl-field-label'},'Something peaceful'),
        React.createElement('input',{className:'refl-input',placeholder:'A pause that felt like home…',value:p,onChange:e=>setP(e.target.value)})
      ),
      // one lesson
      React.createElement('div',{style:{marginBottom:24}},
        React.createElement('span',{className:'refl-field-label'},'One lesson'),
        React.createElement('input',{className:'refl-input',placeholder:'What today gently taught me…',value:l,onChange:e=>setL(e.target.value)})
      ),
      React.createElement('button',{
        className:`btn-save${hasContent?' active':''}`,
        onClick:doSave,disabled:!hasContent
      },saved?'Saved ✓':'Save reflection')
    ),

    // past reflections
    React.createElement('div',{className:'past-sep'},
      React.createElement('div',{className:'past-sep-rule'}),
      React.createElement('span',{className:'past-sep-text'},'Past reflections'),
      React.createElement('div',{className:'past-sep-rule'})
    ),
    recent.length===0
      ? React.createElement('div',{className:'past-empty'},'Your reflections will gather here, quietly.')
      : recent.map((r,i)=>React.createElement('div',{key:i,style:{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${T.border}`}},
          React.createElement('div',{style:{fontSize:11,color:T.muted,marginBottom:6}},new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})),
          r.grateful&&React.createElement('div',{style:{fontSize:13,color:T.text,lineHeight:1.65,marginBottom:4}},r.grateful),
          r.peaceful&&React.createElement('div',{style:{fontSize:13,color:T.text,lineHeight:1.65,marginBottom:4}},r.peaceful),
          r.lesson&&React.createElement('div',{style:{fontSize:13,color:T.text,lineHeight:1.65}},r.lesson)
        ))
  );
}

// ── TABS ──────────────────────────────────────────────────────
const TABS=[
  {id:'jap',label:'Jap',Ico:Ic.Jap},
  {id:'guidance',label:'Guidance',Ico:Ic.Guidance},
  {id:'today',label:'Today',Ico:Ic.Today},
  {id:'reflect',label:'Reflection',Ico:Ic.Reflection},
];

// ── APP ROOT ──────────────────────────────────────────────────
function App(){
  const [tab,setTab]=useState('jap');
  const [state,setState]=useState(initState);
  const dispatch=useCallback(a=>setState(p=>reducer(p,a)),[]);

  const pages={
    jap:React.createElement(JapPage,{state,dispatch}),
    guidance:React.createElement(GuidancePage,{state,dispatch}),
    today:React.createElement(TodayPage),
    reflect:React.createElement(ReflectionPage,{state,dispatch}),
  };

  return React.createElement(React.Fragment,null,
    React.createElement('style',null,CSS),
    React.createElement('div',{className:'app'},
      pages[tab],
      React.createElement('div',{className:'nav-wrap'},
        React.createElement('nav',{className:'nav'},
          TABS.map(t=>React.createElement('button',{
            key:t.id,className:`nb${tab===t.id?' on':''}`,
            onClick:()=>setTab(t.id)
          },React.createElement(t.Ico),t.label))
        )
      )
    )
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
