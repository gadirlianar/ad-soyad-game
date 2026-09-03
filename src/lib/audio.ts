// Web Audio API Zero-Asset Tactile Synthesizer
// Teenage Engineering / Industrial Hardware inspired micro-haptics

class TactileAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sound_muted');
      this.isMuted = saved === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sound_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * 40Hz Metallic Thump on Input Bay Focus
   */
  public playFocusClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.04);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Ultra-short 8ms acoustic transient mimicry (mechanical keyboard switch)
   */
  public playKeyStroke() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.008);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.008);
  }

  /**
   * Mechanical Split-Flap Click for letter reel rotation
   */
  public playFlapClick(pitchMod: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(850 * pitchMod, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.02);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * 808 Sub-Bass Impact with High-Pass sweep on Emergency STOP
   */
  public playStopBuzzer() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Heavy 808 sub-drop
    const osc808 = ctx.createOscillator();
    const gain808 = ctx.createGain();

    osc808.type = 'sine';
    osc808.frequency.setValueAtTime(145, now);
    osc808.frequency.exponentialRampToValueAtTime(28, now + 0.55);

    gain808.gain.setValueAtTime(0.45, now);
    gain808.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc808.connect(gain808);
    gain808.connect(ctx.destination);

    osc808.start(now);
    osc808.stop(now + 0.6);

    // Industrial alarm pulse burst
    [0.0, 0.1, 0.2, 0.3].forEach((offset) => {
      const alarmOsc = ctx.createOscillator();
      const alarmGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      alarmOsc.type = 'sawtooth';
      alarmOsc.frequency.setValueAtTime(420, now + offset);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(880, now + offset);
      filter.Q.value = 3;

      alarmGain.gain.setValueAtTime(0.12, now + offset);
      alarmGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      alarmOsc.connect(filter);
      filter.connect(alarmGain);
      alarmGain.connect(ctx.destination);

      alarmOsc.start(now + offset);
      alarmOsc.stop(now + offset + 0.07);
    });
  }

  /**
   * 3-2-1 Precision Radar Countdown Blip
   */
  public playCountdownBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 960 : 480, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.3 : 0.12));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.3 : 0.12));
  }

  /**
   * Precision Cockpit Tick
   */
  public playTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  /**
   * Binary Mechanical Rocker Switch Click
   */
  public playVoteClick(approved: boolean) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = approved ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(approved ? 600 : 200, now);
    osc.frequency.exponentialRampToValueAtTime(approved ? 900 : 120, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Terminal Sequence Audit Finalized Chime
   */
  public playRoundComplete() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25]; // A4, C#5, E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.06);
      osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
    });
  }

  /**
   * High-Performance Industrial Triumph Chime
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const start = ctx.currentTime + idx * 0.1;
      const duration = idx === notes.length - 1 ? 0.6 : 0.15;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    });
  }
}

export const tactileAudio = new TactileAudioEngine();
export const soundManager = tactileAudio;
