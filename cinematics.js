"use strict";

(() => {
  function setupCinematics() {
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
        top: max(18px, env(safe-area-inset-top));
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

    let active = false;
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
        finishVideo();
        return;
      }

      // Klavye odağını video penceresinin içinde tut.
      if (event.type === "keydown" && event.key === "Tab") {
        const buttons = [...overlay.querySelectorAll("button")]
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
      const currentId = playbackId;
      prompt.hidden = true;

      try {
        await video.play();

        if (!active || currentId !== playbackId) return;
        skipButton.focus();
      } catch {
        if (!active || currentId !== playbackId) return;

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
    skipButton.addEventListener("click", finishVideo);
    video.addEventListener("ended", finishVideo);

    soundButton.addEventListener("click", () => {
      video.muted = !video.muted;
      updateSoundButton();
    });

    video.addEventListener("error", () => {
      if (!active) return;

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