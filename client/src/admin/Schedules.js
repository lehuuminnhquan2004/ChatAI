import React, { useState, useEffect, useCallback } from 'react';
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
  InputLabel,
  InputAdornment,
  Snackbar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
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
    thu: '',
    ca: '',
    phong: '',
    masv: '',
    mamh: '',
    magv: '',
    ngaybatdau: '',
    ngayketthuc: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/admin/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.subjects) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách môn học:', error);
    }
  }, [API_URL]);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Đang lấy danh sách lịch học...');
      
      const response = await axios.get(`${API_URL}/api/schedule/admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Kết quả từ server:', response.data);
      
      if (response.data.success) {
        setSchedules(response.data.schedules || []);
        console.log('Đã cập nhật state schedules:', response.data.schedules);
        showSnackbar('Đã tải danh sách lịch học thành công', 'success');
      } else {
        throw new Error(response.data.message || 'Không thể tải dữ liệu lịch học');
      }
    } catch (error) {
      console.error('Chi tiết lỗi:', error);
      setError('Không thể tải danh sách lịch học: ' + (error.response?.data?.message || error.message));
      showSnackbar('Lỗi khi tải danh sách lịch học', 'error');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
  }, [fetchSchedules, fetchSubjects]);

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      // Chuyển đổi định dạng ngày tháng cho form
      const formattedSchedule = {
        ...schedule,
        ngaybatdau: schedule.ngaybatdau ? schedule.ngaybatdau.split('T')[0] : '',
        ngayketthuc: schedule.ngayketthuc ? schedule.ngayketthuc.split('T')[0] : ''
      };
      setFormData(formattedSchedule);
      setSelectedSchedule(schedule);
    } else {
      setFormData({
        thu: '',
        ca: '',
        phong: '',
        masv: '',
        mamh: '',
        magv: '',
        ngaybatdau: '',
        ngayketthuc: ''
      });
      setSelectedSchedule(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSchedule(null);
    setFormData({
      thu: '',
      ca: '',
      phong: '',
      masv: '',
      mamh: '',
      magv: '',
      ngaybatdau: '',
      ngayketthuc: ''
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
      
      // Validate form data
      const requiredFields = ['thu', 'ca', 'phong', 'masv', 'mamh', 'magv', 'ngaybatdau', 'ngayketthuc'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(', ')}`);
      }
      
      // Tạo request body
      const scheduleData = {
        thu: parseInt(formData.thu),
        ca: parseInt(formData.ca),
        phong: formData.phong,
        masv: formData.masv,
        mamh: formData.mamh,
        magv: formData.magv,
        ngaybatdau: formData.ngaybatdau,
        ngayketthuc: formData.ngayketthuc
      };
      
      // Gửi request tới API
      const response = await axios.post(
        `${API_URL}/api/admin/chat`,
        {
          message: "ADD_SCHEDULE",
          scheduleData: scheduleData
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        handleCloseDialog();
        fetchSchedules();
        showSnackbar('Thêm lịch học thành công', 'success');
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi thêm lịch học');
      }
    } catch (error) {
      console.error('Lỗi khi thêm lịch học:', error);
      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
      showSnackbar('Lỗi: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async (thu, ca, phong, masv) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(
          `${API_URL}/api/schedule/admin`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            data: { thu, ca, phong, masv }
          }
        );
        fetchSchedules();
        showSnackbar('Xóa lịch học thành công', 'success');
      } catch (error) {
        setError('Không thể xóa lịch học: ' + (error.response?.data?.message || error.message));
        showSnackbar('Lỗi khi xóa lịch học', 'error');
      }
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (!searchTerm) return true;
    
    const searchStr = searchTerm.toLowerCase();
    return (
      (schedule.masv && schedule.masv.toLowerCase().includes(searchStr)) ||
      (schedule.tensv && schedule.tensv.toLowerCase().includes(searchStr)) ||
      (schedule.mamh && schedule.mamh.toLowerCase().includes(searchStr)) ||
      (schedule.tenmh && schedule.tenmh.toLowerCase().includes(searchStr)) ||
      (schedule.magv && schedule.magv.toLowerCase().includes(searchStr)) ||
      (schedule.tengv && schedule.tengv.toLowerCase().includes(searchStr)) ||
      (schedule.phong && schedule.phong.toLowerCase().includes(searchStr)) ||
      (schedule.thuhoc && schedule.thuhoc.toLowerCase().includes(searchStr))
    );
  });

  // Hàm lấy tên môn học từ danh sách môn học
  const getSubjectName = (mamh) => {
    const subject = subjects.find(s => s.mamh === mamh);
    return subject ? subject.tenmh : mamh;
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Danh sách lịch học
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchSchedules}
              sx={{ mr: 2 }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Thêm lịch học
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Tìm kiếm theo mã sinh viên, tên sinh viên, môn học, giảng viên, phòng học..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thứ</TableCell>
                  <TableCell>Ca học</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Tên sinh viên</TableCell>
                  <TableCell>Mã môn học</TableCell>
                  <TableCell>Tên môn học</TableCell>
                  <TableCell>Mã GV</TableCell>
                  <TableCell>Tên giảng viên</TableCell>
                  <TableCell>Ngày bắt đầu</TableCell>
                  <TableCell>Ngày kết thúc</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      Không có lịch học nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={`${schedule.masv}-${schedule.mamh}-${schedule.thu}-${schedule.ca}`}>
                      <TableCell>{schedule.thuhoc}</TableCell>
                      <TableCell>{schedule.giohoc}</TableCell>
                      <TableCell>{schedule.phong}</TableCell>
                      <TableCell>{schedule.masv}</TableCell>
                      <TableCell>{schedule.tensv || 'Chưa có thông tin'}</TableCell>
                      <TableCell>{schedule.mamh}</TableCell>
                      <TableCell>{schedule.tenmh || getSubjectName(schedule.mamh)}</TableCell>
                      <TableCell>{schedule.magv}</TableCell>
                      <TableCell>{schedule.tengv || 'Chưa có thông tin'}</TableCell>
                      <TableCell>{schedule.ngaybatdau}</TableCell>
                      <TableCell>{schedule.ngayketthuc}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(schedule.thu, schedule.ca, schedule.phong, schedule.masv)}
                        >
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
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Thứ</InputLabel>
                <Select
                  name="thu"
                  value={formData.thu}
                  onChange={handleChange}
                  label="Thứ"
                >
                  <MenuItem value="2">Thứ 2</MenuItem>
                  <MenuItem value="3">Thứ 3</MenuItem>
                  <MenuItem value="4">Thứ 4</MenuItem>
                  <MenuItem value="5">Thứ 5</MenuItem>
                  <MenuItem value="6">Thứ 6</MenuItem>
                  <MenuItem value="7">Thứ 7</MenuItem>
                  <MenuItem value="8">Chủ nhật</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Ca học</InputLabel>
                <Select
                  name="ca"
                  value={formData.ca}
                  onChange={handleChange}
                  label="Ca học"
                >
                  <MenuItem value="1">Ca 1 (7:00 - 9:30)</MenuItem>
                  <MenuItem value="2">Ca 2 (9:35 - 12:05)</MenuItem>
                  <MenuItem value="3">Ca 3 (12:35 - 15:05)</MenuItem>
                  <MenuItem value="4">Ca 4 (15:10 - 17:40)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Phòng học"
                name="phong"
                value={formData.phong}
                onChange={handleChange}
                margin="normal"
                required
                placeholder="Ví dụ: A101, B203"
              />
              <TextField
                fullWidth
                label="Mã sinh viên"
                name="masv"
                value={formData.masv}
                onChange={handleChange}
                margin="normal"
                required
              />
              {subjects && subjects.length > 0 ? (
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
              ) : (
                <TextField
                  fullWidth
                  label="Mã môn học"
                  name="mamh"
                  value={formData.mamh}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              )}
              <TextField
                fullWidth
                label="Mã giảng viên"
                name="magv"
                value={formData.magv}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                name="ngaybatdau"
                type="date"
                value={formData.ngaybatdau}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Ngày kết thúc"
                name="ngayketthuc"
                type="date"
                value={formData.ngayketthuc}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        />
      </Container>
    </AdminLayout>
  );
}

export default Schedules; 