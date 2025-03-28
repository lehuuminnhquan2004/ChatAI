const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Tạo thư mục uploads nếu chưa tồn tại
const createUploadsDir = async () => {
  const uploadDir = 'server/uploads/subjects';
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

createUploadsDir().catch(console.error);

// Kiểm tra loại file được phép
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, PPT, PPTX'), false);
  }
};

// Cấu hình multer để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await createUploadsDir();
    cb(null, 'server/uploads/subjects');
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất và an toàn
    const sanitizedMamh = req.body.mamh.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${sanitizedMamh}-${timestamp}-${randomSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
}).single('tailieu');

// Middleware xử lý lỗi multer
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File quá lớn. Kích thước tối đa là 10MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Lỗi khi tải file lên: ' + err.message
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
          tailieu_path VARCHAR(255) NULL
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
       CASE WHEN tailieu_path IS NOT NULL THEN 1 ELSE 0 END as has_tailieu 
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

    // Lấy đường dẫn tài liệu từ database
    const [documents] = await connection.query(
      'SELECT tailieu_path, tenmh FROM monhoc WHERE mamh = ? AND tailieu_path IS NOT NULL',
      [mamh]
    );

    if (documents.length === 0 || !documents[0].tailieu_path) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu cho môn học này'
      });
    }

    const filePath = path.join(process.cwd(), documents[0].tailieu_path);

    // Kiểm tra file có tồn tại
    try {
      await fs.access(filePath);
    } catch (error) {
      // Nếu file không tồn tại, cập nhật database
      await connection.query(
        'UPDATE monhoc SET tailieu_path = NULL WHERE mamh = ?',
        [mamh]
      );
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tồn tại trên server'
      });
    }

    // Lấy extension của file
    const extension = path.extname(documents[0].tailieu_path);
    const sanitizedSubjectName = documents[0].tenmh.replace(/[^a-zA-Z0-9]/g, '_');

    // Đặt tên file download thân thiện hơn
    const downloadFileName = `${sanitizedSubjectName}_${mamh}${extension}`;

    // Gửi file
    res.download(filePath, downloadFileName);

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
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin môn học'
      });
    }

    if (isNaN(sotc) || sotc <= 0) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
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

    // Insert new subject with file path if provided
    const tailieu_path = req.file ? req.file.path : null;

    await connection.query(
      'INSERT INTO monhoc (mamh, tenmh, sotc, tailieu_path) VALUES (?, ?, ?, ?)',
      [mamh, tenmh, sotc, tailieu_path]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm môn học thành công',
      subject: {
        mamh,
        tenmh,
        sotc,
        has_tailieu: !!tailieu_path
      }
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
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
  let oldFilePath = null;
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

    // Kiểm tra môn học tồn tại và lấy đường dẫn file cũ
    const [existing] = await connection.query(
      'SELECT tailieu_path FROM monhoc WHERE mamh = ?',
      [mamh]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }

    oldFilePath = existing[0].tailieu_path;

    // Cập nhật môn học với đường dẫn file mới nếu được cung cấp
    if (req.file) {
      await connection.query(
        'UPDATE monhoc SET tenmh = ?, sotc = ?, tailieu_path = ? WHERE mamh = ?',
        [tenmh, sotc, req.file.path, mamh]
      );

      // Xóa file cũ nếu tồn tại
      if (oldFilePath) {
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }
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
        has_tailieu: req.file ? true : !!oldFilePath
      }
    });
  } catch (error) {
    // Xóa file mới nếu có lỗi xảy ra
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
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

    // Lấy thông tin môn học và đường dẫn file
    const [existing] = await connection.query(
      'SELECT tailieu_path FROM monhoc WHERE mamh = ?',
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

    // Xóa file tài liệu nếu tồn tại
    if (existing[0].tailieu_path) {
      try {
        await fs.unlink(existing[0].tailieu_path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

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

module.exports = router; const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Tạo thư mục uploads nếu chưa tồn tại
const createUploadsDir = async () => {
  const uploadDir = 'server/uploads/subjects';
  try {
    await fs.access(uploadDir);
  } catch (error) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
};

createUploadsDir().catch(console.error);

// Kiểm tra loại file được phép
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, PPT, PPTX'), false);
  }
};

// Cấu hình multer để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await createUploadsDir();
    cb(null, 'server/uploads/subjects');
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất và an toàn
    const sanitizedMamh = req.body.mamh.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${sanitizedMamh}-${timestamp}-${randomSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
}).single('tailieu');

// Middleware xử lý lỗi multer
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File quá lớn. Kích thước tối đa là 10MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Lỗi khi tải file lên: ' + err.message
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
          tailieu_path VARCHAR(255) NULL
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
       CASE WHEN tailieu_path IS NOT NULL THEN 1 ELSE 0 END as has_tailieu 
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

    // Lấy đường dẫn tài liệu từ database
    const [documents] = await connection.query(
      'SELECT tailieu_path, tenmh FROM monhoc WHERE mamh = ? AND tailieu_path IS NOT NULL',
      [mamh]
    );

    if (documents.length === 0 || !documents[0].tailieu_path) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu cho môn học này'
      });
    }

    const filePath = path.join(process.cwd(), documents[0].tailieu_path);

    // Kiểm tra file có tồn tại
    try {
      await fs.access(filePath);
    } catch (error) {
      // Nếu file không tồn tại, cập nhật database
      await connection.query(
        'UPDATE monhoc SET tailieu_path = NULL WHERE mamh = ?',
        [mamh]
      );
      return res.status(404).json({
        success: false,
        message: 'Tài liệu không tồn tại trên server'
      });
    }

    // Lấy extension của file
    const extension = path.extname(documents[0].tailieu_path);
    const sanitizedSubjectName = documents[0].tenmh.replace(/[^a-zA-Z0-9]/g, '_');

    // Đặt tên file download thân thiện hơn
    const downloadFileName = `${sanitizedSubjectName}_${mamh}${extension}`;

    // Gửi file
    res.download(filePath, downloadFileName);

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
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin môn học'
      });
    }

    if (isNaN(sotc) || sotc <= 0) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
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

    // Insert new subject with file path if provided
    const tailieu_path = req.file ? req.file.path : null;

    await connection.query(
      'INSERT INTO monhoc (mamh, tenmh, sotc, tailieu_path) VALUES (?, ?, ?, ?)',
      [mamh, tenmh, sotc, tailieu_path]
    );

    res.status(201).json({
      success: true,
      message: 'Thêm môn học thành công',
      subject: {
        mamh,
        tenmh,
        sotc,
        has_tailieu: !!tailieu_path
      }
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
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
  let oldFilePath = null;
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

    // Kiểm tra môn học tồn tại và lấy đường dẫn file cũ
    const [existing] = await connection.query(
      'SELECT tailieu_path FROM monhoc WHERE mamh = ?',
      [mamh]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy môn học'
      });
    }

    oldFilePath = existing[0].tailieu_path;

    // Cập nhật môn học với đường dẫn file mới nếu được cung cấp
    if (req.file) {
      await connection.query(
        'UPDATE monhoc SET tenmh = ?, sotc = ?, tailieu_path = ? WHERE mamh = ?',
        [tenmh, sotc, req.file.path, mamh]
      );

      // Xóa file cũ nếu tồn tại
      if (oldFilePath) {
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.error('Error deleting old file:', err);
        }
      }
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
        has_tailieu: req.file ? true : !!oldFilePath
      }
    });
  } catch (error) {
    // Xóa file mới nếu có lỗi xảy ra
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
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

    // Lấy thông tin môn học và đường dẫn file
    const [existing] = await connection.query(
      'SELECT tailieu_path FROM monhoc WHERE mamh = ?',
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

    // Xóa file tài liệu nếu tồn tại
    if (existing[0].tailieu_path) {
      try {
        await fs.unlink(existing[0].tailieu_path);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }

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
