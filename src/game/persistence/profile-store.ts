import {
  parseProfile,
  type Profile,
  type CosmeticId,
  cosmetics,
} from "./profile";

export function readPermanent<T>(
  db: IDBDatabase,
  key: string,
  parse: (value: unknown) => T,
): Promise<{ value: T; notice: string }> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("profile", "readwrite"),
      store = tx.objectStore("profile");
    let value: T,
      notice = "",
      failure: unknown;
    const latest = store.get(key);
    latest.onsuccess = () => {
      try {
        value = parse(latest.result);
      } catch (error) {
        failure = error;
        const previous = store.get(`${key}Previous`);
        previous.onsuccess = () => {
          try {
            if (previous.result === undefined) throw failure;
            value = parse(previous.result);
            store.put(latest.result, `${key}Damaged`);
            store.put(value, key);
            notice = "旅人紀錄損壞，已恢復上一份有效星典。";
          } catch (e) {
            failure = e;
            tx.abort();
          }
        };
      }
    };
    tx.oncomplete = () => resolve({ value, notice });
    tx.onabort = () =>
      reject(failure ?? new Error("無法讀取星典，原始紀錄仍保留。"));
    tx.onerror = () => reject(new Error("無法讀取星典，原始紀錄仍保留。"));
  });
}
export async function readProfile(db: IDBDatabase) {
  const result = await readPermanent(db, "journal", parseProfile);
  return { profile: result.value, notice: result.notice };
}
export function setProfilePreference(
  db: IDBDatabase,
  preference: { cosmetic?: CosmeticId; tutorialSeen?: boolean },
): Promise<Profile> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("profile", "readwrite"),
      s = tx.objectStore("profile"),
      q = s.get("journal");
    let next: Profile, failure: unknown;
    q.onsuccess = () => {
      try {
        const prior = parseProfile(q.result);
        next = { ...prior };
        if (preference.cosmetic !== undefined) {
          const skin = cosmetics[preference.cosmetic];
          if (
            !skin ||
            (skin.requirement && !prior.achievements.includes(skin.requirement))
          )
            throw new Error("這份光色尚未收錄。 ");
          next.cosmetic = preference.cosmetic;
        }
        if (preference.tutorialSeen !== undefined)
          next.tutorialSeen = preference.tutorialSeen;
        s.put(prior, "journalPrevious");
        s.put(next, "journal");
      } catch (e) {
        failure = e;
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(next);
    tx.onabort = () => reject(failure ?? new Error("無法保存星典偏好。"));
    tx.onerror = () => reject(new Error("無法保存星典偏好。"));
  });
}
