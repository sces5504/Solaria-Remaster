import type { Run } from "../core/types";
import { clone } from "../core/primitives";
import { cards, eligible } from "../data/cards";
export interface Saved {
  version: 1;
  revision: number;
  current: Run;
  entry: Run;
}
export function validate(value: unknown): Saved {
  if (!value || typeof value !== "object") throw new Error("存檔不是有效資料");
  const s = value as Saved;
  if (s.version !== 1 || !Number.isInteger(s.revision) || s.revision < 0)
    throw new Error("不支援的存檔版本");
  function inspect(v: unknown, depth = 0): void {
    if (depth > 25) throw new Error("存檔結構過深");
    if (typeof v === "number" && (!Number.isFinite(v) || Math.abs(v) > 1e12))
      throw new Error("存檔數值超出範圍");
    if (typeof v === "string" && v.length > 500)
      throw new Error("存檔字串過長");
    if (Array.isArray(v)) {
      if (v.length > 6000) throw new Error("存檔物件過多");
      for (const x of v) inspect(x, depth + 1);
    } else if (v && typeof v === "object")
      for (const [k, x] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          throw new Error("存檔欄位不合法");
        inspect(x, depth + 1);
      }
  }
  inspect(s);
  for (const r of [s.current, s.entry]) {
    if (
      !r ||
      r.version !== 1 ||
      !["sword", "bow", "mage"].includes(r.classId) ||
      ![
        "ROOM_INTRO",
        "COMBAT",
        "SETTLEMENT",
        "UPGRADE_CHOICE",
        "POST_CLEAR",
        "RUN_END",
        "DEAD",
      ].includes(r.phase)
    )
      throw new Error("存檔狀態損壞");
    if (
      !Number.isInteger(r.seed) ||
      !Number.isInteger(r.room) ||
      r.room < 1 ||
      r.room > 5 ||
      !Number.isFinite(r.player?.hp) ||
      r.player.hp < 0 ||
      !Number.isFinite(r.time)
    )
      throw new Error("存檔數值損壞");
    if (
      !Array.isArray(r.bag) ||
      r.bag.length > 12 ||
      !Array.isArray(r.items) ||
      !Array.isArray(r.elements) ||
      r.elements.length > 2
    )
      throw new Error("背包或元素數量損壞");
    for (const field of [
      "enemies",
      "projectiles",
      "areas",
      "modes",
      "obstacles",
      "drops",
      "visuals",
      "templates",
      "choices",
      "modifiers",
    ] as const)
      if (!Array.isArray(r[field])) throw new Error("存檔缺少必要陣列");
    for (const item of [...r.items, ...r.bag, ...Object.values(r.equipment)]) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !["armor", "ring", "amulet"].includes(item.slot) ||
        !["藍", "紫", "黃"].includes(item.rarity) ||
        !Array.isArray(item.affixes)
      )
        throw new Error("裝備資料損壞");
      for (const aff of item.affixes)
        if (
          ![
            "hp",
            "armor",
            "basic",
            "skill",
            "elemental",
            "global",
            "rate",
            "cd",
            "crit",
            "critMult",
            "speed",
            "range",
            "projectile",
            "xp",
            "lifesteal",
          ].includes(aff.stat) ||
          !Number.isFinite(aff.value)
        )
          throw new Error("裝備詞條損壞");
    }
    const ids = [...r.bag, ...r.items, ...Object.values(r.equipment)]
      .filter(Boolean)
      .map((i) => i!.id);
    if (new Set(ids).size !== ids.length) throw new Error("存檔含重複物品");
    for (const [id, l] of Object.entries(r.cards)) {
      if (
        !cards.some((c) => c.id === Number(id)) ||
        !Number.isInteger(l) ||
        l < 1
      )
        throw new Error("卡片資料損壞");
    }
    if (
      r.phase === "UPGRADE_CHOICE" &&
      (!Array.isArray(r.choices) ||
        r.choices.length !== 3 ||
        new Set(r.choices).size !== 3 ||
        r.choices.some((id) => {
          const c = cards.find((c) => c.id === id);
          return !c || !eligible(r, c);
        }))
    )
      throw new Error("選卡資料損壞");
  }
  // JSON roundtrip strips prototypes. Strings are never inserted as HTML by UI.
  return JSON.parse(JSON.stringify(s)) as Saved;
}
export class Checkpoints {
  private db!: IDBDatabase;
  revision = 0;
  entry: Run | null = null;
  async open() {
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("solaria-remaster", 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("run");
        req.result.createObjectStore("profile");
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async load(): Promise<Run | null> {
    const saved = await this.read("latest");
    if (!saved) return null;
    let s: Saved;
    try {
      s = validate(saved);
    } catch (error) {
      const backup = await this.read("previous");
      if (!backup) throw error;
      s = validate(backup);
      this.entry = clone(s.entry);
      this.revision = s.revision;
      throw new Error("最新存檔損壞；前一份仍保留。請先匯出備份後重試。");
    }
    this.entry = clone(s.entry);
    this.revision = s.revision;
    return clone(s.current.phase === "COMBAT" ? s.entry : s.current);
  }
  private read(key: string) {
    return new Promise<unknown>((resolve, reject) => {
      const tx = this.db.transaction("run", "readonly");
      const req = tx.objectStore("run").get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async save(r: Run, entry = false) {
    if (entry || !this.entry) this.entry = clone(r);
    const next: Saved = {
      version: 1,
      revision: this.revision + 1,
      current: clone(r),
      entry: clone(this.entry),
    };
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction("run", "readwrite"),
        store = tx.objectStore("run"),
        req = store.get("latest");
      req.onsuccess = () => {
        const prior = req.result as Saved | undefined;
        if (prior && prior.revision !== this.revision) {
          tx.abort();
          return;
        }
        if (prior) store.put(prior, "previous");
        store.put(next, "latest");
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(new Error("另一個分頁已更新存檔。請回主選單讀取最新版本。"));
      tx.onerror = () =>
        reject(new Error("無法保存；請匯出備份，檢查儲存空間。"));
    });
    this.revision = next.revision;
    r.revision = this.revision;
  }
  async clear(r?: Run) {
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction(["run", "profile"], "readwrite");
      const req = tx.objectStore("run").get("latest");
      req.onsuccess = () => {
        const prior = req.result as Saved | undefined;
        if (prior && prior.revision !== this.revision) {
          tx.abort();
          return;
        }
        tx.objectStore("run").clear();
        if (r) {
          const p = tx.objectStore("profile");
          const get = p.get("records");
          get.onsuccess = () => {
            const records = (get.result || []) as unknown[];
            records.push({
              classId: r.classId,
              level: r.level,
              time: r.time,
              seed: r.seed,
              finished: r.phase === "RUN_END",
            });
            p.put(records.slice(-100), "records");
          };
        }
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(new Error("存檔已在其他分頁更新，請重新讀取"));
    });
    this.revision = 0;
    this.entry = null;
  }
  export(r: Run) {
    return JSON.stringify(
      {
        version: 1,
        revision: this.revision,
        current: r,
        entry: this.entry ?? r,
      },
      null,
      2,
    );
  }
  async import(text: string) {
    if (text.length > 5_000_000) throw new Error("存檔檔案過大");
    const saved = validate(JSON.parse(text));
    const current = (await this.read("latest")) as Saved | undefined;
    this.revision = current?.revision ?? 0;
    this.entry = saved.entry;
    await this.save(saved.current);
    return this.load();
  }
}
