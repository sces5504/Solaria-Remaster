# ARCHITECTURE — 技術與資料架構

2026-10-11，CONFIRMED。以GAME_SPEC的玩法與數值為權威。

## 選型

沿用Node24、npm及package-lock、TypeScript、Vite、Vitest、Playwright Chromium、Prettier。新增PixiJS v8依賴於開發S01，安裝時確認相容並鎖定實際版本；本次文件提交不安裝遊戲依賴。正式畫面用WebGL，無WebGPU或Canvas fallback承諾。Pixi負責視覺，戰鬥核心不可import Pixi／DOM／音效。

選擇理由：固定全房、高頻彈幕、原創atlas與程式特效需要掌握批次繪圖；獨立核心支援單人固定步進、確定性測試與可靠存檔。代價是自行整合輸入、音效、場景與生命週期，已納入分階段計畫。

## 預定目錄

- src/main.ts：啟動／DI／資源完成後載入menu。
- src/game/core：clock、state、commands、events、rng、room FSM。
- src/game/systems：movement、collision、combat、effects、skills、progression、loot、settlement。
- src/game/entities：player、enemy、boss、projectile、area、companion、obstacle。
- src/game/data：cards、equipment、biomes、roomTemplates、enemy／boss／event definitions。
- src/game/persistence：schema、migration、checkpoint、profile、import/export。
- src/input：鍵鼠與held state，只產生命令。
- src/render：Pixi application、scene layers、atlas、animation、particles、lights、damage text。
- src/ui：menu、HUD、cards、inventory、stats、pause、end、tutorial、catalog。
- src/audio：音效混音、volume、mute，預留music channel。
- src/i18n：穩定key與zh-TW字串。
- public/assets：原創PNG atlas、metadata、音效與來源／授權清單。
- tests/unit、tests/browser：純規則與真瀏覽器測試；不用試玩page替代核心測試。

## 模擬與事件

固定步進1/60秒。command包含tick、actorId、intent、pointerWorld，輸入與state可序列化。PlayerAttack、SkillCast、Dodge、Interact各經能力／phase／control／CD驗證才發出事件。排程用simulation時間；暫停不累積catch-up backlog。

狀態保存runId、class、level、XP、cards map、elements、fusion、stats ratings、equipment IDs、bag slots、room／wave／phase、route seeds、RNG streams、event seen set、drop counter。房間state保存entity table、effects、projectiles、obstacles durability、pending emissions、settledOnce與upgrade queue。render讀快照與一次性事件，不寫HP／卡池／掉落。

DamageContext必含sourceAbilityId、ownerActorId、rootAttackId、damageKind、elementMask、canCrit、lifestealEligible、basicEffectMask、basicHitProxy、basicCastProxy、procPolicy、ancestry、chainScale。子傷害不盲目copy父暴擊資格，按定義重建；保留chainScale。爆血percent獨立kind，不走一般增傷。

施放計數只由BasicCastEvent推進；副箭、折射不發該event，快射每箭發。右元素只由整次ClassSkillCast發。所有傷害觸發只走一個dispatcher，加入回入檢查；同一動畫不能在不同系統重複給傷害。

## 碰撞、地圖與AI

32×20格、格32，邊界牆與高度阻擋。circle／segment檢測，連續sweep避免700速度穿薄牆。雷射掃到第一高度實體截斷；爆炸與地面範圍不做遮蔽。lake／lava是walkBlocked但projectileBlocked=false。

空間網格供近鄰／範圍／鏈目標，結果依距離及ID排序以便重現。敵尋路在模板grid上，掩體碎裂更新通行圖；不能卡死在孤島。普通敵軟分離，boss指令制攻擊排程遵守同時mode上限。玩家與南瓜對敵target選擇使用合法最近距離，無全場強制嘲諷。

地圖seed只選完整驗證模板及允許的變體。path validation失敗重試有限次後用該地形已知合法模板；不改seed去重抽已決定裝備。

## 統計與數值

原始加成同類相加，類別加成與一般全域因子各一次；技能／普攻類別唯一，元素標籤有兩個也不雙乘通用元素傷。derived stat單一函式服務核心與資訊頁。CD存施放時間／deadline或正規化work units，不靠UI進度條算。臨時buff生滅即重算真實速率，不補打歷史攻擊。

所有每級傷害增量、第五級機制封頂、第六級後邊際規則由資料函式表達，不複製到UI。副鏈折扣在DamageContext最末套一次。命中／施放／週期打擊／附著跳傷的分類以GAME_SPEC為準。

## 保存與生命週期

IndexedDB內run與profile分離，用revision及transaction保存；settings小型音量設定可獨立儲存。保存入口快照及最近有效clear checkpoint。每次選卡、clear後拾取／丟棄／換裝持久化。同一物品ID只允許一位置，重新讀取以revision合併而不是重新生成。

載入先schema validate→version migration→invariants→resume phase。重複舊tab以run revision提示使用最新或放棄舊操作，禁止兩tab複製同物品。關頁/失焦觸發暫停與可持久化工作；COMBAT reload從已保存入口，不能把未結算獎勵帶走。

格式損壞／quota不足顯示明確訊息，保留上一份，提供可複製備份；不靜默覆寫profile。匯入JSON只讀白名單schema，無腳本／HTML執行。存檔無圖片，產物assets版本hash與run schema分開。

## 渲染與音效

邏輯1024×640、8:5等比fit容器，不拉伸座標；pointer透過inverse scale轉世界座標。像素sprites nearest，程式light可用linear低解析render target。layers：terrain→obstacles→actors→friendly effects→hostile danger→damage numbers→HUD，敵方危險不能被華麗全屏shader覆蓋。

投射物／粒子／數字物件池，atlas批次與bitmap數字字形；不為每彈創建filter。敵彈預算600通過延後整組新模式發射實現，不刪已有效彈。裝飾粒子最多2000可回收。傷害數字仍每次獨立，不合併或偷刪。GPU和CPU測量分別記錄。

音效由事件映射，只解鎖一次AudioContext；音量／靜音跨局保存。預留music channel但不放背景音樂。

## 靜態部署與單人目標

Vite build到dist，專案Pages base為/Solaria-Remaster/，資源不硬寫根路徑。Actions建置、artifact→Pages；採pages:write、id-token:write與github-pages environment。第一里程碑若無可分享Cloud預覽可提前部署Pages試玩版，正式v1在S14更新；本地文件階段不變更可見性或發布。

主人在2026-10-12明確取消未來多人連線／合作邀請房計畫。專案以單人遊戲為目標，不再規劃房間backend、同步SDK、網路權威狀態或重連協議。固定60Hz、input/state/render分離、可序列化資料、穩定ID與實際傷害來源／陣營欄位仍服務單人玩法、測試與存檔；不因取消規劃而重構正在使用的核心。GitHub Pages繼續托管瀏覽器版遊戲與獨立美術選樣。

## 雲端與測試

環境執行bash scripts/cloud-setup.sh，Node24、npm ci、Chromium及檢查命令沿用。檢查結果不能由本機套件狀態推斷。新資料先做schema／invariant測試，核心直接用seed+command trace測試，瀏覽器只測交互與資源／視覺。完整品質門檻見TEST_PLAN。

## 第一里程碑第五輪渲染增量

`src/render/lighting.ts` 提供只讀state的發光源清單、腳下冷卻顯示夾限與重用512×320暗部／光照texture。地形／投影／actors之後套暗部，後續柔光、友方FX、敵方危險與HUD不被蓋住。樹岩附近柔暗，發光源以radial destination-out照亮世界，色光add混合；裝飾光源上限64，不删攻擊或變更RNG。暫停相同光源不重建上傳。這是2D藝術光影，不承諾精確3D遮蔽或全v1效能已驗收。技能steam視覺事件與Area可選steam effect向後相容；一般來源／序列化邊界保持。

## S12 實際接入補充（2026-10-11）

Checkpoints 公開入口沿用既有 import 路徑，內部由 checkpoint-schema 與 RunStore 分離。IndexedDB schema 保持1，run store 新增 revision 墓碑鍵；即使清除旅程，另一分頁也不能用先前 revision 復活舊局。永久 profile 獨立 journal、discovered、records，皆保存 previous；坏資料保留 damaged。讀檔無有效前版時不造空收藏，顯示可下載原始備份與匯入有效備份的流程。公開 profile 格式只保留收藏、外觀、教學欄位，排除未知欄位；不存在永久戰鬥屬性。

音效由 SoundController → sound-bank 合成，保留 AudioContext 手勢解鎖；缺少音訊介面不阻止旅程。音量／上次非零音量獨立小型設定，mute 不清除玩家音量。每個合成聲的節點結束後解除連接，噪聲buffer按context重用。波形自動檢查與人工聆聽分開記錄。

## v1實際模組接入（2026-10-11）

core/run維持固定60Hz；旅程／地形／王／事件定義放data，systems各自處理專屬行為。combat實際引用projectile-sweep，以collision-time解析圓／矩形接觸，SpatialGrid查局部目標、ContactQueue按接觸秒／projectile ID／target ID決定全彈順序。追加彈保留同tick剩餘時間；命中後再求下一接觸，保留掩體破壞／穿透／彈射。

projectile-pool的WeakMap只存暫態退休物件，queue全部消耗後才釋放；清空所有舊可選欄位再重用。State內仍有完整有效projectile與穩定ID，可序列化，不把池寫進save。Stage退休Sprite／BitmapText池不限制活躍數，傷字各別ID與文字，不合併；回menu釋放活躍物件及位置表，閒置快取有上限。glows不刪有效攻擊；既有半解析度装饰光照budget保持。

RunStore／checkpoint-schema／profile-store／records替代舊Checkpoints實作但保留公開入口與schema1兼容。兩分頁revision以交易檢查及清除墓碑防ABA；永久星典／前版／壞資料分開保存，壞檔先保留原文。profile只有收藏／外觀／教學，沒有永久戰力。UI保存busy串行選擇／import，beforeunload保護交易；取消／拒絕／配額錯誤皆解除忙碌但保留備份流程。

SoundController讀核心事件及UI動作，合成原創分層音效；renderer只讀Run與視覺事件，不修改數值。solariaDiagnostics回傳新建的計數快照，不暴露Run或寫入入口。未來多人邊界規劃已由2026-10-12主人要求取消；既有單人核心分離維持。

實際CloudJS物件重用／碰撞順序與重啟已驗證，真GPU效能尚NOT_RUN；不能以架構接入推論60FPS。

## v1.0.1掩體與雙chat接口（2026-10-12）

core/cover-rules共用20耐久、2秒與靜電110基半徑；systems/cover處理附近圓、矩形／扇形／掃掠幾何與舊耐久遷移，combat.damageCover單入口施加Boss5／monster4。Projectile／Area保存可選coverSource，來源者死亡仍可判定；湖泊／我方／無敵人來源地形機關不損。接觸隊列依真碰撞時間，只有真掩體接觸傷掩體，不在任意彈道結束旁邊扣血。雷射以半線寬做整段矩形掃掠，避免取樣漏薄牆或全寬誤傷；衝撞以預計實際步進與身體範圍碰壁判定，不需先穿牆，也不攻擊正離開的背後牆。

Obstacle增加可選invulnerableUntil，schema1兼容；checkpoint-schema在current／entry都遷移耐久比例與既有伙伴250上限，保留波次／時間／journey。Actor的四封印柱仍獨立1500基HP，不是20耐久環境掩體。伙伴沿原Player類型／穩定ID與来源分類，不因固定250改甲／吸血或复活时间。

Boss data/journey只對Boss抽選seed非線性混合；路線與模板局部stream保持，舊journey不重算。render/hazard-markers只畫可走雕像地面印記，不創造碰撞。遊戲chat維護src/game与穩定接口／整合，美術chat render／UI／assets，獨立worktree、由遊戲窗口合併已核對commit後部署implement。共同資料保持可序列化，Visual與geometry是一個規則的呈現，不能在render藏新的傷害判定。

## 取消未來連線計畫（2026-10-12 07:57:13 UTC）

取代舊「未來2–4人合作／邀請房、預留多人邊界」決策。原取捨保留於DECISION_HISTORY等歷史記錄，不再作為後續新增架構的需求。主人沒有取消GitHub Pages託管或現有單人遊戲；本輪只更新規格與記憶，沒有刪除單人效能／保存需要的模組。

## 主人最新授權：main接續、美術定稿、1.1.2固定備份（2026-10-12）

主人已接受美術，明示「後面就不要動了」及「從下個AI開始，遊戲的更新都放到repo的main」。1.1.2已保存固定tag v1.1.2／archive/v1.1.2（9abc6d8），同版整合到main。後續唯一正式分支及Pages來源是main；可用工作分支，但成果合併main。禁止改備份、reset／force push，原作只讀。美術素材／風格／配色／光影／FX／UI外觀定稿；機制資料與確診跨層Bug只作維持外觀的最小修正。取消未來多人計畫仍有效。小修只跑相关檢查，不反覆完整套件。

本節取代舊「main尚未合併／不得merge main／implement正式分支／雙美術與機制窗口」等規則；舊節保留歷史，不能阻止當前授權。完整接續入口docs/handoff/GAMEPLAY_NEW_CHAT_PROMPT.md與BASELINE_1.1.2.md。

## 1.2.0 招式編排接口

BossAttack追加可選beamAngles／beamTurn／beamStagger、rushSpeed／rushTime／ricochet、volley與mineDistance。Area.beamMotion保留基角／總轉角／時間，各束按自身starts計算，caster或mode消失仍由區域自然結束；舊檔缺省可讀。普通及反彈王衝撞共用moveBossRush，舊草原王使用同一BossAttack執行入口並保留ID。bossMinion統一正確類型／精英HP及能力；normalizeBossMinions在schema1的current／entry作比例遷移，缺能力用ID專流、不改旅程rng。投射source身份按wave取對應mode，避免兩模式交錯讀錯。Renderer只同步原預警箭頭距離，素材与UI保持。

1.2.0舊實驗checkpoint相容：active sweep若Area缺少beamMotion，沿原mode／DT繼續轉動；新光束按自己的絕對时间，不套兩次旋轉。一般COMBAT仍回入口；此接口兼顧測試給卡保存的進行中快照。

舊草原狼群缺bossOwner時補原王ID，保持原召喚上限；與精英HP比例遷移一起處理，不重抽旅程RNG。
