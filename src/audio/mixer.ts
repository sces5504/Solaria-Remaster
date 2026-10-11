export class AudioMixer {
  private context: AudioContext | null = null;
  volume = Number(localStorage.getItem("solaria-volume") ?? ".25");
  unlock() {
    if (!this.context) this.context = new AudioContext();
    void this.context.resume();
  }
  setVolume(v: number) {
    this.volume = v;
    localStorage.setItem("solaria-volume", String(v));
  }
  play(kind: string) {
    if (!this.context || this.volume === 0) return;
    const ctx = this.context,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    const start = ctx.currentTime;
    osc.type = ["damage", "impact", "burst", "thunder"].includes(kind)
      ? "triangle"
      : "sine";
    const f =
      (
        {
          damage: 170,
          cast: 420,
          heal: 640,
          burst: 240,
          phase: 100,
          loot: 880,
          impact: 130,
          block: 1250,
          charge: 300,
          thunder: 80,
        } as Record<string, number>
      )[kind] ?? 320;
    osc.frequency.setValueAtTime(f, start);
    osc.frequency.exponentialRampToValueAtTime(f * 0.4, start + 0.08);
    gain.gain.setValueAtTime(
      this.volume *
        (["impact", "block", "thunder", "burst"].includes(kind) ? 0.13 : 0.07),
      start,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.13);
  }
}
