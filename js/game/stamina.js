'use strict';
/* Energia w walce na miecze (pieszo i konno z mieczem): zabezpieczenie przed ciągłym zadawaniem ciosów.
   Każdy zamach (też w powietrze) zabiera EN_COST, a zamach wymaga co najmniej EN_COST. Z pełnym paskiem są
   trzy ciosy z rzędu, potem zostaje 10% i trzeba odpocząć: stać, blokować albo się cofać (to nie męczy).
   Energia wraca cały czas poza zamachem. Czas odzyskania siły na jeden cios zależy od rynsztunku (9 poziomów:
   sam miecz najdłużej, pełny rynsztunek z kopią najkrócej). Ciągła szarża się nie opłaca:
   - poniżej 50% energii rycerz chodzi o połowę wolniej (pieszo),
   - zejście do 10% to wyczerpanie: energia wraca o połowę wolniej, dopóki znów nie starczy na cios.
   Przeciwnik ma tak samo (ten sam rynsztunek), ale jego paska gracz nie widzi. */
const EN_MAX = 100, EN_COST = 30;
const EN_TIME_WORST = 3.2, EN_TIME_STEP = .2; // s na jeden cios: sam miecz 3,2 s … pełny rynsztunek 1,6 s
const EN_SLOW = 50, EN_SLOW_MUL = .5;         // poniżej 50% energii: chód o połowę wolniejszy
const EN_EXHAUST = 10, EN_EXHAUST_MUL = .5;   // do 10%: wyczerpanie, odnawianie o połowę wolniejsze
const enTime = () => EN_TIME_WORST - EN_TIME_STEP * S.gear;
const canStrike = en => en >= EN_COST;
const enMove = en => en < EN_SLOW ? EN_SLOW_MUL : 1;
/* wyczerpanie zaczyna się przy 10% i trwa, aż energia znów starczy na cios */
const exhausted = (en, was) => en <= EN_EXHAUST || (was && !canStrike(en));
/* odpoczynek: energia wraca, gdy rycerz nie bierze zamachu (wyczerpany wolniej) */
const regen = (en, tired, swinging, dt) => swinging ? en
  : Math.min(EN_MAX, en + EN_COST / enTime() * (tired ? EN_EXHAUST_MUL : 1) * dt);

/* zamach gracza w walce na miecze: false = brak sił */
function spendPlayer() {
  if (!S.duel) return true;
  if (!canStrike(S.en)) { toast('BRAK SIŁ — ODPOCZNIJ: BLOK ALBO W TYŁ'); return false; }
  S.en -= EN_COST;
  return true;
}
function updateEnergy(dt) {
  const D = S.duel;
  if (!D) return;
  const was = S.enTired;
  S.enTired = exhausted(S.en, S.enTired); D.otired = exhausted(D.oen, D.otired);
  if (S.enTired && !was) toast('WYCZERPANY — ENERGIA WRACA WOLNIEJ');
  S.en = regen(S.en, S.enTired, S.swing, dt);
  D.oen = regen(D.oen, D.otired, D.oSwing, dt);
  updateEnergyBar();
}

/* pasek energii gracza pod paskiem życia (co klatkę, tylko gdy się zmienia) */
let enShown = '';
function updateEnergyBar() {
  const v = S.duel && weapon() === 'sword' ? Math.floor(S.en) : -1, key = v + (S.enTired ? 't' : '');
  if (key === enShown) return;
  enShown = key;
  $('#barMeEnRow').hidden = v < 0;
  if (v < 0) return;
  const fill = $('#barMeEn');
  fill.style.width = v + '%';
  fill.className = S.enTired || !canStrike(v) ? 'low' : v < EN_SLOW ? 'mid' : '';
  $('#barMeEnTxt').textContent = 'ENERGIA ' + v + '% · CIOSY ' + Math.floor(v / EN_COST)
    + (S.enTired ? ' · WYCZERPANY' : v < EN_SLOW ? ' · WOLNIEJ' : '');
}
