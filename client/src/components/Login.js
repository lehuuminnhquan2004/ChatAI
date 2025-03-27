import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function Login() {
  const [masv, setMasv] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await authService.login(masv, password);
      if (response.success) {
        navigate('/');
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/bannerLogin.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Login Form */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">Đăng nhập</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-500 p-4 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="masv" className="block text-sm font-medium text-gray-700 mb-1">
              Mã sinh viên
            </label>
            <input
              id="masv"
              type="text"
              value={masv}
              onChange={(e) => setMasv(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-colors hover:border-indigo-300 bg-white/80"
              placeholder="Nhập mã sinh viên"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-colors hover:border-indigo-300 bg-white/80"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Đăng nhập
            </button>
          </div>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate('/forgot-password')} 
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; 