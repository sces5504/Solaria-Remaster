# 完整 v1 驗收矩陣（進行中）

## 第四個內部檢查點：六事件接入（2026-10-11 18:36:16 UTC）

六事件實際替換普通房，三有限波／兩事件王各2×3招／專屬紅裝保證／整局一次跨周目／原地形XP與難度／無普通詞條、機關全部接入。新增追蹤冰鈴提前.4秒鎖點、真正合法躍擊、軍旗附近加速／增傷及旗倒解除、禮盒／幽魂／稜光／隕星專屬彈體與事件景物；事件保存格式驗證與同房不重抽已測。普通精英盾改在最終生命詞條後配置，恢復20%最終生命。

PASS：最新295unit（288已接入遊戲／事件回歸＋4未接入profile＋3未接入碰撞／網格工具單測），check/build/format PASS。完整62 Chromium全部PASS15.5分鐘；先前9事件案例7PASS／2FAIL的原因是測試未accept第二階段存檔覆蓋confirm，已修dialog handler，完整重跑兩王2×3招及獎勵讀檔均PASS。新增未引用S12/S13模組後build的13個JS SHA256與62測試bundle完全相同。永久log見docs/validation/results/_events_。

事件與兩王实际畫面已目檢，王招式啟動紀錄每階段3種由正式核心執行驗證；這不等同逐幀特效／人工平衡／硬體FPS驗收。docs/validation/EVENT_MATRIX.md與EQUIPMENT_MATRIX.md為逐項入口。地形王仍有部分通用彈體／斬擊待補相應招式，不能把S06/S07美術全面驗收標完成。

S12準備但尚未引用：profile/records/profile-store/run-store/checkpoint-schema、journal/room-copy、SoundController；S13準備但尚未引用：collision-time/spatial-grid、boss-projectiles。特別RunStore新revision墓碑／profile備份尚未實際替代舊Checkpoints，不能宣稱已解決清除旅程的兩分頁ABA或永久紀錄壞檔。只有前三項component單測不能替代整合驗收。

前一已保存檢查點ba94447於遠端backup/v1-progress-2026-10-11。本次檢查點來源commit以git log核對，持續同備份分支保存，不部署部分v1。正式仍53691bf/Pages，遠端implement仍9f88061。接著立即S12整合UI／教學／成就／外觀／音效／保存錯誤與遷移→S07專屬FX剩餘核對→S13平衡效能→S14完整Pages。硬體GPU60FPS／600真GPU／10restart真設備、Firefox/Safari、人工構築周目平衡NOT_RUN。

## 第三個內部檢查點：特殊裝備接入（2026-10-11 18:11 UTC）

實際接入17特殊裝備、掉落品質與周目新裝成長、南瓜夥伴吸火／碰撞／復甦／卸裝、百分比獨立來源、裝備特效及持久化。61／69／73扣盾受傷已修。71延遲副本改為保存各施放快照的隊列，短於.8秒冷卻不再覆蓋前一副本；副本不重扣代價、不改CD、不重計數。普通紅裝／橘裝已正常掉落；六事件紅裝能力可用，但保證事件取得待S11。

PASS：最新278unit、check/build/format。完整52Chromium曾全部PASS；後續每次有修改，以equipment／advanced-cards／last-polish針對回歸；最新9項全部PASS。實際WebGL場景目檢三裝備組合無資源錯誤；部分短暫特效截圖錯過有效時刻，不宣稱已完整逐特效目檢。獨立未接入events單測9項包含於278總數，不能算六事件已完成；sound-bank亦僅準備未引用。

驗收入口 docs/validation/EQUIPMENT_MATRIX.md；永久log docs/validation/results/_equipment_。正式遊戲仍53691bf，遠端實作仍9f88061；f322a36是前一已保存檢查點，新檢查點commit以git log核對，只推備份分支backup/v1-progress-2026-10-11，尚不部署部分v1。

接續：立即S11接入六事件三波／2王／專屬布局與FX／整局一次及存檔→S12教學圖鑑成就外觀音效保存错误→S13正常／強構築與效能／記憶體→S14完整Pages。人工平衡、硬體GPU60FPS、600真GPU、10restart真設備、Firefox/Safari仍NOT_RUN。本檢查點不是完整v1，也不等待階段指示。

## 第二個內部檢查點：85卡回歸（2026-10-11 17:20 UTC）

256unit PASS（248實作回歸＋8未接入裝備／南瓜模組單測），check/build/format:check PASS。48Chromium先46PASS／2測試資料FAIL，修正後融合案例PASS，賭徒案例因重載後未等遊戲畫面就按I再FAIL；加入畫面就緒等待後該案例PASS12.1秒。48個案例最後全通過，不能將首次48全過當作事實。新增未引用模組後再build，全部JS檔SHA256與完整回歸bundle相同；未在任何瀏覽器測試執行中重build。永久結果見docs/validation/results。

85卡已接入，但S09仍需裝備聯動與正常／強構築平衡。已查實新缺口：GAME_SPEC第4節將扣盾定為有效受傷，當前hurt以溢出HP>0判定61/69/73，盾全擋時不觸發；下一個裝備整合修正並加實測，不把本次綠色測試當該缺口已解決。S10/S11仍未接入遊戲，獨立裝備／南瓜測試不能替代完整戰鬥驗收。

正式Pages仍原里程碑，持續完成剩餘範圍；不等待逐階段指示。源碼備份分支不觸發部署。

## 85 卡與精準怪物行為接入（2026-10-11 17:10:38 UTC）

[程式事實] 85 張卡全部進入合格抽取池，70–85 一次性、紅卡互斥／代價／裝備限制／三元素融合選擇、雙重術式獨立副本、首段聚焦、來源吸血及封印後失效標示已接入。普通怪實際發彈數、側移、波形彈、原生＋詞條雙元素、600 全批延後與封印柱不拉扯已修，boss-telegraph／enemy-impact 分類繪製已接入。248unit PASS，check/build PASS；format:check 修正新增案例後 PASS。逐卡入口新增 docs/validation/CARD_MATRIX.md，人工逐卡／構築平衡仍 NOT_RUN。

[驗證中] 48 Chromium 正在執行，新增兩案例先因測試錯誤 FAIL：回主選單按鈕名稱誤寫、提前用尚未接入存檔格式的橘裝及徽記文案誤寫。已修案例，待完整既有回歸結束後針對兩失敗案例重跑；不重 build 改動測試中的 dist。測試 /tmp/solaria-85-browser-full.log；248unit /tmp/solaria-85-unit-final.log。未確認瀏覽器全過之前不宣稱通過。

[後續準備，尚未接入] equipment-abilities／companion 能力模組、event-content 六事件族群與兩Boss資料、create-event-atlas.py 原創13造型78影格（含禮盒、雪怪、血蝠、狂化血徒、幽魂、南瓜、外星三兵種、星塵／幼獸、霜鈴老人、南瓜災主）。不計為完整 S10/S11。血月百分比傷、南瓜吸火碰撞、卸裝、掉落品質及事件三波仍要整合。

[提交／發布] 已驗證內部檢查點 d4f54ec 在本地 implement/s00-s05；備份遠端 backup/v1-progress-2026-10-11 已推送，不觸發 Pages。正式實作遠端仍9f88061、遊戲仍53691bf。此處未發布完整v1，也未結束任務；繼續S10/S11、完整UI／音效／保存／S13／S14，勿為配合雜湊回退。實機GPU60FPS／Firefox／Safari／人工周目平衡仍NOT_RUN。

## 開發檢查點驗證收束（2026-10-11 16:27:16 UTC）

215unit、TypeScript check、build、format:check PASS。新版46Chromium：43PASS、3因舊房號断言FAIL；仅更新第1/2房總數5→31後，3失敗案例重跑PASS（38.2秒），本輪46案例最終全部通過。沒有藉重build改測試中的dist。此檢查點不是S06–S14階段完成，更不是完整v1；自然完整31房與人工／硬體平衡NOT_RUN。新增王、沙漠底圖與索拉里斯四柱實際畫面已目檢；其餘逐招專屬特效仍續作。

後续已准备但尚未接入的独立模块：advanced-cards 70–85資料、equipment十七能力模板、events六事件路由資料、monster-details精準行為、boss-telegraph／enemy-impact招式繪製、ability-policies紅卡限制與回復上限。這些不計入遊戲已實作數量（現為69卡），不宣稱特殊裝備／事件已完成。存本檢查點後繼續接入、逐項測試並完成全部範圍。

驗證入口 docs/validation/V1_ACCEPTANCE.md；永久结果 docs/validation/results。正式Pages仍旧里程碑，不将此内部检查点当正式v1发布。

> 2026-10-11 16:11 UTC 驗證更正：新增 enemyElement 的 Area 型別漏宣告使最新 build 失敗；命令未啟用 errexit 而繼續以舊 dist 跑46browser，本輪結果作廢，不是新版驗收。已停止該程序，補型別並改成前置失敗立即停；重新 check/unit/build/format/browser，最新結果見後續紀錄。較早42browser確實PASS，但不得代替新版。215unit確實PASS。

這是逐項驗收入口，尚未交付完整 v1。測試屬程式／瀏覽器事實，不代表主人已批准新美術或人工平衡。

| 範圍             | 已接入                                         | 驗收缺口                                                   |
| ---------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| 草原＋八新增地形 | 九地形、29普通怪、六主題、機關、詞條、精英能力 | 部分普通怪精準側移／正弦彈／完整專屬特效、每模板目檢       |
| 十八地形王       | 舊兩王＋新增十六王，每王2×3招、專屬布局        | 全階段招式視覺與自然戰鬥、強構築回歸                       |
| 索拉里斯         | 三血、四柱、旋轉60°封印缺口                    | 最新瀏覽器畫面、字幕／下一周目自然流程與平衡               |
| 30＋1／周目      | 六段分支、構築保留、seed與草原舊檔遷移         | 裝備成長、全部機制五級上限與邊際／敵速度控制上限           |
| 卡片             | 1–69 接入；60–69 條件與對照核心測試            | 70–85 未實作；完整85逐卡矩陣與特效                         |
| 特殊裝備         | 基本裝備保持                                   | 八橘／三普通紅／六事件紅尚未實作                           |
| 六事件           | 未實作                                         | 全部事件模板、三波、兩Boss、一次計數、奖励                 |
| UI／音效／保存   | 舊完整骨幹、坏檔previous回退                   | 教學／成就／外觀／新音效／所有錯誤與migration/revision流程 |
| 平衡／效能       | 215核心unit PASS；原基線128/17 PASS            | 人工平衡及硬體項NOT_RUN，尚未S13                           |
| Pages            | 正式舊版仍在线                                 | 本輪未部署，尚未S14                                        |

## 實際執行紀錄

- Cloud Node24 / Chromium headless：既有起點128unit、17browser PASS。
- M01 真实IndexedDB损壞回退、提示、繼續保存、profile保留与重载 PASS。
- 新地形与十六王加入，主線接入前42browser PASS；主線／69卡／索拉里斯新版46browser正在跑。
- 最新215unit PASS；TypeScript check、build PASS；format修正後PASS。
- 實機GPU60FPS、600有效彈最密場、10restart記憶體、Firefox/Safari、人工三職普通與強構築1/2/5/10周目：NOT_RUN。
