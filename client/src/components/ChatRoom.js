import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send, Image } from 'lucide-react';
import MessageList from './MessageList';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;



const ChatContainer = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  display: flex;
  flex-direction: column;
  height: 100vh;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(83, 82, 237, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(46, 213, 115, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 71, 87, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    height: calc(100vh - 120px);
    /* iOS kayma sorunu için */
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 16px;
    /* iOS smooth scrolling */
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }
`;

const MessageInputContainer = styled.div`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(30px);
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 12px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1000;
  
  &:focus-within {
    border-color: rgba(83, 82, 237, 0.8);
    box-shadow: 0 0 0 4px rgba(83, 82, 237, 0.3);
    background: rgba(0, 0, 0, 0.8);
  }
  
  @media (max-width: 768px) {
    gap: 6px;
    padding: 8px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
    padding: 6px;
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  resize: none;
  outline: none;
  min-height: 20px;
  max-height: 120px;
  font-family: inherit;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    /* iOS kayma sorunu için */
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    border-radius: 0;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
`;

const GifButton = styled.button`
  background: transparent;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    min-width: 44px;
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    min-width: 48px;
    min-height: 48px;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #2ed573, #1e90ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  min-width: 48px;
  min-height: 48px;
  font-weight: 700;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    background: linear-gradient(135deg, #1e90ff, #2ed573);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    min-width: 44px;
    min-height: 44px;
    padding: 10px 12px;
  }
`;

const TypingIndicator = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    padding: 6px 16px;
    font-size: 13px;
  }
`;

const ChatRoom = ({ socket, user, messages = [], onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
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
        socket.emit('stop_typing', { 
          userId: user.id, 
          username: user.username,
          room: 'general'
        });
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
      socket.emit('typing', { 
        userId: user.id, 
        username: user.username,
        room: 'general'
      });
      
      // 3 saniye sonra typing'i durdur
      setTimeout(() => {
        setIsTyping(false);
        if (socket) {
          socket.emit('stop_typing', { 
            userId: user.id, 
            username: user.username,
            room: 'general'
          });
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

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleGifSelect = (gifUrl) => {
    onSendMessage(gifUrl);
    setShowGifPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowGifPicker(false);
  };

  const toggleGifPicker = () => {
    setShowGifPicker(!showGifPicker);
    setShowEmojiPicker(false);
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
          <div style={{ position: 'relative', zIndex: 1001 }}>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              isOpen={showEmojiPicker}
              onToggle={toggleEmojiPicker}
            />
          </div>
          <div style={{ position: 'relative', zIndex: 1001 }}>
            <GifButton onClick={toggleGifPicker} title="GIF Ekle">
              <Image size={20} />
            </GifButton>
            <GifPicker
              onGifSelect={handleGifSelect}
              isOpen={showGifPicker}
              onToggle={toggleGifPicker}
            />
          </div>
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