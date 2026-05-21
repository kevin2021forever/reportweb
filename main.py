from flask import Flask, render_template, jsonify
import mysql.connector

app = Flask(__name__, template_folder='.')

# 连接到 MySQL 数据库
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="mammonc3322",
    database="web2"
)

# 创建游标对象
mycursor = mydb.cursor()

# 定义路由，用于显示数据的网页
@app.route('/')
def show_data():
    # 执行查询
    mycursor.execute("SELECT * FROM user")
    # 获取查询结果
    data = mycursor.fetchall()
    # 渲染网页并将数据传递给模板
    return render_template('webtest.html', data=data)

# 定义路由，用于重新加载数据
@app.route('/reload-data', methods=['GET'])
def reload_data():
    # 执行查询
    mycursor.execute("SELECT * FROM user")
    # 获取查询结果
    data = mycursor.fetchall()
    # 返回数据给前端
    print("Reloaded data:", data)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)