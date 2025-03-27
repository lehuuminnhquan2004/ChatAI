import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 phút tính bằng milliseconds

export function useAutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        authService.logout(); // Sử dụng hàm logout từ authService để xóa cả token và user
        navigate('/login');
      }, TIMEOUT_DURATION);
    };

    // Các sự kiện cần theo dõi để reset timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    // Khởi tạo timer
    resetTimer();

    // Thêm event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [navigate]);
} 