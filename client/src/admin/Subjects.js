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

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [formData, setFormData] = useState({
    mamh: '',
    tenmh: '',
    sotinchi: '',
    mota: ''
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/subjects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSubjects(response.data.subjects);
    } catch (error) {
      setError('Không thể tải danh sách môn học');
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setFormData(subject);
      setSelectedSubject(subject);
    } else {
      setFormData({
        mamh: '',
        tenmh: '',
        sotinchi: '',
        mota: ''
      });
      setSelectedSubject(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
    setFormData({
      mamh: '',
      tenmh: '',
      sotinchi: '',
      mota: ''
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
      if (selectedSubject) {
        // Cập nhật môn học
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/admin/subjects/${selectedSubject.mamh}`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } else {
        // Thêm môn học mới
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/admin/subjects`,
          formData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchSubjects();
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (mamh) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/admin/subjects/${mamh}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        fetchSubjects();
      } catch (error) {
        setError('Không thể xóa môn học');
        console.error('Lỗi:', error);
      }
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý môn học
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Thêm môn học
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
                  <TableCell>Mã môn học</TableCell>
                  <TableCell>Tên môn học</TableCell>
                  <TableCell>Số tín chỉ</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Không có môn học nào
                    </TableCell>
                  </TableRow>
                ) : (
                  subjects.map((subject) => (
                    <TableRow key={subject.mamh}>
                      <TableCell>{subject.mamh}</TableCell>
                      <TableCell>{subject.tenmh}</TableCell>
                      <TableCell>{subject.sotinchi}</TableCell>
                      <TableCell>{subject.mota}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenDialog(subject)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(subject.mamh)}>
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
            {selectedSubject ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Mã môn học"
                name="mamh"
                value={formData.mamh}
                onChange={handleChange}
                margin="normal"
                required
                disabled={!!selectedSubject}
              />
              <TextField
                fullWidth
                label="Tên môn học"
                name="tenmh"
                value={formData.tenmh}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Số tín chỉ"
                name="sotinchi"
                type="number"
                value={formData.sotinchi}
                onChange={handleChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Mô tả"
                name="mota"
                value={formData.mota}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained">
              {selectedSubject ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default Subjects; 