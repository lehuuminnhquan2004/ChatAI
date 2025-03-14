const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu từ form
app.use(express.json());

// Thêm middleware để phục vụ file tĩnh từ thư mục public
app.use(express.static(path.join(__dirname, 'public')));

// Import tất cả các route từ thư mục routes
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(file => {
    if (file.endsWith('.js')) {
        const route = require(path.join(routesPath, file));
        route(app);
    }
});

// Port để chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
}); 