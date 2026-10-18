'use strict';
/* Przeciwnik na turnieju: ten sam rycerz co gracz (ten sam rynsztunek), odwrócony w lewo,
   w barwach swojego herbu. W walce konnej rycerzy dzieli bariera (tilt). */
function drawRival(ctx, t) {
  const D = S.duel;
  if (!D) return;
  const wpn = weapon(), em = D.opp.emblem;
  const windup = D.foot && D.ai.st === 'windup'; // pieszo: miecz uniesiony do ciosu — znak, żeby uskoczyć
  const ang = wpn === 'sword' ? (D.oSwing ? swingAngle(D.oAt) : windup ? SW_A[1] : -1 + Math.sin(t * 2.5 + 1) * .05)
    : lanceAngle(t, LANCES[wpn], D.oLance);
  if (D.foot && D.oinv > 0 && (D.oinv * 12 | 0) % 2) return; // pieszo: mruga po trafieniu
  const ox = Math.round(D.ox) + (D.ohurtT < .15 ? 2 : 0); // po trafieniu odrzuca go do tyłu
  ctx.save();
  ctx.translate(2 * ox + 1, 0); ctx.scale(-1, 1); // lustro względem kolumny ox
  drawKnight(ctx, ox, Game.surf - (D.foot ? 0 : RIVAL_LANE), {
    gear: S.gear, walk: D.owalk, walking: D.foot ? D.omoving : D.phase === 'ride', mounted: mounted(), weapon: wpn, ang, hasWeapon: true,
    emblem: S.gear >= 5 ? em : null, // godło tylko wtedy, gdy gracz też je ma
    tunic: em.field, tunicD: mixHex(em.field, '#000000', .3), plume: em.ink
  });
  ctx.restore();
}

/* bariera między torami w walce konnej: belka na słupkach, przed przeciwnikiem, za graczem */
function drawTilt(ctx) {
  const y = Game.surf - 5, x0 = Math.round(Game.W * .12), x1 = Math.round(Game.W * .88);
  rect(ctx, x0, y, x1 - x0, 1, WOOD.L); rect(ctx, x0, y + 1, x1 - x0, 1, WOOD.D);
  for (let x = x0; x <= x1; x += 12) { rect(ctx, x, y - 1, 2, 5, WOOD.M); rect(ctx, x, y - 1, 2, 1, WOOD.L); }
}

const mixHex = (a, b, k) => {
  const c = mixc(C(a), C(b), k);
  return '#' + [c & 255, c >>> 8 & 255, c >>> 16 & 255].map(v => v.toString(16).padStart(2, '0')).join('');
};
