import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginContainer = styled.div`
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

const LoginCard = styled.div`
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(138, 43, 226, 0.3);
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    max-width: 350px;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 800;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 25px;
  }
`;

const InputWrapper = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }
  
  &:focus {
    outline: none;
    border-color: rgba(64, 224, 208, 0.8);
    box-shadow: 0 0 0 4px rgba(64, 224, 208, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 15px;
  }
`;

const LoginButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  color: #ffffff;
  border: none;
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
  position: relative;
  overflow: hidden;
  
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
    background: linear-gradient(135deg, #40e0d0, #8a2be2);
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(138, 43, 226, 0.4);
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
    padding: 14px 16px;
    font-size: 15px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 107, 107, 0.3);
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
`;

const SimpleLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Kullanıcı adı ve şifre gereklidir!');
      return;
    }

    if (password !== '689tk') {
      setError('Şifre yanlış! Doğru şifreyi girin.');
      return;
    }

    setError('');
    onLogin({ username: username.trim(), password });
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>TK Chat</Title>
        <form onSubmit={handleSubmit}>
          <InputWrapper>
            <Input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </InputWrapper>
          <InputWrapper>
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputWrapper>
          <LoginButton type="submit">
            Giriş Yap
          </LoginButton>
        </form>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </LoginCard>
    </LoginContainer>
  );
};

export default SimpleLogin; 