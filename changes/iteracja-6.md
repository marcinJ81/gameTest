# Iteracja 6 — sceneria treningowa i przejście na turniej

Data: 2026-10-16

## Cel
Gra nie zaczyna się już od sceny turnieju. Najpierw jest trening na placu przy lesie.
Po zaliczeniu treningu gracz przechodzi na turniej z iteracji 5 i na tym gra się na razie kończy.

## Przebieg gry
1. **Trening** (start, etykieta „TRENING RYCERZA”). Zasady jak dotąd: kukła, rynsztunek, monety, podpowiedź.
2. **Zaliczenie treningu.** Trafienie kopią, gdy cały rynsztunek jest już zdobyty (8/8). Pojawia się
   komunikat „TRENING ZALICZONY! JEDZIESZ NA TURNIEJ”, a rycerz sam zjeżdża z placu w prawo.
3. **Przejście.** Ekran ściemnia się w kilku pikselowych krokach (0,7 s). Gra buduje scenę turnieju
   i ekran się rozjaśnia (0,7 s). Etykieta zmienia się na „TURNIEJ RYCERSKI”.
4. **Turniej.** Rycerz wjeżdża z lewej i staje w 40% szerokości ekranu. Rozlega się fanfara
   i pojawia się „WITAJ NA TURNIEJU, RYCERZU!”. Nad uniesioną kopią lecą iskry,
   a podpowiedź mówi „ZAKWALIFIKOWANY DO TURNIEJU! R OD NOWA”. Na turnieju nie ma kukły.
5. **R** wraca na plac treningowy i zaczyna od nowa.

## Sceneria treningowa
- **Las** w tle w dwóch rzędach. Tylny rząd jest gęstszy, niższy i zamglony, przedni bardziej zielony.
  Rosną w nim świerki (trzy piętra gałęzi) i drzewa liściaste (postrzępiona okrągła korona).
  Światło pada z lewej. Za lasem są te same niebo, słońce, chmury i ptaki co na turnieju.
  Zamku nie ma.
- **Namioty** tylko po lewej stronie (2, na telefonie 1), takie same jak na turnieju, z proporcami.
- **Płot z żerdzi** na skraju placu. Przy namiotach stoi **stojak z mieczami i włócznią**.
  Na placu leżą **snopki siana**.
- **Ziemia**: trawa z wydeptanymi łatami ziemi i kamykami, ścieżka ze śladami kroków, którą idzie
  rycerz. Pod płotem cień lasu, z przodu trawa z kwiatkami.
- Plac jest głębszy niż arena (horyzont 12 px nad ścieżką zamiast 5 px), żeby w tle zmieścili się ćwiczący.

## Rycerze ćwiczący w tle
Mają losowy wygląd: giermek z tarczą, rycerz w hełmie albo pełna zbroja z losowym godłem.
- **Jeździec z lancą** jeździ stępa przez cały plac, za ekranem zawraca.
- **Para w walce ćwiczebnej**: dwaj rycerze naprzeciw siebie zadają ciosy na zmianę.
  Przy uderzeniu skrzyżowane miecze błyskają.
- **Rycerz przy palu** (pell) uderza w drewniany słup. Słup się chwieje i lecą z niego drzazgi.
  Tylko na szerokim ekranie.
- **Spacerujący** (2, na telefonie 1) chodzą tam i z powrotem z opuszczonym mieczem.
  Przy zawracaniu chwilę odpoczywają.

Rysowani są co klatkę na osobny canvas i nakładani z filtrem `saturate(.55) brightness(.75)`.
Są przez to przygaszeni i nie da się ich pomylić z graczem ani z kukłą.

## Zmiany w plikach
- **nowe** `js/game/training-data.js`: palety lasu, ziemi placu, siana, filtr i tempo ćwiczących.
- **nowe** `js/game/forest.js`: rozmieszczenie i rysowanie drzew, płot, stojak z bronią, siano.
- **nowe** `js/game/trainees.js`: rycerze w tle (`makeTrainees`, `updateTrainees`, `drawTrainees`)
  i `flipX`, czyli lustrzane odbicie postaci zwróconej w lewo.
- **nowe** `js/game/scene.js`: `setScene` (zmiana sceny i etykiety), przejście ze ściemnieniem
  (`startTransition`, `updateTransition`, `drawTransition`).
- `js/game/scenery.js`: wspólne `setupSky`, `makeTents`, `bakeSky`. `buildScenery` wybiera
  `buildTraining` albo `buildArena` według `Game.scene`. `drawScenery` i `updateScenery` też zależą od sceny.
- `js/game/ground.js`: `trainGroundColor`. `drawGroundRow` wybiera ziemię według sceny.
- `js/game/logic.js`: `Game.scene = 'training'`, `riding()`, `updateWin()` (zjazd → przejście → wjazd).
  Nowe pola stanu `goal` i `arrived`. `resetGame` wraca na trening. Iskry pojawiają się dopiero po dojeździe.
- `js/game/render.js`: kukła i podpowiedź są rysowane tylko na treningu. Na końcu klatki rysowana jest zasłona przejścia.
- `index.html`: `id="gameTag"` na etykiecie panelu, nowe skrypty, opis panelu.

## Weryfikacja
- Headless Chrome 1920×1080, 1366×768 i 520×1100. Bez błędów JS na treningu, w trakcie
  przejścia, na turnieju i po resecie.
- Symulacja wygranej: zjazd, przejście, `scene=tournament`, `arrived=true`, rycerz stoi w 40% ekranu.
  Po R jest znowu `scene=training` i etykieta „TRENING RYCERZA”.

## Uwagi / na później
- Turniej to na razie tylko meta. Właściwa rozgrywka turniejowa (przeciwnik, kopie) będzie w kolejnych krokach.
- Na wąskim ekranie HUD nadal nachodzi na etykietę, a podpowiedź na przyciski. Tak było już wcześniej.
