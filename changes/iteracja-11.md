# Iteracja 11 — turniej z przeciwnikami (ligi i walki)

Data: 2026-10-17

## Cel
Po wpisowym zaczyna się prawdziwy turniej. Gracz trafia do ligi zależnej od tego, z czym wyszedł z treningu,
i walczy po kolei z rycerzami, którzy są nad nim w tabeli. Wygrana z całą tabelą ligi królewskiej oznacza
zwycięstwo w grze.

## Ligi (przydział po treningu, `league.js`)
| Rynsztunek | Liga | Przeciwnicy | Miejsce startowe |
|---|---|---|---|
| 0–4 (nic / tarcza, hełm, zbroja, lepszy miecz) | **LIGA GIERMKÓW** | 20 | 21. Każdy przedmiot daje 2 miejsca wyżej (4 przedmioty → 13.) |
| 5–7 (+ godło, koń, lanca) | **LIGA RYCERSKA** | 15 | godło 16., koń 13., lanca 10. |
| 8 (wszystko, z kopią) | **LIGA KRÓLEWSKA** | 10 | 11. (pod całą dziesiątką) |

- Liga królewska to 10 rycerzy z iteracji 10 (te same imiona i herby). Ligi giermków i rycerska mają
  nowe, stałe listy imion (20 + 15).
- Monety nie zmieniają miejsca w tabeli, ale dają zapas na porażki, więc przetrwać jest łatwiej.
- Gracz bez niczego (0 przedmiotów, 0 monet) ma po wpisowym 0 monet (0 + 2 premii − 2 wpisowego).
  Startuje z ostatniego miejsca i musi wygrać pierwszą walkę, bo porażka oznacza koniec gry.
- Okno wpisowego pokazuje teraz także ligę i miejsce startowe, np. „LIGA GIERMKÓW · MIEJSCE 21 / 21”.

## Siła przeciwników
- Siła zależy od miejsca rycerza w tabeli ligi (zadanie: „3 pierwsze walki 30%, kolejne 5 → 60%,
  ostatnie 3 → 90% i 4 rundy”, przeniesione proporcjonalnie na każdą ligę):
  - dolne 30% tabeli: skuteczność **30%**, 3 rundy,
  - środek: **60%**, 3 rundy,
  - górne 30%: **90%**, **4 rundy**.
- Wychodzi z tego: królewska 3/4/3 (3 + 5 + 3 z zadania daje 11, a w lidze jest 10), rycerska 5/5/5,
  giermków 6/8/6.
- Skuteczność każdego rycerza jest widoczna w tabeli, w kolumnie **SKUT.**

## Walka (`duel.js`, `rival.js`)
- Gracz jedzie z lewej, przeciwnik z prawej, obaj z tą samą prędkością (pieszo 28 px/s, na koniu ×1,2).
  Mijają się. Jedno minięcie to jedna **runda** (podejście).
- Gracz uderza jak na treningu: **SPACJA** (miecz) albo **X** (lanca, kopia). Trafienie liczy
  ta sama geometria, celem jest przeciwnik zamiast kukły.
- Przeciwnik ma **zawsze ten sam rynsztunek co gracz**:
  - bez konia: walka piesza na miecze,
  - z koniem: walka konna. Z lancą lub kopią rycerzy dzieli drewniana bariera (tilt).
    Sam koń (bez lancy) oznacza konną walkę na miecze.
- Przeciwnik jest odwrócony w lewo, jedzie dalszym torem i nosi barwy swojego herbu (tunika, pióropusz).
  Godło na tarczy ma tylko wtedy, gdy gracz też je ma.
- Na początku każdej rundy losuje się, czy przeciwnik trafi (z jego skutecznością).
  - Gdy ma trafić, tnie albo opuszcza broń w idealnym momencie.
  - Gdy ma chybić, tnie za wcześnie (miecz) albo opuszcza broń za późno (lanca, kopia).
- Trafienie to punkt, z iskrami i odrzutem trafionego. Kopia przy trafieniu sypie drzazgami.
- Po rundzie pojawia się komunikat (np. „TRAFIASZ! · 1:0”). Walka kończy się, gdy wynik jest rozstrzygnięty,
  także wcześniej (np. 2:0 w walce na 3 rundy). **Remis po wszystkich rundach oznacza dogrywkę**,
  powtarzaną aż do rozstrzygnięcia.
- **Wygrana daje +4 monety**, a gracz zamienia się miejscem z pokonanym (pnie się w tabeli).
- **Porażka zabiera 2 monety.** Jeśli monet zostaje 0 lub mniej, gra się kończy („ODPADASZ Z TURNIEJU”).
  W przeciwnym razie jest rewanż z tym samym rycerzem.
- Koniec ligi:
  - pierwsze miejsce w lidze królewskiej to **ZWYCIĘSTWO, MISTRZ TURNIEJU** (iskry nad kopią),
  - pierwsze miejsce w niższej lidze to komunikat „WYGRYWASZ LIGĘ! ZAKUPY I AWANS — WKRÓTCE”
    (zakupy będą w kolejnej iteracji).

## Podpowiedź na turnieju
- Flaga „uderz tutaj” (z iteracji 4) pojawia się w **pierwszej walce turnieju**, czyli do pierwszej wygranej,
  także w rewanżu po porażce. Potem znika.
- Flaga uwzględnia, że przeciwnik jedzie naprzeciw. Pozycja jest liczona z sumy obu prędkości.
- Opcje treningu (1 – flaga, 2 – koniec treningu) na turnieju nie działają i ich przyciski są ukryte.

## Tabela turnieju i HUD
- Na treningu tabela pokazuje ligę królewską. Po wpisowym pokazuje **ligę gracza** z jego wierszem
  („★ TY”, liczba wygranych), bieżącym przeciwnikiem (różowy, „▶”) i pokonanymi rycerzami (wygaszeni,
  „POKONANY”).
- Tabela się przewija (20 rycerzy się nie mieści), a wiersz gracza jest zawsze na środku widoku.
  Nagłówek kolumn zostaje u góry.
- Etykieta gry pokazuje „LIGA … · MIEJSCE x/y”. Na telefonie miejsce jest w drugiej linii, żeby nie
  nachodziło na HUD.
- HUD w walce: „PRZEJŚCIE” zmienia się w **RUNDA x/y**, a „REKORD” w **WYNIK gracz:przeciwnik**.
- **R** w każdej chwili zaczyna wszystko od nowa (trening, tabela ligi królewskiej).

## Zmiany w plikach
- **nowe** `js/game/league.js`: listy rycerzy trzech lig, stałe herby, skuteczność i liczba rund z miejsca
  w tabeli, `leagueFor`, `startIndex`, `makeTour`.
- **nowe** `js/game/duel.js`: przebieg turnieju i walki (rundy, AI przeciwnika, trafienia, dogrywka,
  monety, koniec gry, wygrana liga).
- **nowe** `js/game/rival.js`: rysowanie przeciwnika (lustro, barwy herbu), bariera w walce konnej.
- `js/game/logic.js`: `S.tour`, `S.duel`, `knightSpeed()`, `targetX()`, `strikeTarget()`.
  Trafienia mieczem i lancą działają na kukłę albo na przeciwnika, a `updateGame` prowadzi walkę.
- `js/game/lance.js`: `updateLance` i `lanceAngle` przyjmują stan broni (przeciwnik ma własny).
  Nie da się opuścić broni między rundami.
- `js/game/assist.js`: `swordSweet()` i `lanceTip()`. Znacznik działa z ruchomym celem i pokazuje się
  w pierwszej walce turnieju.
- `js/game/knight.js`: opcjonalne barwy tuniki i pióropusza (`K.tunic`, `K.tunicD`, `K.plume`).
- `js/game/render.js`: przeciwnik, bariera i flaga na turnieju, odrzut trafionego gracza.
- `js/game/entry.js`: liga i miejsce startowe w oknie. TAK uruchamia turniej.
- `js/game/hud.js`: RUNDA, WYNIK, etykieta ligi, ukrywanie opcji treningu na turnieju.
- `js/side/standings.js`: tabela ligi gracza, wyróżnienia wierszy, przewijanie do gracza.
- `index.html`: nowe skrypty, etykiety HUD, wiersz ligi w oknie wpisowego, przewijana tabela.
- `css/side-panels.css`: przewijanie tabeli, style wierszy (gracz, przeciwnik, pokonany).
- `css/game-ui.css`: etykieta ligi i HUD na telefonie.

## Weryfikacja
Headless Chrome, bez błędów JS. Symulacja z „autopilotem”, który uderza dokładnie przy fladze:
- przy fladze trafia 40/40 rund każdą bronią (miecz pieszo, miecz na koniu, lanca, kopia),
- okno trafienia mieczem to ±2 px wokół flagi; lanca i kopia wybaczają więcej (czas trzymania),
- 0 przedmiotów, 0 monet, gracz nie uderza: przegrywa pierwszą walkę → `ko`, koniec gry,
- 0 przedmiotów z autopilotem: 20 wygranych → `league`, 1. miejsce, 80 monet,
- 4 przedmioty: start 13/21, 12 wygranych. Godło: 16/16. Lanca: 10/16,
- pełny rynsztunek: 11/11, 10 wygranych → `champion`. Bez uderzeń: 3 porażki → `ko`,
- R po turnieju: brak turnieju, tabela ma 10 wierszy, etykieta „TRENING RYCERZA”.

Zrzuty 1366×900 i 520×1250: walka piesza w lidze giermków, walka konna kopią za barierą,
przewijana tabela z graczem na środku.
