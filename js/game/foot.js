'use strict';
/* Walka piesza na turnieju, sterowana przez gracza: → do przodu, ← do tyłu, SPACJA cios.
   Perspektywa jednowymiarowa: rycerze stoją na jednej linii, jedynym unikiem jest odskok w tył.
   Rycerze wchodzą z boków i stają naprzeciw siebie na środku. Przeciwnik podchodzi, bierze zamach
   (widać uniesiony miecz), tnie i odskakuje — trzeba trafić i uskoczyć, zanim odda.
   Koniec: 10 trafień albo pasek życia na zero. Po 7 trafieniach jedna ze stron może się poddać. */
const FOOT_WALK_IN = 50;                  // px/s, wejście na środek
const FOOT_SPEED = 26;                    // px/s, przód / tył
const FOOT_GAP = 6;                       // rycerze nie wchodzą na siebie
const FOOT_HITS = 10, YIELD_AT = 7;       // trafienia do wygranej / do pytania o poddanie
const FOOT_INV = .5;                      // po trafieniu chwila bez kolejnych obrażeń (s)
const FOOT_PUSH = 7, PUSH_V = 45;         // odrzut trafionego (px) i jego prędkość (px/s)
const AI_MISS_FAR = 7;                    // pudłujący przeciwnik tnie z za daleka (px)
const FOOT_KEYS = '<kbd>→</kbd> NAPRZÓD <kbd>←</kbd> W TYŁ <kbd>SPACJA</kbd> CIOS';
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
  D.oSwing = false; D.ai = { st: 'idle', t: 1 }; D.owalk = 0; // krok przeciwnika (bez tego NaN: nogi znikały w ruchu)
  D.moving = D.omoving = true; D.ask7p = D.ask7o = false;
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
  const mx = Held.has('ArrowRight') - Held.has('ArrowLeft');
  S.x += mx * FOOT_SPEED * dt;
  D.moving = !!mx;
  if (D.moving) S.walk += FOOT_SPEED * dt * .45;
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
   Skuteczność rycerza (30 / 60 / 90%) decyduje o celności, szybkości i krótszym zamachu. */
function updateFootRival(dt) {
  const D = S.duel, A = D.ai, acc = D.opp.acc, gap = D.ox - S.x;
  const [lo, hi] = swordReach(), sweet = (lo + hi) / 2;
  let mx = 0;
  if (A.st === 'idle') {
    if (gap < hi + 4) mx = 1; // trzyma dystans
    if ((A.t -= dt) <= 0) { A.st = 'approach'; A.will = Math.random() < acc; A.t = 3; }
  } else if (A.st === 'approach') {
    const want = sweet + (A.will ? 0 : AI_MISS_FAR);
    mx = gap > want + 1 ? -1 : gap < want - 1 ? 1 : 0;
    if (Math.abs(gap - want) <= 1.5 || (A.t -= dt) <= 0) {
      A.st = 'windup'; A.t = .6 - .3 * acc; // im lepszy rycerz, tym krótszy zamach
    }
  } else if (A.st === 'windup') {
    if ((A.t -= dt) <= 0) { A.st = 'swing'; D.oSwing = true; D.oAt = SW_T[1]; D.oStruck = false; sfxSwing(); }
  } else if (A.st === 'swing') {
    D.oAt += dt / SWING_T;
    if (!D.oStruck && D.oAt >= STRIKE_AT) { D.oStruck = true; if (gap >= lo && gap <= hi) footHitPlayer(); }
    if (D.oAt >= 1) { D.oSwing = false; A.st = 'retreat'; A.t = .2 + Math.random() * .2; }
  } else if (A.st === 'retreat') {
    mx = 1.3;
    if ((A.t -= dt) <= 0) { A.st = 'idle'; A.t = .7 - .4 * acc + Math.random() * .4; }
  }
  const v = 16 + 12 * acc;
  D.ox += mx * v * dt;
  D.omoving = !!mx;
  if (D.omoving) D.owalk += Math.abs(mx) * v * dt * .45;
}
/* gracz bierze zamach: lepsi rycerze czasem odskakują */
function rivalDodge() {
  const A = S.duel.ai;
  if ((A.st === 'idle' || A.st === 'approach') && Math.random() < (S.duel.opp.acc - .3) * .6) { A.st = 'retreat'; A.t = .25; }
}

/* gracz trafia przeciwnika (z checkHit); trafienie przerywa jego zamach */
function footHitRival() {
  const D = S.duel;
  if (D.phase !== 'fight' || D.oinv > 0) return;
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
  D.fo++; D.hp = Math.max(0, D.hp - damage()); D.hurtT = 0; S.inv = FOOT_INV; S.push = FOOT_PUSH;
  sfxHit();
  burst(S.x, Game.surf - 12, 10, ['#ffffff', '#ff5a5a', '#fff3a0'], -1);
  updateHud();
  footCheck();
}

/* po trafieniu: koniec walki (10 trafień / pasek na zero) albo pytanie o poddanie po 7 trafieniach */
function footCheck() {
  const D = S.duel;
  if (D.fp >= FOOT_HITS || D.ohp <= 0) finishFight(true);
  else if (D.fo >= FOOT_HITS || D.hp <= 0) finishFight(false);
  else if (D.fp >= YIELD_AT && !D.ask7p) {
    D.ask7p = true; D.yields = Math.random() < D.opp.yieldP;
    pauseFoot(2.6);
    showMonit('7 TRAFIEŃ NA PRZECIWNIKU', D.opp.name.toUpperCase() + (D.yields ? ' PODDAJE SIĘ!' : ' NIE PODDAJE SIĘ — WALKA TRWA'), false);
  } else if (D.fo >= YIELD_AT && !D.ask7o) {
    D.ask7o = true;
    pauseFoot(0);
    showMonit('7 TRAFIEŃ NA TOBIE', D.opp.name.toUpperCase() + ' TRAFIŁ CIĘ 7 RAZY', true);
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
