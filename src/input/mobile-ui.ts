import { MobileLayoutEditor } from "./mobile-layout";
import { touchTarget } from "./mobile-interaction";
import { AutoAim } from "./auto-aim";
import { MobilePlatform } from "./mobile-platform";
import { TouchControls } from "./touch";
import type { Input } from "./keyboard";
import type { Run } from "../game/core/types";
import { playtestBuild, storageKey } from "../storage-namespace";
export class MobileUI {
  readonly aim = new AutoAim();
  readonly platform: MobilePlatform;
  readonly controls: TouchControls;
  private root: HTMLElement;
  private marker: HTMLElement;
  private hint: HTMLElement;
  readonly layout: MobileLayoutEditor;
  private currentRun: Run | null = null;
  private active = false;
  private taps = new Map<number, { x: number; y: number; time: number }>();
  constructor(
    input: Input,
    interrupt: () => void,
    resume: () => void,
    ui: (action: string) => void,
    unlock: () => void,
  ) {
    const host = document.querySelector<HTMLElement>(".game-layout")!;
    this.platform = new MobilePlatform(host, interrupt, resume);
    this.root = document.createElement("div");
    this.root.id = "touch-controls";
    this.root.innerHTML =
      '<div class="touch-left"><div class="touch-tools"><button data-touch="inventory" aria-label="背包">背包</button><button data-touch="pause" aria-label="暫停">暫停</button></div><div id="touch-stick" data-touch="move" role="group" aria-label="移動搖桿"><span></span><small>移動</small></div></div><div class="touch-right"><button data-touch="skill" aria-label="職業技能"><b>職業技能</b><small></small></button><button data-touch="dodge" aria-label="閃避"><b>閃避</b><small></small></button><button data-touch="attack" aria-label="普攻"><b>普攻</b><small>按住連發</small></button></div>';
    host.append(this.root);
    this.layout = new MobileLayoutEditor(
      host,
      this.root,
      this.platform.enabled,
    );
    const canvas = host.querySelector("canvas")!;
    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "touch" || !this.active) return;
      this.taps.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
      });
    });
    canvas.addEventListener("pointerup", (e) => {
      const start = this.taps.get(e.pointerId);
      this.taps.delete(e.pointerId);
      const r = this.currentRun;
      if (
        !start ||
        !this.active ||
        !r ||
        performance.now() - start.time > 600 ||
        Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12
      )
        return;
      const rect = canvas.getBoundingClientRect();
      const target = touchTarget(
        r,
        ((e.clientX - rect.left) * 1024) / rect.width,
        ((e.clientY - rect.top) * 640) / rect.height,
        rect.width / 1024,
      );
      if (target) {
        input.touchAim = true;
        input.interactTarget = target;
        input.touch.interact = true;
        unlock();
      }
    });
    canvas.addEventListener("pointercancel", () => this.taps.clear());
    window.addEventListener("blur", () => this.taps.clear());
    document.addEventListener("visibilitychange", () => this.taps.clear());
    const system = document.createElement("div");
    system.id = "mobile-system";
    system.innerHTML =
      '<span>Solaria <small>橫向旅程</small></span><div><button type="button" data-system="fullscreen">全螢幕</button><button type="button" data-system="mute">音效 開</button></div>';
    if (playtestBuild)
      system.querySelector("small")!.textContent = "手機測試 · 獨立存檔";
    host.append(system);
    system.addEventListener("click", (e) => {
      const a = (e.target as HTMLElement).closest<HTMLElement>("[data-system]")
        ?.dataset.system;
      if (a) {
        input.clear();
        unlock();
        ui(a);
      }
    });
    const full = system.querySelector<HTMLButtonElement>(
      '[data-system="fullscreen"]',
    )!;
    full.hidden =
      !document.fullscreenEnabled ||
      typeof host.requestFullscreen !== "function";
    this.controls = new TouchControls(this.root, input, ui, interrupt, unlock);
    this.marker = document.createElement("div");
    this.marker.id = "touch-target";
    this.marker.hidden = true;
    this.marker.setAttribute("aria-label", "目前瞄準目標");
    document.querySelector("#viewport")!.append(this.marker);
    this.hint = document.createElement("aside");
    this.hint.id = "install-hint";
    this.hint.innerHTML =
      '<p>想從主畫面啟程？若瀏覽器提供，可從分享選單選擇「加入主畫面」。顯示方式依手機與瀏覽器而定。</p><button type="button" aria-label="關閉加入主畫面提示">知道了</button>';
    host.append(this.hint);
    let dismissed = false;
    try {
      dismissed =
        localStorage.getItem(storageKey("solaria-install-hint")) === "1";
    } catch {}
    this.hint.dataset.dismissed = String(dismissed);
    this.hint.querySelector("button")!.onclick = () => {
      this.hint.dataset.dismissed = "true";
      this.hint.hidden = true;
      try {
        localStorage.setItem(storageKey("solaria-install-hint"), "1");
      } catch {}
    };
  }
  update(
    r: Run | null,
    input: Input,
    screen: string,
    saveBusy: boolean,
    volume: number,
  ) {
    const mobile = this.platform.enabled,
      active =
        mobile &&
        Boolean(r) &&
        screen === "game" &&
        !saveBusy &&
        !this.platform.blocked &&
        ["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(r!.phase);
    this.currentRun = r;
    this.active = active;
    if (!active) this.taps.clear();
    this.layout.setEditing(
      mobile && screen === "layout" && !this.platform.blocked,
    );
    this.layout.update();
    this.controls.setEnabled(active);
    this.root.hidden =
      !mobile ||
      !r ||
      !["game", "layout"].includes(screen) ||
      (screen !== "layout" &&
        !["COMBAT", "SETTLEMENT", "POST_CLEAR"].includes(r.phase));
    const target =
      r && active && input.touchAim
        ? r.enemies.find((e) => e.id === this.aim.targetId && e.hp > 0)
        : undefined;
    this.marker.hidden = !target;
    if (target) {
      this.marker.style.left = `${(target.x / 1024) * 100}%`;
      this.marker.style.top = `${(target.y / 640) * 100}%`;
      this.marker.style.width = `${(((target.radius + 8) * 2) / 1024) * 100}%`;
      this.marker.style.aspectRatio = "1";
    }
    if (r) {
      for (const [id, remaining, duration, locked] of [
        [
          "skill",
          Math.max(0, r.player.skillReady - r.time),
          Math.max(0.01, r.player.skillReady - r.player.skillCast),
          !!r.cards[83],
        ],
        ["dodge", Math.max(0, r.player.dashReady - r.time), 2, !!r.cards[84]],
      ] as const) {
        const button = this.root.querySelector<HTMLButtonElement>(
          `[data-touch="${id}"]`,
        )!;
        const fraction = Math.min(1, remaining / duration);
        button.style.setProperty("--cooldown", `${fraction * 100}%`);
        button.classList.toggle("cooling", remaining > 0.05 && !locked);
        button.classList.toggle("sealed", locked);
        button.querySelector("small")!.textContent = locked
          ? "封印"
          : remaining > 0.05
            ? `${remaining.toFixed(1)} 秒`
            : "就緒";
        button.setAttribute(
          "aria-label",
          `${id === "skill" ? "職業技能" : "閃避"} · ${locked ? "封印" : remaining > 0.05 ? `冷卻 ${remaining.toFixed(1)} 秒` : "就緒"}`,
        );
      }
    }
    const top = document.querySelector<HTMLButtonElement>(
      "#mobile-system button:last-child",
    )!;
    const returning = [
      "inventory",
      "stats",
      "catalog",
      "journal",
      "tutorial",
      "layout",
      "test",
    ].includes(screen);
    top.dataset.system = returning
      ? screen === "layout"
        ? "layoutDone"
        : screen === "test"
          ? "testBack"
          : r
            ? "resume"
            : "back"
      : "mute";
    top.textContent = returning
      ? screen === "layout"
        ? "完成佈局"
        : r
          ? "返回戰場"
          : screen === "tutorial"
            ? (document.querySelector('#overlay [data-action="back"]')
                ?.textContent ?? "返回")
            : "返回"
      : volume
        ? "音效 開"
        : "音效 關";
    const standalone =
      matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone;
    this.hint.hidden =
      !mobile ||
      !/iPhone|iPad|iPod/.test(navigator.userAgent) ||
      Boolean(standalone) ||
      this.hint.dataset.dismissed === "true" ||
      screen !== "menu";
    document.body.classList.toggle("install-tip", !this.hint.hidden);
  }
}
