# Iteracja 4 — podpowiedź po dwóch pudłach

Data: 2026-10-16

## Cel
Ułatwienie dla gracza, któremu nie idzie. Po **2 pudłach pod rząd** przed kukłą pojawia się
znacznik, który pokazuje, w którym momencie uderzyć. Działa tak samo pieszo z mieczem
i na koniu (miecz, lanca, kopia).

## Zasady
- Pudło = przejście obok kukły bez trafienia. Licznik pudeł pod rząd (`missStreak`) rośnie
  przy każdym pudle. Przy 2 włącza się podpowiedź, a komunikat mówi
  „PUDŁO! PODPOWIEDŹ: SPACJA/X PRZY ZNACZNIKU”.
- Podpowiedź **zostaje**, dopóki gracz nie trafi. Kolejne pudła jej nie wyłączają.
- **Trafienie** chowa podpowiedź i zeruje licznik. Następne 2 pudła pod rząd włączą ją znowu.
- Koniec gry (wygrana/przegrana) ukrywa znacznik. R (od nowa) zeruje wszystko.

## Znacznik
- Chorągiewka na tyczce i migający pasek na ziemi, przed kukłą.
  Gdy rycerz na nim stanie, trzeba wcisnąć SPACJĘ (miecz) albo X (lanca/kopia).
- Kolory: **żółty** = czekaj, **biały** + strzałka nad głową rycerza = TERAZ,
  **czerwony** = broń niegotowa (trwa zamach/zadyszka albo lanca się podnosi/rycerz odpoczywa).
- Pozycja liczona z tej samej geometrii, której używa sprawdzanie trafienia. Uwzględnia prędkość
  (z koniem), długość miecza/lancy/kopii i czas opuszczania lancy/kopii, więc przesuwa się
  przy każdej zmianie broni.

## Zmiany w plikach
- **nowe** `js/game/assist.js`: `assistMarkerX()` (gdzie wcisnąć), `assistReady()`,
  `drawAssist()` (znacznik przed kukłą), `drawAssistCue()` (strzałka TERAZ nad rycerzem).
- `js/game/logic.js`: stan `missStreak`, `assist`. Włączanie w `doMiss()`, wyłączanie przy trafieniu.
- `js/game/data.js`: `ASSIST_AFTER = 2`.
- `js/game/render.js`: rysowanie znacznika (pod kukłą) i strzałki (nad rycerzem).
- `index.html`: skrypt `assist.js`.

## Weryfikacja
- Symulacja: po 2 pudłach `assist=true`. Po trafieniu `assist=false`, licznik = 0.
- Bot, który patrzy **tylko na znacznik**: 9 wciśnięć = 9 trafień w jednej pełnej grze
  (miecz → koń → lanca → kopia), 100/100 wygranych w 100 grach. Znacznik jest trafny w każdej fazie.
- Zrzut: żółty znacznik przed kukłą, biały pasek i strzałka nad rycerzem w momencie „teraz”.
- Strona ładuje się bez błędów JS.
