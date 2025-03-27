import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Alert,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import axios from "axios";

const Profile = () => {
  const [profile, setProfile] = useState({
    masv: "",
    tensv: "",
    email: "",
    sdt: "",
    ngaysinh: "",
    gioitinh: "",
    lop: "",
    chuyennganh: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
    if (adminInfo) {
      setProfile(adminInfo);
    }
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/admin/profile/${profile.masv}`,
        profile
      );
      setSuccess("Cập nhật thông tin thành công");
      localStorage.setItem("adminInfo", JSON.stringify(profile));
    } catch (error) {
      setError("Có lỗi xảy ra khi cập nhật thông tin");
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Thông tin cá nhân
      </Typography>

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

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              mr: 2,
            }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box>
            <Typography variant="h6">{profile.tensv}</Typography>
            <Typography color="textSecondary">Admin</Typography>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mã sinh viên"
                name="masv"
                value={profile.masv}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                name="tensv"
                value={profile.tensv}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="sdt"
                value={profile.sdt}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                name="ngaysinh"
                value={profile.ngaysinh}
                onChange={handleChange}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Giới tính"
                name="gioitinh"
                value={profile.gioitinh}
                onChange={handleChange}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lớp"
                name="lop"
                value={profile.lop}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chuyên ngành"
                name="chuyennganh"
                value={profile.chuyennganh}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Cập nhật thông tin
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default Profile;
