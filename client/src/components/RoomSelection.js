import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Hash, Mic, ArrowLeft, Users } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const RoomSelectionContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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
    padding: 16px;
  }
`;

const RoomSelectionCard = styled.div`
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    max-width: 400px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    margin-bottom: 25px;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #5352ed, #3742fa);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, #3742fa, #5352ed);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 4px;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  color: #2ed573;
  font-weight: 600;
  
  @media (max-width: 768px) {
    gap: 6px;
    font-size: 14px;
  }
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5352ed, #3742fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  animation: ${pulse} 2s infinite;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const RoomTypeContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 25px;
  }
`;

const RoomTypeButton = styled.button`
  flex: 1;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #5352ed, #3742fa)' 
    : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(20px);
  border: 2px solid ${props => props.active 
    ? 'rgba(255, 255, 255, 0.3)' 
    : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 16px;
  padding: 24px 16px;
  color: ${props => props.active ? '#ffffff' : '#ffffff'};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: ${props => props.active 
    ? '0 8px 25px rgba(83, 82, 237, 0.4)' 
    : '0 4px 15px rgba(0, 0, 0, 0.3)'};
  
  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #3742fa, #5352ed)' 
      : 'rgba(255, 255, 255, 0.15)'};
    transform: translateY(-2px);
    box-shadow: ${props => props.active 
      ? '0 12px 35px rgba(83, 82, 237, 0.5)' 
      : '0 6px 20px rgba(0, 0, 0, 0.4)'};
  }
  
  @media (max-width: 768px) {
    padding: 20px 12px;
    gap: 8px;
  }
`;

const RoomIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 6px;
  }
`;

const RoomTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const RoomDescription = styled.div`
  font-size: 12px;
  opacity: 0.8;
  text-align: center;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const JoinButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #2ed573, #1e90ff);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
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
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    font-size: 16px;
  }
`;

const RoomSelection = ({ user, onRoomSelect, onBackToLogin }) => {
  const [selectedRoomType, setSelectedRoomType] = useState('text');

  const handleJoinRoom = () => {
    onRoomSelect({
      ...user,
      chatType: selectedRoomType
    });
  };

  return (
    <RoomSelectionContainer>
      <RoomSelectionCard>
        <Header>
          <BackButton onClick={onBackToLogin}>
            <ArrowLeft size={16} />
            <span className="hide-on-mobile">Geri</span>
          </BackButton>
          
          <Title>Oda Seçimi</Title>
          
          <UserInfo>
            <UserAvatar>
              {user.username.charAt(0).toUpperCase()}
            </UserAvatar>
            <span className="hide-on-mobile">{user.username}</span>
          </UserInfo>
        </Header>
        
        <RoomTypeContainer>
          <RoomTypeButton
            active={selectedRoomType === 'text'}
            onClick={() => setSelectedRoomType('text')}
          >
            <RoomIcon>
              <Hash size={32} />
            </RoomIcon>
            <RoomTitle>Yazılı Sohbet</RoomTitle>
            <RoomDescription>
              Emoji ve GIF desteği ile<br />
              yazılı mesajlaşma
            </RoomDescription>
          </RoomTypeButton>
          
          <RoomTypeButton
            active={selectedRoomType === 'voice'}
            onClick={() => setSelectedRoomType('voice')}
          >
            <RoomIcon>
              <Mic size={32} />
            </RoomIcon>
            <RoomTitle>Sesli Sohbet</RoomTitle>
            <RoomDescription>
              Gerçek zamanlı<br />
              sesli iletişim
            </RoomDescription>
          </RoomTypeButton>
        </RoomTypeContainer>
        
        <JoinButton onClick={handleJoinRoom}>
          {selectedRoomType === 'text' ? 'Yazılı Sohbete Katıl' : 'Sesli Sohbete Katıl'}
        </JoinButton>
      </RoomSelectionCard>
    </RoomSelectionContainer>
  );
};

export default RoomSelection; 