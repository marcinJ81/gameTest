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
  $('#hPassL').textContent = D ? 'RUNDA' : 'PRZEJŚCIE';
  $('#hPass').textContent = D ? Math.min(D.round, D.rounds) + '/' + D.rounds : S.pass;
  $('#hBestL').textContent = D ? 'WYNIK' : 'REKORD';
  $('#hBest').textContent = D ? D.ps + ':' + D.os : S.best + '/' + GEAR.length;
  $('#gameTag').innerHTML = T ? T.name + '<span class="tag-sub"> · MIEJSCE ' + (T.pos + 1) + '/' + T.list.length + '</span>' : SCENE_TAG[Game.scene];
  $('#hWeapon').textContent = WEAPON_NAME[weapon()];
  $('#btnLower').hidden = weapon() === 'sword';
  renderInventory(); // okno ekwipunku nad grą
  $('#btnAssist').textContent = '[1] FLAGA: ' + (Game.assistOn ? 'ON' : 'OFF');
  $('#btnAssist').hidden = $('#btnQuit').hidden = !!(S.over || S.tour); // opcje treningu znikają po jego końcu
}
