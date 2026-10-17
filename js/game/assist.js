'use strict';
/* Ułatwienie: po kilku pudłach pod rząd (albo na stałe, klawisz 1) przed kukłą pojawia się znacznik
   — gdy rycerz na nim stanie, trzeba wcisnąć SPACJĘ (miecz) albo X (lanca/kopia).
   Pozycja liczona z tej samej geometrii, której używa sprawdzanie trafienia. */
/* „słodki punkt” ostrza i grot opuszczonej broni — odległość od rycerza */
function swordSweet() {
  const L = SWORD_LEN[hasGood() ? 1 : 0], g = swordGeom(0, 0, swingAngle(STRIKE_AT), L);
  return (g.hx + g.c * L * .5 + g.tx + 1) / 2;
}
const lanceTip = () => lanceGeom(0, 0, LANCE_DOWN, LANCES[weapon()].len).tx;

/* gdzie stoi rycerz w chwili, gdy trzeba wcisnąć klawisz; na turnieju cel (przeciwnik) jedzie naprzeciw */
function assistMarkerX() {
  const v = knightSpeed(), vo = S.duel ? S.duel.vo : 0, close = v + vo;
  const sword = weapon() === 'sword';
  const off = sword ? swordSweet() : 3 + lanceTip();
  const lead = sword ? STRIKE_AT * SWING_T : LANCES[weapon()].lower * LANCE_HIT_K + .1;
  return Math.round(S.x + v * (targetX() - S.x - off - close * lead) / close);
}
/* trening: po pudłach albo stała (klawisz 1); turniej: w pierwszej walce (do pierwszej wygranej) */
const assistShown = () => S.duel ? S.duel.hint && S.duel.phase === 'ride' && !S.hitPass
  : (S.assist || Game.assistOn) && !S.over && !S.hitPass;
const assistReady = () => weapon() === 'sword' ? !S.swing && S.cool <= 0 : S.lance.st === 'up';

function drawAssist(ctx, t) {
  if (!assistShown()) return;
  const mx = assistMarkerX(), y = Game.surf, fx = Math.round(S.x);
  const now = Math.abs(fx - mx) <= 2, ready = assistReady();
  const col = !ready ? '#8a3a3a' : now ? '#ffffff' : '#ffd23d';
  // świecący pasek na ziemi
  if (now || (t * 3 | 0) % 2) { rect(ctx, mx - 2, y, 5, 1, col); rect(ctx, mx - 1, y + 1, 3, 1, col); }
  // chorągiewka na tyczce
  rect(ctx, mx, y - 10, 1, 10, '#7a4f2a');
  rect(ctx, mx - 3, y - 10, 3, 1, col); rect(ctx, mx - 2, y - 9, 2, 1, col); rect(ctx, mx - 1, y - 8, 1, 1, col);
}
/* strzałka „TERAZ” nad głową rycerza (rysowana po rycerzu, żeby nic jej nie zasłaniało) */
function drawAssistCue(ctx) {
  if (!assistShown() || !assistReady()) return;
  const fx = Math.round(S.x);
  if (Math.abs(fx - assistMarkerX()) > 2) return;
  const ay = knightY() - 27, c = '#ffffff';
  rect(ctx, fx - 2, ay, 5, 1, c); rect(ctx, fx - 1, ay + 1, 3, 1, c); rect(ctx, fx, ay + 2, 1, 1, c);
}
