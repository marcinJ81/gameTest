'use strict';
/* Okno z pytaniem TAK / NIE na środku pola gry (półprzezroczysta zasłona).
   Strzałki ← → zmieniają wybór, ENTER zatwierdza (klik / dotyk na przycisku też).
   onPick(yes) dostaje wybór po zamknięciu okna. */
function makeDialog(id, onPick) {
  const d = { el: $(id), opts: [...document.querySelectorAll(id + ' .opt')], sel: 0, open: false };
  d.select = i => {
    if (d.opts[i].disabled) return;
    d.sel = i;
    d.opts.forEach((o, k) => o.classList.toggle('on', k === i));
  };
  d.move = step => {
    const i = clamp(d.sel + step, 0, d.opts.length - 1);
    if (i !== d.sel && !d.opts[i].disabled) { d.select(i); sfxSwing(); }
  };
  d.show = i => { d.open = true; d.el.hidden = false; d.select(i); };
  d.close = () => { d.open = false; d.el.hidden = true; };
  d.confirm = () => {
    if (!d.open) return;
    d.close();
    onPick(d.opts[d.sel].dataset.v === 'yes');
  };
  /* klawisze w trakcie pytania; zwraca true, gdy klawisz został obsłużony */
  d.key = e => {
    if (!d.open) return false;
    if (/^[rRmM]$/.test(e.key)) return false; // reset i dźwięk działają dalej
    if (e.key === 'ArrowLeft') d.move(-1);
    else if (e.key === 'ArrowRight') d.move(1);
    else if (e.key === 'Enter') { if (!e.repeat) d.confirm(); }
    if (/^(Arrow|Enter$| $)/.test(e.key)) e.preventDefault(); // bez przewijania strony i bez kliku w przycisk z fokusem
    return true; // spacja, X itp. nie działają, dopóki okno jest otwarte
  };
  d.opts.forEach((o, i) => {
    o.addEventListener('click', e => { e.stopPropagation(); d.select(i); d.confirm(); });
    o.addEventListener('pointerenter', () => d.select(i));
  });
  return d;
}
