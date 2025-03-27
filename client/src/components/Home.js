import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Avatar, 
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  School as SchoolIcon, 
  AccessTime as AccessTimeIcon, 
  LocationOn as LocationIcon,
  Person as PersonIcon 
} from '@mui/icons-material';
import useSchedule from '../hooks/useSchedule';
import ChatBox from './ChatBox';
import authService from '../services/authService';

const Home = () => {
  const user = authService.getUser();
  const { schedule, loading, error } = useSchedule(user?.masv);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Thông tin sinh viên */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Avatar
              src={user?.hinhanh ? `${process.env.REACT_APP_API_URL}/images/${user.hinhanh}` : '/default-avatar.png'}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              {user?.tensv}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {user?.masv}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.lop} - {user?.chuyennganh}
            </Typography>
          </Paper>
        </Grid>

        {/* Thời khoá biểu hôm nay */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3,
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
              Lịch học hôm nay
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>
                {error}
              </Typography>
            ) : schedule.length > 0 ? (
              <List>
                {schedule.map((item, index) => (
                  <React.Fragment key={item.STT}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon color="primary" />
                            <Typography variant="subtitle1" component="span">
                              {item.tenmh}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span">
                                {item.giangvien}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span">
                                {item.thoigianhoc}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span">
                                Phòng {item.phong}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < schedule.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" sx={{ color: '#666', textAlign: 'center', p: 2 }}>
                Hôm nay không có lịch học
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ChatBox */}
      <ChatBox masv={user?.masv} />
    </Box>
  );
};

export default Home; 