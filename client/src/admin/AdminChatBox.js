import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Avatar,
  Snackbar,
  Alert,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';
import './AdminChatBox.css';
import useSpeech from '../hooks/useSpeech';
import VoiceControls from '../components/VoiceControls';

// Lấy API URL từ biến môi trường
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Thêm URL mặc định
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;
const AUTO_RECONNECT_INTERVAL = 5000;

const ScheduleForm = ({ formData, onSubmit }) => {
  const [values, setValues] = useState({});
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra các trường bắt buộc
    const missingFields = formData.fields
      .filter(field => field.required && !values[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Vui lòng điền: ${missingFields.join(', ')}`);
      return;
    }

    onSubmit(values);
  };

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit}
      sx={{
        mt: 2,
        p: 2,
        bgcolor: 'background.default',
        borderRadius: 1,
        '& .MuiFormControl-root': { mb: 2 }
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {formData.fields.map((field) => (
        <FormControl key={field.name} fullWidth size="small">
          {field.type === 'select' ? (
            <>
              <InputLabel>{field.label}</InputLabel>
              <Select
                name={field.name}
                value={values[field.name] || ''}
                onChange={handleChange}
                label={field.label}
                required={field.required}
              >
                {field.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </>
          ) : field.type === 'date' ? (
            <TextField
              name={field.name}
              label={field.label}
              type="date"
              value={values[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              inputProps={{
                max: '2030-12-31'
              }}
            />
          ) : (
            <TextField
              name={field.name}
              label={field.label}
              type={field.type}
              value={values[field.name] || ''}
              onChange={handleChange}
              required={field.required}
              placeholder={field.placeholder}
              size="small"
              fullWidth
            />
          )}
        </FormControl>
      ))}

      <Button 
        type="submit" 
        variant="contained" 
        fullWidth
        sx={{ mt: 1 }}
      >
        {formData.submitButtonText || 'Thêm lịch học'}
      </Button>
    </Box>
  );
};

function AdminChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const messagesEndRef = useRef(null);
  const [connectionCheckInterval, setConnectionCheckInterval] = useState(null);
  
  const { 
    isListening, 
    speechText,
    startListening, 
    stopListening,
    shouldSendMessage,
    setShouldSendMessage
  } = useSpeech();

  // Hàm kiểm tra URL API
  const validateApiUrl = useCallback(() => {
    if (!API_URL) {
      console.error('API_URL không được cấu hình');
      return 'API_URL chưa được cấu hình. Vui lòng kiểm tra file .env';
    }
    try {
      new URL(API_URL);
      return null;
    } catch (e) {
      console.error('API_URL không hợp lệ:', API_URL);
      return 'API_URL không hợp lệ. Vui lòng kiểm tra file .env';
    }
  }, []);

  // Hàm kiểm tra kết nối
  const checkConnection = useCallback(async (token) => {
    try {
      // Kiểm tra URL API trước
      const urlError = validateApiUrl();
      if (urlError) {
        console.error(urlError);
        setError(urlError);
        setShowError(true);
        return false;
      }

      console.log('Đang kiểm tra kết nối tới:', API_URL);
      const response = await axios.get(`${API_URL}/api/admin/chat/test`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: function (status) {
          return status < 500; // Chấp nhận status code < 500
        }
      });

      // Log chi tiết response
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);

      if (response.status === 401) {
        setError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
        setShowError(true);
        return false;
      }

      if (response.status !== 200) {
        setError(`Lỗi server: ${response.status} - ${response.statusText}`);
        setShowError(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Chi tiết lỗi kết nối:', {
        message: error.message,
        code: error.code,
        response: error.response,
        config: error.config
      });

      let errorMessage = 'Không thể kết nối đến server. ';
      if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Server không hoạt động.';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += 'Kết nối quá thời gian chờ.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Không tìm thấy API endpoint.';
      } else {
        errorMessage += error.message;
      }

      setError(errorMessage);
      setShowError(true);
      return false;
    }
  }, [validateApiUrl]);

  // Hàm thử kết nối lại
  const retryConnection = useCallback(async (silent = false) => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      setError('Chưa đăng nhập. Vui lòng đăng nhập lại.');
      setShowError(true);
      return false;
    }

    if (!silent) {
      setIsReconnecting(true);
      setError('Đang thử kết nối lại...');
      setShowError(true);
    }

    let currentRetry = 0;
    while (currentRetry < MAX_RETRIES) {
      console.log(`Lần thử ${currentRetry + 1}/${MAX_RETRIES}`);
      
      const isConnected = await checkConnection(adminToken);
      if (isConnected) {
        setError(null);
        setShowError(false);
        setRetryCount(0);
        setIsReconnecting(false);
        console.log('Kết nối thành công!');
        return true;
      }

      currentRetry++;
      setRetryCount(currentRetry);
      
      if (currentRetry < MAX_RETRIES) {
        console.log(`Chờ ${RETRY_DELAY}ms trước lần thử tiếp theo...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }

    if (!silent) {
      setError(`Không thể kết nối đến server sau ${MAX_RETRIES} lần thử. URL: ${API_URL}`);
      setShowError(true);
    }
    setIsReconnecting(false);
    return false;
  }, [checkConnection]);

  // Thiết lập kiểm tra kết nối định kỳ
  useEffect(() => {
    if (isOpen) {
      // Kiểm tra kết nối ngay khi mở chat
      const checkAdminAuth = async () => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
          setError('Bạn không có quyền truy cập chat admin');
          setShowError(true);
          setIsOpen(false);
          return;
        }

        const isConnected = await checkConnection(adminToken);
        if (!isConnected) {
          await retryConnection();
        }
      };

      checkAdminAuth();

      // Thiết lập kiểm tra kết nối định kỳ
      const interval = setInterval(async () => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) return;

        const isConnected = await checkConnection(adminToken);
        if (!isConnected) {
          await retryConnection(true); // Silent retry
        }
      }, AUTO_RECONNECT_INTERVAL);

      setConnectionCheckInterval(interval);

      // Cleanup khi đóng chat
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Xóa interval khi đóng chat
      if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
      }
    }
  }, [isOpen, checkConnection, retryConnection, connectionCheckInterval]);

  useEffect(() => {
    if (isListening) {
      setInput(speechText);
    }
  }, [speechText, isListening]);

  const handleSendMessage = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);
    setError('');

    try {
      // Thêm tin nhắn người dùng vào danh sách
      setMessages(prev => [...prev, {
        type: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      }]);

      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_URL}/api/admin/chat`,
        { message: userMessage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Thêm phản hồi từ AI vào danh sách
      setMessages(prev => [...prev, {
        type: 'ai',
        content: response.data.message,
        timestamp: response.data.timestamp,
        formData: response.data.type === 'schedule_form' ? response.data.formData : null
      }]);

    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi tin nhắn');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleAutoSend = useCallback(() => {
    if (shouldSendMessage && input.trim()) {
      handleSendMessage();
      setShouldSendMessage(false);
    }
  }, [shouldSendMessage, input, handleSendMessage, setShouldSendMessage]);

  useEffect(() => {
    handleAutoSend();
  }, [handleAutoSend]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleCloseError = () => {
    setShowError(false);
  };

  const handleScheduleSubmit = async (formValues) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Chuẩn bị dữ liệu để thêm vào database
      const scheduleData = {
        thu: parseInt(formValues.thu),
        ca: parseInt(formValues.ca),
        phong: formValues.phong,
        masv: formValues.masv,
        mamh: formValues.mamh,
        magv: formValues.magv,
        ngaybatdau: formValues.ngaybatdau,
        ngayketthuc: formValues.ngayketthuc
      };
      
      // Gửi dữ liệu form để thêm lịch học vào database
      const response = await axios.post(
        `${API_URL}/api/admin/chat`,
        { 
          message: "ADD_SCHEDULE",
          scheduleData: scheduleData
        },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        // Thêm tin nhắn thành công vào chat
        setMessages(prev => [...prev, {
          type: 'ai',
          content: 'Đã thêm lịch học thành công vào database! Chi tiết:\n' +
            `- Thứ: ${scheduleData.thu}\n` +
            `- Ca: ${scheduleData.ca}\n` +
            `- Phòng: ${scheduleData.phong}\n` +
            `- Mã sinh viên: ${scheduleData.masv}\n` +
            `- Mã môn học: ${scheduleData.mamh}\n` +
            `- Mã giảng viên: ${scheduleData.magv}\n` +
            `- Thời gian: ${scheduleData.ngaybatdau} đến ${scheduleData.ngayketthuc}`,
          timestamp: new Date().toISOString()
        }]);

        // Thêm tin nhắn hướng dẫn
        setMessages(prev => [...prev, {
          type: 'ai',
          content: 'Lịch học đã được thêm vào database. Bạn có thể tiếp tục thêm lịch học khác hoặc xem danh sách lịch học.',
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi thêm lịch học vào database');
      }

    } catch (error) {
      console.error('Lỗi khi thêm lịch học vào database:', error);
      
      // Thêm tin nhắn lỗi vào chat
      setMessages(prev => [...prev, {
        type: 'ai',
        content: `Lỗi: ${error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm lịch học vào database'}. Vui lòng thử lại.`,
        timestamp: new Date().toISOString()
      }]);

      setError(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm lịch học vào database');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-chatbox-container">
      <Snackbar 
        open={showError} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity={isReconnecting ? "warning" : "error"} 
          sx={{ width: '100%' }}
        >
          {isReconnecting ? `${error} (Lần thử ${retryCount}/${MAX_RETRIES})` : error}
        </Alert>
      </Snackbar>

      {isOpen ? (
        <Paper className="admin-chatbox-paper" elevation={3}>
          <div className="admin-chatbox-header">
            <Typography>Chat AI (Admin)</Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <div className="admin-chatbox-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`admin-message-container ${message.type === 'user' ? 'user' : 'ai'}`}
              >
                {message.type === 'ai' && (
                  <Avatar className="admin-ai-avatar">AI</Avatar>
                )}
                <div className={`admin-message-bubble ${message.type === 'user' ? 'user' : 'ai'}`}>
                  <Typography variant="body2">{message.content}</Typography>
                </div>
                {message.type === 'ai' && message.formData && (
                  <div className="admin-form-container">
                    <ScheduleForm 
                      formData={message.formData}
                      onSubmit={handleScheduleSubmit}
                    />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="admin-loading-message">
                <div className="admin-message-bubble ai">
                  <Typography variant="body2">
                    {isReconnecting ? 'Đang kết nối lại...' : 'Đang trả lời...'}
                  </Typography>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="admin-chatbox-input">
            <TextField
              fullWidth
              size="small"
              placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isListening) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isListening || isReconnecting}
              InputProps={{
                endAdornment: (
                  <div className="admin-flex admin-items-center">
                    <VoiceControls
                      isListening={isListening}
                      onStartListening={startListening}
                      onStopListening={stopListening}
                      disabled={isLoading || isReconnecting}
                    />
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={isListening || !input.trim() || isReconnecting}
                    >
                      <SendIcon />
                    </IconButton>
                  </div>
                ),
              }}
            />
          </div>
        </Paper>
      ) : (
        <Fab 
          color="primary" 
          onClick={() => setIsOpen(true)}
          className="admin-chat-fab"
        >
          <SmartToyIcon />
        </Fab>
      )}
    </div>
  );
}

export default AdminChatBox; 