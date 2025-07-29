import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Lock, Mail, Eye, EyeOff, Wifi, WifiOff, MessageCircle } from 'lucide-react';

const AuthContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #36393f;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const AuthForm = styled.div`
  background: #2f3136;
  border: 1px solid #202225;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    margin: 0;
    max-width: 100%;
  }
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  color: #96989d;
  margin-bottom: 24px;
  font-size: 14px;
  line-height: 1.4;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-radius: 6px;
  background: #40444b;
  padding: 4px;
  border: 1px solid #202225;
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px;
  border: none;
  background: ${props => props.active ? '#00d4ff' : 'transparent'};
  color: ${props => props.active ? '#fff' : '#96989d'};
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#00d4ff' : '#4f545c'};
    color: ${props => props.active ? '#fff' : '#dcddde'};
  }
`;

const InputGroup = styled.div`
  margin-bottom: 16px;
  text-align: left;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  color: #dcddde;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  padding-left: 40px;
  background: #40444b;
  border: 1px solid #202225;
  border-radius: 4px;
  font-size: 14px;
  color: #dcddde;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: #96989d;
  }
  
  &:focus {
    outline: none;
    border-color: #00d4ff;
    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  color: #96989d;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #96989d;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #dcddde;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #00d4ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  
  &:hover {
    background: #0099cc;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #40444b;
    color: #96989d;
    cursor: not-allowed;
    transform: none;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.connected ? `
    background: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
    border: 1px solid rgba(46, 204, 113, 0.2);
  ` : `
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
    border: 1px solid rgba(231, 76, 60, 0.2);
  `}
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 8px;
  text-align: left;
`;

const AuthScreen = ({ onLogin, isConnected }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gerekli';
    }
    
    if (activeTab === 'register') {
      if (!formData.email.trim()) {
        newErrors.email = 'E-posta gerekli';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }
    
    if (activeTab === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        avatar: null
      };
      
      onLogin(userData);
    } catch (error) {
      setErrors({ general: 'Giriş yapılırken bir hata oluştu' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (activeTab === 'login') {
      return formData.username.trim() && formData.password;
    } else {
      return formData.username.trim() && formData.email.trim() && 
             formData.password && formData.password === formData.confirmPassword;
    }
  };

  return (
    <AuthContainer>
      <AuthForm>
        <Title>
          <MessageCircle size={24} />
          Chat Server
        </Title>
        <Subtitle>
          Discord benzeri sohbet uygulamasına hoş geldiniz
        </Subtitle>
        
        <ConnectionStatus connected={isConnected}>
          {isConnected ? (
            <>
              <Wifi size={14} />
              Sunucuya bağlı
            </>
          ) : (
            <>
              <WifiOff size={14} />
              Sunucuya bağlanılamıyor
            </>
          )}
        </ConnectionStatus>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'login'} 
            onClick={() => setActiveTab('login')}
          >
            Giriş Yap
          </Tab>
          <Tab 
            active={activeTab === 'register'} 
            onClick={() => setActiveTab('register')}
          >
            Kayıt Ol
          </Tab>
        </TabContainer>
        
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Kullanıcı Adı</Label>
            <InputWrapper>
              <IconWrapper>
                <User size={16} />
              </IconWrapper>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Kullanıcı adınızı girin"
                disabled={isLoading}
              />
            </InputWrapper>
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
          </InputGroup>
          
          {activeTab === 'register' && (
            <InputGroup>
              <Label>E-posta</Label>
              <InputWrapper>
                <IconWrapper>
                  <Mail size={16} />
                </IconWrapper>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="E-posta adresinizi girin"
                  disabled={isLoading}
                />
              </InputWrapper>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </InputGroup>
          )}
          
          <InputGroup>
            <Label>Şifre</Label>
            <InputWrapper>
              <IconWrapper>
                <Lock size={16} />
              </IconWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Şifrenizi girin"
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </PasswordToggle>
            </InputWrapper>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>
          
          {activeTab === 'register' && (
            <InputGroup>
              <Label>Şifre Tekrar</Label>
              <InputWrapper>
                <IconWrapper>
                  <Lock size={16} />
                </IconWrapper>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Şifrenizi tekrar girin"
                  disabled={isLoading}
                />
              </InputWrapper>
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </InputGroup>
          )}
          
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
          
          <SubmitButton 
            type="submit" 
            disabled={!isFormValid() || isLoading || !isConnected}
          >
            {isLoading ? 'İşleniyor...' : (activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
          </SubmitButton>
        </form>
      </AuthForm>
    </AuthContainer>
  );
};

export default AuthScreen; 