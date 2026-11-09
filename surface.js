"use strict";

(() => {
  let countryNames = null;

  try {
    if (typeof Intl.DisplayNames === "function") {
      countryNames = new Intl.DisplayNames(["tr"], {
        type: "region"
      });
    }
  } catch {}

  let countries = [];
  let shapes = [];
  let selectedCountry = null;
  let answered = false;
  let activeCountry = null;
  let surfaceVisit = 0;

  let zoom = 1;
  let offsetX = 0;
  let offsetY = 0;
  let pointerStart = null;
  let dragged = false;

  window.geoGameInventory = window.geoGameInventory || {
    bombs: 0
  };

  // İtalya ilk geçitte gelmez.
  const finalVisit = 2 + Math.floor(Math.random() * 3);

  const italy = {
    code: "ITA",
    name: "İtalya",
    landmark: "Prensesin kalesi"
  };

  const isFinal = () => activeCountry?.code === "ITA";

  const landmarkCountries = [
    {
      code: "GRC",
      name: "Yunanistan",
      image: "athens.jpg",
      landmark: "Atina Akropolü'ndeki Partenon"
    },
    {
      code: "TUR",
      name: "Türkiye",
      image: "türkiye.jpg",
      landmark: "Kapadokya'nın peri bacaları"
    },
    {
      code: "CHN",
      name: "Çin",
      image: "china.jpg",
      landmark: "Çin Seddi"
    },
    {
      code: "ESP",
      name: "İspanya",
      image: "barcelona.jpg",
      landmark: "Barselona'daki Sagrada Família"
    },
    {
      code: "USA",
      name: "Amerika Birleşik Devletleri",
      image: "usa.jpg",
      landmark: "Özgürlük Heykeli"
    },
    {
      code: "PER",
      name: "Peru",
      image: "peru.jpg",
      landmark: "Machu Picchu"
    },
    {
      code: "FRA",
      name: "Fransa",
      image: "french.jpg",
      landmark: "Eyfel Kulesi"
    },
    {
      code: "GBR",
      name: "Birleşik Krallık",
      image: "england.jpg",
      landmark: "Londra'daki Big Ben ve Parlamento"
    },
    {
      code: "IND",
      name: "Hindistan",
      image: "india.jpg",
      landmark: "Tac Mahal"
    },
    {
      code: "AUS",
      name: "Avustralya",
      image: "australia.jpg",
      landmark: "Sidney Opera Binası"
    }
  ];

  const COUNTRY_QUEUE_KEY = "geogame-country-queue-v1";
  const LAST_COUNTRY_KEY = "geogame-last-country-v1";

  function shuffled(items) {
    const result = [...items];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function chooseSurfaceCountry() {
    const validCodes = landmarkCountries.map(country => country.code);

    let queue = [];
    let lastCode = null;

    try {
      const saved = JSON.parse(
        localStorage.getItem(COUNTRY_QUEUE_KEY) || "[]"
      );

      if (Array.isArray(saved)) {
        queue = [...new Set(saved)].filter(code =>
          validCodes.includes(code)
        );
      }

      lastCode = localStorage.getItem(LAST_COUNTRY_KEY);
    } catch {}

    if (!queue.length) {
      queue = shuffled(validCodes);
    }

    if (queue.length > 1 && queue[0] === lastCode) {
      [queue[0], queue[1]] = [queue[1], queue[0]];
    }

    const chosenCode = queue.shift();

    try {
      localStorage.setItem(COUNTRY_QUEUE_KEY, JSON.stringify(queue));
      localStorage.setItem(LAST_COUNTRY_KEY, chosenCode);
    } catch {}

    return landmarkCountries.find(country => country.code === chosenCode);
  }

  const screen = document.createElement("section");
  screen.className = "surface-screen";
  screen.hidden = true;

  screen.innerHTML = `
    <div class="surface-container">
      <header class="surface-heading">
        <span class="eyebrow">YÜZEY YOLCULUĞU</span>
        <span class="bomb-counter">💣 <b id="bombCount">0</b></span>
      </header>

      <div id="landmarkScene">
        <h1>Bir dakika… Burası başka bir ülke!</h1>
        <p class="surface-story"></p>

        <div class="landmark-art"></div>

        <p class="surface-dialogue"></p>

        <button id="openWorldMap" class="gold-button">
          🧭 Neredeyiz? Haritayı aç
        </button>
      </div>

      <div id="worldMapScene" hidden>
        <h2>Hangi ülkedeyiz?</h2>
        <p>
          Gördüğün yapının bulunduğu ülkeyi seç ve tahminini onayla.
        </p>

        <div class="map-controls">
          <button id="zoomOut" aria-label="Uzaklaş">−</button>
          <button id="zoomIn" aria-label="Yakınlaş">+</button>
          <button id="resetMap">Dünya görünümü</button>
          <button id="seeLandmark">Görsele bak</button>
        </div>

        <div class="world-map-frame">
          <canvas
            id="worldCanvas"
            width="1200"
            height="600"
            aria-label="Ülke seçmek için dünya haritası">
          </canvas>
        </div>

        <p class="map-instruction">
          Haritayı sürükleyebilirsin. Küçük ülkeler için + ile yakınlaş.
        </p>

        <p id="mapMessage" role="status">Harita yükleniyor…</p>

        <div class="surface-actions">
          <button id="confirmCountry" class="gold-button" disabled>
            Tahminimi onayla
          </button>
          <button id="retryMap" hidden>Haritayı yeniden yükle</button>
        </div>

        <p id="nextChapterNote" hidden></p>

        <small class="map-credit">
          Ülke sınırları: Natural Earth / datasets geo-countries.
          Oyun haritasıdır; sınır gösterimleri siyasi görüş belirtmez.
        </small>
      </div>
    </div>
  `;

  document.body.appendChild(screen);

  const get = id => document.getElementById(id);
  const container = screen.querySelector(".surface-container");

  // Toplanan ipuçları.
  const surfaceNotebook = document.createElement("details");
  surfaceNotebook.className = "clue-notebook surface-notebook";

  const surfaceNotebookTitle = document.createElement("summary");
  surfaceNotebookTitle.textContent = "📖 Topladığım ülke ipuçları";

  const surfaceClueList = document.createElement("ul");

  surfaceNotebook.append(surfaceNotebookTitle, surfaceClueList);
  container.appendChild(surfaceNotebook);

  function updateSurfaceNotebook() {
    surfaceClueList.textContent = "";

    document.querySelectorAll("#clueList li").forEach(item => {
      const copy = document.createElement("li");
      copy.textContent = item.textContent;
      surfaceClueList.appendChild(copy);
    });

    if (!surfaceClueList.children.length) {
      const empty = document.createElement("li");
      empty.textContent = "Henüz bir ülke ipucu toplamadın.";
      surfaceClueList.appendChild(empty);
    }
  }

  // Kazıya dönüş düğmesi.
  const returnButton = document.createElement("button");
  returnButton.id = "returnToDig";
  returnButton.type = "button";
  returnButton.className = "gold-button";
  returnButton.textContent = "⛏ Kazıya geri dön";
  returnButton.hidden = true;

  screen.querySelector(".surface-actions").appendChild(returnButton);

  // Gerçek ülke fotoğrafı.
  const photoFrame = screen.querySelector(".landmark-art");

  const landmarkPhoto = document.createElement("img");
  landmarkPhoto.className = "landmark-photo is-blurred";
  landmarkPhoto.alt = "Bulunduğun ülkeye ait gizemli bir yapı veya manzara";
  landmarkPhoto.draggable = false;

  const photoError = document.createElement("p");
  photoError.className = "photo-error";
  photoError.hidden = true;

  photoFrame.append(landmarkPhoto, photoError);

  landmarkPhoto.addEventListener("error", () => {
    photoError.hidden = isFinal();
    photoError.textContent =
      "Fotoğraf yüklenemedi. assets/landmarks klasörünü " +
      "ve dosya adlarını kontrol et.";
  });

  landmarkPhoto.addEventListener("load", () => {
    photoError.hidden = true;
  });

  // Temsili kale ve final ekranının stilleri.
  const finalStyle = document.createElement("style");

  finalStyle.textContent = `
    .surface-screen[hidden],
    .surface-screen [hidden] {
      display: none !important;
    }

    #worldCanvas {
      touch-action: none;
    }

    .rescue-castle {
      position: relative;
      width: 100%;
      min-height: 280px;
      display: grid;
      place-items: center;
      overflow: hidden;
      background: linear-gradient(
        #263855,
        #7e7194 70%,
        #455e47 70%
      );
      border-radius: 20px;
    }

    .castle-building {
      position: relative;
      width: 190px;
      height: 140px;
      margin-top: 50px;
      background: #d0bba3;
      border: 5px solid #9b877e;
      border-radius: 8px 8px 0 0;
    }

    .castle-building::before,
    .castle-building::after {
      content: "";
      position: absolute;
      top: -56px;
      width: 45px;
      height: 190px;
      background: linear-gradient(
        #75506d 0 22%,
        #d0bba3 22%
      );
      border: 4px solid #9b877e;
    }

    .castle-building::before {
      left: -40px;
    }

    .castle-building::after {
      right: -40px;
    }

    .castle-window {
      position: absolute;
      top: 10px;
      left: 67px;
      font-size: 32px;
      line-height: 44px;
      background: #293248;
      border-radius: 25px 25px 0 0;
      width: 48px;
      text-align: center;
    }

    .castle-door {
      position: absolute;
      bottom: 0;
      left: 64px;
      width: 52px;
      height: 70px;
      background: #483844;
      border-radius: 28px 28px 0 0;
      transform-origin: left;
      transition: transform 1s;
    }

    .is-rescued .castle-door {
      transform: perspective(200px) rotateY(-75deg);
    }

    #rescueScene {
      text-align: center;
      padding: 20px 0;
    }

    #rescueScene h1 {
      color: #f2d39b;
    }

    .rescue-heart {
      font-size: 44px;
      margin: 12px;
    }

    .rescue-caption {
      max-width: 580px;
      margin: 18px auto;
      line-height: 1.7;
    }

    @media (prefers-reduced-motion: reduce) {
      .castle-door {
        transition: none;
      }
    }
  `;

  document.head.appendChild(finalStyle);

  const castleScene = document.createElement("div");
  castleScene.className = "rescue-castle";
  castleScene.hidden = true;
  castleScene.setAttribute("role", "img");
  castleScene.setAttribute(
    "aria-label",
    "Penceresinde prensesin beklediği masal kalesi"
  );

  castleScene.innerHTML = `
    <div class="castle-building">
      <span class="castle-window">👸</span>
      <span class="castle-door"></span>
    </div>
  `;

  photoFrame.appendChild(castleScene);

  const rescueScene = document.createElement("section");
  rescueScene.id = "rescueScene";
  rescueScene.hidden = true;

    rescueScene.innerHTML = `
    <h1 tabindex="-1">Prensesi kurtardın! 👑</h1>

    <p class="rescue-caption">
      Doğru cevap: <strong>İtalya</strong>.
      Topladığın coğrafi ipuçları seni prensesin yanına getirdi.
    </p>

    <div id="rescuedCastle" hidden></div>

    <p class="rescue-caption">
      “Beni bulacağını biliyordum!”<br>
      Bir haritayla başlayan macera, kavuşmanızla tamamlandı.
    </p>

    <button id="playAgain" class="gold-button" type="button">
      Yeni bir macera başlat
    </button>
  `;

  container.appendChild(rescueScene);

  get("playAgain").addEventListener("click", () => {
    window.location.reload();
  });

  function showRescue() {
    get("landmarkScene").hidden = true;
    get("worldMapScene").hidden = true;
    returnButton.hidden = true;
    rescueScene.hidden = false;

    get("rescuedCastle").appendChild(castleScene);
    castleScene.hidden = false;

    requestAnimationFrame(() => {
      castleScene.classList.add("is-rescued");
    });

    screen.querySelector(".surface-heading .eyebrow").textContent =
      "MACERA TAMAMLANDI";

    surfaceNotebook.open = false;
    screen.scrollTop = 0;
    rescueScene.querySelector("h1").focus();
    window.dispatchEvent(new CustomEvent("geogame:ending"));
  }

  const mapCanvas = get("worldCanvas");
  const mapContext = mapCanvas.getContext("2d");

  function nameOf(feature) {
    const iso3 = feature.properties["ISO3166-1-Alpha-3"];

    if (iso3 === "ITA") return "İtalya";

    const known = landmarkCountries.find(country => country.code === iso3);
    if (known) return known.name;

    const code = feature.properties["ISO3166-1-Alpha-2"];

    if (code && /^[A-Z]{2}$/.test(code)) {
      try {
        if (countryNames) {
          return countryNames.of(code) || feature.properties.name;
        }
      } catch {}
    }

    return feature.properties.name;
  }

  function project(longitude, latitude) {
    return [
      ((longitude + 180) / 360) * mapCanvas.width,
      ((90 - latitude) / 180) * mapCanvas.height
    ];
  }

  function prepareShapes() {
    shapes = countries.map(feature => {
      const path = new Path2D();
      const geometry = feature.geometry;

      const polygons = geometry?.type === "Polygon"
        ? [geometry.coordinates]
        : geometry?.type === "MultiPolygon"
          ? geometry.coordinates
          : [];

      let largestArea = 0;
      let label = null;

      for (const polygon of polygons) {
        for (const ring of polygon) {
          ring.forEach(([longitude, latitude], index) => {
            const [x, y] = project(longitude, latitude);

            if (index === 0) path.moveTo(x, y);
            else path.lineTo(x, y);
          });

          path.closePath();
        }

        const outer = polygon[0];
        if (!outer?.length) continue;

        let area = 0;
        let centerX = 0;
        let centerY = 0;

        for (let i = 0; i < outer.length; i++) {
          const a = project(...outer[i]);
          const b = project(...outer[(i + 1) % outer.length]);
          const cross = a[0] * b[1] - b[0] * a[1];

          area += cross;
          centerX += (a[0] + b[0]) * cross;
          centerY += (a[1] + b[1]) * cross;
        }

        if (Math.abs(area) > largestArea && Math.abs(area) > 0.01) {
          largestArea = Math.abs(area);

          label = {
            x: centerX / (3 * area),
            y: centerY / (3 * area),
            area: Math.abs(area) / 2
          };
        }
      }

      return { feature, path, label };
    });
  }

  async function loadMap() {
    get("retryMap").hidden = true;
    get("mapMessage").textContent = "Dünya sınırları yükleniyor…";

    try {
      const response = await fetch("./assets/countries.geojson");

      if (!response.ok) {
        throw new Error(
          `Harita dosyası okunamadı (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.features) || !data.features.length) {
        throw new Error("GeoJSON biçimi geçersiz.");
      }

      countries = data.features;
      prepareShapes();
      drawMap();

      get("mapMessage").textContent =
        "Haritadan bir ülke seç. Henüz tahmin yapmadın.";
    } catch (error) {
      console.error("Harita yükleme hatası:", error);

      get("mapMessage").textContent =
        "Hata: " + error.message +
        " | Dosya adresi: " +
        new URL("./assets/countries.geojson", document.baseURI).href;

      get("retryMap").hidden = false;
    }
  }

  function drawMap() {
    const width = mapCanvas.width;
    const height = mapCanvas.height;

    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    mapContext.fillStyle = "#182c40";
    mapContext.fillRect(0, 0, width, height);

    mapContext.save();
    mapContext.translate(width / 2 + offsetX, height / 2 + offsetY);
    mapContext.scale(zoom, zoom);
    mapContext.translate(-width / 2, -height / 2);

    mapContext.strokeStyle = "#365064";
    mapContext.lineWidth = 0.6 / zoom;
    mapContext.beginPath();

    for (let lon = -180; lon <= 180; lon += 30) {
      const [x] = project(lon, 0);
      mapContext.moveTo(x, 0);
      mapContext.lineTo(x, height);
    }

    for (let lat = -90; lat <= 90; lat += 30) {
      const [, y] = project(0, lat);
      mapContext.moveTo(0, y);
      mapContext.lineTo(width, y);
    }

    mapContext.stroke();

    for (const shape of shapes) {
      const code = shape.feature.properties["ISO3166-1-Alpha-3"];
      const isSelected = shape.feature === selectedCountry;
      const isAnswer = answered && code === activeCountry?.code;

      mapContext.fillStyle = isAnswer
        ? "#83bca0"
        : isSelected
          ? "#e4bc75"
          : "#b3b9ac";

      mapContext.strokeStyle = "#435465";
      mapContext.lineWidth = 0.7 / zoom;
      mapContext.fill(shape.path, "evenodd");
      mapContext.stroke(shape.path);
    }

    mapContext.textAlign = "center";
    mapContext.textBaseline = "middle";
    mapContext.font = `${11 / zoom}px Arial`;
    mapContext.fillStyle = "#142638";

    for (const shape of shapes) {
      if (!shape.label || shape.label.area * zoom * zoom < 850) continue;

      mapContext.fillText(
        nameOf(shape.feature),
        shape.label.x,
        shape.label.y
      );
    }

    mapContext.restore();
  }

  function canvasPoint(event) {
    const rect = mapCanvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * mapCanvas.width / rect.width,
      y: (event.clientY - rect.top) * mapCanvas.height / rect.height
    };
  }

  function selectAt(point) {
    if (answered || !shapes.length) return;

    const x =
      (point.x - mapCanvas.width / 2 - offsetX) / zoom +
      mapCanvas.width / 2;

    const y =
      (point.y - mapCanvas.height / 2 - offsetY) / zoom +
      mapCanvas.height / 2;

    mapContext.setTransform(1, 0, 0, 1, 0, 0);

    const hit = shapes.find(shape =>
      mapContext.isPointInPath(shape.path, x, y, "evenodd")
    );

    selectedCountry = hit ? hit.feature : null;
    get("confirmCountry").disabled = !selectedCountry;

    get("mapMessage").textContent = selectedCountry
      ? `Seçimin: ${nameOf(selectedCountry)}. Onaylamak ister misin?`
      : "Bir kara parçasındaki ülkeye tıkla.";

    drawMap();
  }

  mapCanvas.addEventListener("pointerdown", event => {
    if (!event.isPrimary || event.button !== 0) return;

    const point = canvasPoint(event);

    pointerStart = {
      x: point.x,
      y: point.y,
      offsetX,
      offsetY,
      pointerId: event.pointerId
    };

    dragged = false;

    if (mapCanvas.setPointerCapture) {
      mapCanvas.setPointerCapture(event.pointerId);
    }
  });

  mapCanvas.addEventListener("pointermove", event => {
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;

    const point = canvasPoint(event);
    const dx = point.x - pointerStart.x;
    const dy = point.y - pointerStart.y;

    if (Math.hypot(dx, dy) > 5) dragged = true;

    if (dragged) {
      offsetX = pointerStart.offsetX + dx;
      offsetY = pointerStart.offsetY + dy;
      drawMap();
    }
  });

  mapCanvas.addEventListener("pointerup", event => {
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;

    if (!dragged) selectAt(canvasPoint(event));

    pointerStart = null;
  });

  mapCanvas.addEventListener("pointercancel", () => {
    pointerStart = null;
  });

  get("zoomIn").addEventListener("click", () => {
    const next = Math.min(8, zoom * 1.5);

    offsetX *= next / zoom;
    offsetY *= next / zoom;
    zoom = next;

    drawMap();
  });

  get("zoomOut").addEventListener("click", () => {
    const next = Math.max(1, zoom / 1.5);

    offsetX *= next / zoom;
    offsetY *= next / zoom;
    zoom = next;

    drawMap();
  });

  get("resetMap").addEventListener("click", () => {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;

    drawMap();
  });

  get("openWorldMap").addEventListener("click", () => {
    get("landmarkScene").hidden = true;
    get("worldMapScene").hidden = false;

    if (!countries.length) loadMap();
    else drawMap();
  });

  get("seeLandmark").addEventListener("click", () => {
    get("worldMapScene").hidden = true;
    get("landmarkScene").hidden = false;
  });

  get("retryMap").addEventListener("click", loadMap);

  get("confirmCountry").addEventListener("click", () => {
    if (!selectedCountry || answered || !activeCountry) return;

    const selectedCode =
      selectedCountry.properties["ISO3166-1-Alpha-3"];

    const correct = selectedCode === activeCountry.code;

    // Finalde yanlış cevap sonrası tekrar denemeye izin ver.
    if (isFinal()) {
      if (!correct) {
        get("mapMessage").textContent =
          "Kapı açılmadı. Notlarını yeniden inceleyip " +
          "başka bir ülke seçebilirsin.";

        selectedCountry = null;
        get("confirmCountry").disabled = true;
        surfaceNotebook.open = true;

        drawMap();
        return;
      }

      answered = true;
      drawMap();
      showRescue();
      return;
    }

    answered = true;

    if (correct) {
      landmarkPhoto.classList.remove("is-blurred");
      landmarkPhoto.alt = activeCountry.landmark;

      window.geoGameInventory.bombs =
        (window.geoGameInventory.bombs || 0) + 1;

      get("bombCount").textContent = window.geoGameInventory.bombs;

      get("mapMessage").textContent =
        `Doğru! Burası ${activeCountry.name}. ` +
        `Fotoğraftaki yer: ${activeCountry.landmark}. ` +
        "+1 bomba kazandın!";
    } else {
      get("mapMessage").textContent =
        `Seçimin: ${nameOf(selectedCountry)}. ` +
        `Doğru ülke: ${activeCountry.name}. ` +
        `Fotoğraftaki yer: ${activeCountry.landmark}. ` +
        "Bu tur bomba kazanamadın.";
    }

    screen.querySelector(".surface-dialogue").textContent =
      `${activeCountry.landmark}… Bulunduğumuz ülke: ${activeCountry.name}. ` +
      "Prensesin izini aramaya devam etmeliyim.";

    get("openWorldMap").textContent = "Haritaya dön";

    get("seeLandmark").textContent = correct
      ? "Netleşen fotoğrafa bak"
      : "Fotoğrafa dön";

    get("confirmCountry").disabled = true;
    get("confirmCountry").textContent = "Tahmin tamamlandı";

    get("nextChapterNote").hidden = false;
    get("nextChapterNote").textContent =
      "Prensesi aramaya devam edelim. Yeni bir tünel bizi bekliyor!";

    returnButton.hidden = false;
    drawMap();
  });

  returnButton.addEventListener("click", () => {
    if (!answered || isFinal()) return;

    returnButton.hidden = true;
    screen.hidden = true;
    document.body.style.overflow = "";

    answered = false;
    selectedCountry = null;
    activeCountry = null;

    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    pointerStart = null;
    dragged = false;

    landmarkPhoto.classList.add("is-blurred");
    landmarkPhoto.alt =
      "Bulunduğun ülkeye ait gizemli bir yapı veya manzara";

    photoError.hidden = true;

    get("landmarkScene").hidden = false;
    get("worldMapScene").hidden = true;

    get("confirmCountry").disabled = true;
    get("confirmCountry").textContent = "Tahminimi onayla";
    get("openWorldMap").textContent = "🧭 Neredeyiz? Haritayı aç";
    get("seeLandmark").textContent = "Görsele bak";

    get("nextChapterNote").hidden = true;
    get("mapMessage").textContent =
      "Haritadan bir ülke seç. Henüz tahmin yapmadın.";

    window.dispatchEvent(new CustomEvent("geogame:return-to-dig"));
  });

  window.addEventListener("geogame:surface", event => {
    // Yüzey yalnızca kazıdaki geçide ulaşıldığında açılır.
    if (!event.detail || event.detail.portalReached !== true) return;

    if (!activeCountry) {
      surfaceVisit += 1;

      activeCountry = surfaceVisit >= finalVisit
        ? italy
        : chooseSurfaceCountry();

      if (!isFinal()) {
        landmarkPhoto.src =
          "./assets/landmarks/" + encodeURIComponent(activeCountry.image);
      }

      landmarkPhoto.hidden = isFinal();
      castleScene.hidden = !isFinal();
      photoError.hidden = true;

      screen.querySelector(".surface-heading .eyebrow").textContent =
        isFinal()
          ? "SON GEÇİT · PRENSESİN KALESİ"
          : `${surfaceVisit}. YÜZEY YOLCULUĞU`;

      screen.querySelector("#landmarkScene h1").textContent =
        isFinal()
          ? "Prenses burada! Ama hangi ülkedeyiz?"
          : "Bir dakika… Burası başka bir ülke!";

      screen.querySelector(".surface-story").textContent =
        isFinal()
          ? "Penceredeki prenses sana sesleniyor. Kapıyı açmak için " +
            "bu kalenin bulunduğu ülkeyi bulmalısın."
          : "Prens geçitten çıktı. Karşısındaki manzara hangi ülkeye aitti?";

      screen.querySelector(".surface-dialogue").textContent =
        isFinal()
          ? "“Notlarımı buldun mu? Hepsi bulunduğum ülkeyi anlatıyor!”"
          : "“Prenses burada yok… Ülkeyi bilirsem bir bomba kazanabilirim!”";

      screen.querySelector("#worldMapScene > p").textContent =
        isFinal()
          ? "Topladığın coğrafi ipuçlarını kullanarak " +
            "prensesin bulunduğu ülkeyi seç."
          : "Gördüğün yapının bulunduğu ülkeyi seç ve tahminini onayla.";

      get("seeLandmark").textContent =
        isFinal() ? "Kaleye dön" : "Görsele bak";

      get("bombCount").textContent = window.geoGameInventory.bombs || 0;
    }

    updateSurfaceNotebook();
    surfaceNotebook.open = isFinal();

    get("landmarkScene").hidden = false;
    get("worldMapScene").hidden = true;

    screen.hidden = false;
    document.body.style.overflow = "hidden";
    screen.scrollTop = 0;

    get("openWorldMap").focus();
  });

  // Sayfa açılırken kazı ekranında kal.
  screen.hidden = true;
  get("landmarkScene").hidden = false;
  get("worldMapScene").hidden = true;
  document.body.style.overflow = "";
})();