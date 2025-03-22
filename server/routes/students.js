const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');

// Cấu hình multer để upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../images'));
  },
  filename: function (req, file, cb) {
    // Đặt tên file là mã sinh viên + timestamp + đuôi file gốc để tránh trùng tên
    const timestamp = Date.now();
    const uniqueSuffix = req.body.masv + '_' + timestamp + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Tăng giới hạn lên 10MB
  },
  fileFilter: function (req, file, cb) {
    // Kiểm tra MIME type của file
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file ảnh!'), false);
    }
  }
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(403).json({
            success: false,
            message: 'Phiên đăng nhập đã hết hạn'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Token không hợp lệ'
        });
      }
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

// API lấy thông tin sinh viên
router.get('/:masv', authenticateToken, async (req, res) => {
  try {
    const { masv } = req.params;

    // Kiểm tra quyền truy cập
    if (req.user.masv !== masv) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bạn không có quyền xem thông tin của sinh viên khác' 
      });
    }

    // Lấy thông tin sinh viên từ database
    const [results] = await pool.execute(
      'SELECT masv, tensv, lop, gioitinh, ngaysinh, chuyennganh, sdt, email, hinhanh FROM sinhvien WHERE masv = ?',
      [masv]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    res.json({
      success: true,
      user: results[0]
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sinh viên:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy thông tin sinh viên'
    });
  }
});

// API cập nhật thông tin sinh viên
router.put('/:masv', authenticateToken, async (req, res) => {
  try {
    const { masv } = req.params;
    const { sdt, email } = req.body;

    // Kiểm tra quyền truy cập
    if (req.user.masv !== masv) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật thông tin của sinh viên khác'
      });
    }

    // Validate dữ liệu
    if (!sdt || !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Validate số điện thoại
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(sdt)) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    // Cập nhật thông tin trong database
    const [result] = await pool.execute(
      'UPDATE sinhvien SET sdt = ?, email = ? WHERE masv = ?',
      [sdt, email, masv]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    // Lấy thông tin sinh viên sau khi cập nhật
    const [updatedUser] = await pool.execute(
      'SELECT masv, tensv, lop, gioitinh, ngaysinh, chuyennganh, sdt, email, hinhanh FROM sinhvien WHERE masv = ?',
      [masv]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin sinh viên:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi cập nhật thông tin'
    });
  }
});

// API upload avatar
router.post('/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { masv } = req.body;

    // Kiểm tra quyền truy cập
    if (req.user.masv !== masv) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền upload avatar cho sinh viên khác'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file ảnh'
      });
    }

    // Log thông tin file
    console.log('File info:', {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Cập nhật đường dẫn ảnh trong database
    const [result] = await pool.execute(
      'UPDATE sinhvien SET hinhanh = ? WHERE masv = ?',
      [req.file.filename, masv]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      hinhanh: req.file.filename,
      fileInfo: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Lỗi khi upload avatar:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Có lỗi xảy ra khi upload avatar'
    });
  }
});

// API đổi mật khẩu
router.put('/:masv/change-password', authenticateToken, async (req, res) => {
  try {
    const { masv } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Kiểm tra quyền truy cập
    if (req.user.masv !== masv) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đổi mật khẩu của sinh viên khác'
      });
    }

    // Validate dữ liệu
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const [students] = await pool.execute(
      'SELECT password FROM sinhvien WHERE masv = ?',
      [masv]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin sinh viên'
      });
    }

    const currentPasswordFromDB = students[0].password;

    // So sánh mật khẩu
    if (currentPasswordFromDB !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không chính xác'
      });
    }

    // Cập nhật mật khẩu mới
    await pool.execute(
      'UPDATE sinhvien SET password = ? WHERE masv = ?',
      [newPassword, masv]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đổi mật khẩu'
    });
  }
});

module.exports = router; 