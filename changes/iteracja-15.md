# Iteracja 15 — poddanie od 5 trafień, siła przeciwników z przebiegu turnieju, pasek energii

Data: 2026-10-18

## Poddanie się (`foot.js`, `league.js`)
- Przeciwnik może się poddać, gdy ma na sobie **co najmniej 5 trafień** (wcześniej 7). Losowanie odbywa się
  **po każdym kolejnym trafieniu** (5., 6., 7. …).
- Szansa zależy od jego **miejsca w tabeli**: im niżej, tym częściej się poddaje, a im wyżej, tym częściej walczy
  do końca. Na jedno trafienie:

  | Miejsce (liga giermków) | 1. | 6. | 11. | 16. | 20. |
  |---|---|---|---|---|---|
  | szansa | 0% | 8% | 23% | 42% | 60% |

- Gdy przeciwnik się poddaje, pojawia się okno „6 TRAFIEŃ NA PRZECIWNIKU · … PODDAJE SIĘ!” i gracz wygrywa.
  Przy pierwszej odmowie jest tylko krótki komunikat „NIE PODDAJE SIĘ — WALCZY DALEJ”, bez przerywania walki.
- Gracz dostaje pytanie „CZY SIĘ PODDAJESZ?” raz, przy **5. trafieniu** na sobie (dla symetrii, wcześniej przy 7.).
- Z tabeli zniknęło stare stałe poddawanie według trzech grup (dół zawsze, środek 50%, góra nigdy).

## Siła przeciwnika zależy od przebiegu turnieju (`league.js`)
- Statystyki przeciwnika (poziom, skuteczność, atak, blok, unik, kontra) **losują się przed każdą walką**
  z bieżącej trudności turnieju, a nie z miejsca w tabeli:
  - **start**: liga giermków (20) od najsłabszych, czyli pierwsza walka jest prosta (poziom 1).
    Liga rycerska (15) i królewska (10) **od razu z lepszymi przeciwnikami** (poziom ok. 4 i 5),
  - **wygrana**: następny przeciwnik trochę lepszy, a co **losową liczbę wygranych (1-3)** losuje się rycerz
    z **wyraźnie lepszymi statystykami**. Pierwszy taki skok jest zaraz po pierwszej walce, więc druga walka
    jest już z lepszym rycerzem,
  - **porażka**: następny przeciwnik łatwiejszy (do tego, jak w iteracji 14, gracz spada o miejsce w tabeli),
  - **walka o 1. miejsce**: zawsze prawie najlepszy rycerz ligi.
- Kroki są dobrane do długości ligi: seria samych wygranych dochodzi do najlepszych przeciwników pod koniec.
  Przykładowe poziomy kolejnych przeciwników przy samych wygranych:
  - giermkowie: 1 2 1 3 3 3 4 4 4 5 4 6 5 6 6 6 7 7 7 8,
  - rycerska: 4 4 5 5 5 6 6 7 7 7 8 8 9 9 9,
  - królewska: 5 6 7 8 9 10 10 10 9 10.
- Charakter rycerza (słabsza umiejętność, rozrzut) zostaje z iteracji 14. Żadna umiejętność nie przekracza 90%.
- **Statystyki przeciwnika są widoczne** pod jego paskiem życia: „POZIOM 4 · SKUT. 55% · ATAK 40 · BLOK 30 ·
  UNIK 20 · KONTRA 50”. W tabeli kolumna SKUT. pokazuje u przeciwnika skuteczność wylosowaną do walki
  (u pozostałych rycerzy, jak wcześniej, szacunek z miejsca w tabeli).

## Pasek energii (`stamina.js`, nowy plik)
- W walce na miecze (pieszo i konno z mieczem) każdy zamach, także w powietrze, zabiera **30% energii**.
  Zamach wymaga co najmniej 30%. Z pełnym paskiem są więc **3 ciosy z rzędu**, po nich zostaje **10%** i kolejnego
  ciosu zadać się nie da („BRAK SIŁ — ODPOCZNIJ: BLOK ALBO W TYŁ”).
- **Blok, stanie i cofanie nie zużywają energii.** Energia wraca cały czas, poza samym zamachem.
- Czas odzyskania siły na **jeden cios** zależy od rynsztunku. Jest 9 poziomów, co 0,1 s:

  | Rynsztunek | sam miecz | + tarcza | + hełm | + zbroja | + lepszy miecz | + godło | + koń | + lanca | + kopia |
  |---|---|---|---|---|---|---|---|---|---|
  | s na 1 cios | 1,6 | 1,5 | 1,4 | 1,3 | 1,2 | 1,1 | 1,0 | 0,9 | 0,8 |

  (Poziom to liczba zdobytych przedmiotów. Kolejność zdobywania jest taka jak na treningu.)
- Strategie: trzy szybkie ciosy, a potem blok albo odskok, albo cios i blok na zmianę z zapasem energii.
- **Pasek energii gracza** jest pod jego paskiem życia (niebieski). Napis „ENERGIA 70% · CIOSY 2”.
  Gdy energii nie starcza na cios, pasek jest czerwony i mruga. Przy lancy i kopii paska nie ma.
- **Przeciwnik ma te same zasady** (ten sam rynsztunek, ten sam czas odpoczynku), ale **jego paska nie widać**.
  Zmęczony przeciwnik odchodzi dalej i odpoczywa. Lepsi przeciwnicy (wysoka kontra) atakują od razu,
  gdy widzą, że gracz nie ma sił.

## Zmiany w plikach
- **nowe** `js/game/stamina.js`: energia (`EN_COST`, `enTime`, `regen`), wydatek gracza (`spendPlayer`),
  odnawianie obu rycerzy (`updateEnergy`), pasek energii.
- `js/game/league.js`: trudność turnieju (`LEAGUE_DIFF`, `nextDiff`), statystyki losowane do walki (`rivalSkill`),
  szansa poddania z miejsca (`yieldChance`). Usunięte `TIER_YIELD`, `LEAGUE_LVL`, `FIRST_LVL`, `FIGHT_STEP`.
- `js/game/duel.js`: energia na start walki, skuteczność z wylosowanych statystyk, `nextDiff` po walce.
- `js/game/foot.js`: poddanie od 5 trafień, energia przeciwnika w AI.
- `js/game/logic.js`: zamach wymaga energii, odnawianie co klatkę.
- `js/game/hud.js`: statystyki przeciwnika pod jego paskiem.
- `js/side/standings.js`: opis kolumny SKUT.
- `index.html`, `css/game-ui.css`: pasek energii, linia statystyk, skrypt `stamina.js`.

## Weryfikacja
Headless Chrome, symulacja bez błędów JS:
- energia: przy każdym rynsztunku są 3 ciosy z rzędu, potem zostaje 10%, a czwarty jest zablokowany.
  Od zera do jednego ciosu: 1,60 s (sam miecz), 1,20 s (4 przedmioty), 0,80 s (pełny rynsztunek),
- trudność: poziomy jak w tabelach wyżej. Z porażkami poziom spada, np. w lidze królewskiej
  przy wygranych na przemian z porażkami poziom krąży wokół 5-7,
- bot w lidze giermków: 20 wygranych, w tym 11 przez poddanie przeciwnika. Z 4 przedmiotami: 12 wygranych,
  w tym 6 przez poddanie,
- testy z iteracji 14 (blok, lanca bez bloku, spadek w tabeli) bez zmian.

Zrzuty 1366×900 i 520×1250: pasek energii gracza (czerwony przy braku sił) i statystyki przeciwnika pod jego paskiem.
