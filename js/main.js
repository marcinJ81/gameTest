'use strict';
/* =========================================================
   Pętla główna
   ========================================================= */
function resizeAll() {
  resizeGame();
}
let rzTimer = 0;
new ResizeObserver(() => { clearTimeout(rzTimer); rzTimer = setTimeout(resizeAll, 60); }).observe(document.body);

resizeAll(); // najpierw rozmiar (resetGame potrzebuje Game.W)
resetGame();
let last = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const t = now / 1000;
  updateGame(dt);
  renderGame(t);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
