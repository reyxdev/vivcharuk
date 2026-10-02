// Round 11 #79: a quiet two-note chime for a new order. Browsers block audio until the page has been
// interacted with, so it plays only after that; muted per device in «Налаштування».
const KEY = 'vk_admin_order_sound';

export const soundOn = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } };
export const setSoundOn = (on: boolean) => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ } };

// Round 20 #184: a cash-register «дзинь» — a short drawer click and a bright bell, on any page (the
// Shell plays it when the new-order counter grows), on the phone too (#247).
export function chime() {
  if (!soundOn() || !(navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive) return;
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const click = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) * 0.4;
    click.buffer = buf;
    const cg = ctx.createGain(); cg.gain.value = 0.25;
    click.connect(cg).connect(ctx.destination); click.start(now);
    [[1568, 0.09], [2093, 0.05], [3136, 0.025]].forEach(([f, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f!;
      g.gain.setValueAtTime(0.0001, now + 0.05);
      g.gain.exponentialRampToValueAtTime(v!, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
      o.connect(g).connect(ctx.destination); o.start(now + 0.05); o.stop(now + 1.2);
    });
    setTimeout(() => void ctx.close(), 1500);
  } catch { /* no audio */ }
}
