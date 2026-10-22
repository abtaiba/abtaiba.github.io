// Window controls on every panel, like a desktop:
// orange closes the panel, lime minimises it to its title bar, blue maximises it.
// On the home, about and contact pages closed panels go to a dock on the left;
// closing a project or blog post goes back to its index; other closed panels
// come back on the next page load (everything is reachable from the nav).
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

  // On pages marked data-dock, a closed panel leaves a tab in a dock on the left;
  // clicking the tab brings the panel back.
  const dockable = !!document.querySelector('[data-dock]');
  let dock = null;

  function reopen(panel, tab) {
    tab.remove();
    if (!dock.children.length) dock.hidden = true;
    panel.classList.remove('is-closed');
    if (reduceMotion) return;
    panel.classList.add('is-opening');
    panel.addEventListener('animationend', () => panel.classList.remove('is-opening'), { once: true });
  }

  function addToDock(panel) {
    if (!dock) {
      dock = document.createElement('nav');
      dock.className = 'win-dock';
      dock.setAttribute('aria-label', 'Closed windows');
      document.body.append(dock);
    }
    const name = panel.querySelector('.panel-file')?.textContent.trim() || 'window';
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'win-dock-tab';
    tab.title = `Reopen ${name}`;
    tab.innerHTML = '<span class="win-dock-icon" aria-hidden="true"></span><span class="win-dock-name"></span>';
    tab.lastChild.textContent = name;
    tab.addEventListener('click', () => reopen(panel, tab));
    dock.append(tab);
    dock.hidden = false;
  }

  function close(panel) {
    if (panel.classList.contains('is-closing')) return;
    if (maxed === panel) restore();
    // Closing a project or post goes back to its index (the breadcrumb link)
    const back = panel.matches('.detail') && document.querySelector('.detail-crumbs .back');
    const done = () => {
      if (back) return location.assign(back.href);
      panel.classList.remove('is-closing');
      panel.classList.add('is-closed');
      if (dockable) addToDock(panel);
    };
    if (reduceMotion) return done();
    panel.classList.remove('is-opening');
    panel.classList.add('is-closing');
    const onEnd = (event) => {
      if (event.target !== panel) return;
      panel.removeEventListener('animationend', onEnd);
      done();
    };
    panel.addEventListener('animationend', onEnd);
  }

  function minimise(panel) {
    if (maxed === panel) restore();
    panel.classList.toggle('is-min');
  }

  const actions = [close, minimise, maximise];
  const titles = ['Close', 'Minimise', 'Maximise'];

  document.querySelectorAll('.panel .lights').forEach((lights) => {
    const panel = lights.closest('.panel');
    const lightEls = [...lights.querySelectorAll('i')];
    lightEls.forEach((light, n) => { if (titles[n]) light.title = titles[n]; });
    // Cards are links: a click anywhere on the controls (gaps included) must not open the card
    lights.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const action = actions[lightEls.indexOf(event.target.closest('i'))];
      if (action) action(panel);
    });
    // ...nor a stray click on a card while it is closing
    panel.addEventListener('click', (event) => {
      if (panel.classList.contains('is-closing')) event.preventDefault();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') restore();
  });
})();
