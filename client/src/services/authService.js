import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class AuthService {
  setToken(token) {
    // Tạo sessionId ngẫu nhiên
    const sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem(`token_${sessionId}`, token);
  }

  getToken() {
    const sessionId = localStorage.getItem('sessionId');
    return sessionId ? localStorage.getItem(`token_${sessionId}`) : null;
  }

  setUser(user) {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      localStorage.setItem(`user_${sessionId}`, JSON.stringify(user));
    }
  }

  getUser() {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return null;
    const userStr = localStorage.getItem(`user_${sessionId}`);
    return userStr ? JSON.parse(userStr) : null;
  }

  async login(masv, password) {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        masv,
        password
      });

      if (response.data.success) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-token`, {
        token
      });
      return response.data.valid;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout() {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      localStorage.removeItem(`token_${sessionId}`);
      localStorage.removeItem(`user_${sessionId}`);
      localStorage.removeItem('sessionId');
    }
  }

  // Thêm token vào header của mọi request
  setupAxiosInterceptors() {
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Xử lý response errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

const authService = new AuthService();
export default authService; 