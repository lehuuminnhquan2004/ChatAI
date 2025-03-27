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
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    masv: '',
    password: '',
    tensv: '',
    ngaysinh: '',
    gioitinh: '',
    lop: '',
    chuyennganh: '',
    sdt: '',
    email: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      setError('Không thể tải danh sách sinh viên');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setFormData(student);
      setSelectedStudent(student);
    } else {
      setFormData({
        masv: '',
        password: '',
        tensv: '',
        ngaysinh: '',
        gioitinh: '',
        lop: '',
        chuyennganh: '',
        sdt: '',
        email: ''
      });
      setSelectedStudent(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({
      masv: '',
      password: '',
      tensv: '',
      ngaysinh: '',
      gioitinh: '',
      lop: '',
      chuyennganh: '',
      sdt: '',
      email: ''
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
      if (selectedStudent) {
        // Cập nhật sinh viên
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/students/${selectedStudent.masv}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Thêm sinh viên mới
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/students`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchStudents();
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (masv) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/admin/students/${masv}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        fetchStudents();
      } catch (error) {
        setError('Không thể xóa sinh viên');
        console.error('Lỗi:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý sinh viên
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm sinh viên
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
                  <TableCell>Mã SV</TableCell>
                  <TableCell>Tên sinh viên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Số điện thoại</TableCell>
                  <TableCell>Lớp</TableCell>
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
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có sinh viên nào
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.masv}>
                      <TableCell>{student.masv}</TableCell>
                      <TableCell>{student.tensv}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.sdt}</TableCell>
                      <TableCell>{student.lop}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(student)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(student.masv)}>
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
            {selectedStudent ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Mã sinh viên"
                name="masv"
                value={formData.masv}
                onChange={handleChange}
                margin="normal"
                required
                disabled={!!selectedStudent}
              />
              
              <TextField
                fullWidth
                label="Tên sinh viên"
                name="tensv"
                value={formData.tensv}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Ngày sinh"
                name="ngaysinh"
                type="date"
                value={formData.ngaysinh}
                onChange={handleChange}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label=""
                name="gioitinh"
                select
                value={formData.gioitinh}
                onChange={handleChange}
                margin="normal"
                required
                SelectProps={{
                  native: true
                }}
              >
                <option disabled selected value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
              </TextField>
              <TextField
                fullWidth
                label="Lớp"
                name="lop"
                value={formData.lop}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Chuyên ngành"
                name="chuyennganh"
                value={formData.chuyennganh}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                name="sdt"
                value={formData.sdt}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedStudent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default Students; 