import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Send } from 'lucide-react';
import MessageList from './MessageList';

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #36393f;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const MessageInputContainer = styled.div`
  padding: 16px;
  background: #40444b;
  border-top: 1px solid #202225;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #40444b;
  border-radius: 8px;
  border: 1px solid #202225;
  padding: 12px;
  
  &:focus-within {
    border-color: #00d4ff;
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
  color: #dcddde;
  font-size: 14px;
  resize: none;
  outline: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  
  &::placeholder {
    color: #96989d;
  }
`;

const SendButton = styled.button`
  background: #00d4ff;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 36px;
  min-height: 36px;
  
  &:hover {
    background: #0099cc;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #40444b;
    color: #96989d;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    min-width: 40px;
    min-height: 40px;
  }
`;

const TypingIndicator = styled.div`
  color: #00d4ff;
  font-size: 13px;
  padding: 8px 16px;
  font-style: italic;
  background: rgba(0, 212, 255, 0.1);
  border-left: 3px solid #00d4ff;
  margin: 0 16px;
  border-radius: 0 4px 4px 0;
  
  @media (max-width: 768px) {
    margin: 0 12px;
    font-size: 12px;
  }
`;

const ChatRoom = ({ socket, user, messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Yazıyor göstergesi
    socket.on('user_typing', (data) => {
      if (data.userId !== user.id) {
        setTypingUsers(prev => new Set(prev).add(data.username));
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
          });
        }, 3000);
      }
    });

    // Yazıyor durdurma
    socket.on('user_stop_typing', (data) => {
      if (data.userId !== user.id) {
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
    if (socket) {
      socket.emit('typing', { userId: user.id, username: user.username });
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
            <Send size={16} />
          </SendButton>
          
          <SendButton 
            onClick={() => {
              console.log('Test mesajı gönderiliyor');
              if (onSendMessage) {
                onSendMessage('Test mesajı - ' + new Date().toLocaleTimeString());
              }
            }}
            title="Test Mesajı"
            style={{ background: '#28a745', marginLeft: '8px' }}
          >
            🧪
          </SendButton>
        </InputWrapper>
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default ChatRoom; 