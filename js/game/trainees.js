'use strict';
/* Rycerze ćwiczący w tle placu: przechadzają się, walczą w parach, biją w drewniany pal, jeżdżą konno.
   Rysowani co klatkę na osobny canvas i nakładani przygaszeni (TRAINEE_FILTER). */

/* rysuje fn() odbite lustrzanie względem kolumny x (postać zwrócona w lewo) */
function flipX(ctx, x, fn) {
  ctx.save(); ctx.translate(2 * x + 1, 0); ctx.scale(-1, 1); fn(); ctx.restore();
}
/* wygląd: giermek (tarcza), pół zbroi (hełm) albo pełna zbroja z godłem */
function traineeLook() {
  const gear = [1, 2, 5, 5][Math.random() * 4 | 0];
  return { gear, emblem: gear >= 5 ? randomEmblem() : null };
}

/* x0..x1 = wolna część placu (bez namiotów); B = skraj placu przy płocie */
function makeTrainees(x0, x1, B) {
  const w = x1 - x0, list = [], at = f => Math.round(x0 + w * f);
  list.push({ kind: 'ride', x: x0 + Math.random() * w, y: B + 3, dir: 1, sp: 14, walk: 0, ...traineeLook(), gear: 7 });
  list.push({ kind: 'spar', x: at(w > 150 ? .42 : .55), y: B + 6, ph: Math.random() * SPAR_T, a: traineeLook(), b: traineeLook(), hitT: 9 });
  if (w > 150) list.push({ kind: 'pell', x: at(.78), y: B + 5, ph: Math.random() * PELL_T, hitT: 9, ...traineeLook() });
  for (let i = 0; i < (w > 150 ? 2 : 1); i++) {
    list.push({ kind: 'walk', x: x0 + Math.random() * w, y: B + 8 + i, dir: Math.random() < .5 ? -1 : 1, sp: 7 + Math.random() * 4,
      walk: 0, pause: 0, ...traineeLook() });
  }
  list.sort((a, b) => a.y - b.y); // od najdalszego
  return { x0, x1, list };
}

function updateTrainees(dt, T) {
  for (const p of T.list) {
    if (p.kind === 'walk' || p.kind === 'ride') {
      if (p.pause > 0) { p.pause -= dt; continue; }
      p.x += p.dir * p.sp * dt; p.walk += p.sp * dt * .45;
      const lo = p.kind === 'ride' ? -30 : T.x0, hi = p.kind === 'ride' ? Game.W + 30 : T.x1;
      if (p.x < lo || p.x > hi) { // zawraca, piechur chwilę odpoczywa
        p.x = clamp(p.x, lo, hi); p.dir *= -1;
        if (p.kind === 'walk') p.pause = 1 + Math.random() * 2;
      }
    } else { // walka i pal: moment uderzenia = błysk / kołysanie
      const per = p.kind === 'spar' ? SPAR_T : PELL_T, prev = p.ph;
      p.ph = (p.ph + dt) % per; p.hitT += dt;
      const hit = STRIKE_AT * SWING_T * (p.kind === 'spar' ? .9 : 1), strikes = p.kind === 'spar' ? [hit, per * .5 + hit] : [hit];
      for (const s of strikes) if (prev < s && p.ph >= s) p.hitT = 0;
    }
  }
}

/* zamach zajmuje połowę okresu (od phase), reszta to miecz w gardzie */
function drillAngle(ph, from, len) {
  const u = (ph - from) / len;
  return u >= 0 && u < 1 ? swingAngle(u) : -1;
}

function drawTrainees(ctx, t, T) {
  for (const p of T.list) {
    const fx = Math.round(p.x);
    if (p.kind === 'walk' || p.kind === 'ride') {
      const ride = p.kind === 'ride', moving = p.pause <= 0;
      const K = { gear: p.gear, walk: p.walk, walking: moving, mounted: ride, weapon: ride ? 'lance' : 'sword',
        ang: ride ? LANCE_UP : .9, hasWeapon: true, emblem: p.emblem };
      if (p.dir < 0) flipX(ctx, fx, () => drawKnight(ctx, fx, p.y, K)); else drawKnight(ctx, fx, p.y, K);
    } else if (p.kind === 'spar') {
      const half = SPAR_T * .5, len = SWING_T * .9;
      const base = { walk: 0, walking: false, mounted: false, weapon: 'sword', hasWeapon: true };
      drawKnight(ctx, fx - 7, p.y, { ...base, ...p.a, ang: drillAngle(p.ph, 0, len) });
      flipX(ctx, fx + 7, () => drawKnight(ctx, fx + 7, p.y, { ...base, ...p.b, ang: drillAngle(p.ph, half, len) }));
      if (p.hitT < .12) { rect(ctx, fx - 1, p.y - 14, 3, 1, '#fff3a0'); rect(ctx, fx, p.y - 15, 1, 3, '#ffffff'); } // szczęk mieczy
    } else { // pal treningowy (pell) chwieje się po uderzeniu
      const px = fx + 3 + Math.round(SWORD_LEN[p.gear >= 4 ? 1 : 0] * .75), sway = p.hitT < .8 ? Math.round(Math.exp(-5 * p.hitT) * Math.sin(p.hitT * 30) * 1.4) : 0;
      rect(ctx, px - 1, p.y - 1, 4, 1, WOOD.K);
      rect(ctx, px + sway, p.y - 14, 2, 13, WOOD.M); rect(ctx, px + 1 + sway, p.y - 14, 1, 13, WOOD.D);
      rect(ctx, px + sway, p.y - 15, 2, 1, WOOD.L);
      drawKnight(ctx, fx, p.y, { gear: p.gear, walk: 0, walking: false, mounted: false, weapon: 'sword', hasWeapon: true,
        emblem: p.emblem, ang: drillAngle(p.ph, 0, SWING_T) });
      if (p.hitT < .25) for (let i = 0; i < 3; i++) rect(ctx, px - 1 + i * 2, p.y - 11 - i - Math.round(p.hitT * 20), 1, 1, '#c8a070'); // drzazgi
    }
  }
}
