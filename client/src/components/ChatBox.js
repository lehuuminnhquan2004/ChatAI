import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Avatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import axios from 'axios';
import './ChatBox.css';
import useSpeech from '../hooks/useSpeech';
import VoiceControls from './VoiceControls';
import authService from '../services/authService';

// Lấy API URL từ biến môi trường
const API_URL = process.env.REACT_APP_API_URL;

function ChatBox({ masv }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { 
    isListening, 
    speechText,
    setSpeechText,
    startListening, 
    stopListening, 
    speak,
    shouldSendMessage,
    setShouldSendMessage
  } = useSpeech();

  // Theo dõi thay đổi của speechText
  useEffect(() => {
    if (isListening) {
      setInput(speechText);
    }
  }, [speechText, isListening]);

  const handleSend = useCallback(async () => {
    const messageToSend = input.trim();
    if (!messageToSend || !masv || isLoading) return;

    setMessages(prev => [...prev, { text: messageToSend, isUser: true }]);
    setInput('');
    setSpeechText('');
    setIsLoading(true);

    try {
      const token = authService.getToken();
      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }

      const response = await axios.post(`${API_URL}/api/chat`, {
        message: messageToSend,
        masv: masv
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.response) {
        const aiResponse = { text: response.data.response, isUser: false };
        setMessages(prev => [...prev, aiResponse]);
        speak(response.data.response);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      if (error.message === 'Phiên đăng nhập đã hết hạn') {
        window.location.href = '/login';
        return;
      }
      setMessages(prev => [...prev, { 
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        isUser: false 
      }]);
    }

    setIsLoading(false);
  }, [input, masv, isLoading, setSpeechText, speak]);

  // Xử lý tự động gửi tin nhắn
  const handleAutoSend = useCallback(() => {
    if (shouldSendMessage && input.trim()) {
      handleSend();
      setShouldSendMessage(false);
    }
  }, [shouldSendMessage, input, handleSend, setShouldSendMessage]);

  // Sử dụng effect với handleAutoSend
  useEffect(() => {
    handleAutoSend();
  }, [handleAutoSend]);

  // Cuộn xuống khi có tin nhắn mới
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (isOpen && masv) {
        try {
          const token = authService.getToken();
          if (!token) {
            throw new Error('Phiên đăng nhập đã hết hạn');
          }

          const response = await axios.get(`${API_URL}/api/chat/history/${masv}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const history = response.data.map(item => [
            { text: item.nguoidung_chat, isUser: true },
            { text: item.ai_rep, isUser: false }
          ]).flat();
          setMessages(history);
        } catch (error) {
          console.error('Lỗi khi lấy lịch sử chat:', error);
          if (error.message === 'Phiên đăng nhập đã hết hạn') {
            window.location.href = '/login';
          }
        }
      }
    };

    fetchHistory();
  }, [isOpen, masv]);

  return (
    <div className="chatbox-container">
      {isOpen ? (
        <Paper className="chatbox-paper" elevation={3}>
          <div className="chatbox-header">
            <Typography>Chat với AI</Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <div className="chatbox-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-container ${message.isUser ? 'user' : 'ai'}`}
              >
                {!message.isUser && (
                  <Avatar className="ai-avatar">AI</Avatar>
                )}
                <div className={`message-bubble ${message.isUser ? 'user' : 'ai'}`}>
                  <Typography variant="body2">{message.text}</Typography>
                  {!message.isUser && (
                    <VoiceControls
                      message={message.text}
                      onSpeak={speak}
                    />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="loading-message">
                <div className="message-bubble ai">
                  <Typography variant="body2">Đang trả lời...</Typography>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbox-input">
            <TextField
              fullWidth
              size="small"
              placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isListening) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isListening}
              InputProps={{
                endAdornment: (
                  <div className="flex items-center">
                    <VoiceControls
                      isListening={isListening}
                      onStartListening={startListening}
                      onStopListening={stopListening}
                      disabled={isLoading}
                    />
                    <IconButton 
                      onClick={handleSend}
                      disabled={isListening || !input.trim()}
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
          className="chat-fab"
          sx={{ 
            backgroundColor:'#036ffc',
            '&:hover': {
              backgroundColor: '#4a95f7'
            }
          }}
        >
          <SmartToyIcon />
        </Fab>
      )}
    </div>
  );
}

export default ChatBox; 