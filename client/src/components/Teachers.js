import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await axios.get('/api/teachers');
        setTeachers(response.data);
      } catch (err) {
        setError('Không thể tải thông tin giảng viên. Vui lòng thử lại sau.');
        console.error('Error fetching teachers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Thông Tin Giảng Viên
      </Typography>
      <Grid container spacing={3}>
        {teachers.map((teacher) => (
          <Grid item xs={12} sm={6} md={4} key={teacher.magv}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {teacher.tengv}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Mã GV: {teacher.magv}
                </Typography>
                <Typography variant="body2" paragraph>
                  Email: {teacher.email}
                </Typography>
                <Typography variant="body2" paragraph>
                  Số điện thoại: {teacher.sdt}
                </Typography>
                {teacher.zalo && (
                  <Typography variant="body2">
                    Zalo: {teacher.zalo}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Teachers; 