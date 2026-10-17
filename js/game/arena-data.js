'use strict';
/* Turniej rycerski: palety i sprite'y tła (niebo, arena, trybuny, tłum, para książęca, namioty) */
const TC = {
  SKY: ['#2a64c8', '#3474d4', '#4486de', '#5a9ae6', '#76b0ee', '#94c6f2', '#b4dcf6'].map(C),
  SUN: C('#fff6c0'), SUN2: C('#ffe27a'), SUN_GLOW: C('#ffffff'),
  HILL_FAR: C('#8cb48a'), HILL_FAR_HI: C('#a2c69c'), HILL_NEAR: C('#5f9550'), HILL_NEAR_HI: C('#76aa62'),
  SAND: [C('#d9b77c'), C('#cfaa6c'), C('#e2c38c')], SAND_D: C('#b8955e'), SAND_SHADE: [C('#bf9b62'), C('#b5915a')],
  TRACK: [C('#c29c62'), C('#b38c55')], HOOF: C('#9a7646'), PEBBLE: C('#a4a09a'), STRAW: C('#f0d58a'),
  GRASS: [C('#5f9a3f'), C('#558f37'), C('#4a8230')], GRASS_HI: C('#7ab854'), FLOWER: [C('#f2ead8'), C('#ffd23d'), C('#d45a8a')]
};
const CLOUD_C = { W: '#ffffff', S: '#dbe8f6' };
const BIRD = [['k.k', '.k.'], ['.k.', 'k.k']];
const CASTLE_C = { wall: '#8e9db4', dark: '#76869e', roof: '#7c6a8e', win: '#5a6880', flag: '#c84a5a' };
const WOOD = { L: '#a06a34', M: '#8a5a2b', D: '#6b4226', K: '#4a2c18' };

/* tłum */
const CROWD_SKIN = ['#e8c9a8', '#dcb592', '#c8996f', '#f0d6b8'];
const CROWD_HAIR = ['#3a2210', '#6b3e1e', '#1a1208', '#c9a23a', '#8a8a8a', '#a04a1a'];
const CROWD_HOOD = ['#8a2a2a', '#2a4a8a', '#3a6b3a', '#6a3a6a', '#f2ead8', '#7a5a2a'];
const CROWD_TUNIC = ['#8a2a2a', '#2a4a8a', '#3a6b3a', '#7a5a2a', '#6a3a6a', '#a0703a', '#5a5a6a', '#b05a2a', '#2a6a6a', '#c9a23a'];
const FLAG_C = ['#d42a3a', '#ffd23d', '#1d6ad4', '#f2ead8', '#2ecc71', '#ff8a1f'];
/* płachty na barierce trybun i markizy (pary barw) */
const DRAPE_C = [['#b0182a', '#ffd23d'], ['#1d3f8a', '#f2ead8'], ['#1f6a3a', '#ffd23d'], ['#5a1a6a', '#f2ead8']];

/* para książęca (siedzą na tronach, przodem do widza) */
const PRINCE = [
  '.y.y.y.', '.yyyyy.', '.hsssh.', '.seses.', '.hsssh.', '..hhh..', 'wwwkwww',
  'rRuuuRr', 'rRuguRr', 'rRuuuRr', 'rRpppRr', '.Rp.pR.', '..b.b..'
];
const PRINCE_PAL = { y: '#ffd23d', h: '#5a3418', s: '#e8c9a8', e: '#2a1a10', w: '#f4f1ea', k: '#1a1208',
  r: '#c41e30', R: '#7a0f1c', u: '#1d3f8a', g: '#ffd23d', p: '#3a2a50', b: '#1a1210' };
/* księżna w hennin (wysoki stożkowy czepiec z welonem) */
const PRINCESS = [
  '.....p.', '....pp.', '....ppv', '...pppv', '..pppvv', '.yyyyyv', '.lsssl.', '.seses.', '.lsssl.',
  '..sss..', 'gGgggGg', 'gGgagGg', 'gGgggGg', 'ggggggg', '.ggggg.'
];
const PRINCESS_PAL = { p: '#f6b8d0', v: '#ffffff', y: '#ffd23d', l: '#f0d070', s: '#f0d0b0', e: '#2a1a10',
  g: '#2a8a5a', G: '#1d6a42', a: '#ffd23d' };
const THRONE = [
  'y.y...y.y', 'yyyyyyyyy', 'yRRRRRRRy', 'yRrrrrrRy', 'yRrrrrrRy', 'yRrrrrrRy',
  'yRrrrrrRy', 'yRrrrrrRy', 'yyyyyyyyy', 'y.......y', 'k.......k'
];
const THRONE_PAL = { y: '#ffd23d', R: '#5a0f18', r: '#8a1a2a', k: '#4a2c18' };
const ROYAL = { cloth: '#1d3f8a', clothD: '#162f6a', gold: '#ffd23d', goldD: '#c9a22a', canopy: '#b0182a', canopyD: '#7a0f1c' };
/* herb książęcy na płachcie loży: złota korona na czerwieni */
const ROYAL_ARMS = ['kkkkkkkkk', 'krrrrrrrk', 'kryryryrk', 'kryyyyyrk', 'kryyyyyrk', 'krrrrrrrk', '.krrrrrk.', '..krrrk..', '...krk...', '....k....'];
const ROYAL_ARMS_PAL = { k: '#c9a22a', r: '#b0182a', y: '#ffd23d' };

/* namioty rycerzy: [barwa 1, barwa 2] */
const TENT_C = [['#c41e30', '#f2ead8'], ['#1d3f8a', '#ffd23d'], ['#1f6a3a', '#f2ead8'], ['#5a1a6a', '#ffd23d'], ['#1a1a24', '#e6c36a']];
