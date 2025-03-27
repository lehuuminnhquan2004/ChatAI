import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL;

function Schedule({ open, onClose, masv }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (open && masv) {
        try {
          const response = await axios.get(`${API_URL}/api/schedule/${masv}`);
          setSchedule(response.data);
        } catch (error) {
          console.error('Lỗi khi lấy thời khóa biểu:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSchedule();
  }, [open, masv]);

  const getDayName = (day) => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[day] || '';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Thời Khóa Biểu
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thứ</TableCell>
                  <TableCell>Ca</TableCell>
                  <TableCell>Môn học</TableCell>
                  <TableCell>Phòng</TableCell>
                  <TableCell>Giảng viên</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{getDayName(item.Thu)}</TableCell>
                    <TableCell>{item.Ca}</TableCell>
                    <TableCell>{item.tenmh}</TableCell>
                    <TableCell>{item.phong}</TableCell>
                    <TableCell>{item.giangvien}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      
    </Dialog>
    
  );
}

export default Schedule; 