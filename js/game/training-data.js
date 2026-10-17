'use strict';
/* Plac treningowy: palety lasu, ziemi i rekwizytów, rozkład rycerzy ćwiczących w tle */
const FOREST = {
  far: { hi: '#6d9478', mid: '#58806a', dk: '#48705c', trunk: '#4e4a44' },
  near: { hi: '#6aac4c', mid: '#4a8a3a', dk: '#33692c', trunk: '#5a3a22' },
  pine: { hi: '#4a8a56', mid: '#336e40', dk: '#24532f', trunk: '#4a2c18' }
};
const TG = {
  GRASS: [C('#5f9a3f'), C('#558f37'), C('#4a8230')], GRASS_HI: C('#7ab854'), GRASS_SHADE: [C('#40712c'), C('#3a6828')],
  DIRT: [C('#9a7a50'), C('#8c6e46'), C('#a6875a')], DIRT_D: C('#7a5e3c'), PATH: [C('#8a6a42'), C('#7d603b')],
  STEP: C('#6a5034'), PEBBLE: C('#a4a09a'), FLOWER: [C('#f2ead8'), C('#ffd23d'), C('#d45a8a')]
};
const HAY = { L: '#f0d58a', M: '#d9b45a', D: '#b0893a', K: '#7a5e2a' };
const TRAINEE_FILTER = 'saturate(.55) brightness(.75)'; // rycerze w tle są przygaszeni, żeby nie mylić ich z graczem
const SPAR_T = 1.6, PELL_T = 1.1;                     // tempo walki ćwiczebnej i uderzeń w pal (s)
