const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const multer = require('multer');

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
}).single('hinhanh');

// Middleware xử lý lỗi multer
const handleUpload = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File quá lớn. Kích thước tối đa là 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Lỗi khi tải file lên'
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Lấy danh sách sinh viên
router.get('/', async (req, res) => {
  let connection;
  try {
    // Lấy tham số phân trang từ query string và chuyển đổi sang số
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    // Đếm tổng số sinh viên
    const [totalRows] = await connection.query('SELECT COUNT(*) as total FROM sinhvien');
    const total = totalRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Lấy danh sách sinh viên với phân trang
    const [students] = await connection.query(
      `SELECT masv, tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email, hinhanh, ctxh 
       FROM sinhvien 
       ORDER BY masv ASC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      students: students.map(student => ({
        ...student,
        ngaysinh: student.ngaysinh.toISOString().split('T')[0]
      })),
      pagination: {
        total,
        currentPage: page,
        totalPages,
        from: offset + 1,
        to: Math.min(offset + students.length, total)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Thêm sinh viên mới
router.post('/', handleUpload, async (req, res) => {
  let connection;
  try {
    const { masv, tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email } = req.body;

    // Validate input
    if (!masv || !tensv || !ngaysinh || !gioitinh || !lop || !chuyennganh || !sdt || !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin sinh viên'
      });
    }

    connection = await pool.getConnection();
    
    // Check if student exists
    const [existing] = await connection.query(
      'SELECT masv FROM sinhvien WHERE masv = ?',
      [masv]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã sinh viên đã tồn tại'
      });
    }

    // Insert new student with image if provided
    const hinhanh = req.file ? req.file.buffer : null;
    
    await connection.query(
      'INSERT INTO sinhvien (masv, password, tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email, hinhanh, ctxh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [masv, masv, tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email, hinhanh]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm sinh viên thành công',
      student: {
        masv,
        tensv,
        ngaysinh,
        gioitinh,
        lop,
        chuyennganh,
        sdt,
        email,
        hinhanh: hinhanh ? true : false,
        ctxh: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Cập nhật thông tin sinh viên
router.put('/:masv', handleUpload, async (req, res) => {
  let connection;
  try {
    const { tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email } = req.body;
    const { masv } = req.params;

    // Validate input
    if (!tensv || !ngaysinh || !gioitinh || !lop || !chuyennganh || !sdt || !email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin sinh viên'
      });
    }

    connection = await pool.getConnection();

    // Check if student exists
    const [existing] = await connection.query(
      'SELECT * FROM sinhvien WHERE masv = ?',
      [masv]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    // Update student with image if provided
    if (req.file) {
      await connection.query(
        'UPDATE sinhvien SET tensv = ?, ngaysinh = ?, gioitinh = ?, lop = ?, chuyennganh = ?, sdt = ?, email = ?, hinhanh = ? WHERE masv = ?',
        [tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email, req.file.buffer, masv]
      );
    } else {
      await connection.query(
        'UPDATE sinhvien SET tensv = ?, ngaysinh = ?, gioitinh = ?, lop = ?, chuyennganh = ?, sdt = ?, email = ? WHERE masv = ?',
        [tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email, masv]
      );
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin sinh viên thành công',
      student: {
        masv,
        tensv,
        ngaysinh,
        gioitinh,
        lop,
        chuyennganh,
        sdt,
        email,
        hinhanh: req.file ? true : !!existing[0].hinhanh,
        ctxh: existing[0].ctxh
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Xóa sinh viên
router.delete('/:masv', async (req, res) => {
  let connection;
  try {
    const { masv } = req.params;
    
    connection = await pool.getConnection();
    
    // Check if student exists
    const [existing] = await connection.query(
      'SELECT * FROM sinhvien WHERE masv = ?',
      [masv]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên'
      });
    }

    // Delete related records first
    await connection.query('DELETE FROM lichhoc WHERE masv = ?', [masv]);
    await connection.query('DELETE FROM lichsuchat WHERE masv = ?', [masv]);
    await connection.query('DELETE FROM nhachen WHERE masv = ?', [masv]);
    
    // Then delete student
    await connection.query('DELETE FROM sinhvien WHERE masv = ?', [masv]);

    res.json({
      success: true,
      message: 'Xóa sinh viên thành công'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Lấy ảnh sinh viên
router.get('/:masv/hinhanh', async (req, res) => {
  let connection;
  try {
    const { masv } = req.params;
    
    connection = await pool.getConnection();
    
    // Get student image from database
    const [students] = await connection.query(
      'SELECT hinhanh FROM sinhvien WHERE masv = ? AND hinhanh IS NOT NULL',
      [masv]
    );

    if (students.length === 0 || !students[0].hinhanh) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ảnh sinh viên'
      });
    }

    // Set headers for image download
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `inline; filename=hinhanh_${masv}.jpg`);
    
    // Send image
    res.end(students[0].hinhanh);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router; 