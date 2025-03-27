import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';
import authService from '../services/authService';

function AdminHome() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubjects: 0,
    totalSchedules: 0,
    totalChats: 0,
    totalEvents: 0,
    eventStats: {
      upcomingEvents: 0,
      pastEvents: 0,
      totalCTXH: 0,
      totalDRL: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!authService.isAdmin()) {
          navigate('/');
          return;
        }

        const token = authService.getToken();
        if (!token) {
          navigate('/login');
          return;
        }

        // Gọi API lấy thống kê
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thống kê:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              mr: 2
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                Thống kê tổng quan
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số sinh viên"
                    value={stats.totalStudents}
                    icon={<PeopleIcon sx={{ color: '#1976d2' }} />}
                    color="#1976d2"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số môn học"
                    value={stats.totalSubjects}
                    icon={<SchoolIcon sx={{ color: '#2e7d32' }} />}
                    color="#2e7d32"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số lịch học"
                    value={stats.totalSchedules}
                    icon={<EventIcon sx={{ color: '#ed6c02' }} />}
                    color="#ed6c02"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Tổng số cuộc trò chuyện"
                    value={stats.totalChats}
                    icon={<ChatIcon sx={{ color: '#9c27b0' }} />}
                    color="#9c27b0"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Thêm phần thống kê chi tiết sự kiện */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="primary" />
                Thống kê sự kiện
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%', bgcolor: 'info.lighter' }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="info.dark" gutterBottom>
                        Tổng số sự kiện
                      </Typography>
                      <Typography variant="h4" color="info.main">
                        {stats.eventStats?.total || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%', bgcolor: 'primary.lighter' }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="primary.dark" gutterBottom>
                        Sự kiện sắp diễn ra
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {stats.eventStats?.upcoming || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ height: '100%', bgcolor: 'success.lighter' }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="success.dark" gutterBottom>
                        Sự kiện đã kết thúc
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.eventStats?.past || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
}

export default AdminHome; 