"use strict";

(() => {
  function setupCinematics() {
    const closingCopy = {
      tr: {
        introTitle: "Yolculuk şimdi başlıyor…",
        introText: "Uzak bir kalede seni bekliyor. Notların izini sür, gizli geçitleri bul ve ona ulaş.",
        introButton: "Yolculuğa başla →",
        endingTitle: "Sonunda yeniden bir aradasınız.",
        endingText: "Toprağın altından, uzak ülkelerin içinden… Bulduğun her ipucu seni ona bir adım daha yaklaştırdı.",
        endingButton: "Sonuçları gör →"
      },
      en: {
        introTitle: "Your journey begins…",
        introText: "She is waiting in a distant castle. Follow the notes, uncover hidden passages, and find your way to her.",
        introButton: "Begin the journey →",
        endingTitle: "Together, at last.",
        endingText: "Beneath the earth, across distant lands… Every clue brought you one step closer to her.",
        endingButton: "View results →"
      }
    };
    const style = document.createElement("style");

    style.textContent = `
      .cinematic-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #080b12;
        color: #fff;
      }

      .cinematic-overlay { opacity: 1; transition: opacity 700ms ease; }
      .cinematic-overlay.is-leaving { opacity: 0; pointer-events: none; }
      .cinematic-postlude {
        position: absolute; inset: 0; z-index: 3;
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 22px; overflow-y: auto;
        padding: 90px 24px 40px; text-align: center;
        background: radial-gradient(ellipse at center, #221b32eb, #080b12fa);
        opacity: 0; transition: opacity 900ms ease;
      }
      .cinematic-postlude.is-visible { opacity: 1; }
      .cinematic-postlude[hidden] { display: none !important; }
      .cinematic-postlude h2 { max-width: 760px; margin: 0; color: #edcc94;
        font: 500 clamp(30px, 6vw, 58px)/1.15 Georgia, serif; }
      .cinematic-postlude p { max-width: 570px; margin: 0; color: #eee5f3;
        font: 400 clamp(17px, 3vw, 22px)/1.7 system-ui, sans-serif; }
      .cinematic-postlude button { margin-top: 14px; }
      @media (prefers-reduced-motion: reduce) {
        .cinematic-overlay, .cinematic-postlude { transition: none; }
      }
      .cinematic-overlay[hidden] {
        display: none !important;
      }

      .cinematic-video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #080b12;
      }

      .cinematic-actions {
        position: absolute;
        top: calc(76px + env(safe-area-inset-top));
        right: max(18px, env(safe-area-inset-right));
        display: flex;
        gap: 10px;
        z-index: 2;
      }

      .cinematic-button {
        padding: 12px 18px;
        min-height: 44px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 14px;
        background: rgba(15, 20, 32, 0.85);
        color: white;
        font: inherit;
        cursor: pointer;
      }

      .cinematic-button:focus-visible {
        outline: 3px solid #f3d49b;
        outline-offset: 4px;
      }

      .cinematic-prompt {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        padding: 28px;
        text-align: center;
        background: rgba(8, 11, 18, 0.7);
      }

      .cinematic-actions[hidden],
      .cinematic-prompt[hidden] {
        display: none !important;
      }

      .cinematic-prompt p {
        max-width: 480px;
        font-size: clamp(18px, 4vw, 26px);
        line-height: 1.5;
      }

      .cinematic-start {
        padding: 16px 30px;
        border: none;
        background: #edcc94;
        color: #252130;
        font-weight: bold;
        font-size: 18px;
      }
    `;

    document.head.appendChild(style);

    const overlay = document.createElement("section");
    overlay.className = "cinematic-overlay";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Hikâye videosu");

    overlay.innerHTML = `
      <video
        class="cinematic-video"
        playsinline
        preload="metadata"
        aria-label="Prens ve prensesin hikâyesi">
      </video>

      <div class="cinematic-prompt">
        <p class="cinematic-message" role="status"></p>

        <button
          type="button"
          class="cinematic-button cinematic-start">
          ▶ Maceraya başla
        </button>
      </div>

      <section class="cinematic-postlude" data-no-translate hidden aria-labelledby="cinematicClosingTitle">
        <h2 id="cinematicClosingTitle" tabindex="-1"></h2>
        <p class="cinematic-closing-text"></p>
        <button type="button" class="cinematic-button cinematic-start cinematic-continue"></button>
      </section>
      <div class="cinematic-actions">
        <button
          type="button"
          class="cinematic-button cinematic-sound"
          aria-label="Sesi kapat">
          🔊 Ses açık
        </button>

        <button
          type="button"
          class="cinematic-button cinematic-skip">
          Atla →
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    const video = overlay.querySelector("video");
    const prompt = overlay.querySelector(".cinematic-prompt");
    const message = overlay.querySelector(".cinematic-message");
    const startButton = overlay.querySelector(".cinematic-start");
    const skipButton = overlay.querySelector(".cinematic-skip");
    const soundButton = overlay.querySelector(".cinematic-sound");

    const postlude = overlay.querySelector(".cinematic-postlude");
    const closingTitle = overlay.querySelector("#cinematicClosingTitle");
    const closingText = overlay.querySelector(".cinematic-closing-text");
    const continueButton = overlay.querySelector(".cinematic-continue");
    const actions = overlay.querySelector(".cinematic-actions");
    let phase = "idle";
    let currentIsEnding = false;
    let closeTimer = null;
    let active = false;

    function updateClosingCopy() {
      const language = window.geoGameI18n?.language === "en" ? "en" : "tr";
      const copy = closingCopy[language];
      const prefix = currentIsEnding ? "ending" : "intro";
      postlude.lang = language;
      closingTitle.textContent = copy[prefix + "Title"];
      closingText.textContent = copy[prefix + "Text"];
      continueButton.textContent = copy[prefix + "Button"];
    }
    window.addEventListener("geogame:language", updateClosingCopy);

    function showPostlude() {
      if (!active || phase === "postlude" || phase === "closing") return;
      phase = "postlude";
      video.pause();
      prompt.hidden = true;
      actions.hidden = true;
      updateClosingCopy();
      postlude.hidden = false;
      // Keep the final video frame under the fading card.
      void postlude.offsetWidth;
      postlude.classList.add("is-visible");
      continueButton.focus();
    }
    function closeWithFade() {
      if (!active || phase === "closing") return;
      phase = "closing";
      continueButton.disabled = true;
      overlay.classList.add("is-leaving");
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      closeTimer = setTimeout(finishVideo, reduced ? 0 : 700);
    }
    let previousOverflow = "";
    let previousFocus = null;
    let endingShown = false;
    let playbackId = 0;

    // Video açıkken arka plandaki oyunun klavye kontrollerini durdur.
    function blockGameKeys(event) {
      if (!active) return;

      if (event.type === "keydown" && event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (phase === "postlude") closeWithFade();
        else if (phase !== "closing") showPostlude();
        return;
      }

      // Klavye odağını video penceresinin içinde tut.
      if (event.type === "keydown" && event.key === "Tab") {
        const buttons = [document.getElementById("languageSelect"), ...overlay.querySelectorAll("button")]
          .filter(button => button.getClientRects().length > 0);

        if (buttons.length) {
          const index = buttons.indexOf(document.activeElement);
          const next = event.shiftKey
            ? (index <= 0 ? buttons.length - 1 : index - 1)
            : (index + 1) % buttons.length;

          event.preventDefault();
          buttons[next].focus();
        }
      }

      // Düğmelerin Enter/Space ile çalışmasına izin verir;
      // olayı game.js dinleyicilerine ulaştırmaz.
      event.stopImmediatePropagation();
    }

    window.addEventListener("keydown", blockGameKeys, true);
    window.addEventListener("keyup", blockGameKeys, true);

    function updateSoundButton() {
      soundButton.textContent = video.muted
        ? "🔇 Ses kapalı"
        : "🔊 Ses açık";

      soundButton.setAttribute(
        "aria-label",
        video.muted ? "Sesi aç" : "Sesi kapat"
      );
    }

    async function playVideo() {
      if (!active || phase !== "video") return;
      const currentId = playbackId;
      prompt.hidden = true;

      try {
        await video.play();

        if (!active || phase !== "video" || currentId !== playbackId) return;
        skipButton.focus();
      } catch {
        if (!active || phase !== "video" || currentId !== playbackId) return;

        prompt.hidden = false;
        message.textContent =
          "Videoyu başlatmak için aşağıdaki düğmeye dokun.";
        startButton.textContent = "▶ Videoyu oynat";
        startButton.focus();
      }
    }

    function openVideo(path, isEnding) {
      if (active) finishVideo();

      playbackId += 1;
      phase = "video";
      currentIsEnding = isEnding;
      postlude.hidden = true;
      postlude.classList.remove("is-visible");
      overlay.classList.remove("is-leaving");
      actions.hidden = false;
      continueButton.disabled = false;
      active = true;
      window.geoGameCinematicPlaying = true;

      previousOverflow = document.body.style.overflow;
      previousFocus = document.activeElement;

      document.body.style.overflow = "hidden";
      overlay.hidden = false;

      prompt.hidden = false;
      startButton.hidden = false;

      message.textContent = isEnding
        ? "Sonunda birbirinizi buldunuz… 💛"
        : "Her büyük macera, küçük bir keşifle başlar…";

      startButton.textContent = isEnding
        ? "▶ Kavuşmayı izle"
        : "▶ Maceraya başla";

      skipButton.textContent = isEnding
        ? "Sonuca geç →"
        : "Hikâyeyi atla →";

      video.defaultPlaybackRate = 1;
      video.playbackRate = 1;
      video.src = path;
      video.load();

      updateSoundButton();
      startButton.focus();

      // Final, oyuncunun doğru cevap tıklamasından açıldığı için
      // hemen oynatmayı dene. Engellenirse oynat düğmesi görünür.
      if (isEnding) playVideo();
    }

    function finishVideo() {
      if (!active) return;

      clearTimeout(closeTimer);
      phase = "idle";
      active = false;
      playbackId += 1;
      window.geoGameCinematicPlaying = false;

      video.pause();
      video.removeAttribute("src");
      video.load();

      overlay.hidden = true;
      document.body.style.overflow = previousOverflow;

      if (previousFocus && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    }

    startButton.addEventListener("click", playVideo);
    skipButton.addEventListener("click", showPostlude);
    video.addEventListener("ended", showPostlude);
    continueButton.addEventListener("click", closeWithFade);

    soundButton.addEventListener("click", () => {
      video.muted = !video.muted;
      updateSoundButton();
    });

    video.addEventListener("error", () => {
      if (!active || phase !== "video") return;

      prompt.hidden = false;
      startButton.hidden = true;

      message.textContent =
        "Video açılamadı. Dosya adını ve video biçimini kontrol et. " +
        "Atla düğmesiyle devam edebilirsin.";

      skipButton.focus();
    });

    window.addEventListener("geogame:ending", () => {
      if (endingShown) return;

      endingShown = true;
      openVideo("./assets/videos/ending.mp4", true);
    });

    // İlk açılışta sesli video için oyuncunun başlatmasına izin ver.
    openVideo("./assets/videos/intro.mp4", false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupCinematics, {
      once: true
    });
  } else {
    setupCinematics();
  }
})();