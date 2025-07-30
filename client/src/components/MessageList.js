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
  border-radius: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
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
  background: linear-gradient(135deg, #5352ed, #3742fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  animation: ${pulse} 2s infinite;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
  
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
  color: #ffffff;
  font-weight: 800;
  font-size: 14px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Timestamp = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const MessageText = styled.div`
  color: #ffffff;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const MessageImage = styled.img`
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
`;

const SystemMessage = styled.div`
  text-align: center;
  padding: 12px 16px;
  margin: 16px 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    margin: 12px 0;
    font-size: 12px;
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

const MessageList = ({ messages }) => {
  return (
    <div>
      {messages.map((message, index) => {
        // System message handling
        if (message.type === 'system') {
          return (
            <SystemMessage key={index}>
              {message.content}
            </SystemMessage>
          );
        }

        // Regular message handling
        const isImage = message.content.startsWith('http') && 
          (message.content.includes('.gif') || 
           message.content.includes('.jpg') || 
           message.content.includes('.jpeg') || 
           message.content.includes('.png') || 
           message.content.includes('.webp'));

        return (
          <MessageContainer key={index}>
            <UserAvatar>
              {message.user?.username?.charAt(0) || 'U'}
            </UserAvatar>
            <MessageContent>
              <MessageHeader>
                <Username>{message.user?.username || 'Anonim'}</Username>
                <Timestamp>
                  {formatTime(message.timestamp)}
                </Timestamp>
              </MessageHeader>
              <MessageText>
                {isImage ? (
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