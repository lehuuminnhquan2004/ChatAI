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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formData, setFormData] = useState({
    malich: '',
    mamh: '',
    ngayhoc: '',
    giobatdau: '',
    gioketthuc: '',
    phonghoc: '',
    giangvien: ''
  });

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSchedules(response.data.schedules);
    } catch (error) {
      setError('Không thể tải danh sách lịch học');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Lỗi khi tải danh sách môn học:', error);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setFormData(schedule);
      setSelectedSchedule(schedule);
    } else {
      setFormData({
        malich: '',
        mamh: '',
        ngayhoc: '',
        giobatdau: '',
        gioketthuc: '',
        phonghoc: '',
        giangvien: ''
      });
      setSelectedSchedule(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSchedule(null);
    setFormData({
      malich: '',
      mamh: '',
      ngayhoc: '',
      giobatdau: '',
      gioketthuc: '',
      phonghoc: '',
      giangvien: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (selectedSchedule) {
        // Cập nhật lịch học
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/schedules/${selectedSchedule.malich}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Thêm lịch học mới
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/schedules`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchSchedules();
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (malich) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/admin/schedules/${malich}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        fetchSchedules();
      } catch (error) {
        setError('Không thể xóa lịch học');
        console.error('Lỗi:', error);
      }
    }
  };

  const getSubjectName = (mamh) => {
    const subject = subjects.find(s => s.mamh === mamh);
    return subject ? subject.tenmh : mamh;
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý lịch học
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm lịch học
          </Button>
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
                  <TableCell>Mã lịch</TableCell>
                  <TableCell>Môn học</TableCell>
                  <TableCell>Ngày học</TableCell>
                  <TableCell>Giờ bắt đầu</TableCell>
                  <TableCell>Giờ kết thúc</TableCell>
                  <TableCell>Phòng học</TableCell>
                  <TableCell>Giảng viên</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      Không có lịch học nào
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((schedule) => (
                    <TableRow key={schedule.malich}>
                      <TableCell>{schedule.malich}</TableCell>
                      <TableCell>{getSubjectName(schedule.mamh)}</TableCell>
                      <TableCell>{schedule.ngayhoc}</TableCell>
                      <TableCell>{schedule.giobatdau}</TableCell>
                      <TableCell>{schedule.gioketthuc}</TableCell>
                      <TableCell>{schedule.phonghoc}</TableCell>
                      <TableCell>{schedule.giangvien}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(schedule)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(schedule.malich)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedSchedule ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Mã lịch"
                name="malich"
                value={formData.malich}
                onChange={handleChange}
                margin="normal"
                required
                disabled={!!selectedSchedule}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Môn học</InputLabel>
                <Select
                  name="mamh"
                  value={formData.mamh}
                  onChange={handleChange}
                  label="Môn học"
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject.mamh} value={subject.mamh}>
                      {subject.tenmh}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Ngày học"
                name="ngayhoc"
                type="date"
                value={formData.ngayhoc}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Giờ bắt đầu"
                name="giobatdau"
                type="time"
                value={formData.giobatdau}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Giờ kết thúc"
                name="gioketthuc"
                type="time"
                value={formData.gioketthuc}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Phòng học"
                name="phonghoc"
                value={formData.phonghoc}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Giảng viên"
                name="giangvien"
                value={formData.giangvien}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedSchedule ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default Schedules; 