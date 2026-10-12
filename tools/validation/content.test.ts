import { it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { biomes, monsters } from "../../src/game/data/biomes";
import { bosses } from "../../src/game/data/bosses";
import { eventBosses } from "../../src/game/data/event-content";
import { solarisAttacks } from "../../src/game/systems/solaris";
it("產生九地形與逐王能力覆蓋索引，保留人工與GPU未測狀態", () => {
  expect(Object.keys(biomes)).toHaveLength(9);
  expect(Object.keys(monsters)).toHaveLength(24);
  const meadow = [
    "",
    "狼狗",
    "史萊姆",
    "持刀哥布林",
    "持弓哥布林",
    "持杖哥布林",
  ];
  let terrain =
    "# 九地形逐項覆蓋矩陣\n\n本表索引正式資料與能力執行回歸，人工平衡／真GPU效能 NOT_RUN，完整v1驗收仍以V1_ACCEPTANCE為準。\n\n| 地形 | 普通敵人 | 六程序主題 | 機關 | 領主 |\n| --- | --- | --- | --- | --- |\n";
  for (const [id, b] of Object.entries(biomes)) {
    expect(b.themes).toHaveLength(6);
    const lords =
      id === "meadow"
        ? "狼王、山羊王"
        : Object.values(bosses)
            .filter((d) => d.biome === id)
            .map((d) => d.name)
            .join("、");
    terrain += `| ${b.name} | ${b.monsters.map((m) => `#${m} ${monsters[m]?.name ?? meadow[m]}`).join("、")} | ${b.themes.join("、")} | ${b.hazard ?? "無"} | ${lords} |\n`;
  }
  terrain +=
    "\n普通詞條與獨立精英能力：hazards.ts、enemies.ts、monster-details.ts；連通／合法出生960seed、24新增敵人原生預警與招式：biomes.test.ts；既有5草原敵人：core.test.ts。各地形WebGL：biomes.spec.ts。事件替換保留原地形難度，詳EVENT_MATRIX。\n";
  writeFileSync("docs/validation/TERRAIN_MATRIX.md", terrain);
  let body =
    "# 逐 Boss 能力與驗證矩陣\n\n18地形王＋2事件王＋索拉里斯。每王列出實際攻擊ID；資料覆蓋不能代替逐幀美術或人工平衡。\n\n| ID | 領主 | 專屬布局 | 第一階段三招 | 第二階段三招 | 回歸入口 |\n| --- | --- | --- | --- | --- | --- |\n";
  body +=
    "| 1 | 狼王 | 六草原程序王房 | wolf-lunge、wolf-claw-wave、wolf-hunt | wolf-triple-lunge、wolf-spiral、wolf-pack | core.test.ts／startup.spec.ts |\n| 2 | 山羊王 | 六草原程序王房 | goat-charge、goat-horn-ring、goat-mines | goat-chain-charge、goat-cross-laser、goat-salvo | core.test.ts／startup.spec.ts |\n";
  for (const b of Object.values({ ...bosses, ...eventBosses }).sort(
    (a, b) => a.id - b.id,
  )) {
    for (const attacks of b.attacks) {
      expect(attacks).toHaveLength(3);
      expect(new Set(attacks.map((a) => a.id)).size).toBe(3);
    }
    body += `| ${b.id} | ${b.name} | ${b.layout}／${b.biome} | ${b.attacks[0].map((a) => `${a.name}（${a.id}）`).join("、")} | ${b.attacks[1].map((a) => `${a.name}（${a.id}）`).join("、")} | ${b.id < 20 ? "biomes.test.ts／biome-bosses.spec.ts" : "events.test.ts／events.spec.ts"} |\n`;
  }
  body += "\n索拉里斯三條血：18,000／22,000／28,000×1.6^(周目−1)。\n\n";
  for (const [i, phase] of solarisAttacks.entries())
    body += `- 第${i + 1}血：${phase.map((a) => `${a.name}（${a.id}）`).join("、")}。\n`;
  body +=
    "\n首血後四1500生命封印柱；12彈每2秒，保留旋轉60°缺口（本次使用者明示特殊例外）。三血／封印／字幕／周目核心：journey.test.ts、solaris.spec.ts。王房 seed 變體中央通路／四柱位置：solar-arena.test.ts。\n\n彈體boss-projectiles、斬击boss-actions、落擊enemy-impact及事件event-effects；雷射boss-beams已接入正式Stage。各王兩階段招式啟動紀錄由核心自動驗證，不能標示所有短暫FX皆已逐幀人工目檢。真GPU60FPS、人工1／2／5／10周目構築平衡、Firefox／Safari仍NOT_RUN。\n";
  writeFileSync("docs/validation/BOSS_MATRIX.md", body);
});
