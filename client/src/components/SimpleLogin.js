import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LoginContainer = styled.div`
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

const LoginCard = styled.div`
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.1);
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
  border-radius: 12px;
  padding: 16px 20px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }
  
  &:focus {
    outline: none;
    border-color: rgba(83, 82, 237, 0.8);
    box-shadow: 0 0 0 4px rgba(83, 82, 237, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 16px;
  }
`;

const LoginButton = styled.button`
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

const ErrorMessage = styled.div`
  color: #ff4757;
  text-align: center;
  margin-top: 15px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    margin-top: 12px;
    font-size: 14px;
  }
`;

const SimpleLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Kullanıcı adı gerekli!');
      return;
    }
    
    if (password !== '689tk') {
      setError('Şifre yanlış!');
      return;
    }
    
    setError('');
    onLogin({
      username: username.trim()
    });
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
              required
            />
          </InputWrapper>
          
          <InputWrapper>
            <Input
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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