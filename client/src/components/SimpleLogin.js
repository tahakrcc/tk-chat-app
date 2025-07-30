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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 400px;
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    margin: 20px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    color: #fff;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    animation: ${pulse} 3s infinite;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    margin: 8px 0 0 0;
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
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.6);
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: #fff;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #4ecdc4;
    box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 6px;
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
  flex: 1;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' 
    : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    gap: 4px;
  }
`;

const ChatTypeIcon = styled.div`
  font-size: 20px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ChatTypeText = styled.span`
  font-size: 12px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const JoinButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
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
    padding: 12px;
    font-size: 15px;
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
            selected={chatType === 'text'}
            onClick={() => setChatType('text')}
          >
            <ChatTypeIcon>
              <MessageCircle size={20} />
            </ChatTypeIcon>
            <ChatTypeText>Yazılı</ChatTypeText>
          </ChatTypeButton>
          
          <ChatTypeButton
            selected={chatType === 'voice'}
            onClick={() => setChatType('voice')}
          >
            <ChatTypeIcon>
              <Mic size={20} />
            </ChatTypeIcon>
            <ChatTypeText>Sesli</ChatTypeText>
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