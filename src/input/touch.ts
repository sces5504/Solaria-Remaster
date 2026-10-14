import type { Input } from "./keyboard";
type Finger = { element: HTMLElement; control: string; inside: boolean };
export class TouchControls {
  private fingers = new Map<number, Finger>();
  private enabled = false;
  constructor(
    readonly root: HTMLElement,
    private input: Input,
    private ui: (action: string) => void,
    private interrupt: () => void,
    private unlock: () => void,
  ) {
    input.onClear = () => this.clear();
    root.addEventListener("pointerdown", (e) => {
      const element = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-touch]",
      );
      if (!element || !this.enabled || (element as HTMLButtonElement).disabled)
        return;
      e.preventDefault();
      this.unlock();
      input.touchAim = true;
      const control = element.dataset.touch!;
      if (
        control === "move" &&
        [...this.fingers.values()].some((f) => f.control === "move")
      )
        return;
      this.fingers.set(e.pointerId, { element, control, inside: true });
      try {
        element.setPointerCapture(e.pointerId);
      } catch {}
      if (control === "skill" || control === "dodge" || control === "interact")
        input.touch[control] = true;
      else if (!["move", "attack"].includes(control)) this.ui(control);
      this.update(e);
    });
    root.addEventListener("pointermove", (e) => {
      if (this.fingers.has(e.pointerId)) {
        e.preventDefault();
        this.update(e);
      }
    });
    const release = (e: PointerEvent) => {
      const finger = this.fingers.get(e.pointerId);
      if (!finger) return;
      this.fingers.delete(e.pointerId);
      if (finger.control === "move") input.touch.move = { x: 0, y: 0 };
      this.sync();
    };
    root.addEventListener("pointerup", release);
    root.addEventListener("pointercancel", (e) => {
      if (this.fingers.has(e.pointerId)) {
        input.clear();
        this.interrupt();
      }
    });
    root.addEventListener("lostpointercapture", (e) => {
      if (this.fingers.has(e.pointerId)) {
        input.clear();
        this.interrupt();
      }
    });
    root.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  setEnabled(value: boolean) {
    if (this.enabled && !value) this.input.clear();
    this.enabled = value;
    this.root.dataset.enabled = String(value);
  }
  clear() {
    const old = [...this.fingers.entries()];
    this.fingers.clear();
    for (const [id, f] of old)
      try {
        if (f.element.hasPointerCapture(id))
          f.element.releasePointerCapture(id);
      } catch {}
    this.input.touch.move = { x: 0, y: 0 };
    this.input.touch.attack = false;
    this.sync();
  }
  private update(e: PointerEvent) {
    const f = this.fingers.get(e.pointerId);
    if (!f) return;
    const rect = f.element.getBoundingClientRect();
    if (f.control === "move") {
      const dx = e.clientX - (rect.left + rect.width / 2),
        dy = e.clientY - (rect.top + rect.height / 2),
        radius = rect.width * 0.35;
      const length = Math.hypot(dx, dy),
        scale = length > radius ? radius / length : 1;
      this.input.touch.move =
        length < radius * 0.12
          ? { x: 0, y: 0 }
          : { x: (dx * scale) / radius, y: (dy * scale) / radius };
    } else
      f.inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
    this.sync();
  }
  private sync() {
    this.input.touch.attack = [...this.fingers.values()].some(
      (f) => f.control === "attack" && f.inside,
    );
    const m = this.input.touch.move;
    this.root.style.setProperty("--stick-x", `${m.x * 30}px`);
    this.root.style.setProperty("--stick-y", `${m.y * 30}px`);
    for (const element of this.root.querySelectorAll<HTMLElement>(
      "[data-touch]",
    ))
      element.classList.toggle(
        "held",
        [...this.fingers.values()].some(
          (f) => f.element === element && f.inside,
        ),
      );
  }
  inspect() {
    return {
      pointers: this.fingers.size,
      enabled: this.enabled,
      move: { ...this.input.touch.move },
      attack: this.input.touch.attack,
    };
  }
}
