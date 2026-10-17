'use strict';
/* Koń pod rycerzem: tułów ze sprite'a, nogi animowane w marszu, czaprak w barwach godła */
function drawHorse(ctx, fx, fy, walk, walking, emblem) {
  const x0 = fx - 7, y0 = fy - 14;
  for (const [lx, ph] of HORSE_LEGS) {
    const s = walking ? Math.sin(walk * 1.4 + ph) : 0, o = Math.round(s), lift = s > .6 ? 1 : 0;
    rect(ctx, x0 + lx, y0 + 10, 1, 2, HORSE_PAL.d);
    rect(ctx, x0 + lx + o, y0 + 12 - lift, 1, 1, HORSE_PAL.d);
    rect(ctx, x0 + lx + o, y0 + 13 - lift, 1, 1, HORSE_PAL.m);
  }
  sprite(ctx, HORSE, x0, y0, HORSE_PAL, false);
  rect(ctx, x0 + 5, y0 + 5, 5, 3, emblem ? emblem.field : '#8a1a2a');
  rect(ctx, x0 + 5, y0 + 8, 5, 1, emblem ? emblem.ink : '#ffd23d');
}
