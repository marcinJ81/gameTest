# Iteracja 9 — usunięcie Ziemi i robota

Data: 2026-10-16

## Cel
Usunąć z górnej części strony obracającą się Ziemię i robota. Na razie zostaje tam czarne tło
(później coś tam będzie).

## Układ strony
- Oba górne panele zastąpił jeden pusty czarny pas `.blank` na całą szerokość, bez ramki i bez etykiet.
- Wysokość górnego wiersza się nie zmieniła (`minmax(224px,40.6vh)`), więc panel gry stoi tam, gdzie stał.
- Telefon (≤820px): wiersze `224/224/440px` → `224/440px`, bo jest jeden czarny pas zamiast dwóch paneli.

## Usunięte
- **pliki** `js/globe/` (earth-texture, globe, space, input), `js/robot/` (sprites, robot, script) i `css/bubble.css`.
- `js/main.js`: bez `resizeGlobe`, `resizeRobot`, `renderGlobe`, `drawRobot`, `runScript`.
  Pętla obsługuje tylko grę.
- `css/panels.css`: style `.panel.globe`, `.panel.robot`, `.drag-hint` i animacja `ping`.
  Tę ostatnią włączał robot, wskazując panele.
- `js/core/noise.js`: `hash3`, `vn3`, `fbm3` (używała ich tylko Ziemia).
- `js/core/utils.js`: `css`, `shade` (nieużywane przez grę).

## Poprawka przy okazji
- Podpowiedź na dole pola gry („WCIŚNIJ SPACJA…”) jest teraz nad rzędem przycisków (`bottom:64px`,
  na telefonie `108px`). Od iteracji 8 są 4 przyciski i podpowiedź na nie nachodziła.

## Weryfikacja
- Headless Chrome 1366×768 i 520×1100: u góry czarne pole, gra pod nim, bez błędów JS.
- Pełny scenariusz (1, 2, przejście na turniej, wpisowe, R) przechodzi tak jak w iteracji 8.

## Uwagi
- Tytuł karty przeglądarki nadal brzmi „Przejmujemy Kontrolę”. To było hasło robota, do zmiany, jeśli trzeba.
