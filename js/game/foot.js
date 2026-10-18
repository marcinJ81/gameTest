'use strict';
/* Walka piesza na turnieju, sterowana przez gracza: → do przodu, ← do tyłu, SPACJA cios, B blok (block.js).
   Perspektywa jednowymiarowa: rycerze stoją na jednej linii, jedynym unikiem jest odskok w tył.
   Rycerze wchodzą z boków i stają naprzeciw siebie na środku. Przeciwnik podchodzi, bierze zamach
   (widać uniesiony miecz), tnie i odskakuje — trzeba trafić i uskoczyć, zanim odda.
   Koniec: 10 trafień albo pasek życia na zero. Od 5 trafień trafiony może się poddać. Ciosy męczą (stamina.js). */
const FOOT_WALK_IN = 50;                  // px/s, wejście na środek
const FOOT_SPEED = 26;                    // px/s, przód / tył
const FOOT_GAP = 6;                       // rycerze nie wchodzą na siebie
const FOOT_HITS = 10, YIELD_AT = 5;       // trafienia do wygranej / od ilu trafień można się poddać
const FOOT_INV = .5;                      // po trafieniu chwila bez kolejnych obrażeń (s)
const FOOT_PUSH = 7, PUSH_V = 45;         // odrzut trafionego (px) i jego prędkość (px/s)
const AI_MISS_FAR = 7;                    // pudłujący przeciwnik tnie z za daleka (px)
const FOOT_KEYS = '<kbd>→</kbd> NAPRZÓD <kbd>←</kbd> W TYŁ <kbd>SPACJA</kbd> CIOS <kbd>B</kbd> BLOK';
const Held = new Set();                   // wciśnięte strzałki (input.js)

const onFoot = () => !!(S.duel && S.duel.foot);
/* zasięg ostrza w chwili uderzenia: [od, do] px przed rycerzem (ta sama geometria co checkHit) */
function swordReach() {
  const L = SWORD_LEN[hasGood() ? 1 : 0], g = swordGeom(0, 0, swingAngle(STRIKE_AT), L);
  const a = g.hx + g.c * L * .5, b = g.tx + 1;
  return [Math.min(a, b) - 3, Math.max(a, b) + 3];
}

/* początek walki pieszej: od razu (bez konia) albo po zejściu z koni */
function setupFoot() {
  const D = S.duel, W = Game.W;
  D.foot = true; D.phase = 'walkin'; D.t = 0;
  S.x = -8; D.ox = W + 8;
  D.goal = Math.round(W / 2 - 14); D.ogoal = Math.round(W / 2 + 14);
  S.swing = false; S.cool = 0; S.inv = D.oinv = 0; S.push = D.opush = 0;
  S.guard = newGuard(); D.oguard = newGuard();
  D.oSwing = false; D.ai = { st: 'idle', t: 1 }; D.owalk = 0; // krok przeciwnika (bez tego NaN: nogi znikały w ruchu)
  D.moving = D.omoving = true; D.askP = D.askO = false;
  S.parts = [];
  setHint(FOOT_KEYS);
  updateHud();
}

function updateFoot(dt) {
  const D = S.duel;
  D.hurtT += dt; D.ohurtT += dt;
  if (D.phase === 'walkin') {
    const step = FOOT_WALK_IN * dt;
    S.x = Math.min(D.goal, S.x + step); D.ox = Math.max(D.ogoal, D.ox - step);
    S.walk += step * .45; D.owalk += step * .45;
    if (S.x >= D.goal && D.ox <= D.ogoal) {
      D.phase = 'fight'; D.moving = D.omoving = false; D.t = 2.5;
      toast('DO WALKI!' + (D.hint ? ' SPACJA PRZY FLADZE' : ''));
    }
    return;
  }
  if (D.phase === 'monit') { if (!Yield.open && (D.t -= dt) <= 0) rivalDecided(); return; }
  if (D.phase !== 'fight') { D.moving = D.omoving = false; return; }
  if (D.t > 0 && (D.t -= dt) <= 0) setHint(null);
  // gracz
  const mx = Held.has('ArrowRight') - Held.has('ArrowLeft'), v = FOOT_SPEED * (S.guard.k > 0 ? BLOCK_SPEED : 1) * enMove(S.en);
  S.x += mx * v * dt;
  D.moving = !!mx;
  if (D.moving) S.walk += v * dt * .45;
  updateFootRival(dt);
  // odrzut po trafieniu
  const p = Math.min(S.push, PUSH_V * dt), op = Math.min(D.opush, PUSH_V * dt);
  S.x -= p; S.push -= p; D.ox += op; D.opush -= op;
  // plac i odstęp między rycerzami (przeciwnik stoi twardo, gracz się zatrzymuje)
  D.ox = clamp(D.ox, 4 + FOOT_GAP, Game.W - 4);
  S.x = clamp(Math.min(S.x, D.ox - FOOT_GAP), 4, Game.W - 4);
  if (D.ox - S.x < FOOT_GAP) D.ox = S.x + FOOT_GAP;
  S.inv -= dt; D.oinv -= dt;
}

/* AI: czeka → podchodzi na odległość ciosu (pudłujący: z za daleka) → zamach → cios → odskok.
   Skuteczność rycerza (30 / 60 / 90%) decyduje o celności, umiejętności (league.js) o reszcie:
   atak — krótsze czekanie, szybsze podejście i zamach; blok i unik — reakcja na zamach gracza;
   kontra — po odskoku albo bloku od razu naciera, a z uniesionym mieczem czeka, aż gracz opuści tarczę. */
function updateFootRival(dt) {
  const D = S.duel, A = D.ai, sk = D.sk, gap = D.ox - S.x;
  const [lo, hi] = swordReach(), sweet = (lo + hi) / 2;
  let mx = 0;
  if (A.st === 'idle') {
    const tired = !canStrike(D.oen);
    if (gap < hi + (tired ? 14 : 4)) mx = 1; // trzyma dystans, zmęczony odchodzi dalej i odpoczywa
    if (!tired && !canStrike(S.en) && Math.random() < sk.counter * dt * 3) A.t = 0; // gracz bez sił: lepsi od razu atakują
    if ((A.t -= dt) <= 0 && !tired) rivalAttack(A);
  } else if (A.st === 'approach') {
    const want = sweet + (A.will ? 0 : AI_MISS_FAR);
    mx = gap > want + 1 ? -1 : gap < want - 1 ? 1 : 0;
    if (Math.abs(gap - want) <= 1.5 || (A.t -= dt) <= 0) {
      A.st = 'windup'; A.t = .6 - .3 * sk.attack; A.wait = sk.counter * 1.2; // im lepszy rycerz, tym krótszy zamach
    }
  } else if (A.st === 'windup') {
    if (guardUp(S.guard) && A.wait > 0) A.wait -= dt; // gracz za tarczą: cierpliwy rycerz czeka z ciosem
    else if ((A.t -= dt) <= 0) { A.st = 'swing'; D.oSwing = true; D.oAt = SW_T[1]; D.oStruck = false; D.oen -= EN_COST; sfxSwing(); }
  } else if (A.st === 'swing') {
    D.oAt += dt / SWING_T;
    if (!D.oStruck && D.oAt >= STRIKE_AT) { D.oStruck = true; if (gap >= lo && gap <= hi) footHitPlayer(); }
    if (D.oAt >= 1) { D.oSwing = false; A.st = 'retreat'; A.t = .2 + Math.random() * .2; }
  } else if (A.st === 'retreat') {
    mx = 1.3;
    if ((A.t -= dt) <= 0) rivalRecover(A);
  } else if (A.st === 'guard') {
    if ((A.t -= dt) <= 0 || D.oguard.rest > 0) rivalRecover(A); // koniec bloku albo zmęczona ręka
  }
  updateGuard(D.oguard, A.st === 'guard', dt);
  const v = (16 + 14 * sk.attack) * (A.st === 'guard' ? BLOCK_SPEED : 1) * enMove(D.oen);
  D.ox += mx * v * dt;
  D.omoving = !!mx;
  if (D.omoving) D.owalk += Math.abs(mx) * v * dt * .45;
}
/* natarcie: podejście na odległość ciosu (tylko z siłą na cios) */
function rivalAttack(A) {
  if (!canStrike(S.duel.oen)) { A.st = 'idle'; A.t = .3; return; }
  A.st = 'approach'; A.will = Math.random() < S.duel.sk.acc; A.t = 3;
}
/* po odskoku / bloku: kontra (od razu natarcie) albo chwila czekania — krótsza u rycerza z wyższym atakiem */
function rivalRecover(A) {
  const sk = S.duel.sk;
  if (Math.random() < sk.counter) rivalAttack(A);
  else { A.st = 'idle'; A.t = lerp(1.3, .3, sk.attack) + Math.random() * .4; }
}
/* gracz bierze zamach: przeciwnik w zasięgu zasłania się tarczą albo odskakuje (zależnie od umiejętności) */
function rivalReact() {
  const D = S.duel, A = D.ai, sk = D.sk;
  if ((A.st !== 'idle' && A.st !== 'approach') || D.ox - S.x > swordReach()[1] + 8) return;
  const r = Math.random(), pb = sk.block * .6, pd = sk.dodge * .5;
  if (r < pb) { A.st = 'guard'; A.t = .45 + Math.random() * .2; }
  else if (r < pb + pd) { A.st = 'retreat'; A.t = .25; }
}

/* gracz trafia przeciwnika (z checkHit); trafienie przerywa jego zamach */
function footHitRival() {
  const D = S.duel;
  if (D.phase !== 'fight' || D.oinv > 0) return;
  if (guardStops(D.oguard)) { // przeciwnik zablokował: odrzut i szybka kontra
    D.opush = BLOCK_PUSH; D.oinv = FOOT_INV * .5; D.ai.t = Math.min(D.ai.t, .15);
    blockFx(D.ox - 4, Game.surf - 12, 1);
    toast('PRZECIWNIK BLOKUJE');
    return;
  }
  D.fp++; D.ohp = Math.max(0, D.ohp - damage()); D.ohurtT = 0; D.oinv = FOOT_INV; D.opush = FOOT_PUSH;
  if (D.ai.st === 'windup' || D.ai.st === 'swing') { D.oSwing = false; D.ai.st = 'retreat'; D.ai.t = .4; }
  sfxHit(); sfxChime();
  burst(D.ox, Game.surf - 12, 10, ['#ffffff', '#fff3a0', '#ffd23d'], 1);
  updateHud();
  footCheck();
}
function footHitPlayer() {
  const D = S.duel;
  if (S.inv > 0) return;
  if (guardStops(S.guard)) { // tarcza (albo miecz) zatrzymała cios
    S.push = BLOCK_PUSH; S.inv = FOOT_INV * .5;
    blockFx(S.x + 4, Game.surf - 12, -1);
    toast('ZABLOKOWANE!');
    return;
  }
  D.fo++; D.hp = Math.max(0, D.hp - damage()); D.hurtT = 0; S.inv = FOOT_INV; S.push = FOOT_PUSH;
  sfxHit();
  burst(S.x, Game.surf - 12, 10, ['#ffffff', '#ff5a5a', '#fff3a0'], -1);
  updateHud();
  footCheck();
}

/* po trafieniu: koniec walki (10 trafień / pasek na zero) albo poddanie. Przeciwnik od 5. trafienia po każdym
   kolejnym może się poddać — im niżej w tabeli, tym częściej (league.js). Gracz dostaje pytanie raz, przy 5. */
function footCheck() {
  const D = S.duel;
  if (D.fp >= FOOT_HITS || D.ohp <= 0) finishFight(true);
  else if (D.fo >= FOOT_HITS || D.hp <= 0) finishFight(false);
  else if (D.fp >= YIELD_AT && D.lastAsk !== D.fp) {
    D.lastAsk = D.fp; // jedno losowanie na trafienie
    if (Math.random() < yieldChance(S.tour, D.opp)) {
      D.yields = true;
      pauseFoot(2.6);
      showMonit(D.fp + ' TRAFIEŃ NA PRZECIWNIKU', D.opp.name.toUpperCase() + ' PODDAJE SIĘ!', false);
    } else if (!D.askP) { D.askP = true; toast('NIE PODDAJE SIĘ — WALCZY DALEJ'); }
  } else if (D.fo >= YIELD_AT && !D.askO) {
    D.askO = true;
    pauseFoot(0);
    showMonit(D.fo + ' TRAFIEŃ NA TOBIE', D.opp.name.toUpperCase() + ' TRAFIŁ CIĘ ' + D.fo + ' RAZY', true);
  }
}
function pauseFoot(t) {
  const D = S.duel;
  D.phase = 'monit'; D.t = t; D.oSwing = false; D.ai.st = 'idle'; D.ai.t = .8;
  S.swing = false; S.at = 0; Held.clear();
}
/* koniec komunikatu: przeciwnik się poddał albo walczy dalej */
function rivalDecided() {
  const D = S.duel;
  closeMonit();
  if (D.yields) finishFight(true, 'PRZECIWNIK SIĘ PODDAJE');
  else { D.phase = 'fight'; toast('WALKA TRWA!'); }
}
/* wybór gracza w oknie poddania */
function yieldPicked(yes) {
  const D = S.duel;
  closeMonit();
  if (!D) return;
  if (yes) finishFight(false, 'PODDAJESZ SIĘ');
  else { D.phase = 'fight'; toast('WALCZYSZ DALEJ!'); }
}

/* okno na środku pola: sam komunikat albo pytanie TAK / NIE (gracz) */
const Yield = makeDialog('#yield', yieldPicked);
function showMonit(title, text, ask) {
  $('#yieldTitle').textContent = title;
  $('#yieldText').textContent = text;
  $('#yieldAsk').hidden = !ask;
  if (ask) Yield.show(1); // domyślnie NIE
  else Yield.el.hidden = false;
  ask ? sfxLose() : sfxChime();
}
function closeMonit() { Yield.close(); }
