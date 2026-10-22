// Window controls on every panel, like a desktop:
// orange closes the panel, lime minimises it to its title bar, blue maximises it.
// Closed panels come back on the next page load (everything is reachable from the nav).
// Esc or a click outside a maximised panel restores it.

(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let backdrop = null;
  let maxed = null;

  function restore() {
    if (!maxed) return;
    maxed.classList.remove('is-max');
    root.classList.remove('has-max');
    backdrop.hidden = true;
    maxed = null;
  }

  function maximise(panel) {
    if (maxed === panel) return restore();
    restore();
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'win-backdrop';
      backdrop.addEventListener('click', restore);
      document.body.append(backdrop);
    }
    panel.classList.remove('is-min');
    panel.classList.add('is-max');
    root.classList.add('has-max');
    backdrop.hidden = false;
    maxed = panel;
  }

  function close(panel) {
    if (maxed === panel) restore();
    if (reduceMotion) return panel.classList.add('is-closed');
    panel.classList.add('is-closing');
    panel.addEventListener('animationend', () => panel.classList.add('is-closed'), { once: true });
  }

  function minimise(panel) {
    if (maxed === panel) restore();
    panel.classList.toggle('is-min');
  }

  const actions = [close, minimise, maximise];
  const titles = ['Close', 'Minimise', 'Maximise'];

  document.querySelectorAll('.panel .lights').forEach((lights) => {
    const panel = lights.closest('.panel');
    lights.querySelectorAll('i').forEach((light, n) => {
      if (!actions[n]) return;
      light.title = titles[n];
      // Cards are links: a click on a control must not open the card
      light.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions[n](panel);
      });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') restore();
  });
})();
