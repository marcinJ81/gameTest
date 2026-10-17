'use strict';
/* Stałe gry, palety, sprite'y (rycerz, kukła, przedmioty) — tło turnieju: arena-data.js */
const GRAV = 520;
const COINS = 4;                                  // monety na start; pudło bez monet kończy trening
const SPEED0 = 26, SPEED_UP = 4, SPEED_MAX = 60;  // px/s
const SWING_T = .5, STRIKE_AT = .43;              // czas zamachu i moment uderzenia (ułamek)
const ASSIST_AFTER = 2;                           // tyle pudeł pod rząd włącza znacznik „uderz tutaj”
const WHIFF_CD = .6;                              // zadyszka po ciosie w powietrze (s)
const SW_T = [0, .3, .45, 1], SW_A = [-1, -2.5, .35, -1]; // klatki kluczowe kąta miecza (rad)
const SWORD_LEN = [5, 9];                         // stary / lepszy miecz
const HORSE_MUL = 1.2;                            // na koniu trochę szybciej
const BONUS_COINS = 2;                            // dodatkowe monety razem z koniem (przed lancą)
const ENTRY_BONUS = 2, ENTRY_FEE = 2;             // premia za ukończenie treningu / wpisowe do turnieju
const LANCE_UP = -1.4, LANCE_DOWN = .04;          // kąt uniesionej / opuszczonej broni (rad)
const LANCE_HIT_K = .85;                          // od jakiego opuszczenia broń „trafia”
/* lower: czas opuszczania, hold: ile da się trzymać, raise: podnoszenie, rest: odpoczynek przed kolejnym X
   (X wciśnięty w trakcie odpoczynku zaczyna go od nowa — ponaglanie męczy rycerza) */
const LANCES = {
  lance: { len: 16, lower: .45, hold: 1.2, raise: .5, rest: .8 },
  kopia: { len: 22, lower: 1.0, hold: .45, raise: .8, rest: 1.5 }
};
const WEAPON_NAME = { sword: 'MIECZ', lance: 'LANCA', kopia: 'KOPIA' };
const GEAR = [
  { key: 'shield', name: 'Tarcza' },
  { key: 'helmet', name: 'Hełm' },
  { key: 'armor', name: 'Zbroja' },
  { key: 'sword', name: 'Lepszy miecz' },
  { key: 'emblem', name: 'Godło na tarczy' },
  { key: 'horse', name: 'Koń' },
  { key: 'lance', name: 'Lanca' },
  { key: 'kopia', name: 'Kopia' }
];
const KC = {
  SKIN: '#e8c9a8', HAIR: '#6b3e1e', EYE: '#2a1a10', TUNIC: '#3a6b3a', TUNIC_D: '#28502a', PANTS: '#4a3a2a',
  BOOT: '#1a1210', BELT: '#5a3418', BUCKLE: '#ffd23d', STEEL: '#c0c7d4', STEEL_D: '#7d8797', STEEL_HI: '#eef3ff',
  VISOR: '#10142a', PLUME: '#d42a3a', OLD_BLADE: '#8f8a80', OLD_GUARD: '#5a3418', BLADE: '#dfe8f2', GUARD: '#ffd23d'
};
const SHIELD = ['kkkkkkk', 'kfffffk', 'kfffffk', 'kfffffk', 'kfffffk', 'kfffffk', '.kfffk.', '..kfk..', '...k...'];
const SHIELD_PAL = { k: '#5d6d92', f: '#7a4f2a' };
const EMBLEM_FIELDS = ['#8a1a2a', '#1d3f8a', '#1f5a2a', '#5a1a6a', '#2a2a3a', '#c9a22a'];
const EMBLEM_INKS = ['#ffd23d', '#f2ead8', '#1a1208', '#3df2ff', '#ff3dc8', '#2ecc71', '#c0c7d4'];
const ITEM_PAL = { s: '#c0c7d4', d: '#7d8797', H: '#eef3ff', K: '#10142a', p: '#d42a3a', y: '#ffd23d', b: '#5a3418',
  h: '#6b4226', m: '#1a1210', e: '#000000', w: '#8a5a2b', r: '#d42a3a', W: '#f2ead8' };
const ITEM_SPR = {
  helmet: ['..pp.', '.sss.', 'sssss', 'sKKKs', 'sssds', '.sds.'],
  armor: ['ss.ss', 'sssss', 'dsHsd', '.sHs.', '.sss.', '.s.s.'],
  sword: ['..H..', '..H..', '..H..', '..H..', '..H..', '..H..', 'yyyyy', '..b..', '..y..'],
  horse: ['....mm.', '...mhhh', '..mhheh', 'mhhhhh.', '.hhhhh.', '.h.h.h.'],
  lance: ['..H..', '..H..', '..w..', '..w..', '..w..', '..w..', '.sss.', 'sssss', '..w..', '..w..'],
  kopia: ['..y..', '..r..', '..W..', '..r..', '..W..', '..r..', '..W..', '.ddd.', 'ddddd', '..r..', '..W..']
};
/* koń (bez nóg — nogi animowane w kodzie); kolumna 7 = miejsce rycerza */
const HORSE = [
  '............bb....', '...........mbbb...', '..........mbbebbb.', '..........mbbbbbbd', '.mm......mbbbb....',
  'mm.bbbbbbbbbbb....', 'm.bBBBBBBBBbbb....', 'm.bbbbbbbbbbbb....', 'm.bbbbbbbbbbbd....', '..dbbbbbbbbbdd....'
];
const HORSE_PAL = { b: '#6b4226', B: '#8a5a34', d: '#4a2c18', m: '#1a1210', e: '#000000' };
const HORSE_LEGS = [[3, 0], [4, Math.PI], [11, Math.PI * .5], [12, Math.PI * 1.5]]; // [kolumna, faza]
const LANCE_C = { WOOD: '#8a5a2b', TIP: '#eef3ff', VAMP: '#c0c7d4', RED: '#d42a3a', WHITE: '#f2ead8', CORONEL: '#ffd23d', VAMP_K: '#7d8797' };
const COIN_C = '#ffd23d';
/* kukła treningowa: kolumna 5 = środek, wiersze 0-16 kołyszą się po trafieniu */
const DUMMY = [
  '...kkkkk...', '..kTTTTTk..', '..kTkTkTk..', '..kTTTTTk..', '..kTkkkTk..', '...kkkkk...',
  '....kwk....', 'kkkkkkkkkkk', 'kTTTtTtTTTk', 'kkkktTtkkkk', '...kTtTk...', '...krrrk...',
  '...kTtTk...', '...ktTtk...', '...kTtTk...', '...krrrk...', '...kkkkk...', '....kwk....',
  '....kwk....', '....kwk....', '..kkkwkkk..', '.kwwwwwwwk.'
];
const DUMMY_SWAY_ROWS = 17;
const DUMMY_PAL = { k: '#2a1a0e', T: '#e6c36a', t: '#b8913f', w: '#7a4f2a', r: '#8a2a1a' };
const DUMMY_FLASH = { k: '#ffffff', T: '#ffffff', t: '#fff3a0', w: '#ffffff', r: '#ffffff' };
const STRAW = ['#e6c36a', '#b8913f', '#f0d58a'];
