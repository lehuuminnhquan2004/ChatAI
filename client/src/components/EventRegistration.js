import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';
import authService from '../services/authService';

function EventRegistration({ event, open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = authService.getToken();
      const user = authService.getUser();
      
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/events/register`,
        {
          mask: event.mask,
          masv: user.masv
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Xác nhận đăng ký sự kiện</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Bạn có chắc chắn muốn đăng ký tham gia sự kiện "{event.tensk}"?
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Thời gian: {new Date(event.thoigianbatdau).toLocaleString()} - {new Date(event.thoigianketthuc).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Điểm rèn luyện: {event.drl}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          CTXH: {event.ctxh}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleRegister}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Xác nhận'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EventRegistration; 