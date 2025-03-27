const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const pool = require('../config/db');

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

// Áp dụng middleware cho tất cả các route
router.use(authenticateToken);

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

// Hàm helper để lấy thông tin sinh viên
async function getStudentInfo(masv) {
    try {
        const [student] = await pool.execute(
            'SELECT * FROM sinhvien WHERE masv = ?',
            [masv]
        );
        return student[0];
    } catch (error) {
        console.error('Lỗi khi lấy thông tin sinh viên:', error);
        return null;
    }
}

// Hàm helper để lấy lịch học của sinh viên
async function getStudentSchedule(masv) {
    try {
        const [schedule] = await pool.execute(
            `SELECT * FROM lichhoc join monhoc on lichhoc.mamh = monhoc.mamh WHERE masv = ?`,
            [masv]
        );
        return schedule;
    } catch (error) {
        console.error('Lỗi khi lấy lịch học:', error);
        return null;
    }
}

// Hàm helper để lấy lịch sử chat
async function getChatHistory(masv) {
    try {
        const [history] = await pool.execute(
            'SELECT nguoidung_chat, ai_rep, thoigianchat FROM lichsuchat WHERE masv = ? ORDER BY thoigianchat ASC',
            [masv]
        );
        return history;
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử chat:', error);
        return null;
    }
}

// Route kiểm tra hoạt động của chat
router.get('/test', (req, res) => {
    res.json({ message: 'Chat route đang hoạt động!' });
});

// API endpoint để lấy lịch sử chat của sinh viên
router.get('/history/:masv', async (req, res) => {
    try {
        const { masv } = req.params;
        const history = await getChatHistory(masv);
        res.json(history);
    } catch (error) {
        res.status(500).json({ 
            error: 'Có lỗi xảy ra khi truy xuất lịch sử chat',
            details: error.message
        });
    }
});

// API endpoint cho chat
router.post('/', async (req, res) => {
    try {
        const { message, masv } = req.body;

        if (!message || !masv) {
            return res.status(400).json({ error: 'Tin nhắn và mã sinh viên không được để trống' });
        }

        // Lấy thông tin sinh viên và lịch học
        const studentInfo = await getStudentInfo(masv);
        const schedule = await getStudentSchedule(masv);
        const history = await getChatHistory(masv);

        // Tạo context cho AI
        const context = {
            studentInfo,
            schedule,
            history: history.map(item => ({
                user: item.nguoidung_chat,
                ai: item.ai_rep
            }))
        };

        // Khởi tạo phiên chat với context
        const chat = model.startChat({
            generationConfig,
            history: [],
        });

        const now = new Date();
        

        // Tạo prompt với context
        const prompt = `
        Hôm nay là ngày ${now.getDate()} tháng ${now.getMonth() + 1} năm ${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}
        Context về sinh viên:
        - Tên: ${studentInfo.tensv}
        - Mã sinh viên: ${studentInfo.masv}
        - Lớp: ${studentInfo.lop}
        - Chuyên ngành: ${studentInfo.chuyennganh}
        - Ngày sinh: ${studentInfo.ngaysinh}
        Lịch học:
        ${schedule.map(item => `- Thứ ${item.Thu}, Ca ${item.Ca}: ${item.tenmh} (${item.giangvien}) tại phòng ${item.phong}`).join('\n')}
        các ca học 1: 7h30 - 9h, ca học 2: 9h30 - 12h, ca học 3: 12h30 - 15h, ca học 4: 15h-17h30,

        Lịch sử chat:
        ${history.map(item => `User: ${item.nguoidung_chat}\nAI: ${item.ai_rep}`).join('\n')}
        - Bạn là chat AI chuyên nghiệp trả lời ngắn gọn chính xác để giúp đỡ sinh viên nhé nhưng hãy tỏ ra như bạn đã biết sẵn chứ không phải vì thông tin trên.
        Tin nhắn hiện tại của sinh viên: ${message}
        `;

        // Gửi tin nhắn và nhận phản hồi từ AI
        const result = await chat.sendMessage(prompt);
        const response = result.response.text();

        // Lưu lịch sử chat vào database
        await pool.execute(
            'INSERT INTO lichsuchat (masv, nguoidung_chat, ai_rep) VALUES (?, ?, ?)',
            [masv, message, response]
        );

        res.json({ response });
    } catch (error) {
        res.status(500).json({ 
            error: 'Có lỗi xảy ra khi xử lý yêu cầu',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;