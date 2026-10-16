# TEST_PLAN — 品質、回歸與驗收

2026-10-11，CONFIRMED。此文件是測試要求，不是已運行記錄。當前遊戲仍只有startup scaffold，玩法／平衡／FPS全部未執行。

## 環境與命令

Cloud／CI使用Node24，bash scripts/cloud-setup.sh、npm run check、npm run build、npm run test:browser、npm run format:check；有有意義的核心測試後npm test。測試不用本機常開。pure simulation使用固定seed與命令trace，browser使用正式build與Chromium。renderer實際FPS另需記錄硬體GPU與瀏覽器；headless功能測試不冒充實體性能。

## 核心矩陣

| ID  | 測試行為                           | 明確通過條件                                                         |
| --- | ---------------------------------- | -------------------------------------------------------------------- |
| C01 | 按住普攻／WASD／aim／動作並行      | 無補射誤選，施放次數符定義、同敵每箭一次                             |
| C02 | dash牆／敵／湖／lava／不足落點     | 牆擋、敵穿、足夠跨、否則留原岸耗CD、無無敵                           |
| C03 | 格擋早／晚／空／多彈               | .6最短；成功後.3反擊、後.1保護；單次只一反擊，CD施放即起             |
| C04 | 快射5及升級8–10、側箭／左元素      | 每主箭推一次AA counter，副不推，右元素整次一次                       |
| C05 | 甲／盾／溢傷／受傷無敵             | 100/(100+A)，先盾，溢傷扣HP；只扣盾也開.5；DOT與雷射不能瞬疊         |
| C06 | 最後怪同幀死亡／玩家0HP            | clear只一次、先回血救回再判死，殘留彈幕持續，無免費重復獎            |
| C07 | pause／失焦／resume                | simulation／CD／status／數字／復活全部凍結，resume需新輸入           |
| C08 | 暴擊分類與100%測試                 | direct／週期暴擊，燃燒／冰矛／追加／百分比不暴擊，敵不暴擊           |
| C09 | sourceScale／鏈／代理              | 副20/.175/.15全鏈僅一次，no滿傷復原、no遞歸；星核命中不計施放        |
| C10 | ice／burn／wet／electro／Boss CC   | 15累積、刷新／不疊、wet25%；Boss共享減半／第三拒絕／2秒免疫          |
| C11 | 2元素／融合／第三元素／雙融合      | 無騰slot、舊卡仍池；最早融合／同時玩家選一次、armor正確卸下          |
| C12 | 三選一多級／稀有度／資格           | 先色再池、同組不同、選後重算、singleton不再、數值可重復              |
| C13 | 每周目cap／機制／邊際              | 5→10→15；職業機制按表，後傷1/2、1/3…非復利                           |
| C14 | 普通補包與Boss召喚                 | 2→…15、掉才重置、跨房周目、召喚15不改counter、15%回血                |
| C15 | 詞條／精英／loot                   | 無事件Boss詞、25%高色權重加算、無數量獎勵，精英生命傷及能力符合定位  |
| C16 | map／projection／beam／explosion   | 32×20連通，實體擋／低地不擋，範圍不遮蔽，高速不穿牆                  |
| C17 | Boss三招／交錯／phase              | 各階段≥3獨立attackId，2／短時3模式、預警達標、無溢傷、舊攻還在       |
| C18 | 掩體／回血召喚／眼球               | 每模式同掩體一次扣、四態；限召／noXP裝備；雙體總HP不增、皆死才清     |
| C19 | 最終封印／3血／通關                | 一二之間4柱、封印彈幕例外、字幕Mori Fang、暫停選擇／繼承             |
| C20 | ghost／友軍／lifesteal             | 3×HP／.5保護／10sec或clear復活；不擋友彈；實際HP傷吸血排盾與過量     |
| C21 | blood／禮物／星核                  | 20/10%甲無效先盾、門檻1.35繼承；gift不自爆鏈；星核AA proxy不計cast   |
| C22 | bag／equip／禁用                   | 3欄12格、F最近、滿包留地、戰鬥不開、禁armor自動卸包或地              |
| C23 | 事件計數／once／guarantee          | 0→…20每普通房推、boss不推，reset，跨周目seen不清、無詞條、clear保紅  |
| C24 | checkpoint／seeds／loss／migration | 戰鬥回入口、clear不重獎、選卡不能reroll、同ID不複製、失敗不清profile |
| C25 | HUD／字／cards／音效               | 每傷獨立、敵預警可見、CD角色旁醒目、card資訊完整，靜音保存           |
| C26 | death／profile／all-content        | 無永久數值，三職業與玩法全開，死亡只清run，newrun覆蓋確認            |
| C27 | source與asset license              | 原作只讀，無搬舊HTML／版權素材；原創atlas與license manifest可核驗    |
| C28 | Pages／base／加載／refresh         | 子路徑資源全部200，正式build能新局／保存／reload，真實部署URL有效    |

## 卡片與內容逐項覆蓋

CARD-01..85以GAME_SPEC穩定ID作為參數化案例，而非僅檢查數組長度：每卡給定合法state→取得／升級→執行其條件→斷言對應命中、數量、傷害來源、限制與無條件對照。每個案例注明關聯Cxx：數值01–14 C12/13；元素15–40 C08–13；職業41–59 C01/03/04/09/13；通用60–69 C05/08/12；橘70–77 C09/12/17；紅78–85 C11/12/22/26。紅卡測試禁用與代價、偏執與靜誓互斥，數值不只照抄函數公式。

MON-01..29覆蓋草原5＋其他8×3原生怪，測試招式／尋路／射擊／屍體掉落。BOSS-01..18每個2階段3招各獨立觀察；FINAL-01..03每條血＋SEAL4柱；EVENT-01..06每事件三波與其精英／Boss、6專紅。ROOM-TEMPLATE每地形6個、總54，驗證路和合法落點。EQUIP8橘＋3普通紅＋6事件紅分別觸發和卸下效果，不能僅寫一條總測試覆蓋所有。

分布驗收用固定大量seed統計置信區間，檢查基礎色權重、fallback正規化、稀有候選計數；不要求有限樣本精確等於百分比。查找變化的卡池時不能把有限去重樣本當成獨立概率。

## 平衡與效能

首周目三職業各至少一個一般構築和一個強構築跑30＋最終，記錄時間（排暫停）、等級、各房擊殺耗時、承傷與回血。目標40–60分鐘、20–25級，檢查不是僅最高DPS達標。第1/2/5/10周目觀察血／甲／傷曲線、最長Boss耗時、卡機制封頂；修改參數須同場景前後對照，不降低固定規則。

FPS參考設備Apple M1級或同等集顯／16GB，Chrome／Edge正式WebGL、1920×1080viewport內固定8:5、邏輯1024×640。普通房和最密Boss連續60秒，平均≥59FPS、95%幀≤20ms、不連續低55超過1秒。記錄CPU/GPU／OS／browser／resolution／render backend／scenario seed／entity與particle count／frame distribution。不寫未測達標。

壓力case包括600敵彈、12共振目標、等級5分裂＋鏈＋禮物、多個右鍵場、鬼甲與復活、最終三模式、每傷獨立數字。檢查記憶體經過10次restart不持續增長，切tab後恢復無burst。只能優化批次／池／shader／裝飾預算，不能刪有效傷害或把傷字合併。

Firefox／Safari桌面功能煙測，viewport縮放與fullscreen檢查指針準確。觸控、120FPS、多人／music／英語不作為v1必驗。

## 記錄格式

每次記錄commit、階段ID、環境、命令、結果、退出碼、失敗case、未運行項目。狀態必須區分PASS／FAIL／NOT_RUN／BLOCKED；CI綠色僅代表該workflow包含的檢查，不代表完整玩法、GPUFPS或Cloud環境已Publish。更改核心輸入／來源／存檔／掉落必跑關聯case及既有回歸。

## v1驗證來源與修訂優先（2026-10-11）

上述scaffold及首周目20–25級為歷史；最新GAME_SPEC增量規定31關约26級，實作配額8890對照PASS，不回復舊值。現況與PASS／FAIL／NOT_RUN看PROJECT_STATUS及docs/validation各矩陣。

新增實際驗證：每地形6主題×20seed連通與合法生成、全部王2×3招／索拉里斯三血、六事件一次跨周目、85卡規則矩陣、17特殊裝備卸裝／來源、真IndexedDB交易／损壞／revision／離頁／取消匯入、原版53691bf格式fixture繼續、四桌面尺寸8:5／無全頁捲動、碰撞真時間與池重用、Cloud10／30次UI重啟、600敵彈／12目標與各傷獨立字功能。實測SwiftShader壓力不達60FPS，真GPU仍NOT_RUN，不能用Cloud功能PASS代替FPS。

命令旅程bot只發正常輸入、選真實候選，死亡和逾時保留。24場城堡領主fixture比較的預算、構築、1／2／5／10周目敵血與承傷／回血／CPU量測完整保存，沒有敵血／無敵作弊；fixture不等同全程三選一取得或人工試玩。人工30＋1各職一般／強構築與Firefox／Safari仍列NOT_RUN。

## v1試玩後回歸（2026-10-12）

新增feedback-cover：4 Boss／5小怪、混合權重、2秒邊界／同波一次、附近圓與範圍屬性、遠掩體仍擋彈、湖泊／友方不損、敵人死亡後彈／場來源保留、各房號、雷射終點／半寬、實際近戰扇形／衝撞方向、舊耐久比例及保護時間存讀、三職與生命卡／周目不增南瓜250、舊伙伴／復活。boss-distribution：每周目20,000實際路線seed，九地形條件抽選各兩王、比例.47–.53、排除僅8種固定聯合組合；不把未條件化的全Boss頻次當50%證明。

新增post-v1-feedback Chromium：五色裝備背包／側欄特殊名、六色構築／已知圖鑑／未知不揭名、橘紅選卡背景／hover光色且保留能力家族圖案、魔王城機關可跨越與真柱碰撞、舊南瓜快照250且玩家生命强化仍有效。原本Boss測試改在整個模擬過程觀測實際攻擊活動，仍核對各階段三種attackId與模式上限；不能要求玩家遠離所有掩體時也必須扣耐久。

回歸基線為上一版307unit／77Chromium與正式站2案例；本輪完整結果、部署來源和失敗保留見PROJECT_STATUS最新首節與docs/validation/results。全局S13硬體與人工NOT_RUN不因這輪Bug回歸而變PASS。

## 1.2.0 回歸

boss-rework.test.ts實際執行V收攏／全周／同步十字／逐條雷射，死後自然旋轉／掩體來源、多段衝刺鎖向／距離／碰牆、反彈合法位置、每類及高周目召喚HP／能力／無XP、舊檔比例／死怪／RNG、遠端雷擊／地雷、旋斬傷害、花瓣速度／波形保存、交錯模式來源與.9／.75格擋精確邊界。boss-rework.spec.ts以正式RAF、真實右鍵／export／import驗旋轉、召喚與格擋，等核心時間、不用牆鐘當模擬時序。版本改動較廣，發布CI完整core／browser一次；小修後僅補失敗／受影響case。保留失敗與未測，詳docs/gameplay-1.2.0。

1.2.0舊掃射補正：精確角速度用正式累加DT，新光束不能雙轉；真RAF匯入無beamMotion實驗快照後匯出核對旋轉。Pages gameplay-feedback明確限定boss-rework與recovery共5browser，與主體完整107來源分開紀錄。

## 1.4.0 正式整合增量

release-140核心驗證三周目93次逐房清算（零／巨量XP）、六事件整房只給一級、33級後增量遞減、三職舊高等生命比例與死亡、求知退役／待選替換／現役圖鑑成就、南瓜20秒／舊倒地一次移轉。實際Chromium保存／匯入匯出／重載與手機正式build操作另驗；發布scope release-mobile含Chromium／WebKit／桌面相關手機回歸及file://HTML。詳細來源與結果見docs/releases-1.4.0/HANDOFF.md，核心fixture不是自然93關，WebKit不是iPhone Safari／Chrome真機。既有S13硬體／聲音／效能NOT_RUN保持。
