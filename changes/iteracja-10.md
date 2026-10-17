# Iteracja 10 — okna „Ekwipunek rycerza” i „Tabela turnieju”

Data: 2026-10-16

## Cel
W miejscu dawnych paneli Ziemi i robota są dwa okna, widoczne od początku treningu:
po lewej **EKWIPUNEK RYCERZA**, po prawej **TABELA TURNIEJU**.

## Ekwipunek rycerza (lewe okno, ramka cyjan)
- 8 slotów (4 × 2) w kolejności zdobywania: tarcza, hełm, zbroja, lepszy miecz, godło na tarczy, koń,
  lanca, kopia.
- **Niezdobyty** przedmiot to ciemny cień z wygaszonym podpisem, więc widać, co jeszcze jest do zdobycia.
  **Zdobyty** przedmiot jest kolorowy, a slot ma ramkę i jasny podpis. Nowy slot przez chwilę mruga.
- Przedmioty są rysowane tymi samymi sprite'ami co w grze. Małe przedmioty mają skalę 2×.
  Koń ma czaprak w barwach godła. Tarcza z godłem pokazuje wylosowany herb gracza.
- **Pole monet**: liczba i rząd pikselowych monet (do 12, potem „+”).
- Okno odświeża się razem z HUD-em (`updateHud` → `renderInventory`). Sloty są przerysowywane
  tylko przy zmianie rynsztunku lub godła. R czyści ekwipunek.

## Tabela turnieju (prawe okno, ramka różowa)
- 10 rycerzy, lista na razie stała. Kolumny: numer, herb, imię, punkty (wszędzie 0).
- Każdy rycerz ma swój herb, losowany powtarzalnie z jego numeru (`seededRandom`), więc jest zawsze taki sam.
- Rycerze:
  1. Wyrwichwast znad Wisły
  2. Hujogryz z Krakowa
  3. Przydupas z Koziej Bóbki
  4. Łamignat z Pcimia Dolnego
  5. Zbyszko Bezkopijny z Bogdańca
  6. Mszczuj Siedmiozbrój z Sandomierza
  7. Dobromir Rdzawy z Wąchocka
  8. Bolko Kopytko z Chrząszczyrzewoszyc
  9. Gniewko Krzywolancy z Gniezna
  10. Sobiesław Tłustobrzuch z Kalisza

  Pierwsze trzy imiona pochodzą z zadania. W zapisie poprawiono „z nad” → „znad”
  i „Kozie bóbki” → „Koziej Bóbki”.

## Układ
- Komputer: górny wiersz ma dwie kolumny jak dawniej (`minmax(224px,40.6vh)`), a gra jest pod nimi.
- Telefon (≤820px): ekwipunek (min. 260px), tabela (min. 330px), gra (440px).
- Długie imiona w tabeli są ucinane wielokropkiem, gdy brakuje miejsca.

## Zmiany w plikach
- **nowe** `js/side/inventory.js`: sloty ekwipunku i pole monet.
- **nowe** `js/side/standings.js`: lista 10 rycerzy z herbami, rysowanie tabeli.
- **nowe** `css/side-panels.css`: wygląd obu okien.
- `index.html`: sekcje `#invPanel` i `#tourneyPanel` zamiast czarnego pasa, nowe skrypty i arkusz.
- `js/game/hud.js`: `updateHud` odświeża też ekwipunek.
- `js/game/knight.js`: `randomEmblem(rnd)` przyjmuje własny generator (domyślnie `Math.random`).
- `js/core/utils.js`: `seededRandom(seed)` (mulberry32).
- `css/panels.css`, `css/base.css`: usunięty `.blank`, wiersze siatki na telefonie.

## Weryfikacja
- Headless Chrome 1366×768, 1920×1080 i 520×1100, bez błędów JS. Po 6 nagrodach jest 6 zdobytych slotów
  (z koniem) i 6 monet (4 + 2 za konia). Tabela ma 10 wierszy.
- Pełny scenariusz z iteracji 8 (1, 2, turniej, wpisowe, R) działa, a po R ekwipunek jest pusty i są 4 monety.
