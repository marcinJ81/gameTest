'use strict';
/* Narzędzia: DOM, kolory (uint32 ABGR), matematyka, dithering */
const $ = s => document.querySelector(s);
const P = (r, g, b) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
const C = h => { const n = parseInt(h.slice(1), 16); return P(n >> 16 & 255, n >> 8 & 255, n & 255); };
const mixc = (a, b, t) => P(
  ((a & 255) + ((b & 255) - (a & 255)) * t) | 0,
  ((a >>> 8 & 255) + ((b >>> 8 & 255) - (a >>> 8 & 255)) * t) | 0,
  ((a >>> 16 & 255) + ((b >>> 16 & 255) - (a >>> 16 & 255)) * t) | 0);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const fade = t => t * t * (3 - 2 * t);
/* powtarzalny generator liczb losowych (mulberry32) */
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
