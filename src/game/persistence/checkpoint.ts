import { equipmentCatalog } from "../data/equipment";
import { biomes } from "../data/biomes";
import { restoreJourney } from "../data/journey";
import type { Run } from "../core/types";
import { clone } from "../core/primitives";
import { cards, eligible } from "../data/cards";
export interface Saved {
  version: 1;
  revision: number;
  current: Run;
  entry: Run;
  discovered?: number[];
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
  if (
    s.discovered !== undefined &&
    (!Array.isArray(s.discovered) ||
      s.discovered.some((id) => !cards.some((c) => c.id === id)))
  )
    throw new Error("圖鑑資料損壞");
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
        "FUSION_CHOICE",
        "EQUIPMENT_SLOT_CHOICE",
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
      r.room > 31 ||
      !Number.isFinite(r.player?.hp) ||
      r.player.hp < 0 ||
      !Number.isFinite(r.time)
    )
      throw new Error("存檔數值損壞");
    if (
      r.loop !== undefined &&
      (!Number.isInteger(r.loop) || r.loop < 1 || r.loop > 1000000)
    )
      throw new Error("周目資料損壞");
    if (r.biome !== undefined && !(r.biome in biomes))
      throw new Error("地形資料損壞");
    if (
      r.journey !== undefined &&
      (!Array.isArray(r.journey) ||
        r.journey.length !== 6 ||
        r.journey.some(
          (seg) =>
            !seg ||
            !(seg.biome in biomes) ||
            !Array.isArray(seg.templates) ||
            seg.templates.length !== 4 ||
            new Set(seg.templates).size !== 4 ||
            seg.templates.some((t) => !Number.isInteger(t) || t < 0 || t > 5) ||
            !Number.isInteger(seg.boss) ||
            seg.boss < 1 ||
            seg.boss > 18,
        ))
    )
      throw new Error("秘境路線損壞");
    if (
      !Array.isArray(r.bag) ||
      r.bag.length > 12 ||
      !Array.isArray(r.items) ||
      !Array.isArray(r.elements) ||
      r.elements.length > (r.cards[80] ? 3 : 2)
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
        !["藍", "紫", "黃", "橘", "紅"].includes(item.rarity) ||
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
    if (r.rerollUsed !== undefined && typeof r.rerollUsed !== "boolean")
      throw new Error("刷新資料損壞");
    if (r.cards[78] && r.cards[83]) throw new Error("互斥卡片資料損壞");
    if (
      r.selectedEquipmentSlot !== undefined &&
      !["armor", "ring", "amulet"].includes(r.selectedEquipmentSlot)
    )
      throw new Error("裝備欄選擇損壞");
    if (
      r.phase === "FUSION_CHOICE" &&
      (!Array.isArray(r.fusionChoices) ||
        r.fusionChoices.length < 2 ||
        r.fusionChoices.some(
          (f) => !["steam", "storm", "frostfire"].includes(f),
        ))
    )
      throw new Error("融合選擇損壞");
    if (r.phase === "EQUIPMENT_SLOT_CHOICE" && !r.cards[85])
      throw new Error("裝備選擇損壞");
    for (const item of [...r.items, ...r.bag, ...Object.values(r.equipment)]) {
      if (!item) continue;
      const d = item.ability ? equipmentCatalog[item.ability] : undefined;
      if (
        item.ability &&
        (!d || d.slot !== item.slot || d.rarity !== item.rarity)
      )
        throw new Error("特殊裝備資料損壞");
      if (["橘", "紅"].includes(item.rarity) && !d)
        throw new Error("特殊裝備缺少能力");
    }
    for (const [id, l] of Object.entries(r.cards)) {
      if (
        !cards.some((c) => c.id === Number(id)) ||
        !Number.isInteger(l) ||
        l < 1 ||
        (Number(id) >= 70 && l !== 1)
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
  const migrated = JSON.parse(JSON.stringify(s)) as Saved;
  for (const r of [migrated.current, migrated.entry]) restoreJourney(r);
  // JSON roundtrip strips prototypes. Strings are never inserted as HTML by UI.
  return migrated;
}
export class Checkpoints {
  private db!: IDBDatabase;
  revision = 0;
  entry: Run | null = null;
  discovered: number[] = [];
  recoveryNotice = "";
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
    this.recoveryNotice = "";
    await this.remember([]);
    const saved = await this.read("latest");
    if (!saved) return null;
    let s: Saved;
    try {
      s = validate(saved);
    } catch (error) {
      s = await this.recover(error);
    }
    await this.remember([
      ...Object.keys(s.current.cards).map(Number),
      ...Object.keys(s.entry.cards).map(Number),
      ...(s.discovered || []),
    ]);
    this.entry = clone(s.entry);
    this.revision = s.revision;
    return clone(s.current.phase === "COMBAT" ? s.entry : s.current);
  }
  private recover(originalError: unknown): Promise<Saved> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("run", "readwrite");
      const store = tx.objectStore("run");
      let restored: Saved;
      let failure = originalError;
      const latest = store.get("latest");
      latest.onsuccess = () => {
        // Another tab may have repaired the save since the first read.
        try {
          restored = validate(latest.result);
          return;
        } catch {
          const previous = store.get("previous");
          previous.onsuccess = () => {
            try {
              restored = validate(previous.result);
              const brokenRevision = (latest.result as Partial<Saved>)
                ?.revision;
              restored.revision =
                Math.max(
                  restored.revision,
                  Number.isSafeInteger(brokenRevision) &&
                    brokenRevision! >= 0 &&
                    brokenRevision! < 1e12
                    ? brokenRevision!
                    : 0,
                ) + 1;
              restored.current.revision = restored.revision;
              restored.entry.revision = restored.revision;
              store.put(latest.result, "damaged");
              store.put(restored, "latest");
              this.recoveryNotice = "最新存檔損壞，已恢復上一份有效紀錄。";
            } catch (error) {
              failure = error;
              tx.abort();
            }
          };
        }
      };
      tx.oncomplete = () => resolve(restored);
      tx.onabort = () => reject(failure);
      tx.onerror = () => reject(new Error("無法恢復存檔，原始紀錄仍保留。"));
    });
  }
  private async remember(ids: number[]) {
    await new Promise<void>((resolve, reject) => {
      const tx = this.db.transaction("profile", "readwrite"),
        store = tx.objectStore("profile"),
        req = store.get("discovered");
      req.onsuccess = () => {
        this.discovered = [...new Set([...(req.result || []), ...ids])]
          .filter((id: number) => cards.some((c) => c.id === id))
          .sort((a, b) => a - b);
        store.put(this.discovered, "discovered");
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error("無法保存旅人圖鑑"));
    });
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
      const tx = this.db.transaction(["run", "profile"], "readwrite"),
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
        const profile = tx.objectStore("profile"),
          known = profile.get("discovered");
        known.onsuccess = () => {
          this.discovered = [
            ...new Set([
              ...(known.result || []),
              ...Object.keys(r.cards).map(Number),
            ]),
          ].sort((a, b) => a - b);
          profile.put(this.discovered, "discovered");
        };
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
    if (r) await this.remember(Object.keys(r.cards).map(Number));
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
        discovered: this.discovered,
      },
      null,
      2,
    );
  }
  async import(text: string) {
    if (text.length > 5_000_000) throw new Error("存檔檔案過大");
    const saved = validate(JSON.parse(text));
    await this.remember(saved.discovered || []);
    const current = (await this.read("latest")) as Saved | undefined;
    this.revision = current?.revision ?? 0;
    this.entry = saved.entry;
    await this.save(saved.current);
    return this.load();
  }
}
