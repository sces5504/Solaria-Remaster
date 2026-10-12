# 逐 Boss 能力與驗證矩陣

18地形王＋2事件王＋索拉里斯。每王列出實際攻擊ID；資料覆蓋不能代替逐幀美術或人工平衡。

| ID  | 領主         | 專屬布局            | 第一階段三招                                                                     | 第二階段三招                                                                      | 回歸入口                             |
| --- | ------------ | ------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | 狼王         | 六草原程序王房      | wolf-lunge、wolf-claw-wave、wolf-hunt                                            | wolf-triple-lunge、wolf-spiral、wolf-pack                                         | core.test.ts／startup.spec.ts        |
| 2   | 山羊王       | 六草原程序王房      | goat-charge、goat-horn-ring、goat-mines                                          | goat-chain-charge、goat-cross-laser、goat-salvo                                   | core.test.ts／startup.spec.ts        |
| 3   | 金字塔神     | rays／desert        | 旋轉雷射（pyramid-rotate）、分層環彈（pyramid-rings）、太陽烙印（pyramid-brand） | 多向雷射（pyramid-rays）、地面爆破（pyramid-blast）、砂紋雷陣（pyramid-mines）    | biomes.test.ts／biome-bosses.spec.ts |
| 4   | 沙塵暴刺客   | lanes／desert       | 突進（assassin-dash）、弧刃（assassin-blades）、沙刃陷阱（assassin-trap）        | 換位（assassin-swap）、移動沙塵（assassin-dust）、交錯飛刃（assassin-cross）      | biomes.test.ts／biome-bosses.spec.ts |
| 5   | 冰龍         | arcs／icefield      | 冰息（dragon-breath）、冰矛散射（dragon-spears）、冰隕落擊（dragon-fall）        | 冰風暴（dragon-blizzard）、俯衝（dragon-dive）、環形冰彈（dragon-ring）           | biomes.test.ts／biome-bosses.spec.ts |
| 6   | 冰川巨魔     | islands／icefield   | 砸地（troll-slam）、冰塊（troll-block）、碎冰扇射（troll-shards）                | 躍擊（troll-leap）、冰刺（troll-spikes）、冰脊雷陣（troll-mines）                 | biomes.test.ts／biome-bosses.spec.ts |
| 7   | 火山熔爐怪   | rays／volcano       | 火彈（furnace-balls）、熱孔（furnace-vents）、熔渣地雷（furnace-mines）          | 雷射（furnace-ray）、熔渣怪（furnace-slags）、錯位火環（furnace-rings）           | biomes.test.ts／biome-bosses.spec.ts |
| 8   | 火炎獸       | lanes／volcano      | 火路衝撞（beast-firepath）、火球（beast-fireball）、甩尾（beast-tail）           | 躍擊（beast-leap）、擴散火環（beast-ring）、熔火落爆（beast-rain）                | biomes.test.ts／biome-bosses.spec.ts |
| 9   | 食人花怪     | groves／jungle      | 藤鞭（flower-vine）、種子彈（flower-seeds）、小怪花（flower-minions）            | 花頭齊射（flower-heads）、種子波（flower-wave）、交錯藤鞭（flower-lashes）        | biomes.test.ts／biome-bosses.spec.ts |
| 10  | 邪惡巫醫     | groves／jungle      | 咒彈（witch-bolts）、靈體（witch-spirits）、靈咒落雷（witch-thunder）            | 符文（witch-runes）、回血圖騰（witch-totem）、旋轉咒彈（witch-spiral）            | biomes.test.ts／biome-bosses.spec.ts |
| 11  | 虛空蠕蟲     | islands／corruption | 破土（worm-burrow）、腐蝕散射（worm-acid）、裂口地雷（worm-mines）               | 連續破土（worm-double）、裂隙彈（worm-rifts）、交叉虛空束（worm-rays）            | biomes.test.ts／biome-bosses.spec.ts |
| 12  | 眼球怪       | arcs／corruption    | 衝刺（eye-charge）、三路眼波（eye-waves）、凝視爆點（eye-gaze）                  | 雙體衝刺（eye-double）、互補彈幕（eye-complement）、輪替光束（eye-beams）         | biomes.test.ts／biome-bosses.spec.ts |
| 13  | 血腥浮空腦袋 | rays／crimson       | 血彈（brain-blood）、血針（brain-needles）、腦電落擊（brain-storm）              | 瞬移（brain-shift）、菱形針陣（brain-diamond）、血脈雷網（brain-network）         | biomes.test.ts／biome-bosses.spec.ts |
| 14  | 德古拉血魔   | lanes／crimson      | 吸血撲擊（dracula-lunge）、血刃（dracula-blades）、暗紅地雷（dracula-mines）     | 血蝠（dracula-bats）、回血血球（dracula-orbs）、血月光束（dracula-moon）          | biomes.test.ts／biome-bosses.spec.ts |
| 15  | 異星女王     | rays／stars         | 螺旋彈（queen-spiral）、瞄準雷射（queen-aim）、繁星落擊（queen-stars）           | 錯位雷射（queen-shifted）、幼體（queen-larvae）、交叉彈幕（queen-cross）          | biomes.test.ts／biome-bosses.spec.ts |
| 16  | 異星鯨魚     | arcs／stars         | 游弋撞擊（whale-ram）、星浪（whale-wave）、尾鰭橫掃（whale-tail）                | 掃射雷射（whale-sweep）、旋流彈（whale-vortex）、躍擊（whale-leap）               | biomes.test.ts／biome-bosses.spec.ts |
| 17  | 白骨攝政王   | columns／castle     | 橫掃（regent-sweep）、骨矛（regent-spear）、骷髏（regent-skeletons）             | 骨環（regent-ring）、突進斬（regent-charge）、重擊掩體（regent-heavy）            | biomes.test.ts／biome-bosses.spec.ts |
| 18  | 蝕星大法師   | columns／castle     | 錯角環彈（archmage-rings）、三束雷射（archmage-rays）、侍從（archmage-servants） | 星形彈（archmage-star）、符文爆破（archmage-runes）、落星（archmage-meteors）     | biomes.test.ts／biome-bosses.spec.ts |
| 20  | 霜鈴老人     | lanes／icefield     | 禮盒扇射（santa-gifts）、冰鈴落點（santa-bell）、滑行撞擊（santa-slide）         | 雙旋禮盒（santa-spiral）、追蹤冰鈴（santa-tracking）、交錯鈴光（santa-lasers）    | events.test.ts／events.spec.ts       |
| 21  | 南瓜災主     | groves／corruption  | 鬼火環（pumpkin-ring）、藤蔓砸地（pumpkin-vine）、南瓜地雷（pumpkin-mines）      | 錯位鬼火（pumpkin-spiral）、鬼燈雷射（pumpkin-lantern）、躍地爆破（pumpkin-leap） | events.test.ts／events.spec.ts       |

索拉里斯三條血：18,000／22,000／28,000×1.6^(周目−1)。

- 第1血：日輪突進（solaris-rush）、天日躍擊（solaris-leap）、日焰（solaris-flare）。
- 第2血：雙重日輪（solaris-spiral）、錯位日環（solaris-shifted-ring）、交叉星芒（solaris-cross）。
- 第3血：日冕雷射（solaris-rays）、群星墜落（solaris-falling-stars）、終日突進（solaris-final-rush）。

首血後四1500生命封印柱；12彈每2秒，保留旋轉60°缺口（本次使用者明示特殊例外）。三血／封印／字幕／周目核心：journey.test.ts、solaris.spec.ts。王房 seed 變體中央通路／四柱位置：solar-arena.test.ts。

彈體boss-projectiles、斬击boss-actions、落擊enemy-impact及事件event-effects；雷射boss-beams已接入正式Stage。各王兩階段招式啟動紀錄由核心自動驗證，不能標示所有短暫FX皆已逐幀人工目檢。真GPU60FPS、人工1／2／5／10周目構築平衡、Firefox／Safari仍NOT_RUN。

## 1.2.0 編排更新

全部21王差異表與實際参数見../gameplay-1.2.0/README.md。現有attackId與兩階段三招保留；新幾何／時序與召喚／舊檔／格擋用boss-rework.test.ts及boss-rework.spec.ts。資料表不是自然平衡或逐幀人工PASS。
