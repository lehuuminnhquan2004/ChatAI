const path = require('path');
const connection = require('../connectData.js');
const svLogin = require('./login.js');

module.exports = (app) => {
    const login = svLogin(app);

    app.get('/api/thoikhoabieu', (req, res) => {
        const masv = login.getMaSVLogin();
        if (!masv) {
            return res.status(401).json({ error: 'Chưa đăng nhập' });
        }
        
        connection.query('SELECT * FROM lichhoc join monhoc on lichhoc.mamh = monhoc.mamh WHERE masv = ?', [masv], (err, results) => {
            if (err) {
                console.error('Lỗi truy vấn database:', err);
                res.status(500).json({ error: 'Lỗi server' });
                return;
            }
            res.json(results);
        });
    });

    
}; 