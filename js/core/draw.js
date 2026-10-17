'use strict';
/* Rysowanie pikselowe: dopasowanie canvasu, prostokąty, linie, sprite'y */
function fitCanvas(panel, cv, PX) {
  const r = panel.getBoundingClientRect();
  const W = Math.max(1, Math.ceil(r.width / PX)), H = Math.max(1, Math.ceil(r.height / PX));
  cv.width = W; cv.height = H;
  cv.style.width = W * PX + 'px'; cv.style.height = H * PX + 'px';
  return { W, H, pw: r.width, ph: r.height };
}
function rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); }
function pline(ctx, x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  ctx.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
/* rysuje sprite z tablicy stringów; rot=true obraca o 90° (palec w lewo -> palec w dół) */
function sprite(ctx, rows, x, y, pal, rot) {
  const w = rows[0].length;
  for (let sy = 0; sy < rows.length; sy++) for (let sx = 0; sx < w; sx++) {
    const ch = rows[sy][sx]; if (ch === '.') continue;
    ctx.fillStyle = pal[ch];
    if (rot) ctx.fillRect(x + sy, y + (w - 1 - sx), 1, 1);
    else ctx.fillRect(x + sx, y + sy, 1, 1);
  }
}
