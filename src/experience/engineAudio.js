/**
 * Synthesized engine start + idle (Web Audio, no sound files).
 * The AudioContext is only created after a user click, as browsers require.
 */
export class EngineAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.nodes = [];
  }

  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.05);
  }

  noiseBuffer(seconds) {
    const len = Math.floor(this.ctx.sampleRate * seconds);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  /** Starter crank (≈1 s) → ignition → rev → steady idle. */
  start() {
    if (!this.ensure()) return;
    this.stop();
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.05;
    const track = (n) => (this.nodes.push(n), n);

    // Starter motor: buzzy saw with a pulsing gain.
    const starter = track(ctx.createOscillator());
    starter.type = 'sawtooth';
    starter.frequency.setValueAtTime(70, t0);
    starter.frequency.linearRampToValueAtTime(110, t0 + 1.0);
    const starterGain = track(ctx.createGain());
    starterGain.gain.setValueAtTime(0, t0);
    starterGain.gain.linearRampToValueAtTime(0.25, t0 + 0.05);
    starterGain.gain.setValueAtTime(0.25, t0 + 0.95);
    starterGain.gain.linearRampToValueAtTime(0, t0 + 1.1);
    const crankLfo = track(ctx.createOscillator());
    crankLfo.frequency.value = 9;
    const crankDepth = track(ctx.createGain());
    crankDepth.gain.value = 0.18;
    crankLfo.connect(crankDepth).connect(starterGain.gain);
    const starterFilter = track(ctx.createBiquadFilter());
    starterFilter.type = 'lowpass';
    starterFilter.frequency.value = 900;
    starter.connect(starterFilter).connect(starterGain).connect(this.master);

    // Engine body: two detuned low oscillators + filtered noise, pulsed by the firing rate.
    const tIgn = t0 + 1.0;
    const engineGain = track(ctx.createGain());
    engineGain.gain.setValueAtTime(0, t0);
    engineGain.gain.linearRampToValueAtTime(0.9, tIgn + 0.08);
    engineGain.gain.linearRampToValueAtTime(0.55, tIgn + 1.6);
    const lp = track(ctx.createBiquadFilter());
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(260, t0);
    lp.frequency.linearRampToValueAtTime(900, tIgn + 0.35);
    lp.frequency.linearRampToValueAtTime(320, tIgn + 1.6);
    lp.Q.value = 3;

    const pulse = track(ctx.createGain());
    pulse.gain.value = 0.6;
    const fire = track(ctx.createOscillator());
    fire.type = 'square';
    fire.frequency.setValueAtTime(14, tIgn);
    fire.frequency.linearRampToValueAtTime(42, tIgn + 0.35);
    fire.frequency.linearRampToValueAtTime(13, tIgn + 1.6);
    const fireDepth = track(ctx.createGain());
    fireDepth.gain.value = 0.4;
    fire.connect(fireDepth).connect(pulse.gain);

    [
      ['sawtooth', 38],
      ['square', 57]
    ].forEach(([type, f]) => {
      const o = track(ctx.createOscillator());
      o.type = type;
      o.frequency.setValueAtTime(f, tIgn);
      o.frequency.linearRampToValueAtTime(f * 2.4, tIgn + 0.35);
      o.frequency.linearRampToValueAtTime(f, tIgn + 1.6);
      o.connect(pulse);
      o.start(t0);
    });
    const noise = track(ctx.createBufferSource());
    noise.buffer = this.noiseBuffer(2);
    noise.loop = true;
    const noiseGain = track(ctx.createGain());
    noiseGain.gain.value = 0.35;
    noise.connect(noiseGain).connect(pulse);
    pulse.connect(lp).connect(engineGain).connect(this.master);

    // Ignition "catch" thump.
    const thump = track(ctx.createOscillator());
    thump.frequency.setValueAtTime(120, tIgn);
    thump.frequency.exponentialRampToValueAtTime(35, tIgn + 0.25);
    const thumpGain = track(ctx.createGain());
    thumpGain.gain.setValueAtTime(0.0001, tIgn);
    thumpGain.gain.exponentialRampToValueAtTime(0.8, tIgn + 0.02);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, tIgn + 0.35);
    thump.connect(thumpGain).connect(this.master);

    [starter, crankLfo, fire, noise, thump].forEach((n) => n.start(t0));
    thump.stop(tIgn + 0.4);
    starter.stop(t0 + 1.2);
    crankLfo.stop(t0 + 1.2);
  }

  stop() {
    if (!this.ctx) return;
    this.nodes.forEach((n) => {
      try {
        if (n.stop) n.stop();
        n.disconnect();
      } catch {
        /* node already stopped */
      }
    });
    this.nodes = [];
  }
}
