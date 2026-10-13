# 可直接貼给另一個專案的 Prompt

以下整段可直接貼上：

---

請在你這個專案建立 Solaria Remaster 的獨立副本，使用你之前已經完成的美術資源，替換副本的美術。遊戲機制、數值、玩法、操作與流程必須完全不變。這次是獨立美術試作，不影響原專案之後的開發。

固定遊戲來源是 v1.2.0：

- 儲存庫：https://github.com/sces5504/Solaria-Remaster
- 固定 commit：239cac7a342944a10bcacadce977f77fdf57d983
- ZIP：https://github.com/sces5504/Solaria-Remaster/archive/239cac7a342944a10bcacadce977f77fdf57d983.zip
- 完整交接：https://github.com/sces5504/Solaria-Remaster/blob/handoff/alternate-art-copy-v1.2.0/docs/alternate-art-handoff/HANDOFF.md

先完整閱讀交接文件，再盤點你這個專案已有的素材與其實際檔案。把固定來源放到自己的獨立目錄／儲存庫，使用你原本的美術工作流程接線；不要從舊遊戲骨架重做，也不要依賴舊 Chat。若使用 clone，先更換 origin，避免推送回來源儲存庫。

我授權你只在這份獨立副本替換角色、敵人、Boss、場景、圖集、動畫、光影、特效與 UI 視覺素材，適配你之前做好的風格。來源文件裡「原專案美術定稿」不阻止這份副本換皮，但原專案仍必須保持不變。

嚴格保持全部現有遊戲規則與資料，包括 v1.2.0 的 Boss 差異化攻擊、近戰追擊、精英召喚物兩倍精英 HP，以及劍士格擋改善。不得改 HP、傷害、移速、冷卻、隨機、掉落、碰撞、攻擊範圍／時序、地圖障礙、AI、存檔 schema 或職業技能。不得為新圖像移除或重設內容。

保留 1024×640／8:5 邏輯畫面、操作、全部 UI 功能、事件與結局流程。美術錨點／比例只能改顯示，不能改 hitbox。Boss 預警與攻擊圖形要對應原本的幾何與命中時間；元素、招式、敵方危險與子彈辨識不能消失。新圖像沿用既有穩定身份 ID，不能交換敵人或招式的遊戲身份。

先閱讀副本的 GAME_SPEC.md、ARCHITECTURE.md、UI_UX_SPEC.md、docs/gameplay-1.2.0/README.md，再依交接文件中的美術入口進行必要修改。來源歷史待辦不是本次任務。素材缺少時先保留原素材並列出缺口，需要時才補素材；不要擅自改玩法解決素材問題。

不得修改或推送來源 main、v1.1.2、archive/v1.1.2、archive/v1.1.2-files、任何備份或原作 Solaria；不得部署到原專案 Pages，不回合併美術副本，不 reset 或 force push，不自動建立 Chat 或 agent。你這個專案的發布另依我對該專案的授權處理。

這次交接準備不需要測試或主專案記錄。真正換皮時依我當時的要求做必要的相關驗證，清楚區分已做與未做；不能拿原版測試結果宣稱換皮版本 PASS。請直接接續準備副本與美術替換，不順手進行任何機制、數值或玩法開發。
