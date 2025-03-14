const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const path = require('path'); 
const connectData = require('../connectData');
const login = require('./login');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); 

module.exports = (app) => {
const genAI = new GoogleGenerativeAI("AIzaSyDX4m7R-0PW0Ibm2-vdfHBnh29PIqyHQHo");
const loginModule = login(app);

app.post('/chat', async (req, res) => {
  const prompt = req.body.message;
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const masv = loginModule.getMaSVLogin();

  try {
    // Lấy lịch sử chat từ database
    const chatHistory = await new Promise((resolve, reject) => {
      const sql = 'SELECT nguoidung_chat, ai_rep FROM lichsuchat WHERE masv = ? ORDER BY thoigianchat DESC LIMIT 5';
      connectData.query(sql, [masv], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Lấy thông tin sinh viên
    const dataSinhVien = await new Promise((resolve, reject) => {
      const truyVanSinhVien = 'SELECT * FROM sinhvien WHERE masv = ?';
      connectData.query(truyVanSinhVien, [masv], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });

    // Lấy thông tin lịch học
    const dataLichHoc = await new Promise((resolve, reject) => {
      const truyVanLichHoc = 'SELECT * FROM lichhoc join monhoc on lichhoc.mamh = monhoc.mamh WHERE masv = ?';
      connectData.query(truyVanLichHoc, [masv], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    // Tạo context từ lịch sử chat
    let context = "Bạn là một trợ lý AI thân thiện. Hãy nhớ các thông tin sau từ cuộc trò chuyện trước:\n";
    
    // Thêm lịch sử chat vào context
    chatHistory.reverse().forEach(chat => {
      context += `Người dùng: ${chat.nguoidung_chat}\nAI: ${chat.ai_rep}\n`;
    });

    // Thêm thông tin lịch học vào context
    if (dataLichHoc && dataLichHoc.length > 0) {
      context += `\nLịch học của sinh viên:\n`;
      dataLichHoc.forEach(lichhoc => {
        context += `Hãy nhớ thứ (2,3,4,5,6,7,8) tương ứng với Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6, Thứ 7, Chủ nhật\n`;
        context += `Thứ: ${lichhoc.Thu}\n`;
        context += `Mã môn học: ${lichhoc.mamh}\n`;
        context += `Tên môn học: ${lichhoc.tenmh}\n`;
        context += `Hãy nhớ ca học (1,2,3,4) tương ứng với ca 1 7-9h30, ca 2 9h35-12h, ca 3 12h30-3h, ca 4 3h5-5h45\n`;
        context += `Ca học: ${lichhoc.Ca}\n`;
        context += `Phòng học: ${lichhoc.phong}\n`;
        context += `Giảng viên: ${lichhoc.giangvien}\n`;
        context += `Ngày bắt đầu: ${lichhoc.ngaybatdau}\n`;
        context += `Ngày kết thúc: ${lichhoc.ngayketthuc}\n\n`;
      });
    }

    // Thêm thông tin sinh viên vào context
    if (dataSinhVien) {
      context += `\nThông tin sinh viên:\n`;
      context += `Mã sinh viên: ${dataSinhVien.masv}\n`;
      context += `Tên sinh viên: ${dataSinhVien.tensv}\n`;
      context += `Ngành: ${dataSinhVien.chuyennganh}\n`;
      context += `Lớp: ${dataSinhVien.lop}\n`;
      context += `Ngày sinh: ${dataSinhVien.ngaysinh}\n`;
      context += `Giới tính: ${dataSinhVien.gioitinh}\n`;
      context += `Số điện thoại: ${dataSinhVien.sdt}\n`;
      context += `Email: ${dataSinhVien.email}\n`;
    }

    context += `\nBây giờ người dùng hỏi: ${prompt}\nHãy trả lời dựa trên context trên nhưng đừng nói dựa trên dữ liệu đã có mà hãy trả lời như bạn đã biết sẵn những thông tin đó:`;

    // Gửi prompt với context đến AI
    const result = await model.generateContent(context);
    const aiResponse = result.response.text();

    // Lưu lịch sử chat vào database
    await new Promise((resolve, reject) => {
      const insertSql = 'INSERT INTO lichsuchat (masv, nguoidung_chat, ai_rep, thoigianchat) VALUES (?, ?, ?, NOW())';
      connectData.query(insertSql, [masv, prompt, aiResponse], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Thêm endpoint để lấy lịch sử chat
app.get('/chat-history', (req, res) => {
  const masv = loginModule.getMaSVLogin();
  
  if (!masv) {
    return res.status(401).json({ error: "Chưa đăng nhập" });
  }

  const sql = 'SELECT * FROM lichsuchat WHERE masv = ? ORDER BY thoigianchat DESC';
  connectData.query(sql, [masv], (err, results) => {
    if (err) {
      console.error("Lỗi lấy lịch sử chat:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    res.json(results);
  });
});

};