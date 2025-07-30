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
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
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
      radial-gradient(circle at 20% 80%, rgba(138, 43, 226, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(64, 224, 208, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 105, 180, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 90% 90%, rgba(255, 215, 0, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const RoomSelectionCard = styled.div`
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(138, 43, 226, 0.3);
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
  background: linear-gradient(135deg, #8a2be2, #9370db);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(138, 43, 226, 0.3);
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
    background: linear-gradient(135deg, #9370db, #8a2be2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 4px;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  flex: 1;
  text-align: center;
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding: 16px;
  background: rgba(138, 43, 226, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(138, 43, 226, 0.2);
  
  @media (max-width: 768px) {
    margin-bottom: 25px;
    padding: 12px;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const Username = styled.div`
  color: #40e0d0;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const UserStatus = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const RoomOptions = styled.div`
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 25px;
  }
`;

const RoomOption = styled.button`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(64, 224, 208, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    gap: 12px;
  }
`;

const RoomIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 20px;
  }
`;

const TextRoomIcon = styled(RoomIcon)`
  background: linear-gradient(135deg, #8a2be2, #9370db);
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
`;

const VoiceRoomIcon = styled(RoomIcon)`
  background: linear-gradient(135deg, #40e0d0, #20b2aa);
  box-shadow: 0 4px 15px rgba(64, 224, 208, 0.3);
`;

const RoomInfo = styled.div`
  flex: 1;
  text-align: left;
`;

const RoomTitle = styled.div`
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const RoomDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const RoomSelection = ({ user, onRoomSelect, onBackToLogin }) => {
  const handleJoinRoom = () => {
    // This will be handled by the parent component
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
        </Header>

        <UserInfo>
          <UserAvatar>
            {user.username.charAt(0).toUpperCase()}
          </UserAvatar>
          <UserDetails>
            <Username>{user.username}</Username>
            <UserStatus>Çevrimiçi</UserStatus>
          </UserDetails>
        </UserInfo>

        <RoomOptions>
          <RoomOption onClick={() => onRoomSelect({ chatType: 'text' })}>
            <TextRoomIcon>
              <Hash size={24} />
            </TextRoomIcon>
            <RoomInfo>
              <RoomTitle>Yazılı Sohbet</RoomTitle>
              <RoomDescription>
                Metin mesajları, emoji ve GIF'ler ile sohbet edin. 
                Gerçek zamanlı mesajlaşma deneyimi.
              </RoomDescription>
            </RoomInfo>
          </RoomOption>

          <RoomOption onClick={() => onRoomSelect({ chatType: 'voice' })}>
            <VoiceRoomIcon>
              <Mic size={24} />
            </VoiceRoomIcon>
            <RoomInfo>
              <RoomTitle>Sesli Sohbet</RoomTitle>
              <RoomDescription>
                Sesli görüşme yapın. Mikrofon ve ses kontrolleri ile 
                kaliteli ses deneyimi.
              </RoomDescription>
            </RoomInfo>
          </RoomOption>
        </RoomOptions>
      </RoomSelectionCard>
    </RoomSelectionContainer>
  );
};

export default RoomSelection; 