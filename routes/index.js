const path = require('path');

module.exports = (app) => {
    // Route cho trang chủ
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
    });
}; 