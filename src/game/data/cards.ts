import type { Run } from "../core/types";
export const cards = [
  {
    id: 1,
    name: "體魄",
    rarity: "藍",
    description: "生命基準+10%",
    classId: null,
  },
  {
    id: 2,
    name: "堅甲",
    rarity: "藍",
    description: "護甲+8",
    classId: null,
  },
  {
    id: 3,
    name: "銳鋒",
    rarity: "藍",
    description: "普攻傷+10%",
    classId: null,
  },
  {
    id: 4,
    name: "秘藝",
    rarity: "藍",
    description: "技能傷+10%",
    classId: null,
  },
  {
    id: 5,
    name: "迅擊",
    rarity: "藍",
    description: "攻速強度+.12",
    classId: null,
  },
  {
    id: 6,
    name: "靈步",
    rarity: "藍",
    description: "移速強度+.05",
    classId: null,
  },
  {
    id: 7,
    name: "破風",
    rarity: "藍",
    description: "投射速度+10%",
    classId: null,
  },
  {
    id: 8,
    name: "求知",
    rarity: "藍",
    description: "經驗+8%",
    classId: null,
  },
  {
    id: 9,
    name: "調律",
    rarity: "紫",
    description: "冷卻效率+.10",
    classId: null,
  },
  {
    id: 10,
    name: "精準",
    rarity: "紫",
    description: "暴擊相對加成+20%",
    classId: null,
  },
  {
    id: 11,
    name: "殘忍",
    rarity: "紫",
    description: "暴擊倍率+.15",
    classId: null,
  },
  {
    id: 12,
    name: "元素親和",
    rarity: "紫",
    description: "元素傷+18%，需至少一覺醒",
    classId: null,
  },
  {
    id: 13,
    name: "廣域",
    rarity: "黃",
    description: "攻擊半徑／寬度+10%，不增數量／時間",
    classId: null,
  },
  {
    id: 14,
    name: "戰意",
    rarity: "黃",
    description: "全域傷+8%，不放大生命百分比",
    classId: null,
  },
  {
    id: 15,
    name: "冰覺醒",
    rarity: "青",
    description: "第5節冰霜基本效果",
    classId: null,
  },
  {
    id: 16,
    name: "冰矛",
    rarity: "青",
    description:
      "每3次普攻施放射一發傷30／速650／距650，穿透敵人但被實體擋；合格暴擊朝被暴擊目標各射一發；自身不暴擊",
    classId: null,
  },
  {
    id: 17,
    name: "冰雹",
    rarity: "青",
    description: "右鍵，落點半徑100、4秒、每.5秒傷12並累積冰霜",
    classId: null,
  },
  {
    id: 18,
    name: "永凍領域",
    rarity: "青",
    description: "右鍵，自身半徑100、4秒、每.5秒傷10／冰霜30",
    classId: null,
  },
  {
    id: 19,
    name: "火覺醒",
    rarity: "青",
    description: "3秒、每秒8燃燒；刷新不疊",
    classId: null,
  },
  {
    id: 20,
    name: "炎龍噴射",
    rarity: "青",
    description:
      "隨普攻觸發、自身間隔4秒；2秒扇形噴火、半徑160／角80度、每.25秒傷8；週期打擊可暴擊，燃燒不可",
    classId: null,
  },
  {
    id: 21,
    name: "火鳳凰",
    rarity: "青",
    description:
      "右鍵，速450／距650／沿路火徑3秒；撞物爆炸半徑100、首擊40／爆60，火徑為獨立週期每.5秒6",
    classId: null,
  },
  {
    id: 22,
    name: "火焰之環",
    rarity: "青",
    description: "右鍵，自身半徑110／4秒／每.5秒傷14",
    classId: null,
  },
  {
    id: 23,
    name: "燼火引爆",
    rarity: "青",
    description:
      "合格火直接打擊每次1層、5層消耗爆炸傷40／半徑70；不自行加層，可一層追加；燃燒結束清剩層",
    classId: null,
  },
  {
    id: 24,
    name: "水覺醒",
    rarity: "青",
    description: "潮濕3秒、冰電傷+25%",
    classId: null,
  },
  {
    id: 25,
    name: "泡沫",
    rarity: "青",
    description: "隨普攻、自身間隔1.2秒、傷18／速450／距550",
    classId: null,
  },
  {
    id: 26,
    name: "漩渦",
    rarity: "青",
    description: "右鍵、落點半徑110／4秒／每.5秒傷10／拉普通怪，Boss不位移",
    classId: null,
  },
  {
    id: 27,
    name: "水盾",
    rarity: "青",
    description: "常駐一般減傷8%，不等於可消耗護盾；與同類減傷加算且另有上限",
    classId: null,
  },
  {
    id: 28,
    name: "電覺醒",
    rarity: "青",
    description: "基本追加6、15%暈小怪.4秒，追加不再自觸發",
    classId: null,
  },
  {
    id: 29,
    name: "連鎖閃電",
    rarity: "青",
    description:
      "合格原始傷害觸發一次傷18，最多3個不同目標、相鄰基距180×範圍；連線受實體阻擋、不能回跳，不暴擊、不自連",
    classId: null,
  },
  {
    id: 30,
    name: "靜電釋放",
    rarity: "青",
    description: "右鍵、自身半徑110／4秒／每.5秒傷12",
    classId: null,
  },
  {
    id: 31,
    name: "雷電彈",
    rarity: "青",
    description: "右鍵、速500／距650／首擊35，撞物爆半徑130／傷65",
    classId: null,
  },
  {
    id: 32,
    name: "蒸氣水泡",
    rarity: "青",
    description: "隨普攻、間隔1秒／速650／距650／首擊28／半徑70爆36",
    classId: null,
  },
  {
    id: 33,
    name: "蒸氣爆炸",
    rarity: "青",
    description:
      "右鍵，自身三道錯峰外擴波，半徑60／110／160，時間0／.25／.5，每波傷24；每敵每波一次",
    classId: null,
  },
  {
    id: 34,
    name: "蒸氣引擎",
    rarity: "青",
    description: "右鍵，3秒移速強度+.5、護盾最大生命20%",
    classId: null,
  },
  {
    id: 35,
    name: "導電水泡",
    rarity: "青",
    description:
      "隨普攻、間隔1秒／首擊28／速550／距650，撞物帶電水花半徑90／傷35",
    classId: null,
  },
  {
    id: 36,
    name: "雷暴渦井",
    rarity: "青",
    description: "右鍵、半徑130／4秒／每.5秒18，拖拽普通怪，附水電",
    classId: null,
  },
  {
    id: 37,
    name: "潮汐電容",
    rarity: "青",
    description:
      "普攻施放每次1層、最多5，職技消耗發自身半徑130脈衝，每層12；追加，不續觸發",
    classId: null,
  },
  {
    id: 38,
    name: "霜焰雙星",
    rarity: "青",
    description: "隨普攻、間隔1.2秒、兩彈各25／速550／距650，交錯飛行分別冰火",
    classId: null,
  },
  {
    id: 39,
    name: "冰火裂域",
    rarity: "青",
    description: "右鍵、落點首爆50／半徑130，4秒每.5秒16，冰火／快速冰霜30",
    classId: null,
  },
  {
    id: 40,
    name: "熱冷共振",
    rarity: "青",
    description:
      "同時燃燒＋冰霜／冰凍目標，最多12最近目標獨立計時，1秒÷攻速倍率、最低.2秒；各交替火冰彈24／速600／距450，不儲存補射；獨立週期可暴擊，其後追加不連鎖",
    classId: null,
  },
  {
    id: 41,
    name: "橫掃",
    rarity: "藍",
    description: "普攻角120→125→130→135→140度，強化普攻",
    classId: "sword",
  },
  {
    id: 42,
    name: "貼身壓制",
    rarity: "藍",
    description: "距45內普攻+30%條件增傷；重複升級增此條件輸出，距離不放大",
    classId: "sword",
  },
  {
    id: 43,
    name: "裂空劍氣",
    rarity: "紫",
    description:
      "Lv1–2每3次、Lv3–4每2次、Lv5每次普攻；劍氣基準30／速600／距600，純追加不暴擊",
    classId: "sword",
  },
  {
    id: 44,
    name: "反擊擴刃",
    rarity: "紫",
    description: "反擊角220→230→240→250→260度，同時每級增加反擊基準傷20%",
    classId: "sword",
  },
  {
    id: 45,
    name: "完美反擊",
    rarity: "黃",
    description: "反擊必定暴擊，升級增加反擊傷，不再提高暴擊機率",
    classId: "sword",
  },
  {
    id: 46,
    name: "守勢回流",
    rarity: "黃",
    description: "反擊命中3秒盾；盾15→17→19→21→23%最大生命，升級也強化反擊",
    classId: "sword",
  },
  {
    id: 47,
    name: "衝鋒斬",
    rarity: "紫",
    description:
      "閃避沿路斬擊，基準40，每次每敵一次；沿用閃避受傷／穿越規則，不給無敵；升級提高傷害",
    classId: "sword",
  },
  {
    id: 48,
    name: "獵首",
    rarity: "藍",
    description: "對滿生命目標普攻條件增傷40%，升級增加此條件傷害",
    classId: "bow",
  },
  {
    id: 49,
    name: "連射專注",
    rarity: "藍",
    description:
      "同一目標第三次普攻命中+60%，每次施放對同敵只計1；轉換目標不改其他敵的已記錄命中，每敵計數",
    classId: "bow",
  },
  {
    id: 50,
    name: "分裂箭",
    rarity: "紫",
    description:
      "Lv1–2主1＋副2、副鏈倍率.20；Lv3–4主1＋副3、.175；Lv5主1＋副4、.15；主箭倍率1。副箭及所有後續傷害只套一次源倍率，不能連鎖後變回滿傷",
    classId: "bow",
  },
  {
    id: 51,
    name: "穿透箭",
    rarity: "紫",
    description: "最多命中3→3→4→4→5個不同敵人，牆與實體仍擋",
    classId: "bow",
  },
  {
    id: 52,
    name: "箭雨疾射",
    rarity: "黃",
    description:
      "快射8→8→9→9→10箭，一秒內均勻射；每箭為獨立普攻，元素右鍵整次一次",
    classId: "bow",
  },
  {
    id: 53,
    name: "疾風追擊",
    rarity: "黃",
    description:
      "快射完3秒攻速強度+.30→.35→.40→.45→.50；升級也增強buff期間普攻傷",
    classId: "bow",
  },
  {
    id: 54,
    name: "雙星法杖",
    rarity: "藍",
    description:
      "主彈＋1副彈；副40→45→50→55→60%主基準，同次施放計1，副為原普攻投射",
    classId: "mage",
  },
  {
    id: 55,
    name: "遠距聚焦",
    rarity: "藍",
    description: "距至少300普攻+40%，升級增此條件傷，不拉遠條件",
    classId: "mage",
  },
  {
    id: 56,
    name: "爆裂魔彈",
    rarity: "紫",
    description: "基準追加12，半徑48→52→56→60→64，不暴擊、不續觸發",
    classId: "mage",
  },
  {
    id: 57,
    name: "折射魔彈",
    rarity: "紫",
    description:
      "原普攻命中後彈射至不同敵2→2→3→3→4次，每次前次70%，可暴擊與普攻命中效果；不增加施放計數，不穿實體",
    classId: "mage",
  },
  {
    id: 58,
    name: "行星回響",
    rarity: "黃",
    description: ".6秒後追加爆炸為原基準50→55→60→65→70%，追加不暴擊、不續觸發",
    classId: "mage",
  },
  {
    id: 59,
    name: "星環法陣",
    rarity: "黃",
    description:
      "職技後3秒自身半徑90，每秒純技能傷20；升級增傷／半徑每級+5，不附普攻效果，週期可暴擊",
    classId: "mage",
  },
] as const;
export type Card = (typeof cards)[number];
export const cardLevel = (r: Run, id: number) => r.cards[id] || 0;
export function skillFactor(level: number, increment = 0.2) {
  let add = 0;
  for (let i = 2; i <= level; i++) add += increment / Math.ceil(i / 5);
  return 1 + add;
}
export function eligible(r: Run, c: Card) {
  const l = cardLevel(r, c.id);
  if (c.classId && c.classId !== r.classId) return false;
  if (c.id <= 14) return c.id !== 12 || r.elements.length > 0;
  if ([15, 19, 24, 28].includes(c.id)) return !l && r.elements.length < 2;
  if (l >= 5) return false;
  if (c.id < 19) return r.elements.includes("ice");
  if (c.id < 24) return r.elements.includes("fire");
  if (c.id < 28) return r.elements.includes("water");
  if (c.id < 32) return r.elements.includes("lightning");
  if (c.id <= 34) return r.fusion === "steam";
  if (c.id <= 37) return r.fusion === "storm";
  if (c.id <= 40) return r.fusion === "frostfire";
  return true;
}
