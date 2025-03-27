const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');

// Cấu hình multer để xử lý file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
}).single('tailieu');

// Middleware xử lý lỗi multer
const handleUpload = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File quá lớn. Kích thước tối đa là 10MB'
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

// Kiểm tra kết nối database
const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    return false;
  }
};

// Lấy danh sách môn học
router.get('/', async (req, res) => {
  let connection;
  try {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return res.status(500).json({
        success: false,
        message: 'Không thể kết nối đến database. Vui lòng kiểm tra cấu hình.'
      });
    }

    // Lấy tham số phân trang từ query string và chuyển đổi sang số
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    connection = await pool.getConnection();

    if (!process.env.DB_NAME) {
      throw new Error('Thiếu biến môi trường DB_NAME');
    }
    
    // Kiểm tra và tạo bảng nếu chưa tồn tại
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'monhoc'
    `, [process.env.DB_NAME]);

    if (tables.length === 0) {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS monhoc (
          mamh VARCHAR(50) NOT NULL PRIMARY KEY,
          tenmh VARCHAR(255) NOT NULL,
          sotc INT NOT NULL,
          tailieu LONGBLOB NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
      `);
    }

    // Đếm tổng số môn học
    const [totalRows] = await connection.query('SELECT COUNT(*) as total FROM monhoc');
    const total = totalRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // Lấy danh sách môn học với phân trang
    const [subjects] = await connection.query(
      `SELECT mamh, tenmh, sotc, 
       CASE WHEN tailieu IS NOT NULL THEN 1 ELSE 0 END as has_tailieu 
       FROM monhoc 
       ORDER BY mamh ASC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    res.json({
      success: true,
      subjects: subjects.map(subject => ({
        mamh: subject.mamh,
        tenmh: subject.tenmh,
        sotc: subject.sotc,
        has_tailieu: subject.has_tailieu === 1
      })),
      pagination: {
        total,
        currentPage: page,
        totalPages,
        from: offset + 1,
        to: Math.min(offset + subjects.length, total)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (error) {
        // Bỏ qua lỗi khi đóng kết nối
      }
    }
  }
});

// Route để tải tài liệu
router.get('/:mamh/tailieu', async (req, res) => {
  let connection;
  try {
    const { mamh } = req.params;
    
    connection = await pool.getConnection();
    
    // Lấy tài liệu từ database
    const [documents] = await connection.query(
      'SELECT tailieu FROM monhoc WHERE mamh = ? AND tailieu IS NOT NULL',
      [mamh]
    );

    if (documents.length === 0 || !documents[0].tailieu) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu cho môn học này'
      });
    }

    // Đặt headers cho download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tailieu_${mamh}.pdf`);
    res.setHeader('Content-Length', documents[0].tailieu.length);
    
    // Gửi file
    res.end(documents[0].tailieu);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server: ' + error.message
    });
  } finally {
    if (connection) connection.release();
  }
});

// Thêm môn học mới
router.post('/', handleUpload, async (req, res) => {
  let connection;
  try {
    const { mamh, tenmh, sotc } = req.body;

    // Validate input
    if (!mamh || !tenmh || !sotc) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin môn học'
      });
    }

    if (isNaN(sotc) || sotc <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tín chỉ phải là số dương'
      });
    }

    connection = await pool.getConnection();
    
    // Check if subject exists
    const [existing] = await connection.query(
      'SELECT mamh FROM monhoc WHERE mamh = ?',
      [mamh]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Mã môn học đã tồn tại'
      });
    }

    // Insert new subject with file if provided
    const tailieu = req.file ? req.file.buffer : null;
    
    await connection.query(
      'INSERT INTO monhoc (mamh, tenmh, sotc, tailieu) VALUES (?, ?, ?, ?)',
      [mamh, tenmh, sotc, tailieu]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm môn học thành công',
      subject: {
        mamh,
        tenmh,
        sotc,
        has_tailieu: !!tailieu
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

// Cập nhật môn học
router.put('/:mamh', handleUpload, async (req, res) => {
  let connection;
  try {
    const { tenmh, sotc } = req.body;
    const { mamh } = req.params;

    // Xác thực đầu vào
    if (!tenmh || !sotc) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin môn học'
      });
    }

    if (isNaN(sotc) || sotc <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tín chỉ phải là số dương'
      });
    }

    connection = await pool.getConnection();

    // Kiêmr tra môn học tồn tại
    const [existing] = await connection.query(
      'SELECT * FROM monhoc WHERE mamh = ?',
      [mamh]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }

    // Cập nhật môn họchọc với tập tin nếu được cung cấp
    if (req.file) {
      await connection.query(
        'UPDATE monhoc SET tenmh = ?, sotc = ?, tailieu = ? WHERE mamh = ?',
        [tenmh, sotc, req.file.buffer, mamh]
      );
    } else {
      await connection.query(
        'UPDATE monhoc SET tenmh = ?, sotc = ? WHERE mamh = ?',
        [tenmh, sotc, mamh]
      );
    }

    res.json({
      success: true,
      message: 'Cập nhật môn học thành công',
      subject: {
        mamh,
        tenmh,
        sotc,
        has_tailieu: req.file ? true : !!existing[0].tailieu
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

// Xóa môn học
router.delete('/:mamh', async (req, res) => {
  let connection;
  try {
    const { mamh } = req.params;
    
    connection = await pool.getConnection();
    
    // Kiêm tra môn học tồn tại
    const [existing] = await connection.query(
      'SELECT * FROM monhoc WHERE mamh = ?',
      [mamh]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }

    // Xóa các lịch học liên quan trước
    await connection.query('DELETE FROM lichhoc WHERE mamh = ?', [mamh]);
    
    // Sau đó xóa môn học
    await connection.query('DELETE FROM monhoc WHERE mamh = ?', [mamh]);

    res.json({
      success: true,
      message: 'Xóa môn học thành công'
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

module.exports = router; 