# 1.4.0 手機正式整合與逐關升級

## 授權與來源

2026-10-16 主人明示將手機功能推 main，並一併調整經驗、32等後生命與南瓜。此授權取代所有手機 preview 的「等待確認／不可推main」條文。版本1.4.0，工作分支 gameplay/v1.4.0-release；以手機preview.3的9787749為基礎，正常合併最新main 6a588c5，保留主人README／社群預覽圖。README不讀、不比較、不修改；不開Chat／agent，不reset／force，1.1.2三個保護refs及下載不動。

發布、CI及線上核驗尚待，完成後更新本節；不得將下方本地範圍當全面驗收。

## 規則與實作

- `core/run.ts::finishSettlement`：先完成原1.1秒XP／補包吸附，再無條件level+1、pendingLevels+1。刪除XP保底及while換級；XP只累加、不消耗，原敵人XP／周目倍率／裝備XP詞綴、掉裝、補包、分數皆保留。事件中間波不結算；索拉里斯中間血條不清關，最後一血才結算。settledOnce與phase防重領，跳關本身不給等級。舊已取得的等級與待選次數不回收，新清關只給一次。HUD明示「過關升一級」。
- 移除#8求知，剩84張、原其他ID不重排，#8永遠保留為退役ID。卡池／圖鑑／測試給卡均不再出現；全圖鑑成就按現役卡全部取得判定，舊成就不撤銷。裝備XP詞綴繼續影響無用途的XP數字，不再影響升級。
- `checkpoint-schema.ts`與`run-store.ts`接受舊ID8後移除，不能因退役而判整份存檔損壞。current／entry均遷移；待選含8時只換該格，其他兩張、pendingLevels、rerollUsed保持。沿用cardRng生成合法替代，保存後不再換。未知其他ID仍拒絕。圖鑑永久資料舊8亦過濾。
- 生命倍率 L<=32：`1+1.5*((L-1)/30)^0.9`；L>32：`F(32)+0.3*ln(1+(L-32)/30)`。Lv31=2.5、32約2.5449、63約2.7578、94約2.8811、125約2.9682。33級增量約為原32級增量22%，之後嚴格遞減。相同卡片／裝備乘區保持；升級只補新增生命差，不滿補。`healthGrowthVersion=2`一次遷移：若maxHP下降保留當前HP比例；上升沿既有補差，死亡不復活，吸血鬼40%限仍有效。既有level不回退、journey／當前地圖不重抽。1～32級舊version1重新計算不多補血。
- 南瓜固定250→125，倒地10→20秒，傷害／護甲沿用／.5秒保護／吸火／卸裝消失／清關復甦不變。舊存檔夥伴上限夾125，不補血；未到期的舊倒地計時加10秒一次，以`companion.balanceVersion=1`記錄。已到期可正常復活。
- 手機沿用preview.3功能，正式建置**不設VITE_PLAYTEST**，使用原正式DB／音量／圖鑑／佈局namespace。舊preview獨立DB不自動覆寫正式進度。桌面原鍵鼠保持。
- `public/preview/mobile/index.html`為可持續部署的相對路徑轉址，舊手機試玩連結導回正式版並保留query／hash，免再404；不維持另一份過期遊戲。
- `.github/workflows/pages.yml`新增`release-mobile`：正式相關單元、核心保存browser、Android Chromium／iPhone WebKit／桌面相關手機browser、雙擊HTML測試，再Pages／tag／Release。HTML路徑按package版本產生；舊1.3.3測試config沿用但以環境變數選新檔。一般main push仍原full，正式交付使用skip ci＋明確dispatch以避免重複全套。

## 驗證與界線

- 初輪完整unit：508通過／3失敗（511項）；2項舊測試以陣列索引推卡ID，退役8後錯位；1項polish沿用「升級不補血」的歷史預期65，改檢查保留缺血85。失敗保留results/unit-initial.log。
- 中途修測試的正則誤碰r.cards賦值，造成測試suite／型別失敗，修正為僅以實際卡ID查找；保留unit-corrected.log與build.log，沒有發布該中間來源。
- 修正後相關34unit通過：新13項（含93次跨三周目結算、六事件整房結算、生命遞減、三職舊高等移轉、退役卡、南瓜）＋advanced／polish回歸。check、build通過。其他40unit檔案508初輪通過不能冒稱全511項最終同輪PASS。
- 本地Chromium2項20.5秒通過：舊Lv30→31生命／保存；第三周目巨量經驗只升一級、健康與南瓜移轉、求知消失、保存重載不重複。fixture不等於自然打完整三周目。
- 正式相對路徑建置的Android Chromium模擬2項45.9秒通過：844橫屏主要選單免捲動、頂部返回／構築／點裝備及門。
- CI／正式線上／下載驗證待補；手機真機、硬體手勢／音效／效能／主畫面安裝未測，Android／WebKit模擬不冒稱真機Safari或iOS Chrome PASS。歷史S13未測界線不變。

## 曲線與重現

`health-curve.png`、可匯出的SVG、逐級CSV與`plot-health.py`保存同一公式。圖以同構築Lv1生命為基準；裸職業可乘劍士150／弓手100／法師90。重現：`MPLCONFIGDIR=/tmp/solaria-mpl python3 docs/releases-1.4.0/plot-health.py`。不改遊戲美術。

相關驗證：`npx vitest run tests/unit/release-140.test.ts tests/unit/advanced-cards.test.ts tests/unit/polish.test.ts`；核心browser見results/browser-initial.log；發布用`gh workflow run pages.yml --ref main -f validation=release-mobile`。
