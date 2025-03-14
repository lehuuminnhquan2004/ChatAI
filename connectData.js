const mysql=require('mysql');
const express=require("express");
const app=express();

// Thêm middleware để xử lý JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const dbConfig={
    host:'localhost',
    user:'root',
    password:'',
    database:'chatbox'
};

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if(err) {
        console.error('Lỗi kết nối database:', err);
        return;
    }
    console.log('Đã kết nối thành công đến database');
});

// Export connection để sử dụng ở file khác
module.exports = connection;
    