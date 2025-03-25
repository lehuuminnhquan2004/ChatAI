const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || '60s';

router.post('/login', async (req, res) => {
  try {
    const { masv, password } = req.body;
    
    // Tìm sinh viên theo mã sinh viên
    const [sinhviens] = await pool.execute(
      'SELECT * FROM sinhvien WHERE masv = ?',
      [masv]
    );
    
    if (sinhviens.length === 0) {
      return res.status(401).json({ success: false, message: 'Mã sinh viên không tồn tại' });
    }

    const sinhvien = sinhviens[0];

    // Kiểm tra password
    if (sinhvien.password !== password) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không chính xác' });
    }

    // Kiểm tra xem sinh viên có phải là admin không
    const [admins] = await pool.execute(
      'SELECT * FROM admin WHERE masv = ?',
      [masv]
    );

    const isAdmin = admins.length > 0;

    // Tạo JWT token
    const token = jwt.sign(
      { masv: sinhvien.masv, isAdmin },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    console.log(`Token được tạo với thời gian hết hạn: ${TOKEN_EXPIRATION}`);

    // Trả về thông tin sinh viên và token
    res.json({
      success: true,
      token,
      user: {
        masv: sinhvien.masv,
        tensv: sinhvien.tensv,
        lop: sinhvien.lop,
        chuyennganh: sinhvien.chuyennganh,
        hinhanh: sinhvien.hinhanh,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Route kiểm tra token
router.post('/verify-token', (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({ valid: false, message: 'Không tìm thấy token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token hợp lệ, thông tin:', decoded);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    console.log('Token không hợp lệ hoặc đã hết hạn:', error.message);
    res.status(401).json({ valid: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
});

module.exports = router; 