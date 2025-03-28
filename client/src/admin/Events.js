import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Grid,
  Chip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  EmojiEvents as EmojiEventsIcon,
  School as SchoolIcon,
  Image as ImageIcon,
  NoPhotography as NoPhotoIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    mask: '',
    tensk: '',
    noidung: '',
    hinhanh: '',
    thoigianbatdau: '',
    thoigianketthuc: '',
    ctxh: '',
    drl: ''
  });
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (event = null) => {
    if (event) {
      // Format datetime để hiển thị trong input datetime-local
      const formattedEvent = {
        ...event,
        thoigianbatdau: event.thoigianbatdau.slice(0, 16),
        thoigianketthuc: event.thoigianketthuc.slice(0, 16)
      };
      setFormData(formattedEvent);
      setSelectedEvent(event);
    } else {
      setFormData({
        mask: '',
        tensk: '',
        noidung: '',
        hinhanh: '',
        thoigianbatdau: '',
        thoigianketthuc: '',
        ctxh: '',
        drl: ''
      });
      setSelectedEvent(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setFormData({
      mask: '',
      tensk: '',
      noidung: '',
      hinhanh: '',
      thoigianbatdau: '',
      thoigianketthuc: '',
      ctxh: '',
      drl: ''
    });
    setSelectedFile(null);
    setPreviewImage('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF');
      return;
    }

    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('adminToken');
      let imageUrl = formData.hinhanh; // Giữ URL ảnh cũ nếu có

      // Nếu có file ảnh mới, upload trước
      if (selectedFile) {
        const formData = new FormData();
        formData.append('hinhanh', selectedFile);

        const uploadResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/events/upload`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (uploadResponse.data.success) {
          imageUrl = uploadResponse.data.url;
        } else {
          throw new Error('Upload ảnh thất bại');
        }
      }

      // Cập nhật formData với URL ảnh mới
      const submitData = {
        ...formData,
        hinhanh: imageUrl
      };

      if (selectedEvent) {
        // Cập nhật sự kiện
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.mask}`,
          submitData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Thêm sự kiện mới
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/events`,
          submitData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      console.error('Lỗi:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (mask) => {
    setEventToDelete(mask);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/events/${eventToDelete}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      fetchEvents();
      setOpenDeleteDialog(false);
      setEventToDelete(null);
    } catch (error) {
      setError('Không thể xóa sự kiện');
      console.error('Lỗi:', error);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setEventToDelete(null);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      hinhanh: ''
    });
    setPreviewImage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4,
            borderBottom: '2px solid #1976d2',
            pb: 2
          }}
        >
          <Box display="flex" alignItems="center">
            <EventIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Quản lý sự kiện
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Thêm sự kiện
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} />
          </Box>
        ) : events.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            minHeight="60vh"
            sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 4,
              p: 4,
              textAlign: 'center'
            }}
          >
            <EventIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Chưa có sự kiện nào
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Hãy thêm sự kiện đầu tiên bằng cách nhấn nút "Thêm sự kiện"
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Thêm sự kiện
            </Button>
          </Box>
        ) : (
          <Paper 
            elevation={3}
            sx={{ 
              width: '100%', 
              borderRadius: 2, 
              overflow: 'hidden'
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#1976d2',
                      '& .MuiTableCell-head': {
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        padding: '14px 8px',
                        textAlign: 'center',
                        borderRight: '1px solid rgba(255, 255, 255, 0.15)',
                        '&:last-child': {
                          borderRight: 'none'
                        },
                        userSelect: 'none'
                      }
                    }}
                  >
                    <TableCell width="10%" align="center">Mã sự kiện</TableCell>
                    <TableCell width="18%" align="center">Tên sự kiện</TableCell>
                    <TableCell width="27%" align="center">Nội dung</TableCell>
                    <TableCell width="8%" align="center">Hình ảnh</TableCell>
                    <TableCell width="20%" align="center">Thời gian</TableCell>
                    <TableCell width="12%" align="center">Điểm</TableCell>
                    <TableCell width="5%" align="center">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((event, index) => (
                    <TableRow 
                      key={event.mask}
                      sx={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f5f5'
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 'medium',
                          color: 'primary.main'
                        }}
                      >
                        {event.mask}
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight="500"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {event.tensk}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: '1.4em',
                            height: '2.8em'
                          }}
                        >
                          {event.noidung}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {event.hinhanh ? (
                          <Tooltip title={event.hinhanh}>
                            <IconButton 
                              size="small" 
                              onClick={() => window.open(`/event/${event.hinhanh}`, '_blank')}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.lighter' }
                              }}
                            >
                              <ImageIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <NoPhotoIcon color="disabled" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon 
                            fontSize="small" 
                            sx={{ color: 'primary.main' }} 
                          />
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {formatDateTime(event.thoigianbatdau)}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              đến {formatDateTime(event.thoigianketthuc)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Stack direction="column" spacing={1}>
                          <Chip 
                            icon={<EmojiEventsIcon />}
                            label={`CTXH: ${event.ctxh}`} 
                            size="small" 
                            color="success"
                            sx={{ 
                              '& .MuiChip-icon': { fontSize: 16 },
                              fontWeight: 500
                            }}
                          />
                          <Chip 
                            icon={<SchoolIcon />}
                            label={`ĐRL: ${event.drl}`} 
                            size="small" 
                            color="info"
                            sx={{ 
                              '& .MuiChip-icon': { fontSize: 16 },
                              fontWeight: 500
                            }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Chỉnh sửa" arrow>
                            <IconButton 
                              onClick={() => handleOpenDialog(event)}
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'primary.lighter'
                                }
                              }}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Xóa" arrow>
                            <IconButton 
                              onClick={() => handleDelete(event.mask)}
                              sx={{ 
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'error.lighter'
                                }
                              }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={events.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số hàng mỗi trang:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} trên ${count !== -1 ? count : `hơn ${to}`}`
              }
              sx={{
                borderTop: '1px solid',
                borderColor: 'divider',
                '& .MuiTablePagination-select': {
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }
              }}
            />
          </Paper>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={handleCancelDelete}
          PaperProps={{
            sx: {
              borderRadius: 2,
              width: '400px'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'error.main'
          }}>
            <DeleteIcon />
            Xác nhận xóa
          </DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn xóa sự kiện này không?
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Hành động này không thể hoàn tác.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              onClick={handleCancelDelete}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: 100
              }}
            >
              Không
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              color="error"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: 100
              }}
            >
              Có
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Form */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}>
            <Box display="flex" alignItems="center" gap={1}>
              {selectedEvent ? <EditIcon color="primary" /> : <AddIcon color="primary" />}
              <Typography variant="h6">
                {selectedEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mã sự kiện"
                  name="mask"
                  value={formData.mask}
                  onChange={handleChange}
                  required
                  disabled={!!selectedEvent}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên sự kiện"
                  name="tensk"
                  value={formData.tensk}
                  onChange={handleChange}
                  required
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nội dung"
                  name="noidung"
                  value={formData.noidung}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                  />
                  {!formData.hinhanh && !previewImage ? (
                    <Button
                      variant="outlined"
                      startIcon={<ImageIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      sx={{ textTransform: 'none' }}
                    >
                      Chọn hình ảnh
                    </Button>
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          height: 200,
                          mb: 2,
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={previewImage || (formData.hinhanh ? `/event/${formData.hinhanh}` : '')}
                          alt="Preview"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          startIcon={<ImageIcon />}
                          onClick={() => fileInputRef.current?.click()}
                          sx={{ textTransform: 'none' }}
                        >
                          Thay đổi
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleRemoveImage}
                          sx={{ textTransform: 'none' }}
                        >
                          Xóa
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thời gian bắt đầu"
                  name="thoigianbatdau"
                  type="datetime-local"
                  value={formData.thoigianbatdau}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thời gian kết thúc"
                  name="thoigianketthuc"
                  type="datetime-local"
                  value={formData.thoigianketthuc}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Điểm CTXH"
                  name="ctxh"
                  type="number"
                  value={formData.ctxh}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.5 }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Điểm rèn luyện"
                  name="drl"
                  type="number"
                  value={formData.drl}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: 0.5 }}
                  size="small"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button 
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: 100
              }}
            >
              Hủy
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                minWidth: 100
              }}
            >
              {selectedEvent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default Events; 