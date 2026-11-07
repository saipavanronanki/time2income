(() => {
  const init = () => {
    const root = document.getElementById('accountQuickMenu');
    const trigger = document.getElementById('accountMenuTrigger');
    const panel = document.getElementById('accountMenuPanel');
    if (!root || !trigger || !panel) return;

    const setOpen = (open) => {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      root.classList.toggle('is-open', open);
    };

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      setOpen(panel.hidden);
    });

    panel.addEventListener('click', (event) => event.stopPropagation());
    document.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        trigger.focus();
      }
    });

    // Close after navigation/action buttons are used, but leave searchable
    // language/currency/location controls interactive while the panel is open.
    const walletShortcut = document.getElementById('accountMenuWalletShortcut');
    const walletButton = document.getElementById('walletOpenBtn');
    if (walletShortcut && walletButton) {
      walletShortcut.addEventListener('click', () => {
        setOpen(false);
        walletButton.click();
      });
    }

    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
