'use strict';
/* Dźwięk (WebAudio) */
let AC = null, muted = false;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } return AC; }
function noise(dur, type, freq, vol) {
  const a = ac(); if (!a || muted) return;
  const len = a.sampleRate * dur | 0, b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const s = a.createBufferSource(); s.buffer = b;
  const f = a.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = a.createGain(); g.gain.value = vol;
  s.connect(f).connect(g).connect(a.destination); s.start();
}
function tones(freqs, step, dur, type, vol) {
  const a = ac(); if (!a || muted) return;
  freqs.forEach((fr, i) => {
    const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = fr;
    const t0 = a.currentTime + i * step;
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
    o.connect(g).connect(a.destination); o.start(t0); o.stop(t0 + dur + .02);
  });
}
const sfxSwing = () => noise(.14, 'highpass', 1800 + Math.random() * 600, .12);
const sfxHit = () => { noise(.12, 'lowpass', 500, .3); tones([110], 0, .1, 'square', .08); };
const sfxChime = () => tones([988, 1319, 1760], .07, .18, 'square', .06);
const sfxCoin = () => tones([1568, 1175, 784], .06, .12, 'square', .05);
const sfxLower = () => tones([196, 175, 147], .08, .12, 'triangle', .07);
const sfxLose = () => tones([392, 311, 247, 165], .16, .3, 'sawtooth', .06);
const sfxBlock = () => { noise(.08, 'highpass', 3000, .2); tones([1480, 2220], .03, .14, 'square', .05); }; // brzęk o tarczę
