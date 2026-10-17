# Iteracja 7 — każde ukończenie treningu prowadzi na turniej, wpisowe

Data: 2026-10-16

## Cel
Trening zawsze kończy się wyjazdem na turniej, nie tylko po pełnym sukcesie. Na turnieju gracz dostaje
premię za ukończenie treningu i decyduje, czy zapłaci wpisowe.

## Zakończenie treningu (dwie drogi)
- **Pełny sukces** (`S.over = 'won'`): cały rynsztunek (8/8) i trafienie kopią. Bez zmian względem iteracji 6.
- **Koniec monet** (`S.over = 'out'`): pudło przy 0 monetach. Dotąd był to koniec gry i utrata broni.
  Teraz trening się kończy, rycerz **zachowuje broń** i jedzie na turniej z tym, co zdobył,
  np. bez monet i z samym mieczem. Komunikat: „BRAK MONET — KONIEC TRENINGU, JEDZIESZ NA TURNIEJ”.

Obie drogi kończą się tak samo: zjazd z placu, ściemnienie i wjazd na turniej.

## Wejście na turniej
1. Rycerz staje na polu. Dostaje **+2 monety** za ukończenie treningu (`ENTRY_BONUS`).
   Nad nim podskakują dwie monety, a komunikat brzmi „WITAJ NA TURNIEJU! +2 MONETY ZA UKOŃCZENIE TRENINGU”.
2. Po 2,1 s, gdy komunikat zniknie, na środku pola pojawia się **okno wpisowego**:
   - półprzezroczysta zasłona na całym polu gry, pod nią widać turniej;
   - ramka w stylu gry: „TURNIEJ RYCERSKI”, „WPISOWE: 2 MONETY” (`ENTRY_FEE`), „MASZ: N MONET”,
     pytanie „CZY WCHODZISZ DO TURNIEJU?”;
   - opcje **TAK / NIE**. Domyślnie zaznaczone jest TAK.
   - **← →** zmienia wybór, **ENTER** zatwierdza. Można też kliknąć lub dotknąć opcję.
     Najechanie myszą zaznacza opcję.
   - Gdy okno jest otwarte, spacja, X i klik w pole nie działają. **R** (od nowa) i **M** (dźwięk) działają dalej.
3. **TAK**: monety −2, dźwięk monety i fanfara, podpowiedź „WCHODZISZ DO TURNIEJU! CIĄG DALSZY WKRÓTCE”.
4. **NIE**: monety zostają, smutny dźwięk, podpowiedź „REZYGNACJA Z TURNIEJU. R OD NOWA”.

Dzięki premii gracza zawsze stać na wpisowe, bo ma co najmniej 0 + 2 monety.
Gdyby kiedyś było go nie stać, przycisk TAK jest wyszarzony i nieaktywny.

Polska odmiana słowa: 1 MONETA, 2–4 MONETY, 5+ MONET (`coinWord`).

## Zmiany w plikach
- **nowe** `js/game/entry.js`: okno wpisowego (`openEntry`, `closeEntry`, `selectEntry`, `moveEntry`,
  `confirmEntry`, `entryKey`, `coinWord`).
- **nowe** `css/entry.css`: wygląd okna (zasłona, ramka, wyróżniona opcja, wersja na telefon).
- `index.html`: znaczniki okna w panelu gry, nowy arkusz i skrypt.
- `js/game/data.js`: `ENTRY_BONUS`, `ENTRY_FEE`. Usunięte `WEAPON_LOST`.
- `js/game/logic.js`: stan `'out'` zamiast `'lost'`. `riding()` obejmuje oba zakończenia.
  Premia i odliczanie do okna w `updateWin()`. Nowe pola `entry` i `askT`.
  Iskry nad kopią są tylko po pełnym sukcesie i nie po rezygnacji. `resetGame` zamyka okno.
- `js/game/input.js`: gdy okno jest otwarte, klawisze trafiają najpierw do `entryKey`. Klik w pole jest ignorowany.
- `js/game/render.js`, `knight.js`, `lance.js`: usunięte rysowanie upuszczonej broni (nie ma już przegranej).
- `css/game-ui.css`: komunikat (toast) jest nad oknem (z-index 5).

## Weryfikacja
Headless Chrome 1366×768 i 520×1100, bez błędów JS:
- koniec monet: `over=out`, turniej, okno otwarte, 2 monety; TAK + ENTER → `entry=paid`, 0 monet;
- pełny sukces: 4 → 6 monet; → + ENTER → `entry=declined`, 6 monet;
- spacja i X przy otwartym oknie nic nie robią; R zamyka okno i wraca na trening.

## Uwagi / na później
- Po TAK gra na razie się zatrzymuje („ciąg dalszy wkrótce”). Właściwy turniej będzie w kolejnych zadaniach.
