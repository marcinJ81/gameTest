# Iteracja 8 — opcje treningu: stała podpowiedź (1) i koniec treningu (2)

Data: 2026-10-16

## Cel
Dwie dodatkowe opcje na placu treningowym.

## Klawisz 1: stała podpowiedź
- Włącza flagę przed kukłą („uderz tutaj”, ta sama co z iteracji 4). Kolejne **1** ją wyłącza.
- Gdy jest włączona, flaga stoi w każdym przejściu, niezależnie od trafień i pudeł.
  Znika tylko na resztę przejścia po trafieniu, tak jak dotąd. Strzałka „teraz” nad rycerzem też działa.
- Automatyczna podpowiedź po 2 pudłach działa dalej niezależnie od tej opcji.
- Ustawienie zostaje po **R** (od nowa), bo to wybór gracza, a nie stan rozgrywki
  (`Game.assistOn`). Nie jest zapisywane między wizytami na stronie.
- Komunikat: „STAŁA PODPOWIEDŹ: WŁĄCZONA / WYŁĄCZONA”.

## Klawisz 2: koniec treningu
- Kończy trening od razu, w obecnym stanie (`S.over = 'quit'`). Działa też przed pierwszym ruszeniem.
- Rycerz zachowuje **cały zdobyty sprzęt i wszystkie monety**. Zjeżdża z placu, ekran się ściemnia
  i rycerz wjeżdża na turniej, tak jak w iteracjach 6–7.
- Na turnieju dostaje **+2 monety** na wpisowe, a potem pojawia się okno TAK / NIE.
  Przykład: tarcza i hełm, 4 monety → na turnieju 6 monet, po wpisowym 4.
- Komunikat: „KOŃCZYSZ TRENING — JEDZIESZ NA TURNIEJ”.

## Przyciski
Przy dolnej krawędzi są nowe przyciski dla myszy i dotyku: **[1] FLAGA: ON/OFF** i **[2] KONIEC TRENINGU**.
Znikają po zakończeniu treningu. Rząd przycisków zawija się na wąskim ekranie.
Gdy okno wpisowego jest otwarte, klawisze 1 i 2 nie działają, bo blokuje je okno.

## Zmiany w plikach
- `js/game/logic.js`: `Game.assistOn`, `toggleAssist()`, `quitTraining()`, stan `'quit'` w opisie `S.over`.
- `js/game/assist.js`: `assistShown()` łączy podpowiedź automatyczną i stałą. Rysowanie flagi i strzałki z niej korzysta.
- `js/game/input.js`: klawisze `1` i `2`, obsługa nowych przycisków.
- `js/game/hud.js`: napis FLAGA ON/OFF, ukrywanie opcji treningu po jego końcu.
- `index.html`: przyciski `#btnAssist`, `#btnQuit`.
- `css/game-ui.css`: `.btns` z `flex-wrap`.

## Weryfikacja
Headless Chrome 1366×768 i 520×1100, bez błędów JS:
- 1 + 1 → wyłączone; 1 → flaga widoczna przed kukłą, przycisk „FLAGA: ON”;
- tarcza i hełm, 4 monety, potem 2 → `over=quit`, przyciski ukryte, drugie 2 nic nie robi
  → turniej: gear 2, 6 monet, okno otwarte → TAK → 4 monety;
- R przywraca przyciski. 2 przed startem prowadzi na turniej z 6 monetami.
