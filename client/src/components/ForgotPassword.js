import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Nhập mã/gmail, 2: Nhập mã xác nhận, 3: Đổi mật khẩu
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/forgot-password/send-code`, {
        identifier
      });

      if (response.data.success) {
        setSuccess('Mã xác nhận đã được gửi đến email của bạn');
        setStep(2);
      } else {
        setError(response.data.message || 'Không tìm thấy tài khoản');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi mã xác nhận');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/forgot-password/verify-code`, {
        identifier,
        code: verificationCode
      });

      if (response.data.success) {
        setSuccess('Mã xác nhận hợp lệ');
        setStep(3);
      } else {
        setError('Mã xác nhận không chính xác');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi xác nhận mã');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/forgot-password/reset-password`, {
        identifier,
        code: verificationCode,
        newPassword
      });

      if (response.data.success) {
        setSuccess('Đổi mật khẩu thành công');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
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

      {/* Form Container */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">
            {step === 1 ? 'Quên mật khẩu' : 
             step === 2 ? 'Xác nhận mã' : 
             'Đổi mật khẩu'}
          </h2>
          <p className="text-gray-600">
            {step === 1 ? 'Nhập mã sinh viên hoặc email để nhận mã xác nhận' :
             step === 2 ? 'Nhập mã xác nhận đã gửi đến email của bạn' :
             'Nhập mật khẩu mới'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-500 p-4 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-4 rounded-lg text-center font-medium">
            {success}
          </div>
        )}

        <form onSubmit={step === 1 ? handleSendCode : 
                       step === 2 ? handleVerifyCode : 
                       handleResetPassword} 
              className="space-y-6">
          {step === 1 && (
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Mã sinh viên hoặc Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-colors hover:border-indigo-300 bg-white/80"
                placeholder="Nhập mã sinh viên hoặc email"
                required
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã xác nhận
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-colors hover:border-indigo-300 bg-white/80"
                placeholder="Nhập mã xác nhận"
                required
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-colors hover:border-indigo-300 bg-white/80"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium transition-colors hover:border-indigo-300 bg-white/80"
                  placeholder="Xác nhận mật khẩu mới"
                  required
                />
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {step === 1 ? 'Gửi mã xác nhận' :
               step === 2 ? 'Xác nhận' :
               'Đổi mật khẩu'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword; 