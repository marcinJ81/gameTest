# Iteracja 16 — wolniejsze odnawianie energii, zmęczenie spowalnia ruch, wyczerpanie

Data: 2026-10-18

## Cel
Po teście iteracji 15 dalej dało się atakować bez przerwy. Energia odnawia się teraz dłużej, a brak energii
ma konsekwencje: rycerz wolniej chodzi, a wyczerpany wolniej odpoczywa. Ciągła szarża się nie opłaca.

## Zmiany (`stamina.js`)
- **Dwa razy dłuższe odnawianie.** Czas odzyskania siły na jeden cios (30% energii):

  | Rynsztunek | sam miecz | + tarcza | + hełm | + zbroja | + lepszy miecz | + godło | + koń | + lanca | + kopia |
  |---|---|---|---|---|---|---|---|---|---|
  | było (s) | 1,6 | 1,5 | 1,4 | 1,3 | 1,2 | 1,1 | 1,0 | 0,9 | 0,8 |
  | jest (s) | 3,2 | 3,0 | 2,8 | 2,6 | 2,4 | 2,2 | 2,0 | 1,8 | 1,6 |

- **Poniżej 50% energii rycerz chodzi o połowę wolniej** (walka piesza, w obie strony). Kara sumuje się z blokiem:
  w bloku i bez sił rycerz chodzi na 1/4 prędkości. Pasek energii jest wtedy żółty, napis „· WOLNIEJ”.
- **Zejście do 10% = wyczerpanie**: energia wraca **o połowę wolniej**, dopóki znów nie starczy na cios (30%).
  Komunikat „WYCZERPANY — ENERGIA WRACA WOLNIEJ”, pasek czerwony i mruga, napis „· WYCZERPANY”.
  Trzy ciosy z rzędu z pełnego paska kończą się właśnie wyczerpaniem.
- Bez zmian: cios kosztuje 30%, wymaga 30%, a blok, stanie i cofanie nie zużywają energii.
- **Przeciwnik ma te same zasady** (wolniejszy chód poniżej 50%, wyczerpanie), jego paska nadal nie widać.

## Co to daje graczowi
- Trzy ciosy z rzędu: wyczerpanie i ok. 4,3 s (sam miecz) do kolejnego ciosu, przez cały ten czas chód o połowę wolniejszy.
- Dwa ciosy i przerwa: zostaje 40%, odnawianie jest normalne. Z samym mieczem po 3,2 s znowu są 2 ciosy.
- Najbardziej opłaca się oszczędne tempo: cios, blok albo odskok, a nie ciągła szarża.

## Zmiany w plikach
- `js/game/stamina.js`: nowe czasy (`EN_TIME_WORST` 3,2 s, `EN_TIME_STEP` 0,2 s), spowolnienie chodu
  (`EN_SLOW`, `enMove`), wyczerpanie (`EN_EXHAUST`, `exhausted`, wolniejsze `regen`), komunikat i kolory paska.
- `js/game/foot.js`: prędkość gracza i przeciwnika zależna od energii.
- `js/game/duel.js`: wyczerpanie zerowane na początku walki.
- `css/game-ui.css`: żółty pasek energii poniżej 50%.

## Weryfikacja
Headless Chrome, bez błędów JS:
- 3 ciosy z rzędu, zostaje 10% i jest wyczerpanie. Od 10% do 30% (wyczerpany): 4,27 s (sam miecz),
  3,20 s (4 przedmioty), 2,13 s (pełny rynsztunek). Od 40% do 70% (normalnie): 3,20 / 2,40 / 1,60 s,
- chód: 26 px/s przy 100% energii, 13 px/s przy 49%,
- bot w lidze giermków: 20 wygranych (12 przez poddanie), z 4 przedmiotami 12 wygranych,
- testy bloku z iteracji 14 bez zmian.

Uwaga: bot, który idealnie blokuje i wycofuje się przy braku sił, walczy teraz zwykle 1,5-4 min gry na walkę
(w iteracji 15 było to 0,5-1,5 min). Walki są wyraźnie dłuższe. Jeśli w grze okażą się za długie, łatwo to
zmienić stałymi `EN_TIME_WORST` / `EN_TIME_STEP` w `stamina.js`.
