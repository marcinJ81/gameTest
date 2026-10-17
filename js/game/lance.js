'use strict';
/* Lanca i kopia: opuszczanie klawiszem X, ograniczony czas trzymania, samo podnoszenie */
const newLance = () => ({ st: 'up', k: 0, hold: 0, rest: 0 }); // k: 0 = uniesiona, 1 = opuszczona

function lowerLance() {
  if (S.over || !S.started || weapon() === 'sword' || (S.duel && S.duel.phase !== 'ride')) return;
  if (S.lance.st === 'rest') { S.lance.rest = 0; toast('ZA WCZEŚNIE! RYCERZ ODPOCZYWA'); return; }
  if (S.lance.st !== 'up') return; // trzeba poczekać, aż rycerz ją podniesie i odsapnie
  S.lance.st = 'lowering';
  sfxLower();
}
function updateLance(dt, spec, l = S.lance) {
  if (l.st === 'lowering') { l.k += dt / spec.lower; if (l.k >= 1) { l.k = 1; l.st = 'down'; l.hold = 0; } }
  else if (l.st === 'down') { l.hold += dt; if (l.hold >= spec.hold) l.st = 'raising'; }
  else if (l.st === 'raising') { l.k -= dt / spec.raise; if (l.k <= 0) { l.k = 0; l.st = 'rest'; l.rest = 0; } }
  else if (l.st === 'rest') { l.rest += dt; if (l.rest >= spec.rest) l.st = 'up'; }
}
function lanceAngle(t, spec, l = S.lance) {
  let a = lerp(LANCE_UP, LANCE_DOWN, fade(l.k));
  if (l.st === 'down' && l.hold > spec.hold * .5) a += Math.sin(t * 40) * .03 * (l.hold / spec.hold); // ręka drży
  return a;
}
/* dłoń trzyma broń pod pachą; y = wysokość rycerza (na koniu) */
function lanceGeom(fx, y, ang, L) {
  const c = Math.cos(ang), s = Math.sin(ang), hx = fx + 2, hy = y - 10;
  return { hx, hy, tx: hx + c * L, ty: hy + s * L, c, s };
}
function drawLance(ctx, g, L, kind) {
  const kop = kind === 'kopia', n = L + 3;
  for (let i = 0; i <= n; i++) {
    const d = i - 3, x = Math.round(g.hx + g.c * d), y = Math.round(g.hy + g.s * d);
    let col = kop ? (((i >> 1) & 1) ? LANCE_C.RED : LANCE_C.WHITE) : LANCE_C.WOOD;
    if (i >= n - 1) col = kop ? LANCE_C.CORONEL : LANCE_C.TIP;
    ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1);
  }
  // osłona dłoni (wamplet) — przy kopii większa
  ctx.fillStyle = kop ? LANCE_C.VAMP_K : LANCE_C.VAMP;
  const w = kop ? 2 : 1, vx = g.hx + g.c * 2, vy = g.hy + g.s * 2;
  for (let j = -w; j <= w; j++) ctx.fillRect(Math.round(vx - g.s * j), Math.round(vy + g.c * j), 1, 1);
}
