const { useState, useCallback, useRef, useEffect } = React;

// ── THEME ────────────────────────────────────────────────────
const T = {
  bg:'#f6f3ec', surface:'#eee9df', border:'#ddd8ce',
  text:'#1a1612', muted:'#8a8070', accent:'#b5651d',
  accentLight:'#f0e6d8', gold:'#c9a84c', goldLight:'#fdf8ec',
  white:'#ffffff', danger:'#c0392b',
};

// ── WISDOM DATABASE ──────────────────────────────────────────
const WISDOM = {
  angry:{emoji:'🔥',label:'Angry',
    verse:{sanskrit:'क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः।',
      transliteration:'krodhād bhavati sammohaḥ sammohāt smṛti-vibhramaḥ',
      source:'Bhagavad Gita 2.63',
      meaning:'From anger comes delusion. From delusion, the loss of memory. From the loss of memory, the destruction of discrimination — and from that, one perishes.'},
    reflection:'Anger is not the enemy — it is a messenger. Ask what it is protecting.',
    action:'Before you respond, pause. Take three slow breaths. The anger will still be there if you need it — but so will your wisdom.',
    affirmation:'I am larger than this moment.'},
  anxious:{emoji:'😰',label:'Anxious',
    verse:{sanskrit:'नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः।',
      transliteration:'nainaṁ chindanti śastrāṇi nainaṁ dahati pāvakaḥ',
      source:'Bhagavad Gita 2.23',
      meaning:'The soul cannot be cut by weapons, nor burned by fire, nor moistened by water, nor dried by wind. What you truly are cannot be harmed.'},
    reflection:'Anxiety lives in the future. You are only ever here, now, in this breath.',
    action:'Name five things you can see right now. Return to the present. This moment is safe.',
    affirmation:'I am held by something larger than my fear.'},
  sad:{emoji:'💧',label:'Sad',
    verse:{sanskrit:'जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च।',
      transliteration:'jātasya hi dhruvo mṛtyur dhruvaṁ janma mṛtasya ca',
      source:'Bhagavad Gita 2.27',
      meaning:'For one who is born, death is certain. For one who dies, rebirth is certain. Therefore, grieve not for what is inevitable.'},
    reflection:'Sadness is love with nowhere to go. Let yourself feel it — it means something mattered.',
    action:'Do not rush out of this feeling. Sit with it gently for five minutes. Then drink water, and step outside if you can.',
    affirmation:'This feeling is temporary. I am not.'},
  lost:{emoji:'🌫️',label:'Lost',
    verse:{sanskrit:'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।',
      transliteration:'śreyān sva-dharmo viguṇaḥ para-dharmāt sv-anuṣṭhitāt',
      source:'Bhagavad Gita 3.35',
      meaning:'It is better to follow your own path imperfectly than to follow another\'s path perfectly. Your own path, even with its difficulties, is the one meant for you.'},
    reflection:'Feeling lost often means you have outgrown where you were. This confusion is a doorway.',
    action:'Write down one thing you know to be true about yourself right now. Start there. Just one step.',
    affirmation:'I do not need to see the whole path. Only the next step.'},
  grateful:{emoji:'🙏',label:'Grateful',
    verse:{sanskrit:'ये यथा मां प्रपद्यन्ते तांस्तथैव भजाम्यहम्।',
      transliteration:'ye yathā māṁ prapadyante tāṁs tathaiva bhajāmy aham',
      source:'Bhagavad Gita 4.11',
      meaning:'In whatever way people surrender to Me, I reward them accordingly. The Divine meets you exactly where you are.'},
    reflection:'Gratitude is not just a feeling — it is a way of seeing. You have already received so much.',
    action:'Tell one person today that you appreciate them. Specifically. Not in general. Watch what happens.',
    affirmation:'Abundance flows through me when I recognise what I already have.'},
  peaceful:{emoji:'☮️',label:'Peaceful',
    verse:{sanskrit:'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।',
      transliteration:'praśānta-manasaṁ hy enaṁ yoginaṁ sukham uttamam',
      source:'Bhagavad Gita 6.27',
      meaning:'Supreme happiness comes to the yogi whose mind is peaceful, whose passions are quieted, who has become one with the Divine.'},
    reflection:'Peace is not the absence of noise. It is the presence of something deeper beneath the noise.',
    action:'Protect this feeling today. Less scrolling, less news, more silence. Let this peace deepen.',
    affirmation:'I return to this stillness whenever I choose.'},
  fearful:{emoji:'😨',label:'Fearful',
    verse:{sanskrit:'अभयं सत्त्वसंशुद्धिर्ज्ञानयोगव्यवस्थितिः।',
      transliteration:'abhayaṁ sattva-saṁśuddhir jñāna-yoga-vyavasthitiḥ',
      source:'Bhagavad Gita 16.1',
      meaning:'Fearlessness, purity of heart, steadfastness in knowledge and yoga — these are the divine qualities you were born with. They are your nature.'},
    reflection:'Courage is not the absence of fear. It is taking one small step while afraid.',
    action:'Ask yourself: what is the smallest action I could take toward what I fear? Do just that one thing.',
    affirmation:'Fearlessness is my birthright. I reclaim it now.'},
  jealous:{emoji:'💚',label:'Jealous',
    verse:{sanskrit:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',
      transliteration:'uddhared ātmanātmānaṁ nātmānam avasādayet',
      source:'Bhagavad Gita 6.5',
      meaning:'Elevate yourself through the power of your own mind. Do not degrade yourself. The mind can be your greatest friend or your worst enemy.'},
    reflection:'Jealousy shows you what you desire. That desire is information — not about them, but about you.',
    action:'Write down what you admire in that person or situation. Then ask: how can I cultivate this in my own life?',
    affirmation:'Their success does not diminish mine. There is enough.'},
  proud:{emoji:'✨',label:'Proud',
    verse:{sanskrit:'मय्यर्पितमनोबुद्धिर्यो मद्भक्तः स मे प्रियः।',
      transliteration:'mayy arpita-mano-buddhir yo mad-bhaktaḥ sa me priyaḥ',
      source:'Bhagavad Gita 12.14',
      meaning:'One who is content, devoted, and has surrendered the mind to the Divine — such a person is dear to Me. Let your achievements flow back to the source.'},
    reflection:'Pride in your work is beautiful. Let it be fuel for your next act of service, not a place to rest.',
    action:'Thank one person who contributed to this achievement — even silently. Success is always shared.',
    affirmation:'I celebrate this. And I remain humble in it.'},
  hopeless:{emoji:'🌑',label:'Hopeless',
    verse:{sanskrit:'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',
      transliteration:'sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja',
      source:'Bhagavad Gita 18.66',
      meaning:'Surrender completely. I will free you from all burdens. Do not grieve. You do not have to carry this alone.'},
    reflection:'Hopelessness often arrives just before a turning point. The darkest part of night is just before dawn.',
    action:'Do not try to solve everything now. Do one tiny thing: drink water, step outside, call someone you trust.',
    affirmation:'I have survived every difficult day until now. I will survive this one too.'},
  overwhelmed:{emoji:'🌊',label:'Overwhelmed',
    verse:{sanskrit:'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।',
      transliteration:'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya',
      source:'Bhagavad Gita 2.48',
      meaning:'Established in stillness, perform your actions. Abandon attachment to outcomes. Act from a place of inner quiet.'},
    reflection:'You cannot do everything. But you can do one thing. That is enough for now.',
    action:'Write down everything overwhelming you. Then circle just one item. Do only that today.',
    affirmation:'One step. One breath. One moment at a time.'},
  lonely:{emoji:'🕯️',label:'Lonely',
    verse:{sanskrit:'समोऽहं सर्वभूतेषु न मे द्वेष्योऽस्ति न प्रियः।',
      transliteration:"samo 'haṁ sarva-bhūteṣu na me dveṣyo 'sti na priyaḥ",
      source:'Bhagavad Gita 9.29',
      meaning:'I am equally present in all beings. No one is hated by Me, no one is favoured. Those who worship Me with devotion — they are in Me, and I am in them.'},
    reflection:'You are never truly alone. Something vast and loving holds this entire existence — including you.',
    action:'Reach out to one person today. Not to explain how you feel — just to connect. A simple message is enough.',
    affirmation:'I am connected to life itself. I am not separate.'},
};

// ── DHARMA VERSES ────────────────────────────────────────────
const DHARMA = [
  {sanskrit:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',source:'Bhagavad Gita 2.47',
    meaning:'You have the right to perform your duties, but never to the fruits of your actions. Let go of outcomes.',
    reflection:'Act without attachment to results. The effort is yours. The outcome belongs to the universe.'},
  {sanskrit:'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',source:'Bhagavad Gita 18.66',
    meaning:'Abandon all varieties of dharma and simply surrender. Do not grieve — you will be freed.',
    reflection:'True surrender is not weakness. It is the deepest form of trust.'},
  {sanskrit:'न जायते म्रियते वा कदाचिन्।',source:'Bhagavad Gita 2.20',
    meaning:'The soul is never born, nor does it ever die. It is not slain when the body is slain.',
    reflection:'What you truly are is eternal. Only the body is temporary.'},
  {sanskrit:'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।',source:'Bhagavad Gita 6.5',
    meaning:'Elevate yourself through the power of your own mind. Do not degrade yourself.',
    reflection:'You are your own best friend and your own worst enemy. Choose wisely today.'},
  {sanskrit:'समः शत्रौ च मित्रे च तथा मानापमानयोः।',source:'Bhagavad Gita 14.25',
    meaning:'One who is equal to friend and foe, in honour and dishonour — that person has gone beyond.',
    reflection:'Equanimity in all situations is the highest form of spiritual maturity.'},
  {sanskrit:'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।',source:'Bhagavad Gita 2.62',
    meaning:'While contemplating objects of the senses, one develops attachment. From attachment comes desire, and from desire, suffering.',
    reflection:'What you dwell on, you become. Guard your thoughts carefully.'},
  {sanskrit:'अहिंसा सत्यमक्रोधस्त्यागः शान्तिरपैशुनम्।',source:'Bhagavad Gita 16.2',
    meaning:'Non-violence, truthfulness, freedom from anger, renunciation, peacefulness — these are the divine qualities born within you.',
    reflection:'You do not need to be perfect. Simply move toward these qualities, one day at a time.'},
  {sanskrit:'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।',source:'Bhagavad Gita 6.27',
    meaning:'Supreme happiness comes to the yogi whose mind is peaceful, whose passions are quieted, who has become one with the Divine.',
    reflection:'Peace is not something you find. It is something you return to.'},
];

function getTodayVerse(){
  const d=new Date();
  const day=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  return DHARMA[day%DHARMA.length];
}

// ── PERSISTENCE ──────────────────────────────────────────────
const KEY='prashama_v1';
function load(){try{return JSON.parse(localStorage.getItem(KEY));}catch{return null;}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{}}
function today(){return new Date().toISOString().slice(0,10);}
function wasYesterday(ds){
  if(!ds)return false;
  const y=new Date(); y.setDate(y.getDate()-1);
  return ds===y.toISOString().slice(0,10);
}
function initState(){
  const s=load(), t=today(), newDay=s&&s.lastDate!==t;
  const base={count:0,malas:0,lastDate:t,totalCount:0,streak:1,reflections:[],lastGuidance:null,guidanceUsedToday:false};
  if(!s)return base;
  return{...base,...s,lastDate:t,
    count:newDay?0:s.count, malas:newDay?0:s.malas,
    guidanceUsedToday:newDay?false:s.guidanceUsedToday,
    streak:newDay?(wasYesterday(s.lastDate)?(s.streak||1)+1:1):(s.streak||1)};
}

// ── REDUCER ──────────────────────────────────────────────────
function reducer(state,action){
  let n;
  switch(action.type){
    case'TAP': if(state.count>=108)return state; n={...state,count:state.count+1,totalCount:state.totalCount+1}; break;
    case'NEW_MALA': n={...state,count:0,malas:state.malas+1}; break;
    case'RESET_DAY': n={...state,count:0,malas:0}; break;
    case'SET_GUIDANCE': n={...state,lastGuidance:action.p,guidanceUsedToday:true}; break;
    case'ADD_REFLECTION': n={...state,reflections:[...(state.reflections||[]),action.p]}; break;
    default: return state;
  }
  save(n); return n;
}

// ── GLOBAL CSS ───────────────────────────────────────────────
const CSS=`
  .app{max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:${T.bg};}
  .hdr{padding:16px 24px 0;display:flex;align-items:center;gap:7px;}
  .hdr-name{font-family:'Cormorant Garamond',serif;font-size:14px;font-weight:400;color:${T.muted};letter-spacing:.14em;}
  .hdr-dot{width:4px;height:4px;border-radius:50%;background:${T.accent};opacity:.45;margin-top:1px;}
  .page{flex:1;padding:32px 24px 100px;animation:fu .22s ease;overflow-y:auto;}
  @keyframes fu{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:${T.white};border-top:1px solid ${T.border};display:flex;z-index:100;padding-bottom:env(safe-area-inset-bottom,0);}
  .nb{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 4px 8px;background:none;border:none;cursor:pointer;color:${T.muted};font-family:'Inter',sans-serif;font-size:10px;letter-spacing:.04em;transition:color .2s;}
  .nb.on{color:${T.accent};}
  .nb svg{width:20px;height:20px;}
  .ptitle{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:300;color:${T.text};margin-bottom:4px;line-height:1.2;}
  .psub{font-size:11px;color:${T.muted};letter-spacing:.09em;text-transform:uppercase;margin-bottom:26px;}
  .card{background:${T.white};border:1px solid ${T.border};border-radius:16px;padding:22px;margin-bottom:12px;}
  .card-w{background:${T.accentLight};border:1px solid ${T.accent}22;border-radius:16px;padding:18px 22px;margin-bottom:12px;}
  .card-g{background:${T.goldLight};border:1px solid ${T.gold}35;border-radius:16px;padding:18px 22px;margin-bottom:12px;}
  .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:100px;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;font-weight:400;letter-spacing:.03em;transition:opacity .18s;-webkit-tap-highlight-color:transparent;}
  .bp{background:${T.accent};color:${T.white};}
  .bp:hover{opacity:.88;}
  .bp:disabled{opacity:.32;cursor:default;}
  .bg{background:transparent;color:${T.muted};border:1px solid ${T.border};}
  .bg:hover{background:${T.surface};}
  .bt{background:none;border:none;color:${T.accent};font-size:12px;padding:8px 0;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:.04em;text-decoration:underline;text-underline-offset:3px;}
  .sm{padding:9px 18px;font-size:12px;}
  .fw{width:100%;}
  .div{height:1px;background:${T.border};margin:16px 0;}
  .lbl{font-size:10px;color:${T.muted};letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;display:block;}
  .chip{display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:100px;font-size:12px;cursor:pointer;border:1px solid ${T.border};background:${T.white};color:${T.muted};font-family:'Inter',sans-serif;transition:all .18s;white-space:nowrap;}
  .chip.on{background:${T.accentLight};border-color:${T.accent};color:${T.accent};font-weight:500;}
  textarea,input{width:100%;background:${T.surface};border:1px solid ${T.border};border-radius:12px;padding:14px 16px;font-family:'Inter',sans-serif;font-size:14px;font-weight:300;color:${T.text};outline:none;line-height:1.65;transition:border-color .2s;-webkit-appearance:none;resize:none;}
  textarea:focus,input:focus{border-color:${T.accent};}
  textarea::placeholder,input::placeholder{color:${T.muted};}
  .shimmer{background:linear-gradient(90deg,${T.surface} 25%,${T.border} 50%,${T.surface} 75%);background-size:200% 100%;animation:sh 1.6s infinite;border-radius:8px;height:13px;margin-bottom:8px;}
  @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .rring{position:relative;cursor:pointer;}
  .rpulse{position:absolute;inset:-16px;border-radius:50%;background:${T.accentLight};opacity:0;pointer-events:none;}
  .ractive{animation:rp .38s ease-out forwards;}
  @keyframes rp{0%{opacity:.5;transform:scale(.88)}100%{opacity:0;transform:scale(1.06)}}
  .emotion-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:26px;}
  .emotion-btn{display:flex;align-items:center;gap:10px;padding:13px 15px;border-radius:12px;cursor:pointer;font-family:'Inter',sans-serif;font-size:13px;transition:all .18s;border:1px solid ${T.border};background:${T.white};color:${T.text};font-weight:300;}
  .emotion-btn.on{background:${T.accentLight};border-color:${T.accent};color:${T.accent};font-weight:500;}
  .chips{display:flex;gap:8px;margin-bottom:18px;overflow-x:auto;padding-bottom:4px;}
  .stat{text-align:center;}
  .stat-v{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;}
  .stat-l{font-size:9px;color:${T.muted};letter-spacing:.09em;text-transform:uppercase;margin-top:2px;}
  .stats-row{display:flex;gap:28px;margin-bottom:40px;margin-top:4px;}
`;

// ── ICONS ────────────────────────────────────────────────────
function IcoJap(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'9'}),React.createElement('circle',{cx:'12',cy:'12',r:'3'}),React.createElement('path',{d:'M12 3v2M12 19v2M3 12h2M19 12h2'}));}
function IcoGuidance(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'10'}),React.createElement('path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'}));}
function IcoDharma(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'}));}
function IcoReflect(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}),React.createElement('path',{d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'}));}
function IcoShare(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.5',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'}),React.createElement('polyline',{points:'16 6 12 2 8 6'}),React.createElement('line',{x1:'12',y1:'2',x2:'12',y2:'15'}));}

// ── HEADER ───────────────────────────────────────────────────
function Header(){
  return React.createElement('header',{className:'hdr'},
    React.createElement('span',{className:'hdr-name'},'Prashama'),
    React.createElement('div',{className:'hdr-dot'})
  );
}

// ── SHIMMER ──────────────────────────────────────────────────
function Shimmer(){
  return React.createElement('div',{style:{padding:'14px 0 2px'}},
    React.createElement('div',{className:'shimmer',style:{width:'85%'}}),
    React.createElement('div',{className:'shimmer',style:{width:'70%'}}),
    React.createElement('div',{className:'shimmer',style:{width:'90%'}}),
    React.createElement('div',{className:'shimmer',style:{width:'55%',marginBottom:0}})
  );
}

// ── JAP PAGE ─────────────────────────────────────────────────
function JapPage({state,dispatch}){
  const {count,malas,totalCount,streak}=state;
  const ripRef=useRef(null);
  const R=108,circ=2*Math.PI*R,offset=circ*(1-count/108),done=count>=108;

  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    if(ripRef.current){ripRef.current.classList.remove('ractive');void ripRef.current.offsetWidth;ripRef.current.classList.add('ractive');}
  }

  const statsData=[
    {v:count,l:'Today'},{v:malas,l:'Malas'},
    {v:`${streak}d`,l:'Streak'},
    {v:totalCount>9999?`${(totalCount/1000).toFixed(1)}k`:totalCount,l:'Total'}
  ];

  return React.createElement('div',{className:'page',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
    React.createElement('div',{className:'stats-row'},
      statsData.map(s=>React.createElement('div',{key:s.l,className:'stat'},
        React.createElement('div',{className:'stat-v'},s.v),
        React.createElement('div',{className:'stat-l'},s.l)
      ))
    ),
    React.createElement('div',{className:'rring',onClick:tap,style:{width:264,height:264,position:'relative',marginBottom:24}},
      React.createElement('div',{ref:ripRef,className:'rpulse'}),
      React.createElement('svg',{width:264,height:264,style:{position:'absolute',top:0,left:0}},
        React.createElement('circle',{cx:132,cy:132,r:R,fill:'none',stroke:T.border,strokeWidth:'2'}),
        React.createElement('circle',{cx:132,cy:132,r:R,fill:'none',stroke:done?T.gold:T.accent,strokeWidth:'2.5',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:offset,transform:'rotate(-90 132 132)',
          style:{transition:'stroke-dashoffset .22s ease,stroke .3s'}})
      ),
      React.createElement('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none'}},
        done
          ? React.createElement(React.Fragment,null,
              React.createElement('div',{style:{fontSize:44}},'🙏'),
              React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:15,color:T.gold,marginTop:8,letterSpacing:'.06em'}},'mala complete')
            )
          : React.createElement(React.Fragment,null,
              React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:72,fontWeight:300,lineHeight:1,color:T.text}},count),
              React.createElement('div',{style:{fontSize:11,color:T.muted,marginTop:6}},`${108-count} remaining`)
            )
      )
    ),
    !done && React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:T.muted,fontStyle:'italic',marginBottom:28,letterSpacing:'.08em'}},'tap the circle to count'),
    done
      ? React.createElement('div',{className:'card-g',style:{width:'100%',textAlign:'center',padding:'26px 22px'}},
          React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:20,color:T.gold,marginBottom:6}},`${malas+1} mala${(malas+1)!==1?'s':''} today`),
          React.createElement('div',{style:{fontSize:13,color:T.muted,marginBottom:18,lineHeight:1.6}},'You have completed a full mala.',React.createElement('br'),'Rest in this moment.'),
          React.createElement('button',{className:'btn bp sm',onClick:()=>dispatch({type:'NEW_MALA'})},'Begin next mala')
        )
      : React.createElement('button',{className:'btn bg sm',onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'}); }},'Reset today')
  );
}

// ── GUIDANCE PAGE ────────────────────────────────────────────
const EMOTIONS=Object.entries(WISDOM).map(([id,w])=>({id,emoji:w.emoji,label:w.label}));

function GuidancePage({state,dispatch}){
  const [sel,setSel]=useState(null);
  const [view,setView]=useState('select');
  const [aiState,setAiState]=useState('idle');
  const [aiText,setAiText]=useState(null);
  const [ctx,setCtx]=useState('');
  const [showCtx,setShowCtx]=useState(false);
  const abortRef=useRef(null);

  useEffect(()=>{
    if(state.lastGuidance?.date===today()){setSel(state.lastGuidance.emotion);setView('result');}
    return()=>abortRef.current?.abort();
  },[]);

  function receive(){
    if(!sel)return;
    dispatch({type:'SET_GUIDANCE',p:{date:today(),emotion:sel}});
    setView('result');setAiText(null);setAiState('idle');
  }

  function reset(){
    abortRef.current?.abort();
    setSel(null);setView('select');setAiText(null);
    setAiState('idle');setShowCtx(false);setCtx('');
  }

  async function goDeeper(){
    const w=WISDOM[sel];
    abortRef.current=new AbortController();
    setAiState('loading');
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',headers:{'Content-Type':'application/json'},
        signal:abortRef.current.signal,
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',max_tokens:600,
          system:`You are a warm, gentle spiritual guide. The user is feeling ${w.label.toLowerCase()}. They have already seen the Gita verse ${w.verse.source}. Write ONE short personalised paragraph (4-5 sentences) bridging this wisdom to their situation. Speak warmly and simply. No headings, no lists. Just one flowing human paragraph.`,
          messages:[{role:'user',content:ctx?`I am feeling ${w.label.toLowerCase()}. My situation: ${ctx}. Help me connect this wisdom to what I am going through.`:`I am feeling ${w.label.toLowerCase()}. Please personalise this guidance for me.`}]
        })
      });
      if(!res.ok)throw new Error('api');
      const d=await res.json();
      const t=(d.content||[]).map(b=>b.text||'').join('').trim();
      if(!t)throw new Error('empty');
      setAiText(t);setAiState('done');
    }catch(e){
      if(e.name==='AbortError')return;
      setAiState('error');
    }
  }

  if(view==='select') return React.createElement('div',{className:'page'},
    React.createElement('h1',{className:'ptitle'},'Guidance'),
    React.createElement('p',{className:'psub'},'How are you feeling right now?'),
    React.createElement('div',{className:'emotion-grid'},
      EMOTIONS.map(e=>React.createElement('button',{
        key:e.id,className:`emotion-btn${sel===e.id?' on':''}`,onClick:()=>setSel(e.id)},
        React.createElement('span',{style:{fontSize:17}},e.emoji),e.label
      ))
    ),
    React.createElement('button',{className:'btn bp fw',disabled:!sel,onClick:receive},'Receive guidance'),
    React.createElement('p',{style:{fontSize:11,color:T.muted,textAlign:'center',marginTop:10}},'Wisdom from the Bhagavad Gita · free forever')
  );

  const w=WISDOM[sel];
  return React.createElement('div',{className:'page'},
    React.createElement('div',{style:{fontSize:26,marginBottom:10}},w.emoji),
    React.createElement('h1',{className:'ptitle'},'Your guidance'),
    React.createElement('p',{className:'psub'},`${w.label} · ${w.verse.source}`),
    // verse
    React.createElement('div',{className:'card',style:{borderLeft:`3px solid ${T.accent}`,borderRadius:'0 16px 16px 0'}},
      React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:20,fontWeight:400,lineHeight:1.55,color:T.text,marginBottom:6}},w.verse.sanskrit),
      React.createElement('div',{style:{fontSize:12,color:T.muted,fontStyle:'italic',marginBottom:14}},w.verse.transliteration),
      React.createElement('div',{className:'div'}),
      React.createElement('div',{style:{fontSize:14,color:T.text,lineHeight:1.75}},w.verse.meaning)
    ),
    // reflection
    React.createElement('div',{className:'card-w'},
      React.createElement('span',{className:'lbl'},'Reflection'),
      React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:17,fontStyle:'italic',color:T.text,lineHeight:1.7}},`"${w.reflection}"`)
    ),
    // action
    React.createElement('div',{className:'card'},
      React.createElement('span',{className:'lbl'},'Apply today'),
      React.createElement('div',{style:{fontSize:14,color:T.text,lineHeight:1.75}},w.action)
    ),
    // affirmation
    React.createElement('div',{style:{textAlign:'center',padding:'6px 0 22px'}},
      React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:15,color:T.muted,fontStyle:'italic'}},`❝ ${w.affirmation} ❞`)
    ),
    // AI section
    React.createElement('div',{style:{borderTop:`1px solid ${T.border}`,paddingTop:18}},
      aiState==='idle'&&!showCtx&&React.createElement('div',{style:{textAlign:'center'}},
        React.createElement('button',{className:'bt',onClick:()=>setShowCtx(true)},'✦ Go deeper with AI'),
        React.createElement('p',{style:{fontSize:11,color:T.muted,marginTop:5}},'Optional · connects this wisdom to your situation')
      ),
      aiState==='idle'&&showCtx&&React.createElement(React.Fragment,null,
        React.createElement('span',{className:'lbl'},"What's on your mind? (optional)"),
        React.createElement('textarea',{rows:3,placeholder:'Share a little about your situation…',value:ctx,onChange:e=>setCtx(e.target.value),style:{marginBottom:12}}),
        React.createElement('button',{className:'btn bp fw',onClick:goDeeper},'Personalise this guidance')
      ),
      aiState==='loading'&&React.createElement('div',{className:'card-w',style:{marginTop:4}},
        React.createElement('span',{className:'lbl'},'Reflecting…'),
        React.createElement(Shimmer)
      ),
      aiState==='error'&&React.createElement('div',{style:{textAlign:'center',padding:'8px 0'}},
        React.createElement('p',{style:{fontSize:12,color:T.muted,marginBottom:10}},'Could not connect. Please try again.'),
        React.createElement('button',{className:'btn bg sm',onClick:()=>{setAiState('idle');setShowCtx(true);}},'Try again')
      ),
      aiState==='done'&&aiText&&React.createElement('div',{className:'card-g',style:{marginTop:4}},
        React.createElement('span',{className:'lbl',style:{color:T.gold}},'✦ Personal reflection'),
        React.createElement('div',{style:{fontSize:14,color:T.text,lineHeight:1.8}},aiText)
      )
    ),
    React.createElement('button',{className:'btn bg fw sm',style:{marginTop:14},onClick:reset},'← Choose a different feeling')
  );
}

// ── DHARMA PAGE ──────────────────────────────────────────────
function DharmaPage(){
  const v=getTodayVerse();
  const dl=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  function share(){
    const t=`"${v.meaning}"\n\n— ${v.source}\n\n${v.reflection}\n\nPrashama · daily stillness 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied!'));
  }
  return React.createElement('div',{className:'page'},
    React.createElement('h1',{className:'ptitle'},"Today's Dharma"),
    React.createElement('p',{className:'psub'},dl),
    React.createElement('div',{className:'card',style:{textAlign:'center',padding:'32px 22px'}},
      React.createElement('div',{style:{fontSize:28,marginBottom:18}},'🕉️'),
      React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:21,fontWeight:400,lineHeight:1.6,color:T.text,marginBottom:10}},v.sanskrit),
      React.createElement('div',{style:{fontSize:11,color:T.gold,letterSpacing:'.1em',marginBottom:22}},v.source),
      React.createElement('div',{className:'div'}),
      React.createElement('div',{style:{fontSize:14,color:T.text,lineHeight:1.85,marginTop:18}},v.meaning)
    ),
    React.createElement('div',{className:'card-w'},
      React.createElement('span',{className:'lbl'},'Reflection'),
      React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:16,fontStyle:'italic',color:T.text,lineHeight:1.7}},v.reflection)
    ),
    React.createElement('button',{className:'btn bp fw',onClick:share},React.createElement(IcoShare),' Share this verse'),
    React.createElement('p',{style:{fontSize:11,color:T.muted,textAlign:'center',marginTop:10}},'A new verse appears each day')
  );
}

// ── REFLECTION PAGE ──────────────────────────────────────────
const PROMPTS=[
  {id:'grateful',icon:'🌸',label:'Gratitude',ph:'What are you grateful for today?'},
  {id:'learning',icon:'📖',label:'Learning',ph:'What did you learn or realise today?'},
  {id:'intention',icon:'🎯',label:'Intention',ph:'What is your intention for tomorrow?'},
  {id:'release',icon:'🍃',label:'Release',ph:'What are you ready to let go of?'},
];

function ReflectionPage({state,dispatch}){
  const [type,setType]=useState('grateful');
  const [text,setText]=useState('');
  const [saved,setSaved]=useState(false);
  const pr=PROMPTS.find(p=>p.id===type);
  const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
  const recent=(state.reflections||[]).filter(r=>new Date(r.date)>=cutoff).slice(-6).reverse();

  function doSave(){
    if(!text.trim())return;
    dispatch({type:'ADD_REFLECTION',p:{date:new Date().toISOString(),type,text:text.trim()}});
    setText('');setSaved(true);setTimeout(()=>setSaved(false),2200);
  }

  return React.createElement('div',{className:'page'},
    React.createElement('h1',{className:'ptitle'},'Reflection'),
    React.createElement('p',{className:'psub'},'A moment of honest presence'),
    React.createElement('div',{className:'chips'},
      PROMPTS.map(p=>React.createElement('button',{key:p.id,className:`chip${type===p.id?' on':''}`,onClick:()=>setType(p.id)},`${p.icon} ${p.label}`))
    ),
    React.createElement('textarea',{key:type,rows:5,placeholder:pr.ph,value:text,onChange:e=>setText(e.target.value),style:{marginBottom:12}}),
    React.createElement('button',{className:'btn bp fw',disabled:!text.trim(),onClick:doSave},saved?'✓ Saved':'Save reflection'),
    React.createElement('p',{style:{fontSize:11,color:T.muted,textAlign:'center',marginTop:8,marginBottom:28}},'Kept for 30 days · upgrade to save forever'),
    recent.length>0&&React.createElement(React.Fragment,null,
      React.createElement('span',{className:'lbl'},'Recent'),
      recent.map((r,i)=>{
        const p=PROMPTS.find(x=>x.id===r.type);
        return React.createElement('div',{key:i,className:'card',style:{padding:'14px 18px',marginBottom:10}},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:6}},
            React.createElement('span',{style:{fontSize:11,color:T.accent}},`${p?.icon} ${p?.label}`),
            React.createElement('span',{style:{fontSize:11,color:T.muted}},new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))
          ),
          React.createElement('div',{style:{fontSize:13,color:T.text,lineHeight:1.65}},r.text)
        );
      })
    )
  );
}

// ── TABS ─────────────────────────────────────────────────────
const TABS=[
  {id:'jap',label:'Jap',Ico:IcoJap},
  {id:'guidance',label:'Guidance',Ico:IcoGuidance},
  {id:'dharma',label:'Dharma',Ico:IcoDharma},
  {id:'reflect',label:'Reflect',Ico:IcoReflect},
];

// ── APP ROOT ─────────────────────────────────────────────────
function App(){
  const [tab,setTab]=useState('jap');
  const [state,setState]=useState(initState);
  const dispatch=useCallback(a=>setState(p=>reducer(p,a)),[]);

  const pages={
    jap:React.createElement(JapPage,{state,dispatch}),
    guidance:React.createElement(GuidancePage,{state,dispatch}),
    dharma:React.createElement(DharmaPage),
    reflect:React.createElement(ReflectionPage,{state,dispatch}),
  };

  return React.createElement(React.Fragment,null,
    React.createElement('style',null,CSS),
    React.createElement('div',{className:'app'},
      React.createElement(Header),
      pages[tab],
      React.createElement('nav',{className:'nav'},
        TABS.map(t=>React.createElement('button',{
          key:t.id,className:`nb${tab===t.id?' on':''}`,onClick:()=>setTab(t.id)},
          React.createElement(t.Ico),t.label
        ))
      )
    )
  );
}

// ── MOUNT ────────────────────────────────────────────────────
const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
