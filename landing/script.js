/* Download detection */
const DOWNLOADS = {
  mac: 'https://github.com/ryanvincecastillo/Ressa-Noice-Detector-App/releases/latest/download/Ressa%20Noise%20Detector%20App-0.1.0-arm64.dmg',
  win: 'https://github.com/ryanvincecastillo/Ressa-Noice-Detector-App/releases/latest/download/Ressa%20Noise%20Detector%20App%20Setup%200.1.0.exe'
};

const ICONS = {
  apple: '<svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
  windows: '<svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12V6.75l6-1.32v6.48L3 12zm6.73-.07l8.27-.9V3.71l-8.27 1.28v6.94zm8.27 1.07l-8.27.9v6.81l8.27 1.28V13zm-15 .64L3 17.25l6 1.32v-6.5l-6 .57z"/></svg>'
};

const downloadBtn = document.getElementById('download-btn');
const downloadAlt = document.getElementById('download-alt');
const downloadNote = document.getElementById('download-note');

const setupDownloads = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isMac = ua.includes('mac');
  const isWindows = ua.includes('win');

  if (!downloadBtn || !downloadAlt || !downloadNote) {
    return;
  }

  if (isMac) {
    downloadBtn.href = DOWNLOADS.mac;
    downloadBtn.innerHTML = ICONS.apple + ' Download for macOS (.dmg)';
    downloadAlt.href = DOWNLOADS.win;
    downloadAlt.innerHTML = ICONS.windows + ' Need Windows (.exe)?';
    downloadNote.textContent = 'Detected: macOS';
    return;
  }

  if (isWindows) {
    downloadBtn.href = DOWNLOADS.win;
    downloadBtn.innerHTML = ICONS.windows + ' Download for Windows (.exe)';
    downloadAlt.href = DOWNLOADS.mac;
    downloadAlt.innerHTML = ICONS.apple + ' Need macOS (.dmg)?';
    downloadNote.textContent = 'Detected: Windows';
    return;
  }

  downloadBtn.href = DOWNLOADS.win;
  downloadBtn.innerHTML = ICONS.windows + ' Download Windows (.exe)';
  downloadAlt.href = DOWNLOADS.mac;
  downloadAlt.innerHTML = ICONS.apple + ' Download macOS (.dmg)';
  downloadNote.textContent = 'Platform not detected. Choose your installer.';
};

setupDownloads();

/* Scroll reveal with IntersectionObserver */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

/* Sticky header shadow on scroll */
const header = document.getElementById('site-header');

if (header) {
  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
