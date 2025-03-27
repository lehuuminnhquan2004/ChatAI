import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  CircularProgress
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DeleteForever as DeleteForeverIcon,
  School as SchoolIcon
} from "@mui/icons-material";
import axios from "axios";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState({
    magv: "",
    tengv: "",
    sdt: "",
    email: "",
    zalo: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    teacher: null,
  });

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTeachers(response.data || []);
    } catch (error) {
      setError("Không thể tải dữ liệu giảng viên");
      console.error("Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleOpen = (teacher = null) => {
    if (teacher) {
      setFormData(teacher);
      setEditMode(true);
      setSelectedTeacher(teacher);
    } else {
      setFormData({
        magv: "",
        tengv: "",
        sdt: "",
        email: "",
        zalo: "",
      });
      setEditMode(false);
      setSelectedTeacher(null);
    }
    setOpen(true);
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    setOpen(false);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (editMode) {
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/teachers/${selectedTeacher.magv}`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setSuccess("Cập nhật thông tin giảng viên thành công");
        fetchTeachers();
        handleClose();
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/teachers`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setSuccess("Thêm giảng viên mới thành công");
        fetchTeachers();
        handleClose();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteClick = (teacher) => {
    setDeleteConfirm({
      open: true,
      teacher: teacher,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/teachers/${deleteConfirm.teacher.magv}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setSuccess("Xóa giảng viên thành công");
      fetchTeachers();
      setDeleteConfirm({ open: false, teacher: null });
    } catch (error) {
      setError("Không thể xóa giảng viên");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ open: false, teacher: null });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <SchoolIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý Giảng viên
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Thêm Giảng viên
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Mã GV</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên Giảng viên</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Số điện thoại</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Zalo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Không có giảng viên nào
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow 
                    key={teacher.magv}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover' 
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{teacher.magv}</TableCell>
                    <TableCell>{teacher.tengv}</TableCell>
                    <TableCell>{teacher.sdt}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell>{teacher.zalo || "-"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          onClick={() => handleOpen(teacher)}
                          sx={{ 
                            '&:hover': { 
                              color: 'primary.main' 
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          onClick={() => handleDeleteClick(teacher)}
                          color="error"
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'error.lighter' 
                            }
                          }}
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
      </Paper>

      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          {editMode ? "Chỉnh sửa Giảng viên" : "Thêm Giảng viên mới"}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Mã Giảng viên"
              name="magv"
              value={formData.magv}
              onChange={handleChange}
              margin="normal"
              required
              disabled={editMode}
            />
            <TextField
              fullWidth
              label="Tên Giảng viên"
              name="tengv"
              value={formData.tengv}
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
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              type="email"
            />
            <TextField
              fullWidth
              label="Zalo"
              name="zalo"
              value={formData.zalo}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              borderRadius: 1,
              textTransform: 'none',
              px: 3
            }}
          >
            {editMode ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirm.open}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            width: "400px",
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "error.main",
            pb: 1,
          }}
        >
          <DeleteForeverIcon color="error" />
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa giảng viên này không?
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1, fontSize: "0.875rem" }}
          >
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            sx={{
              color: "text.primary",
              bgcolor: "grey.100",
              borderRadius: 1,
              textTransform: 'none',
              '&:hover': {
                bgcolor: "grey.200",
              },
            }}
          >
            Không
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 1,
              textTransform: 'none'
            }}
          >
            Có, xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Teachers;
