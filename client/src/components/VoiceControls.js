import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const VoiceControls = ({ 
  isListening, 
  onStartListening, 
  onStopListening, 
  onSpeak, 
  message,
  disabled
}) => {
  return (
    <div className="flex items-center space-x-2 relative">
      {/* Nút Micro với indicator */}
      <div className="relative">
        <Tooltip title={isListening ? "Dừng ghi âm" : "Bắt đầu ghi âm"}>
          <IconButton
            onClick={isListening ? onStopListening : onStartListening}
            disabled={disabled}
            className={`p-2 transition-colors ${
              isListening 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-indigo-500 hover:text-indigo-600'
            }`}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
        
        {/* Indicator khi đang ghi âm */}
        {isListening && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              <span>Đang nghe...</span>
            </div>
          </div>
        )}
      </div>

      {/* Nút phát âm thanh (nếu có message) */}
      {message && (
        <Tooltip title="Đọc tin nhắn">
          <IconButton
            onClick={() => onSpeak(message)}
            className="text-indigo-500 hover:text-indigo-600 p-2 transition-colors"
          >
            <VolumeUpIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default VoiceControls; 