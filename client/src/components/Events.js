import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  CardActions,
  Paper
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Info as InfoIcon,
  Star as StarIcon
} from '@mui/icons-material';
import axios from 'axios';
import authService from '../services/authService';
import EventRegistration from './EventRegistration';
import '../styles/EventEffects.css';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openRegistration, setOpenRegistration] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const filteredEvents = response.data.filter(event => new Date(event.thoigianketthuc) > oneMonthAgo);
      setEvents(filteredEvents);
    } catch (error) {
      setError('Không thể tải danh sách sự kiện');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const token = authService.getToken();
      const user = authService.getUser();
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/events/registered/${user.masv}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setRegisteredEvents(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sự kiện đã đăng ký:', error);
    }
  };

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setOpenRegistration(true);
  };

  const handleRegistrationSuccess = () => {
    fetchRegisteredEvents();
  };

  const isEventRegistered = (eventId) => {
    return registeredEvents.some(event => event.mask === eventId);
  };

  const getFilteredEvents = () => {
    const now = new Date();
    switch (filter) {
      case 'registered':
        return events.filter(event => isEventRegistered(event.mask));
      case 'upcoming':
        return events.filter(event => new Date(event.thoigianbatdau) > now);
      case 'ongoing':
        return events.filter(event => {
          const startDate = new Date(event.thoigianbatdau);
          const endDate = new Date(event.thoigianketthuc);
          return now >= startDate && now <= endDate;
        });
      default:
        return events;
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.thoigianbatdau);
    const endDate = new Date(event.thoigianketthuc);

    if (now < startDate) {
      return { label: 'Sắp diễn ra', color: 'primary' };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Đang diễn ra', color: 'success' };
    } else {
      return { label: 'Đã kết thúc', color: 'error' };
    }
  };

  const getEventImage = (event) => {
    // Nếu sự kiện có hình ảnh, sử dụng hình ảnh đó
    if (event.hinhanh) {
      return `/event/${event.hinhanh}`;
    }
    
    // Nếu không có hình ảnh, sử dụng ảnh mặc định
    return '/event/connguoi1.jpg';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ 
        mb: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(32,151,243,0.9) 0%, rgba(33,203,243,0.8) 100%)',
        py: 5,
        borderRadius: 4,
        color: 'white',
        boxShadow: '0 8px 32px rgba(33, 150, 243, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }
      }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontWeight: 800,
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            letterSpacing: '0.5px',
            animation: 'fadeIn 0.8s ease-out'
          }}
        >
          Sự kiện
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          mt: 3,
          flexWrap: 'wrap'
        }}>
          {['all', 'ongoing', 'upcoming', 'registered'].map((filterType) => (
            <Button
              className="filter-button"
              key={filterType}
              variant={filter === filterType ? 'contained' : 'outlined'}
              onClick={() => setFilter(filterType)}
              sx={{
                bgcolor: filter === filterType ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: filter === filterType ? '#1976d2' : 'white',
                borderColor: 'rgba(255,255,255,0.7)',
                borderWidth: 2,
                px: 3,
                py: 1,
                borderRadius: 3,
                fontSize: '0.95rem',
                fontWeight: 600,
                textTransform: 'none',
                backdropFilter: filter === filterType ? 'blur(5px)' : 'none'
              }}
            >
              {filterType === 'all' ? 'Tất cả' : 
               filterType === 'ongoing' ? 'Đang diễn ra' :
               filterType === 'registered' ? 'Đã đăng ký' : 'Sắp diễn ra'}
            </Button>
          ))}
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(211,47,47,0.1)',
            '& .MuiAlert-icon': {
              color: '#d32f2f'
            }
          }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="300px"
          sx={{
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 4,
            backdropFilter: 'blur(10px)'
          }}
        >
          <CircularProgress 
            size={70} 
            thickness={4} 
            sx={{
              color: '#2196F3',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}
          />
        </Box>
      ) : getFilteredEvents().length === 0 ? (
        <Paper 
          sx={{ 
            p: 5, 
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}
          >
            <StarIcon sx={{ color: '#bdbdbd', fontSize: 30 }} />
            Không có sự kiện nào {filter === 'registered' ? 'đã đăng ký' : filter === 'upcoming' ? 'sắp diễn ra' : ''}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {getFilteredEvents().map((event, index) => {
            const status = getEventStatus(event);
            return (
              <Grid item xs={12} sm={6} md={4} key={event.mask}
                sx={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s`
                }}
              >
                <Card className="event-card" sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    paddingTop: '66.67%',
                    overflow: 'hidden',
                    borderRadius: '16px 16px 0 0'
                  }}>
                    <CardMedia
                      className="event-card-media"
                      component="img"
                      image={getEventImage(event)}
                      alt={event.tensk}
                      sx={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ 
                    flexGrow: 1, 
                    p: 3,
                    '&:last-child': { pb: 3 }
                  }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        mb: 2,
                        fontWeight: 700,
                        color: '#102770',
                        lineHeight: 1.4,
                        fontSize: '1.1rem'
                      }}
                    >
                      {event.tensk}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      '& svg': {
                        fontSize: 20,
                        color: '#2c387e'
                      }
                    }}>
                      <CalendarIcon sx={{ mr: 1 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: '#2c387e'
                        }}
                      >
                        {new Date(event.thoigianbatdau).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    {event.diadiem && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        '& svg': {
                          fontSize: 20,
                          color: '#2c387e'
                        }
                      }}>
                        <LocationIcon sx={{ mr: 1 }} />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            color: '#2c387e'
                          }}
                        >
                          {event.diadiem}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 2, 
                      mt: 2,
                      flexWrap: 'wrap'
                    }}>
                      <Chip
                        className="info-chip"
                        icon={<InfoIcon />}
                        label={`CTXH: ${event.ctxh}`}
                        size="small"
                        sx={{
                          bgcolor: '#e8eaf6',
                          color: '#283593',
                          fontWeight: 600,
                          border: '1px solid rgba(40,53,147,0.1)'
                        }}
                      />
                      <Chip
                        icon={<InfoIcon />}
                        label={`ĐRL: ${event.drl}`}
                        size="small"
                        sx={{
                          bgcolor: '#e8eaf6',
                          color: '#283593',
                          fontWeight: 600,
                          border: '1px solid rgba(40,53,147,0.1)',
                          '&:hover': {
                            bgcolor: '#c5cae9',
                            transform: 'translateY(-2px)'
                          },
                          '& .MuiChip-icon': {
                            color: '#283593'
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      className={`register-button ${isEventRegistered(event.mask) ? 'register-button-success' : ''}`}
                      variant="contained"
                      color={isEventRegistered(event.mask) ? "success" : "primary"}
                      fullWidth
                      onClick={() => handleRegisterClick(event)}
                      disabled={isEventRegistered(event.mask) || status.label === 'Đã kết thúc'}
                      sx={{
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        letterSpacing: '0.5px',
                        background: isEventRegistered(event.mask) 
                          ? 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)'
                          : 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)'
                      }}
                    >
                      {isEventRegistered(event.mask) ? 'Đã đăng ký' : 'Đăng ký tham gia'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {selectedEvent && (
        <EventRegistration
          event={selectedEvent}
          open={openRegistration}
          onClose={() => {
            setOpenRegistration(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </Container>
  );
}

export default Events; 