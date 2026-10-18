'use strict';
/* Walka turniejowa. Wyposażenie przeciwnika = wyposażenie gracza.
   Z koniem: walka konna — gracz jedzie z lewej, przeciwnik z prawej, mijają się (jedno podejście = runda).
   Przeciwnik trafia z prawdopodobieństwem zależnym od swojego miejsca w tabeli. Konna walka trwa do remisu
   (1:1, 2:2…) — wtedy rycerze zsiadają z koni i walczą pieszo (foot.js). Bez konia od razu walka piesza.
   Każde trafienie zabiera pasek życia (100): miecz 5 / lepszy 10, lanca 25, kopia 50. */
const DUEL_SPEED = 28;               // px/s pieszo, na koniu × HORSE_MUL
const DUEL_PAST = 46;                // runda kończy się, gdy rycerze miną się o tyle pikseli
const DUEL_INTRO = 1.6, DUEL_BETWEEN = 1.3, DUEL_RESULT = 2.6; // pauzy (s)
const RIVAL_LANE = 3;                // przeciwnik jedzie torem dalej od widza (wyżej o tyle pikseli)
const RIVAL_MISS_EARLY = 16;         // pudłujący przeciwnik tnie za wcześnie, o tyle pikseli

const WEAPON_FIGHT = { sword: 'MIECZE', lance: 'LANCE', kopia: 'KOPIE' };
const DUEL_HP = 100;
const DAMAGE = { lance: 25, kopia: 50 };  // miecz: SWORD_DMG
const SWORD_DMG = [5, 10];                // miecz podstawowy / lepszy
/* poziom przeciwnika dla gracza: 1-10 */
const skillLevel = sk => Math.max(1, Math.round(sk.lvl * 10));
const damage = () => weapon() === 'sword' ? SWORD_DMG[hasGood() ? 1 : 0] : DAMAGE[weapon()];

/* po wpisowym: lista ligi, gracz na miejscu startowym, pierwsza walka */
function startTournament() {
  S.over = null; S.tour = makeTour(S.gear);
  S.swing = false; S.cool = 0;
  updateHud();
  startTransition('tournament', beginFight);
}

/* walka z rycerzem tuż nad graczem w tabeli */
function beginFight() {
  const T = S.tour, opp = T.list[T.pos - 1];
  S.duel = { opp, round: 0, ps: 0, os: 0, hp: DUEL_HP, ohp: DUEL_HP, foot: false, fp: 0, fo: 0,
    hint: T.wins === 0 || Game.assistOn, phase: 'intro', t: 0, hurtT: 9, ohurtT: 9,
    sk: rivalSkill(T, opp), // statystyki przeciwnika wylosowane do tej walki (league.js)
    oen: EN_MAX };          // ukryta energia przeciwnika (stamina.js)
  S.en = EN_MAX; S.enTired = false;
  if (mounted()) setupRound(); else setupFoot();
  renderStandings(); // tabela ligi gracza z podświetlonym przeciwnikiem od pierwszej walki
  toast((mounted() ? 'WALKA KONNA' : 'WALKA PIESZA') + ': ' + opp.name.toUpperCase() + ' · POZIOM ' + skillLevel(S.duel.sk));
}

function setupRound() {
  const D = S.duel, W = Game.W;
  D.round++;
  S.x = Math.round(W * .08); D.ox = Math.round(W * .92);
  S.walk = 0; D.owalk = 0;
  S.swing = false; S.at = 0; S.struck = false; S.cool = 0; S.hitPass = false; S.lance = newLance();
  D.vo = knightSpeed();                       // przeciwnik jedzie tak samo szybko
  D.will = Math.random() < D.sk.acc;          // czy przeciwnik trafi w tej rundzie
  D.oHit = false; D.oSwing = false; D.oAt = 0; D.oActed = false; D.oLance = newLance();
  S.guard = newGuard(); D.oguard = newGuard(); D.pBlock = D.oBlock = false;
  D.oBlocks = weapon() === 'sword' && Math.random() < D.sk.block * .5; // w tej rundzie przeciwnik się zasłania zamiast ciąć
  D.hurtT = D.ohurtT = 9;
  D.phase = 'intro'; D.t = DUEL_INTRO;
  S.parts = [];
  const key = weapon() === 'sword' ? 'SPACJA' : 'X', block = weapon() === 'sword' ? ' · <kbd>B</kbd> BLOK' : '';
  setHint('RUNDA ' + D.round + ' · ' + WEAPON_FIGHT[weapon()] + (D.hint ? ' · <kbd>' + key + '</kbd> PRZY FLADZE' : ' · PRZYGOTUJ SIĘ') + block);
  updateHud();
}

function updateDuel(dt) {
  const D = S.duel;
  if (D.phase === 'result' && (D.t -= dt) <= 0) { afterFight(); return; } // po walce konnej i pieszej
  if (D.foot) { updateFoot(dt); return; }
  D.hurtT += dt; D.ohurtT += dt;
  if (D.phase === 'intro') {
    if ((D.t -= dt) <= 0) { D.phase = 'ride'; setHint(null); }
  } else if (D.phase === 'ride') {
    const v = knightSpeed();
    S.x += v * dt; S.walk += v * dt * .45;
    D.ox -= D.vo * dt; D.owalk += D.vo * dt * .45;
    updateRival(dt);
    if (S.x - D.ox > DUEL_PAST) endRound();
  } else if (D.phase === 'between') {
    if ((D.t -= dt) <= 0) nextRound();
  }
  if (D.phase !== 'ride' && weapon() !== 'sword') updateLance(dt, LANCES[weapon()], D.oLance); // broń wraca do góry
}

/* przeciwnik: miecz — zamach przy właściwej odległości (albo za wcześnie, gdy ma chybić); w rundzie z blokiem
   najpierw zasłania się tarczą, a tnie dopiero po ciosie gracza (za późno, żeby trafić).
   Lanca / kopia — opuszcza w porę (albo za późno), bez bloku */
function updateRival(dt) {
  const D = S.duel, gap = D.ox - S.x, close = knightSpeed() + D.vo;
  if (weapon() === 'sword') {
    const sweet = swordSweet(), late = D.oBlocks && gap > sweet - 2;
    if (!D.oActed && !late && gap <= sweet + close * STRIKE_AT * SWING_T + (D.will ? 0 : RIVAL_MISS_EARLY)) {
      D.oActed = true; D.oSwing = true; D.oAt = 0; D.oStruck = false; D.oen -= EN_COST; sfxSwing();
    }
    if (D.oSwing) {
      D.oAt += dt / SWING_T;
      if (!D.oStruck && D.oAt >= STRIKE_AT) { D.oStruck = true; if (D.will && !D.oBlocks) strikePlayer(); }
      if (D.oAt >= 1) D.oSwing = false;
    }
    updateGuard(D.oguard, D.oBlocks && !D.oActed && gap < 40, dt);
    return;
  }
  const spec = LANCES[weapon()], tip = lanceTip();
  if (!D.oActed && gap <= 3 + tip + close * (D.will ? spec.lower * LANCE_HIT_K + .1 : spec.lower * .3)) {
    D.oActed = true; D.oLance.st = 'lowering';
  }
  updateLance(dt, spec, D.oLance);
  if (D.will && !D.oHit && D.oLance.k >= LANCE_HIT_K && gap <= tip + 3) { D.oLance.st = 'raising'; hitPlayer(); }
}

function burst(x, y, n, cols, dir) {
  for (let i = 0; i < n; i++) S.parts.push({ x, y, vx: dir * (10 + Math.random() * 50), vy: -20 - Math.random() * 50, c: cols[i % cols.length], s: 1, life: .6, kind: 'spark' });
}

/* cios przeciwnika mieczem: blok gracza (tarcza zawsze, sam miecz czasem) albo trafienie */
function strikePlayer() {
  const D = S.duel;
  if (!guardStops(S.guard)) { hitPlayer(); return; }
  D.pBlock = true;
  blockFx(S.x + 4, knightY() - 12, -1);
  toast('ZABLOKOWANE!');
}
/* przeciwnik trafia gracza */
function hitPlayer() {
  const D = S.duel;
  D.oHit = true; D.os++; D.hp = Math.max(0, D.hp - damage()); D.hurtT = 0;
  sfxHit();
  burst(S.x, knightY() - 12, 10, ['#ffffff', '#ff5a5a', '#fff3a0'], -1);
  updateHud();
}
/* gracz trafia przeciwnika (wywoływane z checkHit / checkLanceHit) */
function hitRival() {
  const D = S.duel;
  if (S.hitPass) return; // jedno trafienie na rundę
  S.hitPass = true;
  if (weapon() === 'sword' && guardStops(D.oguard)) { // przeciwnik zasłonił się tarczą (albo mieczem)
    D.oBlock = true;
    blockFx(D.ox - 4, Game.surf - RIVAL_LANE - 15, 1);
    toast('PRZECIWNIK BLOKUJE');
    return;
  }
  D.ps++; D.ohp = Math.max(0, D.ohp - damage()); D.ohurtT = 0;
  sfxHit(); sfxChime();
  const y = Game.surf - RIVAL_LANE - (mounted() ? 15 : 12);
  burst(D.ox, y, 10, ['#ffffff', '#fff3a0', '#ffd23d'], 1);
  if (weapon() === 'kopia') burst(D.ox - 2, y, 8, [LANCE_C.RED, LANCE_C.WHITE], -1); // drzazgi kopii
  updateHud();
}

function endRound() {
  const D = S.duel, me = S.hitPass && !D.oBlock, him = D.oHit;
  D.phase = 'between'; D.t = DUEL_BETWEEN;
  const blocks = D.oBlock || D.pBlock ? (D.oBlock && D.pBlock ? 'OBAJ BLOKUJĄ' : D.oBlock ? 'PRZECIWNIK BLOKUJE' : 'BLOKUJESZ') + ' · ' : '';
  toast(blocks + (me && him ? 'OBAJ TRAFIENI' : me ? 'TRAFIASZ!' : him ? 'PRZECIWNIK TRAFIA' : blocks ? 'BEZ TRAFIEŃ' : 'OBAJ CHYBIAJĄ') + ' · ' + D.ps + ':' + D.os);
}

/* po rundzie: pasek na zero kończy walkę, remis (1:1, 2:2…) = zejście z koni, inaczej kolejna runda.
   (Remis na zero i oba paski na zero naraz się nie zdarzą: remis przerywa walkę konną wcześniej.) */
function nextRound() {
  const D = S.duel;
  if (D.ohp <= 0 || D.hp <= 0) { finishFight(D.ohp <= 0); return; }
  D.phase = 'wait';
  if (D.ps === D.os && D.ps > 0) dismount();
  else startTransition('tournament', setupRound);
}
/* zejście z koni: po pojedynku na kopie paski liczone od nowa (100), po lancy / mieczu zostają */
function dismount() {
  const D = S.duel, kopia = weapon() === 'kopia';
  toast('REMIS ' + D.ps + ':' + D.os + ' — ZSIADACIE Z KONI!');
  startTransition('tournament', () => {
    if (kopia) D.hp = D.ohp = DUEL_HP;
    setupFoot();
    toast('WALKA PIESZA' + (kopia ? ' · PASKI ŻYCIA OD NOWA' : ''));
  });
}

/* how: powód końca (np. poddanie) zamiast samego wyniku */
function finishFight(win, how) {
  const D = S.duel, T = S.tour;
  D.phase = 'result'; D.t = DUEL_RESULT;
  S.swing = false;
  const score = D.foot ? D.fp + ':' + D.fo : D.ps + ':' + D.os, why = how ? how + ' · ' : '';
  nextDiff(T, win); // następny przeciwnik: po wygranej lepszy, po porażce łatwiejszy
  if (win) {
    S.coins += WIN_COINS; T.wins++; D.opp.beaten = true;
    [T.list[T.pos - 1], T.list[T.pos]] = [T.list[T.pos], T.list[T.pos - 1]]; T.pos--; // gracz wskakuje na miejsce pokonanego
    for (let i = 0; i < WIN_COINS; i++) S.parts.push({ x: S.x - 4 + i * 3, y: knightY() - 26, vx: (i - 1.5) * 12, vy: -40, c: COIN_C, s: 2, life: 1.4, kind: 'coin' });
    sfxCoin(); sfxChime();
    toast((how ? why : 'WYGRANA ' + score + '! ') + '+' + WIN_COINS + ' ' + coinWord(WIN_COINS));
  } else {
    T.losses++;
    D.ko = S.coins - LOSS_COINS <= 0;
    S.coins = Math.max(0, S.coins - LOSS_COINS);
    const drop = !D.ko && dropPlayer(T); // spadek w tabeli: następny przeciwnik słabszy
    sfxLose();
    toast((how ? why : 'PRZEGRANA ' + score + ' · ') + '-' + LOSS_COINS + ' ' + coinWord(LOSS_COINS) + (drop ? ' · SPADASZ NA ' + (T.pos + 1) + '. MIEJSCE' : ''));
  }
  renderStandings(); updateHud();
}

/* po walce: koniec gry (porażka bez monet), wygrana liga albo miasteczko przed kolejną walką */
function afterFight() {
  const D = S.duel, T = S.tour;
  if (D.ko) endTournament('ko');
  else if (T.pos === 0) endTournament(T.key === 'royal' ? 'champion' : 'league');
  else { D.phase = 'wait'; goToTown('town'); } // po każdej walce odpoczynek w miasteczku, potem kolejna (po porażce z rycerzem niżej w tabeli)
}

const KO_HINT = 'KONIEC GRY — BRAK MONET, ODPADASZ Z TURNIEJU · <kbd>R</kbd> OD NOWA';
/* koniec turnieju: wygrana (liga / mistrzostwo) prowadzi do miasteczka, porażka bez monet kończy grę */
function endTournament(kind) {
  S.duel.phase = 'wait';
  if (kind !== 'ko') { goToTown(kind); return; }
  startTransition('tournament', () => {
    S.duel = null; S.over = kind; S.parts = [];
    S.x = Math.round(Game.W * .4); Held.clear(); S.lance = newLance(); S.swing = false;
    setHint(KO_HINT);
    sfxLose();
    toast('ODPADASZ Z TURNIEJU');
    updateHud();
  });
}
