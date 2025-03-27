import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const useSchedule = (masv) => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const token = authService.getToken();
        if (!token) {
          setError('Vui lòng đăng nhập lại');
          setLoading(false);
          return;
        }

        if (!masv) {
          setError('Không tìm thấy mã sinh viên');
          setLoading(false);
          return;
        }

        console.log('Fetching schedule for:', masv); // Debug log
        console.log('Using API URL:', API_URL); // Debug log

        const response = await axios.get(`${API_URL}/api/schedule/${masv}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response from API:', response.data); // Debug log

        // Lọc lịch học cho ngày hôm nay
        const today = new Date().getDay();
        // Chuyển đổi từ getDay() (0-6) sang định dạng trong database (2-8)
        const dbDay = today === 0 ? 8 : today + 1;
        console.log('Today (getDay):', today); // Debug log
        console.log('DB Day:', dbDay); // Debug log
        
        const todaySchedule = response.data.schedule.filter(item => item.Thu === dbDay);
        console.log('Today schedule:', todaySchedule); // Debug log
        
        setSchedule(todaySchedule);
        setError(null);
      } catch (err) {
        console.error('Error details:', err); // Debug log
        if (err.response) {
          // Server trả về lỗi
          console.error('Error response:', err.response.data); // Debug log
          switch (err.response.status) {
            case 401:
              setError('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
              break;
            case 403:
              setError('Bạn không có quyền truy cập thông tin này');
              break;
            case 404:
              setError('Không tìm thấy lịch học');
              break;
            default:
              setError(err.response.data.message || 'Có lỗi xảy ra khi lấy lịch học');
          }
        } else if (err.request) {
          // Không nhận được response từ server
          setError('Không thể kết nối đến máy chủ');
        } else {
          // Lỗi khi tạo request
          setError('Có lỗi xảy ra khi tạo yêu cầu');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [masv]);

  return { schedule, loading, error };
};

export default useSchedule; 