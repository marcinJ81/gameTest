# Iteracja 13 — poprawki walki pieszej, flaga pod klawiszem 1, miasteczko

Data: 2026-10-17

## Poprawki walki pieszej
- **Znikające nogi przeciwnika.** W walce pieszej bez konia nie była ustawiana pozycja kroku przeciwnika
  (`D.owalk`). Wychodziło `NaN`, więc nogi rysowały się tylko wtedy, gdy przeciwnik stał w miejscu
  (np. po dojściu na środek). W ruchu znikały. `setupFoot()` ustawia teraz `D.owalk = 0`.
- **Zatrzymanie gry po walce pieszej** (błąd z iteracji 12, wykryty testem całej ligi). Faza wyniku była obsługiwana
  tylko w walce konnej, więc po walce pieszej gra stała na wyniku: nie było kolejnej walki ani końca ligi.
  `updateDuel` obsługuje teraz fazę `result` dla obu rodzajów walki.

## Flaga pod klawiszem 1 także na turnieju
- **1** (albo przycisk „[1] FLAGA”) w trakcie walki turniejowej włącza i wyłącza flagę „uderz tutaj”.
- Wybór przechodzi na kolejne walki. Flaga wyłączona w pierwszej walce zostaje wyłączona, a włączona później
  zostaje włączona.
- Bez zmian: w pierwszej walce turnieju flaga jest domyślnie włączona. Na treningu 1 działa jak wcześniej.
- Przycisk flagi jest widoczny w walkach turnieju. „[2] KONIEC TRENINGU” widać tylko na treningu.

## Miasteczko (`town.js`, nowy plik)
- Po **wygranej lidze** (także po mistrzostwie w lidze królewskiej) gracz przenosi się do miasteczka.
  Wcześniej był tu napis „ZAKUPY I AWANS — WKRÓTCE”.
- Gracz zaczyna przy **swoim namiocie** po lewej (w barwach swojego godła) i spaceruje strzałkami **← →**.
  Idąc w lewo, odwraca się.
- Od lewej do prawej:
  - **namiot gracza** z proporcem,
  - **kuźnia**: otwarta wiata, palenisko z migającym ogniem i dymiącym kominem, narzędzia i podkowy na ścianie,
    szyld z podkową. Przed kuźnią **kowal** (fartuch, łysy) **kuje miecz** na kowadle. Czubek miecza jest
    rozżarzony, a przy każdym uderzeniu młota lecą iskry,
  - **szlifierz**: **ostrzy nóż** na kręcącym się kole na drewnianym kozle (koryto z wodą), sypią się iskry,
  - **piekarnia**: dom z muru pruskiego, szyld z bochenkiem, obok ceglany piec kopułowy z ogniem.
    **Piekarz** (biały czepek) **wsadza chleb do pieca** długą łopatą i wraca z pustą,
  - **karczma**: piętrowy dom ze świecącymi oknami, szyld z kuflem na wysięgniku, beczki. Przed wejściem
    **trzech rycerzy rozmawia**. Mówiący gestykuluje, a nad nim pojawia się dymek z kropkami.
- **Mieszczanie** (kobiety w sukniach i czepcach, ludzie z koszami) chodzą po ulicy w obie strony i czasem przystają.
- Ulica jest z **kocich łbów**, a pas, którym chodzi gracz, jest wytarty. Przed ulicą rośnie trawa z kwiatkami.
- HUD w miasteczku: „WYGRANE” i „PORAŻKI” z turnieju zamiast „PRZEJŚCIE” i „REKORD”. Etykieta gry: „MIASTECZKO”.
- Podpowiedź: „MIASTECZKO · ← → SPACER · ZAKUPY WKRÓTCE · R OD NOWA”.

## Zmiany w plikach
- **nowe** `js/game/town.js`: budynki (warstwa statyczna), postacie (`drawPerson`), kowal, szlifierz, piekarz,
  rycerze przed karczmą, mieszczanie, dym i iskry, spacer gracza (`walkTown`), przejście `goToTown`.
- `js/game/ground.js`: bruk miasteczka (`townGroundColor`).
- `js/game/scenery.js`, `js/game/scene.js`: scena `town`.
- `js/game/duel.js`: wygrana prowadzi do miasteczka, faza `result` dla walki pieszej, flaga z klawisza 1
  przechodzi na kolejne walki.
- `js/game/foot.js`: `D.owalk = 0`.
- `js/game/logic.js`: klawisz 1 w walce, spacer w miasteczku.
- `js/game/render.js`: gracz odwrócony w lewo w miasteczku.
- `js/game/hud.js`: HUD i etykieta w miasteczku, widoczność przycisków.
- `js/game/input.js`: strzałki nie przewijają strony w miasteczku.
- `index.html`: skrypt `town.js`.

## Weryfikacja
Headless Chrome, bez błędów JS:
- walka piesza: przeciwnik w ruchu przez 229 klatek, `owalk` zawsze liczbą (wcześniej `NaN`),
- klawisz 1 w pierwszej walce: flaga ON → OFF, przycisk „[1] FLAGA: OFF” jest widoczny,
- liga giermków od zera na autopilocie: 20 walk pieszych po kolei, 20 wygranych, przejście do miasteczka
  (etykieta „MIASTECZKO”, HUD „WYGRANE 20”),
- liga królewska z pełnym rynsztunkiem: 10 walk, 5 z nich z zejściem z koni, mistrzostwo, miasteczko,
- spacer: → przesuwa gracza, ← odwraca go w lewo,
- wcześniejsze testy (poddanie, remis i zejście z koni, paski, R) bez zmian.

Zrzuty 1366×900 i 520×1250: miasteczko z kowalem, szlifierzem, piekarzem i rycerzami przed karczmą.

## Zmiana po uwadze: miasteczko po każdej walce
- Po **każdej** walce, wygranej i przegranej, gracz przechodzi do miasteczka i zaczyna przy swoim namiocie.
  Komunikat pokazuje, kto będzie następnym przeciwnikiem.
- **Powrót na turniej:** trzeba przejść ulicą w prawo do końca, do **drogowskazu** ze strzałką i czerwonym
  proporczykiem. Wtedy następuje ściemnienie i kolejna walka. Po porażce jest to rewanż z tym samym rycerzem.
  Podpowiedź: „MIASTECZKO · ← → SPACER · → DO KOŃCA ULICY: NA TURNIEJ”.
- Wyjątki:
  - porażka, po której nie zostają monety, nadal kończy grę na placu turniejowym,
  - po wygraniu całej ligi gracz zostaje w miasteczku (drogowskazu nie ma).
- W miasteczku nie da się uderzyć mieczem ani opuścić broni. Tabela pokazuje następnego przeciwnika („▶”).
- Stan gry między walkami: `S.over = 'town'`.
- Pliki: `town.js` (`goToTown` dla każdej walki, wyjście na końcu ulicy, `drawSignpost`), `duel.js` (`afterFight`),
  `render.js` (drogowskaz za rycerzem), `standings.js` (następny przeciwnik w miasteczku).
- Weryfikacja:
  - liga giermków na autopilocie: 20 walk i 19 pobytów w miasteczku między nimi, potem wygrana liga w miasteczku,
  - liga królewska: 10 walk i 9 pobytów w miasteczku, mistrzostwo,
  - porażka z monetami: miasteczko, cios zablokowany. Po dojściu w prawo (5,6 s) jest rewanż z tym samym rycerzem.
