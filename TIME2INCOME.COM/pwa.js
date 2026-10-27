'use strict';

(() => {
  const previewMode = new URLSearchParams(location.search).has('app-preview');
  if (previewMode) return;

  const liveUrl = `${location.origin}/`;
  const qr = document.getElementById('websiteQr');
  const qrFallback = document.getElementById('qrFallback');
  const installButton = document.getElementById('installAppBtn');
  const refreshButton = document.getElementById('refreshAppBtn');
  const installStatus = document.getElementById('installStatus');
  const installGuides = document.querySelector('.install-guides');
  const previewWindow = document.getElementById('appPreviewFrame');
  const nativeInstallEventSupported = 'onbeforeinstallprompt' in window;
  let installPrompt = null;
  let registration = null;
  let updateRequested = false;
  let updatePending = false;
  let hadController = Boolean(navigator.serviceWorker?.controller);

  if (qr) {
    qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(liveUrl)}`;
    qr.addEventListener('error', () => {
      qr.hidden = true;
      if (qrFallback) qrFallback.hidden = false;
    }, { once: true });
  }

  if (previewWindow) {
    const frame = document.createElement('iframe');
    frame.className = 'app-preview-iframe';
    frame.title = 'Live TIME2INCOME mobile website preview';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    const previewPath = location.protocol === 'file:' ? location.pathname : '/';
    frame.src = `${previewPath}?app-preview=1#top`;
    previewWindow.append(frame);
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  if (isStandalone && installStatus) {
    installStatus.textContent = 'TIME2INCOME is installed. Website updates appear automatically when you reopen it online.';
  } else if (isIos && installStatus) {
    installStatus.textContent = 'On iPhone or iPad, open this site in Safari and use Share > Add to Home Screen. The App Store version is not available yet.';
  } else if (isAndroid && installStatus) {
    installStatus.textContent = 'Install TIME2INCOME as a website app using this button or your browser menu. The Google Play version is not available yet.';
  } else if (installStatus) {
    installStatus.textContent = 'Install TIME2INCOME as a website app from a supported browser. Native store apps are not available yet.';
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  installButton?.addEventListener('click', async () => {
    if (!installPrompt) {
      if (installGuides) installGuides.open = true;
      if (installStatus) installStatus.textContent = 'Choose Install app from your browser menu if the install prompt is unavailable.';
      return;
    }
    const promptEvent = installPrompt;
    installPrompt = null;
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (installStatus) {
        installStatus.textContent = choice.outcome === 'accepted'
          ? 'Installation accepted by the browser.'
          : 'Installation was not completed. You can try again from your browser menu.';
      }
    } catch (error) {
      console.error('PWA installation prompt failed:', error);
      if (installStatus) installStatus.textContent = 'The install prompt could not open. Choose Install app from your browser menu instead.';
    }
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    if (installStatus) installStatus.textContent = 'TIME2INCOME is installed. Website updates appear automatically when you reopen it online.';
    if (installButton) installButton.hidden = true;
  });

  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    if (installStatus && !isIos && !isStandalone) {
      installStatus.textContent = 'PWA installation requires a secure context (HTTPS or localhost) and a supported browser.';
    }
    return;
  }

  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
    registration = reg;
    if (nativeInstallEventSupported && !isIos && !isStandalone && installButton) {
      installButton.hidden = false;
      if (installStatus && !installPrompt) {
        installStatus.textContent = isAndroid
          ? 'Install using this button when available, or choose Install app from your browser menu. The Google Play version is not available yet.'
          : 'Install using this button when available, or choose Install app from your browser menu. Native store apps are not available yet.';
      }
    }
    const showUpdate = () => {
      if (registration.waiting && navigator.serviceWorker.controller && refreshButton) {
        refreshButton.hidden = false;
        if (installStatus) installStatus.textContent = 'A website update is ready to install.';
      }
    };
    showUpdate();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', showUpdate);
    });
    registration.update().catch(() => {});
  }).catch(() => {
    if (installStatus) installStatus.textContent = 'App installation is unavailable in this browser right now.';
  });

  refreshButton?.addEventListener('click', () => {
    updateRequested = true;
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else if (updatePending) {
      location.reload();
    }
  });

  const applyUpdateWhenSafe = () => {
    if (!updatePending || updateRequested) return;
    const activeElement = document.activeElement;
    const editing = activeElement?.matches('input, textarea, select, [contenteditable="true"]');
    if (document.querySelector('dialog[open]') || editing) {
      if (refreshButton) refreshButton.hidden = false;
      if (installStatus) installStatus.textContent = 'A website update is ready. Finish or close the current form to update automatically.';
      return;
    }
    updateRequested = true;
    location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (updateRequested) return;
    if (!hadController) {
      hadController = true;
      return;
    }
    updatePending = true;
    applyUpdateWhenSafe();
  });

  document.addEventListener('close', applyUpdateWhenSafe, true);
  document.addEventListener('focusout', applyUpdateWhenSafe);
})();