const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const forgotPasswordRoutes = require('./routes/forgotPassword');
const pool = require('./config/db');
const chatRoutes = require('./routes/chatbox');
const scheduleRoutes = require('./routes/schedule');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');

// Cấu hình dotenv để sử dụng biến môi trường từ file .env
dotenv.config();

const app = express();

// Cấu hình CORS để cho phép các yêu cầu từ các nguồn khác nhau
app.use(cors());
app.use(express.json());

// Middleware để log các yêu cầu đến server
app.use((req, res, next) => {
  next();
});

// Phục vụ file tĩnh từ thư mục images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Kiểm tra kết nối database
pool.getConnection()
  .then(connection => {
    console.log('Đã kết nối với MySQL');
    connection.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối MySQL:', err);
  });

// Route kiểm tra hoạt động của API
app.get('/api/test', (req, res) => {
  res.json({ message: 'API đang hoạt động!' });
});

// Định nghĩa các routes chính
app.use('/api/auth', authRoutes);
app.use('/api/forgot-password', forgotPasswordRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admin', adminRoutes);

// Xử lý các yêu cầu không tìm thấy (404)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
}); 