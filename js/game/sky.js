'use strict';
/* Dzienne niebo nad turniejem: gradient, słońce, wzgórza, zamek w oddali, chmury, ptaki */

/* jeden wiersz nieba z wzgórzami (piksele bufora, pieczone raz przy zmianie rozmiaru) */
function drawSkyRow(buf, row, wy) {
  const { W, back, sun } = Game;
  const tt = clamp(wy / back, 0, .999) * (TC.SKY.length - 1), i0 = tt | 0, fr = tt - i0;
  for (let x = 0; x < W; x++) {
    const bay = BAYER[(wy & 3) * 4 + (x & 3)];
    let c;
    if (wy >= Game.near[x]) c = wy === Game.near[x] ? TC.HILL_NEAR_HI : TC.HILL_NEAR;
    else if (wy >= Game.far[x]) c = wy === Game.far[x] ? TC.HILL_FAR_HI : TC.HILL_FAR;
    else {
      const dx = x - sun.x, dy = wy - sun.y, d = Math.sqrt(dx * dx + dy * dy);
      if (d <= sun.r) c = d > sun.r - 1.2 ? TC.SUN2 : TC.SUN;
      else {
        c = bay < fr ? TC.SKY[i0 + 1] : TC.SKY[i0];
        if (d < sun.r + 8 && (1 - (d - sun.r) / 8) * .6 > bay) c = mixc(c, TC.SUN_GLOW, .3);
      }
    }
    buf[row + x] = c;
  }
}

/* zamek na wzgórzu w oddali (zamglone barwy) */
function drawCastle(ctx, cx, base) {
  const K = CASTLE_C, r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  const merlons = (x, y, w, c) => { for (let i = 0; i < w; i += 2) r(x + i, y - 1, 1, 1, c); };
  // mur kurtynowy
  r(cx - 16, base - 9, 32, 9, K.wall); merlons(cx - 16, base - 9, 32, K.wall);
  r(cx - 2, base - 4, 4, 4, K.win); r(cx - 1, base - 5, 2, 1, K.win); // brama
  // donżon
  r(cx - 5, base - 20, 10, 11, K.wall); r(cx + 3, base - 20, 2, 11, K.dark); merlons(cx - 5, base - 20, 10, K.wall);
  r(cx - 1, base - 16, 1, 2, K.win); r(cx + 1, base - 16, 1, 2, K.win);
  // wieże narożne ze spiczastymi dachami
  for (const [tx, h] of [[cx - 18, 15], [cx + 14, 13]]) {
    r(tx, base - h, 5, h, K.wall); r(tx + 4, base - h, 1, h, K.dark); r(tx + 2, base - h + 4, 1, 2, K.win);
    for (let i = 0; i < 4; i++) r(tx + i * .5 | 0, base - h - 1 - i, 5 - (i * 1.2 | 0), 1, K.roof);
    r(tx + 2, base - h - 7, 1, 3, K.dark); r(tx + 3, base - h - 7, 2, 1, K.flag);
  }
}

function updateSky(dt) {
  for (const c of Game.clouds) { c.x += c.sp * dt; if (c.x > Game.W + 5) c.x = -c.len - 5; }
  for (const b of Game.birds) { b.x += b.sp * dt; if (b.x > Game.W + 10) b.x = -10; }
}

function drawClouds(ctx, t) {
  for (const c of Game.clouds) {
    const x = Math.round(c.x), y = c.y, L = c.len;
    rect(ctx, x + 1, y + 2, L - 2, 1, CLOUD_C.S);
    rect(ctx, x, y, L, 2, CLOUD_C.W);
    rect(ctx, x + 2, y - 1, L - 4, 1, CLOUD_C.W);
    rect(ctx, x + (L * .25 | 0), y - 2, Math.max(2, L * .3 | 0), 1, CLOUD_C.W);
    rect(ctx, x + (L * .55 | 0), y - 2, Math.max(2, L * .2 | 0), 1, CLOUD_C.W);
  }
  for (let i = 0; i < Game.birds.length; i++) {
    const b = Game.birds[i];
    sprite(ctx, BIRD[((t * 5 + i * .7) | 0) % 2], Math.round(b.x), Math.round(b.y + Math.sin(t * 1.3 + i) * 2), { k: '#2a3048' }, false);
  }
}
