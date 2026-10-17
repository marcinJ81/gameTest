'use strict';
/* Las za placem treningowym (dwa rzędy drzew liściastych i świerków) oraz rekwizyty placu:
   płot, stojak z bronią, snopki siana. Wszystko rysowane raz do warstwy statycznej. */

/* rozmieszczenie drzew: tylny rząd gęsto i niżej, przedni rzadziej i wyżej */
function makeForest(W, B) {
  const trees = [];
  for (const [row, step, h0, hv, base] of [['far', 6, 14, 10, B - 4], ['near', 10, 20, 14, B - 1]]) {
    for (let x = -4 + Math.random() * step; x < W + 6; x += step * (.7 + Math.random() * .6)) {
      trees.push({ row, x: Math.round(x), base, h: Math.round(h0 + Math.random() * hv), pine: Math.random() < .45, seed: Math.random() * 1e4 | 0 });
    }
  }
  return trees;
}

function drawForest(ctx, trees) {
  for (const tr of trees) {
    if (tr.pine) drawPine(ctx, tr.x, tr.base, tr.h, tr.row === 'far' ? FOREST.far : FOREST.pine);
    else drawLeafy(ctx, tr.x, tr.base, tr.h, FOREST[tr.row], tr.seed);
  }
}

/* świerk: trzy piętra gałęzi, światło z lewej */
function drawPine(ctx, x, base, h, pal) {
  rect(ctx, x, base - 3, 1, 3, pal.trunk);
  const top = base - h, tier = Math.max(3, (h - 3) / 3);
  for (let y = top; y < base - 2; y++) {
    const j = y - top, hw = Math.round(j * .28 + (j % tier) * .45);
    for (let dx = -hw; dx <= hw; dx++) {
      const c = dx === -hw && dx < 0 ? pal.hi : dx > hw * .3 ? pal.dk : dx < -hw * .4 ? pal.hi : pal.mid;
      rect(ctx, x + dx, y, 1, 1, c);
    }
  }
}

/* drzewo liściaste: pień i postrzępiona, okrągła korona */
function drawLeafy(ctx, x, base, h, pal, seed) {
  const r = Math.max(4, Math.round(h * .32)), th = h - 2 * r, cy = base - th - r;
  rect(ctx, x, base - th - 2, 2, th + 2, pal.trunk);
  for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 2; dx++) {
    const d = Math.hypot(dx - .5, dy) + (hash2(dx + seed, dy) - .5) * 1.8;
    if (d > r) continue;
    const l = (dx + dy) / r + (hash2(dx + 3, dy + seed) - .5) * .5;
    rect(ctx, x + dx, cy + dy, 1, 1, l < -.55 ? pal.hi : l > .45 ? pal.dk : pal.mid);
  }
}

/* płot z żerdzi na skraju placu */
function drawFence(ctx, x0, x1, B) {
  rect(ctx, x0, B - 4, x1 - x0, 1, WOOD.M); rect(ctx, x0, B - 2, x1 - x0, 1, WOOD.D);
  for (let x = x0; x < x1; x += 7) { rect(ctx, x, B - 5, 1, 5, WOOD.K); rect(ctx, x, B - 6, 1, 1, WOOD.D); }
}

/* stojak z mieczami i włóczniami */
function drawWeaponRack(ctx, x, B) {
  rect(ctx, x, B - 9, 1, 9, WOOD.K); rect(ctx, x + 9, B - 9, 1, 9, WOOD.K);
  rect(ctx, x, B - 8, 10, 1, WOOD.M); rect(ctx, x, B - 3, 10, 1, WOOD.M);
  for (let i = 0; i < 3; i++) { // miecze ostrzem w dół
    const sx = x + 2 + i * 2;
    rect(ctx, sx, B - 10, 1, 1, KC.GUARD); rect(ctx, sx - 1, B - 9, 3, 1, KC.OLD_GUARD); rect(ctx, sx, B - 8, 1, 6, KC.STEEL);
  }
  rect(ctx, x + 8, B - 15, 1, 14, WOOD.L); rect(ctx, x + 8, B - 17, 1, 2, KC.STEEL_HI); // włócznia
}

/* snopek siana (cel do ćwiczeń i pasza dla koni) */
function drawHay(ctx, x, B) {
  rect(ctx, x, B - 5, 8, 5, HAY.M); rect(ctx, x + 1, B - 6, 6, 1, HAY.L);
  rect(ctx, x, B - 5, 8, 1, HAY.L); rect(ctx, x + 6, B - 5, 2, 5, HAY.D);
  rect(ctx, x + 2, B - 5, 1, 5, HAY.K); rect(ctx, x + 5, B - 5, 1, 5, HAY.K);
  rect(ctx, x - 1, B - 1, 1, 1, HAY.L); rect(ctx, x + 8, B - 2, 1, 1, HAY.L);
}
