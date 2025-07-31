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
  gap: 12px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.5s ease-out;
  padding: 8px;
  border-radius: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(138, 43, 226, 0.1);
    border-radius: 16px;
    padding: 8px;
    margin: 8px -8px;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-bottom: 12px;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.avatar ? `url(${props.avatar}) center/cover` : 'linear-gradient(135deg, #8a2be2, #40e0d0)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  animation: ${pulse} 2s infinite;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
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
  }
`;

const Username = styled.span`
  color: #40e0d0;
  font-weight: 800;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const GenderIndicator = styled.span`
  font-size: 12px;
  opacity: 0.8;
`;

const Timestamp = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const MessageText = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  word-wrap: break-word;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const MessageImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  
  @media (max-width: 768px) {
    max-height: 200px;
  }
`;

const SystemMessage = styled.div`
  text-align: center;
  margin: 16px 0;
  padding: 8px 16px;
  background: rgba(138, 43, 226, 0.2);
  border-radius: 20px;
  color: #40e0d0;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid rgba(138, 43, 226, 0.3);
  
  @media (max-width: 768px) {
    margin: 12px 0;
    padding: 6px 12px;
    font-size: 11px;
  }
`;

const CurrentUserMessage = styled(MessageContainer)`
  flex-direction: row-reverse;
  
  &:hover {
    background: rgba(64, 224, 208, 0.1);
  }
`;

const CurrentUserAvatar = styled(UserAvatar)`
  background: ${props => props.avatar ? `url(${props.avatar}) center/cover` : 'linear-gradient(135deg, #40e0d0, #8a2be2)'};
  box-shadow: 0 4px 15px rgba(64, 224, 208, 0.3);
`;

const CurrentUserContent = styled(MessageContent)`
  text-align: right;
`;

const CurrentUserHeader = styled(MessageHeader)`
  justify-content: flex-end;
`;

const CurrentUserUsername = styled(Username)`
  color: #8a2be2;
`;

const CurrentUserText = styled(MessageText)`
  text-align: right;
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
  if (!messages || messages.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '16px',
        fontWeight: '600'
      }}>
        Henüz mesaj yok. İlk mesajı siz gönderin! 💬
      </div>
    );
  }

  return (
    <div>
      {messages.map((message, index) => {
        const isCurrentUser = currentUser && message.user && message.user.id === currentUser.id;
        const isSystemMessage = message.type === 'system';
        
        if (isSystemMessage) {
          return (
            <SystemMessage key={message.id || index}>
              {message.content}
            </SystemMessage>
          );
        }

        if (isCurrentUser) {
          return (
            <CurrentUserMessage key={message.id || index}>
              <CurrentUserAvatar avatar={message.user?.avatar}>
                {!message.user?.avatar && (message.user?.displayName?.charAt(0) || message.user?.username?.charAt(0) || 'U').toUpperCase()}
              </CurrentUserAvatar>
              <CurrentUserContent>
                <CurrentUserHeader>
                                  <CurrentUserUsername>
                  {message.user?.displayName || message.user?.username || 'Bilinmeyen Kullanıcı'}
                  <GenderIndicator>
                    {message.user?.gender === 'female' ? '👩' : '👨'}
                  </GenderIndicator>
                </CurrentUserUsername>
                  <Timestamp>
                    {formatTime(message.timestamp)}
                  </Timestamp>
                </CurrentUserHeader>
                <CurrentUserText>
                  {message.content && (message.content.match(/\.(jpg|jpeg|png|gif|webp)$/i) || message.content.includes('tenor.com') || message.content.includes('media.tenor.com')) ? (
                    <MessageImage 
                      src={message.content} 
                      alt="Gönderilen resim"
                      onClick={() => window.open(message.content, '_blank')}
                    />
                  ) : (
                    message.content
                  )}
                </CurrentUserText>
              </CurrentUserContent>
            </CurrentUserMessage>
          );
        }

        return (
          <MessageContainer key={message.id || index}>
            <UserAvatar avatar={message.user?.avatar}>
              {!message.user?.avatar && (message.user?.displayName?.charAt(0) || message.user?.username?.charAt(0) || 'U').toUpperCase()}
            </UserAvatar>
            <MessageContent>
              <MessageHeader>
                <Username>
                  {message.user?.displayName || message.user?.username || 'Bilinmeyen Kullanıcı'}
                  <GenderIndicator>
                    {message.user?.gender === 'female' ? '👩' : '👨'}
                  </GenderIndicator>
                </Username>
                <Timestamp>
                  {formatTime(message.timestamp)}
                </Timestamp>
              </MessageHeader>
              <MessageText>
                {message.content && (message.content.match(/\.(jpg|jpeg|png|gif|webp)$/i) || message.content.includes('tenor.com') || message.content.includes('media.tenor.com')) ? (
                  <MessageImage 
                    src={message.content} 
                    alt="Gönderilen resim"
                    onClick={() => window.open(message.content, '_blank')}
                  />
                ) : (
                  message.content
                )}
              </MessageText>
            </MessageContent>
          </MessageContainer>
        );
      })}
    </div>
  );
};

export default MessageList; 