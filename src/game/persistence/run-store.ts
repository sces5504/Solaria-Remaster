import { validate, type Saved } from "./checkpoint-schema";
import { cards } from "../data/cards";
import { clone } from "../core/primitives";
import type { Run } from "../core/types";
import {
  emptyProfile,
  parseProfile,
  updateProfile,
  mergeProfiles,
  type Profile,
  type CosmeticId,
} from "./profile";
import { readProfile, setProfilePreference } from "./profile-store";
import { parseRecords, mergeRecords, type JourneyRecord } from "./records";

export class RunStore {
  private db: IDBDatabase | null = null;
  revision = 0;
  entry: Run | null = null;
  discovered: number[] = [];
  profile = emptyProfile();
  records: JourneyRecord[] = [];
  recoveryNotice = "";
  get ready() {
    return !!this.db;
  }
  private handle() {
    if (!this.db)
      throw new Error("儲存空間尚未開啟，既有紀錄仍保留。請重新讀取。");
    return this.db;
  }
  async open() {
    this.db = await new Promise<IDBDatabase>((resolve, reject) => {
      const q = indexedDB.open("solaria-remaster", 1);
      let settled = false;
      q.onupgradeneeded = () => {
        for (const name of ["run", "profile"])
          if (!q.result.objectStoreNames.contains(name))
            q.result.createObjectStore(name);
      };
      q.onsuccess = () => {
        if (settled) {
          q.result.close();
          return;
        }
        settled = true;
        resolve(q.result);
      };
      q.onerror = () => {
        settled = true;
        reject(
          new Error("無法開啟儲存空間。請檢查瀏覽器的儲存權限；既有紀錄保留。"),
        );
      };
      q.onblocked = () => {
        settled = true;
        reject(new Error("另一個分頁仍占用儲存空間。請關閉舊分頁後重新讀取。"));
      };
    });
    this.db.onversionchange = () => {
      this.db?.close();
      this.db = null;
    };
  }
  private read(store: string, key: string) {
    return new Promise<unknown>((resolve, reject) => {
      const tx = this.handle().transaction(store, "readonly"),
        q = tx.objectStore(store).get(key);
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => reject(new Error("無法讀取旅程，原始紀錄仍保留。"));
    });
  }
  private ids(values: unknown) {
    if (values === undefined) return [];
    if (
      !Array.isArray(values) ||
      values.some(
        (id) => !Number.isInteger(id) || !cards.some((c) => c.id === id),
      )
    )
      throw new Error("旅人圖鑑損壞，原始紀錄仍保留。");
    return [...new Set(values)].sort((a, b) => a - b) as number[];
  }
  private write(
    action: (
      tx: IDBTransaction,
      prior: Saved | undefined,
      revision: number,
    ) => void,
    allowReplace = false,
  ) {
    return new Promise<void>((resolve, reject) => {
      const tx = this.handle().transaction(["run", "profile"], "readwrite"),
        s = tx.objectStore("run"),
        latest = s.get("latest"),
        marker = s.get("revision");
      let count = 0,
        failure: unknown;
      const ready = () => {
        if (++count < 2) return;
        const prior = latest.result as Saved | undefined,
          rev = prior?.revision ?? marker.result ?? 0;
        if (!Number.isSafeInteger(rev) || rev < 0) {
          failure = new Error("存檔版本紀錄損壞，原始資料保留。");
          tx.abort();
          return;
        }
        if (!allowReplace && rev !== this.revision) {
          failure = new Error("另一個分頁已更新存檔。請回主選單讀取最新版本。");
          tx.abort();
          return;
        }
        try {
          action(tx, prior, rev);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
      latest.onsuccess = ready;
      marker.onsuccess = ready;
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(
          failure ??
            new Error(
              tx.error?.name === "QuotaExceededError"
                ? "儲存空間不足；上一份紀錄保留，請匯出備份。"
                : "無法保存；上一份紀錄保留，請匯出備份。",
            ),
        );
      tx.onerror = () => {
        failure = new Error(
          tx.error?.name === "QuotaExceededError"
            ? "儲存空間不足；上一份紀錄保留，請匯出備份。"
            : "無法保存；上一份紀錄保留，請匯出備份。",
        );
      };
    });
  }
  private async recover(original: unknown): Promise<Saved> {
    let restored: Saved | undefined;
    await this.write((tx, latest, rev) => {
      try {
        restored = validate(latest);
        return;
      } catch {}
      const s = tx.objectStore("run"),
        q = s.get("previous");
      q.onsuccess = () => {
        try {
          restored = validate(q.result);
          restored.revision = rev + 1;
          restored.current.revision = restored.entry.revision =
            restored.revision;
          s.put(latest, "damaged");
          s.put(restored, "latest");
          s.put(restored.revision, "revision");
        } catch {
          tx.abort();
        }
      };
    }, true).catch(() => {
      throw original;
    });
    this.recoveryNotice = "最新存檔損壞，已恢復上一份有效紀錄。";
    return restored!;
  }
  async load(): Promise<Run | null> {
    this.recoveryNotice = "";
    const journal = await readProfile(this.handle());
    this.profile = journal.profile;
    this.recoveryNotice = journal.notice;
    this.discovered = this.ids(await this.read("profile", "discovered"));
    this.records = parseRecords(await this.read("profile", "records"));
    const raw = await this.read("run", "latest");
    if (!raw) {
      this.revision = Number(await this.read("run", "revision")) || 0;
      this.entry = null;
      return null;
    }
    let s: Saved;
    try {
      s = validate(raw);
    } catch (error) {
      s = await this.recover(error);
    }
    this.entry = clone(s.entry);
    this.revision = s.revision;
    const owned = [
      ...Object.keys(s.current.cards),
      ...Object.keys(s.entry.cards),
    ].map(Number);
    const missing = owned.filter((id) => !this.discovered.includes(id));
    if (missing.length) await this.remember(missing);
    return clone(s.current.phase === "COMBAT" ? s.entry : s.current);
  }
  private async remember(ids: number[]) {
    let result: number[] = [];
    await new Promise<void>((resolve, reject) => {
      const tx = this.handle().transaction("profile", "readwrite"),
        s = tx.objectStore("profile"),
        q = s.get("discovered");
      q.onsuccess = () => {
        try {
          result = this.ids([...this.ids(q.result), ...ids]);
          s.put(result, "discovered");
        } catch {
          tx.abort();
        }
      };
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(new Error("無法保存旅人圖鑑，原始資料保留。"));
      tx.onerror = tx.onabort;
    });
    this.discovered = result;
  }
  async save(r: Run, entry = false, imported?: Saved) {
    const nextEntry = clone(entry || !this.entry ? r : this.entry);
    let nextRevision = this.revision,
      known: number[] = [],
      nextProfile: Profile = this.profile,
      nextRecords = this.records;
    await this.write((tx, prior, rev) => {
      nextRevision = rev + 1;
      const snapshot: Saved = {
        version: 1,
        revision: nextRevision,
        current: clone(r),
        entry: nextEntry,
      };
      snapshot.current.revision = snapshot.entry.revision = nextRevision;
      const s = tx.objectStore("run");
      if (prior) s.put(prior, "previous");
      s.put(snapshot, "latest");
      s.put(nextRevision, "revision");
      const p = tx.objectStore("profile"),
        q = p.get("discovered");
      q.onsuccess = () => {
        try {
          known = this.ids([
            ...this.ids(q.result),
            ...Object.keys(r.cards).map(Number),
            ...(imported?.discovered ?? []),
          ]);
          p.put(known, "discovered");
        } catch {
          tx.abort();
          return;
        }
        const journal = p.get("journal");
        journal.onsuccess = () => {
          try {
            const old = parseProfile(journal.result);
            nextProfile = updateProfile(
              imported?.profile ? mergeProfiles(old, imported.profile) : old,
              r,
              known,
            );
            p.put(old, "journalPrevious");
            p.put(nextProfile, "journal");
          } catch {
            tx.abort();
          }
        };
        if (imported?.records) {
          const history = p.get("records");
          history.onsuccess = () => {
            try {
              const old = parseRecords(history.result);
              nextRecords = mergeRecords(old, imported.records!);
              p.put(old, "recordsPrevious");
              p.put(nextRecords, "records");
            } catch {
              tx.abort();
            }
          };
        }
      };
    }, !!imported);
    this.revision = nextRevision;
    r.revision = nextRevision;
    this.entry = nextEntry;
    this.discovered = known;
    this.profile = nextProfile;
    this.records = nextRecords;
  }
  async clear(r?: Run) {
    let nextRevision = this.revision,
      known = this.discovered,
      nextProfile = this.profile,
      nextRecords = this.records;
    await this.write((tx, _prior, rev) => {
      nextRevision = rev + 1;
      const s = tx.objectStore("run");
      s.delete("latest");
      s.delete("previous");
      s.put(nextRevision, "revision");
      if (r) {
        const p = tx.objectStore("profile"),
          q = p.get("discovered");
        q.onsuccess = () => {
          try {
            known = this.ids([
              ...this.ids(q.result),
              ...Object.keys(r.cards).map(Number),
            ]);
            p.put(known, "discovered");
          } catch {
            tx.abort();
            return;
          }
          const j = p.get("journal");
          j.onsuccess = () => {
            try {
              const old = parseProfile(j.result);
              nextProfile = updateProfile(old, r, known);
              p.put(old, "journalPrevious");
              p.put(nextProfile, "journal");
            } catch {
              tx.abort();
            }
          };
          const history = p.get("records");
          history.onsuccess = () => {
            try {
              const old = parseRecords(history.result);
              nextRecords = mergeRecords(old, [
                {
                  classId: r.classId,
                  level: r.level,
                  time: r.time,
                  seed: r.seed,
                  finished: r.phase === "RUN_END",
                  loop: r.loop ?? 1,
                  room: r.room,
                  score: r.score,
                  testing: (r as Run & { testing?: boolean }).testing ?? false,
                },
              ]);
              p.put(old, "recordsPrevious");
              p.put(nextRecords, "records");
            } catch {
              tx.abort();
            }
          };
        };
      }
    });
    this.revision = nextRevision;
    this.entry = null;
    this.discovered = known;
    this.profile = nextProfile;
    this.records = nextRecords;
  }
  export(r: Run) {
    return JSON.stringify(
      {
        version: 1,
        revision: this.revision,
        current: r,
        entry: this.entry ?? r,
        discovered: this.discovered,
        profile: this.profile,
        records: this.records,
      },
      null,
      2,
    );
  }
  async import(text: string) {
    if (text.length > 5_000_000) throw new Error("存檔檔案過大");
    const imported = validate(JSON.parse(text));
    const oldEntry = this.entry;
    this.entry = imported.entry;
    try {
      await this.save(imported.current, false, imported);
    } catch (error) {
      this.entry = oldEntry;
      throw error;
    }
    return this.load();
  }
  async preference(value: { cosmetic?: CosmeticId; tutorialSeen?: boolean }) {
    this.profile = await setProfilePreference(this.handle(), value);
  }
  exportProfile() {
    return JSON.stringify(
      {
        kind: "solaria-profile",
        version: 1,
        profile: this.profile,
        discovered: this.discovered,
        records: this.records,
      },
      null,
      2,
    );
  }
  async exportRaw() {
    const archive: Record<string, unknown> = {
      kind: "solaria-recovery",
      version: 1,
    };
    for (const key of ["latest", "previous", "damaged", "revision"])
      archive[key] = await this.read("run", key);
    for (const key of [
      "discovered",
      "journal",
      "journalPrevious",
      "journalDamaged",
      "records",
    ])
      archive[key] = await this.read("profile", key);
    return JSON.stringify(archive, null, 2);
  }
}
