import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { MessageCircle, Mic, User, Lock } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
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
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: #ffffff;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    animation: ${pulse} 2s infinite;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    margin: 8px 0 0 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    h1 {
      font-size: 28px;
    }
    
    p {
      font-size: 14px;
    }
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const InputLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const InputWrapper = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: rgba(83, 82, 237, 0.5);
    box-shadow: 0 0 0 3px rgba(83, 82, 237, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 16px;
  outline: none;
  border-radius: 12px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
    padding: 12px 12px 12px 40px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4757;
  font-size: 14px;
  margin-top: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const ChatTypeSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const ChatTypeButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #5352ed, #3742fa)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ChatTypeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
`;

const ChatTypeText = styled.span`
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const JoinButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #2ed573, #1e90ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
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
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SimpleLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chatType, setChatType] = useState('text');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleJoin = () => {
    // Reset errors
    setUsernameError('');
    setPasswordError('');

    // Validate username
    if (!username.trim()) {
      setUsernameError('Kullanıcı adı gerekli');
      return;
    }

    if (username.trim().length < 2) {
      setUsernameError('Kullanıcı adı en az 2 karakter olmalı');
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Şifre gerekli');
      return;
    }

    if (password !== '689tk') {
      setPasswordError('Yanlış şifre');
      return;
    }

    // Login successful
    onLogin({
      id: Date.now(),
      username: username.trim(),
      chatType: chatType
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>TK Chat</h1>
          <p>Güvenli ve hızlı sohbet deneyimi</p>
        </Logo>

        <InputGroup>
          <InputLabel>Kullanıcı Adı</InputLabel>
          <InputWrapper>
            <InputIcon>
              <User size={18} />
            </InputIcon>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Kullanıcı adınızı girin"
              maxLength={20}
            />
          </InputWrapper>
          {usernameError && <ErrorMessage>{usernameError}</ErrorMessage>}
        </InputGroup>

        <InputGroup>
          <InputLabel>Şifre</InputLabel>
          <InputWrapper>
            <InputIcon>
              <Lock size={18} />
            </InputIcon>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Şifrenizi girin"
            />
          </InputWrapper>
          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
        </InputGroup>

        <ChatTypeSelector>
          <ChatTypeButton
            active={chatType === 'text'}
            onClick={() => setChatType('text')}
          >
            <ChatTypeIcon>
              <MessageCircle size={20} />
              <ChatTypeText>Yazılı</ChatTypeText>
            </ChatTypeIcon>
          </ChatTypeButton>
          
          <ChatTypeButton
            active={chatType === 'voice'}
            onClick={() => setChatType('voice')}
          >
            <ChatTypeIcon>
              <Mic size={20} />
              <ChatTypeText>Sesli</ChatTypeText>
            </ChatTypeIcon>
          </ChatTypeButton>
        </ChatTypeSelector>

        <JoinButton onClick={handleJoin}>
          Sohbete Katıl
        </JoinButton>
      </LoginCard>
    </LoginContainer>
  );
};

export default SimpleLogin; 