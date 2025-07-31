import React, { useState, useRef } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ProfileModal = styled.div`
  background: #36393f;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid #202225;
  
  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 95vh;
    margin: 10px;
  }
`;

const ModalHeader = styled.div`
  background: linear-gradient(135deg, #7289da, #5865f2);
  padding: 24px;
  border-radius: 12px 12px 0 0;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const ProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 700;
  border: 4px solid rgba(255, 255, 255, 0.3);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  &::after {
    content: '📷';
    position: absolute;
    bottom: 0;
    right: 0;
    background: #7289da;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border: 2px solid #36393f;
  }
`;

const ProfileName = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  text-align: center;
`;

const ProfileStatus = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
  margin-top: 4px;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #dcddde;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  color: #b9bbbe;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  background: #40444b;
  border: 1px solid #202225;
  border-radius: 6px;
  padding: 12px 16px;
  color: #dcddde;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #7289da;
    box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.3);
  }
  
  &::placeholder {
    color: #72767d;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background: #40444b;
  border: 1px solid #202225;
  border-radius: 6px;
  padding: 12px 16px;
  color: #dcddde;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #7289da;
    box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.3);
  }
  
  &::placeholder {
    color: #72767d;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const AvatarUploadButton = styled.button`
  background: #7289da;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
  
  &:hover {
    background: #677bc4;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SaveButton = styled.button`
  background: #43b581;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: #3ca374;
  }
  
  &:disabled {
    background: #40444b;
    color: #72767d;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #40444b;
  color: #dcddde;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  
  &:hover {
    background: #4f545c;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'online': return '#43b581';
      case 'idle': return '#faa61a';
      case 'dnd': return '#f04747';
      case 'offline': return '#747f8d';
      default: return '#43b581';
    }
  }};
`;

const StatusSelect = styled.select`
  background: #40444b;
  border: 1px solid #202225;
  border-radius: 6px;
  padding: 8px 12px;
  color: #dcddde;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  
  &:focus {
    border-color: #7289da;
  }
`;

const ProfileModalComponent = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    status: user?.status || 'online',
    avatar: user?.avatar || ''
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Preview oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Avatar yükleme işlemi (gerçek uygulamada bir API'ye yüklenir)
      let avatarUrl = formData.avatar;
      if (avatarFile) {
        // Burada gerçek bir dosya yükleme API'si kullanılır
        avatarUrl = avatarPreview;
      }

      const updatedUser = {
        ...user,
        ...formData,
        avatar: avatarUrl
      };

      await onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ProfileModal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>×</CloseButton>
          <ProfileAvatar 
            $avatarUrl={avatarPreview}
            onClick={handleAvatarClick}
          >
            {!avatarPreview && (formData.username?.charAt(0)?.toUpperCase() || 'U')}
          </ProfileAvatar>
          <ProfileName>{formData.displayName || formData.username}</ProfileName>
          <ProfileStatus>
            {formData.status === 'online' && '🟢 Çevrimiçi'}
            {formData.status === 'idle' && '🟡 Boşta'}
            {formData.status === 'dnd' && '🔴 Rahatsız Etmeyin'}
            {formData.status === 'offline' && '⚫ Çevrimdışı'}
          </ProfileStatus>
        </ModalHeader>

        <ModalContent>
          <FormSection>
            <SectionTitle>👤 Temel Bilgiler</SectionTitle>
            
            <FormGroup>
              <Label>Kullanıcı Adı</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Kullanıcı adınızı girin"
              />
            </FormGroup>

            <FormGroup>
              <Label>Görünen Ad</Label>
              <Input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Görünen adınızı girin"
              />
            </FormGroup>

            <FormGroup>
              <Label>Hakkımda</Label>
              <TextArea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                maxLength={200}
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>📱 Durum</SectionTitle>
            
            <FormGroup>
              <Label>Çevrimiçi Durumu</Label>
              <StatusSelect
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="online">🟢 Çevrimiçi</option>
                <option value="idle">🟡 Boşta</option>
                <option value="dnd">🔴 Rahatsız Etmeyin</option>
                <option value="offline">⚫ Çevrimdışı</option>
              </StatusSelect>
              
              <StatusIndicator>
                <StatusDot $status={formData.status} />
                <span style={{ color: '#72767d', fontSize: '12px' }}>
                  {formData.status === 'online' && 'Çevrimiçi'}
                  {formData.status === 'idle' && 'Boşta'}
                  {formData.status === 'dnd' && 'Rahatsız Etmeyin'}
                  {formData.status === 'offline' && 'Çevrimdışı'}
                </span>
              </StatusIndicator>
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>🖼️ Profil Fotoğrafı</SectionTitle>
            
            <AvatarUploadButton onClick={handleAvatarClick}>
              Fotoğraf Seç
            </AvatarUploadButton>
            
            <FileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <p style={{ color: '#72767d', fontSize: '12px', marginTop: '8px' }}>
              PNG, JPG veya GIF formatında, maksimum 5MB
            </p>
          </FormSection>

          <ButtonGroup>
            <CancelButton onClick={handleCancel}>
              İptal
            </CancelButton>
            <SaveButton onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
            </SaveButton>
          </ButtonGroup>
        </ModalContent>
      </ProfileModal>
    </ModalOverlay>
  );
};

export default ProfileModalComponent; 