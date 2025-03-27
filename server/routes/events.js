const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

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
        
        await pool.execute(
            'UPDATE sukien SET tensk = ?, noidung = ?, hinhanh = ?, thoigianbatdau = ?, thoigianketthuc = ?, ctxh = ?, drl = ? WHERE mask = ?',
            [tensk, noidung, hinhanh, thoigianbatdau, thoigianketthuc, ctxh, drl, mask]
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