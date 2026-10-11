import type { Command, Run } from "../game/core/types";
export class Input {
  keys = new Set<string>();
  attack = false;
  pointer = { x: 512, y: 320 };
  skill = false;
  dodge = false;
  interact = false;
  constructor(
    canvas: HTMLCanvasElement,
    action: (key: string) => void,
    pause: () => void,
  ) {
    window.addEventListener("keydown", (e) => {
      if ((e.target as HTMLElement).matches("input,textarea")) return;
      if (["Space", "Tab", "ArrowLeft", "ArrowRight"].includes(e.code))
        e.preventDefault();
      this.keys.add(e.code);
      if (e.repeat) return;
      if (e.code === "Space") this.dodge = true;
      else if (e.code === "KeyF") this.interact = true;
      else if (
        ["Escape", "KeyI", "KeyC", "Enter", "ArrowLeft", "ArrowRight"].includes(
          e.code,
        )
      )
        action(e.code);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.pointer = {
        x: ((e.clientX - rect.left) * 1024) / rect.width,
        y: ((e.clientY - rect.top) * 640) / rect.height,
      };
    });
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button === 0) this.attack = true;
      if (e.button === 2) this.skill = true;
    });
    window.addEventListener("pointerup", (e) => {
      if (e.button === 0) this.attack = false;
    });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("blur", () => {
      this.clear();
      pause();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.clear();
        pause();
      }
    });
  }
  clear() {
    this.keys.clear();
    this.attack = false;
    this.skill = false;
    this.dodge = false;
    this.interact = false;
  }
  command(r: Run): Command {
    const cmd: Command = {
      tick: r.tick,
      actorId: 0,
      move: {
        x: Number(this.keys.has("KeyD")) - Number(this.keys.has("KeyA")),
        y: Number(this.keys.has("KeyS")) - Number(this.keys.has("KeyW")),
      },
      pointerWorld: this.pointer,
      attack: this.attack,
      skill: this.skill,
      dodge: this.dodge,
      interact: this.interact,
    };
    this.skill = false;
    this.dodge = false;
    this.interact = false;
    return cmd;
  }
}
