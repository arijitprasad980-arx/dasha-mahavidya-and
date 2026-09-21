const DESKTOP_PAGES = [
  { src: "COVER PAGE 2.png", title: "", bn: "", cover: true },
  { src: "KALI.png", title: "Kali", bn: "কালী" },
  { src: "TARA.png", title: "Tara", bn: "তারা" },
  { src: "TRIPURA SUNDARI.png", title: "Tripura Sundari", bn: "ত্রিপুরা সুন্দরী" },
  { src: "BHUVANESWARI.png", title: "Bhuvaneswari", bn: "ভুবনেশ্বরী" },
  { src: "BHAIRAVI.png", title: "Bhairavi", bn: "ভৈরবী" },
  { src: "CHINNAMASTA.png", title: "Chinnamasta", bn: "ছিন্নমস্তা" },
  { src: "DHUMAVATI.png", title: "Dhumavati", bn: "ধূমাবতী" },
  { src: "BAGALAMUKHI.png", title: "Bagalamukhi", bn: "বগলামুখী" },
  { src: "MATANGI.png", title: "Matangi", bn: "মাতঙ্গী" },
  { src: "KAMALA.png", title: "Kamala", bn: "কমলা" },
];

const MOBILE_PAGES = [
  { src: "AND COVER 2.png", title: "", bn: "", cover: true },
  { src: "AND KALI.png", title: "Kali", bn: "কালী" },
  { src: "AND TARA.png", title: "Tara", bn: "তারা" },
  { src: "AND TRIPURA SUNDARI.png", title: "Tripura Sundari", bn: "ত্রিপুরা সুন্দরী" },
  { src: "AND BHUVANESWARI.png", title: "Bhuvaneswari", bn: "ভুবনেশ্বরী" },
  { src: "AND BHAIRAVI1.png", title: "Bhairavi", bn: "ভৈরবী" },
  { src: "AND CHINNAMASTA.png", title: "Chinnamasta", bn: "ছিন্নমস্তা" },
  { src: "AND DHUMAVATI.png", title: "Dhumavati", bn: "ধূমাবতী" },
  { src: "AND BAGALAMUKHI.png", title: "Bagalamukhi", bn: "বগলামুখী" },
  { src: "AND MATANGI.png", title: "Matangi", bn: "মাতঙ্গী" },
  { src: "AND KAMALA.png", title: "Kamala", bn: "কমলা" },
];

const PAGES = window.matchMedia("(max-width: 700px)").matches ? MOBILE_PAGES : DESKTOP_PAGES;

const book = document.getElementById("book");
const folio = document.getElementById("folio");
const hint = document.getElementById("hint");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pageCloseSound = new Audio("book close sound.mp3.mpeg");
pageCloseSound.preload = "auto";
pageCloseSound.muted = false;
let pageFlipSound = new Audio("page flip.wav");
pageFlipSound.preload = "auto";
pageFlipSound.volume = 0.9;
pageFlipSound.muted = false;
const ambientAudio = new Audio("uludhoni.mp3");
ambientAudio.preload = "auto";
ambientAudio.loop = true;
ambientAudio.volume = 0.35;
ambientAudio.muted = false;

let ambientFadeFrame = null;
let ambientMusicStarted = false;
let ambientDelayTimer = null;
let flipAudioContext = null;
let ambientAudioContext = null;
let ambientSynthTimer = null;
let ambientOscillators = [];
let pageFlipAudioUnlocked = false;

function unlockPageFlipAudio() {
  if (pageFlipAudioUnlocked) return;
  pageFlipAudioUnlocked = true;
  pageFlipSound.muted = false;
  pageFlipSound.volume = 0.9;
  pageFlipSound.load();
  pageFlipSound.currentTime = 0;
  pageFlipSound.play().catch(() => {});
}

function ensureAmbientContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!ambientAudioContext) {
    ambientAudioContext = new AudioContextClass();
  }
  if (ambientAudioContext.state === "suspended") {
    ambientAudioContext.resume().catch(() => {});
  }
  return ambientAudioContext;
}

function stopAmbientSynth() {
  if (ambientSynthTimer) {
    clearInterval(ambientSynthTimer);
    ambientSynthTimer = null;
  }

  ambientOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch (error) {
      // ignore already-stopped oscillators
    }
  });
  ambientOscillators = [];
}

function startAmbientSynth() {
  const context = ensureAmbientContext();
  if (!context) return;

  stopAmbientSynth();

  const notes = [174.61, 220, 261.63, 293.66, 349.23];
  let noteIndex = 0;

  const playNote = () => {
    const activeContext = ensureAmbientContext();
    if (!activeContext) return;

    const now = activeContext.currentTime;
    const osc = activeContext.createOscillator();
    const gain = activeContext.createGain();
    const frequency = notes[noteIndex % notes.length];

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(activeContext.destination);
    osc.start(now);
    osc.stop(now + 1.25);
    ambientOscillators.push(osc);

    noteIndex += 1;
  };

  playNote();
  ambientSynthTimer = window.setInterval(playNote, 950);
}

function playPageFlipSound() {
  try {
    const flipAudio = new Audio("page flip.wav");
    flipAudio.preload = "auto";
    flipAudio.volume = 0.9;
    flipAudio.muted = false;
    flipAudio.currentTime = 0;
    pageFlipSound = flipAudio;
    flipAudio.play().catch(() => {});
  } catch (error) {
    // Ignore browser issues; use the original page-flip audio file.
  }
}

function startAmbientMusic() {
  if (ambientMusicStarted) return;

  ambientMusicStarted = true;
  ambientAudio.pause();
  ambientAudio.currentTime = 0;
  ambientAudio.volume = 0.35;
  ambientAudio.muted = false;
  ambientAudio.play().catch(() => {});
  stopAmbientSynth();
  updateAudioToggleButton();
}

function stopAmbientMusic() {
  if (ambientDelayTimer) {
    clearTimeout(ambientDelayTimer);
    ambientDelayTimer = null;
  }

  if (ambientFadeFrame) {
    cancelAnimationFrame(ambientFadeFrame);
    ambientFadeFrame = null;
  }

  stopAmbientSynth();
  ambientAudio.pause();
  ambientAudio.currentTime = 0;
  ambientAudio.volume = 0;
  ambientMusicStarted = false;
  updateAudioToggleButton();
}

function hideHomeAudioIcon() {
  if (!audioToggleBtn) return;
  audioToggleBtn.classList.remove("visible");
  audioToggleBtn.hidden = true;
}

function updateAudioToggleButton() {
  if (!audioToggleBtn) return;
  const isHome = index === 0;
  const isPlaying = ambientMusicStarted;
  const icon = audioToggleBtn.querySelector("img");

  if (!isHome) {
    audioToggleBtn.classList.remove("visible");
    audioToggleBtn.hidden = true;
    audioToggleBtn.style.opacity = "";
    audioToggleBtn.style.visibility = "";
    audioToggleBtn.style.pointerEvents = "";
    return;
  }

  if (icon) {
    icon.src = isPlaying ? "volplay.png" : "volmute.png";
    icon.alt = isPlaying ? "Music on" : "Music off";
  }
  audioToggleBtn.setAttribute("aria-label", isPlaying ? "Mute music" : "Play music");
  audioToggleBtn.title = isPlaying ? "Mute music" : "Play music";
  audioToggleBtn.classList.toggle("visible", true);
  audioToggleBtn.hidden = false;
  audioToggleBtn.style.opacity = "";
  audioToggleBtn.style.visibility = "";
  audioToggleBtn.style.pointerEvents = "";
}

function maybeStartHomeAmbientMusic() {
  if (index !== 0 || ambientMusicStarted) return;

  clearTimeout(ambientDelayTimer);
  ambientDelayTimer = window.setTimeout(() => {
    if (index === 0 && !ambientMusicStarted) {
      startAmbientMusic();
    }
  }, 1000);
}

const GODDESS_DISCLAIMER = "Disclaimer: The information provided here is for educational and cultural purposes only; interpretations and traditions may vary, and the actual beliefs or accounts may differ.";
const GODDESS_BENGALI_DISCLAIMER = "দাবিত্যাগ: এখানে দেওয়া তথ্য শুধুমাত্র শিক্ষামূলক ও সাংস্কৃতিক উদ্দেশ্যে; বিভিন্ন মত ও পরম্পরায় এর ব্যাখ্যা ভিন্ন হতে পারে এবং প্রকৃত বিবরণও ভিন্ন হতে পারে।";

const KALI_ENGLISH_DESCRIPTION = `First of all, Sati took the form of Kali. Her form was fearful, her hair untied and loose, her body the color of a dark cloud. She had deep-set eyes and eyebrows shaped like curved swords. She stood on a corpse, wore a garland of skulls, and earrings made from the bones of corpses. She had four hands – on one hand she had the head of a skull and the other a curved sword with blood dripping on it. She had mudras on her other two hands – one giving freedom from fear and the other giving blessings. She roared and the ten directions were filled with that ferocious sound. The exploits of this Goddess Kali are outlined in the Chandi Path. She is the Goddess that killed Chanda and Munda and also drank the blood of Raktabija. She is known as Kaushiki, who came from within, and is the Slayer of Shumbha and Nishumbha. Kali is the first of the Das Mahavidyas. She is beyond time. She takes away the darkness and fills us with the light of Wisdom, which is why She is the embodiment of Jnana Shakti. She resides in the cremation grounds, where all creation dissolves.`;

const KALI_BENGALI_DESCRIPTION = `সর্বপ্রথম, সতী কালীর রূপ ধারণ করেছিলেন। তাঁর রূপ ছিল ভয়ঙ্কর, তাঁর চুল ছিল খোলা ও এলোমেলো, আর তাঁর শরীরের বর্ণ ছিল কালো মেঘের মতো। তাঁর চোখ ছিল প্রচণ্ড গভীর এবং তাঁর ভ্রু ছিল বাঁকানো তরবারির মতো আকৃতির। তিনি একটি মৃতদেহের উপর দাঁড়িয়ে ছিলেন, গলায় পরেছিলেন করোটির মালা এবং কানে ছিল মৃতদেহের হাড় দিয়ে তৈরি কুণ্ডল।

তাঁর চারটি হাত ছিল—এক হাতে তিনি একটি করোটি ধারণ করেছিলেন এবং অন্য হাতে ছিল একটি বাঁকা তরবারি, যেখান থেকে রক্ত ঝরছিল। তাঁর অন্য দুটি হাতে ছিল মুদ্রা—একটি ভয় থেকে মুক্তি দেওয়ার এবং অন্যটি আশীর্বাদ দেওয়ার। তিনি গর্জন করেছিলেন এবং তাঁর সেই ভয়ঙ্কর গর্জনের শব্দে দশ দিক পরিপূর্ণ হয়ে উঠেছিল।

এই দেবী কালীর বীরত্বপূর্ণ কাহিনি চণ্ডীপাঠে বর্ণিত রয়েছে। তিনিই সেই দেবী যিনি চণ্ড ও মুণ্ডকে বধ করেছিলেন এবং রক্তবীজের রক্ত পান করেছিলেন। তিনি কৌশিকী নামে পরিচিত, যিনি অন্তর থেকে আবির্ভূত হয়েছিলেন, এবং তিনিই শুম্ভ ও নিশুম্ভের সংহারিণী।

কালী হলেন দশ মহাবিদ্যার প্রথমা। তিনি কালের অতীত। তিনি অন্ধকার দূর করে আমাদের জ্ঞানের আলোয় পূর্ণ করেন। এই কারণেই তিনি জ্ঞানশক্তির মূর্ত প্রতীক। তিনি শ্মশানে অবস্থান করেন, যেখানে সমস্ত সৃষ্টি বিলীন হয়ে যায়।`;

const TARA_ENGLISH_DESCRIPTION = `When Lord Shiva bade Sati not to attend Her Father’s yajna, Sati became furious and assumed the fearful form of Kali causing Shiva to flee in another direction. Sati then assumed the form of the ninth Mahavidya, Tara. Tara is blue, Her tongue is fearfully sticking out, and Her face is terrifying. Her hair is tangled like snakes sticking straight up and She is dressed in a tiger’s skin. On Her head are five half-moons. She has three eyes, four arms, a large protruding belly, and stands on a corpse. She has four arms in which She holds a lotus, a sword, a drinking bowl, and a bell. Tara is the illuminator, She illuminates all our attitudes.`;

const TARA_BENGALI_DESCRIPTION = `যখন ভগবান শিব সতীকে তাঁর পিতার যজ্ঞে যেতে নিষেধ করেছিলেন, তখন সতী ক্রুদ্ধ হয়ে কালীর ভয়ঙ্কর রূপ ধারণ করেন। এতে শিব ভয়ে অন্যদিকে চলে যেতে বাধ্য হন।

এরপর সতী নবম মহাবিদ্যা **তারার** রূপ ধারণ করেন। তারা নীলবর্ণা। তাঁর জিহ্বা ভয়ঙ্করভাবে বাইরে বেরিয়ে রয়েছে এবং তাঁর মুখমণ্ডল অত্যন্ত ভীতিপ্রদ। তাঁর চুল সাপের মতো জট পাকানো এবং সোজা উপরের দিকে উঠে আছে। তিনি বাঘের চামড়া পরিহিতা। তাঁর মাথায় রয়েছে পাঁচটি অর্ধচন্দ্র। তাঁর তিনটি চোখ, চারটি হাত এবং একটি বড়, স্ফীত উদর রয়েছে। তিনি একটি মৃতদেহের উপর দাঁড়িয়ে থাকেন।

তাঁর চারটি হাতে তিনি ধারণ করে আছেন **পদ্ম, তরবারি, পান পাত্র এবং ঘণ্টা**। তারা হলেন **আলোকপ্রদায়িনী**—তিনি আমাদের সমস্ত চিন্তা, দৃষ্টিভঙ্গি ও মানসিক প্রবণতাকে আলোকিত করেন।`;

const TRIPURA_ENGLISH_DESCRIPTION = `Tripura Sundari, also known as Lalita, Shodashi, Kamakshi, and Rajarajeshvari, is one of the Ten Mahavidyas and the principal goddess of the Sri Vidya tradition. Her name means “the Beautiful One of the Three Worlds,” and she represents supreme beauty, divine consciousness, knowledge, compassion, bliss, and the creative power of Shakti. According to the Lalitopakhyana tradition, she manifested from the sacred fire of consciousness to defeat the powerful demon Bhandasura, who had become a threat to the cosmic order. Leading her divine army, she fought Bhandasura and ultimately destroyed him, restoring balance to the universe. She is closely associated with the Sri Chakra and is worshipped as the supreme embodiment of Shakti, with her four hands traditionally holding a sugarcane bow, five flower arrows, a noose, and a goad, symbolizing the mind, the senses, attraction, and control. Her worship is central to Sri Vidya, where she represents the union of beauty, wisdom, power, love, and spiritual realization.`;

const TRIPURA_BENGALI_DESCRIPTION = `ত্রিপুরাসুন্দরী , যিনি ললিতা, ষোড়শী, কামাক্ষী ও রাজরাজেশ্বরী নামেও পরিচিত, তিনি দশ মহাবিদ্যার তৃতীয় মহাবিদ্যা এবং শ্রীবিদ্যা সাধনা-পরম্পরার প্রধান আরাধ্যা দেবী। তাঁর নামের অর্থ “তিন জগতের সুন্দরী” এবং তিনি পরম সৌন্দর্য, দিব্য চেতনা, জ্ঞান, করুণা, আনন্দ ও আদিশক্তির সৃষ্টিশক্তির প্রতীক। ললিতোপাখ্যানের কাহিনি অনুসারে, শক্তিশালী অসুর ভণ্ডাসুরের অত্যাচারে যখন জগতের ভারসাম্য বিপন্ন হয়ে পড়ে, তখন দেবতাদের প্রার্থনায় দেবী চিদগ্নিকুণ্ডের পবিত্র অগ্নি থেকে আবির্ভূত হন এবং তাঁর দিব্য শক্তিসেনার নেতৃত্ব দিয়ে ভণ্ডাসুরের বিরুদ্ধে যুদ্ধ করেন ও শেষ পর্যন্ত তাকে বধ করে বিশ্বে পুনরায় সাম্য প্রতিষ্ঠা করেন। তিনি শ্রীচক্রের সঙ্গে গভীরভাবে সম্পর্কিত এবং পরমশক্তির মূর্ত প্রকাশ হিসেবে পূজিতা; তাঁর চার হাতে সাধারণত ইক্ষুদণ্ডের ধনুক, পাঁচটি পুষ্পবাণ, পাশ ও অঙ্কুশ থাকে, যা মন, ইন্দ্রিয়, আকর্ষণ ও নিয়ন্ত্রণের প্রতীক। শ্রীবিদ্যা সাধনায় তাঁর উপাসনা অত্যন্ত গুরুত্বপূর্ণ এবং তিনি সৌন্দর্য, জ্ঞান, শক্তি, প্রেম ও আধ্যাত্মিক উপলব্ধির এক পরম সমন্বিত রূপ হিসেবে আরাধিতা।`;

const BHUVANESWARI_ENGLISH_DESCRIPTION = `Bhuvanesvari is the fourth Mahavidya. Bhuvan means the Universe, and Iswari means the Ruler, and therefore She is the Ruler of the Universe. She is also known as Rajarajeswari and protects the Universe. Here is the story of her manifestation from the “Pranatoshini Grantha”. Brahma had the desire to create the Universe, and he did intense Tapasya to invite the energy of Creation, Kriya Shakti. Parameswari, pleased with his tapasya responded to his invitation and came as Bhu Devi or Bhuvanesvari. She is red in color, seated on a lotus flower. Her body is resplendent and shining with jewels. She holds a noose (paasham) and a curved sword (ankusham) in two of her hands and the other two assume the mudras of blessing and freedom from fear. She resides in Shiva’s heart. Bhuvanesvari is the Supreme Empress of Manifested Existence, the exposer of consciousness.`;

const BHUVANESWARI_BENGALI_DESCRIPTION = `ভুবনেশ্বরী হলেন চতুর্থ মহাবিদ্যা। ‘ভুবন’ অর্থ বিশ্বব্রহ্মাণ্ড এবং ‘ঈশ্বরী’ অর্থ শাসনকর্ত্রী; তাই ভুবনেশ্বরী হলেন সমগ্র বিশ্বব্রহ্মাণ্ডের অধিষ্ঠাত্রী ও শাসনকর্ত্রী। তিনি রাজরাজেশ্বরী নামেও পরিচিত এবং সমগ্র বিশ্বব্রহ্মাণ্ডকে রক্ষা করেন।

“প্রণতোষিণী গ্রন্থ”-এ তাঁর আবির্ভাবের কাহিনি বর্ণিত হয়েছে। ব্রহ্মার মনে বিশ্বব্রহ্মাণ্ড সৃষ্টি করার ইচ্ছা জাগলে সৃষ্টির শক্তি, অর্থাৎ ক্রিয়াশক্তিকে আহ্বান করার জন্য তিনি গভীর তপস্যা করেন। পরমেশ্বরী তাঁর তপস্যায় সন্তুষ্ট হয়ে তাঁর আহ্বানে সাড়া দেন এবং ভূদেবী বা ভুবনেশ্বরী রূপে আবির্ভূত হন।

তিনি লালবর্ণা এবং একটি পদ্মফুলের উপর আসীন। তাঁর দেহ দিব্য জ্যোতিতে উদ্ভাসিত এবং অমূল্য রত্নের অলংকারে শোভিত। তাঁর দুই হাতে তিনি পাশ এবং অঙ্কুশ ধারণ করেন, আর অপর দুই হাতে রয়েছে আশীর্বাদ প্রদানকারী ও অভয় প্রদানকারী মুদ্রা। তিনি শিবের হৃদয়ে বিরাজ করেন।

ভুবনেশ্বরী হলেন **প্রকাশিত অস্তিত্বের পরম সম্রাজ্ঞী** এবং চৈতন্যের প্রকাশিকা**—তাঁর মধ্য দিয়েই চেতনা ও সমগ্র প্রকাশিত জগতের স্বরূপ উদ্ভাসিত হয়।`;

const BHAIRAVI_ENGLISH_DESCRIPTION = `Bhairavi is the fifth of the Ten Mahavidyas**, representing the fierce, powerful, and radiant aspect of the Divine Mother. Although her name and appearance are associated with fierceness, Bhairavi is not merely a goddess of destruction; she represents the power that destroys ignorance, fear, weakness, and negative forces, guiding the devotee toward spiritual strength and inner wisdom. She is traditionally depicted with a radiant red or crimson complexion, an intense and powerful expression, and three eyes symbolizing awareness of the past, present, and future. Depending on the tradition, she may hold a rosary, sacred scripture, trident, or other divine weapons, while her hands may also display gestures of blessing and protection. Bhairavi is regarded as the goddess of **tapasya, knowledge, spiritual power, transformation, and purification**. Her worship symbolizes the destruction of inner darkness and the awakening of higher consciousness. She is regarded as the divine power of Shiva and shares an inseparable connection with **Bhairava**. Behind her fierce appearance lies the compassion of the Divine Mother, through which she protects devotees, awakens their inner strength, removes fear, and leads them toward spiritual realization. Thus, Bhairavi represents **purification through transformation, strength through spiritual discipline, and liberation through wisdom.`;

const BHAIRAVI_BENGALI_DESCRIPTION = `ভৈরবী হলেন দশ মহাবিদ্যার পঞ্চম মহাবিদ্যা, যিনি দেবীর এক উগ্র, শক্তিশালী ও তেজোময় রূপের প্রতীক। তাঁর নাম ও রূপ ভয়ংকর শক্তির সঙ্গে যুক্ত হলেও ভৈরবী কেবল ধ্বংসের দেবী নন; তিনি অজ্ঞানতা, ভয়, দুর্বলতা ও নেতিবাচক শক্তিকে বিনাশ করে ভক্তকে আধ্যাত্মিক শক্তি ও আত্মজ্ঞানের পথে পরিচালিত করেন। তাঁকে সাধারণত উজ্জ্বল লাল বা রক্তবর্ণ দেহের দেবী হিসেবে কল্পনা করা হয়। তাঁর মুখমণ্ডলে থাকে তীব্র তেজ ও মহাশক্তির প্রকাশ এবং তাঁর তিনটি চোখ অতীত, বর্তমান ও ভবিষ্যৎ সম্পর্কে সচেতনতার প্রতীক। বিভিন্ন পরম্পরায় তাঁর হাতে জপমালা, পবিত্র গ্রন্থ, ত্রিশূল বা অন্যান্য দিব্য অস্ত্র দেখা যায় এবং তাঁর হাতে অভয় ও বরদানের মুদ্রাও থাকতে পারে। ভৈরবী হলেন তপস্যা, জ্ঞান, আধ্যাত্মিক শক্তি, রূপান্তর ও শুদ্ধির দেবী। তাঁর উপাসনা অন্তরের অন্ধকার ও অজ্ঞতার বিনাশ এবং উচ্চতর চেতনার জাগরণের প্রতীক। তাঁকে শিবের দিব্য শক্তিরূপে মানা হয় এবং ভৈরবের সঙ্গে তাঁর অবিচ্ছেদ্য সম্পর্ক রয়েছে। তাঁর উগ্র রূপের অন্তরালে রয়েছে দিব্য মাতৃসুলভ করুণা—যার মাধ্যমে তিনি ভক্তকে রক্ষা করেন, অন্তরের শক্তি জাগিয়ে তোলেন, ভয় দূর করেন এবং আধ্যাত্মিক উপলব্ধির পথে পরিচালিত করেন। তাই ভৈরবী রূপান্তরের মাধ্যমে শুদ্ধি, আধ্যাত্মিক সাধনার মাধ্যমে শক্তি এবং জ্ঞানের মাধ্যমে মুক্তির পথের প্রতীক।`;

const CHHINNAMASTA_ENGLISH_DESCRIPTION = `Chhinnamasta is the sixth of the Ten Mahavidyas, known as the self-decapitated goddess and a profound symbol of self-sacrifice, transformation, life, death, and the transcendence of the ego. She is traditionally depicted standing upon the divine couple Kama and Rati, symbolizing the power of desire and the energy of creation. Chhinnamasta holds her own severed head in one hand and a sword in the other, while three streams of blood rise from her neck; the central stream flows into her own mouth, while the other two are received by her attendants Dakini and Varnini. This extraordinary imagery represents the continuous cycle of life, nourishment, death, and renewal, as well as the transformation of vital energy into spiritual consciousness. Her severed head represents the transcendence of the ordinary ego and the limitations of the mind, while her sword symbolizes the cutting away of ignorance, attachment, and illusion. Despite her terrifying appearance, Chhinnamasta embodies the profound truth that creation and destruction, pleasure and sacrifice, life and death are interconnected aspects of existence. She is therefore regarded as a powerful manifestation of Shakti, representing courage, spiritual awakening, self-sacrifice, and liberation from worldly attachments.`;

const CHHINNAMASTA_BENGALI_DESCRIPTION = `ছিন্নমস্তা হলেন দশ মহাবিদ্যার ষষ্ঠ মহাবিদ্যা। তাঁকে স্বয়ং নিজের মস্তক ছিন্ন করা দেবী হিসেবে বর্ণনা করা হয় এবং তিনি আত্মত্যাগ, রূপান্তর, জীবন, মৃত্যু ও অহংকার অতিক্রমের এক গভীর প্রতীক। তাঁকে সাধারণত দিব্য দম্পতি কাম ও রতির উপর দণ্ডায়মান অবস্থায় দেখা যায়, যা ইচ্ছা ও সৃষ্টিশক্তির প্রতীক। এক হাতে তিনি নিজের ছিন্ন মস্তক এবং অন্য হাতে একটি খড়্গ ধারণ করেন। তাঁর ছিন্ন গ্রীবা থেকে তিনটি রক্তধারা বেরিয়ে আসে—মধ্যের ধারা তাঁর নিজের মুখে প্রবেশ করে এবং দুই পাশের ধারা তাঁর দুই সঙ্গিনী ডাকিনী ও বর্ণিনী পান করেন। এই বিস্ময়কর রূপ জীবন, পুষ্টি, মৃত্যু ও পুনর্জন্মের অবিচ্ছিন্ন চক্রের প্রতীক এবং জীবনীশক্তিকে আধ্যাত্মিক চেতনায় রূপান্তরের গভীর তত্ত্ব প্রকাশ করে। তাঁর ছিন্ন মস্তক সাধারণ অহংকার ও মনের সীমাবদ্ধতাকে অতিক্রম করার প্রতীক, আর তাঁর খড়্গ অজ্ঞানতা, আসক্তি ও মায়ার বন্ধন ছিন্ন করার শক্তিকে নির্দেশ করে। তাঁর ভয়ঙ্কর রূপের অন্তরালে রয়েছে এক গভীর সত্য—সৃষ্টি ও ধ্বংস, ভোগ ও আত্মত্যাগ, জীবন ও মৃত্যু আসলে অস্তিত্বের পরস্পর সম্পর্কিত দিক। তাই ছিন্নমস্তা শক্তি, সাহস, আত্মজাগরণ, আত্মত্যাগ এবং জাগতিক আসক্তি থেকে মুক্তির এক শক্তিশালী প্রকাশ হিসেবে পূজিতা।`;

const DHUMAVATI_ENGLISH_DESCRIPTION = `Dhumavati is the seventh of the Ten Mahavidyas, known as the goddess of smoke, emptiness, solitude, and the transformative power found beyond worldly desires. Unlike the youthful and beautiful forms of many other goddesses, she is traditionally depicted as an old, widowed woman with a dark or pale complexion, dishevelled hair, and a sorrowful yet powerful appearance. She is often shown riding a crow or seated upon a chariot bearing a crow emblem, symbolizing solitude, detachment, and the ability to see beyond appearances. According to one traditional account, Dhumavati manifested when Sati consumed Shiva and then released smoke from her body, while other traditions describe her emergence from the smoke of cosmic dissolution. Her name comes from dhuma, meaning smoke, and she represents the state that remains when worldly forms and desires have been consumed. She is associated with poverty, hunger, disappointment, loss, old age, and loneliness—not simply as negative experiences, but as realities that can lead the seeker toward detachment and spiritual wisdom. Dhumavati teaches that everything material is temporary and that true knowledge can arise when attachment to worldly pleasures disappears. She is therefore regarded as a powerful manifestation of Shakti who reveals the truth hidden within emptiness, sorrow, impermanence, and renunciation, guiding the devotee toward freedom from illusion and dependence on the external world.`;

const DHUMAVATI_BENGALI_DESCRIPTION = `ধূমাবতী হলেন দশ মহাবিদ্যার সপ্তম মহাবিদ্যা। তিনি ধোঁয়া, শূন্যতা, একাকীত্ব এবং জাগতিক আকাঙ্ক্ষার ঊর্ধ্বে থাকা রূপান্তরকারী শক্তির দেবী হিসেবে পরিচিত। অন্যান্য অনেক দেবীর যৌবনময় ও সুন্দর রূপের বিপরীতে তাঁকে সাধারণত একজন বৃদ্ধা বিধবা দেবীরূপে কল্পনা করা হয়। তাঁর চুল এলোমেলো, মুখমণ্ডলে বিষণ্ণতার ছাপ থাকলেও তাঁর মধ্যে প্রকাশ পায় গভীর শক্তি ও তেজ। তাঁকে প্রায়শই কাকের উপর আরোহিতা অথবা কাকের প্রতীকযুক্ত রথে আসীন অবস্থায় দেখা যায়। কাক এখানে একাকীত্ব, বৈরাগ্য এবং বাহ্যিক রূপের অন্তরালে থাকা সত্যকে উপলব্ধি করার প্রতীক। একটি প্রচলিত কাহিনি অনুসারে, সতী শিবকে গ্রাস করার পর তাঁর দেহ থেকে ধোঁয়া নির্গত হলে ধূমাবতীর আবির্ভাব ঘটে; আবার অন্য কিছু পরম্পরায় তাঁকে মহাপ্রলয়ের ধোঁয়া থেকে আবির্ভূতা বলা হয়। ‘ধূম’ শব্দের অর্থ ধোঁয়া, তাই ধূমাবতী সেই অবস্থার প্রতীক, যেখানে জাগতিক রূপ ও আকাঙ্ক্ষা বিলীন হয়ে যাওয়ার পর অবশিষ্ট থাকে শূন্যতা। দারিদ্র্য, ক্ষুধা, দুঃখ, হতাশা, বিচ্ছেদ, বার্ধক্য ও একাকীত্বের মতো জীবনের কঠিন বাস্তবতার সঙ্গে তাঁর সম্পর্ক রয়েছে—তবে এগুলিকে শুধুমাত্র নেতিবাচক বিষয় হিসেবে নয়, বরং বৈরাগ্য ও আধ্যাত্মিক জ্ঞানের পথে নিয়ে যাওয়া অভিজ্ঞতা হিসেবেও দেখা হয়। ধূমাবতী শিক্ষা দেন যে জাগতিক সবকিছুই ক্ষণস্থায়ী এবং বাহ্যিক সুখের প্রতি আসক্তি কমে গেলে গভীর সত্য ও আত্মজ্ঞান উপলব্ধি করা সম্ভব। তাই তিনি শূন্যতা, দুঃখ, অনিত্যতা ও ত্যাগের অন্তর্নিহিত সত্যকে প্রকাশকারী এক শক্তিশালী মহাশক্তি, যিনি ভক্তকে মায়া ও জাগতিক নির্ভরতার বন্ধন অতিক্রম করে মুক্তির পথে পরিচালিত করেন।`;

const BAGALAMUKHI_ENGLISH_DESCRIPTION = `Bagalamukhi is the eighth of the Ten Mahavidyas, revered as the goddess of powerful stillness, protection, victory, and the ability to restrain hostile forces. She is often depicted wearing brilliant yellow garments and ornaments, which is why she is also known as Pitambara Devi, the yellow-clad goddess. Her complexion is traditionally described as golden or radiant yellow. In her iconic form, Bagalamukhi seizes the tongue of a powerful demon with one hand while raising a club in the other, symbolizing the power to stop harmful speech, destructive actions, and hostile intentions. According to a traditional account, when a great storm threatened to disturb the cosmic order, the gods prayed to the Supreme Goddess, who manifested as Bagalamukhi and brought the destructive forces to a halt. She is particularly associated with the power of stambhana, meaning the ability to arrest, immobilize, or bring opposing forces to stillness. Her worship is therefore connected with protection, overcoming obstacles, controlling harmful influences, and gaining victory over adversarial forces. At a deeper spiritual level, Bagalamukhi represents the stillness of the mind and the ability to restrain uncontrolled speech, thoughts, impulses, and negative tendencies. She teaches that true power does not always come from movement or aggression; sometimes it lies in the ability to become completely still and bring disorder back into balance. Thus, Bagalamukhi is regarded as a powerful manifestation of Shakti who transforms chaos into stillness and grants protection, courage, discipline, and spiritual control.`;

const BAGALAMUKHI_BENGALI_DESCRIPTION = `বগলামুখী হলেন দশ মহাবিদ্যার অষ্টম মহাবিদ্যা। তিনি শক্তিশালী স্থিরতা, সুরক্ষা, বিজয় এবং শত্রুভাবাপন্ন শক্তিকে নিয়ন্ত্রণ করার ক্ষমতার দেবী হিসেবে পূজিতা। তাঁকে সাধারণত উজ্জ্বল হলুদ বস্ত্র ও অলংকারে সজ্জিতা অবস্থায় কল্পনা করা হয়, তাই তিনি পীতাম্বরা দেবী নামেও পরিচিত। তাঁর দেহের বর্ণ সাধারণত সোনালি বা উজ্জ্বল হলুদ হিসেবে বর্ণিত হয়। তাঁর বিখ্যাত রূপে এক হাতে তিনি এক শক্তিশালী অসুরের জিহ্বা ধরে রাখেন এবং অন্য হাতে গদা ধারণ করেন। এই রূপ ক্ষতিকর বাক্য, ধ্বংসাত্মক কাজ এবং শত্রুভাবাপন্ন উদ্দেশ্যকে থামিয়ে দেওয়ার শক্তির প্রতীক। একটি প্রচলিত কাহিনি অনুসারে, একসময় ভয়ংকর ঝড় সমগ্র বিশ্বব্যবস্থাকে বিপর্যস্ত করার আশঙ্কা সৃষ্টি করলে দেবতারা পরম দেবীর কাছে প্রার্থনা করেন। তাঁদের প্রার্থনায় দেবী বগলামুখী রূপে আবির্ভূত হয়ে সেই ধ্বংসাত্মক শক্তিকে স্থির ও নিয়ন্ত্রিত করেন। তাঁর সঙ্গে স্তম্ভনশক্তি-র বিশেষ সম্পর্ক রয়েছে—অর্থাৎ বিরোধী বা ক্ষতিকর শক্তিকে থামিয়ে দেওয়া, স্থির করা বা নিষ্ক্রিয় করার ক্ষমতা। তাই তাঁর উপাসনা সুরক্ষা, বাধা অতিক্রম, ক্ষতিকর প্রভাব নিয়ন্ত্রণ এবং প্রতিকূল শক্তির বিরুদ্ধে বিজয়ের সঙ্গে যুক্ত। গভীর আধ্যাত্মিক অর্থে বগলামুখী হলেন মনের স্থিরতা ও নিয়ন্ত্রণের প্রতীক। তিনি মানুষের অনিয়ন্ত্রিত কথা, চিন্তা, প্রবৃত্তি ও নেতিবাচক প্রবণতাকে সংযত করার শিক্ষা দেন। তাঁর তত্ত্ব আমাদের মনে করিয়ে দেয় যে প্রকৃত শক্তি সবসময় গতি বা আক্রমণের মধ্যে থাকে না; কখনও কখনও সম্পূর্ণ স্থির হয়ে বিশৃঙ্খলাকে নিয়ন্ত্রণ করার মধ্যেই প্রকৃত শক্তি নিহিত। তাই বগলামুখী হলেন এমন এক মহাশক্তির প্রকাশ, যিনি বিশৃঙ্খলাকে স্থিরতায় রূপান্তরিত করেন এবং ভক্তকে সুরক্ষা, সাহস, সংযম ও আধ্যাত্মিক নিয়ন্ত্রণের শক্তি প্রদান করেন।`;

const MATANGI_ENGLISH_DESCRIPTION = `Matangi is the ninth of the Ten Mahavidyas, revered as the goddess of wisdom, knowledge, speech, music, art, and the power of expression. She is closely associated with the mastery of words, learning, creativity, and the ability to communicate divine knowledge. Matangi is traditionally depicted with a dark green or emerald complexion, adorned with beautiful ornaments and seated upon a throne or lotus. She is often shown holding a veena, symbolizing music, harmony, learning, and the refinement of speech and artistic expression. She is sometimes called Raja Matangi and is associated with the power of divine knowledge that exists beyond conventional social boundaries. According to traditional accounts, Matangi emerged as a form of the Divine Mother connected with the leftovers of a sacred offering, representing the transformation of what is considered impure or rejected into something sacred and powerful. Her mythology teaches that divine wisdom cannot always be confined by social conventions or external appearances. Matangi governs Vak Shakti, the power of speech, and is associated with eloquence, poetry, music, learning, artistic talent, and intellectual brilliance. She is particularly revered by those seeking mastery over communication, creativity, education, and the arts. At a deeper spiritual level, Matangi represents the transformation of ordinary speech into sacred expression and ordinary knowledge into higher wisdom. She teaches that when consciousness becomes refined, even what is neglected or considered impure can become a vehicle for divine realization. Thus, Matangi is regarded as a profound manifestation of Shakti who grants knowledge, eloquence, creativity, artistic inspiration, and the power to express the deepest truths of consciousness.`;

const MATANGI_BENGALI_DESCRIPTION = `মাতঙ্গী হলেন দশ মহাবিদ্যার নবম মহাবিদ্যা। তিনি জ্ঞান, বিদ্যা, বাক্‌শক্তি, সংগীত, শিল্প, সৃজনশীলতা এবং প্রকাশের শক্তির দেবী হিসেবে পূজিতা। শব্দ, শিক্ষা, সৃজনশীলতা এবং জ্ঞানকে সুন্দরভাবে প্রকাশ করার ক্ষমতার সঙ্গে তাঁর গভীর সম্পর্ক রয়েছে। মাতঙ্গীকে সাধারণত গাঢ় সবুজ বা পান্নার মতো সবুজ বর্ণের দেবী হিসেবে কল্পনা করা হয়। তিনি সুন্দর অলংকারে সজ্জিতা এবং সিংহাসন বা পদ্মের উপর আসীন। তাঁর হাতে প্রায়শই বীণা দেখা যায়, যা সংগীত, সুর, বিদ্যা, বাক্‌শক্তি এবং শিল্পকলার পরিশীলিত প্রকাশের প্রতীক। তাঁকে কখনও কখনও রাজমাতঙ্গী নামেও অভিহিত করা হয় এবং প্রচলিত সামাজিক ধারণা ও সীমার বাইরে থাকা দিব্য জ্ঞানের শক্তির সঙ্গে তাঁর সম্পর্ক রয়েছে। একটি প্রচলিত তান্ত্রিক কাহিনি অনুসারে, পবিত্র নৈবেদ্যের অবশিষ্ট অংশের সঙ্গে যুক্ত এক বিশেষ রূপে দেবী মাতঙ্গীর আবির্ভাব ঘটে। এর মাধ্যমে বোঝানো হয় যে সমাজ যাকে অপবিত্র বা পরিত্যক্ত বলে মনে করে, দিব্য শক্তির স্পর্শে সেটিও পবিত্র ও শক্তিশালী হয়ে উঠতে পারে। তাঁর তত্ত্ব শিক্ষা দেয় যে সত্যিকারের জ্ঞান কেবল বাহ্যিক নিয়ম বা সামাজিক সীমার মধ্যে আবদ্ধ নয়। মাতঙ্গী বাক্‌শক্তির অধিষ্ঠাত্রী, তাই তিনি বাগ্মিতা, কবিতা, সংগীত, শিক্ষা, শিল্পপ্রতিভা এবং বুদ্ধির দীপ্তির সঙ্গে যুক্ত। যারা জ্ঞান, সুন্দরভাবে কথা বলার ক্ষমতা, সৃজনশীলতা, শিক্ষা ও শিল্পকলায় দক্ষতা অর্জন করতে চান, তাঁদের কাছে তাঁর উপাসনার বিশেষ গুরুত্ব রয়েছে। গভীর আধ্যাত্মিক অর্থে মাতঙ্গী সাধারণ কথাকে পবিত্র প্রকাশে এবং সাধারণ জ্ঞানকে উচ্চতর প্রজ্ঞায় রূপান্তরের প্রতীক। তিনি শিক্ষা দেন যে চেতনা যখন পরিশুদ্ধ হয়, তখন সমাজের অবহেলিত বা অপবিত্র বলে বিবেচিত বিষয়ও দিব্য উপলব্ধির মাধ্যম হয়ে উঠতে পারে। তাই মাতঙ্গী হলেন এমন এক মহাশক্তির প্রকাশ, যিনি জ্ঞান, বাগ্মিতা, সৃজনশীলতা, শিল্পপ্রেরণা এবং চেতনার গভীরতম সত্যকে প্রকাশ করার শক্তি প্রদান করেন।`;

const KAMALA_ENGLISH_DESCRIPTION = `Kamala is the tenth and final of the Ten Mahavidyas, regarded as a radiant manifestation of the Divine Mother and closely associated with Lakshmi, the goddess of prosperity, abundance, beauty, and good fortune. Her name, Kamala, means “lotus”, symbolizing purity, beauty, spiritual awakening, and the ability to remain untouched by the impurities of the world, just as a lotus blooms above muddy waters. She is traditionally depicted with a golden complexion, seated upon a fully blossomed lotus and surrounded by elephants that pour sacred water over her, symbolizing royal dignity, fertility, abundance, and prosperity. Kamala is usually shown with four hands, holding lotus flowers in two hands while the other two display gestures of blessing and generosity. She represents not only material wealth but also spiritual abundance, nourishment, harmony, fertility, happiness, and divine grace. As the tenth Mahavidya, Kamala completes the journey through the ten great forms of Shakti, bringing the seeker toward the realization that the Divine can be experienced not only through renunciation and fierce transformation but also through beauty, prosperity, love, and the harmonious enjoyment of life. She is worshipped for blessings of prosperity, peace, good fortune, abundance, and spiritual well-being. At a deeper level, Kamala teaches that true wealth is not merely possession of material objects but the recognition of divine abundance within existence. Thus, she is regarded as the auspicious and benevolent form of Shakti who brings prosperity, beauty, nourishment, grace, and fullness to life while reminding devotees to use worldly abundance with wisdom and gratitude.`;

const KAMALA_BENGALI_DESCRIPTION = `কমলা হলেন দশ মহাবিদ্যার দশম ও শেষ মহাবিদ্যা। তিনি দেবীর এক উজ্জ্বল ও মঙ্গলময় রূপ এবং সমৃদ্ধি, প্রাচুর্য, সৌন্দর্য ও সৌভাগ্যের দেবী লক্ষ্মীর সঙ্গে তাঁর গভীর সম্পর্ক রয়েছে। ‘কমলা’ শব্দের অর্থ “পদ্ম”। পদ্ম যেমন কাদামাটির মধ্যেও নির্মল ও সুন্দরভাবে প্রস্ফুটিত হয়, তেমনই কমলা পবিত্রতা, সৌন্দর্য, আধ্যাত্মিক জাগরণ এবং জগতের অশুদ্ধতার মধ্যেও নির্মল থাকার প্রতীক। তাঁকে সাধারণত সোনালি বর্ণের দেবী হিসেবে কল্পনা করা হয়, যিনি একটি পূর্ণ প্রস্ফুটিত পদ্মের উপর আসীন এবং চারপাশে হাতি দ্বারা পরিবেষ্টিত। হাতিরা তাঁর উপর পবিত্র জল ঢালছে—এই দৃশ্য রাজকীয় মর্যাদা, উর্বরতা, প্রাচুর্য ও সমৃদ্ধির প্রতীক। কমলার সাধারণ রূপে তাঁর চারটি হাত থাকে; দুই হাতে তিনি পদ্মফুল ধারণ করেন এবং অপর দুই হাতে আশীর্বাদ ও দানের মুদ্রা প্রদর্শন করেন। তিনি কেবল বস্তুগত সম্পদের দেবী নন; তিনি আধ্যাত্মিক প্রাচুর্য, পুষ্টি, শান্তি, সৌন্দর্য, সুখ, উর্বরতা ও দিব্য কৃপাকেও প্রতিনিধিত্ব করেন। দশম মহাবিদ্যা হিসেবে কমলা দশ মহাশক্তির সাধনাময় যাত্রাকে পূর্ণতা দেন এবং শিক্ষা দেন যে দিব্য শক্তিকে শুধু ত্যাগ, কঠোর সাধনা বা উগ্র রূপের মধ্যেই উপলব্ধি করা যায় না; সৌন্দর্য, সমৃদ্ধি, প্রেম এবং জীবনের সুষম আনন্দের মধ্যেও সেই দিব্য শক্তির প্রকাশ রয়েছে। সমৃদ্ধি, শান্তি, সৌভাগ্য, প্রাচুর্য ও কল্যাণের আশীর্বাদের জন্য তাঁর উপাসনা করা হয়। গভীর আধ্যাত্মিক অর্থে কমলা শিক্ষা দেন যে প্রকৃত সম্পদ কেবল জাগতিক সম্পদের অধিকার নয়; বরং সমগ্র অস্তিত্বের মধ্যে নিহিত দিব্য প্রাচুর্যকে উপলব্ধি করা**। তাই কমলা হলেন শক্তির সেই মঙ্গলময় ও করুণাময় রূপ, যিনি জীবনে সমৃদ্ধি, সৌন্দর্য, পুষ্টি, কৃপা ও পূর্ণতা নিয়ে আসেন এবং জাগতিক প্রাচুর্যকে জ্ঞান ও কৃতজ্ঞতার সঙ্গে ব্যবহার করার শিক্ষা দেন।`;

let index = 0;
let busy = false;
let returningHome = false;
const leaves = [];

function stackZ(i, turned) {
  return turned ? i + 1 : PAGES.length - i + 10;
}

function getPageDescription(pageTitle, useBengali) {
  const map = {
    Kali: [KALI_ENGLISH_DESCRIPTION, KALI_BENGALI_DESCRIPTION],
    Tara: [TARA_ENGLISH_DESCRIPTION, TARA_BENGALI_DESCRIPTION],
    "Tripura Sundari": [TRIPURA_ENGLISH_DESCRIPTION, TRIPURA_BENGALI_DESCRIPTION],
    Bhuvaneswari: [BHUVANESWARI_ENGLISH_DESCRIPTION, BHUVANESWARI_BENGALI_DESCRIPTION],
    Bhairavi: [BHAIRAVI_ENGLISH_DESCRIPTION, BHAIRAVI_BENGALI_DESCRIPTION],
    Chinnamasta: [CHHINNAMASTA_ENGLISH_DESCRIPTION, CHHINNAMASTA_BENGALI_DESCRIPTION],
    Dhumavati: [DHUMAVATI_ENGLISH_DESCRIPTION, DHUMAVATI_BENGALI_DESCRIPTION],
    Bagalamukhi: [BAGALAMUKHI_ENGLISH_DESCRIPTION, BAGALAMUKHI_BENGALI_DESCRIPTION],
    Matangi: [MATANGI_ENGLISH_DESCRIPTION, MATANGI_BENGALI_DESCRIPTION],
    Kamala: [KAMALA_ENGLISH_DESCRIPTION, KAMALA_BENGALI_DESCRIPTION]
  };

  const value = map[pageTitle] || [KALI_ENGLISH_DESCRIPTION, KALI_BENGALI_DESCRIPTION];
  return useBengali ? value[1] : value[0];
}

function renderLeaves() {
  PAGES.forEach((page, i) => {
    const leaf = document.createElement("article");
    leaf.className = "leaf";
    leaf.dataset.index = String(i);
    leaf.style.zIndex = String(stackZ(i, false));

    const front = document.createElement("div");
    front.className = "face front";
    front.innerHTML = `<img src="${page.src}" alt="${page.bn || page.title || "Book page"}" />`;
    if (!page.cover && page.bn) {
      const textWrap = document.createElement("div");
      textWrap.className = "goddess-text-wrap";
      const text = document.createElement("p");
      text.className = "goddess-text";
      text.dataset.english = getPageDescription(page.title, false);
      text.dataset.bengali = getPageDescription(page.title, true);
      text.textContent = text.dataset.english;

      textWrap.append(text);
      front.append(textWrap);

      const disclaimer = document.createElement("p");
      disclaimer.className = "goddess-disclaimer";
      disclaimer.innerHTML = `<span class="disclaimer-label">Disclaimer</span>${GODDESS_DISCLAIMER.slice("Disclaimer".length)}`;
      disclaimer.dataset.english = GODDESS_DISCLAIMER;
      disclaimer.dataset.bengali = GODDESS_BENGALI_DISCLAIMER;
      front.append(disclaimer);
    }

    const back = document.createElement("div");
    back.className = "face back";
    const isMobileView = window.matchMedia("(max-width: 700px)").matches;
    back.innerHTML = isMobileView
      ? '<div class="mobile-page-back" aria-hidden="true"></div>'
      : '<img src="COVER PAGE 1.png" alt="" />';

    leaf.append(front, back);
    book.append(leaf);
    leaves.push(leaf);
  });
}

function updateChrome() {
  if (index !== 0 && ambientMusicStarted) {
    stopAmbientMusic();
  }

  if (index !== 0) {
    hideHomeAudioIcon();
  }

  folio.textContent = `${index + 1} / ${PAGES.length}`;
  folio.setAttribute("aria-label", `Page ${index + 1} of ${PAGES.length}`);
  document.body.classList.toggle("cover-ready", index === 0);
  book.classList.toggle("at-start", index === 0);
  book.classList.toggle("at-kali", index === 1);
  book.classList.toggle("at-end", index === PAGES.length - 1);
  hint.textContent = index === 0
    ? "Begin the journey with the right arrow, a page edge, or a swipe."
    : index === PAGES.length - 1
      ? "You have reached the final page. Use the left arrow to revisit the goddesses."
      : `Now viewing ${PAGES[index].title || "the opening"}. Turn the page to continue.`;
  prevBtn.disabled = index === 0 || busy;
  nextBtn.disabled = index === PAGES.length - 1 || busy;

  updateAudioToggleButton();

  if (index === 0) {
    maybeStartHomeAmbientMusic();
  }
}

function finishFlip(leaf, turned) {
  pageFlipSound.pause();
  pageFlipSound.currentTime = 0;
  leaf.classList.remove("flipping-forward", "flipping-back");
  leaf.classList.toggle("turned", turned);
  leaf.style.zIndex = String(stackZ(Number(leaf.dataset.index), turned));
  busy = false;
  updateChrome();
  syncLanguageControls();
  if (returningHome && !turned && index > 0) {
    window.setTimeout(goPrev, 0);
  } else if (returningHome && index === 0) {
    returningHome = false;
    book.classList.remove("fast-home");
    book.classList.remove("near-cover-home");
    pageCloseSound.pause();
    pageCloseSound.currentTime = 0;
    pageCloseSound.loop = false;
  }
  if (!turned && index === PAGES.length - 2) {
    book.classList.add("delay-next-arrow");
    window.setTimeout(() => book.classList.remove("delay-next-arrow"), 300);
  }
}

function goNext() {
  if (busy || index >= PAGES.length - 1) return;
  if (index === 0) {
    hideHomeAudioIcon();
  }
  const leaf = leaves[index];
  busy = true;
  playPageFlipSound();
  updateChrome();
  book.classList.remove("at-start");
  book.classList.toggle("at-kali", index + 1 === 1);
  book.classList.toggle("at-end", index + 1 === PAGES.length - 1);

  if (reduceMotion) {
    index += 1;
    finishFlip(leaf, true);
    return;
  }

  leaf.classList.add("flipping-forward");
  const done = () => {
    leaf.removeEventListener("animationend", done);
    index += 1;
    finishFlip(leaf, true);
  };
  leaf.addEventListener("animationend", done);
}

function goPrev() {
  if (busy || index <= 0) return;
  const leaf = leaves[index - 1];
  const returningFromEnd = index === PAGES.length - 1;
  busy = true;
  if (!returningHome) {
    playPageFlipSound();
  }
  updateChrome();
  if (!returningFromEnd) book.classList.remove("at-end");
  book.classList.toggle("at-kali", index - 1 === 1);
  book.classList.toggle("at-start", index - 1 === 0);
  book.classList.toggle("near-cover-home", returningHome && index === 1);

  if (reduceMotion) {
    index -= 1;
    finishFlip(leaf, false);
    return;
  }

  leaf.classList.add("flipping-back");
  let completed = false;
  const done = () => {
    if (completed) return;
    completed = true;
    leaf.removeEventListener("animationend", done);
    index -= 1;
    finishFlip(leaf, false);
  };
  leaf.addEventListener("animationend", done);
  if (returningHome) window.setTimeout(done, index === 1 ? 350 : 70);
}

function goHome() {
  if (busy || index === 0) return;
  returningHome = true;
  pageCloseSound.currentTime = 0;
  pageCloseSound.loop = true;
  void pageCloseSound.play().catch(() => {});
  book.classList.add("fast-home");
  goPrev();
}

renderLeaves();
updateChrome();
updateAudioToggleButton();

window.setTimeout(() => {
  if (index === 0 && !ambientMusicStarted) {
    startAmbientMusic();
  }
}, 300);

if (audioToggleBtn) {
  audioToggleBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (ambientMusicStarted) {
      stopAmbientMusic();
      updateAudioToggleButton();
      return;
    }

    if (index === 0) {
      startAmbientMusic();
      updateAudioToggleButton();
      return;
    }

    ambientAudio.currentTime = 0;
    ambientAudio.volume = 0.7;
    ambientMusicStarted = true;
    updateAudioToggleButton();
  });
}

const prevHit = document.createElement("button");
prevHit.type = "button";
prevHit.className = "hit prev";
prevHit.setAttribute("aria-label", "Previous page");
prevHit.innerHTML = '<img src="leftnew.png" alt="" />';
prevHit.addEventListener("click", goPrev);

const nextHit = document.createElement("button");
nextHit.type = "button";
nextHit.className = "hit next";
nextHit.setAttribute("aria-label", "Next page");
nextHit.innerHTML = '<img src="rightnew.png" alt="" />';
nextHit.addEventListener("click", goNext);

const homeHit = document.createElement("button");
homeHit.type = "button";
homeHit.className = "home-hit";
homeHit.setAttribute("aria-label", "Return to cover");
homeHit.innerHTML = '<img src="home.png" alt="" />';
homeHit.addEventListener("click", goHome);

const languageHit = document.createElement("button");
languageHit.type = "button";
languageHit.className = "language-hit";
languageHit.setAttribute("aria-label", "Switch language");
languageHit.setAttribute("aria-pressed", "false");
languageHit.innerHTML = '<img src="translate.png" alt="en/বাং" /><span>en/বাং</span>';

function updateLanguageButtonIcon() {
  const isBengali = languageHit.getAttribute("aria-pressed") === "true";
  const image = languageHit.querySelector("img");
  if (image) image.src = isBengali ? "translate 1.png" : "translate.png";
}

function syncGoddessTextLanguage(useBengali) {
  document.querySelectorAll(".goddess-text").forEach((textNode) => {
    const nextText = useBengali ? textNode.dataset.bengali : textNode.dataset.english;
    if (nextText) {
      textNode.textContent = nextText;
    }
  });
}

languageHit.addEventListener("click", () => {
  const switchToBengali = languageHit.getAttribute("aria-pressed") !== "true";
  languageHit.setAttribute("aria-pressed", String(switchToBengali));
  updateLanguageButtonIcon();
  setDisclaimerLanguage(switchToBengali);
  syncGoddessTextLanguage(switchToBengali);
});
const languageImage = languageHit.querySelector("img");
languageImage.addEventListener("error", () => {
  languageImage.hidden = true;
  languageHit.classList.add("text-fallback");
});

function syncLanguageControls() {
  const switchToBengali = languageHit.getAttribute("aria-pressed") === "true";
  updateLanguageButtonIcon();
  setDisclaimerLanguage(switchToBengali);
  syncGoddessTextLanguage(switchToBengali);
}

function setDisclaimerLanguage(useBengali) {
  document.querySelectorAll(".goddess-disclaimer").forEach((disclaimer) => {
    const text = useBengali ? disclaimer.dataset.bengali : disclaimer.dataset.english;
    disclaimer.innerHTML = useBengali
      ? `<span class="disclaimer-label">দাবিত্যাগ</span>${text.slice("দাবিত্যাগ".length)}`
      : `<span class="disclaimer-label">Disclaimer</span>${text.slice("Disclaimer".length)}`;
  });
}

book.append(prevHit, nextHit, homeHit, languageHit);

prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);
window.addEventListener("pointerdown", unlockPageFlipAudio, { once: true });
window.addEventListener("touchstart", unlockPageFlipAudio, { once: true });
window.addEventListener("click", unlockPageFlipAudio, { once: true });

window.addEventListener("keydown", (event) => {
  const isActionKey = event.key === "Enter" || event.key === " ";

  if (isActionKey) {
    event.preventDefault();
    hideHomeAudioIcon();
    stopAmbientMusic();
    if (index === 0) {
      goNext();
    }
    return;
  }
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    goNext();
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goPrev();
  }
});

function fadeOutHomeAudioIcon() {
  if (!audioToggleBtn || index !== 0) return;
  audioToggleBtn.classList.add("visible");
  audioToggleBtn.style.opacity = "1";
  audioToggleBtn.style.visibility = "visible";
  audioToggleBtn.style.pointerEvents = "auto";
  window.setTimeout(() => {
    if (!audioToggleBtn) return;
    audioToggleBtn.style.opacity = "0";
    audioToggleBtn.style.visibility = "hidden";
    audioToggleBtn.style.pointerEvents = "none";
    window.setTimeout(() => {
      if (!audioToggleBtn) return;
      audioToggleBtn.hidden = true;
      audioToggleBtn.classList.remove("visible");
    }, 500);
  }, 0);
}

function unlockCoverAmbientAudio() {
  if (index !== 0) return;
  if (!ambientMusicStarted) {
    const context = ensureAmbientContext();
    if (context) {
      startAmbientMusic();
    }
  }
}

document.body.addEventListener("pointerdown", (event) => {
  if (index !== 0) return;
  if (event.target.closest("button") || event.target.closest("#audioToggleBtn")) {
    return;
  }
  fadeOutHomeAudioIcon();
  unlockCoverAmbientAudio();
}, { passive: true });

document.body.addEventListener("click", (event) => {
  if (event.target.closest("button") || event.target.closest("#audioToggleBtn")) {
    if (event.target.closest("#audioToggleBtn")) {
      return;
    }
    fadeOutHomeAudioIcon();
    return;
  }

  fadeOutHomeAudioIcon();
  unlockCoverAmbientAudio();
  if (index === 0) {
    return;
  }
});

let touchX = null;
book.addEventListener(
  "touchstart",
  (event) => {
    touchX = event.changedTouches[0].clientX;
  },
  { passive: true }
);
book.addEventListener(
  "touchend",
  (event) => {
    if (touchX == null) return;
    const dx = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goNext();
    else goPrev();
  },
  { passive: true }
);

const cursorLayer = document.querySelector(".cursor-layer");
const customCursor = document.querySelector(".custom-cursor");
const finePointer = window.matchMedia("(pointer: fine)").matches;

window.addEventListener("pointerdown", () => {
  const context = ensureAmbientContext();
  if (context && index === 0 && !ambientMusicStarted) {
    startAmbientMusic();
  }
}, { once: true });

if (cursorLayer && customCursor && finePointer) {
  const hotspot = { x: 13, y: 12 };
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let cursorScale = 1.08;
  cursorLayer.classList.add("is-visible");

  function isInteractive(element) {
    return Boolean(
      element.closest(
        "a, button, input, select, textarea, summary, [role='button'], img, .hit, .home-hit, .nav-btn"
      )
    );
  }

  function placeCursor(x, y) {
    pointerX = x;
    pointerY = y;
    customCursor.style.transform = `translate3d(${x - hotspot.x}px, ${y - hotspot.y}px, 0) scale(${cursorScale})`;
  }

  window.addEventListener("pointermove", (event) => {
    placeCursor(event.clientX, event.clientY);
    cursorLayer.classList.add("is-visible");
    cursorScale = isInteractive(event.target) ? 1.2 : 1.08;
    placeCursor(event.clientX, event.clientY);
  });

  window.addEventListener("pointerover", (event) => {
    cursorScale = isInteractive(event.target) ? 1.2 : 1.08;
    placeCursor(pointerX, pointerY);
  });

  window.addEventListener("pointerdown", () => {
    cursorScale = 0.9;
    placeCursor(pointerX, pointerY);
  });

  window.addEventListener("pointerup", () => {
    cursorScale = isInteractive(document.elementFromPoint(pointerX, pointerY)) ? 1.2 : 1.08;
    placeCursor(pointerX, pointerY);
  });

  window.addEventListener("pointerleave", () => {
    cursorLayer.classList.remove("is-visible");
  });

  placeCursor(pointerX, pointerY);
}
