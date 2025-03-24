import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import axios from 'axios';
import authService from '../services/authService';
import EventRegistration from './EventRegistration';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openRegistration, setOpenRegistration] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);

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
      setEvents(response.data);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sự kiện
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : events.length === 0 ? (
        <Typography variant="body1" align="center">
          Không có sự kiện nào
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.mask}>
              <Card>
                {event.hinhanh && (
                  <CardMedia
                    component="img"
                    height="140"
                    image={event.hinhanh}
                    alt={event.tensk}
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {event.tensk}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.noidung}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thời gian: {new Date(event.thoigianbatdau).toLocaleString()} - {new Date(event.thoigianketthuc).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    CTXH: {event.ctxh}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điểm rèn luyện: {event.drl}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color={isEventRegistered(event.mask) ? "success" : "primary"}
                      fullWidth
                      onClick={() => handleRegisterClick(event)}
                      disabled={isEventRegistered(event.mask)}
                    >
                      {isEventRegistered(event.mask) ? 'Đã đăng ký' : 'Đăng ký tham gia'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
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