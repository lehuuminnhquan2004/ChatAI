import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';

function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    enableRegistration: true,
    enableChat: true,
    maintenanceMode: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSettings(response.data.settings);
    } catch (error) {
      setError('Không thể tải cài đặt');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/admin/settings`,
        settings,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSuccess('Cài đặt đã được cập nhật thành công');
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật cài đặt');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cài đặt hệ thống
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin cơ bản
                </Typography>
                <TextField
                  fullWidth
                  label="Tên website"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Mô tả website"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                <TextField
                  fullWidth
                  label="Email liên hệ"
                  name="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  name="contactPhone"
                  value={settings.contactPhone}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Cài đặt hệ thống
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableRegistration}
                      onChange={handleChange}
                      name="enableRegistration"
                    />
                  }
                  label="Cho phép đăng ký tài khoản mới"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableChat}
                      onChange={handleChange}
                      name="enableChat"
                    />
                  }
                  label="Bật tính năng chat"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      name="maintenanceMode"
                    />
                  }
                  label="Chế độ bảo trì"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : null}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </AdminLayout>
  );
}

export default Settings; 