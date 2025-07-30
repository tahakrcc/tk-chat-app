import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  gap: 12px;
  padding: 4px 0;
  animation: ${fadeIn} 0.3s ease-out;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 8px;
    margin: -4px -8px;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: 2px 0;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src}) center/cover` : 'linear-gradient(135deg, #667eea, #764ba2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
    margin-top: 2px;
  }
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    gap: 6px;
    margin-bottom: 2px;
  }
`;

const Username = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Timestamp = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const MessageText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    font-size: 13px;
    line-height: 1.3;
  }
`;

const SystemMessage = styled.div`
  text-align: center;
  margin: 16px 0;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-style: italic;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
  
  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 10px 16px;
    font-size: 11px;
  }
`;

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
};

const MessageList = ({ messages, currentUser }) => {
  // Debug için mesaj yapısını kontrol et
  if (messages && messages.length > 0) {
    console.log('Son mesaj:', messages[messages.length - 1]);
  }

  if (!messages || messages.length === 0) {
    return (
      <MessageContainer>
        <SystemMessage>
          Henüz mesaj yok. İlk mesajı siz gönderin!
        </SystemMessage>
      </MessageContainer>
    );
  }

  return (
    <MessageContainer>
      {messages.map((message, index) => {
        const isOwn = message.userId === currentUser?.id;
        const isSystem = message.type === 'system';
        const showAvatar = !isOwn && !isSystem;
        const showUsername = !isOwn && !isSystem;
        
        // Aynı kullanıcının ardışık mesajlarını grupla
        const prevMessage = messages[index - 1];
        const isSameUser = prevMessage && 
          prevMessage.userId === message.userId && 
          !isSystem && 
          !prevMessage.type === 'system';
        
        if (isSystem) {
          return (
            <SystemMessage key={message.id}>
              {message.content}
            </SystemMessage>
          );
        }

        return (
          <MessageWrapper key={message.id}>
            {showAvatar && !isSameUser && (
              <Avatar>
                {message.username ? message.username.charAt(0).toUpperCase() : 'U'}
              </Avatar>
            )}
            {!showAvatar && !isSameUser && <div style={{ width: '52px' }} />}
            {isSameUser && <div style={{ width: '52px' }} />}
            
            <MessageContent>
              {showUsername && !isSameUser && (
                <MessageHeader>
                  <Username>{message.username ? message.username : 'Anonim'}</Username>
                  <Timestamp>{formatTime(message.timestamp)}</Timestamp>
                </MessageHeader>
              )}
              {isSameUser && (
                <Timestamp style={{ marginLeft: '0', marginBottom: '4px' }}>
                  {formatTime(message.timestamp)}
                </Timestamp>
              )}
              <MessageText>
                {message.content}
              </MessageText>
            </MessageContent>
          </MessageWrapper>
        );
      })}
    </MessageContainer>
  );
};

export default MessageList; 