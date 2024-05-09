const express = require('express');
const mysql = require('mysql');
const app = express();
const cors = require('cors');
const port = 3000;

app.use(express.json()); // 使用 JSON 请求中间件
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许来自任何域的请求，可以替换成特定的域名
  res.header('Access-Control-Allow-Methods', 'GET, POST'); // 允许的HTTP方法
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});
const db = mysql.createConnection({
  host: '',
  user: '',
  password: '',
  database: ''
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error: ' + err.stack);
    return;
  }
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
  res.send('Hello, this is the root route!');
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM user', (error, results) => {
    if (error) {
      console.error('Error executing query: ' + error);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      res.json(results);
    }
  });
});

app.post('/delete',(req,res)=>{
  const query = `DELETE FROM user WHERE user_id=?`;
  db.query(query,[req.body.user2],(err,rows)=>{
      if(err){
          res.json({message:'查無資料'})
          console.log(req.body.user_id);
      }else{
          res.json(rows)
      }
  });
});
app.post('/update_status', (req, res) => {
    const userId = req.body.userId;
    const newStatus = req.body.newStatus;
  
    const query = `UPDATE user SET what2=? WHERE user_id=?`;
  
    db.query(query, [newStatus, userId], (err, result) => {
      if (err) {
        console.error('Error executing query: ' + err);
        res.status(500).json({ error: 'Error updating status' });
      } else {
        res.json({ message: 'Status updated successfully' });
      }
    });
  });
app.post('/search_user', (req, res) => {
    const userId = req.body.userId; // 获取要搜索的用户ID
    console.log('Received search request for user with ID:', userId);
  
    const query = `SELECT * FROM user WHERE iid = ?`; // 查询语句，根据用户ID搜索
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Error executing query: ' + err);
        res.status(500).json({ error: 'Error searching user' });
      } else {
        res.json(results); // 返回搜索结果
      }
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
