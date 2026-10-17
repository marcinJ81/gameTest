'use strict';
/* Okno „EKWIPUNEK RYCERZA”: sloty na 8 przedmiotów z GEAR (zdobyte kolorowe, brakujące jako cień)
   oraz pole z monetami. Odświeżane z updateHud(); sloty przerysowuje tylko zmiana rynsztunku lub godła. */
const INV_W = 26, INV_H = 24;       // rozmiar slotu w pikselach gry
const INV_LOCKED = '#1c2444';       // cień niezdobytego przedmiotu
const Inv = { grid: $('#invGrid'), coins: $('#invCoins'), coinIcons: $('#invCoinIcons'), slots: [], key: '', gear: 0 };

/* sloty budowane raz: canvas + podpis */
GEAR.forEach((item, i) => {
  const el = document.createElement('div');
  el.className = 'inv-slot';
  el.innerHTML = `<canvas width="${INV_W}" height="${INV_H}"></canvas><span>${item.name.toUpperCase()}</span>`;
  Inv.grid.appendChild(el);
  Inv.slots.push({ el, ctx: el.querySelector('canvas').getContext('2d') });
});

/* rysuje przedmiot wyśrodkowany w slocie; małe przedmioty w skali 2x, koń w 1x (i tak jest duży) */
function drawInvItem(ctx, key, emblem) {
  if (key === 'horse') { drawHorse(ctx, (INV_W >> 1) - 1, (INV_H >> 1) + 7, 0, false, emblem); return; }
  const shield = key === 'shield' || key === 'emblem', spr = shield ? SHIELD : ITEM_SPR[key];
  ctx.save();
  ctx.translate((INV_W >> 1) - spr[0].length, (INV_H >> 1) - spr.length);
  ctx.scale(2, 2);
  if (shield) drawShield(ctx, 0, 0, key === 'emblem' ? emblem : null);
  else sprite(ctx, spr, 0, 0, ITEM_PAL, false);
  ctx.restore();
}

function renderInventory() {
  Inv.coins.textContent = S.coins;
  Inv.coinIcons.innerHTML = '<i></i>'.repeat(Math.min(S.coins, 12)) + (S.coins > 12 ? '<b>+</b>' : ''); // pikselowe monety (css)
  const key = S.gear + '|' + (S.emblem ? S.emblem.px.join() : '');
  if (key === Inv.key) return;
  const fresh = S.gear > Inv.gear; // nowy przedmiot: slot mruga
  Inv.key = key; Inv.gear = S.gear;
  Inv.slots.forEach((sl, i) => {
    const own = i < S.gear, ctx = sl.ctx;
    ctx.clearRect(0, 0, INV_W, INV_H);
    // godło pokazujemy dopiero, gdy jest zdobyte; wcześniej puste tarcze
    drawInvItem(ctx, GEAR[i].key, own ? S.emblem : null);
    if (!own) { // cień: ten sam kształt w jednym kolorze
      ctx.globalCompositeOperation = 'source-in';
      rect(ctx, 0, 0, INV_W, INV_H, INV_LOCKED);
      ctx.globalCompositeOperation = 'source-over';
    }
    sl.el.classList.toggle('own', own);
    sl.el.classList.toggle('new', fresh && i === S.gear - 1);
  });
}
