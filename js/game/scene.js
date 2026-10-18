'use strict';
/* Sceny gry: trening (start) -> turniej (po zaliczeniu treningu) -> miasteczko (po wygranej lidze). Przejście = ściemnienie i rozjaśnienie. */
const SCENE_TAG = { training: 'TRENING RYCERZA', tournament: 'TURNIEJ RYCERSKI', town: 'MIASTECZKO' };
const FADE_T = .7; // czas ściemniania i rozjaśniania (s)

function setScene(name) {
  if (Game.scene === name && Game.lySky) return;
  Game.scene = name;
  $('#gameTag').textContent = SCENE_TAG[name];
  if (Game.W) buildScenery();
}

/* onSwap wywoływane w najciemniejszym momencie, po zbudowaniu nowej sceny */
function startTransition(to, onSwap) {
  if (!Game.trans) Game.trans = { to, t: 0, onSwap };
}
function updateTransition(dt) {
  const tr = Game.trans;
  if (!tr) return;
  const before = tr.t < FADE_T;
  tr.t += dt;
  if (before && tr.t >= FADE_T) { setScene(tr.to); if (tr.onSwap) tr.onSwap(); }
  if (tr.t >= 2 * FADE_T) Game.trans = null;
}
/* czarna zasłona w kilku pikselowych krokach */
function drawTransition(ctx) {
  const tr = Game.trans;
  if (!tr) return;
  const a = 1 - Math.abs(tr.t - FADE_T) / FADE_T;
  ctx.fillStyle = `rgba(5,6,15,${Math.round(a * 5) / 5})`;
  ctx.fillRect(0, 0, Game.W, Game.H);
}
