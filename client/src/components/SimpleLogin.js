import React, { useState } from 'react';
import styled from 'styled-components';
import { MessageCircle, Mic, ArrowRight, MicOff } from 'lucide-react';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled.div`
  background: #36393f;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  color: #fff;
  font-size: 24px;
  font-weight: 700;
`;

const Title = styled.h1`
  color: #fff;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #96989d;
  margin-bottom: 32px;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: #40444b;
  border: 1px solid ${props => props.error ? '#f04747' : '#202225'};
  border-radius: 8px;
  color: #dcddde;
  font-size: 16px;
  margin-bottom: ${props => props.error ? '8px' : '24px'};
  
  &::placeholder {
    color: #96989d;
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f04747' : '#00d4ff'};
  }
`;

const ErrorMessage = styled.div`
  color: #f04747;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: left;
`;

const ChatTypeSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const ChatTypeButton = styled.button`
  flex: 1;
  padding: 16px;
  background: ${props => props.selected ? '#00d4ff' : '#40444b'};
  border: 1px solid ${props => props.selected ? '#00d4ff' : '#202225'};
  border-radius: 8px;
  color: ${props => props.selected ? '#fff' : '#96989d'};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? '#0099cc' : '#4f545c'};
    transform: translateY(-2px);
  }
`;

const JoinButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #00d4ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0099cc;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #40444b;
    color: #96989d;
    cursor: not-allowed;
    transform: none;
  }
`;

const PermissionButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${props => props.granted ? '#43b581' : '#f04747'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  margin-top: 12px;
  
  &:hover {
    background: ${props => props.granted ? '#3ca374' : '#d84040'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #40444b;
    color: #96989d;
    cursor: not-allowed;
    transform: none;
  }
`;

const PermissionStatus = styled.div`
  color: ${props => props.granted ? '#43b581' : '#f04747'};
  font-size: 12px;
  margin-top: 8px;
  font-weight: 500;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SimpleLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chatType, setChatType] = useState('text'); // 'text' veya 'voice'
  const [micPermission, setMicPermission] = useState(false);
  const [micPermissionRequested, setMicPermissionRequested] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleJoin = () => {
    if (!username.trim()) {
      return;
    }
    
    if (password !== '689tk') {
      setPasswordError('Şifre yanlış! Doğru şifreyi girin.');
      return;
    }
    
    setPasswordError('');
    onLogin({
      id: Date.now().toString(),
      username: username.trim(),
      chatType: chatType
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) {
      setPasswordError('');
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      setMicPermissionRequested(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      // İzin verildi, stream'i hemen kapat
      stream.getTracks().forEach(track => track.stop());
      
      setMicPermission(true);
      setMicPermissionRequested(false);
    } catch (error) {
      console.error('Mikrofon izni alınamadı:', error);
      setMicPermission(false);
      setMicPermissionRequested(false);
      alert('Mikrofon izni gerekli! Sesli sohbet için mikrofon erişimine izin verin.');
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <MessageCircle size={32} />
          TK Chat
        </Logo>
        
        <Title>Hoş Geldiniz!</Title>
        <Subtitle>Sohbete katılmak için kullanıcı adınızı girin</Subtitle>
        
        <Input
          type="text"
          placeholder="Kullanıcı adınız..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        
        <Input
          type="password"
          placeholder="Şifre..."
          value={password}
          onChange={handlePasswordChange}
          onKeyPress={handleKeyPress}
          error={!!passwordError}
        />
        
        {passwordError && (
          <ErrorMessage>
            {passwordError}
          </ErrorMessage>
        )}
        
        <ChatTypeSelector>
          <ChatTypeButton
            selected={chatType === 'text'}
            onClick={() => setChatType('text')}
          >
            <MessageCircle size={24} />
            <span>Yazılı Sohbet</span>
          </ChatTypeButton>
          
          <ChatTypeButton
            selected={chatType === 'voice'}
            onClick={() => setChatType('voice')}
          >
            <Mic size={24} />
            <span>Sesli Sohbet</span>
          </ChatTypeButton>
        </ChatTypeSelector>
        
        <JoinButton 
          onClick={handleJoin}
          disabled={!username.trim() || !password.trim()}
        >
          {chatType === 'text' ? 'Yazılı Sohbete Katıl' : 'Sesli Sohbete Katıl'}
          <ArrowRight size={20} />
        </JoinButton>

        <PermissionButton
          onClick={requestMicrophonePermission}
          granted={micPermission}
          disabled={micPermissionRequested}
        >
          {micPermissionRequested ? (
            <>
              <Spinner />
              İzin İsteniyor...
            </>
          ) : micPermission ? (
            <>
              <Mic size={16} />
              Mikrofon İzni Verildi ✓
            </>
          ) : (
            <>
              <MicOff size={16} />
              Mikrofon İzni Ver
            </>
          )}
        </PermissionButton>

        {micPermissionRequested && (
          <PermissionStatus granted={false}>
            Tarayıcı izin penceresini kontrol edin...
          </PermissionStatus>
        )}
        
                {micPermission && (
          <PermissionStatus granted={true}>
            Mikrofon izni verildi! Sesli sohbete hazırsınız.
          </PermissionStatus>
        )}
      </LoginCard>
    </LoginContainer>
  );
};

export default SimpleLogin; 