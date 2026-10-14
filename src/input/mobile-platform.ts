export function mobileDevice() {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1) ||
    (matchMedia("(pointer: coarse)").matches &&
      Math.min(screen.width, screen.height) <= 1100)
  );
}
export class MobilePlatform {
  readonly enabled = mobileDevice();
  portrait = false;
  private needsContinue = false;
  private gate: HTMLElement;
  private previousPortrait: boolean;
  constructor(
    host: HTMLElement,
    private interrupt: () => void,
    resume: () => void,
  ) {
    document.body.classList.toggle("mobile", this.enabled);
    this.portrait = innerHeight > innerWidth;
    this.previousPortrait = this.portrait;
    this.gate = document.createElement("div");
    this.gate.id = "orientation-gate";
    this.gate.innerHTML =
      '<section><h2>請旋轉手機橫向遊玩</h2><p>橫向顯示完整戰場。旋轉後，點擊繼續旅程。</p><button type="button">繼續旅程</button></section>';
    host.append(this.gate);
    this.gate.querySelector("button")!.onclick = () => {
      if (this.portrait) return;
      this.needsContinue = false;
      this.paint();
      resume();
    };
    const update = (force = false) => {
      if (!this.enabled) return;
      this.portrait = innerHeight > innerWidth;
      if (force || this.portrait !== this.previousPortrait) {
        this.needsContinue = true;
        interrupt();
      }
      this.previousPortrait = this.portrait;
      this.paint();
    };
    window.addEventListener("orientationchange", () => update(true));
    screen.orientation?.addEventListener("change", () => update(true));
    window.addEventListener("resize", () => update());
    document.addEventListener("fullscreenchange", () => {
      if (this.enabled) interrupt();
    });
    window.addEventListener("pagehide", () => {
      if (this.enabled) interrupt();
    });
    window.addEventListener("pageshow", (e) => {
      if (this.enabled && e.persisted) interrupt();
    });
    visualViewport?.addEventListener("resize", () => update());
    if (this.enabled) {
      // Safari can ignore viewport zoom limits; cancel gesture zoom on the entire app.
      for (const event of ["gesturestart", "gesturechange", "gestureend"])
        document.addEventListener(event, (e) => e.preventDefault(), {
          passive: false,
        });
      document.addEventListener(
        "touchmove",
        (e) => {
          if (e.cancelable && e.touches.length > 1) e.preventDefault();
        },
        { passive: false },
      );
      document.addEventListener("dblclick", (e) => e.preventDefault());
    }
    this.paint();
  }
  get blocked() {
    return this.enabled && (this.portrait || this.needsContinue);
  }
  private paint() {
    this.gate.hidden = !this.blocked;
    this.gate.querySelector("button")!.disabled = this.portrait;
    this.gate.querySelector("h2")!.textContent = this.portrait
      ? "請旋轉手機橫向遊玩"
      : "已切換為橫向畫面";
    document.documentElement.style.setProperty(
      "--mobile-height",
      `${visualViewport?.height ?? innerHeight}px`,
    );
  }
}
