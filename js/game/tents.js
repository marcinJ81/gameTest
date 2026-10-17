'use strict';
/* Namioty rycerzy (okrągłe pawilony w pasy) z proporcami, tarczą na stojaku i kopią opartą o namiot */

/* pawilon (warstwa statyczna); zwraca czubek masztu na proporzec */
function drawTent(ctx, tn) {
  const { cx, w, cols } = tn, B = Game.back, hw = w >> 1, r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  const bodyH = Math.round(w * .5), bt = B - bodyH, roofH = Math.round(w * .42), shadow = 'rgba(0,0,0,.2)';
  // linki odciągowe
  pline(ctx, cx - hw - 1, bt - 1, cx - hw - 5, B, '#d8c8a0'); pline(ctx, cx + hw + 1, bt - 1, cx + hw + 5, B, '#d8c8a0');
  r(cx - hw - 5, B - 1, 1, 2, WOOD.K); r(cx + hw + 5, B - 1, 1, 2, WOOD.K);
  // ściana w pionowe pasy
  for (let x = cx - hw; x <= cx + hw; x++) r(x, bt, 1, bodyH, ((x - cx + hw + 1) / 3 | 0) % 2 ? cols[1] : cols[0]);
  r(cx + hw - 2, bt, 3, bodyH, shadow);
  // wejście: odchylone poły, ciemne wnętrze
  const eh = bodyH - 2;
  for (let j = 0; j < eh; j++) {
    const ew = Math.round(j * .45), y = B - eh + j;
    r(cx - ew, y, 2 * ew + 1, 1, '#2a1a14');
    r(cx - ew - 1, y, 1, 1, cols[1]); r(cx + ew + 1, y, 1, 1, cols[1]);
  }
  // stożkowy dach z pasami zbiegającymi się do szczytu
  const rb = bt - 2;
  for (let j = 0; j < roofH; j++) {
    const y = rb - roofH + j, rw = Math.max(1, Math.round((hw + 1) * (j + 1) / roofH));
    for (let x = cx - rw; x <= cx + rw; x++) r(x, y, 1, 1, Math.floor((x - cx) / rw * (hw / 3) + 20) % 2 ? cols[1] : cols[0]);
    r(cx + Math.max(1, rw - 2), y, Math.min(3, rw), 1, shadow);
  }
  // lambrekin z ząbkami
  for (let x = cx - hw - 1; x <= cx + hw + 1; x++) {
    r(x, rb, 1, 2, cols[1]);
    if (((x - cx) & 3) < 2) r(x, rb + 2, 1, 1, cols[0]);
  }
  // maszt
  const pt = rb - roofH - 6;
  r(cx, pt, 1, 6, WOOD.K); r(cx, pt - 1, 1, 1, '#ffd23d');
  // stojak z tarczą rycerza (po zewnętrznej stronie) i kopia oparta o namiot
  const sx = tn.side < 0 ? cx + hw + 3 : cx - hw - 3;
  r(sx, B - 9, 1, 9, WOOD.K);
  r(sx - 2, B - 10, 5, 4, cols[0]); r(sx, B - 10, 2, 4, cols[1]); r(sx - 1, B - 6, 3, 1, cols[0]); r(sx, B - 5, 1, 1, cols[1]);
  const lx = tn.side < 0 ? cx - hw + 2 : cx + hw - 2;
  pline(ctx, lx, B - 1, lx - tn.side * 4, B - 24, cols[0]);
  pline(ctx, lx + 1, B - 1, lx + 1 - tn.side * 4, B - 24, cols[1]);
  r(lx - tn.side * 4, B - 26, 1, 2, '#eef3ff');
  tn.pole = { x: cx + 1, y: pt };
}

/* powiewający proporzec: (x,y) = miejsce przy drzewcu, wiatr wieje w prawo */
function drawPennant(ctx, t, x, y, len, c1, c2, h0 = 2) {
  for (let i = 0; i < len; i++) {
    const k = i / len, dy = Math.round(Math.sin(t * 6 - i * .7) * k * 1.5);
    const h = Math.max(1, Math.round(h0 * (1 - k * .7)));
    rect(ctx, x + i, y + dy, 1, h, i < len * .5 ? c1 : c2);
  }
}
