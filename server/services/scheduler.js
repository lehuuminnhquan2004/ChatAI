const cron = require('node-cron');
const { sendScheduleNotification } = require('./emailService');

// Lên lịch gửi email vào 13h32 mỗi ngày
cron.schedule('46 13 * * *', () => {
  console.log('Bắt đầu gửi thông báo lịch học...');
  sendScheduleNotification();
}); 