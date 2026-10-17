# Iteracja 3 — koń, lanca i kopia

Data: 2026-10-16

## Cel
Po zdobyciu pełnego rynsztunku gra toczy się dalej. Kolejne trafienia dają konia, lancę
i kopię. Lancę i kopię opuszcza się nowym klawiszem **X**, co wymaga wyczucia czasu.

## Kolejność nagród
| Trafienie | Czym | Nagroda |
|---|---|---|
| 1–5 | miecz (pieszo) | tarcza, hełm, zbroja, lepszy miecz, godło (bez zmian) |
| 6 | miecz | **koń** + **2 dodatkowe monety** („przed otrzymaniem lancy”) |
| 7 | miecz (z konia) | **lanca**, miecz zostaje przy boku |
| 8 | lanca (X) | **kopia** |
| 9 | kopia (X) | **wygrana** (turniej) |

Interpretacje (do potwierdzenia):
- Kopia to „ostatnia” nagroda, więc wygrana = trafienie kopią. Bez tego kopia nie byłaby do niczego używana.
- +2 monety przychodzą razem z koniem, czyli tuż przed fazą lancy. Liczba monet nie ma górnego limitu.
- Lancę też opuszcza się klawiszem X. Opada szybciej i rycerz trzyma ją dłużej niż kopię
  („lancę umiał dłużej, ale kopia jest cięższa”).

## Mechanika lancy / kopii
- Broń jedzie uniesiona. **X** zaczyna ją opuszczać. Opuszczanie trwa chwilę.
- Opuszczona broń trafia, gdy grot dojdzie do kukły (od 85% opuszczenia).
- Rycerz trzyma ją opuszczoną tylko przez chwilę (pod koniec ręka drży), potem **sam ją podnosi**
  i musi odpocząć, zanim znów opuści.
- **X wciśnięty w trakcie odpoczynku zaczyna odpoczynek od nowa** („ZA WCZEŚNIE! RYCERZ ODPOCZYWA”).
  Bez tego wciskanie X na oślep wygrywało w 94% gier.

| | opuszczanie | trzymanie | podnoszenie | odpoczynek | długość |
|---|---|---|---|---|---|
| lanca | 0,45 s | 1,2 s | 0,5 s | 0,8 s | 16 px |
| kopia | 1,0 s | 0,45 s | 0,8 s | 1,5 s | 22 px |

Parametry są w `LANCES` w `js/game/data.js`.

- Spacja przy lancy/kopii nie uderza, tylko przypomina o X. Klik/dotyk w planszę robi to, co
  pasuje do aktualnej broni. Dodany przycisk **[X] OPUŚĆ** (widoczny tylko przy lancy/kopii, też na dotyk).
- Na koniu rycerz jedzie **×1,2** szybciej (`HORSE_MUL`).
- Przegrana przy lancy/kopii: „STRACIŁEŚ LANCĘ/KOPIĘ”, broń leży na ziemi.

Balans (symulacja 200 gier; faza miecza grana idealnie, mierzona tylko faza lancy):
dobre wyczucie czasu wygrywa w 100%, ciągłe wciskanie X w 0%, losowe wciskanie w ~28%.

## Zmiany w plikach
- **nowe** `js/game/horse.js`: koń (sprite tułowia, animowane nogi, czaprak w barwach godła).
- **nowe** `js/game/lance.js`: stan lancy/kopii (`up → lowering → down → raising → rest`),
  `lowerLance()`, kąt z drżeniem, geometria i rysowanie (kopia w czerwono-białe pasy, większy wamplet).
- `js/game/knight.js`: jazda konno (siedzący rycerz, noga w strzemieniu), miecz przy boku przy
  lancy/kopii, `riderY()`. Parametry: `hasSword` → `hasWeapon`, nowe `weapon` i `mounted`.
- `js/game/logic.js`: `mounted()`, `weapon()`, `knightY()`. Wspólne `hitDummy()` + `award()`.
  Trafienie lancą (`checkLanceHit`), bonus monet, prędkość konia, wygrana trafieniem kopią.
- `js/game/data.js`: `GEAR` +3 pozycje, stałe konia i lancy, sprite konia, ikony konia/lancy/kopii.
- `js/game/render.js`: przekazuje konia i broń, rysuje porzuconą lancę/kopię.
- `js/game/input.js`: klawisz X, przycisk [X] OPUŚĆ, klik zależny od broni.
- `js/game/hud.js`: pole BROŃ, pokazywanie/ukrywanie przycisku X. Rynsztunek liczony do 8.
- `js/game/audio.js`: dźwięk opuszczania (`sfxLower`).
- `css/game-ui.css`: `.btn[hidden]`.
- `index.html`: pole BROŃ w HUD, przycisk [X] OPUŚĆ, skrypty `horse.js` i `lance.js`.

## Weryfikacja
- Headless Chrome: strona bez błędów JS, HUD `MONETY 4 · RYNSZTUNEK 0/8 · BROŃ MIECZ`.
- Symulacja całej gry: 9 trafień, komunikaty w dobrej kolejności, monety 4 → 6 przy koniu, wygrana.
- Zrzut: koń, lanca uniesiona/w połowie/opuszczona, kopia, przegrana z kopią na ziemi, ikony.
- Nie testowane na żywo z klawiaturą (headless nie odtwarza animacji). Warto zagrać i ocenić,
  czy czasy kopii nie są za ostre.
