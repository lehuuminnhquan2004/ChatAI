const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./routes/auth");
const forgotPasswordRoutes = require("./routes/forgotPassword");
const pool = require("./config/db");
const chatRoutes = require("./routes/chatbox");
const scheduleRoutes = require("./routes/schedule");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const eventRoutes = require("./routes/events");
const subjectRoutes = require("./routes/subjects");
const studentRoutes = require("./routes/admin/students");
const adminChatRouter = require("./routes/adminChatbox");
const teachersRouter = require("./routes/teachers");

// Cấu hình dotenv để sử dụng biến môi trường từ file .env
dotenv.config();

const app = express();

// Cấu hình CORS để cho phép các yêu cầu từ các nguồn khác nhau
app.use(cors());
app.use(express.json());

// Tăng giới hạn kích thước request để xử lý file
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Phục vụ file tĩnh từ thư mục images
app.use("/images", express.static(path.join(__dirname, "images")));

// Kiểm tra kết nối database
pool
  .getConnection()
  .then((connection) => {
    connection.release();
  })
  .catch((err) => {
    // Bỏ qua lỗi kết nối
  });

// Route kiểm tra hoạt động của API
app.get("/api/test", (req, res) => {
  res.json({ message: "API đang hoạt động!" });
});

// Định nghĩa các routes chính
app.use("/api/auth", authRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/admin/students", studentRoutes);
app.use("/api/admin/chat", adminChatRouter);
app.use("/api/teachers", teachersRouter);

// Xử lý các yêu cầu không tìm thấy (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    path: req.path,
    method: req.method,
  });
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message,
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
