// Procedural Web Audio API sound synthesizer (zero external audio files)
class CubeSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private lastClickAt = 0;
  private lastThrumAt = 0;

  private ensureContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {
        // Ignore until user gesture unlocks audio
      });
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public setEnabled(next: boolean) {
    this.enabled = next;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Crisp precision mechanical relay click when a cubetto aligns with the camera
  public playCubettoClick() {
    const nowMs = performance.now();
    if (nowMs - this.lastClickAt < 120) return;
    this.lastClickAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    const t = ctx.currentTime;

    // 1. Short crisp mechanical detent transient
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1180, t);
    osc.frequency.exponentialRampToValueAtTime(210, t + 0.032);

    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.055, t + 0.003);
    oscGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.045);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);

    // 2. Subtle low obsidian body thud
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(165, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(72, t + 0.06);

    bodyGain.gain.setValueAtTime(0.001, t);
    bodyGain.gain.linearRampToValueAtTime(0.045, t + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.07);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.075);
  }

  // Deep mystical sub-bass thrum & harmonic swell during cube explosion/reassembly
  public playExplosionThrum(isExploding: boolean) {
    const nowMs = performance.now();
    if (nowMs - this.lastThrumAt < 450) return;
    this.lastThrumAt = nowMs;

    const ctx = this.ensureContext();
    if (!ctx || ctx.state !== 'running') return;

    const t = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const shimmerOsc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const masterGain = ctx.createGain();

    filter.type = 'lowpass';
    filter.Q.value = 3.2;

    if (isExploding) {
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(52, t);
      subOsc.frequency.exponentialRampToValueAtTime(108, t + 0.22);
      subOsc.frequency.exponentialRampToValueAtTime(46, t + 0.65);

      shimmerOsc.type = 'triangle';
      shimmerOsc.frequency.setValueAtTime(196, t);
      shimmerOsc.frequency.exponentialRampToValueAtTime(392, t + 0.45);

      filter.frequency.setValueAtTime(180, t);
      filter.frequency.exponentialRampToValueAtTime(780, t + 0.24);
      filter.frequency.exponentialRampToValueAtTime(220, t + 0.7);
    } else {
      // Reassembling inward resonance
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(98, t);
      subOsc.frequency.exponentialRampToValueAtTime(48, t + 0.5);

      shimmerOsc.type = 'triangle';
      shimmerOsc.frequency.setValueAtTime(330, t);
      shimmerOsc.frequency.exponentialRampToValueAtTime(140, t + 0.48);

      filter.frequency.setValueAtTime(620, t);
      filter.frequency.exponentialRampToValueAtTime(150, t + 0.55);
    }

    masterGain.gain.setValueAtTime(0.0008, t);
    masterGain.gain.linearRampToValueAtTime(0.08, t + 0.08);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.72);

    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.28;

    subOsc.connect(filter);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    subOsc.start(t);
    shimmerOsc.start(t);
    subOsc.stop(t + 0.75);
    shimmerOsc.stop(t + 0.75);
  }
}

export const soundEngine = new CubeSoundEngine();
