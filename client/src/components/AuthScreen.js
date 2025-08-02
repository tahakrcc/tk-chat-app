import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Lock, Mail, Eye, EyeOff, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import SERVER_URL from '../config';

const AuthContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 10px;
    align-items: flex-start;
    padding-top: 20px;
  }
`;

const AuthForm = styled.div`
  background: #2f3136;
  border: 1px solid #202225;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 24px 16px;
    margin: 0;
    max-width: 100%;
    border-radius: 8px;
  }
`;

const Title = styled.h2`
  color: #fff;
  margin-bottom: 24px;
  font-size: 28px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  color: #96989d;
  margin-bottom: 32px;
  font-size: 16px;
  line-height: 1.5;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 32px;
  border-radius: 8px;
  background: #40444b;
  padding: 4px;
  border: 1px solid #202225;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.$active ? '#7289da' : 'transparent'};
  color: ${props => props.$active ? '#fff' : '#96989d'};
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    padding: 10px 8px;
    font-size: 13px;
  }
  
  &:hover {
    background: ${props => props.$active ? '#7289da' : '#4f545c'};
    color: ${props => props.$active ? '#fff' : '#dcddde'};
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #dcddde;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const GenderContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const GenderOption = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid ${props => props.$selected ? '#7289da' : '#40444b'};
  background: ${props => props.$selected ? 'rgba(114, 137, 218, 0.2)' : 'transparent'};
  color: ${props => props.$selected ? '#fff' : '#96989d'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
  }
  
  &:hover {
    border-color: #7289da;
    color: #fff;
    background: rgba(114, 137, 218, 0.1);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  background: #40444b;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#202225'};
  border-radius: 8px;
  padding: 14px 16px;
  color: #dcddde;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #7289da;
    box-shadow: 0 0 0 3px rgba(114, 137, 218, 0.2);
  }
  
  &::placeholder {
    color: #72767d;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 16px;
  color: #72767d;
  display: flex;
  align-items: center;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #72767d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #dcddde;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 13px;
  margin-top: 8px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SuccessMessage = styled.div`
  color: #43b581;
  font-size: 13px;
  margin-top: 8px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #7289da, #5865f2);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  
  @media (max-width: 768px) {
    padding: 14px;
    font-size: 15px;
    margin-top: 16px;
  }
  
  &:hover {
    background: linear-gradient(135deg, #5865f2, #7289da);
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(114, 137, 218, 0.3);
  }
  
  &:disabled {
    background: #40444b;
    color: #72767d;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;



const AuthScreen = ({ onLogin, isConnected }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    gender: 'male'
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
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
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleGenderChange = (gender) => {
    setFormData(prev => ({
      ...prev,
      gender
    }));
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Kullanıcı adı gerekli';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Kullanıcı adı en az 3 karakter olmalı';
    }
    
    if (activeTab === 'register') {
      if (!formData.email.trim()) {
        newErrors.email = 'E-posta gerekli';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Geçerli bir e-posta adresi girin';
      }
      
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Görünen ad gerekli';
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
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    
    // Önce server bağlantısını test et
    try {
      const healthResponse = await fetch(`${SERVER_URL}/api/health`);
      console.log('Health check response:', healthResponse.status);
    } catch (healthError) {
      console.error('Health check failed:', healthError);
      setErrors({ general: 'Sunucuya bağlanılamıyor. Lütfen daha sonra tekrar deneyin.' });
      setIsLoading(false);
      return;
    }
    
    try {
      const endpoint = activeTab === 'login' ? '/api/login' : '/api/register';
      const requestData = activeTab === 'login' 
        ? { username: formData.username, password: formData.password }
        : { 
            username: formData.username, 
            email: formData.email, 
            password: formData.password,
            displayName: formData.displayName,
            gender: formData.gender
          };
      
      console.log('API çağrısı yapılıyor:', `${SERVER_URL}${endpoint}`);
      console.log('Request data:', requestData);
      
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }
      
      if (activeTab === 'register') {
        setSuccessMessage('Hesap başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        setActiveTab('login');
        setFormData({
          username: formData.username,
          email: '',
          password: '',
          confirmPassword: '',
          displayName: '',
          gender: 'male'
        });
      } else {
        // Login başarılı
        onLogin(data.user);
      }
      
    } catch (error) {
      console.error('Auth error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Bir hata oluştu';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AuthContainer>
      <AuthForm>
        <Title>
          <MessageCircle size={32} />
          TK Chat
        </Title>
        <Subtitle>
          {activeTab === 'login' 
            ? 'Hesabınıza giriş yapın ve sohbete başlayın'
            : 'Yeni hesap oluşturun ve topluluğa katılın'
          }
        </Subtitle>
        
        <TabContainer>
          <Tab 
            $active={activeTab === 'login'} 
            onClick={() => setActiveTab('login')}
          >
            Giriş Yap
          </Tab>
          <Tab 
            $active={activeTab === 'register'} 
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
                <User size={18} />
              </IconWrapper>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Kullanıcı adınızı girin"
                $hasError={!!errors.username}
                style={{ paddingLeft: '48px' }}
              />
            </InputWrapper>
            {errors.username && (
              <ErrorMessage>
                <AlertCircle size={14} />
                {errors.username}
              </ErrorMessage>
            )}
          </InputGroup>
          
          {activeTab === 'register' && (
            <>
              <InputGroup>
                <Label>E-posta</Label>
                <InputWrapper>
                  <IconWrapper>
                    <Mail size={18} />
                  </IconWrapper>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E-posta adresinizi girin"
                    $hasError={!!errors.email}
                    style={{ paddingLeft: '48px' }}
                  />
                </InputWrapper>
                {errors.email && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {errors.email}
                  </ErrorMessage>
                )}
              </InputGroup>
              
              <InputGroup>
                <Label>Görünen Ad</Label>
                <Input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="Görünen adınızı girin"
                  $hasError={!!errors.displayName}
                />
                {errors.displayName && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {errors.displayName}
                  </ErrorMessage>
                )}
              </InputGroup>
              
              <InputGroup>
                <Label>Cinsiyet</Label>
                <GenderContainer>
                  <GenderOption
                    type="button"
                    $selected={formData.gender === 'male'}
                    onClick={() => handleGenderChange('male')}
                  >
                    <span>👨</span>
                    Erkek
                  </GenderOption>
                  <GenderOption
                    type="button"
                    $selected={formData.gender === 'female'}
                    onClick={() => handleGenderChange('female')}
                  >
                    <span>👩</span>
                    Kadın
                  </GenderOption>
                </GenderContainer>
              </InputGroup>
            </>
          )}
          
          <InputGroup>
            <Label>Şifre</Label>
            <InputWrapper>
              <IconWrapper>
                <Lock size={18} />
              </IconWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Şifrenizi girin"
                $hasError={!!errors.password}
                style={{ paddingLeft: '48px' }}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputWrapper>
            {errors.password && (
              <ErrorMessage>
                <AlertCircle size={14} />
                {errors.password}
              </ErrorMessage>
            )}
          </InputGroup>
          
          {activeTab === 'register' && (
            <InputGroup>
              <Label>Şifre Tekrar</Label>
              <InputWrapper>
                <IconWrapper>
                  <Lock size={18} />
                </IconWrapper>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Şifrenizi tekrar girin"
                  $hasError={!!errors.confirmPassword}
                  style={{ paddingLeft: '48px' }}
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </PasswordToggle>
              </InputWrapper>
              {errors.confirmPassword && (
                <ErrorMessage>
                  <AlertCircle size={14} />
                  {errors.confirmPassword}
                </ErrorMessage>
              )}
            </InputGroup>
          )}
          
          {errors.general && (
            <ErrorMessage style={{ marginBottom: '16px' }}>
              <AlertCircle size={14} />
              {errors.general}
            </ErrorMessage>
          )}
          
          {successMessage && (
            <SuccessMessage style={{ marginBottom: '16px' }}>
              <CheckCircle size={14} />
              {successMessage}
            </SuccessMessage>
          )}
          
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner />
                {activeTab === 'login' ? 'Giriş yapılıyor...' : 'Kayıt olunuyor...'}
              </>
            ) : (
              activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'
            )}
          </SubmitButton>
        </form>
        

      </AuthForm>
    </AuthContainer>
  );
};

export default AuthScreen; 