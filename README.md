# Hệ Thống Chat AI Hỗ Trợ Sinh Viên

Hệ thống chat AI được xây dựng để hỗ trợ sinh viên tra cứu thông tin cá nhân, lịch học và các vấn đề liên quan đến học tập. Sử dụng công nghệ Google Gemini AI để tạo ra các phản hồi thông minh và chính xác.

## Công Nghệ Sử Dụng

### Frontend
- React.js
- Material-UI
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Google Gemini AI

## Yêu Cầu Hệ Thống

- Node.js (v14.0.0 trở lên)
- MySQL (v8.0 trở lên)
- NPM hoặc Yarn

## Cài Đặt

1. **Clone dự án**
```bash
git clone <repository-url>
cd ChatAI
```

2. **Cài đặt dependencies cho Backend**
```bash
cd server
npm install
```

3. **Cài đặt dependencies cho Frontend**
```bash
cd client
npm install
```



5. **Import cơ sở dữ liệu**
- Tạo database `chatbox` trong MySQL
- Import file `chatbox.sql` vào database vừa tạo

## Khởi Chạy Ứng Dụng

1. **Khởi động Backend**
```bash
cd server
npm start
```
Server sẽ chạy tại `http://localhost:5000`

2. **Khởi động Frontend**
```bash
cd client
npm start
```
Ứng dụng sẽ chạy tại `http://localhost:3000`

## Tính Năng Chính

1. **Xác Thực**
- Đăng nhập bằng mã sinh viên và mật khẩu
- JWT Authentication
- Tự động đăng xuất sau 30 phút không hoạt động

2. **Chat AI**
- Tra cứu thông tin cá nhân
- Xem lịch học
- Hỏi đáp thông minh với AI
- Lưu trữ lịch sử chat

3. **Giao Diện**
- Responsive design
- Dark/Light mode
- Material-UI components
- Tailwind CSS styling

## Cấu Trúc Thư Mục

```
ChatAI/
├── client/                 # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   └── layouts/       # Layout components
│   └── package.json
├── server/                # Backend Node.js
│   ├── config/           # Database configuration
│   ├── routes/           # API routes
│   ├── images/           # Stored images
│   └── package.json
└── README.md
```

## API Endpoints

### Auth Routes
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/verify-token` - Kiểm tra token

### Chat Routes
- `POST /api/chat` - Gửi tin nhắn đến AI
- `GET /api/chat/history/:masv` - Lấy lịch sử chat

## Bảo Mật

- Sử dụng JWT cho xác thực
- Mã hóa mật khẩu
- Kiểm tra token tự động
- Xử lý CORS
- Bảo vệ các routes với middleware

## Lưu Ý

- Đảm bảo MySQL đang chạy trước khi khởi động server
- Cấu hình file `.env` với các thông số phù hợp
- Sử dụng HTTPS trong môi trường production
- Thay đổi JWT_SECRET trong production

## Đóng Góp

Mọi đóng góp đều được chào đón. Vui lòng:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## Giấy Phép

Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## Liên Hệ

Tên của bạn - email@example.com

Project Link: [https://github.com/yourusername/ChatAI](https://github.com/yourusername/ChatAI) 