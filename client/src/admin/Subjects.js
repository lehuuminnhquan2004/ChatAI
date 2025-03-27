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
  Tooltip,
  Stack,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './layouts/AdminLayout';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [formData, setFormData] = useState({
    mamh: '',
    tenmh: '',
    sotc: '',
    tailieu: null
  });
  const [paginationInfo, setPaginationInfo] = useState({});

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/subjects`, {
        params: {
          page,
          limit: rowsPerPage
        }
      });

      if (response.data.success) {
        setSubjects(response.data.subjects);
        setTotalPages(response.data.pagination.totalPages);
        setPaginationInfo(response.data.pagination);
      } else {
        setError(response.data.message || 'Không thể tải danh sách môn học');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách môn học';
      console.error('Error fetching subjects:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setFormData({
        mamh: subject.mamh,
        tenmh: subject.tenmh,
        sotc: subject.sotc,
        tailieu: null
      });
      setSelectedSubject(subject);
    } else {
      setFormData({
        mamh: '',
        tenmh: '',
        sotc: '',
        tailieu: null
      });
      setSelectedSubject(null);
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject(null);
    setFormData({
      mamh: '',
      tenmh: '',
      sotc: '',
      tailieu: null
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sotc' ? (value === '' ? '' : parseInt(value) || 0) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File quá lớn. Kích thước tối đa là 10MB');
        e.target.value = '';
        return;
      }
      setFormData(prev => ({
        ...prev,
        tailieu: file
      }));
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleSubmit = async () => {
    try {
      setError('');

      if (!formData.mamh && !selectedSubject) {
        setError('Vui lòng nhập mã môn học');
        return;
      }
      if (!formData.tenmh) {
        setError('Vui lòng nhập tên môn học');
        return;
      }
      if (!formData.sotc || formData.sotc <= 0) {
        setError('Số tín chỉ phải là số dương');
        return;
      }

      const formDataToSend = new FormData();
      if (!selectedSubject) formDataToSend.append('mamh', formData.mamh);
      formDataToSend.append('tenmh', formData.tenmh);
      formDataToSend.append('sotc', formData.sotc);
      if (formData.tailieu) {
        formDataToSend.append('tailieu', formData.tailieu);
      }

      let response;
      if (selectedSubject) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/subjects/${selectedSubject.mamh}`,
          formDataToSend
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/subjects`,
          formDataToSend
        );
      }

      if (response.data.success) {
        handleCloseDialog();
        await fetchSubjects();
      } else {
        setError(response.data.message || 'Không thể lưu môn học');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      console.error('Error submitting subject:', err);
      setError(errorMessage);
    }
  };

  const handleDelete = async (mamh) => {
    try {
      setError('');
      
      if (window.confirm('Bạn có chắc chắn muốn xóa môn học này?')) {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/subjects/${mamh}`
        );

        if (response.data.success) {
          await fetchSubjects();
        } else {
          setError(response.data.message || 'Không thể xóa môn học');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể xóa môn học';
      console.error('Error deleting subject:', err);
      setError(errorMessage);
    }
  };

  const handleDownload = async (mamh) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/subjects/${mamh}/tailieu`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tailieu_${mamh}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể tải tài liệu';
      console.error('Error downloading document:', err);
      setError(errorMessage);
    }
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
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
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã môn học</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên môn học</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Số tín chỉ</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Tài liệu</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
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
                      <TableCell sx={{ color: 'primary.main', fontWeight: 'bold' }}>{subject.mamh}</TableCell>
                      <TableCell>{subject.tenmh}</TableCell>
                      <TableCell align="center">{subject.sotc}</TableCell>
                      <TableCell align="center">
                        {subject.has_tailieu ? (
                          <Tooltip title="Tải xuống tài liệu">
                            <IconButton
                              color="primary"
                              onClick={() => handleDownload(subject.mamh)}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          'Chưa có tài liệu'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Chỉnh sửa">
                          <IconButton onClick={() => handleOpenDialog(subject)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton 
                            onClick={() => handleDelete(subject.mamh)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && subjects.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center',
              p: 2,
              gap: 2,
              borderTop: '1px solid rgba(224, 224, 224, 1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" component="span">
                  Số hàng mỗi trang:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  size="small"
                  sx={{ minWidth: 80 }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${paginationInfo.from}-${paginationInfo.to} trên ${paginationInfo.total}`}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton 
                    size="small"
                    onClick={() => handlePageChange(null, page - 1)}
                    disabled={page === 1}
                  >
                    <Typography variant="body2">&lt;</Typography>
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handlePageChange(null, page + 1)}
                    disabled={page === totalPages}
                  >
                    <Typography variant="body2">&gt;</Typography>
                  </IconButton>
                </Stack>
              </Box>
            </Box>
          )}
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
                error={!formData.mamh && !selectedSubject}
                helperText={!formData.mamh && !selectedSubject ? 'Vui lòng nhập mã môn học' : ''}
              />
              <TextField
                fullWidth
                label="Tên môn học"
                name="tenmh"
                value={formData.tenmh}
                onChange={handleChange}
                margin="normal"
                required
                error={!formData.tenmh}
                helperText={!formData.tenmh ? 'Vui lòng nhập tên môn học' : ''}
              />
              <TextField
                fullWidth
                label="Số tín chỉ"
                name="sotc"
                type="number"
                value={formData.sotc}
                onChange={handleChange}
                margin="normal"
                required
                inputProps={{ min: 1 }}
                error={!formData.sotc || formData.sotc <= 0}
                helperText={!formData.sotc || formData.sotc <= 0 ? 'Số tín chỉ phải là số dương' : ''}
              />
              <input
                accept="*/*"
                style={{ display: 'none' }}
                id="tailieu-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="tailieu-file">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<UploadIcon />}
                >
                  {formData.tailieu ? formData.tailieu.name : 'Chọn tài liệu'}
                </Button>
              </label>
              <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                Kích thước tối đa: 10MB
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {selectedSubject ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default Subjects; 