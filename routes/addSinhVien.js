const connection = require('../connectData.js');

module.exports = (app) => {
    app.post('/addsinhvien', (req, res) => {
        const {masv, password, tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email} = req.body;
        const sql = 'INSERT INTO sinhvien (masv, password, tensv, ngaysinh, gioitinh, lop,chuyennganh, sdt, email) VALUES (?,?,?,?,?,?,?,?,?)';
        connection.query(sql, [masv, password, tensv, ngaysinh, gioitinh, lop, chuyennganh, sdt, email], (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn database:', err);
                res.status(500).json({ error: 'Lỗi server' });
            }
            else{
                
                res.json({success: true, message: 'Thêm sinh viên thành công'});
            }
        });
    });
};
