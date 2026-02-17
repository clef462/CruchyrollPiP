// Content script: finds the best candidate <video> and toggles PiP.
// This runs on all sites and only acts when explicitly triggered
// via the extension context menu.

(() => {
  "use strict";

  function pickBestVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    if (!videos.length) return null;

    const scored = videos
      .map((v) => {
        const r = v.getBoundingClientRect();
        const area = Math.max(0, r.width) * Math.max(0, r.height);
        const hasSrc = !!v.currentSrc;
        const playing = !v.paused && !v.ended && v.readyState >= 2;
        const score =
          (playing ? 1_000_000 : 0) +
          (hasSrc ? 10_000 : 0) +
          (v.readyState || 0) * 100 +
          area;
        return { v, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0].v;
  }

  function unblockPiP(video) {
    try {
      if (!(video instanceof HTMLVideoElement)) return;

      if (video.hasAttribute("disablepictureinpicture")) {
        video.removeAttribute("disablepictureinpicture");
      }

      if (video.disablePictureInPicture) {
        video.disablePictureInPicture = false;
      }
    } catch {
      // ignore
    }
  }

  async function togglePiP() {
    const video = pickBestVideo();
    if (!video) return;

    unblockPiP(video);

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.warn(
        "[PiP] request failed:",
        e?.name,
        e?.message,
        e
      );
    }
  }

  // Listen for messages from the service worker
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "PIP_TOGGLE") {
      togglePiP();
    }
  });

  // Defensive: keep removing PiP blocks if the site re-applies them
  const mo = new MutationObserver(() => {
    document.querySelectorAll("video").forEach(unblockPiP);
  });

  mo.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["disablepictureinpicture"]
  });

  // Initial pass
  document.querySelectorAll("video").forEach(unblockPiP);
})();
