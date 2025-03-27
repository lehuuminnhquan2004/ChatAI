import React, { useState, useEffect } from "react";
import {
  Box,
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
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  DeleteForever as DeleteForeverIcon,
} from "@mui/icons-material";
import axios from "axios";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
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

  // Fetch teachers data
  const fetchTeachers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/teachers");
      setTeachers(response.data);
    } catch (error) {
      setError("Không thể tải dữ liệu giảng viên");
      console.error("Error fetching teachers:", error);
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
      if (editMode) {
        await axios.put(
          `http://localhost:5000/api/teachers/${selectedTeacher.magv}`,
          formData
        );
        setSuccess("Cập nhật thông tin giảng viên thành công");
      } else {
        await axios.post("http://localhost:5000/api/teachers", formData);
        setSuccess("Thêm giảng viên mới thành công");
      }
      fetchTeachers();
      handleClose();
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
      await axios.delete(
        `http://localhost:5000/api/teachers/${deleteConfirm.teacher.magv}`
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
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quản lý Giảng viên
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Thêm Giảng viên
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã GV</TableCell>
              <TableCell>Tên Giảng viên</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Zalo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.magv}>
                <TableCell>{teacher.magv}</TableCell>
                <TableCell>{teacher.tengv}</TableCell>
                <TableCell>{teacher.sdt}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.zalo || "-"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(teacher)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(teacher)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
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
            borderRadius: "8px",
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
              "&:hover": {
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
          >
            Có
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teachers;
