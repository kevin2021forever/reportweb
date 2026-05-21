# 🎮 Minecraft 伺服器檢舉網頁系統 (V1.1)

![Version](https://img.shields.io/badge/version-v1.1.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-emerald.svg)

這是一套結合 **Discord 機器人表單** 與 **Web 後台審核管理** 的 Minecraft 玩家違規檢舉系統。旨在簡化管理團隊處理惡意玩家（如破壞、作弊）的流程，並透過自動化手段落實遊戲內懲處。

---

## 🚀 系統核心功能與用途

* **集中化管理**：方便管理團隊整理在 Discord 收集到的惡意破壞、違規檢舉回報。
* **高效審核後台**：管理員可登入 Web 專屬後台，一目了然地審核檢舉案件。
* **自動化懲處機制**：串接 Minecraft 伺服器 RCON 協定，審核通過後自動對違規玩家執行封禁（Ban）或禁言（Mute）指令。

---

## 🛠️ 技術棧 (Tech Stack)

### 🤖 Discord 表單串接
* **開發語言/API**：`Python` 🐍 + `discord.py` API (使用 Discord UI Modals 表單功能)

### 🌐 網頁審核系統
* **前端 (Front-end)**：`HTML5` + `JavaScript` + `jQuery` + `CSS3`
* **後端 (Back-end)**：`Node.js` (搭配 `Express` 輕量化網頁架構)
* **通訊協定**：`RCON Protocol` (用於與 Minecraft 伺服器即時通訊)

---
## 📊 系統運作流程
1. **提交檢舉**：玩家於 Discord 透過 UI 表單填寫：檢舉人、被檢舉人、違規原因及佐證。資料將自動同步至後台資料庫。
2. **初步溝通**：系統自動在 Discord 建立專屬討論串，讓管理員能與回報玩家進行初步溝通與確認。
3. **身分驗證**：管理員使用一組專屬的帳號密碼登入 Web 後台管理系統。
4. **遠端懲處**：審核確認違規屬實後，系統會透過 **Minecraft RCON 連線協定**，自動對遊戲伺服器發送懲處指令。

---

## 📂 網頁頁面結構

* 🔐 **`登入頁面.html` (weblogin)**：網頁管理後台登入入口。
* 📋 **` webtest.html` (webtest)**：核心審核面板，供管理員審查玩家違規資料與檢舉內容。
* 🚫 **`懲罰記錄.html` (penaltylog)**：已確認違規並執行懲處的玩家名單歷史紀錄。

---

## 🛠️ 前置需求與環境準備

1. 需先設定並運行基於 `discord.py` 的 Discord Bot，並確保其具備建立 UI 表單（Modals）與討論串（Threads）的權限。
2. 需準備一組支援 RCON 連線的 Minecraft 伺服器（需於 `server.properties` 開啟 `enable-rcon=true`）。
3. 建立網頁環境所需要的 `.env` 環境變數設定檔（填寫資料庫連線、RCON 密碼等敏感資訊）。

---

## ⏳ 預計更新功能 (Roadmap)

* [ ] 🗪 **系統問題反映機制**：支援玩家提交伺服器 Bug 或建議，並同步整合至審核系統中進行分類與追蹤。
