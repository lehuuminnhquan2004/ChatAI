const connection = require('../connectData.js');

// Biến để lưu trữ masv
let masvlogin = null;

module.exports = (app) => {
    app.post('/login', (req, res) => {
        const {masv, password} = req.body;

        const masv_password = "SELECT * FROM sinhvien WHERE masv = ? AND password = ?";
        
        connection.query(masv_password, [masv, password], (err, results) => {
            if (err) {
                console.error("Lỗi truy vấn:", err);
                return res.status(500).json({
                    success: false,
                    message: "Lỗi truy vấn database"
                });
            }

            if (results.length > 0) {
                // Lưu masv khi đăng nhập thành công
                masvlogin = results[0].masv;
                res.redirect('/thoikhoabieu.html')
            } else {
               
                res.redirect('/?error=ma sv hoac mat khau sai!')
            }
        });
    });

    return {
        getMaSVLogin: () => masvlogin
    };
}; 