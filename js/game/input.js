'use strict';
/* Sterowanie; w walce pieszej strzałki ← → prowadzą rycerza (trzymane klawisze w Held, foot.js) */
addEventListener('keydown', e => {
  if (Entry.key(e) || Yield.key(e)) return;
  if (e.key.startsWith('Arrow')) { Held.add(e.key); if (onFoot() || inTown()) e.preventDefault(); }
  else if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); if (!e.repeat) swing(); }
  else if (e.key === 'x' || e.key === 'X') { if (!e.repeat) lowerLance(); }
  else if (e.key === '1') toggleAssist();
  else if (e.key === '2') quitTraining();
  else if (e.key === 'r' || e.key === 'R') resetGame();
  else if (e.key === 'm' || e.key === 'M') toggleMute();
});
addEventListener('keyup', e => Held.delete(e.key));
addEventListener('blur', () => Held.clear());
// klik/dotyk: zamach mieczem albo opuszczenie lancy/kopii (zależnie od broni)
Game.panel.addEventListener('pointerdown', e => {
  if (e.target.closest('button') || Entry.open || Yield.open) return;
  if (S.started && weapon() !== 'sword') lowerLance(); else swing();
});
function toggleMute() { muted = !muted; $('#btnMute').textContent = '[M] DŹWIĘK: ' + (muted ? 'OFF' : 'ON'); }
$('#btnReset').addEventListener('click', e => { resetGame(); e.currentTarget.blur(); });
$('#btnLower').addEventListener('click', e => { lowerLance(); e.currentTarget.blur(); });
$('#btnAssist').addEventListener('click', e => { toggleAssist(); e.currentTarget.blur(); });
$('#btnQuit').addEventListener('click', e => { quitTraining(); e.currentTarget.blur(); });
$('#btnMute').addEventListener('click', e => { toggleMute(); e.currentTarget.blur(); });
