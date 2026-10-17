'use strict';
/* Trybuny po obu stronach loży: drewniana konstrukcja z markizą, tłum z chorągiewkami, barierka z płachtami */
const STAND_ROWS = 3, STAND_STEP = 5;

function makeStand(x0, x1, cols) {
  const st = { x0, x1, cols, people: [] };
  for (let i = STAND_ROWS - 1; i >= 0; i--) { // od tylnego rzędu do przedniego
    const y = Game.back - 3 - i * STAND_STEP;
    for (let x = x0 + 2 + (i & 1) * 2; x < x1 - 2; x += 4) {
      const pick = a => a[Math.random() * a.length | 0];
      st.people.push({
        x: x + (Math.random() < .3 ? 1 : 0), y,
        skin: pick(CROWD_SKIN), top: Math.random() < .3 ? pick(CROWD_HOOD) : pick(CROWD_HAIR), tunic: pick(CROWD_TUNIC),
        flag: Math.random() < .4 ? pick(FLAG_C) : null, cheer: Math.random() < .35, ph: Math.random() * 7, sp: 3 + Math.random() * 3
      });
    }
  }
  return st;
}
const standTop = () => Game.back - 3 - (STAND_ROWS - 1) * STAND_STEP - 7;

/* konstrukcja za tłumem (warstwa statyczna) */
function drawStandBack(ctx, st) {
  const { x0, x1, cols } = st, B = Game.back, w = x1 - x0, top = standTop(), aw = top - 4;
  rect(ctx, x0, top, w, B - top, WOOD.D);
  for (let x = x0 + 3; x < x1; x += 4) rect(ctx, x, top, 1, B - top, WOOD.K); // deski
  for (let i = 0; i < STAND_ROWS; i++) { // stopnie
    const y = B - 3 - i * STAND_STEP;
    rect(ctx, x0, y, w, 1, WOOD.L); rect(ctx, x0, y + 1, w, 1, WOOD.K);
  }
  // słupy i pasiasta markiza z ząbkami
  rect(ctx, x0, aw, 1, B - aw, WOOD.K); rect(ctx, x1 - 1, aw, 1, B - aw, WOOD.K);
  for (let x = x0 - 1; x <= x1; x++) {
    const c = ((x - x0 + 3) / 3 | 0) % 2 ? cols[1] : cols[0];
    rect(ctx, x, aw, 1, 3, c);
    if ((x - x0) % 3 !== 2) rect(ctx, x, aw + 3, 1, 1, c);
  }
  rect(ctx, x0 - 1, aw - 1, w + 2, 1, WOOD.K);
}

/* barierka z płachtami i tarczami przed tłumem (warstwa statyczna, nad tłumem) */
function drawStandFront(ctx, st) {
  const { x0, x1, cols } = st, B = Game.back, w = x1 - x0;
  for (let x = x0, k = 0; x < x1; x += 5, k++) {
    const pw = Math.min(5, x1 - x), c = cols[k % 2];
    rect(ctx, x, B - 5, pw, 5, c);
    rect(ctx, x, B - 1, pw, 1, 'rgba(0,0,0,.25)');
    if (k % 2 === 0 && pw === 5) { // tarcza herbowa na płachcie
      const s = cols[1];
      rect(ctx, x + 1, B - 4, 3, 2, s); rect(ctx, x + 2, B - 2, 1, 1, s);
      rect(ctx, x + 2, B - 4, 1, 2, cols[0] === s ? '#ffffff' : cols[0]);
    }
  }
  rect(ctx, x0 - 1, B - 6, w + 2, 1, WOOD.M); // poręcz
  for (let x = x0; x < x1; x += 10) rect(ctx, x, B - 6, 1, 6, WOOD.K);
  rect(ctx, x1 - 1, B - 6, 1, 6, WOOD.K);
}

/* tłum: podskakuje, wiwatuje, macha chorągiewkami */
function drawCrowd(ctx, t, st) {
  for (const p of st.people) {
    const hop = Math.sin(t * p.sp + p.ph) > .8 ? 1 : 0, x = p.x, y = p.y - hop;
    rect(ctx, x - 1, y - 3, 3, 3, p.tunic);
    rect(ctx, x - 1, y - 5, 2, 2, p.skin);
    rect(ctx, x - 1, y - 6, 2, 1, p.top);
    if (p.flag) {
      rect(ctx, x + 1, y - 9, 1, 6, WOOD.K);
      if (((t * 4 + p.ph) | 0) % 2) { rect(ctx, x + 2, y - 9, 3, 1, p.flag); rect(ctx, x + 2, y - 8, 2, 1, p.flag); }
      else { rect(ctx, x - 2, y - 9, 3, 1, p.flag); rect(ctx, x - 1, y - 8, 2, 1, p.flag); }
    } else if (p.cheer && Math.sin(t * 4 + p.ph) > 0) rect(ctx, x + 1, y - 7, 1, 2, p.skin); // ręka w górze
  }
}
