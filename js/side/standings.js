'use strict';
/* Okno „TABELA TURNIEJU”. Na treningu: liga królewska (10 najlepszych). Po wpisowym: liga gracza
   z graczem na jego miejscu, podświetlonym bieżącym przeciwnikiem i pokonanymi rycerzami.
   Kolumna SKUT. = skuteczność rycerza: przed walką z nim szacunek z miejsca w tabeli (30 / 60 / 90%),
   od walki z nim — skuteczność wylosowana do tej walki (league.js, rivalSkill). */
function renderStandings() {
  const T = S && S.tour, list = T ? T.list : LEAGUES.royal.knights;
  const body = $('#tourneyBody'), scroll = $('#tourneyScroll');
  $('#tourneyTag').textContent = 'TABELA TURNIEJU · ' + (T ? T.name : LEAGUES.royal.name);
  body.innerHTML = '';
  let mine = null;
  list.forEach((k, i) => {
    const tr = document.createElement('tr');
    const foe = T && i === T.pos - 1 && (!S.over || S.over === 'town'); // następny przeciwnik także w miasteczku
    tr.className = k.me ? 'me' : foe ? 'foe' : k.beaten ? 'beaten' : '';
    tr.innerHTML = `<td class="n">${i + 1}.</td><td class="arms"><canvas width="7" height="9"></canvas></td><td class="who"></td><td class="pts"></td>`;
    tr.querySelector('.who').textContent = (foe ? '▶ ' : '') + k.name.toUpperCase();
    tr.querySelector('.pts').textContent = k.me ? T.wins + ' WYGR.' : k.beaten ? 'POKONANY' : Math.round(k.acc * 100) + '%';
    drawShield(tr.querySelector('canvas').getContext('2d'), 0, 0, k.me ? S.emblem : k.emblem);
    body.appendChild(tr);
    if (k.me) mine = tr;
  });
  // przewiń tak, żeby gracz i jego przeciwnik byli widoczni
  if (mine) scroll.scrollTop += mine.getBoundingClientRect().top - scroll.getBoundingClientRect().top - scroll.clientHeight / 2;
  else scroll.scrollTop = 0;
}
