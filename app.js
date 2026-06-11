const { useState, useCallback, useRef, useEffect } = React;

// ── THEME — cooler, softer, less warm ────────────────────────
const T = {
  bg:          "#f8f7f4",   // cooler soft cream, less yellow
  surface:     "#f2f0eb",
  border:      "#e8e4dc",   // softer, lighter border
  borderLight: "#eeece7",
  text:        "#1c1917",
  muted:       "#9c9488",
  accent:      "#a0522d",   // slightly cooler sienna, less orange
  accentLight: "#f5ede6",
  gold:        "#b8975a",   // more muted gold
  white:       "#ffffff",
};

// ── WISDOM DATABASE — unchanged ──────────────────────────────
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

// ── DHARMA VERSES — unchanged ────────────────────────────────
const DHARMA = [
  {sanskrit:'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',source:'Bhagavad Gita 2.47',
    meaning:'You have the right to perform your duties, but never to the fruits of your actions.',
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

// ── PERSISTENCE — unchanged ───────────────────────────────────
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
  const s=load(),t=today(),newDay=s&&s.lastDate!==t;
  const base={count:0,malas:0,lastDate:t,totalCount:0,streak:1,reflections:[],lastGuidance:null,guidanceUsedToday:false};
  if(!s)return base;
  return{...base,...s,lastDate:t,
    count:newDay?0:s.count,malas:newDay?0:s.malas,
    guidanceUsedToday:newDay?false:s.guidanceUsedToday,
    streak:newDay?(wasYesterday(s.lastDate)?(s.streak||1)+1:1):(s.streak||1)};
}

// ── REDUCER — unchanged ───────────────────────────────────────
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

// ── GLOBAL CSS — tone correction pass ────────────────────────
const CSS=`
  .app{
    max-width:430px;margin:0 auto;min-height:100vh;
    display:flex;flex-direction:column;background:${T.bg};
  }

  /* header — barely there */
  .hdr{
    padding:20px 28px 0;
    display:flex;align-items:center;gap:7px;
  }
  .hdr-name{
    font-family:'Cormorant Garamond',serif;
    font-size:13px;font-weight:400;
    color:${T.muted};letter-spacing:.18em;
  }
  .hdr-dot{
    width:3px;height:3px;border-radius:50%;
    background:${T.accent};opacity:.4;margin-top:1px;
  }

  /* page */
  .page{
    flex:1;padding:40px 28px 110px;
    animation:fu .2s ease;overflow-y:auto;
  }
  @keyframes fu{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}

  /* nav */
  .nav{
    position:fixed;bottom:0;left:50%;transform:translateX(-50%);
    width:100%;max-width:430px;
    background:${T.white};
    border-top:1px solid ${T.borderLight};
    display:flex;z-index:100;
    padding-bottom:env(safe-area-inset-bottom,0);
  }
  .nb{
    flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
    padding:11px 4px 9px;background:none;border:none;cursor:pointer;
    color:${T.muted};font-family:'Inter',sans-serif;
    font-size:10px;letter-spacing:.04em;transition:color .2s;
  }
  .nb.on{color:${T.accent};}
  .nb svg{width:19px;height:19px;}

  /* typography */
  .ptitle{
    font-family:'Cormorant Garamond',serif;
    font-size:26px;font-weight:300;
    color:${T.text};margin-bottom:6px;line-height:1.25;
  }
  .psub{
    font-size:11px;color:${T.muted};
    letter-spacing:.1em;text-transform:uppercase;
    margin-bottom:36px;
  }

  /* content blocks — no cards, just breathing space */
  .block{
    margin-bottom:32px;
  }
  .block-ruled{
    border-top:1px solid ${T.border};
    padding-top:24px;margin-bottom:32px;
  }

  /* soft card — only when grouping is truly needed */
  .well{
    background:${T.surface};
    border:1px solid ${T.borderLight};
    border-radius:12px;
    padding:20px 22px;
    margin-bottom:20px;
  }

  /* buttons — quieter */
  .btn{
    display:inline-flex;align-items:center;justify-content:center;gap:7px;
    padding:11px 22px;border-radius:100px;border:none;cursor:pointer;
    font-family:'Inter',sans-serif;font-size:13px;font-weight:400;
    letter-spacing:.03em;transition:opacity .18s;
    -webkit-tap-highlight-color:transparent;
  }
  .bp{background:${T.accent};color:${T.white};}
  .bp:hover{opacity:.85;}
  .bp:disabled{opacity:.28;cursor:default;}
  .bg{background:transparent;color:${T.muted};border:1px solid ${T.border};}
  .bg:hover{background:${T.surface};}
  .sm{padding:8px 18px;font-size:12px;}
  .fw{width:100%;}

  /* text link — not a button */
  .txt-link{
    background:none;border:none;
    color:${T.muted};font-size:12px;
    font-family:'Inter',sans-serif;
    cursor:pointer;padding:0;
    text-decoration:none;
    letter-spacing:.03em;
  }
  .txt-link:hover{color:${T.text};}

  /* label */
  .lbl{
    font-size:10px;color:${T.muted};
    letter-spacing:.12em;text-transform:uppercase;
    margin-bottom:10px;display:block;
  }

  /* emotion grid */
  .emotion-grid{
    display:grid;grid-template-columns:1fr 1fr;
    gap:8px;margin-bottom:32px;
  }
  .emotion-btn{
    display:flex;align-items:center;gap:9px;
    padding:12px 14px;border-radius:10px;cursor:pointer;
    font-family:'Inter',sans-serif;font-size:13px;
    transition:all .15s;
    border:1px solid ${T.borderLight};
    background:${T.white};color:${T.text};font-weight:300;
  }
  .emotion-btn.on{
    background:${T.accentLight};
    border-color:${T.accent}60;
    color:${T.accent};font-weight:400;
  }

  /* chips */
  .chips{display:flex;gap:7px;margin-bottom:22px;overflow-x:auto;padding-bottom:2px;}
  .chip{
    display:inline-flex;align-items:center;gap:5px;
    padding:6px 13px;border-radius:100px;font-size:12px;
    cursor:pointer;border:1px solid ${T.borderLight};
    background:${T.white};color:${T.muted};
    font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap;
  }
  .chip.on{
    background:${T.accentLight};
    border-color:${T.accent}50;
    color:${T.accent};
  }

  /* form */
  textarea,input{
    width:100%;background:${T.surface};
    border:1px solid ${T.borderLight};border-radius:10px;
    padding:14px 16px;font-family:'Inter',sans-serif;
    font-size:14px;font-weight:300;color:${T.text};
    outline:none;line-height:1.65;
    transition:border-color .18s;-webkit-appearance:none;resize:none;
  }
  textarea:focus,input:focus{border-color:${T.accent}80;}
  textarea::placeholder,input::placeholder{color:${T.muted};}

  /* divider */
  .rule{height:1px;background:${T.borderLight};margin:20px 0;}

  /* ring tap area */
  .rring{position:relative;cursor:pointer;}
  .rpulse{
    position:absolute;inset:-14px;border-radius:50%;
    background:${T.accentLight};opacity:0;pointer-events:none;
  }
  .ractive{animation:rp .35s ease-out forwards;}
  @keyframes rp{
    0%{opacity:.4;transform:scale(.9)}
    100%{opacity:0;transform:scale(1.05)}
  }

  /* stats */
  .stats-row{display:flex;gap:32px;margin-bottom:48px;margin-top:8px;}
  .stat{text-align:center;}
  .stat-v{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;color:${T.text};}
  .stat-l{font-size:9px;color:${T.muted};letter-spacing:.1em;text-transform:uppercase;margin-top:3px;}
`;

// ── ICONS — unchanged ─────────────────────────────────────────
function IcoJap(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'9'}),React.createElement('circle',{cx:'12',cy:'12',r:'3'}),React.createElement('path',{d:'M12 3v2M12 19v2M3 12h2M19 12h2'}));}
function IcoGuidance(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('circle',{cx:'12',cy:'12',r:'10'}),React.createElement('path',{d:'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01'}));}
function IcoDharma(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'}));}
function IcoReflect(){return React.createElement('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.4',strokeLinecap:'round',strokeLinejoin:'round'},React.createElement('path',{d:'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'}),React.createElement('path',{d:'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'}));}

// ── HEADER ────────────────────────────────────────────────────
function Header(){
  return React.createElement('header',{className:'hdr'},
    React.createElement('span',{className:'hdr-name'},'Prashama'),
    React.createElement('div',{className:'hdr-dot'})
  );
}

// ── JAP PAGE ──────────────────────────────────────────────────
function JapPage({state,dispatch}){
  const {count,malas,totalCount,streak}=state;
  const ripRef=useRef(null);
  const R=108,circ=2*Math.PI*R,offset=circ*(1-count/108),done=count>=108;

  function tap(){
    if(done)return;
    dispatch({type:'TAP'});
    if(ripRef.current){
      ripRef.current.classList.remove('ractive');
      void ripRef.current.offsetWidth;
      ripRef.current.classList.add('ractive');
    }
  }

  return React.createElement('div',{className:'page',style:{display:'flex',flexDirection:'column',alignItems:'center'}},
    // stats
    React.createElement('div',{className:'stats-row'},
      [{v:count,l:'Today'},{v:malas,l:'Malas'},{v:`${streak}d`,l:'Streak'},{v:totalCount>9999?`${(totalCount/1000).toFixed(1)}k`:totalCount,l:'Total'}]
      .map(s=>React.createElement('div',{key:s.l,className:'stat'},
        React.createElement('div',{className:'stat-v'},s.v),
        React.createElement('div',{className:'stat-l'},s.l)
      ))
    ),

    // ring
    React.createElement('div',{className:'rring',onClick:tap,
      style:{width:256,height:256,position:'relative',marginBottom:28}},
      React.createElement('div',{ref:ripRef,className:'rpulse'}),
      React.createElement('svg',{width:256,height:256,style:{position:'absolute',top:0,left:0}},
        React.createElement('circle',{cx:128,cy:128,r:R,fill:'none',stroke:T.borderLight,strokeWidth:'1.5'}),
        React.createElement('circle',{cx:128,cy:128,r:R,fill:'none',
          stroke:done?T.gold:T.accent,strokeWidth:'2',strokeLinecap:'round',
          strokeDasharray:circ,strokeDashoffset:offset,
          transform:'rotate(-90 128 128)',
          style:{transition:'stroke-dashoffset .2s ease,stroke .3s'}})
      ),
      React.createElement('div',{style:{
        position:'absolute',inset:0,display:'flex',
        flexDirection:'column',alignItems:'center',justifyContent:'center',
        pointerEvents:'none',
      }},
        done
          ? React.createElement(React.Fragment,null,
              React.createElement('div',{style:{fontSize:40}},'🙏'),
              React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:14,
                color:T.gold,marginTop:10,letterSpacing:'.08em',fontWeight:300}},
                'mala complete')
            )
          : React.createElement(React.Fragment,null,
              React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',
                fontSize:68,fontWeight:300,lineHeight:1,color:T.text}},count),
              React.createElement('div',{style:{fontSize:11,color:T.muted,marginTop:8,letterSpacing:'.04em'}},
                `${108-count} remaining`)
            )
      )
    ),

    // hint
    !done && React.createElement('div',{
      style:{fontFamily:'Cormorant Garamond,serif',fontSize:12,color:T.muted,
        fontStyle:'italic',marginBottom:36,letterSpacing:'.08em'}},
      'tap the circle to count'
    ),

    // mala complete
    done
      ? React.createElement('div',{style:{width:'100%',textAlign:'center',padding:'8px 0 20px'}},
          React.createElement('div',{style:{fontFamily:'Cormorant Garamond,serif',fontSize:18,
            color:T.gold,marginBottom:8,fontWeight:300}},
            `${malas+1} mala${(malas+1)!==1?'s':''} today`),
          React.createElement('div',{style:{fontSize:13,color:T.muted,marginBottom:24,lineHeight:1.7}},
            'You have completed a full mala.\nRest in this moment.'),
          React.createElement('button',{className:'btn bp sm',
            onClick:()=>dispatch({type:'NEW_MALA'})},
            'Begin next mala')
        )
      : React.createElement('button',{className:'btn bg sm',
          onClick:()=>{if(window.confirm("Reset today's count?"))dispatch({type:'RESET_DAY'});}},
          'Reset today'
        )
  );
}

// ── GUIDANCE PAGE ─────────────────────────────────────────────
const EMOTIONS=Object.entries(WISDOM).map(([id,w])=>({id,emoji:w.emoji,label:w.label}));

function GuidancePage({state,dispatch}){
  const [sel,setSel]=useState(null);
  const [view,setView]=useState('select');

  useEffect(()=>{
    if(state.lastGuidance?.date===today()){
      setSel(state.lastGuidance.emotion);
      setView('result');
    }
  },[]);

  function receive(){
    if(!sel)return;
    dispatch({type:'SET_GUIDANCE',p:{date:today(),emotion:sel}});
    setView('result');
  }

  function reset(){
    setSel(null);setView('select');
  }

  // select view
  if(view==='select') return React.createElement('div',{className:'page'},
    React.createElement('h1',{className:'ptitle'},'Guidance'),
    React.createElement('p',{className:'psub'},'How are you feeling?'),
    React.createElement('div',{className:'emotion-grid'},
      EMOTIONS.map(e=>React.createElement('button',{
        key:e.id,className:`emotion-btn${sel===e.id?' on':''}`,
        onClick:()=>setSel(e.id)},
        React.createElement('span',{style:{fontSize:16}},e.emoji),e.label
      ))
    ),
    React.createElement('button',{className:'btn bp fw',disabled:!sel,onClick:receive},
      'Receive guidance'
    )
  );

  // result view — no card containers, just open text with breathing room
  const w=WISDOM[sel];
  return React.createElement('div',{className:'page'},
    React.createElement('div',{style:{fontSize:24,marginBottom:16}},w.emoji),
    React.createElement('h1',{className:'ptitle'},w.label),
    React.createElement('p',{className:'psub'},w.verse.source),

    // sanskrit — open, no box
    React.createElement('div',{style:{
      fontFamily:'Cormorant Garamond,serif',fontSize:20,fontWeight:400,
      lineHeight:1.65,color:T.text,marginBottom:8
    }},w.verse.sanskrit),
    React.createElement('div',{style:{
      fontSize:11,color:T.muted,fontStyle:'italic',marginBottom:24,lineHeight:1.6
    }},w.verse.transliteration),

    // meaning
    React.createElement('div',{style:{
      fontSize:14,color:T.text,lineHeight:1.85,marginBottom:36
    }},w.verse.meaning),

    // reflection — ruled separator, no card
    React.createElement('div',{className:'block-ruled'},
      React.createElement('span',{className:'lbl'},'Reflection'),
      React.createElement('div',{style:{
        fontFamily:'Cormorant Garamond,serif',fontSize:17,fontStyle:'italic',
        color:T.text,lineHeight:1.75
      }},`"${w.reflection}"`)
    ),

    // action
    React.createElement('div',{className:'block-ruled'},
      React.createElement('span',{className:'lbl'},'Today'),
      React.createElement('div',{style:{fontSize:14,color:T.text,lineHeight:1.85}},w.action)
    ),

    // affirmation — minimal, centered
    React.createElement('div',{style:{
      textAlign:'center',padding:'8px 0 36px',
      fontFamily:'Cormorant Garamond,serif',fontSize:15,
      color:T.muted,fontStyle:'italic',lineHeight:1.6
    }},`❝ ${w.affirmation} ❞`),

    React.createElement('button',{
      className:'txt-link',style:{display:'block',margin:'0 auto'},
      onClick:reset
    },'← back')
  );
}

// ── DHARMA PAGE — simplified, stillness-first ─────────────────
function DharmaPage(){
  const v=getTodayVerse();
  const dl=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

  function share(){
    const t=`"${v.meaning}"\n\n— ${v.source}\n\nPrashama 🙏`;
    if(navigator.share)navigator.share({title:"Today's Dharma",text:t});
    else navigator.clipboard?.writeText(t).then(()=>alert('Copied'));
  }

  return React.createElement('div',{className:'page'},
    React.createElement('h1',{className:'ptitle'},"Today's Dharma"),
    React.createElement('p',{className:'psub'},dl),

    // verse — open, no container
    React.createElement('div',{style:{
      fontFamily:'Cormorant Garamond,serif',fontSize:22,fontWeight:400,
      lineHeight:1.65,color:T.text,marginBottom:10
    }},v.sanskrit),
    React.createElement('div',{style:{
      fontSize:11,color:T.muted,letterSpacing:'.08em',marginBottom:32
    }},v.source),
    React.createElement('div',{style:{
      fontSize:14,color:T.text,lineHeight:1.9,marginBottom:40
    }},v.meaning),

    // reflection — ruled
    React.createElement('div',{className:'block-ruled'},
      React.createElement('div',{style:{
        fontFamily:'Cormorant Garamond,serif',fontSize:16,fontStyle:'italic',
        color:T.muted,lineHeight:1.75
      }},v.reflection)
    ),

    // share — quiet text link, not dominant button
    React.createElement('div',{style:{marginTop:8}},
      React.createElement('button',{className:'txt-link',onClick:share},
        'Share this verse →'
      )
    )
  );
}

// ── REFLECTION PAGE ───────────────────────────────────────────
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
    setText('');setSaved(true);setTimeout(()=>setSaved(false),2000);
  }

  return React.createElement('div',{className:'page'},
    React.createElement('h1',{className:'ptitle'},'Reflection'),
    React.createElement('p',{className:'psub'},'A moment of honest presence'),

    React.createElement('div',{className:'chips'},
      PROMPTS.map(p=>React.createElement('button',{
        key:p.id,className:`chip${type===p.id?' on':''}`,
        onClick:()=>setType(p.id)
      },`${p.icon} ${p.label}`))
    ),

    React.createElement('textarea',{
      key:type,rows:5,placeholder:pr.ph,value:text,
      onChange:e=>setText(e.target.value),
      style:{marginBottom:14}
    }),

    React.createElement('button',{
      className:'btn bp fw',disabled:!text.trim(),onClick:doSave
    },saved?'✓ Saved':'Save'),

    React.createElement('p',{style:{
      fontSize:11,color:T.muted,textAlign:'center',marginTop:10,marginBottom:40
    }},'Kept for 30 days'),

    // recent entries — light, open
    recent.length>0&&React.createElement(React.Fragment,null,
      React.createElement('span',{className:'lbl'},'Recent'),
      recent.map((r,i)=>{
        const p=PROMPTS.find(x=>x.id===r.type);
        return React.createElement('div',{key:i,style:{
          borderTop:`1px solid ${T.borderLight}`,
          paddingTop:16,marginBottom:16,
        }},
          React.createElement('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:6}},
            React.createElement('span',{style:{fontSize:11,color:T.muted}},`${p?.icon} ${p?.label}`),
            React.createElement('span',{style:{fontSize:11,color:T.muted}},
              new Date(r.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}))
          ),
          React.createElement('div',{style:{fontSize:13,color:T.text,lineHeight:1.7}},r.text)
        );
      })
    )
  );
}

// ── TABS ──────────────────────────────────────────────────────
const TABS=[
  {id:'jap',label:'Jap',Ico:IcoJap},
  {id:'guidance',label:'Guidance',Ico:IcoGuidance},
  {id:'dharma',label:'Dharma',Ico:IcoDharma},
  {id:'reflect',label:'Reflect',Ico:IcoReflect},
];

// ── APP ROOT — unchanged ──────────────────────────────────────
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
          key:t.id,className:`nb${tab===t.id?' on':''}`,
          onClick:()=>setTab(t.id)
        },React.createElement(t.Ico),t.label))
      )
    )
  );
}

const root=ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
