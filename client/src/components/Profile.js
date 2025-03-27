import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Button, Grid, Avatar, TextField, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Fade, Zoom } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import EditIcon from '@mui/icons-material/Edit';
import QrCodeIcon from '@mui/icons-material/QrCode';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { QRCodeSVG } from 'qrcode.react';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [editData, setEditData] = useState({
    sdt: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Fetch user data when component mounts
  const fetchUserData = useCallback(async () => {
    try {
      const storedUser = authService.getUser();
      const token = authService.getToken();
      
      if (!storedUser?.masv) {
        setError('Không tìm thấy thông tin người dùng');
        return;
      }

      if (!token) {
        setError('Phiên đăng nhập đã hết hạn');
        navigate('/login');
        return;
      }

      // Lấy thông tin isAdmin từ token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const isAdmin = tokenData.isAdmin;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/profile/${storedUser.masv}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        const userData = {
          ...response.data.user,
          isAdmin
        };
        setUser(userData);
        setEditData({
          sdt: userData.sdt || '',
          email: userData.email || '',
        });
        // Update localStorage with fresh data
        authService.setUser(userData);
        setError(''); // Clear any existing errors
      } else {
        setError(response.data.message || 'Không thể lấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Phiên đăng nhập đã hết hạn');
        navigate('/login');
        return;
      }
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lấy thông tin người dùng');
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('masv', user.masv);

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/profile/upload-avatar`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          // Update user data immediately
          const updatedUser = { ...user, hinhanh: response.data.filename };
          setUser(updatedUser);
          authService.setUser(updatedUser);
          
          setSuccess('Cập nhật ảnh đại diện thành công!');
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ảnh đại diện');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleEdit = async () => {
    try {
      const storedUser = authService.getUser();
      const token = authService.getToken();

      if (!token) {
        setError('Vui lòng đăng nhập lại');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Validate phone number
      const phoneRegex = /^[0-9]+$/;
      if (!phoneRegex.test(editData.sdt)) {
        setError('Số điện thoại không hợp lệ (chỉ được chứa chữ số)');
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        setError('Email không hợp lệ');
        setTimeout(() => setError(''), 3000);
        return;
      }

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/profile/${storedUser.masv}`,
        {
          sdt: editData.sdt,
          email: editData.email
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        authService.setUser(updatedUser);
        setIsEditing(false);
        setSuccess('Lưu thông tin thành công!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 'Lưu thông tin không thành công!';
      setError(errorMessage);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Add handler for closing edit dialog
  const handleCloseEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset edit data to current user values
    setEditData({
      sdt: user?.sdt || '',
      email: user?.email || ''
    });
  };

  // Show loading state while fetching initial data
  if (!user) {
    return (
      <MainLayout>
        <Box className="p-6 flex justify-center items-center">
          <Typography>Đang tải thông tin...</Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Fade in={true} timeout={800}>
        <Box className="p-6">
          <Paper className="profile-paper p-4 sm:p-8 max-w-3xl mx-auto" elevation={4}>
            <Typography variant="h4" className="text-center mb-4 sm:mb-6 font-bold profile-title text-xl sm:text-2xl md:text-3xl">
              📚 Hồ sơ sinh viên
            </Typography>

            {error && (
              <Zoom in={true}>
                <Typography 
                  color="error" 
                  className="alert error mb-4 text-center text-sm sm:text-base"
                  style={{
                    padding: '8px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    marginBottom: '16px'
                  }}
                >
                  {error}
                </Typography>
              </Zoom>
            )}

            {success && (
              <Zoom in={true}>
                <Typography 
                  color="success" 
                  className="alert success mb-4 text-center text-sm sm:text-base"
                  style={{
                    padding: '8px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '4px',
                    marginBottom: '16px'
                  }}
                >
                  {success}
                </Typography>
              </Zoom>
            )}

            <Grid container spacing={3}>
              {/* Avatar và thông tin cơ bản */}
              <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div 
                    className="avatar-container"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <Avatar
                      src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : '/default-avatar.png'}
                      alt="Avatar"
                      className={`profile-avatar ${isHovered ? 'avatar-hovered' : ''}`}
                      sx={{ 
                        width: { xs: 120, sm: 150 }, 
                        height: { xs: 120, sm: 150 } 
                      }}
                    />
                    <input
                      accept="image/*"
                      type="file"
                      id="icon-button-file"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <Fade in={isHovered}>
                      <label htmlFor="icon-button-file" className="avatar-upload-button">
                        <IconButton 
                          color="primary" 
                          aria-label="upload picture" 
                          component="span"
                          className="bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all duration-300"
                          sx={{ 
                            width: { xs: 32, sm: 40 }, 
                            height: { xs: 32, sm: 40 }
                          }}
                        >
                          <PhotoCamera sx={{ fontSize: { xs: 20, sm: 24 } }} />
                        </IconButton>
                      </label>
                    </Fade>
                  </div>

                  {/* QR Code Button */}
                  <div className="qr-code-button">
                    <Button
                      variant="outlined"
                      startIcon={<QrCodeIcon />}
                      onClick={() => setShowQR(true)}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        '&:hover': {
                          borderColor: '#1565c0',
                          backgroundColor: 'rgba(25, 118, 210, 0.04)'
                        }
                      }}
                    >
                      Xem QR Code
                    </Button>
                  </div>
                </Box>
              </Grid>

              {/* Thông tin chi tiết */}
              <Grid item xs={12}>
                <Box className="info-container space-y-3">
                  <InfoRow label="Họ và tên" value={user?.tensv} />
                  <InfoRow label="Lớp" value={user?.lop} />
                  <InfoRow label="Mã số sinh viên" value={user?.masv} />
                  <InfoRow label="Giới tính" value={user?.gioitinh} />
                  <InfoRow label="Ngày sinh" value={user?.ngaysinh} />
                  <InfoRow label="Chuyên ngành" value={user?.chuyennganh} />
                  <InfoRow label="Ngày công tác xã hội" value={user?.ctxh ? user.ctxh : '0'} />
                  <InfoRow 
                    label="Số điện thoại" 
                    value={user?.sdt}
                    editable
                    onClick={() => setIsEditing(true)}
                  />
                  <InfoRow 
                    label="Email" 
                    value={user?.email}
                    editable
                    onClick={() => setIsEditing(true)}
                  />
                </Box>
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                  className="action-button edit-button w-full sm:w-auto"
                  startIcon={<EditIcon />}
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '6px 12px', sm: '8px 16px' }
                  }}
                >
                  Chỉnh sửa thông tin liên hệ
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => navigate('/change-password')}
                  className="action-button password-button w-full sm:w-auto"
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    padding: { xs: '6px 12px', sm: '8px 16px' }
                  }}
                >
                  Đổi mật khẩu
                </Button>
                {user?.isAdmin && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => navigate('/admin/home')}
                    className="action-button admin-button w-full sm:w-auto"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      padding: { xs: '6px 12px', sm: '8px 16px' }
                    }}
                  >
                    Trang Quản Trị
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>

      {/* QR Code Dialog */}
      <Dialog
        open={showQR}
        onClose={() => setShowQR(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            margin: '16px'
          }
        }}
      >
        <DialogTitle
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            color: '#1976d2',
            paddingBottom: '16px',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          QR Code Sinh Viên
        </DialogTitle>
        <DialogContent style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: '24px'
        }}>
          <QRCodeSVG
            value={`${user?.tensv} - ${user?.masv}`}
            size={200}
            level="H"
            includeMargin={true}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Typography 
            variant="body1" 
            style={{ 
              marginTop: '16px',
              textAlign: 'center',
              color: '#666'
            }}
          >
            {user?.tensv}
          </Typography>
          <Typography 
            variant="body2" 
            style={{ 
              color: '#1976d2',
              fontWeight: 500
            }}
          >
            {user?.masv}
          </Typography>
        </DialogContent>
        <DialogActions 
          style={{
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
            justifyContent: 'center'
          }}
        >
          <Button 
            onClick={() => setShowQR(false)}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              textTransform: 'none'
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa thông tin */}
      <Dialog 
        open={isEditing} 
        onClose={handleCloseEdit}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '12px',
            padding: '16px',
            margin: '16px'
          }
        }}
      >
        <DialogTitle
          style={{
            textAlign: 'center',
            fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
            fontWeight: 'bold',
            color: '#1976d2',
            paddingBottom: '16px',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          Chỉnh sửa thông tin liên hệ
        </DialogTitle>
        <DialogContent style={{ marginTop: '20px', marginBottom: '10px' }}>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              fullWidth
              label="Số điện thoại"
              value={editData.sdt}
              onChange={(e) => setEditData({ ...editData, sdt: e.target.value })}
              variant="outlined"
              InputProps={{
                style: {
                  borderRadius: '8px',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                }
              }}
              InputLabelProps={{
                style: {
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                }
              }}
            />
            <TextField
              fullWidth
              label="Email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              variant="outlined"
              InputProps={{
                style: {
                  borderRadius: '8px',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                }
              }}
              InputLabelProps={{
                style: {
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions 
          style={{
            padding: '16px',
            borderTop: '1px solid #e0e0e0',
            justifyContent: 'center',
            gap: '12px',
            flexDirection: 'column',
            '@media (min-width: 600px)': {
              flexDirection: 'row'
            }
          }}
        >
          <Button 
            onClick={handleCloseEdit}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              textTransform: 'none',
              borderColor: '#1976d2',
              color: '#1976d2',
              '@media (min-width: 600px)': {
                width: 'auto'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleEdit}
            variant="contained" 
            color="primary"
            fullWidth
            sx={{
              borderRadius: '8px',
              padding: '8px 24px',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              textTransform: 'none',
              backgroundColor: '#1976d2',
              '@media (min-width: 600px)': {
                width: 'auto'
              }
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}

// Component hiển thị từng dòng thông tin
function InfoRow({ label, value, editable, onClick }) {
  // Hàm format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Hàm format số điện thoại
  const formatPhone = (phone) => {
    if (!phone) return '';
    return phone.toString();
  };

  // Xử lý giá trị hiển thị
  const displayValue = label === 'Ngày sinh' ? formatDate(value) : 
                      label === 'Số điện thoại' ? formatPhone(value) : 
                      value;

  return (
    <Box 
      className={`info-row ${editable ? 'editable' : ''}`}
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: '4px', sm: '8px' },
        padding: '8px',
        borderRadius: '4px',
        '&:hover': editable ? {
          backgroundColor: 'rgba(25, 118, 210, 0.04)',
          cursor: 'pointer'
        } : {}
      }}
    >
      <Typography 
        className="info-label"
        sx={{ 
          fontWeight: 'bold',
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        {label}:
      </Typography>
      <Typography 
        className="info-value"
        sx={{ 
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        {displayValue}
      </Typography>
      {editable && (
        <Typography 
          color="primary" 
          className="edit-indicator"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <EditIcon fontSize="small" className="edit-icon" />
          Chỉnh sửa
        </Typography>
      )}
    </Box>
  );
}

export default Profile; 