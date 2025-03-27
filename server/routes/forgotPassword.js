const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Kiểm tra kết nối email
transporter.verify(function(error, success) {
  if (error) {
    console.log("Lỗi kết nối email:", error);
  } else {
    console.log("Kết nối email thành công!");
  }
});

// Lưu trữ mã xác nhận tạm thời (trong thực tế nên dùng Redis)
const verificationCodes = new Map();

// Route gửi mã xác nhận
router.post('/send-code', async (req, res) => {
  try {
    const { identifier } = req.body;
    
    // Tìm sinh viên theo mã sinh viên hoặc email
    const [sinhviens] = await pool.execute(
      'SELECT * FROM sinhvien WHERE masv = ? OR email = ?',
      [identifier, identifier]
    );
    
    if (sinhviens.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản với thông tin này' 
      });
    }

    const sinhvien = sinhviens[0];
    
    // Tạo mã xác nhận ngẫu nhiên
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    // Lưu mã xác nhận
    verificationCodes.set(sinhvien.masv, {
      code: verificationCode,
      timestamp: Date.now()
    });

    // Gửi email
    const mailOptions = {
      from: `"Hệ thống Chat AI" <${process.env.EMAIL_USER}>`,
      to: sinhvien.email,
      subject: 'Mã xác nhận đổi mật khẩu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">Đổi mật khẩu</h2>
          </div>
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px;">
            <p>Xin chào <strong>${sinhvien.tensv}</strong>,</p>
            <p>Bạn đã yêu cầu đổi mật khẩu cho tài khoản của mình.</p>
            <div style="background-color: #e5e7eb; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
            </div>
            <p>Mã xác nhận này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: 'Mã xác nhận đã được gửi đến email của bạn' 
    });
  } catch (error) {
    console.error('Lỗi gửi mã xác nhận:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi gửi mã xác nhận' 
    });
  }
});

// Route xác nhận mã
router.post('/verify-code', async (req, res) => {
  try {
    const { identifier, code } = req.body;
    
    // Tìm sinh viên
    const [sinhviens] = await pool.execute(
      'SELECT * FROM sinhvien WHERE masv = ? OR email = ?',
      [identifier, identifier]
    );
    
    if (sinhviens.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    const sinhvien = sinhviens[0];
    const storedData = verificationCodes.get(sinhvien.masv);

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã xác nhận không tồn tại hoặc đã hết hạn' 
      });
    }

    // Kiểm tra thời gian hết hạn (10 phút)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      verificationCodes.delete(sinhvien.masv);
      return res.status(400).json({ 
        success: false, 
        message: 'Mã xác nhận đã hết hạn' 
      });
    }

    // Kiểm tra mã xác nhận
    if (storedData.code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã xác nhận không chính xác' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Mã xác nhận hợp lệ' 
    });
  } catch (error) {
    console.error('Lỗi xác nhận mã:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi xác nhận mã' 
    });
  }
});

// Route đổi mật khẩu
router.post('/reset-password', async (req, res) => {
  try {
    const { identifier, code, newPassword } = req.body;
    
    // Tìm sinh viên
    const [sinhviens] = await pool.execute(
      'SELECT * FROM sinhvien WHERE masv = ? OR email = ?',
      [identifier, identifier]
    );
    
    if (sinhviens.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy tài khoản' 
      });
    }

    const sinhvien = sinhviens[0];
    const storedData = verificationCodes.get(sinhvien.masv);

    if (!storedData || storedData.code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mã xác nhận không hợp lệ' 
      });
    }

    // Cập nhật mật khẩu mới
    await pool.execute(
      'UPDATE sinhvien SET password = ? WHERE masv = ?',
      [newPassword, sinhvien.masv]
    );

    // Xóa mã xác nhận đã sử dụng
    verificationCodes.delete(sinhvien.masv);

    res.json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công' 
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi đổi mật khẩu' 
    });
  }
});

module.exports = router; 