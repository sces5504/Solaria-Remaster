# New chat prompt：遊戲調整／數值／機制／Bug與整合

2026-10-12新指示：主人已選定精雕冒險像素，要求本美術chat直接更新全遊戲；三款選樣等待選定的舊狀態已取代。完整美術與渲染已接入art/style-lab／PR4，正式發布與最終checks以CURRENT_STATE最新首節及docs/art-upgrade/VALIDATION.md為準；不要恢復多人預留計畫，不把歷史演示當全遊戲新版。

請將本檔全文貼到負責遊戲調整的new chat。這是你的任務授權與上下文：

你是本專案的遊戲調整及整合窗口。接續下列已發布成果，核驗後實際處理後續使用者的數值、機制與Bug要求；可先查實已知候選與Cloud可完成的S13平衡／回歸，不能憑猜測改玩法或把未測當已完成。本轮五項已修不是讓你重做一次；先核對最新狀態，後續新回饋再具體處理。

你正在接續長期遊戲專案 **Solaria Remaster**，請從實際已發布程式與最新記憶接續，不從空骨架重做，不依賴能讀舊 Chat。

儲存庫：https://github.com/sces5504/Solaria-Remaster
整合／正式部署分支：`implement/s00-s05`。
本輪1.0.1已部署來源：`c07e63f800530264149347436f6ed73a0e22c519`；已通過326unit／81Chromium（本地與三輪CI）、正式站新局／舊檔2＋本輪4案例。文件後續HEAD依git log，遠端有更新保留，不強制退回此hash。
正式網址：https://sces5504.github.io/Solaria-Remaster/
既有 Draft PR #2：https://github.com/sces5504/Solaria-Remaster/pull/2，base `docs/solaria-cloud-spec`，main 未合併。

先檢查pwd／git status／branch／log／remote及檔案。安全fetch遠端最新實作HEAD，若有更新先核對保留；未提交工作先保護，不reset、不force push、不擅合併main。`main`／原規格分支不是遊戲起點，`9f88061`是舊交接，`53691bf`是舊第一里程碑，`cc6f32e`是1.0.0已發布版本，`5856e62`是其證據文件。**本輪1.0.1修改與部署確切hash以最新PROJECT_STATUS／CURRENT_STATE首節及GitHub Actions核對，不能回退到上述舊hash。** 新環境目錄與/tmp不同，不假設原路徑、伺服器、瀏覽器或依賴仍存在。

先讀六記憶：`docs/ai-memory/AI_HANDOFF_MASTER.md`、`CURRENT_STATE.md`、`USER_PREFERENCES.md`、`PROJECT_MEMORY.md`、`DECISION_HISTORY.md`、`DEVELOPMENT_HISTORY.md`。再完整讀根目錄AGENTS、GAME_SPEC、ARCHITECTURE、DEVELOPMENT_PLAN、DECISIONS、UI_UX_SPEC、TEST_PLAN、PROJECT_STATUS、CLOUD_START_PROMPT，尤其尾部五輪增量和2026-10-12試玩修訂。最新明示使用者要求覆蓋舊条文；玩法／數值GAME_SPEC、呈現UI_UX_SPEC、模組ARCHITECTURE。程式事實不等於使用者批准設計，歷史不足標「歷史資訊不足」，不補造。記憶早期「只備份／不啟動S06–S14／等待試玩」是歷史邊界，不阻塞當前新任務。核心矛盾才列具體來源與影響問必要問題，其他獨立工作繼續；一般數值／升級已有有證據自主調整授權，記前後與回歸。

進度：第一里程碑S00–S05及五輪修訂已被主人明示確認「第一里程碑完成，相當於遊戲的整體骨幹已經完成」。接續第二任務已把完整v1內容接入並發布，但S13硬體／人工驗收尚未全完成，不能宣稱S06–S14全項驗收完成。三職業、九地形／29普通怪／54主題程序房型、18地形Boss各兩階段三招、索拉里斯三血四柱／字幕、30＋1及周目、85卡、8橘／3普通紅／6事件紅裝、六事件及兩事件Boss、七收藏成就／三非戰力外觀、教學／圖鑑／音效、完整IndexedDB恢復／revision／錯誤流程已實際接入。逐項看`docs/validation/TERRAIN_MATRIX.md`、`BOSS_MATRIX.md`、`CARD_MATRIX.md`、`EQUIPMENT_MATRIX.md`、`EVENT_MATRIX.md`、`V1_ACCEPTANCE.md`、`RELEASE_CHECKLIST.md`。

本輪五項已查實並修：

1. 橘紅裝缺背包文字／側欄框色和特殊名稱；構築清單缺卡稀有度；圖鑑預設!important蓋色；橘紅hover光色缺變數。名稱／清單／已知整張卡與hover修正，原本已正確者保留。**圖案依能力家族配色不是Bug，不強改成稀有度色；未知卡暗且不揭名字。**
2. 魔王城「假柱」是可跨越雷射機關誤用castle-pillar貼圖；改貼地雕像印記而非新增碰撞堵路。真正樹／岩／柱仍阻擋行走及彈道。
3. 使用者新機制：所有實體掩體完整可承受Boss四次／小怪五次有效攻擊，共用20耐久、扣5／4，混合來源共享剩餘值；受傷後2秒無敵、同波同掩體最多一次；只有與玩家110×range圓相交才傷，與靜電基半徑相同，無額外加成126.5，無需持卡。遠處／無敵掩體仍擋彈，碎裂才移除；湖泊不破壞。敵彈、實際扇形斬、衝撞、落擊與雷射均接入，發射者先死不丟來源。我方與無敵人來源的地形機關不扣耐久。舊5／10／15按剩餘比例向上遷移20，碎裂保持0，保护時間与波次保留。
4. 寂夜鬼甲唯一南瓜固定250生命，三職、生命加成／周目／舊檔／清關及10秒復活一致；沿用甲、.5秒傷後保護、吸火／近戰／合格吸血、卸裝消失不改。不能恢复舊3×玩家HP。
5. Boss池不是單純運氣：原XOR/xorshift與路線相關，首周目火山9881次全熔爐、叢林10119次全巫醫，某王概率0、只有8種組合。只對Boss專流非線性混合，實際條件抽樣20,000seed×1／2／5／10周目恢復九池各50%（首周目火山50.65/49.35、叢林50.77/49.23）、512聯合組合；無保底／強制交替，已保存journey不重抽，布局與路線亂數不改。證據`docs/validation/POST_V1_FEEDBACK.md`及results／boss-pool-probe工具。

必須保留體驗：桌面單人俯視動作roguelike，PixiJS v8/WebGL、TypeScript/Vite、Node24及鎖定檔；獨立60Hz，input/state/render分離、可序列化與穩定ID，主人已取消未來多人連線／合作計畫，不再為連線新增預留層；單人输入／state／render與存檔邊界維持。WASD，左鍵持續普攻與右鍵職技同時可用，Space閃避、E戰鬥拾裝／清關進門；清關後仍可攻擊，換裝限制照最新規格。遊戲內只有一把瞄準武器，選角肖像持械；全房8:5適合瀏覽器高度不用捲輪，保留分數／屬性／裝備HUD、主畫面與有質感暫停。繁中、短且貼世界觀，不把開發術語放玩家流程。每組三選一免費刷新一次，reload不能再刷；未知星典暗不揭卡名。

清算先救命／計分，再XP與補包吸附約1.1秒，之後選卡，裝備留地。有限怪池，同屏4–10、低4立即補有限預備，耗盡才不足4；不能無限增援或擠成團。地形程序有主題、通路與足夠真掩體、含王房，不回固定預製或亂撒物件。保留預警／鎖向／lore移速與合理彈速。所有來源分類、元素容量／融合、百分比／副鏈折扣、抽取／事件、死亡無永久戰力成長照最新正式規格；永久收藏／外觀不是戰力。

第五輪及後續明示仍有效：炎龍只有前80°噴火、不恢復週期環爆；燼火其他目標+3層、有限安全連鎖與來源折扣；冰雹85／漩渦94／冰火領域110基半徑×range；職技CD5／6／3秒、角色冷卻條夾0–1；Steam0／.2／.4秒三波，每波24基傷、基半徑60／110／160，skill類別＋basicHitProxy，不增普攻施放、不雙乘傷倍率；藍色強光雷電、麻痺／冰凍區分、輕震與格擋回饋。下一關石色門透明邊乾淨。**四柱封印是使用者已回答的特殊例外：保留旋轉60°缺口；其他Boss完整環彈不恢復缺口。不再重問。**

驗證界線：1.0.0來源307unit／77Chromium三輪及正式URL新局／53691bf原始IndexedDB兩項＋舊檔實戰PASS。1.0.1最新結果讀CURRENT_STATE，新增核心326unit與post-v1-feedback四項後完整browser81；未實跑不能寫PASS。`BALANCE_PERFORMANCE.md`、`REMAINING_ACCEPTANCE.md`保留S13：真GPU60FPS／600彈60秒／GPU記憶體、Firefox/Safari、三職自然取得一般／強構築完整30＋1與人工周目、聆聽及全部短FX逐幀NOT_RUN。Cloud600功能／每傷独立字、10＋30 UI重啟JS heap只PASS其範圍；SwiftShader密集平均1.3–1.5秒/幀，60FPS是FAIL。24＋8合法單王fixture保留一般劍1／2周目死亡，bot只5–8房／逾時，不是自然完整通關，不把候選猜測確診Bug。M01–05已修有回歸、M06架構接入但硬體未證、M07已明示例外、M08候選按证據處理、M09舊scaffold等已過時。

開發與測試在Cloud或CI，不要求主人本機常開。有cloud runtime skill先讀，核對網路policy／憑證ready，不輸出秘密。沿用bash scripts/cloud-setup.sh（已修不依赖rg以免略過unit），必要checks：npm run check、npm test、npm run build、npm run test:browser、npm run format:check；browser先build、期間不重build改dist。修失敗後繼續，不每小階段等「繼續」。頁面發布只用GitHub Pages，不用Sites；既有Actions／github-pages只允許implement/s00-s05及main，不用merge main繞環境。原作sces5504/Solaria只讀，可參考、不整搬monolithic HTML。

Cloud線上驗證：一般用tools/validation/pages.config.ts；受管Cloud用docs/validation/tools/pages-cloud.config.ts明確代理、NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt，保持TLS。Chromium NSS DB唯讀會ERR_CERT_AUTHORITY_INVALID，按環境允許其實際NSS資料庫寫入，不重設HOME、不忽略HTTPS、不繞proxy。SOLARIA_PAGES=1 build後用正式URL驗JS／atlas／manifestSHA256、新局／同時攻技／reload與53691bf舊IndexedDB；場景fixture只验证功能，不當人工通關。不要假設/tmp/solaria-browsers等仍存在。Pages忽略純Markdown／docs更新；程式／素材／workflow改動照完整CI部署。

重大修復／數值／架構／里程碑增量更新PROJECT_STATUS與相關記憶，CURRENT_STATE有UTC時間，MASTER索引同步；保留歷史取代理由與失敗，不寫Token/Key。兩chat共同資料由整合者合併，勿覆寫對方記憶。若中斷，保留commit、確切未完／命令／恢復步驟，不把部分當全完成。

## 你的工作範圍與下一步

1. 先恢復最新來源／測試／部署，逐項讀POST_V1_FEEDBACK，確認新掩體／250伙伴／Boss條件抽取與舊檔。不把旧M01–05再當未修、不恢復旧耐久／重擊扣3／伙伴3倍HP。
2. 主要擁有src/game（core、data、systems、persistence）、核心unit與玩法browser、GAME_SPEC／玩法決策與平衡證據。入口src/game/core/run.ts；新掩體core/cover-rules.ts、systems/cover.ts與combat/projectile-sweep/enemies/biome-bosses；伙伴systems/companion.ts；抽選data/journey.ts；checkpoint-schema.ts處理遷移。正常AI、来源分類、geometry、有限怪池、配額／升级都要實際執行驗證，不只檢查資料長度。
3. 普通數值／升級可按證據自主調，記原因、前後、回歸；核心新機制按主人新要求。自然一般／強构築與1/2/5/10周目要保留死亡／時間／卡裝取得紀錄，不把預授構築當自然全程，不僅最高DPS成功即標平衡PASS。真GPU不可用持續NOT_RUN，不要求主人電腦常開。
4. 渲染、sprite、專屬FX、UI與呈現由另一美術chat負責。若機制要新增字段／Visual.kind／穩定ability ID或需要改HUD，先在實作與契約文件列清楚觸發時序、幾何、分類及資料結構，让美術成果配合；不要為修數值順手改既有美術。可修確診的跨層Bug，但說明接口及保存／回放影響，不偷偷覆蓋美術分支。
5. **你負責整合與Pages發布。** 自己用獨立gameplay/...分支／worktree，由遠端最新implement/s00-s05建；美術用獨立art/...，兩邊PR base可設implement/s00-s05，不改既有PR2 base、不merge main。收美術commit/PR後核對其最新HEAD與你的分支，安全合併或cherry-pick到乾淨整合checkout，解衝突保留兩者；檢查遠端HEAD的新工作，非fast-forward就fetch核對，不force。只推既有允許的implement正式分支，跑全checks／Actions／正式新局与舊檔；不能拿一邊舊dist發另一邊新程式。用版本與bundleSHA256證明正式站來源。
6. 更新跨層的CURRENT_STATE／MASTER／PROJECT_STATUS，納入美術chat提交的自己的報告與DEVELOPMENT_HISTORY增量。交付實際網址、操作、版本／分支／commit／PR、真实PASS/FAIL/NOT_RUN及未完事項。

先開始核驗環境、文件與來源並完成你可獨立做的工作；必要核心問題才问，普通細節不反覆求批准。不要自动啟動新聊天、額外agent或部署新平台。保持跟主人用繁中短且具體交流。
