'use strict';
/* Loża honorowa na podwyższeniu: baldachim, trony, książę i księżna, heroldowie z trąbami */

/* konstrukcja loży (warstwa statyczna) */
function drawRoyalBox(ctx, R) {
  const { x0, x1, floor, top } = R, B = Game.back, w = x1 - x0, cx = R.cx, r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  // tylna kotara w drobne złote kropki
  r(x0 + 1, top + 3, w - 2, floor - top - 3, ROYAL.clothD);
  for (let y = top + 6; y < floor - 1; y += 4) for (let x = x0 + 3 + ((y >> 2) & 1) * 2; x < x1 - 2; x += 4) r(x, y, 1, 1, ROYAL.goldD);
  // słupy baldachimu
  r(x0, top, 2, floor - top, ROYAL.gold); r(x1 - 2, top, 2, floor - top, ROYAL.gold);
  r(x0 + 1, top, 1, floor - top, ROYAL.goldD); r(x1 - 1, top, 1, floor - top, ROYAL.goldD);
  // dach baldachimu: pasy czerwień/złoto zbiegające się do szczytu
  const roofH = 6;
  for (let j = 0; j < roofH; j++) {
    const hw = Math.round(3 + (w / 2 + 1 - 3) * (j + 1) / roofH), y = top - roofH + j;
    for (let x = cx - hw; x <= cx + hw; x++) {
      const k = Math.floor((x - cx) / Math.max(1, hw) * 4 + 8);
      r(x, y, 1, 1, k % 2 ? ROYAL.gold : ROYAL.canopy);
    }
  }
  r(cx, top - roofH - 6, 1, 6, WOOD.K); r(cx, top - roofH - 7, 1, 1, ROYAL.gold); // drzewce sztandaru
  // lambrekin z ząbkami i złotą frędzlą
  for (let x = x0 - 1; x <= x1; x++) {
    r(x, top, 1, 2, ROYAL.canopy);
    if (((x - x0) & 3) < 2) r(x, top + 2, 1, 1, ROYAL.canopyD);
    if (((x - x0) & 3) === 0) r(x, top + 3, 1, 1, ROYAL.gold);
  }
  r(x0 - 1, top + 1, w + 2, 1, ROYAL.gold);
  // trony
  for (const tx of R.thrones) sprite(ctx, THRONE, tx, floor - THRONE.length, THRONE_PAL, false);
  // podest: błękitna płachta w złote lilie, frędzle, herb pośrodku
  r(x0 - 2, floor - 1, w + 4, 1, WOOD.L);
  r(x0 - 1, floor, w + 2, B - floor, ROYAL.cloth);
  for (let y = floor + 3; y < B - 2; y += 4) for (let x = x0 + 2 + ((y >> 2) & 1) * 3; x < x1 - 1; x += 6) {
    r(x, y, 1, 1, ROYAL.gold); r(x - 1, y + 1, 3, 1, ROYAL.gold);
  }
  r(x0 - 1, floor, w + 2, 1, ROYAL.gold);
  for (let x = x0 - 1; x <= x1; x += 2) r(x, B - 1, 1, 1, ROYAL.gold);
  r(x0 - 1, floor, 1, B - floor, ROYAL.goldD); r(x1, floor, 1, B - floor, ROYAL.goldD);
  const aw = ROYAL_ARMS[0].length;
  r(cx - (aw >> 1) - 1, floor + 1, aw + 2, ROYAL_ARMS.length + 1, ROYAL.cloth);
  sprite(ctx, ROYAL_ARMS, cx - (aw >> 1), floor + 2, ROYAL_ARMS_PAL, false);
  // heroldowie na skrajach podestu (gdy jest miejsce)
  if (R.heralds) for (const [hx, dir] of [[x0 + 4, -1], [x1 - 5, 1]]) drawHerald(ctx, hx, floor, dir);
}

function drawHerald(ctx, x, base, dir) {
  const r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  r(x - 1, base - 3, 1, 3, ROYAL.cloth); r(x, base - 3, 2, 3, ROYAL.gold); // tabard dzielony
  r(x - 1, base - 3, 3, 1, ROYAL.gold); r(x - 1, base - 1, 1, 1, ROYAL.cloth);
  r(x - 1, base - 5, 2, 2, '#e8c9a8'); r(x - 1, base - 6, 2, 1, ROYAL.canopy);
  // trąba z proporcem
  const mx = dir < 0 ? x - 2 : x + 1;
  pline(ctx, mx, base - 4, mx + dir * 5, base - 8, ROYAL.gold);
  r(mx + dir * 5 + (dir < 0 ? -1 : 0), base - 9, 2, 1, ROYAL.gold);
  r(mx + dir * 2 + (dir < 0 ? -2 : 0), base - 5, 3, 2, ROYAL.canopy);
  r(mx + dir * 2 + (dir < 0 ? -1 : 1) - (dir < 0 ? 1 : 0), base - 3, 1, 1, ROYAL.canopy);
}

/* para książęca (rysowana co klatkę: księżna co chwilę macha chusteczką) */
function drawRoyals(ctx, t, R) {
  const [pt, qt] = R.thrones, f = R.floor;
  sprite(ctx, PRINCE, pt + 1, f - PRINCE.length, PRINCE_PAL, false);
  rect(ctx, pt, f - 9, 1, 6, ROYAL.gold); rect(ctx, pt - 1, f - 10, 3, 1, ROYAL.gold); // berło
  sprite(ctx, PRINCESS, qt + 1, f - PRINCESS.length, PRINCESS_PAL, false);
  if ((t % 4) < 1.6) { // macha chusteczką
    const up = ((t * 6) | 0) % 2, hx = qt + 8, hy = f - 7;
    rect(ctx, hx, hy - 2, 1, 2, PRINCESS_PAL.s);
    rect(ctx, hx + (up ? 0 : 1), hy - 4, 2, up ? 2 : 1, '#ffffff');
  }
  // sztandar książęcy na szczycie baldachimu
  drawPennant(ctx, t, R.cx + 1, R.top - 12, 11, ROYAL.cloth, ROYAL.gold, 3);
}
