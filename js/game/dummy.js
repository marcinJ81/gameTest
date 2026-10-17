'use strict';
/* Kukła treningowa: kołysze się i błyska po trafieniu */
function dummyX() { return Math.round(Game.W * S.dummyF); }
function drawDummy(ctx, cx, groundY, hitT) {
  const sway = hitT < 1.5 ? 3 * Math.exp(-3 * hitT) * Math.sin(hitT * 16) : 0;
  const pal = hitT < .08 ? DUMMY_FLASH : DUMMY_PAL;
  const x0 = cx - 5, y0 = groundY - DUMMY.length;
  for (let y = 0; y < DUMMY.length; y++) {
    const row = DUMMY[y];
    const off = y < DUMMY_SWAY_ROWS ? Math.round(sway * (DUMMY_SWAY_ROWS - y) / DUMMY_SWAY_ROWS) : 0;
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]; if (ch === '.') continue;
      ctx.fillStyle = pal[ch]; ctx.fillRect(x0 + x + off, y0 + y, 1, 1);
    }
  }
}
