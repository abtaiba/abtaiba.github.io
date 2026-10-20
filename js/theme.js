// Light / dark toggle. The saved choice is applied in <head> before paint;
// this wires up the button and remembers the choice for next time.

(() => {
  const root = document.documentElement;
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;

  const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = () => root.dataset.theme || (systemDark() ? 'dark' : 'light');

  function label() {
    const next = current() === 'dark' ? 'light' : 'dark';
    button.querySelector('.tt-text').textContent = next === 'dark' ? 'Dark' : 'Light';
    button.setAttribute('aria-label', `Switch to ${next} mode`);
  }

  button.addEventListener('click', () => {
    const next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode: still works for this page */ }
    label();
  });

  label();
})();
