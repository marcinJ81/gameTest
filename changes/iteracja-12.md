# Iteracja 12 — walka konna do remisu, walka piesza sterowana przez gracza, paski życia

Data: 2026-10-17

## Cel
Walka konna nie rozstrzyga już pojedynku sama. Trwa do remisu (1:1), a potem rycerze zsiadają z koni
i walczą pieszo. Walką pieszą steruje gracz: podchodzi, uderza i odskakuje, zanim przeciwnik odda.
W każdej walce widać paski życia obu rycerzy.

## Paski życia i obrażenia
- Obaj rycerze zaczynają walkę ze **100** punktami życia. Pasek gracza jest po lewej, przeciwnika
  (z jego imieniem) po prawej, pod HUD-em. Kolor: zielony, poniżej 50 żółty, poniżej 25 czerwony.
- Obrażenia za jedno trafienie (obaj mają ten sam rynsztunek, więc zadają tyle samo):

  | Broń | Obrażenia |
  |---|---|
  | miecz podstawowy | 5 |
  | lepszy miecz | 10 |
  | lanca | 25 |
  | kopia | 50 |

- Zbroja na razie nie zmniejsza obrażeń (zgodnie z zadaniem).

## Walka konna (`duel.js`)
- Przebieg jak w iteracji 11 (podejścia, X / SPACJA, przeciwnik trafia ze swoją skutecznością), ale **bez limitu
  rund i bez dogrywki**. HUD pokazuje „RUNDA n” i „WYNIK x:y”.
- Po każdej rundzie:
  - pasek przeciwnika na zero: **wygrana** (np. kopia 2:0),
  - pasek gracza na zero: **porażka**,
  - **remis 1:1, 2:2…**: komunikat „REMIS — ZSIADACIE Z KONI!”, ściemnienie i **walka piesza**,
  - w pozostałych przypadkach kolejna runda.
- Po pojedynku **na kopie** paski liczą się od nowa (100). Po lancy i po konnej walce na miecze
  zostają takie, jakie były (np. lanca 1:1 → obaj zaczynają pieszo z 75).
- Pieszo każdy walczy mieczem, który miał przy boku (lepszym, bo ma go każdy, kto ma konia).

## Walka piesza (`foot.js`, nowy plik)
- Bez konia walka od razu jest piesza. Z koniem zaczyna się po remisie w walce konnej.
- **Początek:** gracz wchodzi z lewej, przeciwnik z prawej. Stają naprzeciw siebie na środku placu i pada „DO WALKI!”.
- **Sterowanie (perspektywa jednowymiarowa, rycerze stoją na jednej linii):**
  - <kbd>→</kbd>: do przodu (w stronę przeciwnika),
  - <kbd>←</kbd>: do tyłu. Odskok w tył to jedyny unik,
  - <kbd>SPACJA</kbd>: cios mieczem. Zasięg i „zadyszka” po ciosie w powietrze działają jak na treningu.
- Rycerze nie wchodzą na siebie.
- Trafiony rycerz jest odrzucany o kilka pikseli, mruga i przez 0,5 s nie można go trafić ponownie.
  Trafienie przerywa zamach przeciwnika.
- **Przeciwnik (AI):** czeka, podchodzi na odległość ciosu. Potem **unosi miecz**
  (to znak, żeby uskoczyć w tył), tnie i odskakuje. Jego skuteczność z tabeli (30 / 60 / 90%) decyduje o tym:
  - czy podejdzie na dobrą odległość, czy utnie z za daleka,
  - jak długo trwa zamach (0,51 / 0,42 / 0,33 s), jak szybko chodzi i jak krótko czeka między atakami,
  - czy odskoczy, gdy gracz bierze zamach (rycerz 30% nigdy, 60% czasem, 90% częściej).
- **Koniec walki pieszej:** **10 trafień** albo pasek na zero (np. przy 75 po lancy wystarczy 8 trafień lepszym mieczem).
  Pod paskiem widać „TRAFIENIA x/10”, a HUD pokazuje „WALKA PIESZA” i „TRAFIENIA gracz:przeciwnik”.
- **Poddanie po 7 trafieniach** (raz na walkę dla każdej strony; walka staje na czas komunikatu):
  - gracz trafił 7 razy: okno „7 TRAFIEŃ NA PRZECIWNIKU” i decyzja przeciwnika. Rycerze z **dołu tabeli
    zawsze się poddają**, ze środka w połowie przypadków, z **góry tabeli nigdy**. Poddanie to wygrana
    gracza („PRZECIWNIK SIĘ PODDAJE · +4 MONETY”),
  - przeciwnik trafił gracza 7 razy: pytanie „CZY SIĘ PODDAJESZ?”, TAK / NIE (strzałki ← → i ENTER,
    domyślnie NIE). TAK to porażka (−2 monety), NIE oznacza dalszą walkę.
- **Podpowiedź w pierwszej walce turnieju:** flaga stoi przed przeciwnikiem w miejscu, z którego cios
  trafia. Strzałka „TERAZ” nad rycerzem pojawia się, gdy gracz stoi przy fladze.
- Wygrana i porażka działają jak w iteracji 11 (+4 / −2 monety, awans w tabeli, koniec gry bez monet).

## Inne
- Tabela turnieju przełącza się na ligę gracza już przy pierwszej walce. Wcześniej działo się to
  dopiero po jej zakończeniu.
- Z danych lig zniknęła liczba rund (4 dla najlepszych). Rycerze mają teraz `yieldP`, czyli szansę poddania się.

## Zmiany w plikach
- **nowe** `js/game/foot.js`: walka piesza (wejście, sterowanie przód / tył, odrzut, AI przeciwnika, trafienia,
  koniec walki, poddanie po 7 trafieniach i okno z pytaniem).
- **nowe** `js/game/dialog.js`: wspólne okno TAK / NIE (`makeDialog`), używane przez wpisowe i poddanie.
- `js/game/duel.js`: paski życia, obrażenia (`damage()`), walka konna do remisu lub do zera, `dismount()`,
  `finishFight(win, how)` z powodem (poddanie), wynik pieszy w komunikatach.
- `js/game/league.js`: `TIER_YIELD` zamiast liczby rund.
- `js/game/logic.js`: `mounted()` i `weapon()` w walce pieszej (miecz, bez konia), przeciwnik może
  odskoczyć przed zamachem gracza.
- `js/game/entry.js`: korzysta z `dialog.js`.
- `js/game/input.js`: trzymane strzałki ← → (`Held`), drugie okno (poddanie).
- `js/game/render.js`, `js/game/rival.js`: mruganie po trafieniu,
  uniesiony miecz przy zamachu przeciwnika.
- `js/game/assist.js`: flaga i strzałka w walce pieszej.
- `js/game/hud.js`: paski życia (`updateBars`), HUD walki pieszej.
- `index.html`: paski życia, okno poddania, nowe skrypty.
- `css/game-ui.css`: style pasków (także na telefonie).

## Weryfikacja
Headless Chrome, symulacja bez błędów JS:
- bez konia walka jest od razu piesza. Wejście kończy się na środku (78 / 106 px przy szerokości 184),
- gracz nic nie robi: przy 7 trafieniach pojawia się pytanie, NIE oznacza dalszą walkę, przy 10 jest porażka
  (pasek 50 przy starym mieczu), −2 monety. TAK od razu daje porażkę „PODDAJESZ SIĘ”,
- przeciwnik z dołu tabeli poddaje się po 7 trafieniach, gracz wygrywa i dostaje +4 monety,
- walka konna, wynik 1:0, potem 1:1: zejście z koni. Paski: miecz konno 90/90, lanca 75/75, kopia **100/100**.
  Kopia 2:0 to wygrana z konia (pasek 0),
- autopilot, który uderza przy fladze i odskakuje dopiero 0,25 s po tym, jak przeciwnik uniesie miecz
  (czas reakcji człowieka): 20/20 wygranych z każdym poziomem. Dostaje średnio 0 trafień od rycerzy 30% i 60%
  i 0,9 od rycerzy 90%,
- gracz stojący bez ruchu przegrywa z rycerzem 30% po ok. 74 s, 60% po ok. 38 s, 90% po ok. 23 s,
- R w trakcie walki: brak walki, paski i okno ukryte.

Zrzuty 1366×900 i 520×1250: walka piesza z paskami i flagą, walka konna kopią z paskiem przeciwnika 50/100,
okno „7 TRAFIEŃ NA TOBIE”.
## Poprawka po uwadze
Pierwsza wersja miała też ruch w głąb placu (↑ ↓), bo źle zrozumiałem „tył – przód”. Usunąłem go.
Perspektywa jest jednowymiarowa: ← to tył, → to przód.

Na telefonie (dotyk) nie da się chodzić, działa tylko cios (dotknięcie). Sterowanie dotykiem można dodać później.
