# Iteracja 2 — rycerz i kukła treningowa zamiast grabarza

Data: 2026-10-16

## Cel
Grabarz kopiący grób zastąpiony rycerzem, który sam idzie z lewej na prawą i spacją
uderza mieczem w kukłę treningową. Każde trafienie daje kolejny element rynsztunku,
każde przejście obok kukły bez trafienia kosztuje monetę.

## Zasady gry
- Start: pierwsza spacja/klik rusza rycerza. Kolejne = zamach mieczem.
- Rycerz idzie automatycznie. Po wyjściu za prawą krawędź wraca z lewej (kolejne „przejście”).
  Kukła losuje wtedy nowe miejsce (40–85% szerokości), a rycerz przyspiesza (+4 px/s, max 60).
- **Trafienie** liczy się tylko w chwili uderzenia (43% zamachu) i tylko gdy kukła jest
  w końcowej połowie ostrza. Raz na przejście.
  1. Tarcza
  2. Hełm (z pióropuszem)
  3. Zbroja (tułów i nogi stalowe)
  4. Lepszy miecz: dłuższy (9 px zamiast 5), więc też większy zasięg
  5. Godło na tarczy: **losowane**, symetryczny wzór 5×5, losowy kolor pola i rysunku → wygrana
- **Pudło** (rycerz minął kukłę bez trafienia): traci 1 z 4 monet (moneta spada na ziemię).
  5. pudło: traci miecz (leży na ziemi) → koniec gry.
- Cios w powietrze → „zadyszka” 0,6 s (miecz opuszczony, nie da się uderzyć).
  Bez tego walenie spacją na oślep zawsze wygrywało.
- R: od nowa, M: dźwięk.

Balans (symulacja 200 gier): idealne wyczucie czasu wygrywa w 100%, walenie spacją bez
przerwy w ~15%, losowe klikanie w ~2,5%.

## Zmiany w plikach
- **nowe** `js/game/knight.js`: rysowanie rycerza warstwami wg zdobytego rynsztunku, tarcza,
  losowanie godła (`randomEmblem`), miecz, geometria zamachu (`swordGeom`, `swingAngle`).
- **nowe** `js/game/dummy.js`: kukła (sprite), kołysanie i błysk po trafieniu.
- **usunięte** `js/game/man.js` (grabarz).
- `js/game/logic.js`: przepisana logika: stan rycerza, zamach, trafienie, pudło, przejścia,
  wygrana/przegrana, cząstki (słoma, moneta, iskry).
- `js/game/data.js`: stałe rycerza/zamachu, lista `GEAR`, palety, sprite'y kukły, tarczy i ikon
  przedmiotów. Usunięte skarby, komunikaty z cmentarza, nagrobek RIP i stałe dołu.
- `js/game/render.js`: rysuje kukłę, rycerza i wyskakujące ikony zdobytych przedmiotów.
  Usunięta kamera (`camY`) i kopiec.
- `js/game/scenery.js`: niebo bez kopca, usunięty nagrobek RIP i latarnia grabarza.
  Reszta tła cmentarza bez zmian.
- `js/game/ground.js`: ziemia bez dołu grobu.
- `js/game/audio.js`: wspólne `noise()`/`tones()`; dźwięki: zamach, uderzenie, nagroda,
  utrata monety, przegrana.
- `js/game/hud.js`: HUD: MONETY, RYNSZTUNEK x/5, PRZEJŚCIE, REKORD (najwięcej zdobytych
  elementów, localStorage `rycerz-best-rynsztunek`). Nowe `setHint()`.
- `js/game/input.js`: spacja/klik → `swing()`.
- `js/main.js`: `resizeAll()` przed `resetGame()`. Naprawia `KOPIEC NaN m` z iteracji 1
  (stan gry potrzebuje szerokości planszy).
- `index.html`: nowy HUD, podpowiedź, etykieta panelu „TRENING RYCERZA”, skrypty
  `dummy.js` + `knight.js` zamiast `man.js`.

## Weryfikacja
- Headless Chrome: strona ładuje się bez błędów JS, HUD pokazuje poprawne wartości.
- Symulacje logiki: bot zbiera 5/5 i wygrywa; brak trafień → 4× utrata monety, potem miecz.
- Zrzut wszystkich poziomów rynsztunku, zamachu, kukły i przegranej sprawdzony wizualnie.

## Do rozważenia w kolejnych iteracjach
- Tło to nadal cmentarz (nagrobki, dynie, duch). Można zamienić na plac treningowy/zamek.
- Robot w panelu obok mówi „Zacznij już dzisiaj!”. Tekst nie jest powiązany z nową grą.
