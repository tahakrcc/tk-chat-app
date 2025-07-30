import React from 'react';
import styled from 'styled-components';

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
  
  &:hover {
    background: rgba(255, 255, 255, 0.02);
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
  background: ${props => props.src ? `url(${props.src}) center/cover` : 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 4px;
  
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
  font-weight: 500;
  font-size: 16px;
  
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Timestamp = styled.span`
  color: #96989d;
  font-size: 12px;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const MessageText = styled.div`
  color: #dcddde;
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
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #96989d;
  font-size: 12px;
  font-style: italic;
  
  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 6px 12px;
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