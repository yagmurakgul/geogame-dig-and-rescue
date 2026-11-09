"use strict";

(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    position: document.getElementById("position"),
    direction: document.getElementById("direction"),
    marker: document.getElementById("marker"),
    status: document.getElementById("status"),
    sound: document.getElementById("soundButton"),
    finish: document.getElementById("finishPanel"),
    finishText: document.getElementById("finishText"),
    restart: document.getElementById("restartButton")
  };

  const SIZE = 72;
  const COLS = 12;
  const ROWS = 9;
  const LEFT = 68;
  const TOP = 62;
  const LETTERS = "ABCDEFGHIJKL";

  // Sütun ve satırlar kodda sıfırdan başlar.
  // B6 = column: 1, row: 5
  const START = { column: 1, row: 5 };

  // Başlangıçtan 5 doğu, 2 kuzey.
  const EXIT = {
    column: START.column + 5,
    row: START.row - 2
  };

  const directions = {
    north: { dc: 0, dr: -1, label: "Kuzey" },
    south: { dc: 0, dr: 1, label: "Güney" },
    west: { dc: -1, dr: 0, label: "Batı" },
    east: { dc: 1, dr: 0, label: "Doğu" }
  };

  const keyDirections = {
    arrowup: "north",
    w: "north",
    arrowdown: "south",
    s: "south",
    arrowleft: "west",
    a: "west",
    arrowright: "east",
    d: "east"
  };

  const character = new Image();
  let imageReady = false;

  let world = [];
  let player;
  let marker = null;
  let particles = [];
  let won = false;
  let swingStarted = -1000;
  let lastMove = -1000;
  let soundEnabled = true;
  let audioContext = null;
  // PRENSESİN ÜLKESİNE AİT İPUÇLARI
const countryClues = [
  "Prensesin bulunduğu ülke Avrupa'da ve Akdeniz'e kıyısı var.",
  "Bu ülkenin ana karadaki şekli bir çizmeyi andırıyor.",
  "Ülkenin kuzeyinde Alpler uzanıyor.",
  "Sicilya ve Sardinya adaları bu ülkeye bağlı."
];

const collectedClues = new Set();
let buriedNotes = [];

function updateNotebook() {
  const list = document.getElementById("clueList");
  list.textContent = "";

  // Toplama sırası yerine ipucu sırasına göre göster.
  [...collectedClues].sort((a, b) => a - b).forEach((id) => {
    const item = document.createElement("li");
    item.textContent = countryClues[id];
    list.appendChild(item);
  });

  document.getElementById("clueCount").textContent =
    collectedClues.size;

  document.getElementById("emptyClues").hidden =
    collectedClues.size > 0;
}

function placeClueNotes() {
  buriedNotes = [];

  const remaining = countryClues
    .map((text, id) => id)
    .filter(id => !collectedClues.has(id));

  if (remaining.length === 0) return;

  // Başlangıç odasının hemen doğusundaki toprak.
  buriedNotes.push({
    column: START.column + 2,
    row: START.row,
    clueId: remaining[0]
  });

  // İkinci not geçidin yanında bulunur ve geçide girerken alınır.
  if (remaining.length > 1) {
    buriedNotes.push({
      column: EXIT.column,
      row: EXIT.row,
      clueId: remaining[1]
    });
  }
}

function collectClueNote() {
  const note = buriedNotes.find(item =>
    item.column === player.column &&
    item.row === player.row &&
    !collectedClues.has(item.clueId)
  );

  if (!note) return;

  collectedClues.add(note.clueId);
  updateNotebook();

  document.getElementById("clueNotebook").open = true;

  message("📜 Bir not buldun! " + countryClues[note.clueId]);
}

function drawClueNotes(now) {
  for (const note of buriedNotes) {
    if (collectedClues.has(note.clueId)) continue;

    // Toprak kırılmadan not görünmez.
    if (world[note.row][note.column].hp > 0) continue;

    const x = LEFT + note.column * SIZE + SIZE / 2;
    const y = TOP + note.row * SIZE + SIZE / 2;

    ctx.save();

    ctx.shadowColor = "#ffe0a0";
    ctx.shadowBlur = 12 + Math.sin(now / 250) * 4;
    ctx.fillStyle = "#efdbad";

    ctx.fillRect(x - 16, y - 20, 32, 40);

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#96764c";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 16, y - 20, 32, 40);

    ctx.beginPath();

    for (let line = 0; line < 3; line++) {
      ctx.moveTo(x - 9, y - 9 + line * 9);
      ctx.lineTo(x + 9, y - 9 + line * 9);
    }

    ctx.stroke();
    ctx.restore();
  }
}

  let selectedTool = "shovel";
let placedBomb = null;
let blastUntil = 0;

function bombCount() {
  return window.geoGameInventory
    ? window.geoGameInventory.bombs || 0
    : 0;
}

function updateEquipment() {
  document.getElementById("digBombCount").textContent = bombCount();

  document.getElementById("selectShovel").setAttribute(
    "aria-pressed",
    String(selectedTool === "shovel")
  );

  document.getElementById("selectBomb").setAttribute(
    "aria-pressed",
    String(selectedTool === "bomb")
  );

  document.getElementById("digButton").textContent =
    selectedTool === "bomb" ? "💣 Yerleştir" : "⛏ Kaz";
}

function selectTool(tool) {
  if (won) return;

  selectedTool = tool;
  updateEquipment();

  message(
    tool === "bomb"
      ? "Bomba seçildi. Yanındaki kareye dokun veya Yerleştir'e bas."
      : "Kürek seçildi. Toprağa dokunarak kazabilirsin."
  );
}

function useTool() {
  if (won) return;

  if (selectedTool === "shovel") {
    dig();
    return;
  }

  if (placedBomb) {
    message("Yerleştirdiğin bombanın patlamasını bekle.");
    return;
  }

  if (bombCount() < 1) {
    message("Bomban yok. Yüzeyde bir ülkeyi doğru tahmin ederek kazanabilirsin.");
    return;
  }

  const target = targetInFront();

  if (!inside(target.column, target.row)) {
    message("Haritanın dışına bomba yerleştiremezsin.");
    return;
  }

  window.geoGameInventory.bombs -= 1;

  placedBomb = {
    column: target.column,
    row: target.row,
    explodeAt: performance.now() + 1200
  };

  updateEquipment();
  message("Fitil ateşlendi! Bomba birazdan patlayacak…");
}

function explodeBomb(now) {
  const bomb = placedBomb;
  placedBomb = null;
  blastUntil = now + 280;

  for (let row = bomb.row - 1; row <= bomb.row + 1; row++) {
    for (
      let column = bomb.column - 1;
      column <= bomb.column + 1;
      column++
    ) {
      if (!inside(column, row)) continue;
      if (world[row][column].hp === 0) continue;

      world[row][column].hp = 0;

      for (let i = 0; i < 10; i++) {
        particles.push({
          x: LEFT + column * SIZE + SIZE / 2,
          y: TOP + row * SIZE + SIZE / 2,
          vx: (Math.random() - 0.5) * 280,
          vy: -50 - Math.random() * 170,
          born: now,
          size: 4 + Math.random() * 6
        });
      }
    }
  }

  playDigSound(true);

  message(
    world[EXIT.row][EXIT.column].hp === 0
      ? "Patlama geçidi ortaya çıkardı! İçine doğru ilerle."
      : "Patlama çevredeki toprağı açtı!"
  );
}

function drawBomb(now) {
  if (placedBomb) {
    const x = LEFT + placedBomb.column * SIZE + SIZE / 2;
    const y = TOP + placedBomb.row * SIZE + SIZE / 2;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "36px Arial";
    ctx.shadowColor = "#ffac55";
    ctx.shadowBlur = 10 + Math.sin(now / 55) * 6;
    ctx.fillText("💣", x, y);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffe0a0";
    ctx.font = "bold 14px Arial";
    ctx.fillText(
      Math.max(0, (placedBomb.explodeAt - now) / 1000).toFixed(1),
      x,
      y - 27
    );

    ctx.restore();
  }

  if (now < blastUntil) {
    ctx.save();
    ctx.globalAlpha = ((blastUntil - now) / 280) * 0.25;
    ctx.fillStyle = "#ffc477";
    ctx.fillRect(LEFT, TOP, COLS * SIZE, ROWS * SIZE);
    ctx.restore();
  }
}

  function address(column, row) {
    return LETTERS[column] + (row + 1);
  }

  function inside(column, row) {
    return (
      column >= 0 &&
      column < COLS &&
      row >= 0 &&
      row < ROWS
    );
  }

  function message(text) {
    ui.status.textContent = text;
  }

  function updateInfo() {
    ui.position.textContent = address(player.column, player.row);
    ui.direction.textContent = directions[player.facing].label;
    ui.marker.textContent = marker
      ? address(marker.column, marker.row)
      : "Yok";
  }

  function resetGame() {
    // hp: 3 = sağlam toprak, hp: 0 = açık alan
    world = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ hp: 3 }))
    );

    // Başlangıçta küçük bir oda açık.
    for (let row = 4; row <= 6; row++) {
      for (let column = 0; column <= 2; column++) {
        world[row][column].hp = 0;
      }
    }

    player = {
      column: START.column,
      row: START.row,
      facing: "east"
    };

        marker = null;
    placedBomb = null;
    blastUntil = 0;
    selectedTool = "shovel";
    updateEquipment();
    particles = [];
    won = false;
    swingStarted = -1000;
    lastMove = -1000;

    ui.finish.hidden = true;
    placeClueNotes();
updateNotebook();
    updateInfo();
    message("Notu oku, hedef kareyi işaretle ve kazmaya başla.");
  }

  function targetInFront() {
    const direction = directions[player.facing];

    return {
      column: player.column + direction.dc,
      row: player.row + direction.dr
    };
  }

  function move(directionName) {
    if (won) return;
    player.facing = directionName;
    updateInfo();

    const target = targetInFront();

    if (!inside(target.column, target.row)) {
      message("Kazı planının sınırındasın.");
      return;
    }

    if (world[target.row][target.column].hp > 0) {
      message("Önünde toprak var. Toprağa dokun, Kaz düğmesine veya Space’e bas.");
      return;
    }

    player.column = target.column;
    player.row = target.row;
    updateInfo();
    collectClueNote();

    if (
      player.column === EXIT.column &&
      player.row === EXIT.row
    ) {
      finishLevel();
    }
  }

  function finishLevel() {
  // Karakter geçidin üzerinde değilse yüzey açılmaz.
  if (placedBomb) {
  message("Yüzeye çıkmadan önce bombanın patlamasını bekle.");
  return;
}
  if (
    won ||
    player.column !== EXIT.column ||
    player.row !== EXIT.row ||
    world[EXIT.row][EXIT.column].hp > 0
  ) {
    return;
  }

  won = true;
  ui.finish.hidden = true;
  message("Geçit açıldı! Yüzeye çıkıyoruz…");

  window.dispatchEvent(
    new CustomEvent("geogame:surface", {
      detail: { portalReached: true }
    })
  );
}
  function playDigSound(broken) {
    if (!soundEnabled) return;

    const AudioClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioClass) return;

    try {
      if (!audioContext) audioContext = new AudioClass();

      if (audioContext.state === "suspended") {
        audioContext.resume().catch(() => {});
      }

      const duration = broken ? 0.2 : 0.09;
      const buffer = audioContext.createBuffer(
        1,
        Math.ceil(audioContext.sampleRate * duration),
        audioContext.sampleRate
      );

      const samples = buffer.getChannelData(0);

      for (let i = 0; i < samples.length; i++) {
        samples[i] =
          (Math.random() * 2 - 1) *
          Math.pow(1 - i / samples.length, 2);
      }

      const source = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();

      source.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.value = broken ? 650 : 1100;
      gain.gain.value = 0.25;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      source.start();
    } catch {
      // Ses kullanılamasa da oyun devam eder.
    }
  }

  function dig() {
    if (won) return;
    const now = performance.now();

    if (now - swingStarted < 200) return;

    const target = targetInFront();

    if (!inside(target.column, target.row)) return;

    const tile = world[target.row][target.column];

    if (tile.hp === 0) {
      message("Önündeki kare açık. Kareye dokun veya yön düğmesiyle ilerle.");
      return;
    }

    swingStarted = now;
    tile.hp -= 1;

    const broken = tile.hp === 0;
    playDigSound(broken);

    const centerX = LEFT + target.column * SIZE + SIZE / 2;
    const centerY = TOP + target.row * SIZE + SIZE / 2;

    for (let i = 0; i < (broken ? 18 : 7); i++) {
      particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 180,
        vy: -40 - Math.random() * 100,
        born: now,
        size: 3 + Math.random() * 5
      });
    }

    if (
      broken &&
      target.column === EXIT.column &&
      target.row === EXIT.row
    ) {
      message("Toprağın altında bir geçit açıldı! Üzerine ilerle.");
    } else if (broken) {
      message("Blok kırıldı. Açılan kareye ilerleyebilirsin.");
    } else {
      message(`Kürek darbesi: ${3 - tile.hp}/3`);
    }
  }

  function drawTile(column, row) {
    const x = LEFT + column * SIZE;
    const y = TOP + row * SIZE;
    const tile = world[row][column];

    if (tile.hp === 0) {
      ctx.fillStyle = "#302632";
      ctx.fillRect(x, y, SIZE, SIZE);
      ctx.strokeStyle = "#493948";
      ctx.strokeRect(x + 0.5, y + 0.5, SIZE - 1, SIZE - 1);
      return;
    }

    const colors = ["#80563d", "#896044", "#76503b", "#906548"];
    ctx.fillStyle = colors[(column * 3 + row) % colors.length];
    ctx.fillRect(x, y, SIZE, SIZE);

    ctx.fillStyle = "#ffffff13";
    ctx.fillRect(x + 3, y + 3, SIZE - 6, 5);

    ctx.fillStyle = "#00000024";
    ctx.fillRect(x + 3, y + SIZE - 8, SIZE - 6, 5);

    ctx.strokeStyle = "#4c352c";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, SIZE - 2, SIZE - 2);

    ctx.fillStyle = "#d1aa7555";
    ctx.beginPath();
    ctx.ellipse(x + 19, y + 24, 7, 4, 0.4, 0, Math.PI * 2);
    ctx.ellipse(x + 51, y + 48, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();

    if (tile.hp < 3) {
      ctx.strokeStyle = "#39261f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 12);
      ctx.lineTo(x + 39, y + 28);
      ctx.lineTo(x + 28, y + 44);
      ctx.lineTo(x + 44, y + 61);

      if (tile.hp === 1) {
        ctx.moveTo(x + 39, y + 28);
        ctx.lineTo(x + 58, y + 17);
        ctx.moveTo(x + 28, y + 44);
        ctx.lineTo(x + 12, y + 54);
      }

      ctx.stroke();
    }
  }

  function drawLabels() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 17px Arial";
    ctx.fillStyle = "#e6c995";

    for (let column = 0; column < COLS; column++) {
      ctx.fillText(
        LETTERS[column],
        LEFT + column * SIZE + SIZE / 2,
        TOP - 22
      );
    }

    for (let row = 0; row < ROWS; row++) {
      ctx.fillText(
        row + 1,
        LEFT - 26,
        TOP + row * SIZE + SIZE / 2
      );
    }

    ctx.font = "13px Arial";
    ctx.fillStyle = "#b9a5c7";
    ctx.fillText("K ↑", 963, 38);
    ctx.fillText("10 m / kare", 880, 738);
  }

  function drawStart() {
    const x = LEFT + START.column * SIZE + SIZE / 2;
    const y = TOP + START.row * SIZE + SIZE / 2;

    ctx.fillStyle = "#5a4b56";
    ctx.beginPath();
    ctx.arc(x, y, 23, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#bba47e";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#efddb8";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("BAŞ", x, y);
  }

  function drawPortal(now) {
    // Toprağı kazılmadan geçit görünmez.
    if (world[EXIT.row][EXIT.column].hp > 0) return;

    const x = LEFT + EXIT.column * SIZE + SIZE / 2;
    const y = TOP + EXIT.row * SIZE + SIZE / 2;

    ctx.save();
    ctx.shadowColor = "#d29aff";
    ctx.shadowBlur = 18 + Math.sin(now / 250) * 5;
    ctx.strokeStyle = "#d9b1ff";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.ellipse(x, y, 19, 26, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#9b65ce55";
    ctx.fill();
    ctx.restore();
  }

  function drawMarker() {
    if (!marker) return;

    const x = LEFT + marker.column * SIZE;
    const y = TOP + marker.row * SIZE;

    ctx.save();
    ctx.strokeStyle = "#f4d58e";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(x + 7, y + 7, SIZE - 14, SIZE - 14);
    ctx.restore();
  }

  function drawPlayer(now) {
    const direction = directions[player.facing];
    const elapsed = now - swingStarted;
    const kick = elapsed >= 0 && elapsed < 200
      ? Math.sin((elapsed / 200) * Math.PI) * 7
      : 0;

    const x =
      LEFT + player.column * SIZE + SIZE / 2 + direction.dc * kick;
    const y =
      TOP + player.row * SIZE + SIZE / 2 + direction.dr * kick;

    ctx.fillStyle = "#00000055";
    ctx.beginPath();
    ctx.ellipse(x, y + 25, 21, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (imageReady) {
      // Birleşik görselin sol yarısındaki prens.
      ctx.drawImage(
        character,
        0,
        0,
        character.naturalWidth / 2,
        character.naturalHeight,
        x - 27,
        y - 36,
        54,
        72
      );
    } else {
      ctx.font = "34px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🤴", x, y);
    }

    // Baktığın yönü gösteren küçük altın ok.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(direction.dr, direction.dc));

    ctx.fillStyle = "#ffe0a0";
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.lineTo(27, -5);
    ctx.lineTo(27, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawParticles(now) {
    ctx.save();

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      const age = (now - particle.born) / 1000;

      if (age > 0.5) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = 1 - age / 0.5;
      ctx.fillStyle = "#d5ab79";

      ctx.fillRect(
        particle.x + particle.vx * age,
        particle.y + particle.vy * age + 250 * age * age,
        particle.size,
        particle.size
      );
    }

    ctx.restore();
  }

  function render(now) {
  if (placedBomb && now >= placedBomb.explodeAt) {
    explodeBomb(now);
  }

  // Buradan sonraki mevcut çizim kodların devam edecek.{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#211927";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLabels();

    for (let row = 0; row < ROWS; row++) {
      for (let column = 0; column < COLS; column++) {
        drawTile(column, row);
      }
    }

    drawStart();
    drawPortal(now);
    drawClueNotes(now);
    drawMarker();
    drawPlayer(now);
    drawParticles(now);
drawBomb(now);
    requestAnimationFrame(render);
  }

  window.addEventListener("keydown", (event) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button, input, textarea, select")
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const direction = keyDirections[key];

    if (!direction && event.code !== "Space") return;

    event.preventDefault();

    if (won) return;

    if (event.code === "Space") {
      if (!event.repeat) useTool();
      return;
    }

    const now = performance.now();

    // Tuş basılıyken kareler arasında kontrollü ilerle.
    if (!event.repeat || now - lastMove >= 140) {
      move(direction);
      lastMove = now;
    }
  });

canvas.addEventListener("click", (event) => {
  if (won) return;

  canvas.focus({ preventScroll: true });

  const rect = canvas.getBoundingClientRect();

  const x =
    (event.clientX - rect.left) * canvas.width / rect.width;

  const y =
    (event.clientY - rect.top) * canvas.height / rect.height;

  const column = Math.floor((x - LEFT) / SIZE);
  const row = Math.floor((y - TOP) / SIZE);

  if (!inside(column, row)) return;

  const columnDifference = column - player.column;
  const rowDifference = row - player.row;

  // Sadece doğrudan komşu dört kareye erişilebilir.
  const isNeighbor =
    Math.abs(columnDifference) + Math.abs(rowDifference) === 1;

  if (isNeighbor) {
    let direction;

    if (columnDifference === 1) direction = "east";
    else if (columnDifference === -1) direction = "west";
    else if (rowDifference === 1) direction = "south";
    else direction = "north";

    player.facing = direction;
    updateInfo();

    if (selectedTool === "bomb") {
  useTool();
} else if (world[row][column].hp > 0) {
  dig();
} else {
  move(direction);
}

    return;
  }

  if (columnDifference === 0 && rowDifference === 0) {
    message("Kazmak veya yürümek için yanındaki bir kareye dokun.");
    return;
  }

  // Uzak kareler hedef işaretlemek için kullanılmaya devam eder.
  if (marker?.column === column && marker?.row === row) {
    marker = null;
    message("Hedef işareti kaldırıldı.");
  } else {
    marker = { column, row };

    message(
      `${address(column, row)} hedef olarak işaretlendi. ` +
      "Oraya ulaşmak için yanındaki kareleri kazarak ilerle."
    );
  }

  updateInfo();
});
  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => {
      move(button.dataset.move);
      if (!won) canvas.focus({ preventScroll: true });
    });
  });

  document.getElementById("digButton").addEventListener("click", () => {
  useTool();
  if (!won) canvas.focus({ preventScroll: true });
});

  ui.sound.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    ui.sound.textContent = soundEnabled ? "Ses: Açık" : "Ses: Kapalı";
    ui.sound.setAttribute("aria-pressed", String(soundEnabled));
    canvas.focus();
  });

    ui.restart.addEventListener("click", () => {
    window.location.reload();
  });

  character.onload = () => {
    imageReady = true;
  };

  character.onerror = () => {
    message(
      "Karakter görseli bulunamadı; geçici prens simgesi kullanılıyor. " +
      "assets/characters/characters.png yolunu kontrol et."
    );
  };
// BÖLÜMLER ARASI GEÇİŞ
let diggingRound = 1;

window.addEventListener("geogame:return-to-dig", () => {
  // Sadece tamamlanmış bölümden yeni bölüme geçilebilir.
  if (!won) return;

  diggingRound += 1;

  // Yeni geçit başlangıç odasının dışında olsun.
  // Önceki geçidin bulunduğu kareyi tekrar seçme.
  const candidates = [];

  for (let row = 1; row <= 7; row++) {
    for (let column = 5; column <= 10; column++) {
      if (column === EXIT.column && row === EXIT.row) continue;
      if (row === START.row) continue;

      candidates.push({ column, row });
    }
  }

  const nextExit =
    candidates[Math.floor(Math.random() * candidates.length)];

  EXIT.column = nextExit.column;
  EXIT.row = nextExit.row;

  // Toprakları, karakteri ve kazı efektlerini sıfırla.
  resetGame();

  const eastSteps = EXIT.column - START.column;
  const verticalSteps = Math.abs(EXIT.row - START.row);
  const verticalDirection =
    EXIT.row < START.row ? "kuzeye" : "güneye";

  document.querySelector(".badge").textContent =
    `Bölüm ${String(diggingRound).padStart(2, "0")} · Kayıp Geçit`;

  document.querySelector(".note h2").textContent =
    "Yeni tünel, yeni bir yön tarifi";

  document.querySelector(".note p").innerHTML =
    `Başlangıç taşından <strong>${eastSteps} kare doğuya</strong>, ` +
    `ardından <strong>${verticalSteps} kare ${verticalDirection}</strong> ` +
    "ilerle. Gizli geçit o karede saklı.";

  const inventory = window.geoGameInventory || { bombs: 0 };

  message(
    `Yeni kazı alanına döndün! Çantanda ${inventory.bombs} bomba var. ` +
    "Yeni yön tarifini takip et."
  );

  canvas.scrollIntoView({
    behavior: "auto",
    block: "center"
  });

  canvas.focus({ preventScroll: true });
});
document.getElementById("selectShovel").addEventListener("click", () => {
  selectTool("shovel");
  if (!won) canvas.focus({ preventScroll: true });
});

document.getElementById("selectBomb").addEventListener("click", () => {
  selectTool("bomb");
  if (!won) canvas.focus({ preventScroll: true });
});

window.addEventListener("keydown", (event) => {
  if (
    won ||
    event.repeat ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  ) {
    return;
  }

  if (
    event.target instanceof HTMLElement &&
    event.target.closest("input, textarea, select, [contenteditable]")
  ) {
    return;
  }

  if (event.key === "1" || event.key === "2") {
    event.preventDefault();
    selectTool(event.key === "1" ? "shovel" : "bomb");
  }
});

// Yüzeyden dönünce kazanılan bombayı göster.
window.addEventListener("geogame:return-to-dig", () => {
  selectedTool = "shovel";
  updateEquipment();
});

updateEquipment();
  resetGame();
  character.src = "./assets/characters/characters.png";
  requestAnimationFrame(render);
})();
