// Tạo và thêm chat bubble vào trang
function createChatWidget() {
    // Tạo bong bóng chat
    const chatBubble = document.createElement('div');
    chatBubble.id = 'chat-bubble';
    chatBubble.innerHTML = '<i class="fas fa-comments"></i>';
    document.body.appendChild(chatBubble);

    // Tạo hộp chat
    const chatBox = document.createElement('div');
    chatBox.id = 'chat-box';
    chatBox.innerHTML = `
        <div id="message-container"></div>
        <div id="input-container">
            <input type="text" id="message-input" placeholder="Nhập tin nhắn...">
            <button id="send-button">Gửi</button>
        </div>
    `;
    document.body.appendChild(chatBox);

    const messageContainer = document.getElementById('message-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Xử lý sự kiện click vào bong bóng chat
    chatBubble.addEventListener('click', () => {
        const currentDisplay = chatBox.style.display;
        chatBox.style.display = (!currentDisplay || currentDisplay === 'none') ? 'flex' : 'none';
        if (chatBox.style.display === 'flex') {
            //loadChatHistory();
        }
    });

    // Xử lý sự kiện gửi tin nhắn
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Hàm tải lịch sử chat
    async function loadChatHistory() {
        try {
            const response = await fetch('/chat-history');
            const data = await response.json();
            
            // Xóa tin nhắn cũ
            messageContainer.innerHTML = '';
            
            // Hiển thị lịch sử chat theo thứ tự mới nhất
            data.reverse().forEach(chat => {
                appendMessage('You: ' + chat.nguoidung_chat);
                appendMessage('AI: ' + chat.ai_rep);
            });
            
            // Cuộn xuống tin nhắn mới nhất
            messageContainer.scrollTop = messageContainer.scrollHeight;
        } catch (error) {
            console.error('Lỗi khi tải lịch sử chat:', error);
            appendMessage('Error: Không thể tải lịch sử chat.');
        }
    }

    async function sendMessage() {
        const message = messageInput.value;
        if (message.trim() === '') return;

        appendMessage('You: ' + message);
        messageInput.value = '';

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            const data = await response.json();
            appendMessage('AI: ' + data.response);
        } catch (error) {
            console.error('Error:', error);
            appendMessage('Error: Chưa kết nối với AI.');
        }
    }

    function appendMessage(text) {
        const messageElement = document.createElement('p');
        messageElement.textContent = text;
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}

// Kiểm tra xem có phải trang login không
if (!window.location.pathname.includes('login')) {
    createChatWidget();
} 