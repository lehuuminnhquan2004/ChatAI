const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

// Route đăng nhập admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Yêu cầu đăng nhập:', { username, password });

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
    });
  }

  try {
    // Kiểm tra kết nối database
    const connection = await pool.getConnection();
    console.log('Đã kết nối với database');

    const query = 'SELECT * FROM admin WHERE name = ? AND password = ?';
    console.log('Query:', query);
    console.log('Parameters:', [username, password]);

    const [results] = await connection.query(query, [username, password]);
    connection.release();
    console.log('Kết quả query:', results);

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const admin = results[0];
    console.log('Admin tìm thấy:', admin);

    // Tạo JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    console.log('Token được tạo thành công');

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      admin: {
        id: admin.id,
        username: admin.name
      }
    });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server',
      error: error.message 
    });
  }
});

// Middleware xác thực admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Không tìm thấy token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

// Route lấy thông tin admin (được bảo vệ)
router.get('/profile', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      username: req.admin.username
    }
  });
});

// Route lấy thống kê
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Lấy tổng số sinh viên
    const [studentsResult] = await connection.query('SELECT COUNT(*) as total FROM sinhvien');
    const totalStudents = studentsResult[0].total;

    // Lấy tổng số môn học
    const [subjectsResult] = await connection.query('SELECT COUNT(*) as total FROM monhoc');
    const totalSubjects = subjectsResult[0].total;

    // Lấy tổng số lịch học
    const [schedulesResult] = await connection.query('SELECT COUNT(*) as total FROM lichhoc');
    const totalSchedules = schedulesResult[0].total;

    // Lấy tổng số cuộc trò chuyện
    const [chatsResult] = await connection.query('SELECT COUNT(*) as total FROM lichsuchat');
    const totalChats = chatsResult[0].total;

    // Thống kê chi tiết về sự kiện
    const eventStatsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN thoigianbatdau > NOW() THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN thoigianketthuc < NOW() THEN 1 ELSE 0 END) as past
      FROM sukien
    `;
    
    const [eventStats] = await connection.query(eventStatsQuery);

    connection.release();

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalSubjects,
        totalSchedules,
        totalChats,
        eventStats: {
          total: eventStats[0].total || 0,
          upcoming: eventStats[0].upcoming || 0,
          past: eventStats[0].past || 0
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server',
      error: error.message 
    });
  }
});

module.exports = router; 