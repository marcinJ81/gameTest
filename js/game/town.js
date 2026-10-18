'use strict';
/* Miasteczko: odpoczynek po każdej walce turnieju (drogowskaz na końcu ulicy prowadzi na kolejną walkę)
   i miejsce gracza po wygranej lidze: namiot gracza po lewej, kuźnia (kowal kuje miecz), szlifierz
   ostrzący nóż, piekarnia z piecem (piekarz wsadza chleb), karczma z rycerzami rozmawiającymi przed wejściem.
   W tle chodzą mieszczanie. Gracz zaczyna przy swoim namiocie i spaceruje strzałkami ← →. */
const TOWN = {
  PLASTER: '#e6d8b8', PLASTER_D: '#cbbb98', TIMBER: '#5a3a22', ROOF: '#8a3a2a', ROOF_D: '#6e2c20', ROOF_HI: '#a5513a',
  STONE: '#7d766c', STONE_D: '#5f5850', STONE_HI: '#9a9288', BRICK: '#a0522d', BRICK_D: '#7a3c20',
  GLASS: '#ffd77a', GLASS_D: '#c98a2a', DARK: '#21160f', FIRE: ['#ffd23d', '#ff8a1f', '#ff5a1f', '#fff3a0'],
  SMOKE: 'rgba(200,200,205,', SKIN: '#e8c9a8', IRON: '#3a3a40', IRON_HI: '#8a8a94', HOT: '#ff8a1f', BREAD: '#c98a3a'
};
const TOWN_G = {
  COBBLE: [C('#9a9288'), C('#a8a096'), C('#8c857c')], COBBLE_HI: C('#b8b0a4'), MORTAR: C('#6b6258'), WORN: C('#857d72'),
  SHADE: [C('#5f5850'), C('#58524a')]
};
const TOWN_FOLK = [ // mieszczanie: tunika, nogi, włosy / czepiec, sukienka?, kosz?
  { body: '#7a4a8a', leg: '#3a2d20', hair: '#2a1a10' },
  { body: '#2f6f8a', leg: '#4a3a2a', hair: '#c9a22a', dress: true, cap: '#f2ead8', basket: true },
  { body: '#8a6a2a', leg: '#3a2d20', hair: '#6b3e1e', basket: true },
  { body: '#a33a3a', leg: '#2a2a3a', hair: '#1a1210', dress: true, cap: '#d8c8a0' }
];
const TOWN_FILTER = 'saturate(.8) brightness(.9)'; // mieszkańcy lekko przygaszeni, gracz się wyróżnia
const SMITH_T = .9, PEEL_T = 3.2, TALK_T = 2.4; // tempo kucia, wsadzania chleba, rozmowy (s)

/* gruby kontur ludzika ~14 px; L = wygląd; arm = rysuje rękę osobno (narzędzie) albo null = ręka wzdłuż ciała */
function drawPerson(ctx, fx, fy, L, walk, walking, arm) {
  const r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  const ld = walking ? Math.round(Math.sin(walk) * 1.2) : 0;
  if (L.dress) { r(fx - 2, fy - 6, 5, 5, L.body); r(fx - 3, fy - 2, 7, 1, L.body); r(fx - 1, fy - 1, 1, 1, L.leg); r(fx + 1, fy - 1, 1, 1, L.leg); }
  else { r(fx - 1 + ld, fy - 5, 1, 5, L.leg); r(fx + 1 - ld, fy - 5, 1, 5, L.leg); }
  r(fx - 2, fy - 10, 5, 5, L.body); r(fx - 2, fy - 10, 1, 5, 'rgba(0,0,0,.25)');
  if (L.apron) r(fx, fy - 9, 3, 6, L.apron);
  r(fx - 1, fy - 13, 3, 3, TOWN.SKIN); r(fx + 1, fy - 12, 1, 1, '#2a1a10');
  if (L.toque) { r(fx - 2, fy - 14, 5, 1, '#ffffff'); r(fx - 1, fy - 16, 4, 2, '#ffffff'); }
  else if (L.cap) { r(fx - 2, fy - 14, 4, 1, L.cap); r(fx - 2, fy - 13, 1, 2, L.cap); }
  else if (L.bald) r(fx - 2, fy - 12, 1, 2, L.hair);
  else { r(fx - 1, fy - 14, 3, 1, L.hair); r(fx - 2, fy - 13, 1, 2, L.hair); }
  if (arm) arm(fx + 1, fy - 9);
  else { r(fx + 2, fy - 9, 1, 4, L.body); r(fx + 2, fy - 5, 1, 1, TOWN.SKIN); }
  if (L.basket) { r(fx + 3, fy - 6, 3, 2, '#a07a3a'); r(fx + 3, fy - 7, 3, 1, '#7a5a2a'); }
}
/* ręka z narzędziem: bark (sx,sy), kąt, długość; zwraca koniec ręki */
function toolArm(ctx, sx, sy, ang, len, sleeve) {
  const hx = sx + Math.cos(ang) * len, hy = sy + Math.sin(ang) * len;
  pline(ctx, sx, sy, hx, hy, sleeve);
  rect(ctx, Math.round(hx), Math.round(hy), 1, 1, TOWN.SKIN);
  return { x: Math.round(hx), y: Math.round(hy) };
}

/* ---------- budynki (warstwa statyczna) ---------- */
/* dom z muru pruskiego: ściana, belki, okna, drzwi, dwuspadowy dach; y = podstawa */
function drawHouse(ctx, x0, w, h, y, o = {}) {
  const r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c), top = y - h;
  r(x0, top, w, h, TOWN.PLASTER); r(x0 + w - 3, top, 3, h, TOWN.PLASTER_D);
  // belki: obrys, poziome, słupki co ~8 px i zastrzały
  r(x0, top, w, 1, TOWN.TIMBER); r(x0, y - 1, w, 1, TOWN.TIMBER);
  const floors = o.floors || 1, fh = Math.round(h / floors);
  for (let f = 1; f < floors; f++) r(x0, top + f * fh, w, 1, TOWN.TIMBER);
  const n = Math.max(2, Math.round(w / 8));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + i * (w - 1) / n);
    r(x, top, 1, h, TOWN.TIMBER);
    if (i < n && i % 2 === 0) for (let f = 0; f < floors; f++) pline(ctx, x, top + f * fh + fh - 1, Math.round(x0 + (i + 1) * (w - 1) / n), top + f * fh + 1, TOWN.TIMBER);
  }
  // okna (świecące w karczmie) i drzwi
  for (const [wx, wy] of o.windows || []) {
    r(wx - 1, wy - 1, 5, 6, TOWN.TIMBER); r(wx, wy, 3, 4, o.lit ? TOWN.GLASS : '#3a4a5a');
    r(wx + 1, wy, 1, 4, TOWN.TIMBER); r(wx, wy + 2, 3, 1, TOWN.TIMBER);
    if (o.lit) r(wx, wy, 1, 1, '#fff3c0');
  }
  if (o.door) { const [dx, dw] = o.door; r(dx - 1, y - 10, dw + 2, 10, TOWN.TIMBER); r(dx, y - 9, dw, 9, o.doorOpen ? TOWN.DARK : '#7a4f2a'); if (!o.doorOpen) r(dx + dw - 2, y - 5, 1, 1, '#ffd23d'); }
  // dach: dwuspadowy szczyt z dachówkami
  const rh = o.roofH || Math.round(w * .35);
  for (let j = 0; j < rh; j++) {
    const yy = top - rh + j, half = Math.round((w / 2 + 2) * (j + 1) / rh), cx = x0 + w / 2;
    for (let x = Math.round(cx - half); x <= Math.round(cx + half); x++) r(x, yy, 1, 1, (j % 3 === 2) ? TOWN.ROOF_D : ((x + j) % 5 === 0 ? TOWN.ROOF_HI : TOWN.ROOF));
  }
  r(x0 - 2, top - 1, w + 4, 1, TOWN.ROOF_D);
  if (o.chimney) { const [cx, ch] = o.chimney; r(cx, top - rh - ch + Math.round(rh * .5), 3, ch, TOWN.STONE); r(cx, top - rh - ch + Math.round(rh * .5), 3, 1, TOWN.STONE_D); }
}

/* kuźnia: otwarta wiata na kamiennej podmurówce, palenisko z kominem, narzędzia na ścianie */
function drawForge(ctx, F) {
  const r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c), { x0, w } = F, B = Game.back, top = B - 20;
  r(x0 + 1, top, w - 2, 20, '#3a2e26'); // ciemne wnętrze
  for (let y = top + 1; y < B; y += 3) for (let x = x0 + 1 + (y % 2) * 2; x < x0 + w - 1; x += 5) r(x, y, 4, 2, '#463830'); // deski ściany
  // palenisko (kamień) po lewej, nad nim okap i komin
  r(x0 + 2, B - 7, 10, 7, TOWN.STONE); r(x0 + 2, B - 7, 10, 1, TOWN.STONE_HI); r(x0 + 4, B - 5, 6, 3, TOWN.DARK);
  r(x0 + 3, top - 4, 8, 13, TOWN.STONE_D); r(x0 + 4, top - 10, 6, 8, TOWN.STONE); r(x0 + 4, top - 10, 6, 1, TOWN.STONE_HI);
  F.fire = { x: x0 + 4, y: B - 5, w: 6 }; F.smoke = { x: x0 + 7, y: top - 11 };
  // narzędzia: obcęgi, młoty, podkowy na ścianie
  r(x0 + 15, top + 4, 1, 6, TOWN.IRON_HI); r(x0 + 14, top + 4, 3, 1, TOWN.IRON);
  r(x0 + 19, top + 4, 1, 5, WOOD.M); r(x0 + 18, top + 3, 3, 2, TOWN.IRON);
  if (w > 34) for (let i = 0; i < 3; i++) { const hx = x0 + 24 + i * 4; r(hx, top + 4, 3, 1, TOWN.IRON_HI); r(hx, top + 5, 1, 2, TOWN.IRON_HI); r(hx + 2, top + 5, 1, 2, TOWN.IRON_HI); }
  // słupy i dach pulpitowy
  r(x0, top, 2, 20, WOOD.D); r(x0 + w - 2, top, 2, 20, WOOD.D);
  for (let j = 0; j < 6; j++) r(x0 - 2, top - 6 + j, w + 4, 1, j % 2 ? TOWN.ROOF_D : TOWN.ROOF);
  r(x0 - 2, top - 7, w + 4, 1, TOWN.ROOF_HI);
  // szyld: podkowa
  const sx = x0 + w - 9;
  r(sx, top - 14, 1, 8, WOOD.K); r(sx - 5, top - 14, 6, 1, WOOD.K); r(sx - 6, top - 13, 5, 5, '#d8c8a0');
  r(sx - 5, top - 12, 1, 3, TOWN.IRON); r(sx - 3, top - 12, 1, 3, TOWN.IRON); r(sx - 5, top - 12, 3, 1, TOWN.IRON);
  // kowadło na pniu przed kuźnią
  const ax = F.anvil;
  r(ax - 1, B + 1, 4, 3, WOOD.D); r(ax - 3, B - 1, 8, 2, TOWN.IRON); r(ax + 5, B - 1, 2, 1, TOWN.IRON); r(ax - 2, B - 1, 6, 1, TOWN.IRON_HI);
}

/* szlifierka: koło na drewnianym kozle (koło kręci się w warstwie dynamicznej) */
function drawGrinderStand(ctx, G) {
  const B = Game.back, x = G.x;
  pline(ctx, x - 4, B + 3, x, B - 4, WOOD.D); pline(ctx, x + 4, B + 3, x, B - 4, WOOD.D);
  rect(ctx, x - 5, B + 1, 11, 1, WOOD.M); rect(ctx, x - 1, B - 1, 3, 2, '#3a6aa0'); // koryto z wodą
}

/* piekarnia: dom z szyldem (bochenek) i ceglany piec kopułowy z boku */
function drawBakery(ctx, P) {
  const B = Game.back, { x0, w } = P;
  drawHouse(ctx, x0, w, 20, B, { windows: [[x0 + 4, B - 16]], door: [x0 + w - 9, 5], doorOpen: true, chimney: [x0 + 5, 9] });
  // szyld z chlebem
  rect(ctx, x0 + w - 13, B - 18, 8, 5, '#d8c8a0'); rect(ctx, x0 + w - 12, B - 16, 6, 2, TOWN.BREAD); rect(ctx, x0 + w - 11, B - 17, 4, 1, TOWN.BREAD);
  // piec: kopuła z cegieł, otwór ku piekarzowi (w lewo)
  const ox = P.oven, R = 7;
  for (let y = -R; y <= 0; y++) for (let x = -R; x <= R; x++) {
    if (x * x + y * y > R * R + 2) continue;
    rect(ctx, ox + x, B - 1 + y, 1, 1, ((x + (y & 1) * 2) & 3) === 0 || (y & 1) ? TOWN.BRICK_D : TOWN.BRICK);
  }
  rect(ctx, ox - R - 1, B - 1, 2 * R + 3, 2, TOWN.STONE);
  rect(ctx, ox - 6, B - 5, 4, 4, TOWN.DARK); // otwór
  P.mouth = { x: ox - 6, y: B - 5 }; P.smoke = { x: ox + 1, y: B - 9 };
  rect(ctx, ox, B - 9, 2, 2, TOWN.STONE_D);
  // drewno pod piecem
  for (let i = 0; i < 3; i++) rect(ctx, ox + 3 + i * 2, B - 2 - (i & 1), 2, 1, WOOD.M);
}

/* karczma: dwupiętrowy dom, świecące okna, szyld z kuflem, beczki przy wejściu */
function drawTavern(ctx, T) {
  const B = Game.back, { x0, w } = T, h = 30, wins = [];
  for (let x = x0 + 5; x < x0 + w - 6; x += 10) { wins.push([x, B - h + 4]); if (Math.abs(x - T.door) > 7) wins.push([x, B - 13]); }
  drawHouse(ctx, x0, w, h, B, { floors: 2, windows: wins, lit: true, door: [T.door - 3, 6], doorOpen: true, chimney: [x0 + w - 10, 8], roofH: Math.min(14, Math.round(w * .2)) });
  // wysięgnik z szyldem (kufel)
  const sx = x0 + 2;
  rect(ctx, sx - 7, B - h + 8, 8, 1, WOOD.K); rect(ctx, sx - 7, B - h + 9, 1, 1, WOOD.K); rect(ctx, sx - 2, B - h + 9, 1, 1, WOOD.K);
  rect(ctx, sx - 8, B - h + 10, 8, 7, '#d8c8a0'); rect(ctx, sx - 6, B - h + 11, 3, 5, '#ffd23d'); rect(ctx, sx - 6, B - h + 11, 3, 1, '#ffffff'); rect(ctx, sx - 3, B - h + 12, 1, 3, '#c98a2a');
  // beczki
  for (const bx of [T.door + 6, T.door + 10]) { rect(ctx, bx, B - 6, 4, 6, WOOD.M); rect(ctx, bx, B - 5, 4, 1, TOWN.IRON); rect(ctx, bx, B - 2, 4, 1, TOWN.IRON); rect(ctx, bx, B - 6, 1, 6, WOOD.D); }
}

/* ---------- budowa sceny ---------- */
function buildTown() {
  const { W } = Game;
  setupSky(Game.surf - 10);
  const B = Game.back;
  // namiot gracza: jeden, w barwach jego godła (albo czerwono-biały)
  const tw = clamp(Math.round(W * .06), 18, 28), em = S && S.emblem;
  Game.tents = [{ cx: 6 + (tw >> 1), w: tw, cols: em ? [em.field, em.ink] : ['#d42a3a', '#f2ead8'], side: -1 }];
  Game.townStart = Game.tents[0].cx + (tw >> 1) + 8;
  // rozkład: kuźnia | szlifierz | piekarnia z piecem | karczma — wolne miejsce dzielone równo między budynki
  const x0 = tw + 16, a = W - 2 - x0;
  const fw = clamp(Math.round(a * .2), 30, 48), gw = 12, bw = clamp(Math.round(a * .17), 26, 40), tvw = clamp(Math.round(a * .3), 46, 90);
  const gap = Math.max(2, (a - fw - gw - (bw + 15) - tvw) / 4);
  let x = x0 + gap;
  const F = { x0: Math.round(x), w: fw }; F.anvil = F.x0 + Math.round(fw * .62); x += fw + gap;
  const G = { x: Math.round(x + 4) }; x += gw + gap;
  const P = { x0: Math.round(x), w: bw }; P.oven = P.x0 + bw + 8; x += bw + 15 + gap;
  const T = { x0: Math.round(x), w: Math.round(Math.min(tvw, W - 2 - x)) }; T.door = T.x0 + Math.round(T.w * .55);
  Game.town = { F, G, P, T, folk: makeFolk(x0, W - 4, B), sparks: [] };
  bakeSky();
  Game.lyMid = layer();
  const m = Game.lyMid.getContext('2d');
  drawTent(m, Game.tents[0]);
  drawForge(m, F); drawGrinderStand(m, G); drawBakery(m, P); drawTavern(m, T);
  Game.lyFront = null;
  Game.lyActors = layer();
}

function makeFolk(x0, x1, B) {
  const list = [], n = x1 - x0 > 200 ? 4 : 3;
  for (let i = 0; i < n; i++) list.push({ x: x0 + Math.random() * (x1 - x0), y: B + 6 + (i % 2) * 2, dir: Math.random() < .5 ? -1 : 1, sp: 5 + Math.random() * 4, walk: 0, pause: 0, look: TOWN_FOLK[i % TOWN_FOLK.length] });
  list.sort((a, b) => a.y - b.y);
  return { x0, x1, list };
}

function updateTown(dt) {
  const T = Game.town, F = T.folk;
  for (const p of F.list) {
    if (p.pause > 0) { p.pause -= dt; continue; }
    p.x += p.dir * p.sp * dt; p.walk += p.sp * dt * .5;
    if (p.x < F.x0 || p.x > F.x1) { p.x = clamp(p.x, F.x0, F.x1); p.dir *= -1; p.pause = 1 + Math.random() * 3; }
    else if (Math.random() < dt * .08) p.pause = 1 + Math.random() * 2; // przystaje na chwilę
  }
  for (let i = T.sparks.length - 1; i >= 0; i--) {
    const s = T.sparks[i]; s.life -= dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 120 * dt;
    if (s.life <= 0) T.sparks.splice(i, 1);
  }
}
const townSpark = (x, y, n, spread) => { for (let i = 0; i < n; i++) Game.town.sparks.push({ x, y, vx: (Math.random() - .5) * spread, vy: -15 - Math.random() * 25, life: .25 + Math.random() * .25 }); };

/* dym z komina: kilka pikseli unoszących się i znikających */
function drawSmoke(ctx, t, x, y, seed) {
  for (let i = 0; i < 6; i++) {
    const k = ((t * .35 + i / 6 + seed) % 1), yy = y - k * 22, xx = x + Math.sin(t * 1.3 + i * 2 + seed * 9) * 2 + k * 6;
    ctx.fillStyle = TOWN.SMOKE + (.55 * (1 - k)).toFixed(2) + ')';
    ctx.fillRect(Math.round(xx), Math.round(yy), k > .5 ? 3 : 2, 2);
  }
}

/* postacie i ruch w miasteczku (co klatkę, na warstwie aktorów) */
function drawTown(ctx, t) {
  const T = Game.town, B = Game.back, { F, G, P } = T;
  const r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  drawSmoke(ctx, t, F.smoke.x, F.smoke.y, 0); drawSmoke(ctx, t, P.smoke.x, P.smoke.y, .5);
  if (T.T.w > 50) drawSmoke(ctx, t, T.T.x0 + T.T.w - 9, B - 30 - Math.min(14, Math.round(T.T.w * .2)) - 4, .25);
  // ogień w palenisku i w piecu
  for (let i = 0; i < F.fire.w; i++) r(F.fire.x + i, F.fire.y + 1 - (hash2(i, t * 8 | 0) > .5 ? 1 : 0), 1, 2, TOWN.FIRE[(hash2(i + 3, t * 10 | 0) * 4) | 0]);
  r(P.mouth.x + 1, P.mouth.y + 2, 2, 2, TOWN.FIRE[(t * 7 | 0) % 3]);
  // kowal: młot w górę i w dół, przy uderzeniu iskry z rozgrzanego miecza
  const sm = { body: '#5a4a3a', leg: '#3a2d20', hair: '#3a2a1a', bald: true, apron: '#3a2a20' };
  const sx = F.anvil - 6, ph = (t % SMITH_T) / SMITH_T, down = ph > .55 && ph < .7;
  const ang = ph < .55 ? lerp(.6, -2.2, fade(ph / .55)) : ph < .7 ? lerp(-2.2, .5, (ph - .55) / .15) : lerp(.5, .6, (ph - .7) / .3);
  r(F.anvil - 2, B - 2, 7, 1, TOWN.IRON_HI); r(F.anvil + 2, B - 2, 3, 1, TOWN.HOT); // miecz na kowadle, czubek rozżarzony
  drawPerson(ctx, sx, B + 2, sm, 0, false, (ax, ay) => {
    const h = toolArm(ctx, ax, ay, ang, 4, sm.body);
    const hx = h.x + Math.round(Math.cos(ang) * 3), hy = h.y + Math.round(Math.sin(ang) * 3);
    pline(ctx, h.x, h.y, hx, hy, WOOD.M); r(hx - 1, hy - 1, 2, 2, TOWN.IRON);
  });
  if (down && !T.hit) { T.hit = true; townSpark(F.anvil + 3, B - 3, 6, 70); } else if (!down) T.hit = false;
  // szlifierz: koło się kręci, nóż przy kamieniu, sypią się iskry
  const gx = G.x, gy = B - 6, a0 = t * 9;
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 10) r(gx + x, gy + y, 1, 1, x * x + y * y > 6 ? '#6b6560' : '#8c857c');
  for (let k = 0; k < 2; k++) { const aa = a0 + k * Math.PI / 2; r(Math.round(gx + Math.cos(aa) * 2), Math.round(gy + Math.sin(aa) * 2), 1, 1, '#4a4540'); r(Math.round(gx - Math.cos(aa) * 2), Math.round(gy - Math.sin(aa) * 2), 1, 1, '#4a4540'); }
  r(gx, gy, 1, 1, WOOD.K);
  const gr = { body: '#4a5a3a', leg: '#3a2d20', hair: '#8a8a8a' };
  flipX(ctx, gx + 7, () => drawPerson(ctx, gx + 7, B + 2, gr, 0, false, (ax, ay) => {
    const h = toolArm(ctx, ax, ay, -.25 + Math.sin(t * 5) * .08, 3, gr.body);
    r(h.x + 1, h.y, 3, 1, TOWN.IRON_HI);
  }));
  if (Math.random() < .5) townSpark(gx + 3, gy - 2, 1, 30);
  // piekarz: łopata z chlebem wjeżdża do pieca i wraca pusta
  const bk = { body: '#f2ead8', leg: '#6b5a4a', hair: '#6b3e1e', toque: true, apron: '#d8d0c0' };
  const pp = (t % PEEL_T) / PEEL_T, push = pp < .4 ? fade(pp / .4) : pp < .55 ? 1 : 1 - fade((pp - .55) / .45);
  const bx = P.mouth.x - 12 + Math.round(push * 3);
  drawPerson(ctx, bx, B + 2, bk, 0, false, (ax, ay) => {
    const h = toolArm(ctx, ax, ay, .2, 3, bk.body);
    const tip = h.x + 6 + Math.round(push * 5);
    pline(ctx, h.x, h.y, tip, h.y + 1, WOOD.L);
    r(tip - 1, h.y + 1, 3, 1, WOOD.M);
    if (pp < .5) r(tip - 1, h.y, 3, 1, TOWN.BREAD); // bochenek na łopacie, potem zostaje w piecu
  });
  // rycerze przed karczmą: rozmowa (dymki z kropkami na zmianę)
  const Tv = T.T, kx = Tv.door - 4, ky = B + 3, who = (t % (TALK_T * 3)) / TALK_T | 0;
  const kn = [
    { x: kx - 10, flip: false, gear: 5, em: T.emA || (T.emA = randomEmblem(seededRandom(77))) },
    { x: kx, flip: true, gear: 3, em: null },
    { x: kx + 8, flip: true, gear: 5, em: T.emB || (T.emB = randomEmblem(seededRandom(91))) }
  ];
  kn.forEach((k, i) => {
    const talking = who === i, ang = talking ? -.4 + Math.sin(t * 6) * .3 : .9;
    const K = { gear: k.gear, walk: 0, walking: false, mounted: false, weapon: 'sword', ang, hasWeapon: !talking, emblem: k.em };
    if (k.flip) flipX(ctx, k.x, () => drawKnight(ctx, k.x, ky, K)); else drawKnight(ctx, k.x, ky, K);
    if (talking && (t * 3 | 0) % 3) { // dymek
      const dx = k.x - 2, dy = ky - 28;
      r(dx, dy, 7, 4, '#ffffff'); r(dx + (k.flip ? 4 : 1), dy + 4, 1, 1, '#ffffff');
      for (let d = 0; d < 3; d++) if (d <= (t * 4 | 0) % 3) r(dx + 1 + d * 2, dy + 2, 1, 1, '#21160f');
    }
  });
  // mieszczanie
  for (const p of T.folk.list) {
    const fx = Math.round(p.x), draw = () => drawPerson(ctx, fx, p.y, p.look, p.walk, p.pause <= 0, null);
    if (p.dir < 0) flipX(ctx, fx, draw); else draw();
  }
  for (const s of T.sparks) r(Math.round(s.x), Math.round(s.y), 1, 1, s.life > .2 ? '#fff3a0' : TOWN.HOT);
}

/* ---------- gracz w miasteczku ---------- */
const TOWN_SPEED = 30; // px/s
const inTown = () => Game.scene === 'town' && !Game.trans;
function walkTown(dt) {
  const mx = Held.has('ArrowRight') - Held.has('ArrowLeft');
  S.moving = !!mx;
  if (!mx) return;
  S.face = mx;
  const v = TOWN_SPEED * (mounted() ? HORSE_MUL : 1);
  S.x = clamp(S.x + mx * v * dt, 6, Game.W - 6); S.walk += v * dt * .45;
  // między walkami: koniec ulicy (drogowskaz) prowadzi na turniej, na kolejną walkę
  if (S.over === 'town' && mx > 0 && S.x >= Game.W - 6) {
    startTransition('tournament', () => { S.over = null; Held.clear(); beginFight(); });
  }
}
/* po każdej walce (S.over = 'town') albo po wygranej lidze ('league' / 'champion'):
   przejście do miasteczka, gracz zaczyna przy swoim namiocie */
function goToTown(kind) {
  startTransition('town', () => {
    const T = S.tour, next = kind === 'town' ? T.list[T.pos - 1] : null;
    S.duel = null; S.over = kind; S.parts = []; S.arrived = true;
    S.x = Game.townStart; S.face = 1; S.moving = false; S.lance = newLance(); S.swing = false;
    Held.clear();
    if (next) {
      setHint('MIASTECZKO · <kbd>←</kbd><kbd>→</kbd> SPACER · <kbd>→</kbd> DO KOŃCA ULICY: NA TURNIEJ');
      toast('NASTĘPNY: ' + next.name.toUpperCase());
    } else {
      setHint((kind === 'champion' ? 'MISTRZ TURNIEJU! ' : '') + 'MIASTECZKO · <kbd>←</kbd><kbd>→</kbd> SPACER · ZAKUPY WKRÓTCE · <kbd>R</kbd> OD NOWA');
      sfxChime();
      toast(kind === 'champion' ? 'MISTRZ TURNIEJU! WITAJ W MIASTECZKU' : T.name + ' WYGRANA! WITAJ W MIASTECZKU');
    }
    renderStandings(); updateHud();
  });
}
/* drogowskaz na końcu ulicy: strzałka na turniej (tylko między walkami) */
function drawSignpost(ctx, t) {
  if (S.over !== 'town') return;
  const x = Game.W - 5, y = Game.surf, r = (x, y, w, h, c) => rect(ctx, x, y, w, h, c);
  r(x, y - 16, 1, 16, WOOD.K);
  r(x - 9, y - 16, 10, 5, WOOD.L); r(x - 9, y - 12, 10, 1, WOOD.D);
  const nudge = (t * 3 | 0) % 2; // strzałka mruga w stronę turnieju
  r(x - 7 + nudge, y - 14, 5, 1, '#21160f'); r(x - 3 + nudge, y - 15, 1, 3, '#21160f'); r(x - 2 + nudge, y - 14, 1, 1, '#21160f');
  r(x - 2, y - 18, 3, 2, '#d42a3a'); // proporczyk turnieju
}
