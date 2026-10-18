'use strict';
/* =========================================================
   3) GRA: RYCERZ — stan i logika
   ========================================================= */
const Game = { panel: $('#gamePanel'), cv: $('#game'), PX: 4, W: 0, H: 0, scene: 'training', trans: null, assistOn: false }; // assistOn: stała podpowiedź (klawisz 1), przetrwa reset
Game.ctx = Game.cv.getContext('2d');

let S; // stan gry
function loadBest() { try { return parseInt(localStorage.getItem('rycerz-best-rynsztunek'), 10) || 0; } catch (e) { return 0; } }
function saveBest(v) { try { localStorage.setItem('rycerz-best-rynsztunek', String(v)); } catch (e) { } }
function resetGame() {
  S = {
    started: false, over: null, x: 6, walk: 0, speed: SPEED0, pass: 1,
    dummyF: .5 + Math.random() * .3, hitPass: false, missPass: false, dummyHitT: 99,
    gear: 0, coins: COINS, emblem: null, swing: false, at: 0, struck: false, cool: 0, lance: newLance(),
    missStreak: 0, assist: false, goal: null, arrived: false, entry: null, askT: 0,
    tour: null, duel: null, // turniej: liga i miejsce gracza / bieżąca walka (duel.js)
    guard: newGuard(),      // blok klawiszem B (block.js)
    en: EN_MAX,             // energia na ciosy w walce (stamina.js)
    inv: 0, push: 0,        // walka piesza: chwila bez obrażeń, odrzut (foot.js)
    parts: [], pops: [], best: loadBest()
  };
  Game.trans = null; setScene('training'); closeEntry(); closeMonit(); Held.clear();
  setHint('WCIŚNIJ <kbd>SPACJA</kbd> ABY RUSZYĆ');
  updateHud();
  renderStandings();
}
function resizeGame() {
  const r = Game.panel.getBoundingClientRect();
  Game.PX = r.width < 700 ? 3 : 4;
  const { W, H } = fitCanvas(Game.panel, Game.cv, Game.PX);
  Game.W = W; Game.H = H;
  Game.img = Game.ctx.createImageData(W, H);
  Game.buf = new Uint32Array(Game.img.data.buffer);
  Game.surf = Math.floor(H * .7);
  buildScenery();
}

const hasGood = () => S.gear >= 4;
/* w walce pieszej (po zejściu z koni) rycerz walczy mieczem, który miał przy boku */
const mounted = () => S.gear >= 6 && !onFoot();
const weapon = () => onFoot() ? 'sword' : S.gear >= 8 ? 'kopia' : S.gear >= 7 ? 'lance' : 'sword';
const knightY = () => mounted() ? riderY(Game.surf) : Game.surf;
const knightSpeed = () => (S.duel ? DUEL_SPEED : S.speed) * (mounted() ? HORSE_MUL : 1);
/* S.over: 'won' = pełny rynsztunek i trafienie kopią, 'out' = pudło bez monet, 'quit' = klawisz 2;
   każde kończy trening. Po wpisowym S.over = null (trwa turniej), a na końcu turnieju:
   'ko' = porażka bez monet, 'league' = wygrana liga niższa, 'champion' = wygrana liga królewska.
   rycerz jedzie: w trakcie gry, po treningu — z placu i na turniej, aż stanie na miejscu; na turnieju — w rundzie */
const riding = () => S.duel ? S.duel.phase === 'ride' : S.started && (!S.over || !S.arrived);
/* w co celuje rycerz: kukła na treningu, przeciwnik na turnieju */
const targetX = () => S.duel ? S.duel.ox : dummyX();
const strikeTarget = straw => S.duel ? (S.duel.foot ? footHitRival() : hitRival()) : hitDummy(straw);
function knightAngle(t) {
  if (weapon() !== 'sword') return S.over ? LANCE_UP : lanceAngle(t, LANCES[weapon()]);
  if (S.swing) return swingAngle(S.at);
  return guardAngle(S.cool > 0 ? .6 : -1 + Math.sin(t * 2.5) * .05, S.guard); // zadyszka: miecz opuszczony; blok: miecz cofnięty
}

/* spacja */
function swing() {
  if (S.over || (S.duel && S.duel.phase !== (S.duel.foot ? 'fight' : 'ride'))) return;
  if (!S.started) { S.started = true; setHint(null); return; }
  if (weapon() !== 'sword') { toast(WEAPON_NAME[weapon()] + ': OPUSZCZASZ KLAWISZEM X'); return; }
  if (S.swing || S.cool > 0 || playerBlocking()) return; // w trakcie zamachu / zadyszki / bloku nie da się zacząć kolejnego
  if (!spendPlayer()) return; // w walce: brak energii na cios (stamina.js)
  S.swing = true; S.at = 0; S.struck = false;
  sfxSwing();
  if (onFoot()) rivalReact();
}

/* moment uderzenia: trafienie tylko gdy cel jest w końcowej części ostrza */
function checkHit() {
  const L = SWORD_LEN[hasGood() ? 1 : 0];
  const g = swordGeom(Math.round(S.x), knightY(), swingAngle(S.at), L);
  const a = g.hx + g.c * L * .5, b = g.tx + 1, lo = Math.min(a, b), hi = Math.max(a, b);
  const dx = targetX();
  if (hi < dx - 3 || lo > dx + 3) { S.cool = WHIFF_CD; return; } // cios w powietrze
  strikeTarget(8);
}

/* lanca / kopia trafia, gdy jest opuszczona, a grot dochodzi do celu */
function checkLanceHit() {
  const spec = LANCES[weapon()], dx = targetX();
  if (S.hitPass || S.lance.k < LANCE_HIT_K) return;
  const g = lanceGeom(Math.round(S.x), knightY(), LANCE_DOWN, spec.len);
  if (g.tx < dx - 3 || g.tx > dx + 3) return;
  S.lance.st = 'raising'; // po uderzeniu rycerz unosi broń
  strikeTarget(14);
}

function hitDummy(straw) {
  const dx = dummyX();
  S.dummyHitT = 0;
  sfxHit();
  for (let i = 0; i < straw; i++) S.parts.push({ x: dx, y: Game.surf - 14, vx: (Math.random() - .3) * 60, vy: -30 - Math.random() * 50, c: STRAW[i % 3], s: 1, life: .7, kind: 'straw' });
  if (S.hitPass) return; // jedno trafienie liczy się raz na przejście
  S.hitPass = true;
  S.missStreak = 0; S.assist = false; // trafienie chowa podpowiedź
  award();
}

/* nagroda za trafienie; trafienie kopią (gdy wszystko zdobyte) = trening zaliczony, rycerz jedzie na turniej */
function award() {
  sfxChime();
  if (S.gear >= GEAR.length) {
    S.over = 'won';
    toast('TRENING ZALICZONY! JEDZIESZ NA TURNIEJ');
    setHint(null);
    updateHud();
    return;
  }
  const item = GEAR[S.gear++];
  if (item.key === 'emblem') S.emblem = randomEmblem();
  if (item.key === 'lance' || item.key === 'kopia') S.lance = newLance();
  S.pops.push({ key: item.key, emblem: S.emblem, x: Math.round(S.x) - 3, y: knightY() - 26, t: 0 });
  if (S.gear > S.best) { S.best = S.gear; saveBest(S.gear); }
  if (item.key === 'horse') {
    S.coins += BONUS_COINS;
    toast('DOSTAJESZ: KOŃ! +' + BONUS_COINS + ' MONETY NA LANCĘ');
  } else if (item.key === 'lance') toast('LANCA! OPUSZCZASZ JĄ KLAWISZEM X');
  else if (item.key === 'kopia') toast('KOPIA! CIĘŻKA: WOLNO OPADA, KRÓTKO JĄ UTRZYMASZ');
  else toast('DOSTAJESZ: ' + item.name.toUpperCase() + '!');
  updateHud();
}

/* klawisz 1: stała podpowiedź (flaga przed kukłą) włącz / wyłącz */
/* na turnieju: włącza / wyłącza flagę w bieżącej walce, a wybór przechodzi na kolejne walki */
function toggleAssist() {
  if (S.duel) { S.duel.hint = Game.assistOn = !S.duel.hint; toast('FLAGA: ' + (S.duel.hint ? 'WŁĄCZONA' : 'WYŁĄCZONA')); updateHud(); return; }
  if (S.over || S.tour) return; // poza walką: tylko na treningu
  Game.assistOn = !Game.assistOn;
  toast('STAŁA PODPOWIEDŹ: ' + (Game.assistOn ? 'WŁĄCZONA' : 'WYŁĄCZONA'));
  updateHud();
}

/* klawisz 2: koniec treningu z tym, co jest — sprzęt i monety zostają, premia za trening na turnieju */
function quitTraining() {
  if (S.over || Game.scene !== 'training') return;
  S.started = true; S.over = 'quit';
  S.swing = false; S.assist = false;
  toast('KOŃCZYSZ TRENING — JEDZIESZ NA TURNIEJ');
  setHint(null);
  updateHud();
}

/* rycerz minął kukłę bez trafienia */
function doMiss() {
  if (++S.missStreak >= ASSIST_AFTER) S.assist = true;
  if (S.coins > 0) {
    S.coins--;
    S.parts.push({ x: Math.round(S.x) - 2, y: knightY() - 7, vx: -12, vy: -60, c: COIN_C, s: 2, life: 1.4, kind: 'coin' });
    sfxCoin();
    toast(S.missStreak === ASSIST_AFTER ? 'PUDŁO! PODPOWIEDŹ: ' + (weapon() === 'sword' ? 'SPACJA' : 'X') + ' PRZY ZNACZNIKU'
      : 'PUDŁO! TRACISZ MONETĘ — ZOSTAŁO: ' + S.coins);
  } else { // bez monet trening się kończy, ale rycerz i tak jedzie na turniej z tym, co zdobył
    S.over = 'out';
    S.assist = false;
    toast('BRAK MONET — KONIEC TRENINGU, JEDZIESZ NA TURNIEJ');
    setHint(null);
  }
  updateHud();
}

function nextPass() {
  S.pass++; S.x = -8; S.hitPass = false; S.missPass = false;
  S.dummyF = .4 + Math.random() * .45;
  S.speed = Math.min(SPEED_MAX, S.speed + SPEED_UP);
  updateHud();
}

/* po treningu: zjazd z placu -> ściemnienie -> wjazd na turniej -> premia -> pytanie o wpisowe */
function updateWin() {
  if (Game.scene === 'training') {
    if (S.x > Game.W + 10) startTransition('tournament', () => { S.x = -14; S.goal = Math.round(Game.W * .4); S.parts = []; });
  } else if (S.goal !== null && S.x >= S.goal) {
    S.x = S.goal; S.arrived = true; S.askT = 2.1; // pytanie dopiero, gdy zniknie komunikat o premii
    S.coins += ENTRY_BONUS;
    for (let i = 0; i < ENTRY_BONUS; i++) S.parts.push({ x: S.x - 2 + i * 4, y: knightY() - 26, vx: (i - .5) * 16, vy: -40, c: COIN_C, s: 2, life: 1.2, kind: 'coin' });
    sfxCoin();
    toast('WITAJ NA TURNIEJU! +' + ENTRY_BONUS + ' MONETY ZA UKOŃCZENIE TRENINGU');
    updateHud();
  }
}

function updateGame(dt) {
  updateTransition(dt);
  if (S.duel) updateDuel(dt);
  else if (inTown()) walkTown(dt);
  else if (riding()) {
    const v = knightSpeed();
    S.x += v * dt; S.walk += v * dt * .45;
    if (S.over) updateWin();
    else {
      if (!S.hitPass && !S.missPass && S.x - 3 > dummyX() + 5) { S.missPass = true; doMiss(); }
      if (S.x > Game.W + 10) nextPass();
    }
  }
  updatePlayerGuard(dt); // blok klawiszem B
  updateEnergy(dt);      // energia w walce
  if (S.swing) {
    S.at += dt / SWING_T;
    if (!S.struck && S.at >= STRIKE_AT) { S.struck = true; checkHit(); }
    if (S.at >= 1) { S.swing = false; S.at = 0; }
  }
  if (weapon() !== 'sword' && !S.over) {
    updateLance(dt, LANCES[weapon()]);
    if (riding()) checkLanceHit();
  }
  if (S.cool > 0) S.cool -= dt;
  S.dummyHitT += dt;
  if (S.arrived && S.askT > 0 && (S.askT -= dt) <= 0) openEntry(); // po chwili: pytanie o wpisowe
  if (S.arrived && (S.over === 'won' && S.entry !== 'declined' || S.over === 'champion') && Math.random() < dt * 10) { // iskry nad uniesioną kopią
    const g = lanceGeom(Math.round(S.x), knightY(), LANCE_UP, LANCES.kopia.len);
    S.parts.push({ x: g.tx + (Math.random() - .5) * 6, y: g.ty + (Math.random() - .5) * 4, vx: (Math.random() - .5) * 20, vy: -20 - Math.random() * 20, c: '#fff3a0', s: 1, life: .5, kind: 'spark' });
  }
  const surf = Game.surf;
  for (let i = S.parts.length - 1; i >= 0; i--) {
    const p = S.parts[i];
    p.life -= dt; p.vy += GRAV * (p.kind === 'spark' ? .1 : 1) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y > surf - p.s && p.vy > 0) { // ziemia
      if (p.kind === 'coin' && Math.abs(p.vy) > 30) { p.y = surf - p.s; p.vy *= -.45; p.vx *= .6; }
      else { p.y = surf - p.s; p.vy = 0; p.vx = 0; }
    }
    if (p.life <= 0) S.parts.splice(i, 1);
  }
  for (let i = S.pops.length - 1; i >= 0; i--) { S.pops[i].t += dt; if (S.pops[i].t > 1.8) S.pops.splice(i, 1); }
  updateScenery(dt);
}
