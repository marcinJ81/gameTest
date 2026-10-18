'use strict';
/* Rycerz: ciało, rynsztunek zależny od zdobytych przedmiotów, tarcza z godłem, miecz, jazda konno */

/* geometria ręki z mieczem: bark -> dłoń -> czubek ostrza */
function swordGeom(fx, fy, ang, L) {
  const c = Math.cos(ang), s = Math.sin(ang), sx = fx + 1, sy = fy - 12;
  const hx = sx + c * 3, hy = sy + s * 3;
  return { sx, sy, hx, hy, tx: hx + c * L, ty: hy + s * L, c, s };
}
function swingAngle(p) {
  let i = 0; while (i < SW_T.length - 2 && p > SW_T[i + 1]) i++;
  const u = fade(clamp((p - SW_T[i]) / (SW_T[i + 1] - SW_T[i]), 0, 1));
  return lerp(SW_A[i], SW_A[i + 1], u);
}

/* losowe, symetryczne godło 5x5 na tarczy; rnd = własny generator (stałe herby rycerzy z tabeli) */
function randomEmblem(rnd = Math.random) {
  const field = EMBLEM_FIELDS[rnd() * EMBLEM_FIELDS.length | 0];
  const inks = EMBLEM_INKS.filter(c => c !== field);
  const ink = inks[rnd() * inks.length | 0];
  let px;
  do {
    px = [];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) {
      if (rnd() < (x === 2 ? .6 : .45)) { px.push([x, y]); if (x < 2) px.push([4 - x, y]); }
    }
  } while (px.length < 7 || px.length > 18);
  return { field, ink, px };
}
function drawShield(ctx, x, y, emblem) {
  sprite(ctx, SHIELD, x, y, emblem ? { k: SHIELD_PAL.k, f: emblem.field } : SHIELD_PAL, false);
  if (!emblem) return;
  ctx.fillStyle = emblem.ink;
  for (const [ex, ey] of emblem.px) ctx.fillRect(x + 1 + ex, y + 1 + ey, 1, 1);
}

function drawSword(ctx, g, L, good) {
  const { hx, hy, c, s } = g;
  pline(ctx, hx + c, hy + s, hx + c * L, hy + s * L, good ? KC.BLADE : KC.OLD_BLADE);
  ctx.fillStyle = good ? KC.GUARD : KC.OLD_GUARD;
  ctx.fillRect(Math.round(hx + c - s), Math.round(hy + s + c), 1, 1);
  ctx.fillRect(Math.round(hx + c + s), Math.round(hy + s - c), 1, 1);
  ctx.fillRect(Math.round(hx - c), Math.round(hy - s), 1, 1); // głowica
  if (good) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(hx + c * L), Math.round(hy + s * L), 1, 1); }
}

/* K = { gear, walk, walking, ang, hasWeapon, weapon, mounted, emblem, guard, [tunic, tunicD, plume] } — barwy opcjonalne (przeciwnik);
   guard 0-1: blok (block.js) — tarcza przesuwa się z boku przed rycerza i zasłania go razem z ręką z mieczem */
function drawKnight(ctx, fx, fy, K) {
  const r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  const shield = K.gear >= 1, helm = K.gear >= 2, armor = K.gear >= 3, good = K.gear >= 4;
  const body = armor ? KC.STEEL : K.tunic || KC.TUNIC, bodyD = armor ? KC.STEEL_D : K.tunicD || KC.TUNIC_D;
  const plume = K.plume || KC.PLUME;
  const leg = armor ? KC.STEEL_D : KC.PANTS, legB = armor ? '#5d6675' : '#3a2d20';
  const ld = K.walking ? Math.round(Math.sin(K.walk) * 1.5) : 0;
  const bob = K.walking && Math.abs(Math.cos(K.walk)) > .7 ? 1 : 0;
  const y = K.mounted ? riderY(fy) - bob : fy - bob;
  if (K.mounted) { // koń + noga w strzemieniu
    drawHorse(ctx, fx, fy, K.walk, K.walking, K.emblem);
    r(fx, y - 6, 2, 3, leg); r(fx, y - 3, 3, 1, KC.BOOT);
  } else { // nogi (tylna ciemniejsza)
    r(fx - 2 - ld, fy - 6, 2, 4, legB);
    r(fx - 2 - ld, fy - 2, 3, 2, KC.BOOT);
    r(fx + ld, fy - 6, 2, 4, leg); r(fx + ld, fy - 2, 3, 2, KC.BOOT);
  }
  // tułów + pas
  r(fx - 3, y - 13, 6, 6, body); r(fx - 3, y - 13, 1, 6, bodyD);
  if (armor) { r(fx - 1, y - 12, 1, 3, KC.STEEL_HI); r(fx - 3, y - 13, 6, 1, KC.STEEL_HI); }
  r(fx - 3, y - 7, 6, 1, KC.BELT); r(fx, y - 7, 1, 1, KC.BUCKLE);
  // głowa / hełm
  if (helm) {
    r(fx - 2, y - 18, 5, 5, KC.STEEL); r(fx - 2, y - 18, 1, 5, KC.STEEL_D); r(fx - 1, y - 19, 3, 1, KC.STEEL);
    r(fx, y - 16, 3, 1, KC.VISOR); r(fx + 1, y - 14, 1, 1, KC.STEEL_D);
    r(fx - 1, y - 20, 2, 1, plume); r(fx - 3, y - 21, 3, 1, plume); r(fx - 4, y - 20, 1, 1, plume);
  } else {
    r(fx - 2, y - 17, 4, 4, KC.SKIN); r(fx - 2, y - 18, 4, 1, KC.HAIR); r(fx - 2, y - 17, 1, 2, KC.HAIR);
    r(fx + 1, y - 16, 1, 1, KC.EYE);
  }
  // tarcza na lewym ramieniu (w bloku rysowana na końcu, przed rycerzem)
  const gk = K.guard || 0;
  if (shield && !gk) drawShield(ctx, fx - 7, y - 15, K.emblem);
  const hand = armor ? KC.STEEL_D : KC.SKIN;
  if (K.weapon === 'sword') { // ręka z mieczem
    const g = swordGeom(fx, y, K.ang, SWORD_LEN[good ? 1 : 0]);
    pline(ctx, g.sx, g.sy, g.hx, g.hy, body);
    r(Math.round(g.hx), Math.round(g.hy), 1, 1, hand);
    if (K.hasWeapon) drawSword(ctx, g, SWORD_LEN[good ? 1 : 0], good);
    if (shield && gk) drawShield(ctx, Math.round(lerp(fx - 7, fx + 1, fade(gk))), y - 15 - Math.round(gk), K.emblem);
    return;
  }
  // miecz przy boku, ręka trzyma lancę / kopię pod pachą
  r(fx - 2, y - 8, 1, 1, KC.GUARD); r(fx - 3, y - 7, 1, 5, KC.BELT);
  const g = lanceGeom(fx, y, K.ang, LANCES[K.weapon].len);
  pline(ctx, fx + 1, y - 12, g.hx, g.hy, body);
  if (K.hasWeapon) drawLance(ctx, g, LANCES[K.weapon].len, K.weapon);
  r(g.hx, g.hy, 1, 1, hand);
}
const riderY = fy => fy - 3; // rycerz siedzący na koniu
