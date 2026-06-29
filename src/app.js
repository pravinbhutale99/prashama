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
  // Chapter 1
  { source: 'Bhagavad Gita 1.1',  sanskrit: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।', meaning: '"On the field of dharma, the field of Kurukshetra, my sons and the sons of Pandu gathered, eager to fight."', reflection: 'Every day is a field. What you choose to stand for becomes the ground beneath your feet.' },
  { source: 'Bhagavad Gita 1.47', sanskrit: 'सञ्जय उवाच एवमुक्त्वार्जुनः संख्ये रथोपस्थ उपाविशत्।', meaning: '"Having spoken thus, Arjuna sat down on the chariot, his bow slipping from his hands, his mind overwhelmed with grief."', reflection: 'Even the most capable among us can be brought low by grief. Sitting still in that moment is not failure. It is the beginning.' },

  // Chapter 2
  { source: 'Bhagavad Gita 2.3',  sanskrit: 'क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते।', meaning: '"Do not yield to impotence, O Arjuna. It does not become you. Shake off this weakness and arise."', reflection: 'There is a voice inside you that already knows what must be done. Listen to it.' },
  { source: 'Bhagavad Gita 2.11', sanskrit: 'अशोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे।', meaning: '"You grieve for those who need no grief, and yet speak words that sound like wisdom."', reflection: 'Much of what we mourn was never truly lost. Much of what we fear has already passed.' },
  { source: 'Bhagavad Gita 2.13', sanskrit: 'देहिनोऽस्मिन्यथा देहे कौमारं यौवनं जरा।', meaning: '"Just as the soul passes through childhood, youth, and old age in this body, so it passes into another body at death."', reflection: 'You are not this season of your life. You are the one who moves through all seasons.' },
  { source: 'Bhagavad Gita 2.14', sanskrit: 'मात्रास्पर्शास्तु कौन्तेय शीतोष्णसुखदुःखदाः।', meaning: '"The contact of the senses with their objects gives rise to cold and heat, pleasure and pain. They come and go — bear them with patience."', reflection: 'Nothing that passes through you has the power to define you. Endure. This too will pass.' },
  { source: 'Bhagavad Gita 2.17', sanskrit: 'अविनाशि तु तद्विद्धि येन सर्वमिदं ततम्।', meaning: '"Know that which pervades the entire universe is indestructible. No one can destroy the imperishable soul."', reflection: 'Something in you cannot be broken. Reach for that today.' },
  { source: 'Bhagavad Gita 2.19', sanskrit: 'य एनं वेत्ति हन्तारं यश्चैनं मन्यते हतम्।', meaning: '"One who thinks the soul kills and one who thinks it is killed — neither knows the truth. The soul neither kills nor is killed."', reflection: 'You are not your wounds. And you are not the one who caused them.' },
  { source: 'Bhagavad Gita 2.20', sanskrit: 'न जायते म्रियते वा कदाचिन्।', meaning: '"The soul is never born nor dies at any time. It has not come into being, does not come into being, and will not come into being."', reflection: 'What you truly are is eternal. Only the body is temporary.' },
  { source: 'Bhagavad Gita 2.22', sanskrit: 'वासांसि जीर्णानि यथा विहाय नवानि गृह्णाति नरोऽपराणि।', meaning: '"As a person puts on new garments, giving up old ones, the soul accepts new material bodies, giving up the old and useless ones."', reflection: 'Change is not loss. Sometimes it is the kindest form of renewal.' },
  { source: 'Bhagavad Gita 2.23', sanskrit: 'नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः।', meaning: '"The soul cannot be cut by any weapon, nor burned by fire, nor moistened by water, nor withered by wind."', reflection: 'What you truly are cannot be harmed. Remember this on the hard days.' },
  { source: 'Bhagavad Gita 2.38', sanskrit: 'सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।', meaning: '"Do your duty with an equal mind in happiness and distress, loss and gain, victory and defeat."', reflection: 'Equanimity is not indifference. It is the deepest form of strength.' },
  { source: 'Bhagavad Gita 2.40', sanskrit: 'नेहाभिक्रमनाशोऽस्ति प्रत्यवायो न विद्यते।', meaning: '"In this path, no effort is ever lost, and no obstacle prevails. Even a little practice of this dharma protects one from the greatest fear."', reflection: 'Every small step on the path of truth accumulates. Nothing sincere is ever wasted.' },
  { source: 'Bhagavad Gita 2.47', sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।', meaning: '"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."', reflection: 'The effort is yours. The outcome belongs to the universe.' },
  { source: 'Bhagavad Gita 2.48', sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।', meaning: '"Be steadfast in yoga, O Arjuna. Perform your duty without attachment to success or failure. Such equanimity is called yoga."', reflection: 'Do the work. Release the result. That is the whole teaching.' },
  { source: 'Bhagavad Gita 2.50', sanskrit: 'बुद्धियुक्तो जहातीह उभे सुकृतदुष्कृते।', meaning: '"One who is united in wisdom abandons both good and evil deeds. Therefore, devote yourself to yoga — skill in action is yoga."', reflection: 'Act with full presence. Let the quality of your attention be the offering.' },
  { source: 'Bhagavad Gita 2.55', sanskrit: 'प्रजहाति यदा कामान्सर्वान्पार्थ मनोगतान्।', meaning: '"When one abandons all desires of the mind and is satisfied in the self alone, then one is said to be of steady wisdom."', reflection: 'Contentment is not settling. It is arriving — fully — where you already are.' },
  { source: 'Bhagavad Gita 2.58', sanskrit: 'यदा संहरते चायं कूर्मोऽङ्गानीव सर्वशः।', meaning: '"When one withdraws the senses from sense objects, as a tortoise draws its limbs within its shell, wisdom becomes steady."', reflection: 'You do not have to respond to everything. Stillness is also a form of wisdom.' },
  { source: 'Bhagavad Gita 2.62', sanskrit: 'ध्यायतो विषयान्पुंसः सङ्गस्तेषूपजायते।', meaning: '"Contemplating the objects of the senses, one develops attachment. From attachment comes desire, and from desire, suffering."', reflection: 'What you dwell on, you become. Guard your attention.' },
  { source: 'Bhagavad Gita 2.63', sanskrit: 'क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः।', meaning: '"From anger comes delusion. From delusion, loss of memory. From loss of memory, destruction of discrimination — and from that, one perishes."', reflection: 'Anger is a fire that consumes the one who holds it first. Breathe before you act.' },
  { source: 'Bhagavad Gita 2.66', sanskrit: 'नास्ति बुद्धिरयुक्तस्य न चायुक्तस्य भावना।', meaning: '"One who is not connected in mind can have no wisdom, nor steady thought — and without steadiness, there can be no peace."', reflection: 'Peace begins inside. Before the world. Before the day. Before the plan.' },
  { source: 'Bhagavad Gita 2.69', sanskrit: 'या निशा सर्वभूतानां तस्यां जागर्ति संयमी।', meaning: '"What is night for all beings is the time of awakening for the self-controlled. And what is the time of awakening for all beings is night for the introspective sage."', reflection: 'The world and the wise do not always see the same moment. Trust your inner light.' },
  { source: 'Bhagavad Gita 2.70', sanskrit: 'आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत्।', meaning: '"Just as the ocean remains undisturbed even as rivers flow into it, so the one who is unmoved by desires attains peace."', reflection: 'You can hold everything without being moved by everything. That is the ocean.' },

  // Chapter 3
  { source: 'Bhagavad Gita 3.5',  sanskrit: 'न हि कश्चित्क्षणमपि जातु तिष्ठत्यकर्मकृत्।', meaning: '"No one can remain inactive even for a moment. Everyone is driven to action by the forces of nature."', reflection: 'You are always in motion. The question is only whether you are moving consciously.' },
  { source: 'Bhagavad Gita 3.7',  sanskrit: 'यस्त्विन्द्रियाणि मनसा नियम्यारभतेऽर्जुन।', meaning: '"But one who controls the senses by the mind and engages the organs of action in work without attachment — that person is superior."', reflection: 'The goal is not to suppress life. It is to live it with mastery.' },
  { source: 'Bhagavad Gita 3.8',  sanskrit: 'नियतं कुरु कर्म त्वं कर्म ज्यायो ह्यकर्मणः।', meaning: '"Do what must be done. Action is better than inaction. Even the body cannot be maintained without movement."', reflection: 'Even quiet effort has meaning. One small thing is enough to begin.' },
  { source: 'Bhagavad Gita 3.16', sanskrit: 'एवं प्रवर्तितं चक्रं नानुवर्तयतीह यः।', meaning: '"One who does not follow the cycle of this world lives in vain — with a life of sin, indulging the senses."', reflection: 'We are part of something larger. Act in a way that honours that.' },
  { source: 'Bhagavad Gita 3.19', sanskrit: 'तस्मादसक्तः सततं कार्यं कर्म समाचर।', meaning: '"Therefore, without attachment, always perform the action that must be done — for by performing action without attachment, one attains the Supreme."', reflection: 'Show up fully. Let go completely. These are not opposites.' },
  { source: 'Bhagavad Gita 3.21', sanskrit: 'यद्यदाचरति श्रेष्ठस्तत्तदेवेतरो जनः।', meaning: '"Whatever a great person does, others follow. Whatever standard they set, the world pursues."', reflection: 'You are being watched by someone. Let your actions be worth following.' },
  { source: 'Bhagavad Gita 3.27', sanskrit: 'प्रकृतेः क्रियमाणानि गुणैः कर्माणि सर्वशः।', meaning: '"All actions are performed by the modes of material nature. But one deluded by ego thinks, I am the doer."', reflection: 'Humility is knowing how much is given, not just earned.' },
  { source: 'Bhagavad Gita 3.30', sanskrit: 'मयि सर्वाणि कर्माणि संन्यस्याध्यात्मचेतसा।', meaning: '"Surrender all your actions to Me, with full knowledge of the self. Free from desire and ego — fight without distress."', reflection: 'You do not have to carry this alone. Surrender is not defeat. It is trust.' },
  { source: 'Bhagavad Gita 3.37', sanskrit: 'काम एष क्रोध एष रजोगुणसमुद्भवः।', meaning: '"It is desire — and then anger — born of the mode of passion. This is the enemy here, consuming and sinful."', reflection: 'Notice the moment desire turns to craving. That is where the suffering begins.' },
  { source: 'Bhagavad Gita 3.42', sanskrit: 'इन्द्रियाणि पराण्याहुरिन्द्रियेभ्यः परं मनः।', meaning: '"The senses are superior to the body. The mind is superior to the senses. Intelligence is superior to the mind. And the soul is superior to intelligence."', reflection: 'You are more than your feelings. More than your thoughts. Go deeper.' },

  // Chapter 4
  { source: 'Bhagavad Gita 4.7',  sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।', meaning: '"Whenever righteousness fades and unrighteousness rises, I manifest myself."', reflection: 'In every age of darkness, something rises to meet it. You may be part of that rising.' },
  { source: 'Bhagavad Gita 4.8',  sanskrit: 'परित्राणाय साधूनां विनाशाय च दुष्कृताम्।', meaning: '"To protect the righteous, to annihilate the wicked, and to restore the principles of dharma — I appear age after age."', reflection: 'There is an order beneath the chaos. Trust it, even when you cannot see it.' },
  { source: 'Bhagavad Gita 4.11', sanskrit: 'ये यथा मां प्रपद्यन्ते तांस्तथैव भजाम्यहम्।', meaning: '"In whatever way people come to Me, I meet them there. The Divine meets you exactly where you are."', reflection: 'You do not need to be perfect to be met. Just sincere.' },
  { source: 'Bhagavad Gita 4.18', sanskrit: 'कर्मण्यकर्म यः पश्येदकर्मणि च कर्म यः।', meaning: '"One who sees inaction in action and action in inaction is wise among humans."', reflection: 'Sometimes the deepest work happens in stillness. Rest is not always absence of effort.' },
  { source: 'Bhagavad Gita 4.24', sanskrit: 'ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।', meaning: '"The act of offering is Brahman, the offering itself is Brahman, offered by Brahman into the fire of Brahman."', reflection: 'When everything becomes an offering — cooking, working, speaking — life becomes sacred.' },
  { source: 'Bhagavad Gita 4.33', sanskrit: 'श्रेयान्द्रव्यमयाद्यज्ञाज्ज्ञानयज्ञः परन्तप।', meaning: '"The sacrifice of wisdom is greater than any material sacrifice."', reflection: 'What you understand deeply, you can offer endlessly. Knowledge is the gift that does not diminish.' },
  { source: 'Bhagavad Gita 4.36', sanskrit: 'अपि चेदसि पापेभ्यः सर्वेभ्यः पापकृत्तमः।', meaning: '"Even if you are the most sinful of all sinners, you shall cross over all evil by the boat of knowledge."', reflection: 'No one is beyond the reach of understanding. No one is too far gone.' },
  { source: 'Bhagavad Gita 4.38', sanskrit: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।', meaning: '"There is nothing as purifying as knowledge. In time, one who is perfected in yoga finds it within."', reflection: 'Understanding cleanses what regret cannot. Seek it patiently.' },
  { source: 'Bhagavad Gita 4.40', sanskrit: 'अज्ञश्चाश्रद्दधानश्च संशयात्मा विनश्यति।', meaning: '"The ignorant, the faithless, and the doubting self are lost. There is no happiness in this world or the next for the doubting soul."', reflection: 'Doubt is natural. But let it lead you toward truth, not away from it.' },

  // Chapter 5
  { source: 'Bhagavad Gita 5.7',  sanskrit: 'योगयुक्तो विशुद्धात्मा विजितात्मा जितेन्द्रियः।', meaning: '"One who acts in devotion, who is pure in soul, who has mastered the self and conquered the senses — such a one is dear to all and all are dear to them."', reflection: 'Mastery of self is the beginning of connection with others.' },
  { source: 'Bhagavad Gita 5.10', sanskrit: 'ब्रह्मण्याधाय कर्माणि सङ्गं त्यक्त्वा करोति यः।', meaning: '"One who acts, surrendering all to the Divine and abandoning attachment, is untouched by sin — as a lotus leaf is untouched by water."', reflection: 'Be in the world fully. Let none of it stick to you as identity.' },
  { source: 'Bhagavad Gita 5.18', sanskrit: 'विद्याविनयसम्पन्ने ब्राह्मणे गवि हस्तिनि।', meaning: '"The wise see with equal eyes a learned sage, a cow, an elephant, a dog, and an outcast."', reflection: 'The more you grow, the more you see the same light in everything.' },
  { source: 'Bhagavad Gita 5.19', sanskrit: 'इहैव तैर्जितः सर्गो येषां साम्ये स्थितं मनः।', meaning: '"Those whose minds are established in equality have already conquered creation. The Divine is equal — therefore they abide in the Divine."', reflection: 'Equanimity is not achieved in mountains. It is practised here, in ordinary moments.' },
  { source: 'Bhagavad Gita 5.21', sanskrit: 'बाह्यस्पर्शेष्वसक्तात्मा विन्दत्यात्मनि यत्सुखम्।', meaning: '"One who is not attached to external pleasures finds happiness in the self. United with the Divine, one enjoys eternal bliss."', reflection: 'The deepest joy does not require anything from outside. It is already here.' },
  { source: 'Bhagavad Gita 5.22', sanskrit: 'ये हि संस्पर्शजा भोगा दुःखयोनय एव ते।', meaning: '"The pleasures that arise from sense contact are sources of suffering. They have a beginning and an end. The wise do not delight in them."', reflection: 'Not all that feels good is nourishing. Learn to tell the difference.' },
  { source: 'Bhagavad Gita 5.24', sanskrit: 'योऽन्तःसुखोऽन्तरारामस्तथान्तर्ज्योतिरेव यः।', meaning: '"One who finds happiness within, who finds joy within, and who finds light within — such a yogi attains liberation."', reflection: 'You are looking for outside what can only be found inside.' },

  // Chapter 6
  { source: 'Bhagavad Gita 6.1',  sanskrit: 'अनाश्रितः कर्मफलं कार्यं कर्म करोति यः।', meaning: '"One who performs their duty without depending on the fruits of action — that person is a true renunciant and yogi."', reflection: 'True renunciation is not leaving the world. It is acting in it without needing it to reward you.' },
  { source: 'Bhagavad Gita 6.5',  sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।', meaning: '"Lift yourself up by your own self. Do not let yourself fall. The self alone is the friend of the self — and the self alone is the enemy."', reflection: 'You are both the one who struggles and the one who can offer a kinder hand.' },
  { source: 'Bhagavad Gita 6.6',  sanskrit: 'बन्धुरात्मात्मनस्तस्य येनात्मैवात्मना जितः।', meaning: '"For one who has conquered the self, the self is a friend. For one who has not, the self remains an enemy."', reflection: 'The most important relationship you will ever have is the one with yourself.' },
  { source: 'Bhagavad Gita 6.10', sanskrit: 'योगी युञ्जीत सततमात्मानं रहसि स्थितः।', meaning: '"A yogi should always try to concentrate the mind in solitude — alone, with controlled mind and body, free from expectations."', reflection: 'Silence is a practice. Give yourself time in it each day.' },
  { source: 'Bhagavad Gita 6.16', sanskrit: 'नात्यश्नतस्तु योगोऽस्ति न चैकान्तमनश्नतः।', meaning: '"Yoga is not for one who overeats or who fasts excessively. It is not for one who sleeps too much or who is always awake."', reflection: 'Balance is not compromise. It is the most disciplined thing of all.' },
  { source: 'Bhagavad Gita 6.17', sanskrit: 'युक्ताहारविहारस्य युक्तचेष्टस्य कर्मसु।', meaning: '"For one who is moderate in eating and recreation, balanced in work, and regulated in sleep and waking — yoga removes all suffering."', reflection: 'Tend to the basics. Sleep. Food. Movement. These are not small things.' },
  { source: 'Bhagavad Gita 6.19', sanskrit: 'यथा दीपो निवातस्थो नेङ्गते सोपमा स्मृता।', meaning: '"As a lamp in a windless place does not flicker — that is the simile for a yogi of controlled mind."', reflection: 'A still flame gives the most light. Stillness is not weakness — it is clarity.' },
  { source: 'Bhagavad Gita 6.20', sanskrit: 'यत्रोपरमते चित्तं निरुद्धं योगसेवया।', meaning: '"When the mind, restrained by yoga practice, becomes still, and when one sees the self by the self — then comes the highest joy."', reflection: 'The mind must be quieted before it can truly see.' },
  { source: 'Bhagavad Gita 6.26', sanskrit: 'यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्।', meaning: '"Wherever the restless, wandering mind goes, gently bring it back — again and again — to the self."', reflection: 'Return gently. Not once — as many times as needed. That is the practice.' },
  { source: 'Bhagavad Gita 6.27', sanskrit: 'प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।', meaning: '"Supreme happiness comes to the yogi whose mind is peaceful, whose passions are quieted, who has become one with what is."', reflection: 'Peace is not something you find. It is something you return to.' },
  { source: 'Bhagavad Gita 6.30', sanskrit: 'यो मां पश्यति सर्वत्र सर्वं च मयि पश्यति।', meaning: '"One who sees Me everywhere, and sees everything in Me — I am never lost to them, nor are they ever lost to Me."', reflection: 'When you see the Divine in all things, you are never truly alone.' },
  { source: 'Bhagavad Gita 6.35', sanskrit: 'असंशयं महाबाहो मनो दुर्निग्रहं चलम्।', meaning: '"Undoubtedly, the mind is restless and difficult to restrain. But it can be controlled by constant practice and detachment."', reflection: 'The mind is not your enemy. It simply needs patient, firm guidance.' },

  // Chapter 7
  { source: 'Bhagavad Gita 7.3',  sanskrit: 'मनुष्याणां सहस्रेषु कश्चिद्यतति सिद्धये।', meaning: '"Among thousands of people, barely one strives for perfection. And among those who strive — barely one knows Me in truth."', reflection: 'The path is narrow. And walking it makes you rare. Keep going.' },
  { source: 'Bhagavad Gita 7.7',  sanskrit: 'मत्तः परतरं नान्यत्किञ्चिदस्ति धनञ्जय।', meaning: '"There is no truth superior to Me. Everything rests upon Me as pearls are strung on a thread."', reflection: 'Everything is connected to a single source. When you feel lost, return to that thread.' },
  { source: 'Bhagavad Gita 7.8',  sanskrit: 'रसोऽहमप्सु कौन्तेय प्रभास्मि शशिसूर्ययोः।', meaning: '"I am the taste in water. I am the light of the sun and moon. I am the sacred syllable Om in the Vedas."', reflection: 'The Divine is not distant. It is in every sip of water, every ray of light.' },
  { source: 'Bhagavad Gita 7.14', sanskrit: 'दैवी ह्येषा गुणमयी मम माया दुरत्यया।', meaning: '"This divine illusion of Mine, made of the three modes of nature, is difficult to overcome. But those who surrender to Me cross beyond it."', reflection: 'What you think is the whole world is often just the surface. Look deeper.' },
  { source: 'Bhagavad Gita 7.16', sanskrit: 'चतुर्विधा भजन्ते मां जनाः सुकृतिनोऽर्जुन।', meaning: '"Four kinds of people turn to Me: the distressed, the seeker of knowledge, the seeker of wealth, and the wise."', reflection: 'Whatever brought you here — suffering, curiosity, or devotion — you are welcome.' },
  { source: 'Bhagavad Gita 7.19', sanskrit: 'बहूनां जन्मनामन्ते ज्ञानवान्मां प्रपद्यते।', meaning: '"After many births and deaths, one who is truly wise surrenders to Me, knowing that I am everything. Such a great soul is very rare."', reflection: 'Wisdom is not sudden. It accumulates quietly over a lifetime of sincere seeking.' },

  // Chapter 8
  { source: 'Bhagavad Gita 8.5',  sanskrit: 'अन्तकाले च मामेव स्मरन्मुक्त्वा कलेवरम्।', meaning: '"One who remembers Me alone at the time of death — giving up the body — comes to My state. Of this there is no doubt."', reflection: 'What you hold in mind at the end reveals what truly lived in your heart.' },
  { source: 'Bhagavad Gita 8.7',  sanskrit: 'तस्मात्सर्वेषु कालेषु मामनुस्मर युध्य च।', meaning: '"Therefore remember Me at all times and also do your duty. With mind and intellect surrendered to Me, you shall come to Me — without doubt."', reflection: 'Keep the sacred close while living the ordinary. That is the whole practice.' },
  { source: 'Bhagavad Gita 8.14', sanskrit: 'अनन्यचेताः सततं यो मां स्मरति नित्यशः।', meaning: '"For one who always remembers Me without deviation — for such a person, I am easy to obtain."', reflection: 'Constancy, not intensity, is what opens the door.' },

  // Chapter 9
  { source: 'Bhagavad Gita 9.2',  sanskrit: 'राजविद्या राजगुह्यं पवित्रमिदमुत्तमम्।', meaning: '"This knowledge is the king of education, the most secret of all secrets. It is the purest knowledge, and it gives direct perception of the self."', reflection: 'The deepest knowledge is not in books. It is in the silence between your thoughts.' },
  { source: 'Bhagavad Gita 9.22', sanskrit: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।', meaning: '"Those who worship Me with devotion — meditating on My form alone — I carry what they lack and preserve what they have."', reflection: 'You are not carrying this alone. Something greater holds what you cannot.' },
  { source: 'Bhagavad Gita 9.26', sanskrit: 'पत्रं पुष्पं फलं तोयं यो मे भक्त्या प्रयच्छति।', meaning: '"If one offers Me with devotion and love a leaf, a flower, a fruit, or water — I will accept it."', reflection: 'The simplest offering given with full heart is more than enough.' },
  { source: 'Bhagavad Gita 9.27', sanskrit: 'यत्करोषि यदश्नासि यज्जुहोषि ददासि यत्।', meaning: '"Whatever you do, whatever you eat, whatever you offer, whatever you give away — do it as an offering to Me."', reflection: 'When every act becomes an offering, nothing is ordinary anymore.' },
  { source: 'Bhagavad Gita 9.29', sanskrit: 'समोऽहं सर्वभूतेषु न मे द्वेष्योऽस्ति न प्रियः।', meaning: '"I am equally present in all beings. I have no favorites and no enemies. Those who worship Me are in Me — and I am in them."', reflection: 'You are not separate from the source. You never were.' },
  { source: 'Bhagavad Gita 9.30', sanskrit: 'अपि चेत्सुदुराचारो भजते मामनन्यभाक्।', meaning: '"Even if the most evil person worships Me with exclusive devotion, they are to be considered righteous — for they have rightly resolved."', reflection: 'No past makes the present unreachable. The turn toward light is always available.' },
  { source: 'Bhagavad Gita 9.32', sanskrit: 'मां हि पार्थ व्यपाश्रित्य येऽपि स्युः पापयोनयः।', meaning: '"All who take refuge in Me — women, merchants, servants, even those of sinful birth — they too attain the highest goal."', reflection: 'The path is open to everyone. No exception. No exclusion.' },

  // Chapter 10
  { source: 'Bhagavad Gita 10.9', sanskrit: 'मच्चित्ता मद्गतप्राणा बोधयन्तः परस्परम्।', meaning: '"Those whose minds are fixed on Me, whose lives are surrendered to Me — they enlighten one another and speak of Me always."', reflection: 'Surround yourself with people who remind you of what matters.' },
  { source: 'Bhagavad Gita 10.10',sanskrit: 'तेषां सततयुक्तानां भजतां प्रीतिपूर्वकम्।', meaning: '"To those who are always devoted and worship Me with love, I give the yoga of wisdom by which they come to Me."', reflection: 'Devotion opens doors that effort alone cannot.' },
  { source: 'Bhagavad Gita 10.20',sanskrit: 'अहमात्मा गुडाकेश सर्वभूताशयस्थितः।', meaning: '"I am the self seated in the hearts of all beings. I am the beginning, the middle, and the end of all existence."', reflection: 'The Divine is not far. It is the very ground of your being.' },
  { source: 'Bhagavad Gita 10.39',sanskrit: 'यच्चापि सर्वभूतानां बीजं तदहमर्जुन।', meaning: '"I am the seed of all existence. There is no being, moving or unmoving, that can exist without Me."', reflection: 'There is a spark of the eternal in everything. Including you. Especially you.' },
  { source: 'Bhagavad Gita 10.41',sanskrit: 'यद्यद्विभूतिमत्सत्त्वं श्रीमदूर्जितमेव वा।', meaning: '"Know that whatever is beautiful, glorious, or powerful — all of that has its source in a fraction of My splendour."', reflection: 'Every moment of beauty you have ever witnessed was a glimpse of the infinite.' },

  // Chapter 11
  { source: 'Bhagavad Gita 11.33',sanskrit: 'तस्मात्त्वमुत्तिष्ठ यशो लभस्व जित्वा शत्रून्भुङ्क्ष्व राज्यं समृद्धम्।', meaning: '"Therefore arise and win glory. Conquer your enemies and enjoy a flourishing kingdom. They are already slain by My arrangement — be the instrument."', reflection: 'Sometimes the outcome is already written. Your role is simply to show up with full courage.' },
  { source: 'Bhagavad Gita 11.55',sanskrit: 'मत्कर्मकृन्मत्परमो मद्भक्तः सङ्गवर्जितः।', meaning: '"One who acts for Me, who regards Me as the highest, who is devoted to Me, who is free from attachment — comes to Me."', reflection: 'The highest life is one of love, service, and release. In that order.' },

  // Chapter 12
  { source: 'Bhagavad Gita 12.2', sanskrit: 'मय्यावेश्य मनो ये मां नित्ययुक्ता उपासते।', meaning: '"Those who fix their minds on Me and worship Me with constant devotion — I consider them to be the most perfect in yoga."', reflection: 'Perfection is not performance. It is consistent, sincere return.' },
  { source: 'Bhagavad Gita 12.13',sanskrit: 'अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च।', meaning: '"One who is not envious but is a kind friend to all living entities — such a devotee is very dear to Me."', reflection: 'Kindness costs nothing and changes everything.' },
  { source: 'Bhagavad Gita 12.14',sanskrit: 'सन्तुष्टः सततं योगी यतात्मा दृढनिश्चयः।', meaning: '"One who is always satisfied, who meditates constantly, who is self-controlled, and of firm conviction — such a devotee is dear to Me."', reflection: 'Contentment is a form of worship. So is conviction.' },
  { source: 'Bhagavad Gita 12.15',sanskrit: 'यस्मान्नोद्विजते लोको लोकान्नोद्विजते च यः।', meaning: '"One who does not disturb the world, and who is not disturbed by the world — free from elation, envy, fear, and anxiety — is dear to Me."', reflection: 'Be a still point. Not because the world deserves it — because you do.' },
  { source: 'Bhagavad Gita 12.16',sanskrit: 'अनपेक्षः शुचिर्दक्ष उदासीनो गतव्यथः।', meaning: '"One who is free from expectation, who is pure, expert, unconcerned, and free from pain — who does not strive for results — is dear to Me."', reflection: 'Freedom from expectation is not indifference. It is deep trust.' },
  { source: 'Bhagavad Gita 12.17',sanskrit: 'यो न हृष्यति न द्वेष्टि न शोचति न काङ्क्षति।', meaning: '"One who neither rejoices nor grieves, who neither laments nor desires — who renounces both good and evil — is dear to Me."', reflection: 'The balanced soul is not cold. It is the warmest of all, because it is not tossed about.' },
  { source: 'Bhagavad Gita 12.20',sanskrit: 'ये तु धर्म्यामृतमिदं यथोक्तं पर्युपासते।', meaning: '"Those who follow this path of devotion with faith, regarding Me as the highest — such devotees are exceedingly dear to Me."', reflection: 'Faith is not certainty. It is the courage to move toward what you cannot yet see.' },

  // Chapter 13
  { source: 'Bhagavad Gita 13.8', sanskrit: 'अमानित्वमदम्भित्वमहिंसा क्षान्तिरार्जवम्।', meaning: '"Humility, modesty, non-violence, forgiveness, simplicity, service to one\'s teacher — these are declared to be knowledge."', reflection: 'True wisdom makes you gentler, not louder.' },
  { source: 'Bhagavad Gita 13.10',sanskrit: 'मयि चानन्ययोगेन भक्तिरव्यभिचारिणी।', meaning: '"Unwavering devotion to Me through exclusive love — constant retirement to a solitary place — this is declared to be knowledge."', reflection: 'Solitude is not loneliness. It is where you remember who you are.' },
  { source: 'Bhagavad Gita 13.28',sanskrit: 'समं पश्यन्हि सर्वत्र समवस्थितमीश्वरम्।', meaning: '"One who sees the Divine equally present everywhere — in all living beings — does not degrade the self."', reflection: 'When you honour the Divine in another, you honour it in yourself.' },
  { source: 'Bhagavad Gita 13.29',sanskrit: 'प्रकृत्यैव च कर्माणि क्रियमाणानि सर्वशः।', meaning: '"One who sees that all actions are performed by the body born of material nature — and that the self does nothing — truly sees."', reflection: 'Step back from the drama of doing. Observe. The witness is always at peace.' },
  { source: 'Bhagavad Gita 13.30',sanskrit: 'यदा भूतपृथग्भावमेकस्थमनुपश्यति।', meaning: '"When one sees the diversity of beings as resting in the One, and the expansion of all from That — then one attains the Divine."', reflection: 'Beneath the surface of difference, there is always oneness. Look for it.' },

  // Chapter 14
  { source: 'Bhagavad Gita 14.5', sanskrit: 'सत्त्वं रजस्तम इति गुणाः प्रकृतिसम्भवाः।', meaning: '"The three modes — goodness, passion, and ignorance — born of material nature, bind the soul to the body."', reflection: 'Awareness of what moves you is the first step toward freedom from it.' },
  { source: 'Bhagavad Gita 14.17',sanskrit: 'सत्त्वात्सञ्जायते ज्ञानं रजसो लोभ एव च।', meaning: '"From goodness, knowledge arises. From passion, greed arises. From ignorance, negligence and delusion arise."', reflection: 'Cultivate goodness not as a rule, but as a source of clarity.' },
  { source: 'Bhagavad Gita 14.20',sanskrit: 'गुणानेतानतीत्य त्रीन्देही देहसमुद्भवान्।', meaning: '"When the embodied soul rises above the three modes of material nature, it is freed from birth, death, old age, and suffering."', reflection: 'Beyond every condition you carry, there is something unconditioned. Reach for it.' },
  { source: 'Bhagavad Gita 14.23',sanskrit: 'उदासीनवदासीनो गुणैर्यो न विचाल्यते।', meaning: '"One who is seated like a witness, not disturbed by the modes — knowing only that the modes are acting — remains steady and does not waver."', reflection: 'You can be present without being captured. Watch without reacting. That is mastery.' },
  { source: 'Bhagavad Gita 14.25',sanskrit: 'समः शत्रौ च मित्रे च तथा मानापमानयोः।', meaning: '"One equal to friend and foe, in honour and dishonour — such a person has transcended the modes."', reflection: 'Equanimity in all situations is the highest form of spiritual maturity.' },
  { source: 'Bhagavad Gita 14.26',sanskrit: 'मां च योऽव्यभिचारेण भक्तियोगेन सेवते।', meaning: '"One who serves Me with unwavering devotion transcends the modes and becomes fit for liberation."', reflection: 'Consistency of devotion — not perfection of practice — is what transforms.' },

  // Chapter 15
  { source: 'Bhagavad Gita 15.3', sanskrit: 'न रूपमस्येह तथोपलभ्यते नान्तो न चादिर्न च सम्प्रतिष्ठा।', meaning: '"The real form of this tree cannot be perceived in this world. Cut it down with the weapon of detachment."', reflection: 'Many things that look solid and permanent are neither. See clearly.' },
  { source: 'Bhagavad Gita 15.7', sanskrit: 'ममैवांशो जीवलोके जीवभूतः सनातनः।', meaning: '"The living entities in this world are eternal fragments of Myself. They carry with them the mind and senses."', reflection: 'You carry within you a fragment of the eternal. Live accordingly.' },
  { source: 'Bhagavad Gita 15.11',sanskrit: 'यतन्तो योगिनश्चैनं पश्यन्त्यात्मन्यवस्थितम्।', meaning: '"The striving yogis can see this self as situated in the self. But those who are not self-realised cannot see it, even though they try."', reflection: 'Some things are revealed only through sincere practice, not intellect alone.' },
  { source: 'Bhagavad Gita 15.15',sanskrit: 'सर्वस्य चाहं हृदि सन्निविष्टो मत्तः स्मृतिर्ज्ञानमपोहनं च।', meaning: '"I am seated in everyone\'s heart. From Me come memory, knowledge, and forgetfulness."', reflection: 'Even your forgetting is held within something larger. Nothing is truly lost.' },

  // Chapter 16
  { source: 'Bhagavad Gita 16.1', sanskrit: 'अभयं सत्त्वसंशुद्धिर्ज्ञानयोगव्यवस्थितिः।', meaning: '"Fearlessness, purity of mind, steadfastness in yoga and knowledge — these are the divine qualities of one born for liberation."', reflection: 'Fearlessness is not the absence of fear. It is the decision to move through it.' },
  { source: 'Bhagavad Gita 16.2', sanskrit: 'अहिंसा सत्यमक्रोधस्त्यागः शान्तिरपैशुनम्।', meaning: '"Non-violence, truthfulness, freedom from anger, renunciation, peacefulness — these divine qualities are born within you."', reflection: 'You do not need to be perfect. Simply move toward these, one day at a time.' },
  { source: 'Bhagavad Gita 16.3', sanskrit: 'तेजः क्षमा धृतिः शौचमद्रोहो नातिमानिता।', meaning: '"Vigour, forgiveness, fortitude, purity, freedom from malice, and absence of pride — these are divine qualities."', reflection: 'Forgiveness and fortitude together — that is the complete posture of a free person.' },
  { source: 'Bhagavad Gita 16.21',sanskrit: 'त्रिविधं नरकस्येदं द्वारं नाशनमात्मनः।', meaning: '"There are three gates leading to the hell of self-destruction: lust, anger, and greed. Every sane person must give these up."', reflection: 'Three things to watch for when the day goes dark: wanting too much, reacting too fast, holding too tight.' },

  // Chapter 17
  { source: 'Bhagavad Gita 17.3', sanskrit: 'सत्त्वानुरूपा सर्वस्य श्रद्धा भवति भारत।', meaning: '"The faith of every person, O Arjuna, is in accordance with their nature. A person is made of faith — whatever their faith is, that is what they are."', reflection: 'What you believe shapes what you become. Choose your convictions with care.' },
  { source: 'Bhagavad Gita 17.15',sanskrit: 'अनुद्वेगकरं वाक्यं सत्यं प्रियहितं च यत्।', meaning: '"Words that do not disturb, that are truthful, pleasing, and beneficial — such speech is the austerity of words."', reflection: 'Before speaking — is it true? Is it kind? Is it necessary? Three questions. One practice.' },
  { source: 'Bhagavad Gita 17.16',sanskrit: 'मनःप्रसादः सौम्यत्वं मौनमात्मविनिग्रहः।', meaning: '"Serenity of mind, gentleness, quiet, self-control, and purity of purpose — these together form the austerity of the mind."', reflection: 'Mental discipline is not suppression. It is the gentlest and most powerful practice there is.' },
  { source: 'Bhagavad Gita 17.20',sanskrit: 'दातव्यमिति यद्दानं दीयतेऽनुपकारिणे।', meaning: '"Charity given to a worthy person simply because it is right to give — without expectation of return — is said to be in the mode of goodness."', reflection: 'Give because it is right. Not because it will be remembered.' },

  // Chapter 18
  { source: 'Bhagavad Gita 18.5', sanskrit: 'यज्ञदानतपःकर्म न त्याज्यं कार्यमेव तत्।', meaning: '"Acts of sacrifice, charity, and austerity should not be abandoned. They must be performed — they purify even the wise."', reflection: 'Even the most advanced must continue their practice. Discipline never becomes unnecessary.' },
  { source: 'Bhagavad Gita 18.6', sanskrit: 'एतान्यपि तु कर्माणि सङ्गं त्यक्त्वा फलानि च।', meaning: '"These actions should be performed without attachment and without desire for results. This is My definite and highest opinion."', reflection: 'Do the good work. Do not wait for the world to notice.' },
  { source: 'Bhagavad Gita 18.20',sanskrit: 'सर्वभूतेषु येनैकं भावमव्ययमीक्षते।', meaning: '"That knowledge by which one sees the one indestructible reality in all beings — undivided in the divided — is knowledge in the mode of goodness."', reflection: 'Look past the surface of difference. The same life moves through everything.' },
  { source: 'Bhagavad Gita 18.37',sanskrit: 'यत्तदग्रे विषमिव परिणामेऽमृतोपमम्।', meaning: '"That which at first seems like poison but in the end is like nectar — that happiness arising from self-knowledge is said to be in goodness."', reflection: 'The hardest growth often feels like suffering at first. Trust the process.' },
  { source: 'Bhagavad Gita 18.45',sanskrit: 'स्वे स्वे कर्मण्यभिरतः संसिद्धिं लभते नरः।', meaning: '"By being devoted to one\'s own duty, a person can attain perfection."', reflection: 'Your ordinary life, lived with full attention, is the path. Not someone else\'s life. Yours.' },
  { source: 'Bhagavad Gita 18.47',sanskrit: 'श्रेयान्स्वधर्मो विगुणः परधर्मात्स्वनुष्ठितात्।', meaning: '"It is better to perform one\'s own duty imperfectly than to perform the duty of another perfectly."', reflection: 'Be yourself imperfectly. That is far better than being someone else flawlessly.' },
  { source: 'Bhagavad Gita 18.49',sanskrit: 'असक्तबुद्धिः सर्वत्र जितात्मा विगतस्पृहः।', meaning: '"With an unattached mind in all situations, with the self conquered and desires gone — by renunciation one achieves the supreme perfection of freedom."', reflection: 'Freedom is not what you acquire. It is what you release.' },
  { source: 'Bhagavad Gita 18.55',sanskrit: 'भक्त्या मामभिजानाति यावान्यश्चास्मि तत्त्वतः।', meaning: '"One can understand Me as I am only by devotion. And when one is in full consciousness of Me by such devotion, they can enter My kingdom."', reflection: 'Understanding the Divine is not intellectual. It is felt. It is lived.' },
  { source: 'Bhagavad Gita 18.57',sanskrit: 'चेतसा सर्वकर्माणि मयि संन्यस्य मत्परः।', meaning: '"Surrender all your works to Me mentally, make Me your highest goal, and always keep your consciousness fixed on Me."', reflection: 'At the end of every day — surrender it. All of it. And begin again tomorrow.' },
  { source: 'Bhagavad Gita 18.58',sanskrit: 'मच्चित्तः सर्वदुर्गाणि मत्प्रसादात्तरिष्यसि।', meaning: '"If you become conscious of Me, you will pass over all the obstacles of conditional life by My grace."', reflection: 'You do not have to figure everything out. Some things are crossed by grace, not strategy.' },
  { source: 'Bhagavad Gita 18.63',sanskrit: 'इति ते ज्ञानमाख्यातं गुह्याद्गुह्यतरं मया।', meaning: '"Thus I have explained to you the most confidential of all knowledge. Deliberate on this fully, and then do what you wish."', reflection: 'You have been given what you need. Now the choice is yours. That is always the final teaching.' },
  { source: 'Bhagavad Gita 18.65',sanskrit: 'मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।', meaning: '"Always think of Me, be devoted to Me, worship Me, bow to Me. You shall come to Me. I promise you truly, for you are dear to Me."', reflection: 'You are not forgotten. You are not invisible. You are dear to the source of all things.' },
  { source: 'Bhagavad Gita 18.66',sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।', meaning: '"Abandon all varieties of dharma and simply surrender to Me. I shall free you from all sinful reactions. Do not fear."', reflection: 'True surrender is not weakness. It is the deepest form of trust.' },
  { source: 'Bhagavad Gita 18.68',sanskrit: 'य इमं परमं गुह्यं मद्भक्तेष्वभिधास्यति।', meaning: '"One who shares this supreme secret with My devotees shows the highest devotion to Me — and shall come to Me without doubt."', reflection: 'The teachings you have received are not for keeping. They are for sharing.' },
  { source: 'Bhagavad Gita 18.70',sanskrit: 'अध्येष्यते च य इमं धर्म्यं संवादमावयोः।', meaning: '"And I declare that one who studies this sacred conversation worships Me through knowledge."', reflection: 'Reading this, even once — is a form of worship. You are already on the path.' },
  { source: 'Bhagavad Gita 18.73',sanskrit: 'नष्टो मोहः स्मृतिर्लब्धा त्वत्प्रसादान्मयाच्युत।', meaning: '"My illusion is now gone. By Your grace, I have regained my memory. I am now firm and free from doubt. I shall act according to Your instruction."', reflection: 'There are moments when the fog lifts. When it does — act. Do not wait for the fog to return.' },
  { source: 'Bhagavad Gita 18.78',sanskrit: 'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।', meaning: '"Wherever there is Krishna, the master of yoga, and wherever there is Arjuna, the supreme archer — there will surely be prosperity, victory, and righteousness."', reflection: 'When wisdom and courage meet — something extraordinary becomes possible. Be both.' },
];

const DEFAULT_MANTRAS = ['Radhe','Hare Krishna','Om Namah Shivaya','Ram','Mahadev'];

function getDayVerse(){
  const d=new Date(), n=Math.floor((d-new Date(d.getFullYear(),0,0))/86400000);
  return DHARMA[n%DHARMA.length];
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
// Uses @capacitor/local-notifications so OS-level alarms fire even
// when the app is fully closed. Falls back gracefully on the web
// (prashama.vercel.app) where the plugin returns "unavailable".
//
// Design: two fixed daily notifications — no guilt, no streaks.
// IDs are stable integers so re-scheduling always replaces the
// previous schedule rather than stacking duplicates.
const NOTIF_ID_MORNING = 1001;
const NOTIF_ID_NIGHT   = 1002;

const NIGHT_PROMPTS = [
  'One quiet reflection before rest.',
  'What stayed with you today?',
  'What brought you peace today?',
  'A moment of stillness, before sleep.',
  'What is worth carrying into tomorrow?',
];

const NOTIF_KEY='prashama_notif_v1';

function loadNotifPrefs(){
  try{
    const raw=localStorage.getItem(NOTIF_KEY);
    if(!raw)return{enabled:false,morningHour:8,morningMinute:0,nightHour:22,nightMinute:0};
    const p=JSON.parse(raw);
    return{
      enabled:!!p.enabled,
      morningHour:typeof p.morningHour==='number'?p.morningHour:8,
      morningMinute:typeof p.morningMinute==='number'?p.morningMinute:0,
      nightHour:typeof p.nightHour==='number'?p.nightHour:22,
      nightMinute:typeof p.nightMinute==='number'?p.nightMinute:0,
    };
  }catch{return{enabled:false,morningHour:8,morningMinute:0,nightHour:22,nightMinute:0};}
}
function saveNotifPrefs(p){try{localStorage.setItem(NOTIF_KEY,JSON.stringify(p));}catch{}}

// Get Capacitor plugins registered by entry.js.
// Returns null on the web where plugins are unavailable.
function getLocalNotif(){
  try{ return window._PrashamaPlugins&&window._PrashamaPlugins.LocalNotifications||null; }
  catch{ return null; }
}
function getShare(){
  try{ return window._PrashamaPlugins&&window._PrashamaPlugins.Share||null; }
  catch{ return null; }
}

// Schedule both daily notifications using Capacitor's alarm system.
// on: 'day' repeats the alarm at the same time every day and survives
// app restarts, backgrounding, and device reboots (on Android).
async function scheduleNotifications(prefs){
  const ln=getLocalNotif();
  if(!ln)return;   // web fallback — do nothing silently
  const verse=getDayVerse();
  const morning=new Date();
  morning.setHours(prefs.morningHour,prefs.morningMinute,0,0);
  if(morning<=new Date()) morning.setDate(morning.getDate()+1); // if already past today, start tomorrow
  const night=new Date();
  night.setHours(prefs.nightHour,prefs.nightMinute,0,0);
  if(night<=new Date()) night.setDate(night.getDate()+1);
  try{
    await ln.cancel({notifications:[{id:NOTIF_ID_MORNING},{id:NOTIF_ID_NIGHT}]});
    await ln.schedule({notifications:[
      {id:NOTIF_ID_MORNING, title:'Prashama', body:verse.sanskrit,
       schedule:{at:morning, every:'day', allowWhileIdle:true},
       smallIcon:'ic_stat_icon_config_sample', iconColor:'#D2B07A'},
      {id:NOTIF_ID_NIGHT,   title:'Prashama', body:'One quiet reflection before rest.',
       schedule:{at:night,   every:'day', allowWhileIdle:true},
       smallIcon:'ic_stat_icon_config_sample', iconColor:'#D2B07A'},
    ]});
  }catch(e){ console.warn('scheduleNotifications failed:',e); }
}

// Cancel both notifications (called when user turns off Gentle Reminders).
async function cancelNotifications(){
  const ln=getLocalNotif();
  if(!ln)return;
  try{ await ln.cancel({notifications:[{id:NOTIF_ID_MORNING},{id:NOTIF_ID_NIGHT}]}); }
  catch{}
}

// Request Android notification permission via Capacitor plugin.
// On web, falls back to the browser Notification API permission.
async function requestNotificationPermission(){
  const ln=getLocalNotif();
  if(ln){
    try{
      const {display}=await ln.requestPermissions();
      return display==='granted'?'granted':'denied';
    }catch{ return 'denied'; }
  }
  // web fallback
  if(typeof Notification==='undefined')return'unsupported';
  if(Notification.permission==='granted')return'granted';
  if(Notification.permission==='denied')return'denied';
  try{ return await Notification.requestPermission(); }
  catch{ return'denied'; }
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
.pg{padding:calc(20px + env(safe-area-inset-top, 0px)) 16px calc(90px + env(safe-area-inset-bottom, 0px));animation:fu .32s cubic-bezier(.4,0,.2,1);}
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
.nav-wrap{position:fixed;bottom:calc(20px + env(safe-area-inset-bottom, 0px));left:50%;transform:translateX(-50%);width:calc(100% - 28px);max-width:492px;z-index:100;}
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
function SvgBell(){return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.35',strokeLinecap:'round',strokeLinejoin:'round',width:'14',height:'14'},h('path',{d:'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9'}),h('path',{d:'M13.73 21a2 2 0 0 1-3.46 0'}));}

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
  const [notifEnabled,setNotifEnabled]=useState(()=>loadNotifPrefs().enabled);
  const [notifMsg,setNotifMsg]=useState('');

  function add(){
    const v=val.trim();
    if(!v)return;
    dispatch({type:'ADD_MANTRA',v});
    setVal(''); setAdding(false);
  }

  async function toggleNotif(){
    if(notifEnabled){
      const prefs=loadNotifPrefs();
      prefs.enabled=false;
      saveNotifPrefs(prefs);
      await cancelNotifications();
      setNotifEnabled(false);
      setNotifMsg('');
      return;
    }
    const result=await requestNotificationPermission();
    if(result==='granted'){
      const prefs=loadNotifPrefs();
      prefs.enabled=true;
      saveNotifPrefs(prefs);
      await scheduleNotifications(prefs);
      setNotifEnabled(true);
      setNotifMsg('Morning Gita verse at 8 AM. Evening reflection at 10 PM.');
    }else if(result==='denied'){
      setNotifMsg('Enable notifications in Android Settings › Apps › Prashama.');
    }else{
      setNotifMsg('Notifications are not available in this browser.');
    }
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
        h('div',{className:'trow'},h('div',{className:'trow-l'},h(SvgMoon),' Dark mode'),h(Tog,{on:state.dark,set:()=>dispatch({type:'TOGGLE_DARK'})})),
        h('div',{className:'trow'},h('div',{className:'trow-l'},h(SvgBell),' Gentle reminders'),h(Tog,{on:notifEnabled,set:toggleNotif}))
      ),
      notifMsg&&h('p',{style:{fontSize:11,color:'#9c9080',marginTop:10,lineHeight:1.6,fontStyle:'italic'}},notifMsg),
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

  // ── ADAPTIVE MANTRA SIZING ────────────────────────────────────
  // Scales font-size down as character count grows, and estimates how many
  // lines the mantra will wrap to, so vertical centering stays balanced.
  // Tuned for Devanagari + Latin transliteration; comfortably clears the
  // inner ring (R=140) with consistent padding regardless of length.
  function mantraStyle(text){
    const t=(text||'Radhe').trim();
    const len=t.length;
    let fontSize, lineHeight, maxWidth;
    if(len<=8){           // short — e.g. राधे, Radhe, ॐ
      fontSize=36; lineHeight=1.15; maxWidth=180;
    }else if(len<=16){    // medium — e.g. ॐ नमः शिवाय
      fontSize=27; lineHeight=1.25; maxWidth=190;
    }else if(len<=28){    // long — short phrase, wraps to ~2 lines
      fontSize=21; lineHeight=1.32; maxWidth=200;
    }else{                // very long — full Sanskrit verse line, wraps to ~3 lines
      fontSize=16; lineHeight=1.4; maxWidth=210;
    }
    return{fontSize,lineHeight,maxWidth,len};
  }

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
              (()=>{const ms=mantraStyle(mantra);
                return h('div',{style:{
                  fontFamily:'Fraunces,serif',
                  fontSize:ms.fontSize,
                  fontWeight:400,
                  letterSpacing:'.01em',
                  color:dark?'#f3eee7':'#3a3128',
                  fontVariationSettings:`'opsz' ${Math.round(ms.fontSize*1.15)},'SOFT' 35`,
                  lineHeight:ms.lineHeight,
                  maxWidth:ms.maxWidth,
                  textAlign:'center',
                  overflowWrap:'break-word',
                  wordBreak:'keep-all',
                  hyphens:'none',
                  padding:'0 4px'
                }},mantra||'Radhe');
              })(),
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

  async function share(){
    const t=`${v.meaning}\n\n— ${v.source}\n\nPrashama \uD83D\uDE4F`;
    // Try Capacitor Share first (works on Android even from WebView)
    const capShare=getShare();
    if(capShare){
      try{ await capShare.share({title:"Today's Dharma",text:t}); return; }
      catch{}
    }
    // Web Share API fallback
    if(navigator.share){
      try{ await navigator.share({title:"Today's Dharma",text:t}); return; }
      catch{}
    }
    // Final fallback: clipboard copy
    try{
      await navigator.clipboard.writeText(t);
      haptic('select');
    }catch{}
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
        h('button',{className:'dlisten',onClick:()=>{if(typeof window==='undefined'||!window.speechSynthesis)return;window.speechSynthesis.cancel();const utt=new SpeechSynthesisUtterance(v.meaning.replace(/[\u201c\u201d\u0022]/g,''));utt.rate=0.88;utt.pitch=1;utt.lang='en-IN';const voices=window.speechSynthesis.getVoices();const pref=voices.find(vv=>vv.lang==='en-IN')||voices.find(vv=>vv.lang.startsWith('en'))||voices[0];if(pref)utt.voice=pref;window.speechSynthesis.speak(utt);}},h(SvgPlay),' Listen'),
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

  // Register service worker (for PWA install / web push fallback).
  // Notification scheduling is now handled by Capacitor LocalNotifications
  // (OS-level alarms) — no foreground check needed.
  useEffect(()=>{
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('sw.js').catch(()=>{});
    }
  },[]);

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

