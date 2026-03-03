# HỆ THỐNG CHAT AI HỖ TRỢ SINH VIÊN

Hệ thống chat AI thông minh được xây dựng để hỗ trợ sinh viên tra cứu thông tin học tập và tương tác với nhà trường. Sử dụng công nghệ Google Gemini AI để tạo ra trải nghiệm chat tự nhiên và chính xác.

## 📋 Mục lục

1. [Tính năng](#tính-năng)
2. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
3. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
4. [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
5. [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
6. [API Documentation](#api-documentation)
7. [Cấu trúc thư mục](#cấu-trúc-thư-mục)
8. [Bảo mật](#bảo-mật)
9. [Đóng góp](#đóng-góp)
10. [Giấy phép](#giấy-phép)

## ✨ Tính năng

### 🔐 Xác thực & Bảo mật
- Đăng nhập bằng mã sinh viên/mật khẩu
- Phân quyền sinh viên/admin
- Tự động đăng xuất sau 30 phút
- Quên mật khẩu & đổi mật khẩu

### 💬 Chat AI
- Chat với AI thông minh
- Tra cứu thông tin cá nhân
- Xem lịch học, điểm số
- Lưu trữ lịch sử chat
- Hỗ trợ nhập giọng nói

### 📅 Quản lý học tập
- Xem lịch học chi tiết
- Đăng ký sự kiện
- Tích lũy điểm CTXH
- Cập nhật thông tin cá nhân

### 👨‍💼 Quản trị viên
- Quản lý sinh viên
- Quản lý môn học & lịch học
- Quản lý sự kiện
- Theo dõi chat của sinh viên

## 🛠 Công nghệ sử dụng

### Frontend
- React.js
- Material-UI
- Tailwind CSS
- Axios
- Web Speech API

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Google Gemini AI

## 💻 Yêu cầu hệ thống

- Node.js (v14.0.0 trở lên)
- MySQL (v8.0 trở lên)
- NPM hoặc Yarn
- Modern web browser (Chrome, Firefox, Edge)
- Microphone (cho tính năng voice chat)

## 📥 Hướng dẫn cài đặt

### 1. Clone dự án
```bash
git clone https://github.com/lehuuminnhquan2004/ChatAI.git
cd chatbox
```

### 2. Cài đặt Backend
```bash
cd server
npm install
```

Tạo file .env trong thư mục server với nội dung:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=chatbox
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Cài đặt Frontend
```bash
cd client
npm install
```

Tạo file .env trong thư mục client:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Cài đặt Database
1. Tạo database MySQL:
```sql
CREATE DATABASE chatbox;
```

2. Import dữ liệu mẫu:
```bash
mysql -u username -p chatbox < chatbox.sql
```

## 🚀 Hướng dẫn sử dụng

### Khởi động ứng dụng

1. Khởi động Backend:
```bash
cd server
npm start
```
Server sẽ chạy tại `http://localhost:5000`

2. Khởi động Frontend:
```bash
cd client
npm start
```
Ứng dụng sẽ chạy tại `http://localhost:3000`

### Tài khoản mặc định

**Sinh viên:**
- Username: DH52201286
- Password: quanle2004

**Admin:**
- Username: DH52201286
- Password: quanle2004

## 📚 API Documentation

### Auth Routes
```
POST /api/auth/login
POST /api/auth/verify-token
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Chat Routes
```
POST /api/chat
GET /api/chat/history/:masv
```

### Student Routes
```
GET /api/profile/:masv
PUT /api/profile/update
POST /api/profile/change-password
```

### Admin Routes
```
GET /api/admin/students
POST /api/admin/students/add
PUT /api/admin/students/:masv
DELETE /api/admin/students/:masv
```

## 📁 Cấu trúc thư mục

```
chatbox/
├── client/                 # Frontend React
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── admin/        # Admin features
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   └── layouts/      # Layout components
├── server/                # Backend Node.js
│   ├── config/           # Database config
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── images/           # Uploaded images
└── chatbox.sql           # Database structure
```

## 🔒 Bảo mật

- JWT Authentication
- Password hashing
- Role-based access control
- Auto logout
- API rate limiting
- SQL injection prevention
- XSS protection
- CORS configuration

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Các bước đóng góp:

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 Giấy phép

Dự án được phân phối dưới giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 📞 Liên hệ & Hỗ trợ

- **Email:** lehuuminhquan2004@gmail.com
- **Website:** https://github.com/lehuuminnhquan2004/ChatAI.git


## 🙏 Cảm ơn

Cảm ơn bạn đã quan tâm đến dự án! Nếu thấy hữu ích, hãy cho dự án một ⭐️! 
