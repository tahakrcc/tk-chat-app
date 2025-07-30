import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send } from 'lucide-react';
import MessageList from './MessageList';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    height: calc(100vh - 120px);
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  @media (max-width: 768px) {
    padding: 8px;
  }
`;

const MessageInputContainer = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: 12px;
    position: sticky;
    bottom: 0;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: #667eea;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: 10px;
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 14px;
  resize: none;
  outline: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 36px;
  min-height: 36px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    animation: ${pulse} 0.5s ease;
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
`;

const TypingIndicator = styled.div`
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-style: italic;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const ChatRoom = ({ socket, user, messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('user_typing', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => new Set([...prev, data.username]));
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (data.userId !== user?.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [socket, user]);

  const handleSendMessage = () => {
    console.log('handleSendMessage çağrıldı, mesaj:', newMessage);
    console.log('onSendMessage fonksiyonu:', onSendMessage);
    
    if (newMessage.trim() && onSendMessage) {
      console.log('Mesaj gönderiliyor:', newMessage.trim());
      onSendMessage(newMessage.trim());
      setNewMessage('');
      
      // Yazıyor durumunu durdur
      if (socket) {
        socket.emit('stop_typing', { userId: user.id, username: user.username });
      }
      
      // Input'u sıfırla
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    } else {
      console.log('Mesaj gönderilemedi:', {
        messageTrimmed: newMessage.trim(),
        hasOnSendMessage: !!onSendMessage
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
    
    // Yazıyor göstergesi
    if (socket && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { userId: user.id, username: user.username });
      
      // 3 saniye sonra typing'i durdur
      setTimeout(() => {
        setIsTyping(false);
        if (socket) {
          socket.emit('stop_typing', { userId: user.id, username: user.username });
        }
      }, 3000);
    }
  };

  const getTypingText = () => {
    const users = Array.from(typingUsers);
    if (users.length === 0) return '';
    if (users.length === 1) return `✏️ ${users[0]} mesaj yazıyor...`;
    if (users.length === 2) return `✏️ ${users[0]} ve ${users[1]} mesaj yazıyor...`;
    return `✏️ ${users[0]} ve ${users.length - 1} kişi daha mesaj yazıyor...`;
  };

  return (
    <ChatContainer>
      <MessagesArea>
        <MessageList messages={messages} currentUser={user} />
        <div ref={messagesEndRef} />
      </MessagesArea>
      
      {getTypingText() && (
        <TypingIndicator>
          {getTypingText()}
        </TypingIndicator>
      )}
      
      <MessageInputContainer>
        <InputWrapper>
          <MessageInput
            ref={inputRef}
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Mesajınızı yazın..."
            rows={1}
          />
          <SendButton 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            title="Mesaj Gönder (Enter)"
          >
            <Send size={18} />
          </SendButton>
        </InputWrapper>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default ChatRoom; 