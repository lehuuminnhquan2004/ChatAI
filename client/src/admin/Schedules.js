import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  Chip
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon
} from "@mui/icons-material";
import axios from "axios";

function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    malh: "",
    mamh: "",
    magv: "",
    thu: "",
    tiet: "",
    phong: "",
    nhomth: "",
  });

  useEffect(() => {
    fetchSchedules();
    fetchSubjects();
    fetchTeachers();
  }, []);

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/schedules`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSchedules(response.data.schedules || []);
    } catch (error) {
      setError("Không thể tải danh sách lịch học");
      console.error("Lỗi:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách môn học:", error);
      setSubjects([]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/admin/teachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giảng viên:", error);
      setTeachers([]);
    }
  };

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setFormData({
        malh: schedule.malh,
        mamh: schedule.mamh,
        magv: schedule.magv,
        thu: schedule.thu,
        tiet: schedule.tiet,
        phong: schedule.phong,
        nhomth: schedule.nhomth || "",
      });
      setSelectedSchedule(schedule);
    } else {
      setFormData({
        malh: "",
        mamh: "",
        magv: "",
        thu: "",
        tiet: "",
        phong: "",
        nhomth: "",
      });
      setSelectedSchedule(null);
    }
    setOpenDialog(true);
    setError("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSchedule(null);
    setFormData({
      malh: "",
      mamh: "",
      magv: "",
      thu: "",
      tiet: "",
      phong: "",
      nhomth: "",
    });
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (selectedSchedule) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/schedules/${selectedSchedule.malh}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/schedules`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchSchedules();
    } catch (error) {
      setError(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (malh) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch học này?")) {
      try {
        const token = localStorage.getItem("adminToken");
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/schedules/${malh}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSchedules();
      } catch (error) {
        setError("Không thể xóa lịch học");
      }
    }
  };

  const getDayName = (thu) => {
    const days = {
      2: "Thứ 2",
      3: "Thứ 3",
      4: "Thứ 4",
      5: "Thứ 5",
      6: "Thứ 6",
      7: "Thứ 7",
      8: "Chủ nhật"
    };
    return days[thu] || thu;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <ScheduleIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Quản lý lịch học
          </Typography>
        </Box>
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
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mã lịch học</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Môn học</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Giảng viên</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Thứ</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tiết</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Phòng</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nhóm TH</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(schedules) || schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có lịch học nào
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.malh}>
                    <TableCell>{schedule.malh}</TableCell>
                    <TableCell>
                      {subjects.find(s => s.mamh === schedule.mamh)?.tenmh || schedule.mamh}
                    </TableCell>
                    <TableCell>
                      {teachers.find(t => t.magv === schedule.magv)?.tengv || schedule.magv}
                    </TableCell>
                    <TableCell>{getDayName(schedule.thu)}</TableCell>
                    <TableCell>{schedule.tiet}</TableCell>
                    <TableCell>{schedule.phong}</TableCell>
                    <TableCell>
                      {schedule.nhomth && (
                        <Chip label={`Nhóm ${schedule.nhomth}`} size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Chỉnh sửa">
                        <IconButton onClick={() => handleOpenDialog(schedule)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          onClick={() => handleDelete(schedule.malh)}
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
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSchedule ? "Chỉnh sửa lịch học" : "Thêm lịch học mới"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mã lịch học"
                name="malh"
                value={formData.malh}
                onChange={handleChange}
                disabled={!!selectedSchedule}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Môn học</InputLabel>
                <Select
                  name="mamh"
                  value={formData.mamh}
                  onChange={handleChange}
                  label="Môn học"
                >
                  {Array.isArray(subjects) && subjects.map((subject) => (
                    <MenuItem key={subject.mamh} value={subject.mamh}>
                      {subject.tenmh}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Giảng viên</InputLabel>
                <Select
                  name="magv"
                  value={formData.magv}
                  onChange={handleChange}
                  label="Giảng viên"
                >
                  {Array.isArray(teachers) && teachers.map((teacher) => (
                    <MenuItem key={teacher.magv} value={teacher.magv}>
                      {teacher.tengv}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Thứ</InputLabel>
                <Select
                  name="thu"
                  value={formData.thu}
                  onChange={handleChange}
                  label="Thứ"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((day) => (
                    <MenuItem key={day} value={day}>
                      {getDayName(day)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiết học"
                name="tiet"
                value={formData.tiet}
                onChange={handleChange}
                placeholder="VD: 1-3"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phòng học"
                name="phong"
                value={formData.phong}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nhóm thực hành"
                name="nhomth"
                value={formData.nhomth}
                onChange={handleChange}
                placeholder="VD: 1"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedSchedule ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Schedules;
