      minecraft 伺服器檢舉網頁系統V1.1版本

      預計更新功能(未完成製作中)
      可提交伺服器系統問題反映到審核系統中
      
      表單填寫功能使用語言跟API
      discord.py api

      網頁審核系統
      前端jquery + JS
      後端 node js express架構
      
      用途:
      方便整理discord 違規檢舉惡意破壞遊戲的使用者
      後台管理員審核是否確定該玩家違規並且給予懲處封禁帳號或是禁言等等
      
      使用方法:
      需先使用discord bot py api 建立表單功能
      
      系統流程:
      1.玩家可以填寫discord表單UI填寫檢舉人、被檢舉人、檢舉原因等等會有紀錄存到資料庫
      2.discord 聊天室會創鍵一個討論串管理員可以跟玩家先進行初步違規確認
      3.管理員使用獲得帳號密碼登入系統進行審核
      4.確認違規屬實系統可以透過minecraft server rcon的連線協定方式執行指令封禁玩家

      頁面功能:
      weblogin 網頁登入前台
      webtest 玩家違規資料審核
      penaltylog 確認違規紀錄名單
