// The Golden Wok — synthesised sound effects (WebAudio only, no audio files).
// Every sound is built from oscillators and filtered noise at play time.

let ctx = null;
let muted = false;

export function setMuted(m) {
  muted = m;
}
export function isMuted() {
  return muted;
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type = 'sine', vol = 0.18, slideTo = null, delay = 0) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol = 0.2, freq = 1200, q = 1, delay = 0) {
  if (muted) return;
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filt = ac.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = freq;
  filt.Q.value = q;
  const gain = ac.createGain();
  gain.gain.value = vol;
  src.connect(filt).connect(gain).connect(ac.destination);
  src.start(t0);
}

export const sfx = {
  // Knife hitting the board: a woody thock.
  chop() {
    noiseBurst(0.07, 0.35, 900, 2);
    tone(180, 0.07, 'triangle', 0.22, 90);
  },
  // Something landing in the wok: a hot sizzle burst.
  sizzle() {
    noiseBurst(0.35, 0.16, 5200, 0.6);
  },
  // Pot bubbling when noodles or broth go in.
  plop() {
    tone(320, 0.12, 'sine', 0.2, 140);
    noiseBurst(0.12, 0.12, 500, 1);
  },
  // Picking an ingredient up.
  pickup() {
    tone(520, 0.07, 'sine', 0.14, 700);
  },
  // Placing an ingredient down / plating.
  place() {
    tone(340, 0.08, 'triangle', 0.16, 260);
  },
  // A dish is finished on the plating counter.
  dishReady() {
    tone(660, 0.1, 'sine', 0.18);
    tone(880, 0.14, 'sine', 0.18, null, 0.09);
  },
  // Served! A bright till ding.
  serve() {
    tone(1046, 0.12, 'sine', 0.2);
    tone(1318, 0.2, 'sine', 0.2, null, 0.1);
  },
  // Perfectly timed cook.
  perfect() {
    tone(784, 0.09, 'sine', 0.16);
    tone(988, 0.09, 'sine', 0.16, null, 0.07);
    tone(1175, 0.16, 'sine', 0.18, null, 0.14);
  },
  // Food burnt: a low sad buzz.
  burnt() {
    tone(220, 0.25, 'sawtooth', 0.12, 110);
  },
  // An order ticket just expired.
  expire() {
    tone(392, 0.15, 'triangle', 0.16, 330);
    tone(330, 0.2, 'triangle', 0.16, 262, 0.14);
  },
  // New order pinned to the board.
  newOrder() {
    tone(587, 0.09, 'sine', 0.14);
    tone(740, 0.11, 'sine', 0.14, null, 0.08);
  },
  // Patience running low on a ticket.
  alarm() {
    tone(880, 0.1, 'square', 0.07);
    tone(880, 0.1, 'square', 0.07, null, 0.16);
  },
  // Bin toss.
  toss() {
    noiseBurst(0.15, 0.2, 300, 1);
  },
  // Day clear jingle.
  dayClear() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'sine', 0.16, null, i * 0.11));
  },
  // Final win fanfare.
  win() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) =>
      tone(f, 0.18, 'sine', 0.17, null, i * 0.12),
    );
  },
  // UI click.
  click() {
    tone(700, 0.05, 'sine', 0.1);
  },
};
