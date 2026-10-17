'use strict';
/* Wpisowe do turnieju: okno na środku pola turniejowego, TAK / NIE (pokazuje ligę i miejsce startowe).
   Strzałki ← → zmieniają wybór, ENTER zatwierdza (klik / dotyk na przycisku też). */
const Entry = { el: $('#entry'), opts: [...document.querySelectorAll('#entry .opt')], sel: 0, open: false };

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
  Entry.open = true;
  Entry.el.hidden = false;
  selectEntry(can ? 0 : 1);
  setHint(null);
}
function closeEntry() { Entry.open = false; Entry.el.hidden = true; }

function selectEntry(i) {
  if (Entry.opts[i].disabled) return;
  Entry.sel = i;
  Entry.opts.forEach((o, k) => o.classList.toggle('on', k === i));
}
function moveEntry(d) {
  const i = clamp(Entry.sel + d, 0, Entry.opts.length - 1);
  if (i !== Entry.sel && !Entry.opts[i].disabled) { selectEntry(i); sfxSwing(); }
}

function confirmEntry() {
  if (!Entry.open) return;
  closeEntry();
  if (Entry.opts[Entry.sel].dataset.v === 'yes') {
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

/* klawisze w trakcie pytania; zwraca true, gdy klawisz został obsłużony */
function entryKey(e) {
  if (!Entry.open) return false;
  if (/^[rRmM]$/.test(e.key)) return false; // reset i dźwięk działają dalej
  if (e.key === 'ArrowLeft') moveEntry(-1);
  else if (e.key === 'ArrowRight') moveEntry(1);
  else if (e.key === 'Enter') { if (!e.repeat) confirmEntry(); }
  if (/^(Arrow|Enter$| $)/.test(e.key)) e.preventDefault(); // bez przewijania strony i bez kliku w przycisk z fokusem
  return true; // spacja, X itp. nie działają, dopóki okno jest otwarte
}
Entry.opts.forEach((o, i) => o.addEventListener('click', e => { e.stopPropagation(); selectEntry(i); confirmEntry(); }));
Entry.opts.forEach((o, i) => o.addEventListener('pointerenter', () => selectEntry(i)));
