const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
const { HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const pool = require('../config/db'); // Thêm kết nối database

// Lưu trữ lịch sử chat tạm thời cho mỗi admin
const adminChatHistory = new Map();

// Hàm helper để lấy và quản lý lịch sử chat
function getAdminHistory(username) {
    if (!adminChatHistory.has(username)) {
        adminChatHistory.set(username, []);
    }
    return adminChatHistory.get(username);
}

function addToHistory(username, userMessage, aiResponse) {
    const history = getAdminHistory(username);
    history.push({
        nguoidung_chat: userMessage,
        ai_rep: aiResponse,
        thoigianchat: new Date().toISOString()
    });
    
    // Giữ tối đa 10 tin nhắn gần nhất
    if (history.length > 10) {
        history.shift();
    }
    
    adminChatHistory.set(username, history);
}

// Rate limiting để tránh DOS
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 phút
    max: 30, // Giới hạn 30 request mỗi phút
    message: { error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }
});

// Áp dụng rate limiting cho tất cả các route
router.use(limiter);

// Route kiểm tra kết nối - không yêu cầu xác thực
router.get('/test', (req, res) => {
  console.log('Admin chat test route được gọi');
  try {
    res.status(200).json({ 
      message: 'Admin chat route hoạt động!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lỗi trong route test:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('Không tìm thấy token trong headers');
      return res.status(401).json({ error: 'Không tìm thấy token' });
    }

    // Kiểm tra JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET không được cấu hình');
      return res.status(500).json({ error: 'Lỗi cấu hình server' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token hợp lệ, thông tin giải mã:', {
        username: decoded.username,
        isAdmin: decoded.isAdmin,
        exp: new Date(decoded.exp * 1000).toISOString()
      });

      // Kiểm tra quyền admin
      if (!decoded.isAdmin) {
        console.log('User không có quyền admin:', decoded.username);
        return res.status(403).json({ error: 'Không có quyền truy cập' });
      }

      // Kiểm tra token hết hạn
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        console.log('Token đã hết hạn');
        return res.status(401).json({ error: 'Token đã hết hạn' });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('Lỗi xác thực JWT:', {
        name: jwtError.name,
        message: jwtError.message
      });

      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token đã hết hạn' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token không hợp lệ' });
      } else {
        return res.status(401).json({ error: 'Lỗi xác thực', details: jwtError.message });
      }
    }
  } catch (error) {
    console.error('Lỗi xử lý middleware:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
};

// Khởi tạo API key từ biến môi trường
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error('GEMINI_API_KEY không được cấu hình!');
}

// Khởi tạo đối tượng GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(apiKey);

// Lấy model từ Google Generative AI
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",  // Sử dụng model chuẩn
});

// Cấu hình cho phiên chat
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// Route lấy lịch sử chat
router.get('/history', authenticateToken, (req, res) => {
    try {
        const username = req.user.username;
        const history = getAdminHistory(username);
        res.json(history);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử chat:', error);
        res.status(500).json({ 
            error: 'Có lỗi xảy ra khi lấy lịch sử chat',
            message: error.message 
        });
    }
});

// Route xóa lịch sử chat
router.delete('/history', authenticateToken, (req, res) => {
    try {
        const username = req.user.username;
        adminChatHistory.set(username, []);
        res.json({ message: 'Đã xóa lịch sử chat' });
    } catch (error) {
        console.error('Lỗi khi xóa lịch sử chat:', error);
        res.status(500).json({ 
            error: 'Có lỗi xảy ra khi xóa lịch sử chat',
            message: error.message 
        });
    }
});

// Route xử lý chat
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const username = req.user.username;
        console.log('Nhận tin nhắn từ admin:', message);

        if (!message) {
            return res.status(400).json({ error: 'Tin nhắn không được để trống' });
        }

        // Kiểm tra nếu là yêu cầu thêm lịch học
        if (message.toLowerCase().includes('thêm lịch học') || 
            message.toLowerCase().includes('thêm lịch') ||
            message.toLowerCase().includes('tạo lịch học')) {
            
            try {
                // Lấy danh sách giảng viên
                const [giangvien] = await pool.execute('SELECT magv, tengv FROM giangvien ORDER BY tengv');
                
                // Lấy danh sách môn học
                const [monhoc] = await pool.execute('SELECT mamh, tenmh FROM monhoc ORDER BY tenmh');

                // Lấy danh sách sinh viên
                const [sinhvien] = await pool.execute('SELECT masv, tensv FROM sinhvien ORDER BY tensv');
                
                return res.json({
                    message: "Vui lòng điền thông tin lịch học vào form dưới đây:",
                    type: "schedule_form",
                    formData: {
                        fields: [
                            {
                                name: "thu",
                                label: "Thứ",
                                type: "select",
                                options: [
                                    { value: 2, label: "Thứ 2" },
                                    { value: 3, label: "Thứ 3" },
                                    { value: 4, label: "Thứ 4" },
                                    { value: 5, label: "Thứ 5" },
                                    { value: 6, label: "Thứ 6" },
                                    { value: 7, label: "Thứ 7" },
                                    { value: 8, label: "Chủ nhật" }
                                ],
                                required: true
                            },
                            {
                                name: "ca",
                                label: "Ca học",
                                type: "select",
                                options: [
                                    { value: 1, label: "Ca 1 (7:00 - 9:30)" },
                                    { value: 2, label: "Ca 2 (9:35 - 12:05)" },
                                    { value: 3, label: "Ca 3 (12:35 - 15:05)" },
                                    { value: 4, label: "Ca 4 (15:10 - 17:40)" }
                                ],
                                required: true
                            },
                            {
                                name: "phong",
                                label: "Phòng học",
                                type: "text",
                                placeholder: "Nhập phòng học",
                                required: true
                            },
                            {
                                name: "masv",
                                label: "Sinh viên",
                                type: "select",
                                options: sinhvien.map(sv => ({
                                    value: sv.masv,
                                    label: `${sv.masv} - ${sv.tensv}`
                                })),
                                required: true,
                                searchable: true
                            },
                            {
                                name: "mamh",
                                label: "Môn học",
                                type: "select",
                                options: monhoc.map(mh => ({
                                    value: mh.mamh,
                                    label: `${mh.mamh} - ${mh.tenmh}`
                                })),
                                required: true,
                                searchable: true
                            },
                            {
                                name: "magv",
                                label: "Giảng viên",
                                type: "select",
                                options: giangvien.map(gv => ({
                                    value: gv.magv,
                                    label: `${gv.magv} - ${gv.tengv}`
                                })),
                                required: true,
                                searchable: true
                            },
                            {
                                name: "ngaybatdau",
                                label: "Ngày bắt đầu",
                                type: "date",
                                required: true
                            },
                            {
                                name: "ngayketthuc",
                                label: "Ngày kết thúc",
                                type: "date",
                                required: true
                            }
                        ],
                        submitEndpoint: "/api/admin/schedule/add",
                        submitButtonText: "Thêm lịch học"
                    },
                    success: true,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu cho form:', error);
                return res.status(500).json({
                    error: 'Có lỗi xảy ra khi tải dữ liệu form',
                    message: error.message
                });
            }
        }

        // Kiểm tra nếu là dữ liệu form thêm lịch học
        if (message === "ADD_SCHEDULE") {
            try {
                const scheduleData = req.body.scheduleData;
                
                // Validate dữ liệu
                if (!scheduleData.thu || !scheduleData.ca || !scheduleData.phong || !scheduleData.masv || 
                    !scheduleData.mamh || !scheduleData.magv || !scheduleData.ngaybatdau || !scheduleData.ngayketthuc) {
                    throw new Error('Vui lòng điền đầy đủ thông tin');
                }

                // Kiểm tra thứ hợp lệ
                if (scheduleData.thu < 2 || scheduleData.thu > 8) {
                    throw new Error('Thứ phải từ 2-8');
                }

                // Kiểm tra ca học hợp lệ
                if (scheduleData.ca < 1 || scheduleData.ca > 4) {
                    throw new Error('Ca học phải từ 1-4');
                }

                // Kiểm tra ngày hợp lệ
                const startDate = new Date(scheduleData.ngaybatdau);
                const endDate = new Date(scheduleData.ngayketthuc);
                if (startDate >= endDate) {
                    throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
                }

                // Kiểm tra trùng lịch
                const [existingSchedule] = await pool.execute(
                    'SELECT * FROM lichhoc WHERE thu = ? AND ca = ? AND phong = ? AND ((ngaybatdau <= ? AND ngayketthuc >= ?) OR (ngaybatdau <= ? AND ngayketthuc >= ?))',
                    [scheduleData.thu, scheduleData.ca, scheduleData.phong, scheduleData.ngaybatdau, scheduleData.ngaybatdau, scheduleData.ngayketthuc, scheduleData.ngayketthuc]
                );

                if (existingSchedule.length > 0) {
                    throw new Error('Đã có lịch học khác trong thời gian này');
                }

                // Thêm lịch học vào database
                await pool.execute(
                    'INSERT INTO lichhoc (thu, ca, phong, masv, mamh, magv, ngaybatdau, ngayketthuc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [scheduleData.thu, scheduleData.ca, scheduleData.phong, scheduleData.masv, scheduleData.mamh, scheduleData.magv, scheduleData.ngaybatdau, scheduleData.ngayketthuc]
                );

                return res.json({
                    message: "Đã thêm lịch học thành công!",
                    success: true,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error('Lỗi khi thêm lịch học:', error);
                return res.json({
                    message: `Lỗi khi thêm lịch học: ${error.message}`,
                    success: false,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Xử lý chat bình thường
        const chat = model.startChat({
            generationConfig,
            history: [],
        });

        const now = new Date();
        
        // Tạo prompt
        const prompt = `
        Hôm nay là ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}
        Bạn là trợ lý AI của admin, hãy trả lời các câu hỏi một cách chuyên nghiệp, lịch sự và ngắn gọn.
        Tin nhắn của admin: ${message}
        `;

        console.log('Gửi prompt tới AI:', prompt);

        // Gửi tin nhắn và nhận phản hồi từ AI
        const result = await chat.sendMessage(prompt);
        const aiResponse = await result.response;
        const responseText = aiResponse.text();

        if (!responseText) {
            throw new Error('Không nhận được phản hồi từ AI');
        }

        console.log('Phản hồi từ AI:', responseText);

        // Gửi response
        res.json({ 
            message: responseText,
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chi tiết lỗi xử lý chat:', error);
        
        if (error.message.includes('model not found')) {
            return res.status(400).json({
                error: 'Model AI không khả dụng',
                message: 'Vui lòng thử lại sau'
            });
        } else if (error.message.includes('Failed to fetch')) {
            return res.status(503).json({
                error: 'Không thể kết nối đến AI service',
                message: 'Vui lòng kiểm tra kết nối mạng và thử lại'
            });
        }

        res.status(500).json({ 
            error: 'Có lỗi xảy ra khi xử lý yêu cầu',
            message: error.message,
            timestamp: new Date().toISOString(),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Route lấy danh sách lịch học
router.get('/schedules', authenticateToken, async (req, res) => {
    try {
        // Lấy danh sách lịch học kèm thông tin môn học, sinh viên và giảng viên
        const [schedules] = await pool.execute(`
            SELECT 
                l.*,
                m.tenmh,
                g.tengv,
                s.tensv,
                CASE 
                    WHEN l.ca = 1 THEN '7:00 - 9:30'
                    WHEN l.ca = 2 THEN '9:35 - 12:05'
                    WHEN l.ca = 3 THEN '12:35 - 15:05'
                    WHEN l.ca = 4 THEN '15:10 - 17:40'
                END as giohoc,
                CASE 
                    WHEN l.thu = 8 THEN 'Chủ nhật'
                    ELSE CONCAT('Thứ ', l.thu)
                END as thuhoc
            FROM lichhoc l
            LEFT JOIN monhoc m ON l.mamh = m.mamh
            LEFT JOIN giangvien g ON l.magv = g.magv
            LEFT JOIN sinhvien s ON l.masv = s.masv
            ORDER BY l.thu, l.ca, l.ngaybatdau
        `);

        // Format lại dữ liệu ngày tháng
        const formattedSchedules = schedules.map(schedule => ({
            ...schedule,
            ngaybatdau: new Date(schedule.ngaybatdau).toISOString().split('T')[0],
            ngayketthuc: new Date(schedule.ngayketthuc).toISOString().split('T')[0]
        }));

        res.json({
            success: true,
            schedules: formattedSchedules,
            message: 'Lấy danh sách lịch học thành công'
        });

    } catch (error) {
        console.error('Lỗi khi lấy danh sách lịch học:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy danh sách lịch học',
            error: error.message
        });
    }
});

// Route xóa lịch học
router.delete('/schedules', authenticateToken, async (req, res) => {
    try {
        const { thu, ca, phong, masv } = req.body;
        
        // Kiểm tra dữ liệu đầu vào
        if (!thu || !ca || !phong || !masv) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết để xóa lịch học'
            });
        }

        // Xóa lịch học
        await pool.execute(
            'DELETE FROM lichhoc WHERE thu = ? AND ca = ? AND phong = ? AND masv = ?',
            [thu, ca, phong, masv]
        );

        res.json({
            success: true,
            message: 'Xóa lịch học thành công'
        });

    } catch (error) {
        console.error('Lỗi khi xóa lịch học:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa lịch học',
            error: error.message
        });
    }
});

module.exports = router; 