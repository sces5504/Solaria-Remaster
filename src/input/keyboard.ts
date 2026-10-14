import type { Command, Run } from "../game/core/types";
export class Input {
  touchAim = false;
  touch = {
    move: { x: 0, y: 0 },
    attack: false,
    skill: false,
    dodge: false,
    interact: false,
  };
  interactTarget?: Command["interactTarget"];
  onClear?: () => void;

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
      this.touchAim = false;
      this.keys.add(e.code);
      if (e.repeat) return;
      if (e.code === "Space") this.dodge = true;
      else if (e.code === "KeyE") this.interact = true;
      else if (
        ["Escape", "KeyI", "KeyC", "Enter", "ArrowLeft", "ArrowRight"].includes(
          e.code,
        )
      )
        action(e.code);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      this.touchAim = false;
      const rect = canvas.getBoundingClientRect();
      this.pointer = {
        x: ((e.clientX - rect.left) * 1024) / rect.width,
        y: ((e.clientY - rect.top) * 640) / rect.height,
      };
    });
    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      this.touchAim = false;
      if (e.button === 0) this.attack = true;
      if (e.button === 2) this.skill = true;
    });
    window.addEventListener("mouseup", (e) => {
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
    this.interactTarget = undefined;
    this.keys.clear();
    this.touch.move = { x: 0, y: 0 };
    this.touch.attack =
      this.touch.skill =
      this.touch.dodge =
      this.touch.interact =
        false;
    this.onClear?.();
    this.attack = false;
    this.skill = false;
    this.dodge = false;
    this.interact = false;
  }
  consumeEdges() {
    this.interactTarget = undefined;
    this.touch.skill = this.touch.dodge = this.touch.interact = false;
    this.skill = false;
    this.dodge = false;
    this.interact = false;
  }
  command(r: Run): Command {
    const cmd: Command = {
      tick: r.tick,
      actorId: 0,
      move: {
        x: Math.max(
          -1,
          Math.min(
            1,
            Number(this.keys.has("KeyD")) -
              Number(this.keys.has("KeyA")) +
              this.touch.move.x,
          ),
        ),
        y: Math.max(
          -1,
          Math.min(
            1,
            Number(this.keys.has("KeyS")) -
              Number(this.keys.has("KeyW")) +
              this.touch.move.y,
          ),
        ),
      },
      pointerWorld: this.pointer,
      attack: this.attack || this.touch.attack,
      skill: this.skill || this.touch.skill,
      dodge: this.dodge || this.touch.dodge,
      interact: this.interact || this.touch.interact,
      interactTarget: this.touch.interact ? this.interactTarget : undefined,
    };
    return cmd;
  }
}
