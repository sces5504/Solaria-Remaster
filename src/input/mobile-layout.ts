import { storageKey } from "../storage-namespace";
export const controlNames = {
  move: "移動搖桿",
  attack: "普攻",
  skill: "職業技能",
  dodge: "閃避",
  inventory: "背包",
  pause: "暫停",
};
export type ControlName = keyof typeof controlNames;
type Placement = { x: number; y: number; scale: number };
export type MobileLayout = {
  version: 1;
  field: Placement;
  controls: Partial<Record<ControlName, Placement>>;
};
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
export const defaultLayout = (): MobileLayout => ({
  version: 1,
  field: { x: 0.5, y: 0.5, scale: 1 },
  controls: {},
});
export function readLayout(raw: string | null): MobileLayout {
  const result = defaultLayout();
  try {
    const data = JSON.parse(raw ?? "null");
    if (data?.version !== 1) return result;
    const valid = (v: any, lo: number, hi: number): Placement | undefined =>
      v && [v.x, v.y, v.scale].every(Number.isFinite)
        ? { x: clamp(v.x), y: clamp(v.y), scale: clamp(v.scale, lo, hi) }
        : undefined;
    result.field = valid(data.field, 0.55, 1) ?? result.field;
    for (const id of Object.keys(controlNames) as ControlName[]) {
      const p = valid(data.controls?.[id], 0.6, 1.6);
      if (p) result.controls[id] = p;
    }
  } catch {}
  return result;
}
export class MobileLayoutEditor {
  private data = defaultLayout();
  private panel: HTMLElement;
  private selected: "field" | ControlName = "field";
  private dragging?: {
    id: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
  };
  private editing = false;
  private dimensions = "";
  private key = storageKey("solaria-touch-layout");
  constructor(
    private host: HTMLElement,
    private root: HTMLElement,
    private enabled: boolean,
  ) {
    try {
      this.data = readLayout(localStorage.getItem(this.key));
    } catch {}
    this.panel = document.createElement("section");
    this.panel.id = "layout-editor";
    this.panel.hidden = true;
    this.panel.innerHTML = `<div><strong>按鍵佈局</strong><button type="button" data-layout-reset>預設佈局</button></div><p>拖曳戰場或按鍵調整位置，也可使用下方滑桿。設定會保存在此瀏覽器。</p><label>調整項目<select aria-label="調整項目"><option value="field">遊戲畫面</option>${Object.entries(
      controlNames,
    )
      .map(([id, name]) => `<option value="${id}">${name}</option>`)
      .join(
        "",
      )}</select></label><label>大小 <output data-size></output><input type="range" data-layout="scale" aria-label="大小" step="1"></label><label>水平位置<input type="range" data-layout="x" aria-label="水平位置" min="0" max="100"></label><label>垂直位置<input type="range" data-layout="y" aria-label="垂直位置" min="0" max="100"></label>`;
    host.append(this.panel);
    this.panel.querySelector("select")!.onchange = (e) => {
      this.selected = (e.target as HTMLSelectElement)
        .value as typeof this.selected;
      this.apply();
      this.sync();
    };
    this.panel.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement,
        key = target.dataset.layout as keyof Placement | undefined;
      if (!key) return;
      this.placement()[key] = Number(target.value) / 100;
      this.save();
      this.apply();
      this.sync();
    });
    this.panel.querySelector<HTMLButtonElement>(
      "[data-layout-reset]",
    )!.onclick = () => {
      this.data = defaultLayout();
      try {
        localStorage.removeItem(this.key);
      } catch {}
      this.apply();
      this.sync();
    };
    host.addEventListener(
      "pointerdown",
      (e) => {
        if (
          this.dragging ||
          !this.editing ||
          (e.target as HTMLElement).closest(
            "#layout-editor, #mobile-system, #orientation-gate",
          )
        )
          return;
        const control = (e.target as HTMLElement).closest<HTMLElement>(
          "[data-touch]",
        )?.dataset.touch;
        if (control && control in controlNames)
          this.selected = control as ControlName;
        else if ((e.target as HTMLElement).closest("#viewport"))
          this.selected = "field";
        else return;
        e.preventDefault();
        e.stopPropagation();
        const p = this.placement();
        this.dragging = {
          id: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          x: p.x,
          y: p.y,
        };
        try {
          host.setPointerCapture(e.pointerId);
        } catch {}
        this.sync();
      },
      true,
    );
    host.addEventListener("pointermove", (e) => {
      const d = this.dragging;
      if (!d || d.id !== e.pointerId) return;
      e.preventDefault();
      const box = this.area(),
        size = this.size(this.selected),
        p = this.placement();
      p.x = clamp(
        d.x + (e.clientX - d.startX) / Math.max(1, box.width - size.width),
      );
      p.y = clamp(
        d.y + (e.clientY - d.startY) / Math.max(1, box.height - size.height),
      );
      this.apply();
      this.sync();
    });
    const end = () => {
      if (this.dragging) {
        this.dragging = undefined;
        this.save();
      }
    };
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
    host.addEventListener("lostpointercapture", end);
    window.addEventListener("blur", end);
    window.addEventListener("resize", () => this.apply());
    visualViewport?.addEventListener("resize", () => this.apply());
    this.apply();
  }
  setEditing(value: boolean) {
    if (value === this.editing) return;
    if (!value) {
      this.save();
      if (this.dragging)
        try {
          this.host.releasePointerCapture(this.dragging.id);
        } catch {}
    }
    this.editing = value;
    this.dragging = undefined;
    this.panel.hidden = !value;
    document.body.classList.toggle("layout-edit", value);
    this.apply();
    this.sync();
  }
  update() {
    const dims = `${innerWidth}:${visualViewport?.height ?? innerHeight}`;
    if (dims !== this.dimensions) {
      this.dimensions = dims;
      this.apply();
    }
  }
  private area() {
    // Read resolved safe-area lengths through an element, including max()/env().
    const box = this.host.getBoundingClientRect();
    const css = getComputedStyle(this.host);
    const left = parseFloat(css.paddingLeft) || 24;
    const right = parseFloat(css.paddingRight) || 24;
    const top = parseFloat(css.paddingTop) || 42;
    const bottom = parseFloat(css.paddingBottom) || 8;
    return {
      left,
      top,
      width: Math.max(1, box.width - left - right),
      height: Math.max(1, box.height - top - bottom),
    };
  }
  private size(id: "field" | ControlName) {
    const area = this.area();
    if (id === "field") {
      const width =
        Math.min(area.width, area.height * 1.6) * this.data.field.scale;
      return { width, height: width / 1.6 };
    }
    const base =
      id === "move"
        ? [96, 96]
        : id === "attack"
          ? [84, 84]
          : ["skill", "dodge"].includes(id)
            ? [72, 72]
            : [52, 44];
    const scale = this.data.controls[id]?.scale ?? 1;
    return {
      width: Math.min(area.width, Math.max(44, base[0] * scale)),
      height: Math.min(area.height, Math.max(44, base[1] * scale)),
    };
  }
  private placement(create = true): Placement {
    if (this.selected === "field") return this.data.field;
    const stored = this.data.controls[this.selected];
    if (stored) return stored;
    const p = this.defaultPlacement(this.selected);
    if (create) this.data.controls[this.selected] = p;
    return p;
  }
  private defaultPlacement(id: ControlName): Placement {
    const a = this.area(),
      size = this.size(id);
    const left =
      id === "move"
        ? 8
        : id === "inventory"
          ? 4
          : id === "pause"
            ? 62
            : id === "skill"
              ? a.width - 156
              : id === "dodge"
                ? a.width - 76
                : a.width - 118;
    const bottom =
      id === "move" || id === "attack"
        ? 8
        : ["inventory", "pause"].includes(id)
          ? 116
          : 100;
    return {
      x: clamp(left / Math.max(1, a.width - size.width)),
      y: clamp(
        (a.height - bottom - size.height) / Math.max(1, a.height - size.height),
      ),
      scale: 1,
    };
  }
  private apply() {
    if (!this.enabled) return;
    const area = this.area();
    for (const id of ["field", ...Object.keys(controlNames)] as (
      "field" | ControlName
    )[]) {
      const p =
        id === "field"
          ? this.data.field
          : (this.data.controls[id] ?? this.defaultPlacement(id));
      const size = this.size(id);
      const el =
        id === "field"
          ? this.host.querySelector<HTMLElement>("#viewport")!
          : this.root.querySelector<HTMLElement>(`[data-touch="${id}"]`)!;
      Object.assign(el.style, {
        position: "absolute",
        gridArea: "auto",
        width: `${size.width}px`,
        height: `${size.height}px`,
        left: `${area.left + (area.width - size.width) * p.x}px`,
        top: `${area.top + (area.height - size.height) * p.y}px`,
      });
      el.classList.toggle(
        "layout-selected",
        this.editing && id === this.selected,
      );
    }
  }
  private sync() {
    if (!this.editing) return;
    this.panel.querySelector("select")!.value = this.selected;
    const p = this.placement(false),
      scale = this.panel.querySelector<HTMLInputElement>(
        '[data-layout="scale"]',
      )!;
    scale.min = this.selected === "field" ? "55" : "60";
    scale.max = this.selected === "field" ? "100" : "160";
    for (const key of ["scale", "x", "y"] as const)
      this.panel.querySelector<HTMLInputElement>(
        `[data-layout="${key}"]`,
      )!.value = String(Math.round(p[key] * 100));
    this.panel.querySelector("output")!.textContent =
      `${Math.round(p.scale * 100)}%`;
  }
  private save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch {}
  }
}
