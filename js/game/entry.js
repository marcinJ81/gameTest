'use strict';
/* Wpisowe do turnieju: okno na środku pola turniejowego, TAK / NIE (pokazuje ligę i miejsce startowe).
   Obsługa wyboru (strzałki, ENTER, klik): dialog.js. */
const Entry = makeDialog('#entry', confirmEntry);

/* 1 MONETA, 2-4 MONETY, 5+ MONET (ale 12-14 MONET) */
function coinWord(n) {
  if (n === 1) return 'MONETA';
  const d = n % 10, dd = n % 100;
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? 'MONETY' : 'MONET';
}

function openEntry() {
  const can = S.coins >= ENTRY_FEE;
  S.entry = 'ask';
  $('#entryFee').textContent = ENTRY_FEE + ' ' + coinWord(ENTRY_FEE);
  $('#entryCoins').textContent = S.coins + ' ' + coinWord(S.coins);
  const key = leagueFor(S.gear), n = LEAGUES[key].knights.length;
  $('#entryLeague').textContent = LEAGUES[key].name;
  $('#entryRank').textContent = (startIndex(key, S.gear) + 1) + ' / ' + (n + 1);
  Entry.opts[0].disabled = !can;
  Entry.show(can ? 0 : 1);
  setHint(null);
}
function closeEntry() { Entry.close(); }

function confirmEntry(yes) {
  if (yes) {
    S.entry = 'paid'; S.coins -= ENTRY_FEE;
    sfxCoin(); sfxChime();
    toast('WPISOWE ZAPŁACONE: -' + ENTRY_FEE + ' ' + coinWord(ENTRY_FEE));
    startTournament();
  } else {
    S.entry = 'declined';
    sfxLose();
    toast('REZYGNUJESZ Z TURNIEJU');
    setHint('REZYGNACJA Z TURNIEJU. <kbd>R</kbd> OD NOWA');
  }
  updateHud();
}
