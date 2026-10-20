// Tag filter for the projects page.
// Chips are <button data-tag="slug"> and cards carry data-tags="slug-a slug-b".
// The active tag is mirrored to ?tag= so a filtered view can be shared.

(() => {
  const chips = Array.from(document.querySelectorAll('[data-filter] .chip'));
  const grid = document.querySelector('[data-project-grid]');
  const cards = grid ? Array.from(grid.querySelectorAll('.card')) : [];
  const count = document.querySelector('[data-count]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!chips.length || !grid) return;

  const matches = (card, tag) => tag === 'all' || card.dataset.tags.split(' ').includes(tag);

  function apply(tag, animate = true) {
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.tag === tag)));
    grid.classList.toggle('is-filtered', tag !== 'all');

    let shown = 0;
    cards.forEach((card) => {
      const show = matches(card, tag);
      const wasHidden = card.classList.contains('is-hidden');
      card.classList.toggle('is-hidden', !show);
      if (show) shown += 1;
      if (show && (wasHidden || animate) && !reduceMotion) {
        card.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
          { duration: 360, delay: shown * 40, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }
        );
      }
    });
    if (count) count.textContent = shown;

    const url = new URL(window.location.href);
    if (tag === 'all') url.searchParams.delete('tag');
    else url.searchParams.set('tag', tag);
    history.replaceState(null, '', url);
  }

  chips.forEach((chip) => chip.addEventListener('click', () => apply(chip.dataset.tag)));

  const initial = new URLSearchParams(window.location.search).get('tag');
  apply(chips.some((chip) => chip.dataset.tag === initial) ? initial : 'all', false);
})();
