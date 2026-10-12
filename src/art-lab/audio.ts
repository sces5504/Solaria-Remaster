import { playSound } from "../audio/sound-bank";
import type { ClassId, Element } from "../game/core/types";
/** The review has its own mixer and never touches the game's saved settings. */
export class ReviewAudio {
  volume = 0;
  private context: AudioContext | null = null;
  private gain: GainNode | null = null;
  unlock() {
    try {
      this.context ??= new AudioContext();
      if (!this.gain) {
        this.gain = this.context.createGain();
        this.gain.gain.value = this.volume;
        this.gain.connect(this.context.destination);
      }
      void this.context.resume().catch(() => {});
    } catch {}
  }
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.context && this.gain)
      this.gain.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.015,
      );
  }
  play(kind: string, role: ClassId, elements: Element[]) {
    if (this.volume && this.context?.state === "running" && this.gain)
      playSound(this.context, this.gain, kind, role, elements, 0);
  }
}
