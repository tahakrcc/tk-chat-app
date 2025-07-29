import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Wifi, WifiOff } from 'lucide-react';

const LoginContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
`;

const LoginForm = styled.div`
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  
  ${props => props.isConnected ? `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  ` : `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

const AvatarPreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 20px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #667eea;
  border: 3px solid #e1e5e9;
`;

const LoginScreen = ({ onLogin, isConnected }) => {
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({
        username: username.trim(),
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`
      });
    }
  };

  return (
    <LoginContainer>
      <LoginForm>
        <Title>Sohbete Katıl</Title>
        
        <ConnectionStatus isConnected={isConnected}>
          {isConnected ? (
            <>
              <Wifi size={16} />
              Sunucuya bağlı
            </>
          ) : (
            <>
              <WifiOff size={16} />
              Sunucuya bağlanılıyor...
            </>
          )}
        </ConnectionStatus>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Kullanıcı Adı</Label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınızı girin"
              required
              disabled={!isConnected}
            />
          </InputGroup>

          <InputGroup>
            <Label>Avatar URL (İsteğe bağlı)</Label>
            <Input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              disabled={!isConnected}
            />
          </InputGroup>

          {username && (
            <AvatarPreview>
              <User size={40} />
            </AvatarPreview>
          )}

          <Button type="submit" disabled={!isConnected || !username.trim()}>
            Sohbete Katıl
          </Button>
        </form>
      </LoginForm>
    </LoginContainer>
  );
};

export default LoginScreen; 