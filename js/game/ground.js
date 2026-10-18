'use strict';
/* Ziemia: arena turniejowa (piasek z koleiną), plac treningowy (wydeptana trawa i ścieżka) albo bruk miasteczka */
function groundColor(x, wy) {
  const { back, surf, grassY } = Game;
  const h = hash2(x, wy), i3 = h < .4 ? 0 : h < .75 ? 1 : 2;
  if (wy < back + 2) return TC.SAND_SHADE[h < .5 ? 0 : 1]; // cień pod trybunami
  const dt = wy - surf;
  if (dt >= -2 && dt <= 2) { // koleina, którą jeżdżą rycerze
    const hx = (x + (dt & 1) * 3) % 7;
    if (dt >= 0 && dt <= 1 && hx === 0 && hash2(x >> 3, 5) > .3) return TC.HOOF;
    return Math.abs(dt) === 2 && h < .5 ? TC.SAND[i3] : TC.TRACK[h < .55 ? 0 : 1];
  }
  const g = grassY + Math.round((vn2(x * .15, 3.3) - .5) * 3);
  if (wy >= g) { // trawa przed areną
    if (wy === g && h > .55) return TC.GRASS_HI;
    if (h > .985) return TC.FLOWER[(hash2(x, wy + 7) * 3) | 0];
    return TC.GRASS[i3];
  }
  if (wy >= g - 1 && h > .6) return TC.GRASS_HI; // kępki na skraju trawy
  if (h > .985) return TC.PEBBLE;
  if (h < .012) return TC.STRAW;
  return vn2(x * .25, wy * .4) > .72 ? TC.SAND_D : TC.SAND[i3];
}

/* plac treningowy: trawa z wydeptanymi łatami, ścieżka ze śladami stóp i kopyt */
function trainGroundColor(x, wy) {
  const { back, surf, grassY } = Game;
  const h = hash2(x, wy), i3 = h < .4 ? 0 : h < .75 ? 1 : 2;
  if (wy < back + 2) return TG.GRASS_SHADE[h < .5 ? 0 : 1]; // cień lasu i płotu
  const dt = wy - surf;
  if (dt >= -2 && dt <= 2) { // ścieżka, którą chodzi rycerz
    if (dt >= 0 && dt <= 1 && (x + (dt & 1) * 4) % 9 === 0 && hash2(x >> 3, 9) > .35) return TG.STEP;
    return Math.abs(dt) === 2 && h < .45 ? TG.GRASS[i3] : TG.PATH[h < .55 ? 0 : 1];
  }
  const g = grassY + Math.round((vn2(x * .15, 3.3) - .5) * 3);
  if (wy >= g && h > .985) return TG.FLOWER[(hash2(x, wy + 7) * 3) | 0];
  if (wy < g && vn2(x * .09, wy * .3) > .6) { // wydeptane łaty ziemi na placu
    if (h > .98) return TG.PEBBLE;
    return h < .1 ? TG.DIRT_D : TG.DIRT[i3];
  }
  if (h > .9) return TG.GRASS_HI;
  return TG.GRASS[i3];
}

/* miasteczko: bruk z kocich łbów, wytarty pas, którym chodzi gracz, trawa przed ulicą */
function townGroundColor(x, wy) {
  const { back, surf, grassY } = Game;
  const h = hash2(x, wy), i3 = h < .4 ? 0 : h < .75 ? 1 : 2;
  if (wy < back + 2) return TOWN_G.SHADE[h < .5 ? 0 : 1]; // cień budynków
  const g = grassY + Math.round((vn2(x * .15, 3.3) - .5) * 3);
  if (wy >= g) return h > .985 ? TG.FLOWER[(hash2(x, wy + 7) * 3) | 0] : h > .9 ? TG.GRASS_HI : TG.GRASS[i3];
  const row = (wy - back) / 3 | 0, off = (row & 1) * 2, lx = (x + off) % 4, ly = (wy - back) % 3;
  if (lx === 3 || ly === 2) return Math.abs(wy - surf) <= 1 ? TOWN_G.WORN : TOWN_G.MORTAR;
  if (lx === 0 && ly === 0) return TOWN_G.COBBLE_HI;
  return TOWN_G.COBBLE[(hash2((x + off) >> 2, row) * 3) | 0];
}

function drawGroundRow(buf, row, wy) {
  const W = Game.W, col = Game.scene === 'training' ? trainGroundColor : Game.scene === 'town' ? townGroundColor : groundColor;
  for (let x = 0; x < W; x++) buf[row + x] = col(x, wy);
}
