import type { Item, Slot } from "../core/types";
import { random } from "../core/primitives";
export const equipmentCatalog = {
  molten: {
    name: "熔光外骨骼",
    slot: "armor",
    rarity: "橘",
    description: "施放職技獲得三秒、最大生命10%的盾。",
  },
  meteorArmor: {
    name: "隕石甲",
    slot: "armor",
    rarity: "橘",
    description: "站定一秒護甲+35；移動0.4秒後解除。",
  },
  voidCloth: {
    name: "虛空布甲",
    slot: "armor",
    rarity: "橘",
    description: "受傷後一秒疾行，三秒可觸發一次。",
  },
  moonString: {
    name: "月弦戒",
    slot: "ring",
    rarity: "橘",
    description: "每四次原始普攻追加爆裂，傷害20。",
  },
  riftRing: {
    name: "裂隙指環",
    slot: "ring",
    rarity: "橘",
    description: "對精英與領主的一般傷害+25%。",
  },
  starFlow: {
    name: "星流環",
    slot: "ring",
    rarity: "橘",
    description: "每三次原始普攻追加星刃，傷害30。",
  },
  thunderBox: {
    name: "雷電匣",
    slot: "amulet",
    rarity: "橘",
    description: "每三次職技發出電光追加，每0.2秒傷20。",
  },
  starSeeker: {
    name: "覓星墜飾",
    slot: "amulet",
    rarity: "橘",
    description: "精英裝備掉落機率由30%提升至40%。",
  },
  starArmor: {
    name: "星骸戰鎧",
    slot: "armor",
    rarity: "紅",
    description: "護盾破裂時爆裂，半徑100、傷60；每五秒一次。",
  },
  timeRing: {
    name: "時序斷環",
    slot: "ring",
    rarity: "紅",
    description: "每六次原始普攻，使下一次職技傷害+80%；只儲存一次。",
  },
  starSeal: {
    name: "星裂聖印",
    slot: "amulet",
    rarity: "紅",
    description: "同敵六次普攻命中，追加半徑100、傷80的爆裂。",
  },
  frostBell: {
    name: "霜鈴災厄",
    slot: "amulet",
    rarity: "紅",
    event: "christmas",
    description: "基礎暴擊率25%；冰矛封印。暴擊追加禮物爆裂，半徑72、傷40。",
  },
  redMoon: {
    name: "赤月夜契",
    slot: "amulet",
    rarity: "紅",
    event: "bloodmoon",
    description:
      "每次普攻命中累積10流血；達門檻爆發生命比例傷害。門檻逐次增加。",
  },
  ghostArmor: {
    name: "寂夜鬼甲",
    slot: "armor",
    rarity: "紅",
    event: "halloween",
    description:
      "召出一位南瓜夥伴：固定250生命、沿用護甲。倒地十秒或清關復甦。",
  },
  gravity: {
    name: "引力母核",
    slot: "ring",
    rarity: "紅",
    event: "alien",
    description: "原始擊殺留下兩秒引力場，吸引普通敵人；每三秒一次。",
  },
  fallingStar: {
    name: "隕落星核",
    slot: "amulet",
    rarity: "紅",
    event: "meteor",
    description: "每三秒預告落星，0.6秒後半徑96、傷90。觸發普攻命中效果。",
  },
  legion: {
    name: "軍團號令",
    slot: "ring",
    rarity: "紅",
    event: "army",
    description: "職技後三秒，原始普攻追加兩片幻影刃，各傷20。",
  },
} as const;
export type EquipmentAbility = keyof typeof equipmentCatalog;
export type SpecialItem = Item & { ability: EquipmentAbility; name: string };
export function hasEquipment(
  r: { equipment: Partial<Record<Slot, Item>> },
  ability: EquipmentAbility,
) {
  return Object.values(r.equipment).some(
    (item) => (item as SpecialItem | undefined)?.ability === ability,
  );
}
export function specialTemplates(
  slot: Slot,
  rarity: "橘" | "紅",
  event?: string,
) {
  return (Object.keys(equipmentCatalog) as EquipmentAbility[]).filter((key) => {
    const item = equipmentCatalog[key];
    return (
      item.slot === slot &&
      item.rarity === rarity &&
      ("event" in item ? item.event === event : event === undefined)
    );
  });
}
export function specialEquipment(
  state: { rng: number },
  slot: Slot,
  rarity: "橘" | "紅",
  base: Item,
  event?: string,
): SpecialItem | null {
  const candidates = specialTemplates(slot, rarity, event);
  if (!candidates.length) return null;
  const ability = candidates[Math.floor(random(state) * candidates.length)];
  return {
    ...base,
    slot,
    rarity,
    ability,
    name: equipmentCatalog[ability].name,
  };
}
