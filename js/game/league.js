'use strict';
/* Ligi turnieju: listy rycerzy, przydział gracza po treningu, siła przeciwników losowana z przebiegu turnieju.
   Listy są ułożone od najlepszego (miejsce 1) do najsłabszego; gracz wchodzi pod kimś i pnie się w górę. */
const WIN_COINS = 4, LOSS_COINS = 2;  // wygrana / porażka; porażka do 0 monet lub mniej = koniec gry
const TIER_ACC = [.3, .6, .9];        // skuteczność (do walki z nim): dolna, środkowa, górna część tabeli
const TIER_SHARE = .3;                // dolne i górne 30% tabeli (w lidze 10: 3 + 4 + 3)
const YIELD_MAX = .6;                 // szansa poddania się po trafieniu (od 5.) rycerza z ostatniego miejsca; z 1. miejsca 0

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
/* Umiejętności przeciwnika (AI, walka na miecze): atak (jak często i szybko naciera), blok, unik (odskok przed ciosem),
   kontra (po odskoku / bloku od razu naciera, czeka, aż gracz opuści tarczę). Poziom rośnie z miejscem przeciwnika
   w tabeli i z ligą, ale stopniowo: pierwsza walka turnieju jest prosta, każda kolejna dokłada FIGHT_STEP.
   Gracz, który przegrywa, spada w tabeli — trafia na niższe miejsca, czyli słabszych rycerzy.
   Każdy rycerz ma swój charakter (rozrzut umiejętności) i jedną wyraźnie słabszą; żadna nie dochodzi do 100%. */
const SKILLS = ['attack', 'block', 'dodge', 'counter'];
const SKILL_NAME = { attack: 'ATAK', block: 'BLOK', dodge: 'UNIK', counter: 'KONTRA' };
const SKILL_MAX = .9, SKILL_WEAK = .5;      // górna granica umiejętności, mnożnik słabszej

/* Siła przeciwników (trudność T.diff, 0-1) nie zależy już od miejsca w tabeli, tylko od przebiegu turnieju:
   - start: liga giermków od najsłabszych, liga rycerska i królewska od razu wyżej,
   - wygrana: trochę lepszy przeciwnik, a co losową liczbę wygranych (1-3) skok — losuje się rycerz z wyraźnie
     lepszymi statystykami (pierwszy skok zaraz po pierwszej walce),
   - porażka: łatwiejszy przeciwnik,
   - walka o 1. miejsce: zawsze prawie najlepszy w lidze.
   Kroki są dobrane tak, żeby seria samych wygranych dochodziła do najlepszych na końcu ligi. */
const LEAGUE_DIFF = { squire: [.1, .8], knight: [.35, .9], royal: [.5, .97] }; // trudność startowa / najwyższa
const DIFF_DOWN = 1.5;                       // porażka cofa o tyle średnich kroków
const DIFF_JITTER = .04;                     // rozrzut statystyk wokół trudności

/* herb i charakter (rozrzut umiejętności, słabsza strona) są stałe, z numeru rycerza */
for (const L of Object.values(LEAGUES)) {
  const n = L.knights.length, k = Math.round(n * TIER_SHARE);
  L.knights = L.knights.map((name, i) => {
    const tier = i < k ? 2 : i >= n - k ? 0 : 1, rnd = seededRandom(L.seed + i * 131 + 7);
    const flair = SKILLS.map(() => .85 + rnd() * .3), weak = SKILLS[rnd() * SKILLS.length | 0];
    return { name, emblem: randomEmblem(seededRandom(L.seed + i * 97)), acc: TIER_ACC[tier], rank: i, flair, weak };
  });
}

const randIn = (a, b) => a + Math.random() * (b - a);
/* średni krok trudności na jedną wygraną: od startu do szczytu przez wszystkie walki ligi */
function diffStep(T) { const [lo, hi] = LEAGUE_DIFF[T.key]; return (hi - lo) / Math.max(1, T.start - 1); }
/* po walce: wygrana podnosi trudność (czasem skokiem), porażka obniża */
function nextDiff(T, win) {
  const [lo, hi] = LEAGUE_DIFF[T.key], avg = diffStep(T);
  if (win) {
    T.diff += avg * randIn(.2, .4);
    if (--T.jumpIn <= 0) { T.diff += avg * randIn(1, 2); T.jumpIn = 1 + (Math.random() * 3 | 0); } // lepszy rycerz
  } else T.diff -= avg * DIFF_DOWN;
  T.diff = clamp(T.diff, lo, hi);
}

/* statystyki przeciwnika w bieżącej walce: poziom, skuteczność, umiejętności (z jego charakterem) */
function rivalSkill(T, opp) {
  const hi = LEAGUE_DIFF[T.key][1];
  let lvl = T.diff;
  if (opp.rank === 0) lvl = Math.max(lvl, hi - .05);       // o 1. miejsce: prawie najlepszy
  if (T.wins + T.losses > 0) lvl += randIn(-DIFF_JITTER, DIFF_JITTER);
  lvl = clamp(lvl, .03, 1);
  const sk = { lvl, acc: clamp(lerp(.3, .9, lvl) + randIn(-.05, .05), .25, .92) };
  SKILLS.forEach((s, i) => { sk[s] = clamp(lvl * opp.flair[i] * (s === opp.weak ? SKILL_WEAK : 1), .03, SKILL_MAX); });
  opp.acc = Math.round(sk.acc * 20) / 20; // tabela pokazuje skuteczność wylosowaną do walki
  return sk;
}
/* szansa poddania się po trafieniu (od 5.): im niżej w tabeli, tym częściej; z 1. miejsca walczy do końca */
function yieldChance(T, opp) {
  const n = LEAGUES[T.key].knights.length;
  return YIELD_MAX * Math.pow(opp.rank / (n - 1), 1.5);
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
  return { key, name: L.name, list, pos, wins: 0, losses: 0, start: pos, diff: LEAGUE_DIFF[key][0], jumpIn: 1 };
}

/* porażka: gracz spada o jedno miejsce (rycerz spod niego wskakuje wyżej), kolejny przeciwnik jest słabszy.
   Na ostatnim miejscu nie ma gdzie spaść — rewanż z tym samym rycerzem. */
function dropPlayer(T) {
  if (T.pos >= T.list.length - 1) return false;
  const below = T.list[T.pos + 1];
  below.beaten = false; // wyprzedził gracza
  [T.list[T.pos], T.list[T.pos + 1]] = [below, T.list[T.pos]]; T.pos++;
  return true;
}
