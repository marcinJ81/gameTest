'use strict';
/* Tło gry: plac treningowy albo turniej (Game.scene). Rozkład sceny i składanie warstw.
   Statyczne części pieczone raz na zmianę rozmiaru / sceny do warstw:
   niebo+ziemia (piksele) -> konstrukcje (las, namioty, trybuny, loża) -> [turniej] barierki przed tłumem.
   Między nimi co klatkę: chmury i ptaki, tłum, para książęca, rycerze w tle, proporce. */
function layer() {
  const cv = document.createElement('canvas');
  cv.width = Game.W; cv.height = Game.H;
  return cv;
}

/* niebo i wzgórza wspólne dla obu scen; B = linia horyzontu sceny */
function setupSky(B) {
  const { W, surf } = Game;
  Game.back = B;
  Game.grassY = surf + Math.max(4, Math.round((Game.H - surf) * .5));
  Game.far = new Int16Array(W); Game.near = new Int16Array(W);
  for (let x = 0; x < W; x++) {
    Game.far[x] = B - Math.round(10 + vn2(x * .03, 7.7) * 16);
    Game.near[x] = B - Math.round(3 + vn2(x * .05 + 20, 3.1) * 8);
  }
  Game.sun = { x: Math.round(W * .22), y: Math.round(B * .28), r: clamp(Math.round(B * .08), 4, 8) };
  Game.clouds = [];
  for (let i = 0; i < 5; i++) Game.clouds.push({ x: Math.random() * W, y: 4 + Math.random() * B * .35 | 0, len: 10 + Math.random() * 18 | 0, sp: 1.5 + Math.random() * 3 });
  Game.birds = [];
  for (let i = 0; i < 3; i++) Game.birds.push({ x: Math.random() * W, y: B * (.15 + Math.random() * .3), sp: 6 + Math.random() * 6 });
}

/* namioty rycerzy: n na stronę, sides = [-1] (lewa) albo [-1, 1]; zwraca szerokość zajętego pasa */
function makeTents(sides) {
  const W = Game.W, nT = W >= 260 ? 2 : 1, tw = clamp(Math.round(W * .06), 18, 28);
  const tc = TENT_C.slice().sort(() => Math.random() - .5);
  Game.tents = [];
  for (let i = 0; i < nT; i++) {
    const off = 6 + (tw >> 1) + i * (tw + 9);
    for (const side of sides) Game.tents.push({ cx: side < 0 ? off : W - 1 - off, w: tw, cols: tc[Game.tents.length], side });
  }
  return nT * (tw + 9) + 2;
}

/* warstwa 1: niebo + ziemia (piksele) */
function bakeSky() {
  const { W, H, back, buf } = Game;
  for (let y = 0; y < H; y++) {
    if (y < back) drawSkyRow(buf, y * W, y); else drawGroundRow(buf, y * W, y);
  }
  Game.lySky = layer(); Game.lySky.getContext('2d').putImageData(Game.img, 0, 0);
}

function buildScenery() {
  if (Game.scene === 'training') buildTraining(); else buildArena();
}

/* plac treningowy: las w tle, namioty po lewej, płot, ćwiczący rycerze */
function buildTraining() {
  const { W } = Game;
  setupSky(Game.surf - 12); // plac głębszy niż arena: w tle jest miejsce na ćwiczących
  const B = Game.back, zone = makeTents([-1]);
  Game.forest = makeForest(W, B);
  Game.trainees = makeTrainees(zone + 4, W - 12, B);
  bakeSky();
  Game.lyMid = layer();
  const m = Game.lyMid.getContext('2d');
  drawForest(m, Game.forest);
  drawFence(m, zone - 2, W, B);
  for (const tn of Game.tents) drawTent(m, tn);
  drawWeaponRack(m, zone + 1, B);
  drawHay(m, W - 14, B + 1);
  if (W >= 260) drawHay(m, Math.round(W * .62), B);
  Game.lyFront = null;
  Game.lyActors = layer();
}

/* turniej: namioty | trybuna | loża | trybuna | namioty */
function buildArena() {
  const { W } = Game;
  setupSky(Game.surf - 5);
  const B = Game.back, zone = makeTents([-1, 1]);
  const rw = clamp(Math.round(W * .17), 36, 64), rx0 = Math.round(W / 2 - rw / 2), rcx = rx0 + (rw >> 1);
  const floor = B - 14;
  Game.royal = { x0: rx0, x1: rx0 + rw, cx: rcx, floor, top: floor - 22, heralds: rw >= 50, thrones: [rcx - 11, rcx + 2] };
  const dc = DRAPE_C.slice().sort(() => Math.random() - .5);
  Game.stands = [];
  if (rx0 - 3 - zone > 8) Game.stands.push(makeStand(zone, rx0 - 3, dc[0]), makeStand(rx0 + rw + 3, W - zone, dc[1]));
  bakeSky();
  // warstwa 2: konstrukcje
  Game.lyMid = layer();
  const m = Game.lyMid.getContext('2d'), ccx = Math.round(W * .72);
  drawCastle(m, ccx, Game.far[ccx] + 4);
  for (const tn of Game.tents) drawTent(m, tn);
  for (const st of Game.stands) drawStandBack(m, st);
  drawRoyalBox(m, Game.royal);
  // warstwa 3: barierki przed tłumem
  Game.lyFront = layer();
  const f = Game.lyFront.getContext('2d');
  for (const st of Game.stands) drawStandFront(f, st);
}

function updateScenery(dt) {
  updateSky(dt);
  if (Game.scene === 'training') updateTrainees(dt, Game.trainees);
}

/* tło, rysowane przed kukłą i rycerzem */
function drawScenery(ctx, t) {
  ctx.drawImage(Game.lySky, 0, 0);
  drawClouds(ctx, t);
  ctx.drawImage(Game.lyMid, 0, 0);
  if (Game.scene === 'training') {
    const a = Game.lyActors.getContext('2d');
    a.clearRect(0, 0, Game.W, Game.H);
    drawTrainees(a, t, Game.trainees);
    ctx.filter = TRAINEE_FILTER; ctx.drawImage(Game.lyActors, 0, 0); ctx.filter = 'none';
  } else {
    for (const st of Game.stands) drawCrowd(ctx, t, st);
    drawRoyals(ctx, t, Game.royal);
    ctx.drawImage(Game.lyFront, 0, 0);
  }
  for (let i = 0; i < Game.tents.length; i++) {
    const tn = Game.tents[i];
    drawPennant(ctx, t + i * .9, tn.pole.x, tn.pole.y, 8, tn.cols[0], tn.cols[1]);
  }
}
