'use strict';
/* HUD, podpowiedź i komunikaty */
let toastTimer = 0;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}
function setHint(html) {
  const el = $('#hint');
  if (html) { el.innerHTML = html; el.classList.remove('gone'); } else el.classList.add('gone');
}
function updateHud() {
  $('#hCoins').textContent = S.coins;
  $('#hGear').textContent = S.gear + '/' + GEAR.length;
  const D = S.duel, T = S.tour;
  const town = T && Game.scene === 'town'; // w miasteczku: bilans turnieju
  $('#hPassL').textContent = D ? (D.foot ? 'WALKA' : 'RUNDA') : town ? 'WYGRANE' : 'PRZEJŚCIE';
  $('#hPass').textContent = D ? (D.foot ? 'PIESZA' : D.round) : town ? T.wins : S.pass;
  $('#hBestL').textContent = D ? (D.foot ? 'TRAFIENIA' : 'WYNIK') : town ? 'PORAŻKI' : 'REKORD';
  $('#hBest').textContent = D ? (D.foot ? D.fp + ':' + D.fo : D.ps + ':' + D.os) : town ? T.losses : S.best + '/' + GEAR.length;
  updateBars(D);
  $('#gameTag').innerHTML = T && !town ? T.name + '<span class="tag-sub"> · MIEJSCE ' + (T.pos + 1) + '/' + T.list.length + '</span>' : SCENE_TAG[Game.scene];
  $('#hWeapon').textContent = WEAPON_NAME[weapon()];
  $('#btnLower').hidden = weapon() === 'sword';
  $('#btnBlock').hidden = !canBlock(); // blok tylko w walce na miecze
  renderInventory(); // okno ekwipunku nad grą
  $('#btnAssist').textContent = '[1] FLAGA: ' + ((D ? D.hint : Game.assistOn) ? 'ON' : 'OFF');
  $('#btnQuit').hidden = !!(S.over || S.tour); // koniec treningu: tylko na treningu
  $('#btnAssist').hidden = !D && !!(S.over || S.tour); // flaga: na treningu i w walkach turnieju
}

/* paski życia w walce (konnej i pieszej): gracz po lewej, przeciwnik po prawej;
   pieszo pod paskiem liczba trafień (10 = wygrana) */
function updateBars(D) {
  $('#bars').hidden = !D;
  if (!D) return;
  $('#barFoeName').textContent = D.opp.name.toUpperCase();
  // statystyki przeciwnika (energii przeciwnika gracz nie widzi)
  const sk = D.sk;
  $('#barFoeStats').textContent = 'POZIOM ' + skillLevel(sk) + ' · SKUT. ' + Math.round(sk.acc * 100) + '% · '
    + SKILLS.map(k => SKILL_NAME[k] + ' ' + Math.round(sk[k] * 100)).join(' · ');
  for (const [id, hp, hits] of [['Me', D.hp, D.fp], ['Foe', D.ohp, D.fo]]) {
    const fill = $('#bar' + id);
    fill.style.width = hp + '%';
    fill.className = hp > 50 ? '' : hp > 25 ? 'mid' : 'low';
    $('#bar' + id + 'Hp').textContent = hp + '/' + DUEL_HP;
    $('#bar' + id + 'Hits').textContent = D.foot ? 'TRAFIENIA ' + hits + '/' + FOOT_HITS : '';
  }
}
