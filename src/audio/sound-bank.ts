import type { ClassId, Element } from "../game/core/types";
const noiseBuffers = new WeakMap<AudioContext, AudioBuffer>();
function noise(ctx: AudioContext) {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * 0.6),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let state = 7181;
    for (let i = 0; i < data.length; i++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      data[i] = (state / 0x80000000 - 1) * 0.6;
    }
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}
export function playSound(
  ctx: AudioContext,
  output: AudioNode,
  kind: string,
  role: ClassId,
  elements: Element[] = [],
  ability = 0,
) {
  const t = ctx.currentTime;
  const tone = (
    start: number,
    end: number,
    length: number,
    wave: OscillatorType = "sine",
    volume = 0.07,
    delay = 0,
  ) => {
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(start, t + delay);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, end),
      t + delay + length,
    );
    gain.gain.setValueAtTime(0, t + delay);
    gain.gain.linearRampToValueAtTime(volume, t + delay + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + length);
    oscillator.connect(gain).connect(output);
    oscillator.start(t + delay);
    oscillator.stop(t + delay + length + 0.01);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  };
  const breath = (
    length: number,
    frequency: number,
    volume: number,
    band: BiquadFilterType = "bandpass",
    delay = 0,
  ) => {
    const source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = noise(ctx);
    filter.type = band;
    filter.frequency.setValueAtTime(frequency, t + delay);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(80, frequency * 0.3),
      t + delay + length,
    );
    filter.Q.value = 1.2;
    gain.gain.setValueAtTime(0, t + delay);
    gain.gain.linearRampToValueAtTime(volume, t + delay + 0.009);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + length);
    source.connect(filter).connect(gain).connect(output);
    source.start(t + delay);
    source.stop(t + delay + length + 0.01);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  };
  if (kind === "cast") {
    if (role === "sword") breath(0.14, 2600, 0.09);
    else if (role === "bow") {
      breath(0.06, 4500, 0.05);
      tone(640, 190, 0.09, "triangle", 0.04);
    } else {
      tone(740, 320, 0.18, "sine", 0.045);
      tone(1110, 480, 0.15, "sine", 0.02, 0.025);
    }
  } else if (kind === "slash" || kind === "ghost" || kind === "charge") {
    breath(
      kind === "charge" ? 0.22 : 0.16,
      kind === "ghost" ? 1800 : 3200,
      0.12,
    );
    tone(kind === "ghost" ? 390 : 220, 80, 0.17, "triangle", 0.035);
  } else if (kind === "impact" || kind === "damage") {
    breath(0.07, 1700, 0.05);
    tone(150, 55, 0.09, "triangle", 0.06);
  } else if (kind === "block") {
    tone(1680, 920, 0.22, "triangle", 0.045);
    tone(2310, 1740, 0.17, "sine", 0.025);
    breath(0.05, 4800, 0.08);
  } else if (
    kind === "arc" ||
    kind === "thunder" ||
    elements.includes("lightning")
  ) {
    breath(0.26, 5000, 0.095);
    tone(90, 35, 0.25, "sawtooth", 0.025);
    tone(1840, 210, 0.07, "square", 0.008);
  } else if (kind === "steam") {
    breath(0.48, 2600, 0.095, "highpass");
    breath(0.2, 550, 0.11, "lowpass", 0.04);
    tone(190, 45, 0.28, "triangle", 0.045);
  } else if (kind === "burst" || kind === "resonance") {
    tone(
      elements.includes("ice") ? 1250 : 180,
      elements.includes("ice") ? 550 : 40,
      0.27,
      "triangle",
      0.045,
    );
    breath(
      0.32,
      elements.includes("fire") ? 1200 : 3000,
      0.1,
      elements.includes("fire") ? "lowpass" : "bandpass",
    );
  } else if (kind === "relic") {
    tone(
      ability === 213 ? 170 : 660,
      ability === 213 ? 65 : 880,
      0.26,
      "sine",
      0.04,
    );
    tone(990, 440, 0.22, "triangle", 0.025, 0.035);
  } else if (
    kind === "heal" ||
    kind === "loot" ||
    kind === "choice" ||
    kind === "equip"
  ) {
    const start = kind === "equip" ? 330 : 520;
    for (let i = 0; i < 3; i++)
      tone(
        start * [1, 1.25, 1.5][i],
        start * [1, 1.25, 1.5][i],
        0.18,
        "sine",
        0.035,
        i * 0.05,
      );
  } else if (kind === "phase" || kind === "warning") {
    tone(100, kind === "warning" ? 220 : 65, 0.4, "triangle", 0.045);
    tone(310, 145, 0.28, "sine", 0.02, 0.04);
  } else if (kind === "death") {
    for (let i = 0; i < 3; i++)
      tone(220 / (1 + i * 0.3), 70, 0.45, "triangle", 0.03, i * 0.15);
  } else if (kind === "victory") {
    for (let i = 0; i < 5; i++)
      tone(
        [330, 440, 550, 660, 880][i],
        [330, 440, 550, 660, 880][i],
        0.5,
        "sine",
        0.035,
        i * 0.12,
      );
  } else if (kind === "ui") tone(760, 580, 0.055, "sine", 0.025);
}
