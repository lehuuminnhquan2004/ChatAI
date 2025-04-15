const nodemailer = require('nodemailer');
const pool = require('../config/db');

// Tạo transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Hàm gửi email thông báo lịch học
const sendScheduleNotification = async () => {
  try {
    // Lấy ngày mai
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowDay = tomorrow.getDay(); // 0 là Chủ nhật, 1-6 là Thứ 2-7
    
    // Chuyển đổi thứ từ JavaScript (0-6) sang định dạng trong DB (2-8)
    let dbDay;
    if (tomorrowDay === 0) { // Chủ nhật
      dbDay = 8;
    } else {
      dbDay = tomorrowDay + 1; // Thứ 2-7
    }

    // Lấy danh sách sinh viên
    const [students] = await pool.execute('SELECT masv, email, tensv FROM sinhvien');

    // Với mỗi sinh viên
    for (const student of students) {
      // Lấy lịch học ngày mai
      const [schedules] = await pool.execute(
        `SELECT l.Thu, l.Ca, l.phong, m.tenmh, g.tengv 
         FROM lichhoc l 
         JOIN monhoc m ON l.mamh = m.mamh 
         JOIN giangvien g ON l.magv = g.magv 
         WHERE l.masv = ? AND l.Thu = ? AND l.ngaybatdau <= ? AND l.ngayketthuc >= ?`,
        [student.masv, dbDay, tomorrowStr, tomorrowStr]
      );

      if (schedules.length > 0) {
        // Tạo nội dung email
        let emailContent = `
          <h2>Thông báo lịch học ngày mai</h2>
          <p>Xin chào ${student.tensv},</p>
          <p>Đây là lịch học của bạn vào ngày mai:</p>
          <ul>
        `;

        schedules.forEach(schedule => {
          const thu = ['', '', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'][schedule.Thu];
          const ca = ['7h-9h30', '9h30-12h', '12h30-15h', '15h-17h30'][schedule.Ca - 1];
          
          emailContent += `
            <li>
              ${thu}, ca ${schedule.Ca} (${ca})<br>
              Môn: ${schedule.tenmh}<br>
              Giảng viên: ${schedule.tengv}<br>
              Phòng: ${schedule.phong}
            </li>
          `;
        });

        emailContent += `
          </ul>
          <p>Chúc bạn có một buổi học hiệu quả!</p>
        `;

        // Gửi email
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: student.email,
          subject: 'Thông báo lịch học ngày mai',
          html: emailContent
        });

        console.log(`Đã gửi thông báo lịch học cho ${student.tensv}`);
      }
    }
  } catch (error) {
    console.error('Lỗi khi gửi thông báo lịch học:', error);
  }
};

module.exports = {
  sendScheduleNotification
}; 