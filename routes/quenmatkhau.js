const connection = require('../connectData.js');

module.exports = (app) => {
    app.post('/quenmatkhau', (req, res) => {
        const {masvofemail} = req.body;
         // Kiểm tra cả email và mã sinh viên
        const query = "SELECT * FROM sinhvien WHERE email = ? OR masv = ?";
        
        connection.query(query, [masvofemail, masvofemail], (err, results) => {
            if (err) {
                console.error("Lỗi truy vấn:", err);
                return res.status(500).json({
                    success: false,
                    message: "Lỗi truy vấn database"
                });
            }

            if (results.length > 0) {
                
                res.redirect('/quenmatkhau.html?success=1')
            } else {
                res.redirect('/quenmatkhau.html?error=Không tìm thấy tài khoản với thông tin này!')
            }
        });
    });
}