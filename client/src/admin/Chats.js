import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';

function Chats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setChats(response.data.chats);
    } catch (error) {
      setError('Không thể tải lịch sử chat');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (chat) => {
    setSelectedChat(chat);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedChat(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Lịch sử chat
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã sinh viên</TableCell>
                  <TableCell>Tên sinh viên</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : chats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có lịch sử chat nào
                    </TableCell>
                  </TableRow>
                ) : (
                  chats.map((chat) => (
                    <TableRow key={chat.id}>
                      <TableCell>{chat.masv}</TableCell>
                      <TableCell>{chat.tensv}</TableCell>
                      <TableCell>{formatDate(chat.thoigian)}</TableCell>
                      <TableCell>
                        {chat.noidung.length > 100
                          ? `${chat.noidung.substring(0, 100)}...`
                          : chat.noidung}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={chat.trangthai === 'Đã trả lời' ? 'Đã trả lời' : 'Chưa trả lời'}
                          color={chat.trangthai === 'Đã trả lời' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(chat)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            Chi tiết cuộc trò chuyện
          </DialogTitle>
          <DialogContent>
            {selectedChat && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Sinh viên:</strong> {selectedChat.tensv} ({selectedChat.masv})
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Thời gian:</strong> {formatDate(selectedChat.thoigian)}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Trạng thái:</strong>{' '}
                  <Chip
                    label={selectedChat.trangthai === 'Đã trả lời' ? 'Đã trả lời' : 'Chưa trả lời'}
                    color={selectedChat.trangthai === 'Đã trả lời' ? 'success' : 'warning'}
                    size="small"
                  />
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Nội dung:</strong>
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedChat.noidung}
                  </Typography>
                </Paper>
                {selectedChat.traloi && (
                  <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      <strong>Trả lời:</strong>
                    </Typography>
                    <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedChat.traloi}
                      </Typography>
                    </Paper>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default Chats; 