import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send, Image, Smile } from 'lucide-react';
import MessageList from './MessageList';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ChatContainer = styled.div`
  flex: 1;
  background: #36393f;
  display: flex;
  flex-direction: column;
  height: 100vh;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  
  @media (max-width: 768px) {
    height: calc(100vh - 120px);
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
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
  }
`;

const MessageInputContainer = styled.div`
  background: #292b2f;
  border-top: 1px solid #202225;
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
  background: #40444b;
  border-radius: 8px;
  border: 1px solid #202225;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1000;
  
  &:focus-within {
    border-color: #7289da;
    box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.2);
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    padding: 10px;
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: #dcddde;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  min-height: 20px;
  max-height: 120px;
  line-height: 1.4;
  
  &::placeholder {
    color: #72767d;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    min-height: 18px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #72767d;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4f545c;
    color: #dcddde;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 6px;
  }
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #7289da, #5865f2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #5865f2, #7289da);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(114, 137, 218, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #40444b;
    color: #72767d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

const PickerContainer = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 80px;
    right: 16px;
    left: 16px;
    margin-bottom: 0;
  }
`;

const TypingIndicator = styled.div`
  color: #96989d;
  font-size: 14px;
  font-style: italic;
  padding: 8px 20px;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 6px 16px;
    font-size: 13px;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #96989d;
  
  @media (max-width: 768px) {
    padding: 30px 16px;
  }
`;

const WelcomeTitle = styled.h2`
  color: #fff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const WelcomeSubtitle = styled.p`
  color: #96989d;
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const ChatRoom = ({ socket, user, room, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    // Mesaj alma
    socket.on('new_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Kullanıcı yazıyor
    socket.on('user_typing', (data) => {
      setTypingUsers(prev => new Set(prev).add(data.username));
    });

    // Kullanıcı yazmayı durdurdu
    socket.on('user_stop_typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.username);
        return newSet;
      });
    });

    // Profil güncellemesi
    socket.on('profile_updated', (data) => {
      console.log('ChatRoom: Profil güncellendi:', data);
      // Profil güncellemesi sonrası UI'ı yenile
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('profile_updated');
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      content: newMessage.trim(),
      room: room?.id || 'general'
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
    setShowEmojiPicker(false);
    setShowGifPicker(false);

    // Yazıyor durumunu durdur
    socket.emit('stop_typing', { room: room?.id || 'general' });
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { room: room?.id || 'general' });
    }

    // Yazıyor durumunu sıfırla
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('stop_typing', { room: room?.id || 'general' });
    }, 2000);
  };

  const getTypingText = () => {
    const users = Array.from(typingUsers);
    if (users.length === 0) return '';
    if (users.length === 1) return `${users[0]} yazıyor...`;
    if (users.length === 2) return `${users[0]} ve ${users[1]} yazıyor...`;
    return `${users[0]} ve ${users.length - 1} kişi daha yazıyor...`;
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSelect = (gifUrl) => {
    setNewMessage(prev => prev + ` ${gifUrl} `);
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
        {messages.length === 0 ? (
          <WelcomeMessage>
            <WelcomeTitle>👋 {room?.name} Odasına Hoş Geldiniz!</WelcomeTitle>
            <WelcomeSubtitle>
              İlk mesajınızı göndererek sohbete başlayın. 
              Emoji ve GIF'ler kullanarak mesajlarınızı daha eğlenceli hale getirebilirsiniz.
            </WelcomeSubtitle>
          </WelcomeMessage>
        ) : (
          <MessageList messages={messages} currentUser={user} />
        )}
        
        {getTypingText() && (
          <TypingIndicator>
            {getTypingText()}
          </TypingIndicator>
        )}
        
        <div ref={messagesEndRef} />
      </MessagesArea>

      <MessageInputContainer>
        <InputWrapper>
          <MessageInput
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder={`#${room?.name || 'genel'} kanalına mesaj gönder...`}
            rows={1}
          />
          
          <ActionButtons>
            <ActionButton onClick={toggleEmojiPicker} title="Emoji">
              <Smile size={20} />
            </ActionButton>
            
            <ActionButton onClick={toggleGifPicker} title="GIF">
              <Image size={20} />
            </ActionButton>
            
            <SendButton 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              title="Gönder"
            >
              <Send size={16} />
            </SendButton>
          </ActionButtons>
        </InputWrapper>

        {(showEmojiPicker || showGifPicker) && (
          <PickerContainer>
            {showEmojiPicker && (
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            )}
            {showGifPicker && (
              <GifPicker onGifSelect={handleGifSelect} />
            )}
          </PickerContainer>
        )}
      </MessageInputContainer>
    </ChatContainer>
  );
};

export default ChatRoom; 