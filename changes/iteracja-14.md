# Iteracja 14 — blok (klawisz B), coraz lepsi przeciwnicy, spadek w tabeli po porażce

Data: 2026-10-18

## Blok — klawisz B (`block.js`, nowy plik)
- **B trzymane** = blok. Na ekranie jest też przycisk „[B] BLOK” (trzeba go przytrzymać myszą albo palcem).
- Blok działa **tylko w walce na miecze**: w walce pieszej i w walce konnej na miecze (koń bez lancy).
  Przy lancy i kopii bloku nie ma, a przycisk jest ukryty. B wciśnięte wtedy pokazuje komunikat „LANCA: BEZ BLOKU”.
- Skuteczność:
  - **tarcza** zatrzymuje **każdy** cios,
  - **sam miecz** (rycerz bez tarczy) zatrzymuje tylko **25%** ciosów. Większość przechodzi.
- Wygląd: tarcza **przesuwa się z boku przed rycerza** (na wysokość piersi), a miecz cofa się do góry za tarczę.
  Bez tarczy miecz staje pionowo przed rycerzem. Ruch trwa ok. 0,12 s, więc jest widoczny.
- Zasady bloku:
  - w bloku nie da się ciąć (SPACJA nie działa, dopóki trzymasz B),
  - pieszo w bloku chodzisz **o połowę wolniej**,
  - **ręka się męczy**: po 1,6 s trzymania blok opada („RĘKA ZMĘCZONA — BLOK OPADA”) i przez 0,7 s nie da się
    go podnieść. Puszczenie B na chwilę nie odnawia od razu sił. Nie da się więc stać za tarczą całą walkę,
    trzeba ją podnosić w porę, czyli wtedy, gdy przeciwnik unosi miecz.
- Zablokowany cios: brzęk, iskry przy tarczy, lekki odrzut obrońcy, komunikat „ZABLOKOWANE!” albo
  „PRZECIWNIK BLOKUJE”. Cios zablokowany nie zabiera życia i nie liczy się do trafień.
- Te same zasady ma przeciwnik (ma ten sam rynsztunek, więc tarczę ma tylko wtedy, gdy ma ją gracz).
- W walce konnej na miecze: każde podejście kończy się podsumowaniem z blokami, np.
  „PRZECIWNIK BLOKUJE · BEZ TRAFIEŃ · 0:0”.

## Przeciwnicy coraz lepsi (`league.js`, `foot.js`)
Każdy przeciwnik ma **poziom** (1-10, pokazywany na początku walki: „WALKA PIESZA: … · POZIOM 4”)
i cztery umiejętności:

| Umiejętność | Co robi przeciwnik |
|---|---|
| **ATAK** | krócej czeka, szybciej podchodzi, krótszy zamach, czyli atakuje częściej |
| **BLOK** | gdy bierzesz zamach w jego zasięgu, zasłania się tarczą |
| **UNIK** | gdy bierzesz zamach, odskakuje w tył |
| **KONTRA** | po odskoku albo bloku od razu naciera („cofa się i atakuje”), a z uniesionym mieczem czeka, aż opuścisz tarczę |

- **Poziom rośnie z miejscem przeciwnika w tabeli i z ligą**: ostatnie miejsce w lidze giermków ma poziom ok. 1,
  pierwsze ok. 8. W lidze rycerskiej od 3 do 9, w królewskiej od 5 do 10.
- **Stopniowo**: pierwsza walka turnieju jest zawsze prosta (poziom ok. 2), a każda kolejna walka podnosi limit
  poziomu o trochę (12 punktów procentowych). Nawet gracz, który zaczyna wysoko w tabeli, nie trafia od razu
  na mistrza.
- **Nikt nie ma wszystkiego na 100%**: każda umiejętność ma górną granicę 90%. Każdy rycerz ma też swój charakter
  (rozrzut umiejętności ±15%) i **jedną wyraźnie słabszą** umiejętność (o połowę). Przykład, rycerz z 1. miejsca
  ligi królewskiej: atak 85%, blok 48%, unik 90%, kontra 85%.
- Charakter rycerza jest stały, czyli ten sam rycerz zawsze walczy tak samo.
- W walce konnej na miecze przeciwnik w części podejść zasłania się tarczą zamiast ciąć. Szansa rośnie z jego blokiem.
- Celność ciosów (kolumna SKUT. 30 / 60 / 90%) zostaje jak w iteracji 11.

## Porażka = spadek w tabeli
- Po przegranej walce (jeśli zostają monety) gracz **spada o jedno miejsce**: rycerz spod niego wskakuje wyżej.
  Następnym przeciwnikiem jest właśnie on, czyli **słabszy rycerz** niż ten, z którym gracz przegrał.
  Komunikat: „PRZEGRANA … · -2 MONETY · SPADASZ NA 14. MIEJSCE”.
- Na ostatnim miejscu nie ma gdzie spaść, więc jest rewanż z tym samym rycerzem (jak wcześniej).
- Rycerz, który wyprzedził gracza, nie jest już oznaczony jako „POKONANY”.

## Zmiany w plikach
- **nowe** `js/game/block.js`: stan bloku (`newGuard`, `updateGuard`), skuteczność (`guardStops`), kąt miecza
  w bloku, blok gracza z klawisza B, efekt zablokowanego ciosu.
- `js/game/league.js`: umiejętności i charakter rycerzy (`SKILLS`, `rivalSkill`), poziomy lig, spadek gracza
  (`dropPlayer`).
- `js/game/foot.js`: AI z umiejętnościami (stan `guard`, `rivalAttack`, `rivalRecover`, `rivalReact`
  zamiast `rivalDodge`), blok przy trafieniach, wolniejszy chód w bloku, B w podpowiedzi.
- `js/game/duel.js`: poziom przeciwnika na starcie walki, blok w walce konnej na miecze (`strikePlayer`,
  blok w `hitRival`), podsumowanie rundy z blokami, spadek w tabeli po porażce.
- `js/game/knight.js`: tarcza przed rycerzem w bloku (`K.guard`).
- `js/game/rival.js`, `js/game/render.js`, `js/game/logic.js`: blok w rysowaniu i w kącie miecza,
  brak cięcia w bloku, aktualizacja bloku co klatkę.
- `js/game/input.js`: klawisz B (trzymany) i przycisk „[B] BLOK”.
- `js/game/hud.js`: przycisk bloku widoczny tylko w walce na miecze.
- `js/game/audio.js`: dźwięk bloku (`sfxBlock`).
- `index.html`: przycisk „[B] BLOK”, skrypt `block.js`.

## Weryfikacja
Headless Chrome, symulacja bez błędów JS:
- blok pieszo, gracz podnosi tarczę przy zamachu przeciwnika (2 min gry):
  - bez tarczy: 15 ciosów w zasięgu, 3 zablokowane mieczem (20%), 12 trafiło,
  - z tarczą: 9 ciosów w zasięgu, 9 zablokowanych, 0 trafień,
- przeciwnik blokuje ciosy gracza: poziom 0,15 to 6 bloków na 108 zamachów, poziom 0,9 to 33 bloki na 107,
- lanca: `canBlock` = false, przycisk ukryty, B nie podnosi tarczy. Konno z mieczem blok działa
  (12 podejść z blokiem, 0 trafień w gracza),
- poziomy (liga giermków od zera): 1, 1, 2, 2, 2, 3, … 7, 7, 8. Liga królewska: 2, 3, 4, 5, 6, 8, 8, 9, 9, 10,
- porażka na 13. miejscu: spadek na 14. Kolejna walka (po miasteczku) jest z rycerzem, który był pod graczem
  (Mietek Kuternoga, poziom 3), a nie z tym, z którym gracz przegrał,
- bot w lidze giermków (bez tarczy i z tarczą): wszystkie walki dochodzą do końca, liga wygrana, przeciwnicy blokują.

Zrzuty 1366×900: rycerze z tarczą wysuniętą przed siebie i rycerze bez tarczy z mieczem pionowo przed sobą.
