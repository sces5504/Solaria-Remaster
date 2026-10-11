import type { ClassId, Element } from "../game/core/types";
import { playSound } from "./sound-bank";
function savedVolume() {
  try {
    const v = Number(localStorage.getItem("solaria-volume") ?? ".25");
    return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.25;
  } catch {
    return 0.25;
  }
}
export class SoundController {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private remembered = 0.25;
  volume = savedVolume();
  constructor() {
    this.remembered = this.volume || 0.25;
  }
  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.limiter = this.context.createDynamicsCompressor();
        this.limiter.threshold.value = -12;
        this.limiter.knee.value = 12;
        this.limiter.ratio.value = 6;
        this.limiter.attack.value = 0.003;
        this.limiter.release.value = 0.15;
        this.master.gain.value = this.volume;
        this.master.connect(this.limiter).connect(this.context.destination);
      }
      void this.context.resume().catch(() => {});
    } catch {
      /* Audio support and gesture refusal cannot block a journey. */
    }
  }
  setVolume(v: number) {
    this.volume = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0.25;
    if (this.volume > 0) this.remembered = this.volume;
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.015,
      );
    try {
      localStorage.setItem("solaria-volume", String(this.volume));
    } catch {}
  }
  toggleMute() {
    this.setVolume(this.volume ? 0 : this.remembered);
  }
  play(
    kind: string,
    role: ClassId = "mage",
    elements: Element[] = [],
    ability = 0,
  ) {
    if (
      !this.context ||
      !this.master ||
      !this.volume ||
      this.context.state !== "running"
    )
      return;
    playSound(this.context, this.master, kind, role, elements, ability);
  }
  destroy() {
    this.master?.disconnect();
    this.limiter?.disconnect();
    void this.context?.close().catch(() => {});
    this.master = null;
    this.limiter = null;
    this.context = null;
  }
}
