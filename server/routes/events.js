const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục public/event tồn tại
const uploadDir = path.join(__dirname, '../../client/public/event');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer để xử lý file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Giữ nguyên tên file gốc
    cb(null, file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
}).single('hinhanh');

// Route upload ảnh
router.post('/upload', auth, (req, res) => {
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy file ảnh'
      });
    }

    // Chỉ trả về tên file
    res.json({
      success: true,
      url: req.file.filename,
      message: 'Upload ảnh thành công'
    });
  });
});

// Lấy danh sách sự kiện
router.get('/', auth, async (req, res) => {
    try {
        const [events] = await pool.execute('SELECT * FROM sukien ORDER BY thoigianbatdau DESC');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sự kiện', error: error.message });
    }
});

// Lấy danh sách sự kiện đã đăng ký của sinh viên
router.get('/registered/:masv', auth, async (req, res) => {
    try {
        const [events] = await pool.execute(
            'SELECT s.* FROM sukien s INNER JOIN dangky_sukien d ON s.mask = d.mask WHERE d.masv = ?',
            [req.params.masv]
        );
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sự kiện đã đăng ký', error: error.message });
    }
});

// Đăng ký tham gia sự kiện
router.post('/register', auth, async (req, res) => {
    try {
        const { mask, masv } = req.body;
        
        // Kiểm tra xem sinh viên đã đăng ký sự kiện này chưa
        const [existing] = await pool.execute(
            'SELECT * FROM dangky_sukien WHERE mask = ? AND masv = ?',
            [mask, masv]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Bạn đã đăng ký sự kiện này rồi' });
        }

        // Thêm đăng ký mới
        await pool.execute(
            'INSERT INTO dangky_sukien (mask, masv, ngaydangky) VALUES (?, ?, NOW())',
            [mask, masv]
        );

        res.json({ message: 'Đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng ký sự kiện', error: error.message });
    }
});

// Hủy đăng ký sự kiện
router.delete('/unregister', auth, async (req, res) => {
    try {
        const { mask, masv } = req.body;
                
        await pool.execute(
            'DELETE FROM dangky_sukien WHERE mask = ? AND masv = ?',
            [mask, masv]
        );

        res.json({ message: 'Hủy đăng ký thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi hủy đăng ký sự kiện', error: error.message });
    }
});

// Thêm sự kiện mới
router.post('/', auth, async (req, res) => {
    try {
        const { mask, tensk, noidung, hinhanh, thoigianbatdau, thoigianketthuc, ctxh, drl } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO sukien (mask, tensk, noidung, hinhanh, thoigianbatdau, thoigianketthuc, ctxh, drl) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [mask, tensk, noidung, hinhanh, thoigianbatdau, thoigianketthuc, ctxh, drl]
        );
        
        res.status(201).json({ message: 'Thêm sự kiện thành công', id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm sự kiện', error: error.message });
    }
});

// Cập nhật sự kiện
router.put('/:mask', auth, async (req, res) => {
    try {
        const { mask } = req.params;
        const { tensk, noidung, hinhanh, thoigianbatdau, thoigianketthuc, ctxh, drl } = req.body;
        
        // Nếu có ảnh mới, xóa ảnh cũ
        if (hinhanh) {
            const [oldEvent] = await pool.execute('SELECT hinhanh FROM sukien WHERE mask = ?', [mask]);
            if (oldEvent.length > 0 && oldEvent[0].hinhanh) {
                const oldImagePath = path.join(uploadDir, oldEvent[0].hinhanh);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }
        
        // Chỉ lưu tên file vào database
        const imageFilename = hinhanh ? hinhanh.split('/').pop() : null;
        
        await pool.execute(
            'UPDATE sukien SET tensk = ?, noidung = ?, hinhanh = ?, thoigianbatdau = ?, thoigianketthuc = ?, ctxh = ?, drl = ? WHERE mask = ?',
            [tensk, noidung, imageFilename, thoigianbatdau, thoigianketthuc, ctxh, drl, mask]
        );
        
        res.json({ message: 'Cập nhật sự kiện thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật sự kiện', error: error.message });
    }
});

// Xóa sự kiện
router.delete('/:mask', auth, async (req, res) => {
    try {
        const { mask } = req.params;
        
        await pool.execute('DELETE FROM sukien WHERE mask = ?', [mask]);
        
        res.json({ message: 'Xóa sự kiện thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sự kiện', error: error.message });
    }
});

module.exports = router;