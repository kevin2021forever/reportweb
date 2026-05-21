require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise'); // 使用 Promise 版本
const bcrypt = require('bcrypt');
const session = require('express-session');
const cors = require('cors');
const app = express();
const port = 3000;

// 中間件設定
app.use(express.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500', // 這裡必須填寫你前端 Live Server 的網址
    credentials: true                // 必須設為 true
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-change-me',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,         // 建議加上，防止前端腳本讀取 cookie
        sameSite: 'lax',        // 現代瀏覽器跨域建議
        maxAge: 1000 * 60 * 60
    }
}));
function checkLogin(req, res, next) {
    console.log("當前 Session ID:", req.sessionID);
    console.log("當前 User 資料:", req.session.user);
    if (req.session.user) {
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: '請先登入'
        });
    }
}

// 資料庫連線池設定 (比 createConnection 更穩定)
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'web2',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 根路由
app.get('/', (req, res) => {
    res.send('Server is running!');
});
//檢查進入頁面前是否已經登入
app.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.json({ success: false, message: '登出失敗' });
        }
        res.json({ success: true });
    });
});
// --- 1. 登入邏輯 (已統一) ---
app.post('/login_process', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`\n=== 收到登入請求: [${username}] ===`);

        const sql = `
            SELECT u.*, r.RoleName 
            FROM Users u 
            JOIN Roles r ON u.RoleId = r.Id 
            WHERE u.Username = ? AND u.IsActive = 1 
            LIMIT 1
        `;
        
        const [rows] = await db.execute(sql, [username]);

        // --- 1. 檢查帳號是否存在 ---
        if (rows.length === 0) {
            console.log(`❌ 找不到使用者`);
            // 改法：移除 .status(401)，直接傳 json
            return res.json({ success: false, message: '找不到使用者或帳號停用' });
        }

        const user = rows[0];
        
        // --- 2. 密碼比對 ---
        // 注意：資料庫中的 PasswordHash 必須是完整的 60 字元
        const isMatch = await bcrypt.compare(password, user.PasswordHash);
        console.log(`🔑 密碼比對: ${isMatch ? '成功' : '失敗'}`);

        if (isMatch) {
            // --- 3. 權限驗證 ---
            if (user.RoleName !== 'Admin') {
                console.log(`🚫 權限不足: ${user.RoleName}`);
                return res.json({ success: false, message: '您沒有管理員權限' });
            }
            req.session.user = {
              username: user.Username,
              role: user.RoleName
            };
            console.log("準備存入 Session 的資料:", req.session.user);
            // 2. 關鍵修正：手動存檔
            req.session.save((err) => {
                if (err) {
                    console.error("Session 存檔失敗:", err);
                    return res.json({ success: false, message: '系統錯誤' });
                }
                console.log("Set-Cookie:", res.getHeaders());
                
                // 3. 只有在存檔成功的回調函數 (Callback) 裡，才發送 Response
                console.log("✅ Session 存檔成功，發送回應給前端");
                res.json({
                    success: true,
                    message: '登入成功',
                    user: req.session.user
                });
            });
        } else {
            // --- 重要：這裡也要改 ---
            console.log(`❌ 密碼錯誤`);
            res.json({ success: false, message: '密碼錯誤' });
        }

    } catch (error) {
        console.error("❗ 伺服器報錯:", error);
        res.json({ success: false, message: '伺服器內部錯誤' });
    }
});

// --- 2. 獲取所有用戶 (統一為 Async) ---
app.get('/users', async (req, res) => {
    try {
        console.log("COOKIE:", req.headers.cookie);
        console.log("SESSION:", req.session.user);
        const [results] = await db.query('SELECT * FROM user');
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching data' });
    }
});

// --- 3. 刪除用戶 ---
app.post('/delete',checkLogin, async (req, res) => {
    try {
        const query = `DELETE FROM user WHERE user_id = ?`;
        const [result] = await db.query(query, [req.body.user2]);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: '刪除失敗' });
    }
});

// --- 4. 更新狀態 ---
app.post('/update_status',checkLogin, async (req, res) => {
    try {
        const { userId, newStatus } = req.body;
        const query = `UPDATE user SET what2 = ? WHERE user_id = ?`;
        await db.query(query, [newStatus, userId]);
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating status' });
    }
});

// --- 5. 目前違規查詢（確定違規達 3 次以上的玩家，彙整成一筆）---
app.post('/violation_query', checkLogin, async (req, res) => {
    try {
        const userId = (req.body.userId || '').trim();
        const params = [];
        let havingFilter = '';
        if (userId) {
            havingFilter = ' AND iid = ?';
            params.push(userId);
        }
        const [results] = await db.query(
            `SELECT
                iid,
                COUNT(*) AS violation_count,
                (SELECT skin FROM user u2
                 WHERE u2.iid = u.iid AND u2.what2 = '確定違規'
                 ORDER BY u2.user_id DESC LIMIT 1) AS skin,
                (SELECT name FROM user u2
                 WHERE u2.iid = u.iid AND u2.what2 = '確定違規'
                 ORDER BY u2.user_id DESC LIMIT 1) AS name,
                (SELECT server FROM user u2
                 WHERE u2.iid = u.iid AND u2.what2 = '確定違規'
                 ORDER BY u2.user_id DESC LIMIT 1) AS server,
                GROUP_CONCAT(what ORDER BY user_id SEPARATOR '；') AS what
             FROM user u
             WHERE what2 = '確定違規'
             GROUP BY iid
             HAVING violation_count >= 3${havingFilter}
             ORDER BY violation_count DESC, iid`,
            params
        );
        const rows = results.map((row) => ({
            iid: row.iid,
            violation_count: row.violation_count,
            skin: row.skin || '',
            name: row.name || '—',
            server: row.server || '—',
            what: '累計 ' + row.violation_count + ' 次確定違規',
            what2: '違規3次'
        }));
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '違規查詢失敗' });
    }
});

// --- 5b. 執行處罰 ---
app.post('/apply_penalty', checkLogin, async (req, res) => {
    try {
        const iid = (req.body.iid || '').trim();
        if (!iid) {
            return res.status(400).json({ success: false, message: '缺少玩家 ID' });
        }
        const [[{ cnt }]] = await db.query(
            `SELECT COUNT(*) AS cnt FROM user WHERE iid = ? AND what2 = '確定違規'`,
            [iid]
        );
        if (cnt < 3) {
            return res.json({
                success: false,
                message: '該玩家尚未達 3 次確定違規，無法處罰'
            });
        }
        const [result] = await db.query(
            `UPDATE user SET what2 = '已處罰' WHERE iid = ? AND what2 = '確定違規'`,
            [iid]
        );
        res.json({
            success: true,
            message: '已對玩家 ' + iid + ' 執行懲罰',
            affectedRows: result.affectedRows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '處罰執行失敗' });
    }
});

// --- 6. 搜尋用戶 ---
app.post('/search_user',checkLogin, async (req, res) => {
    try {
        const userId = req.body.userId;
        const query = `SELECT * FROM user WHERE iid = ?`;
        const [results] = await db.query(query, [userId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error searching user' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});