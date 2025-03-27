import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { Fade, Zoom } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MainLayout from '../layouts/MainLayout';

const API_URL = process.env.REACT_APP_API_URL;

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const toggleShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        setError('Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      const response = await axios({
        method: 'PUT',
        url: `${API_URL}/api/profile/${user.masv}/change-password`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }
      });

      if (response.data.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setSuccess('');
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Đổi mật khẩu không thành công!');
    }
  };

  return (
    <MainLayout>
      <Fade in={true} timeout={800}>
        <Box className="p-6">
          <Paper className="change-password-paper p-8 max-w-md mx-auto" elevation={4}>
            <Typography variant="h4" className="text-center mb-6 font-bold change-password-title">
              🔐 Đổi mật khẩu
            </Typography>

            {error && (
              <Zoom in={true}>
                <Typography 
                  color="error" 
                  className="alert error mb-4 text-center"
                  style={{
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {error}
                </Typography>
              </Zoom>
            )}

            {success && (
              <Zoom in={true}>
                <Box 
                  className="success-message mb-4 text-center"
                  style={{
                    padding: '16px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <CheckCircleIcon color="success" />
                  <Typography 
                    color="success"
                    style={{
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    {success}
                  </Typography>
                </Box>
              </Zoom>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <TextField
                fullWidth
                label="Mật khẩu hiện tại"
                type={showPassword.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => toggleShowPassword('current')}
                      edge="end"
                    >
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                  style: {
                    borderRadius: '8px',
                    fontSize: '16px'
                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '16px'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Mật khẩu mới"
                type={showPassword.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => toggleShowPassword('new')}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                  style: {
                    borderRadius: '8px',
                    fontSize: '16px'
                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '16px'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Xác nhận mật khẩu mới"
                type={showPassword.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => toggleShowPassword('confirm')}
                      edge="end"
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                  style: {
                    borderRadius: '8px',
                    fontSize: '16px'
                  }
                }}
                InputLabelProps={{
                  style: {
                    fontSize: '16px'
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                className="submit-button"
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '16px',
                  textTransform: 'none',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Đổi mật khẩu
              </Button>
            </form>
          </Paper>
        </Box>
      </Fade>
    </MainLayout>
  );
};

export default ChangePassword; 