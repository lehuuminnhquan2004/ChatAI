import { useState, useEffect, useCallback, useRef } from 'react';

const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [shouldSendMessage, setShouldSendMessage] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const timeoutRef = useRef(null);

  // Định nghĩa stopListening trước khi sử dụng
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    recognitionRef.current.stop();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Bắt đầu ghi âm
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    setShouldSendMessage(false);
    setSpeechText('');
    recognitionRef.current.start();
  }, []);

  // Hàm lấy và cấu hình giọng nói
  const setupVoice = useCallback(() => {
    if (synthesisRef.current) {
      const voices = synthesisRef.current.getVoices();
      const hoaiMyVoice = voices.find(voice => 
        voice.name === 'Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)' && 
        voice.lang === 'vi-VN'
      );
      
      if (hoaiMyVoice) {
        setSelectedVoice(hoaiMyVoice);
        console.log('Đã chọn giọng Hoài My:', hoaiMyVoice.name);
      } else {
        console.log('Không tìm thấy giọng Hoài My, sử dụng giọng mặc định');
      }
    }
  }, []);

  // Khởi tạo recognition và cấu hình giọng nói
  useEffect(() => {
    if (typeof window !== 'undefined') {
      recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'vi-VN';

      synthesisRef.current = window.speechSynthesis;
      
      // Cấu hình giọng nói khi khởi tạo
      setupVoice();
      
      // Lắng nghe sự kiện khi danh sách giọng nói thay đổi
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = setupVoice;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (synthesisRef.current?.onvoiceschanged) {
        synthesisRef.current.onvoiceschanged = null;
      }
    };
  }, [setupVoice]);

  // Xử lý kết quả nhận diện giọng nói
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event) => {
      let currentTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        currentTranscript = transcript;
      }
      
      setSpeechText(currentTranscript);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (currentTranscript.trim() && isListening) {
          setShouldSendMessage(true);
          stopListening();
        }
      }, 1500);
    };

    recognition.onerror = (event) => {
      console.error('Lỗi nhận diện giọng nói:', event.error);
      setIsListening(false);
      setShouldSendMessage(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, stopListening]);

  // Hàm tách và chuẩn bị text để đọc
  const prepareTextForSpeech = (text) => {
    // Thêm dấu chấm vào đầu câu để đảm bảo engine pause một chút
    return `. ${text}`;
  };

  // Đọc văn bản
  const speak = useCallback((text) => {
    if (!synthesisRef.current) return;

    // Hủy phiên đọc hiện tại nếu có
    if (synthesisRef.current.speaking) {
      synthesisRef.current.cancel();
    }

    // Chuẩn bị text
    const preparedText = prepareTextForSpeech(text);
    
    const utterance = new SpeechSynthesisUtterance();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = 'vi-VN';
    utterance.rate = 1.5 ;
    utterance.pitch = 1;
    utterance.text = preparedText;

    // Thêm các event handlers để debug
    utterance.onstart = () => {
      console.log('Bắt đầu đọc:', preparedText);
    };

    utterance.onboundary = (event) => {
      console.log('Boundary reached:', event.charIndex, event.charLength);
    };

    utterance.onend = () => {
      console.log('Kết thúc đọc:', preparedText);
    };

    utterance.onerror = (event) => {
      console.error('Lỗi khi đọc:', event);
    };

    // Thử tách câu thành các phần nhỏ nếu câu dài
    if (text.length > 50) {
      const sentences = text.split(/[.,!?]+/).filter(Boolean);
      sentences.forEach((sentence, index) => {
        const sentenceUtterance = new SpeechSynthesisUtterance(sentence.trim());
        if (selectedVoice) {
          sentenceUtterance.voice = selectedVoice;
        }
        sentenceUtterance.lang = 'vi-VN';
        sentenceUtterance.rate = 1.5;
        sentenceUtterance.pitch = 1;
        
        // Thêm delay giữa các câu
        setTimeout(() => {
          synthesisRef.current.speak(sentenceUtterance);
        }, index * 100);
      });
    } else {
      synthesisRef.current.speak(utterance);
    }
  }, [selectedVoice]);

  return {
    isListening,
    speechText,
    setSpeechText,
    startListening,
    stopListening,
    speak,
    shouldSendMessage,
    setShouldSendMessage
  };
};

export default useSpeech; 