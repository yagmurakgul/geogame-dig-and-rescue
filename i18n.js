"use strict";

// Canonical Turkish strings remain in game logic. Translate DOM text and
// accessibility labels without rebuilding controls or resetting game state.
(() => {
  const dictionary = new Map([
  [
    "Prensesin İzinde — Kayıp Koordinatlar",
    "In Search of the Princess — Lost Coordinates"
  ],
  [
    "BİR COĞRAFYA MASALI",
    "A GEOGRAPHY TALE"
  ],
  [
    "Prensesin İzinde",
    "In Search of the Princess"
  ],
  [
    "Nasıl oynanır? · Süre ve puan",
    "How to play · Time and scoring"
  ],
  [
    "Kazı süresizdir. Yön tarifini izle, notları topla ve geçidi bul.",
    "There is no time limit underground. Follow the directions, collect notes and find the portal."
  ],
  [
    "Harita ilk kez yüklendiğinde 60 saniyen başlar; fotoğrafa dönmek veya sekme değiştirmek süreyi durdurmaz. Normal ülkede tek tahmin, finalde aynı süre içinde üç hak vardır.",
    "Your 60 seconds begin when the map first loads. Returning to the photo or switching tabs does not pause the timer. You get one guess per regular round and three guesses within the same time limit in the final round."
  ],
  [
    "Doğru ülke: 100 + kalan saniye × 2 puan ve bir bomba. Final: 300 + kalan saniye × 2 puan. Normal turda süre biterse kazıya dönersin; finalde süre veya haklar biterse oyun sona erer.",
    "Correct country: 100 + remaining seconds × 2 points and one bomb. Final round: 300 + remaining seconds × 2 points. If time runs out in a regular round, return underground. In the final round, running out of time or guesses ends the game."
  ],
  [
    "Prensesi bulmak için coğrafi ipuçlarını birleştir. Rekorlar yolculuk uzunluğuna göre bu tarayıcıda ayrı saklanır. Videolar süreye dahil değildir.",
    "Combine the geographical clues to find the princess. High scores are stored in this browser separately for each journey length. Videos do not count towards the time limit."
  ],
  [
    "Haritadan düşen not",
    "A note from the map"
  ],
  [
    "Oyun bilgileri",
    "Game information"
  ],
  [
    "Puan:",
    "Score:"
  ],
  [
    "Konum:",
    "Position:"
  ],
  [
    "Yön:",
    "Direction:"
  ],
  [
    "İşaretin:",
    "Marker:"
  ],
  [
    "Doğu",
    "East"
  ],
  [
    "Batı",
    "West"
  ],
  [
    "Kuzey",
    "North"
  ],
  [
    "Güney",
    "South"
  ],
  [
    "Yok",
    "None"
  ],
  [
    "Ses: Açık",
    "Sound: On"
  ],
  [
    "Ses: Kapalı",
    "Sound: Off"
  ],
  [
    "Kazı planı",
    "Excavation grid"
  ],
  [
    "Kazı alanı. Komşu kareye dokunarak kaz veya yürü. Ok tuşları ve Space de kullanılabilir.",
    "Excavation area. Tap an adjacent cell to dig or walk. You can also use the arrow keys and Space."
  ],
  [
    "Bu oyun Canvas destekleyen bir tarayıcı gerektirir.",
    "This game requires a browser with Canvas support."
  ],
  [
    "Geçidi buldun!",
    "You found the portal!"
  ],
  [
    "Geçidin ötesinden gün ışığı geliyor… Yolculuğumuzun sonraki durağı yüzey!",
    "Daylight shines through the portal… Our next stop is the surface!"
  ],
  [
    "Bölümü tekrar oyna",
    "Replay the chapter"
  ],
  [
    "Ekipman seçimi",
    "Equipment selection"
  ],
  [
    "⛏ Kürek · 1",
    "⛏ Shovel · 1"
  ],
  [
    "💣 Bomba · 2 —",
    "💣 Bomb · 2 —"
  ],
  [
    "Kazı kontrolleri",
    "Digging controls"
  ],
  [
    "Kuzeye ilerle veya dön",
    "Move or turn north"
  ],
  [
    "Batıya ilerle veya dön",
    "Move or turn west"
  ],
  [
    "Doğuya ilerle veya dön",
    "Move or turn east"
  ],
  [
    "Güneye ilerle veya dön",
    "Move or turn south"
  ],
  [
    "⛏ Kaz",
    "⛏ Dig"
  ],
  [
    "💣 Yerleştir",
    "💣 Place"
  ],
  [
    "Kazı alanı hazırlanıyor…",
    "Preparing the excavation…"
  ],
  [
    "📖 Prensesin notları ·",
    "📖 The princess's notes ·"
  ],
  [
    "Bu notlar prensesin bulunduğu ülkeyi anlatıyor.",
    "These notes describe the country where the princess is being held."
  ],
  [
    "Henüz bir not bulamadın. Kazmaya devam et!",
    "You have not found a note yet. Keep digging!"
  ],
  [
    "WASD / Oklar",
    "WASD / Arrows"
  ],
  [
    "hareket ve yön",
    "move and turn"
  ],
  [
    "seçili ekipmanı kullan",
    "use selected tool"
  ],
  [
    "Yan kareye dokun",
    "Tap an adjacent cell"
  ],
  [
    "kaz veya yürü",
    "dig or walk"
  ],
  [
    "Uzak kareye dokun",
    "Tap a distant cell"
  ],
  [
    "hedef işaretle",
    "place a target marker"
  ],
  [
    "Yerel kazı planı · Kuzey yukarıdadır · A–L sütun, 1–9 satır adresidir.",
    "Local excavation grid · North is up · A–L identify columns and 1–9 identify rows."
  ],
  [
    "Prensesin bulunduğu ülke Avrupa'da ve Akdeniz'e kıyısı var.",
    "The princess's country is in Europe and has a Mediterranean coastline."
  ],
  [
    "Bu ülkenin ana karadaki şekli bir çizmeyi andırıyor.",
    "The shape of this country's mainland resembles a boot."
  ],
  [
    "Ülkenin kuzeyinde Alpler uzanıyor.",
    "The Alps stretch across the north of this country."
  ],
  [
    "Sicilya ve Sardinya adaları bu ülkeye bağlı.",
    "The islands of Sicily and Sardinia belong to this country."
  ],
  [
    "Bomba seçildi. Yanındaki kareye dokun veya Yerleştir'e bas.",
    "Bomb selected. Tap an adjacent cell or press Place."
  ],
  [
    "Kürek seçildi. Toprağa dokunarak kazabilirsin.",
    "Shovel selected. Tap the soil to dig."
  ],
  [
    "Yerleştirdiğin bombanın patlamasını bekle.",
    "Wait for the bomb you placed to explode."
  ],
  [
    "Bomban yok. Yüzeyde bir ülkeyi doğru tahmin ederek kazanabilirsin.",
    "You have no bombs. Earn one by correctly identifying a country on the surface."
  ],
  [
    "Haritanın dışına bomba yerleştiremezsin.",
    "You cannot place a bomb outside the grid."
  ],
  [
    "Fitil ateşlendi! Bomba birazdan patlayacak…",
    "Fuse lit! The bomb will explode shortly…"
  ],
  [
    "Patlama geçidi ortaya çıkardı! İçine doğru ilerle.",
    "The explosion revealed the portal! Walk into it."
  ],
  [
    "Patlama çevredeki toprağı açtı!",
    "The explosion cleared the surrounding soil!"
  ],
  [
    "Notu oku, hedef kareyi işaretle ve kazmaya başla.",
    "Read the note, mark your target cell and start digging."
  ],
  [
    "Kazı planının sınırındasın.",
    "You are at the edge of the excavation grid."
  ],
  [
    "Önünde toprak var. Toprağa dokun, Kaz düğmesine veya Space’e bas.",
    "There is soil ahead. Tap it, press Dig or press Space."
  ],
  [
    "Yüzeye çıkmadan önce bombanın patlamasını bekle.",
    "Wait for the bomb to explode before going to the surface."
  ],
  [
    "Geçit açıldı! Yüzeye çıkıyoruz…",
    "The portal is open! Heading to the surface…"
  ],
  [
    "Önündeki kare açık. Kareye dokun veya yön düğmesiyle ilerle.",
    "The cell ahead is clear. Tap it or use a direction button to move."
  ],
  [
    "Toprağın altında bir geçit açıldı! Üzerine ilerle.",
    "A portal opened beneath the soil! Walk onto it."
  ],
  [
    "Blok kırıldı. Açılan kareye ilerleyebilirsin.",
    "Block broken. You can move into the cleared cell."
  ],
  [
    "Kazmak veya yürümek için yanındaki bir kareye dokun.",
    "Tap an adjacent cell to dig or walk."
  ],
  [
    "Hedef işareti kaldırıldı.",
    "Target marker removed."
  ],
  [
    "Karakter görseli bulunamadı; geçici prens simgesi kullanılıyor. assets/characters/characters.png yolunu kontrol et.",
    "Character image not found; using a temporary prince icon. Check assets/characters/characters.png."
  ],
  [
    "Yeni tünel, yeni bir yön tarifi",
    "New tunnel, new directions"
  ],
  [
    "K ↑",
    "N ↑"
  ],
  [
    "10 m / kare",
    "10 m / cell"
  ],
  [
    "BAŞ",
    "START"
  ],
  [
    "YÜZEY YOLCULUĞU",
    "SURFACE JOURNEY"
  ],
  [
    "Bir dakika… Burası başka bir ülke!",
    "Wait… We are in a different country!"
  ],
  [
    "🧭 Neredeyiz? Haritayı aç",
    "🧭 Where are we? Open the map"
  ],
  [
    "Hangi ülkedeyiz?",
    "Which country are we in?"
  ],
  [
    "Gördüğün yapının bulunduğu ülkeyi seç ve tahminini onayla.",
    "Select the country where this landmark is located and confirm your guess."
  ],
  [
    "Uzaklaş",
    "Zoom out"
  ],
  [
    "Yakınlaş",
    "Zoom in"
  ],
  [
    "Dünya görünümü",
    "World view"
  ],
  [
    "Görsele bak",
    "View image"
  ],
  [
    "Ülke seçmek için dünya haritası",
    "World map for selecting a country"
  ],
  [
    "Haritayı sürükleyebilirsin. Küçük ülkeler için + ile yakınlaş.",
    "Drag the map to pan. Use + to zoom in on smaller countries."
  ],
  [
    "Harita yükleniyor…",
    "Loading the map…"
  ],
  [
    "Tahminimi onayla",
    "Confirm my guess"
  ],
  [
    "Haritayı yeniden yükle",
    "Reload the map"
  ],
  [
    "Ülke sınırları: Natural Earth / datasets geo-countries. Oyun haritasıdır; sınır gösterimleri siyasi görüş belirtmez.",
    "Country boundaries: Natural Earth / datasets geo-countries. This is a game map; boundary depictions do not express political views."
  ],
  [
    "Puan, süre ve haklar",
    "Score, time and guesses"
  ],
  [
    "Puan",
    "Score"
  ],
  [
    "Süre",
    "Time"
  ],
  [
    "sn",
    "s"
  ],
  [
    "Hak",
    "Guesses"
  ],
  [
    "Rekor",
    "Best"
  ],
  [
    "Süre doldu. Prensese bu kez ulaşamadın.",
    "Time is up. You could not reach the princess this time."
  ],
  [
    "Yeni bir geçit bulmak için kazıya dön.",
    "Return underground to find another portal."
  ],
  [
    "Macera sona erdi",
    "The adventure has ended"
  ],
  [
    "📖 Topladığım ülke ipuçları",
    "📖 My country clues"
  ],
  [
    "Henüz bir ülke ipucu toplamadın.",
    "You have not collected any country clues yet."
  ],
  [
    "⛏ Kazıya geri dön",
    "⛏ Return underground"
  ],
  [
    "Fotoğraf yüklenemedi. assets/landmarks klasörünü ve dosya adlarını kontrol et.",
    "The photo could not load. Check the assets/landmarks folder and file names."
  ],
  [
    "Tasarladığımız taçlı prenses",
    "Our crowned princess character"
  ],
  [
    "Prensesi kurtardın! 👑",
    "You rescued the princess! 👑"
  ],
  [
    "Doğru cevap:",
    "Correct answer:"
  ],
  [
    ". Topladığın coğrafi ipuçları seni prensesin yanına getirdi.",
    ". The geographical clues led you to the princess."
  ],
  [
    "“Beni bulacağını biliyordum!”",
    "“I knew you would find me!”"
  ],
  [
    "Bir haritayla başlayan macera, kavuşmanızla tamamlandı.",
    "An adventure that began with a map ends with your reunion."
  ],
  [
    "Yeni bir macera başlat",
    "Start a new adventure"
  ],
  [
    "MACERA TAMAMLANDI",
    "ADVENTURE COMPLETE"
  ],
  [
    "Dünya sınırları yükleniyor…",
    "Loading country boundaries…"
  ],
  [
    "GeoJSON biçimi geçersiz.",
    "Invalid GeoJSON format."
  ],
  [
    "Haritadan bir ülke seç. Henüz tahmin yapmadın.",
    "Select a country on the map. You have not guessed yet."
  ],
  [
    "Bir kara parçasındaki ülkeye tıkla.",
    "Click a country on land."
  ],
  [
    "Üç tahmin hakkın da bitti. Notlarını kullanarak yeniden dene.",
    "You have used all three guesses. Use your notes and try again."
  ],
  [
    "Kapı açılmadı. Notlarını yeniden inceleyip başka bir ülke seçebilirsin.",
    "The door did not open. Review your notes and select another country."
  ],
  [
    "Haritaya dön",
    "Return to the map"
  ],
  [
    "Netleşen fotoğrafa bak",
    "View the clear photo"
  ],
  [
    "Fotoğrafa dön",
    "Return to the photo"
  ],
  [
    "Tahmin tamamlandı",
    "Guess submitted"
  ],
  [
    "Prensesi aramaya devam edelim. Yeni bir tünel bizi bekliyor!",
    "Let us keep searching for the princess. A new tunnel awaits!"
  ],
  [
    "Bulunduğun ülkeye ait gizemli bir yapı veya manzara",
    "A mysterious landmark or landscape in the country you reached"
  ],
  [
    "SON GEÇİT · PRENSESİN KALESİ",
    "FINAL PORTAL · THE PRINCESS'S CASTLE"
  ],
  [
    "Prenses burada! Ama hangi ülkedeyiz?",
    "The princess is here! But which country are we in?"
  ],
  [
    "Penceredeki prenses sana sesleniyor. Kapıyı açmak için bu kalenin bulunduğu ülkeyi bulmalısın.",
    "The princess calls to you from the window. Identify the country where this castle stands to open the door."
  ],
  [
    "Prens geçitten çıktı. Karşısındaki manzara hangi ülkeye aitti?",
    "The prince steps out of the portal. Which country is this landscape in?"
  ],
  [
    "“Notlarımı buldun mu? Hepsi bulunduğum ülkeyi anlatıyor!”",
    "“Did you find my notes? They all describe the country I am in!”"
  ],
  [
    "“Prenses burada yok… Ülkeyi bilirsem bir bomba kazanabilirim!”",
    "“The princess is not here… If I identify the country, I can earn a bomb!”"
  ],
  [
    "Topladığın coğrafi ipuçlarını kullanarak prensesin bulunduğu ülkeyi seç.",
    "Use your geographical clues to select the country where the princess is being held."
  ],
  [
    "Kaleye dön",
    "Return to the castle"
  ],
  [
    "İtalya",
    "Italy"
  ],
  [
    "Yunanistan",
    "Greece"
  ],
  [
    "Türkiye",
    "Türkiye"
  ],
  [
    "Çin",
    "China"
  ],
  [
    "İspanya",
    "Spain"
  ],
  [
    "Amerika Birleşik Devletleri",
    "United States"
  ],
  [
    "Peru",
    "Peru"
  ],
  [
    "Fransa",
    "France"
  ],
  [
    "Birleşik Krallık",
    "United Kingdom"
  ],
  [
    "Hindistan",
    "India"
  ],
  [
    "Avustralya",
    "Australia"
  ],
  [
    "Prensesin kalesi",
    "The princess's castle"
  ],
  [
    "Atina Akropolü'ndeki Partenon",
    "The Parthenon on the Acropolis of Athens"
  ],
  [
    "Kapadokya'nın peri bacaları",
    "The fairy chimneys of Cappadocia"
  ],
  [
    "Çin Seddi",
    "The Great Wall of China"
  ],
  [
    "Barselona'daki Sagrada Família",
    "The Sagrada Família in Barcelona"
  ],
  [
    "Özgürlük Heykeli",
    "The Statue of Liberty"
  ],
  [
    "Eyfel Kulesi",
    "The Eiffel Tower"
  ],
  [
    "Londra'daki Big Ben ve Parlamento",
    "Big Ben and the Houses of Parliament in London"
  ],
  [
    "Tac Mahal",
    "The Taj Mahal"
  ],
  [
    "Sidney Opera Binası",
    "The Sydney Opera House"
  ],
  [
    "Hikâye videosu",
    "Story video"
  ],
  [
    "Prens ve prensesin hikâyesi",
    "The story of the prince and princess"
  ],
  [
    "▶ Maceraya başla",
    "▶ Start the adventure"
  ],
  [
    "Sesi kapat",
    "Mute"
  ],
  [
    "Sesi aç",
    "Unmute"
  ],
  [
    "🔊 Ses açık",
    "🔊 Sound on"
  ],
  [
    "🔇 Ses kapalı",
    "🔇 Sound off"
  ],
  [
    "Atla →",
    "Skip →"
  ],
  [
    "Videoyu başlatmak için aşağıdaki düğmeye dokun.",
    "Tap the button below to start the video."
  ],
  [
    "▶ Videoyu oynat",
    "▶ Play video"
  ],
  [
    "Sonunda birbirinizi buldunuz… 💛",
    "You finally found each other… 💛"
  ],
  [
    "Her büyük macera, küçük bir keşifle başlar…",
    "Every great adventure begins with a small discovery…"
  ],
  [
    "▶ Kavuşmayı izle",
    "▶ Watch the reunion"
  ],
  [
    "Sonuca geç →",
    "View results →"
  ],
  [
    "Hikâyeyi atla →",
    "Skip the story →"
  ],
  [
    "Video açılamadı. Dosya adını ve video biçimini kontrol et. Atla düğmesiyle devam edebilirsin.",
    "The video could not load. Check the file name and format. You can continue with the Skip button."
  ]
]);
  dictionary.set("Penceresinde prensesin beklediği masal kalesi", "A fairytale castle with the princess waiting at its window");
  const normalize = text => text.replace(/\s+/g, " ").trim();
  let language = "tr";
  try { if (localStorage.getItem("geogame-language") === "en") language = "en"; } catch {}
  const sources = new WeakMap();
  const attributeSources = new WeakMap();
  const rules = [];
  const rule = (pattern, render) => rules.push([pattern, render]);
  const english = text => {
    const key = normalize(String(text));
    if (dictionary.has(key)) return dictionary.get(key);
    for (const [pattern, render] of rules) {
      const match = key.match(pattern);
      if (match) return render(...match.slice(1));
    }
    return key;
  };
  const direction = {doğuya:"east",batıya:"west",kuzeye:"north",güneye:"south"};
  rule(/^Başlangıç taşından (\d+) kare (doğuya|batıya|kuzeye|güneye), ardından (\d+) kare (doğuya|batıya|kuzeye|güneye) ilerle\. Gizli geçit o karede saklı\.$/,
    (a,b,c,d) => `From the starting stone, move ${a} cells ${direction[b]}, then ${c} cells ${direction[d]}. The hidden portal is in that cell.`);
  rule(/^Başlangıç taşı: ([A-L]\d+) · Her kare 10 × 10 metre$/, a => `Starting stone: ${a} · Each cell is 10 × 10 metres`);
  rule(/^Bölüm (\d+) · Kayıp Geçit$/, a => `Chapter ${a} · The Lost Portal`);
  rule(/^Kürek darbesi: (\d+)\/3$/, a => `Shovel strike: ${a}/3`);
  rule(/^📜 Bir not buldun! (.+)$/, a => `📜 You found a note! ${english(a)}`);
  rule(/^([A-L]\d+) hedef olarak işaretlendi\. Oraya ulaşmak için yanındaki kareleri kazarak ilerle\.$/, a => `${a} marked as your target. Dig through adjacent cells to reach it.`);
  rule(/^Yeni kazı alanına döndün! Çantanda (\d+) bomba var\. Yeni yön tarifini takip et\.$/, a => `Back underground! You have ${a} bombs in your bag. Follow the new directions.`);
  rule(/^(\d+)\. YÜZEY YOLCULUĞU$/, a => `SURFACE JOURNEY ${a}`);
  rule(/^Süre doldu! Doğru ülke: (.+)\. Bu tur ödül yok\.$/, a => `Time is up! Correct country: ${english(a)}. No reward this round.`);
  rule(/^Puanın: (\d+) · (\d+) geçitlik oyun rekoru: (\d+)\. (.+)$/, (a,b,c,d) => `Your score: ${a} · Best for a ${b}-portal journey: ${c}. ${d === "Yeniden deneyebilirsin!" ? "You can try again!" : "At last, you are together again!"}`);
  rule(/^Seçimin: (.+)\. Onaylamak ister misin\?$/, a => `Your selection: ${english(a)}. Ready to confirm?`);
  rule(/^Doğru! Burası (.+)\. Fotoğraftaki yer: (.+)\. \+1 bomba kazandın!$/, (a,b) => `Correct! This is ${english(a)}. Landmark: ${english(b)}. You earned +1 bomb!`);
  rule(/^Seçimin: (.+)\. Doğru ülke: (.+)\. Fotoğraftaki yer: (.+)\. Bu tur bomba kazanamadın\.$/, (a,b,c) => `Your selection: ${english(a)}. Correct country: ${english(b)}. Landmark: ${english(c)}. No bomb earned this round.`);
  rule(/^(.+)… Bulunduğumuz ülke: (.+)\. Prensesin izini aramaya devam etmeliyim\.$/, (a,b) => `${english(a)}… We are in ${english(b)}. I must keep searching for the princess.`);
  rule(/^Harita dosyası okunamadı \(HTTP (\d+)\)\.$/, a => `Could not load the map file (HTTP ${a}).`);
  rule(/^Hata: (.+) \| Dosya adresi: (.+)$/, (a,b) => `Error: ${english(a)} | File URL: ${b}`);

  function t(text) { return language === "en" ? english(text) : text; }
  function translateValue(current, entry) {
    // A game update replaces the canonical source; our own last write does not.
    const source = entry && current === entry.rendered ? entry.source : current;
    const rendered = language === "en"
      ? source.replace(/^(\s*)([\s\S]*?)(\s*)$/, (_,before,body,after) => before + english(body) + after)
      : source;
    return {source, rendered};
  }
  function translateNode(node) {
    if (node.nodeType === 3) {
      if (!node.parentElement || node.parentElement.closest("script,style,[data-no-translate]")) return;
      const entry = translateValue(node.nodeValue, sources.get(node));
      sources.set(node, entry);
      if (node.nodeValue !== entry.rendered) node.nodeValue = entry.rendered;
      return;
    }
    if (node.nodeType !== 1 || node.matches("script,style,[data-no-translate]")) return;
    let entries = attributeSources.get(node);
    if (!entries) { entries = {}; attributeSources.set(node, entries); }
    for (const attr of ["aria-label", "alt", "title", "placeholder"]) {
      if (!node.hasAttribute(attr)) continue;
      const entry = translateValue(node.getAttribute(attr), entries[attr]);
      entries[attr] = entry;
      if (node.getAttribute(attr) !== entry.rendered) node.setAttribute(attr, entry.rendered);
    }
    for (const child of node.childNodes) translateNode(child);
  }
  function originalText(element) {
    return [...element.childNodes].map(node => node.nodeType === 3
      ? (sources.get(node)?.source ?? node.nodeValue) : originalText(node)).join("");
  }
  let observer;
  function refresh(nodes = [document.documentElement]) {
    observer?.disconnect();
    for (const node of nodes) translateNode(node);
    observer?.observe(document.documentElement, {
      childList:true, subtree:true, characterData:true,
      attributes:true, attributeFilter:["aria-label","alt","title","placeholder"]
    });
  }
  function setLanguage(value) {
    language = value === "en" ? "en" : "tr";
    document.documentElement.lang = language;
    document.getElementById("languageSelect").value = language;
    try { localStorage.setItem("geogame-language", language); } catch {}
    refresh();
    window.dispatchEvent(new CustomEvent("geogame:language"));
  }
  window.geoGameI18n = {
    t, originalText, setLanguage,
    register: (tr,en) => dictionary.set(tr,en),
    get language() { return language; }
  };
  observer = new MutationObserver(records => {
    const nodes = new Set();
    for (const record of records) {
      if (record.type === "childList") for (const node of record.addedNodes) nodes.add(node);
      else nodes.add(record.target);
    }
    refresh(nodes);
  });
  document.getElementById("languageSelect").addEventListener("change", event => setLanguage(event.target.value));
  setLanguage(language);
})();
