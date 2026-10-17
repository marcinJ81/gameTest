# Iteracja 1 — podział index.html na mniejsze pliki

Data: 2026-10-16

## Cel
Odchudzić `index.html` (1138 linii, wszystko inline) i rozdzielić kod według odpowiedzialności.
Zachowanie gry bez zmian — to czysty refaktor.

## Nowa struktura
```
index.html              tylko markup + podpięcie CSS/JS (73 linie)
css/
  base.css              zmienne, reset, tło strony, siatka .app
  panels.css            panele z pikselową ramką, scanlines, .tag, .drag-hint, ping
  bubble.css            dymek robota
  game-ui.css           HUD, podpowiedź, toast, przyciski gry
js/
  core/utils.js         $, kolory (P, C, css, shade, mixc), clamp, lerp, fade, BAYER
  core/noise.js         hash2/3, vn2/3, fbm3
  core/draw.js          fitCanvas, rect, pline, sprite
  globe/earth-texture.js  kontynenty, biomy, tekstura Ziemi i chmur, LIGHT, TILT
  globe/globe.js        obiekt Globe, resize, drawEarth, renderGlobe
  globe/space.js        TŁO kosmosu: mgławica, gwiazdy, spadająca gwiazda, księżyc, satelita
  globe/input.js        obracanie Ziemi myszką/palcem
  robot/sprites.js      pozy ramienia, sprite'y dłoni
  robot/robot.js        obiekt Robot, resize, dymek-pozycja, pozy, drawRobot
  robot/script.js       scenariusz: say(), runScript()
  game/data.js          stałe, palety, skarby, sprite'y nagrobków/dyni/nietoperzy/ducha
  game/audio.js         dźwięki (WebAudio), flaga muted
  game/hud.js           toast, updateHud
  game/logic.js         obiekt Game, stan S, reset, resize, kopiec, łopata, kopanie, updateGame
  game/ground.js        kolory warstw ziemi + rysowanie wiersza ziemi z dołem
  game/scenery.js       TŁO cmentarza: niebo, księżyc, wzgórza, płot, chmury, nietoperze,
                        drzewa, nagrobki, duch, dynie, latarnia, mgła (budowa, ruch, rysowanie)
  game/man.js           grabarz z łopatą
  game/render.js        składanie klatki gry
  game/input.js         klawiatura, klik, przyciski R/M
  main.js               resize wszystkich paneli, pętla requestAnimationFrame, start scenariusza
```

## Decyzje
- **Zwykłe `<script src>` zamiast modułów ES** — moduły nie ładują się przy otwieraniu pliku
  przez `file://`, a grę da się teraz nadal odpalić dwuklikiem. Pliki dzielą globalny zakres,
  więc **kolejność skryptów w index.html ma znaczenie**.
- Kod przenoszony 1:1; jedyne realne przecięcia funkcji:
  - `resizeGlobe` → budowa tła wydzielona do `buildSpace()` (space.js),
  - `renderGlobe` → gwiazdy do `drawStars()`, satelita do `drawSat(sx, sy, t)`,
  - `resizeGame` → scenografia do `buildScenery()`,
  - `updateGame` → ruch chmur/mgły/nietoperzy/ducha do `updateScenery()`,
  - `renderGame` → `drawSkyRow()`, `drawGroundRow()`, `drawScenery()`, `drawFog()`.

## Weryfikacja
- Zrzuty ekranu headless Chrome przed i po — identyczny obraz (poza losowością/animacją), brak błędów w konsoli.

## Zauważone, niezmienione (istniało wcześniej)
- HUD pokazuje `KOPIEC NaN m` do pierwszego kopnięcia: `resetGame()` → `updateHud()` jest
  wołane w `main.js` przed `resizeAll()`, więc `Game.surf` jest jeszcze `undefined`.
  Kandydat do poprawki w kolejnej iteracji.
