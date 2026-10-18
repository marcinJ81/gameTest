'use strict';
/* Klatka gry: tło (trening / turniej / miasteczko), kukła albo przeciwnik, rycerz, cząstki, zdobyte przedmioty, przejście między scenami */
function renderGame(t) {
  const { surf } = Game, ctx = Game.ctx;
  drawScenery(ctx, t);
  if (Game.scene === 'training') { // kukła stoi tylko na placu treningowym
    drawAssist(ctx, t);
    drawDummy(ctx, dummyX(), surf, S.dummyHitT);
  }
  const foot = onFoot();
  if (S.duel) { // walka: przeciwnik na dalszym torze, w walce konnej za barierą
    drawAssist(ctx, t);
    drawRival(ctx, t);
    if (mounted()) drawTilt(ctx);
  }
  if (Game.scene === 'town') drawSignpost(ctx, t); // za rycerzem
  // rycerz (pieszo mruga chwilę po trafieniu)
  const fx = Math.round(S.x) - (S.duel && S.duel.hurtT < .15 ? 2 : 0); // trafiony: odrzut do tyłu
  const wpn = weapon();
  const town = Game.scene === 'town';
  const K = {
    gear: S.gear, walk: S.walk, walking: foot ? S.duel.moving : town ? S.moving : riding(), mounted: mounted(), weapon: wpn,
    ang: knightAngle(t), hasWeapon: true, emblem: S.emblem
  };
  if (foot && S.inv > 0 && (S.inv * 12 | 0) % 2) { /* mruga po trafieniu */ }
  else if (town && S.face < 0) flipX(ctx, fx, () => drawKnight(ctx, fx, surf, K)); // w miasteczku chodzi w obie strony
  else drawKnight(ctx, fx, surf, K);
  drawAssistCue(ctx);
  // cząstki
  for (const p of S.parts) rect(ctx, Math.round(p.x), Math.round(p.y), p.s, p.s, p.c);
  // zdobyte przedmioty wyskakują nad rycerzem
  for (const p of S.pops) {
    if (p.t > 1.3 && ((p.t * 10) | 0) % 2) continue;
    const x = Math.round(p.x), y = Math.round(p.y - Math.min(1, p.t * 1.6) * 10);
    if (p.key === 'shield' || p.key === 'emblem') drawShield(ctx, x, y, p.key === 'emblem' ? p.emblem : null);
    else sprite(ctx, ITEM_SPR[p.key], x + 1, y, ITEM_PAL, false);
  }
  drawTransition(ctx);
}
