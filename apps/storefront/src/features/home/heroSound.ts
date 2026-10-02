// Hero sound (round 10 part 2 #6, round 11 #76): off on every visit, switched on only by the
// speaker button, never remembered. Quiet synthesised sounds — no audio files to download.
let ctx: AudioContext | null = null;
export const heroSound = { on: false };

function ac() {
  if (!heroSound.on) return null;
  try { ctx ??= new AudioContext(); if (ctx.state === 'suspended') void ctx.resume(); return ctx; } catch { return null; }
}

/** A short, soft «бе-е»: a buzzy voice through a vowel filter, with the sheep's wobble. */
export function baa(pitch = 1) {
  const c = ac(); if (!c) return;
  const t = c.currentTime, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(330 * pitch, t); o.frequency.linearRampToValueAtTime(290 * pitch, t + 0.55);
  lfo.frequency.value = 22; lg.gain.value = 14 * pitch; lfo.connect(lg).connect(o.frequency);
  f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  o.connect(f).connect(g).connect(c.destination); o.start(t); lfo.start(t); o.stop(t + 0.62); lfo.stop(t + 0.62);
}

/** A soft «гуп»: a low thump. */
export function thud() {
  const c = ac(); if (!c) return;
  const t = c.currentTime, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.18);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.24);
}
