const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Áp dụng middleware cho tất cả các route
router.use(authenticateToken);

// Lấy thời khóa biểu theo mã sinh viên
router.get('/:masv', async (req, res) => {
  try {
    const { masv } = req.params;
    
    // Kiểm tra quyền truy cập
    if (req.user.masv !== masv) {
      return res.status(403).json({ error: 'Không có quyền truy cập thời khóa biểu của sinh viên khác' });
    }

    // Lấy dữ liệu từ bảng lichhoc và monhoc
    const query = `
      SELECT 
        lh.*,
        mh.tenmh,
        mh.tailieu as giangvien,
        CASE 
          WHEN lh.Ca = 1 THEN '7:00 - 9:30'
          WHEN lh.Ca = 2 THEN '9:35 - 12:05'
          WHEN lh.Ca = 3 THEN '12:35 - 15:05'
          WHEN lh.Ca = 4 THEN '15:10 - 17:40'
          ELSE 'Không xác định'
        END as thoigianhoc
      FROM lichhoc lh
      JOIN monhoc mh ON lh.mamh = mh.mamh
      WHERE lh.masv = ?
      ORDER BY lh.Thu, lh.Ca
    `;
    
    const [rows] = await pool.query(query, [masv]);
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ 
        error: 'Không tìm thấy thời khóa biểu',
        message: 'Không có lịch học cho sinh viên này'
      });
    }

    // Thêm thông tin tổng hợp
    const summary = {
      soMonHoc: new Set(rows.map(item => item.mamh)).size,
      tongSoCa: rows.length
    };

    // Format dữ liệu trả về
    const schedule = rows.map(item => ({
      ...item,
      ngaybatdau: new Date(item.ngaybatdau).toISOString().split('T')[0],
      ngayketthuc: new Date(item.ngayketthuc).toISOString().split('T')[0]
    }));

    res.json({
      schedule,
      summary
    });
  } catch (error) {
    console.error('Lỗi khi lấy thời khóa biểu:', error);
    res.status(500).json({ 
      error: 'Lỗi server',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 