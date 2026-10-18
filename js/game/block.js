'use strict';
/* Blok (klawisz B, trzymany): tylko w walce na miecze — pieszo i konno z mieczem. Przy lancy i kopii bloku nie ma.
   Tarcza zatrzymuje każdy cios, sam miecz (bez tarczy) tylko część (SWORD_PARRY) — większość ciosów przechodzi.
   W bloku tarcza wysuwa się przed rycerza, a miecz cofa się do góry (bez tarczy miecz staje pionowo przed rycerzem).
   Ręka się męczy: po GUARD_HOLD s blok opada i trzeba chwilę odpocząć. Te same zasady ma przeciwnik. */
const GUARD_UP = .12, GUARD_DOWN = .15;   // wysuwanie / chowanie tarczy (s)
const GUARD_ON = .6;                      // od takiego wysunięcia blok działa
const GUARD_HOLD = 1.6, GUARD_REST = .7;  // jak długo da się trzymać blok i odpoczynek po zmęczeniu (s)
const SWORD_PARRY = .25;                  // szansa, że sam miecz zatrzyma cios
const GUARD_A = [-1.45, -2.3];            // kąt miecza w bloku: bez tarczy (pionowo z przodu) / z tarczą (cofnięty)
const BLOCK_SPEED = .5;                   // pieszo w bloku rycerz chodzi wolniej
const BLOCK_PUSH = 3;                     // odrzut po zablokowanym ciosie (px)
const BLOCK_C = ['#ffffff', '#c0c7d4', '#eef3ff'];

const newGuard = () => ({ k: 0, hold: 0, rest: 0 }); // k: 0 = tarcza przy boku, 1 = wysunięta
const canBlock = () => !!S.duel && weapon() === 'sword';
const guardUp = g => g.k >= GUARD_ON;
const hasShield = () => S.gear >= 1; // przeciwnik ma ten sam rynsztunek
/* want: rycerz chce blokować; zwraca true, gdy ręka właśnie się zmęczyła i blok opadł */
function updateGuard(g, want, dt) {
  if (g.rest > 0) { g.rest -= dt; want = false; }
  if (want) {
    g.k = Math.min(1, g.k + dt / GUARD_UP);
    if ((g.hold += dt) >= GUARD_HOLD) { g.rest = GUARD_REST; g.hold = 0; return true; }
  } else {
    g.k = Math.max(0, g.k - dt / GUARD_DOWN);
    g.hold = Math.max(0, g.hold - dt); // odpuszczenie na chwilę nie odnawia od razu sił
  }
  return false;
}
/* czy blok zatrzymał cios: tarcza zawsze, sam miecz czasem */
const guardStops = g => guardUp(g) && (hasShield() || Math.random() < SWORD_PARRY);
/* kąt miecza w bloku */
const guardAngle = (ang, g) => g.k > 0 ? lerp(ang, GUARD_A[hasShield() ? 1 : 0], fade(g.k)) : ang;

/* gracz: B trzymane, w walce na miecze, poza zamachem */
function updatePlayerGuard(dt) {
  const D = S.duel, active = D && (D.foot ? D.phase === 'fight' : D.phase === 'ride');
  const want = active && canBlock() && Held.has('KeyB') && !S.swing;
  if (updateGuard(S.guard, want, dt)) toast('RĘKA ZMĘCZONA — BLOK OPADA');
}
const playerBlocking = () => canBlock() && Held.has('KeyB');

/* zablokowany cios: iskry przy tarczy, brzęk, lekki odrzut obrońcy */
function blockFx(x, y, dir) {
  burst(x, y, 8, BLOCK_C, dir);
  sfxBlock();
}
