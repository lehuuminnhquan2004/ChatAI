const cron = require('node-cron');
const { sendScheduleNotification } = require('./emailService');

cron.schedule('0 20 * * *', () => {
  console.log('Bắt đầu gửi thông báo lịch học...');
  sendScheduleNotification();
}); 