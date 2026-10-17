# Iteracja 5 — tło turnieju rycerskiego (część 1)

Data: 2026-10-16

## Cel
Trening się skończył. Kto zdobył zbroję, konia i lancę, jedzie na prawdziwy turniej.
Na początek zmienia się tylko tło i układ paneli. Zasady gry zostają bez zmian.

## Układ strony
- Górne panele (Ziemia i robot) są **o 30% niższe**: `minmax(320px,58vh)` → `minmax(224px,40.6vh)`.
  Dolny panel z grą zajmuje zwolnione miejsce (min. 360px).
- Telefon (≤820px): `320/340/340px` → `224/224/440px`.
- Ziemia w grze leży niżej: `surf` = 70% wysokości panelu (było 55%). Nad nią jest więcej miejsca na scenę.

## Nowe tło (zamiast cmentarza)
Kolejność od lewej: **namioty | trybuna | loża książęca | trybuna | namioty**.
- **Loża honorowa** na środku, na podwyższeniu: baldachim w pasy czerwień/złoto z lambrekinem,
  złote słupy, błękitna kotara. Podest okryty błękitną płachtą w złote lilie z herbem (złota korona
  na czerwieni). Dwa trony.
  - **Książę**: korona, broda, płaszcz z gronostajem, berło.
  - **Księżna**: hennin (wysoki stożkowy czepiec z welonem), zielona suknia. Co kilka sekund macha chusteczką.
  - Na szczycie baldachimu powiewa sztandar. Na szerokim ekranie po bokach podestu stoją heroldowie z trąbami.
- **Trybuny** obok pary książęcej: drewniane stopnie, pasiasta markiza, barierka z płachtami
  i tarczami herbowymi. **Tłum** w 3 rzędach, ok. 180 osób na dużym ekranie. Ludzie podskakują,
  wiwatują z ręką w górze i **machają chorągiewkami** na boki.
- **Namioty rycerzy** po lewej i prawej (po 2, na telefonie po 1): okrągłe pawilony w pionowe pasy,
  stożkowy dach, ząbkowany lambrekin, otwarte wejście, linki odciągowe, proporzec na maszcie.
  Przed każdym namiotem stoi stojak z tarczą rycerza, a o namiot oparta jest kopia. Barwy namiotów
  są losowane.
- **Niebo**: dzienne, z gradientem i ditheringiem. Słońce z poświatą, chmury, ptaki. W oddali
  wzgórza i zamek z wieżami.
- **Arena**: ubity piasek z koleiną i śladami kopyt w miejscu, którym jedzie rycerz. Pod trybunami cień.
  Z przodu trawa z kwiatkami.

## Wydajność
Statyczne części są rysowane raz, przy zmianie rozmiaru, na 3 warstwy (canvas poza ekranem):
niebo+ziemia → konstrukcje → barierki. W każdej klatce rysowane są tylko elementy ruchome:
chmury, ptaki, tłum, para książęca, proporce. Wcześniej cały bufor pikseli liczył się co klatkę.

## Zmiany w plikach
- **nowe** `js/game/arena-data.js`: palety i sprite'y turnieju (para książęca, trony, herb, tłum, namioty).
- **nowe** `js/game/sky.js`: niebo, słońce, wzgórza, zamek, chmury, ptaki.
- **nowe** `js/game/tents.js`: namioty i powiewające proporce (`drawPennant`).
- **nowe** `js/game/stands.js`: trybuny, tłum, barierki.
- **nowe** `js/game/royal.js`: loża, para książęca, heroldowie.
- `js/game/scenery.js`: przepisany. Rozkład sceny, pieczenie warstw, składanie klatki.
- `js/game/ground.js`: przepisany. Piasek areny i trawa zamiast warstw ziemi i lawy.
- `js/game/data.js`: usunięte zasoby cmentarza (nagrobki, dynie, nietoperze, duch, paleta `GC`, `PPM`, `LAYER_TO`).
- `js/game/render.js`: tło przez `drawScenery`, bez pętli po buforze i bez mgły.
- `js/game/logic.js`: `surf` 0.55 → 0.7.
- `css/base.css`: wysokości wierszy siatki.
- `index.html`: nowe skrypty.

## Weryfikacja
- Headless Chrome 1920×1080, 1366×768, 520×1100: strona bez błędów JS, scena dobrze się układa.
- 200 klatek gry z kopią (`updateGame` + `renderGame`): bez błędów.
- Rozgrywka (trafienia, monety, podpowiedź) bez zmian w logice.

## Uwagi / na później
- Etykieta panelu nadal brzmi „TRENING RYCERZA”, a kukła stoi przed lożą. Gra toczy się jeszcze
  według zasad treningu. Przejście do właściwego turnieju to kolejne kroki.
- Na wąskim ekranie HUD nachodzi na etykietę, a podpowiedź na przyciski. Tak było już przed tą iteracją.
