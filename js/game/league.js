'use strict';
/* Ligi turnieju: listy rycerzy, przydział gracza po treningu, siła przeciwników z miejsca w tabeli.
   Listy są ułożone od najlepszego (miejsce 1) do najsłabszego; gracz wchodzi pod kimś i pnie się w górę. */
const WIN_COINS = 4, LOSS_COINS = 2;  // wygrana / porażka; porażka do 0 monet lub mniej = koniec gry
const TIER_ACC = [.3, .6, .9];        // skuteczność: dolna, środkowa, górna część tabeli
const TIER_SHARE = .3;                // dolne i górne 30% tabeli (w lidze 10: 3 + 4 + 3)
const TOP_ROUNDS = 4, ROUNDS = 3;     // najlepsi walczą na 4 rundy, reszta na 3

const LEAGUES = {
  squire: { name: 'LIGA GIERMKÓW', seed: 2210, knights: [
    'Florek Ziemniaczany z Kutna',
    'Wincenty Bezhełmy z Bełchatowa',
    'Bartosz Kopyrdała z Kołbieli',
    'Ignacy Krzywonos z Konina',
    'Szczepan Czkawka z Pcimia Górnego',
    'Gerwazy Zadek z Grajewa',
    'Kuba Dziurawiec z Dziurdziul',
    'Grzesiek Rzepa z Rzepina',
    'Zenek Strachajło z Bojanowa',
    'Józek Chudopachołek z Mławy',
    'Kazik Drewnianomieczny z Lasek',
    'Tadek Łapciuch z Łap',
    'Mietek Kuternoga z Koziegłów',
    'Antek Śpioch z Zaspy',
    'Felek Bagienny z Błot Wielkich',
    'Wacek Pchełka z Kurzej Stopki',
    'Maciek Kiszony z Kiszkowa',
    'Bolek Smarkacz z Psiej Wólki',
    'Olek Pustakieszeń z Biedaszkowa',
    'Stach Bezmonetny z Dziadowej Kłody'
  ] },
  knight: { name: 'LIGA RYCERSKA', seed: 3310, knights: [
    'Zawisza Przyczarny z Garbowa',
    'Budziwoj Rozbijtarcza z Radomia',
    'Racibor Kiełbasa z Ciechocinka',
    'Ziemowit Siekierka z Siedlec',
    'Krzesimir Śledziowy z Pucka',
    'Bogumił Garnkogłowy z Bolesławca',
    'Wojsław Bigosowy z Biłgoraja',
    'Dzierżko Miodopij z Tyczyna',
    'Ottokar Pyzaty z Pyzdr',
    'Wszebor Kaszanka z Kartuz',
    'Świętopełk Ogórek z Kruszwicy',
    'Mikołaj Bezzębny z Opatowa',
    'Zdzisław Kłapouchy z Kłodawy',
    'Lechosław Zadyszka z Zakopanego',
    'Jaksa Niedopity z Żywca'
  ] },
  royal: { name: 'LIGA KRÓLEWSKA', seed: 1410, knights: [ // lista z iteracji 10 (te same herby)
    'Wyrwichwast znad Wisły',
    'Hujogryz z Krakowa',
    'Przydupas z Koziej Bóbki',
    'Łamignat z Pcimia Dolnego',
    'Zbyszko Bezkopijny z Bogdańca',
    'Mszczuj Siedmiozbrój z Sandomierza',
    'Dobromir Rdzawy z Wąchocka',
    'Bolko Kopytko z Chrząszczyrzewoszyc',
    'Gniewko Krzywolancy z Gniezna',
    'Sobiesław Tłustobrzuch z Kalisza'
  ] }
};
/* herb i siła każdego rycerza są stałe: herb z jego numeru, siła z miejsca w tabeli */
for (const L of Object.values(LEAGUES)) {
  const n = L.knights.length, k = Math.round(n * TIER_SHARE);
  L.knights = L.knights.map((name, i) => {
    const tier = i < k ? 2 : i >= n - k ? 0 : 1;
    return { name, emblem: randomEmblem(seededRandom(L.seed + i * 97)), acc: TIER_ACC[tier], rounds: tier === 2 ? TOP_ROUNDS : ROUNDS };
  });
}

/* liga z rynsztunku: 0-4 (tarcza, hełm, zbroja, miecz) giermkowie, 5-7 (godło, koń, lanca) rycerze, 8 (kopia) królewska */
const leagueFor = gear => gear >= GEAR.length ? 'royal' : gear >= 5 ? 'knight' : 'squire';
/* miejsce startowe (indeks od 0, pod ostatnim = n): każdy przedmiot podnosi gracza w tabeli.
   Monety nie przesuwają w tabeli, ale dają zapas na porażki (łatwiej przetrwać). */
function startIndex(key, gear) {
  const n = LEAGUES[key].knights.length;
  if (key === 'royal') return n;                // najlepsza dziesiątka: trzeba pokonać wszystkich
  if (key === 'knight') return n - (gear - 5) * 3;
  return n - gear * 2;
}

/* turniej gracza: kopia listy ligi z graczem wstawionym na miejsce startowe */
function makeTour(gear) {
  const key = leagueFor(gear), L = LEAGUES[key];
  const list = L.knights.map(k => ({ ...k, beaten: false }));
  const pos = startIndex(key, gear);
  list.splice(pos, 0, { me: true, name: 'Ty' });
  return { key, name: L.name, list, pos, wins: 0, losses: 0 };
}
