import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import io from 'socket.io-client';
import AuthScreen from './components/AuthScreen';
import RoomSelection from './components/RoomSelection';
import ChatRoom from './components/ChatRoom';
import VoiceRoom from './components/VoiceRoom';
import ProfileModalComponent from './components/ProfileModal';
import { ArrowLeft, Users, Hash, Mic, LogOut, Settings } from 'lucide-react';
import SERVER_URL from './config';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;



const AppContainer = styled.div`
  min-height: 100vh;
  background: #36393f;
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  
  @media (max-width: 768px) {
    height: 100vh;
    overflow: hidden;
  }
`;

const ChatHeader = styled.div`
  background: #292b2f;
  padding: 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ffffff;
  font-weight: 700;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const BackButton = styled.button`
  background: #40444b;
  border: none;
  color: #dcddde;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const RoomIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7289da, #5865f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const RoomDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomName = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 16px;
`;

const RoomDescription = styled.div`
  color: #96989d;
  font-size: 12px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 4px;
    flex-wrap: wrap;
  }
`;

const ActionButton = styled.button`
  background: #40444b;
  border: none;
  color: #dcddde;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
`;

const LogoutButton = styled.button`
  background: #ed4245;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c03537;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
    gap: 4px;
    
    span {
      display: none;
    }
  }
`;

const MobileFloatingMenu = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const FloatingMenuButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #7289da;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  z-index: 1001;
  
  &:hover {
    background: #5865f2;
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const FloatingMenu = styled.div`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: #2f3136;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: ${props => props.$isOpen ? 'block' : 'none'};
  min-width: 200px;
`;

const FloatingMenuItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  color: #dcddde;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #40444b;
    color: #fff;
  }
`;

const ProfileButton = styled.button`
  background: #40444b;
  border: none;
  color: #dcddde;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    padding: 8px;
    font-size: 12px;
    gap: 4px;
    min-width: 40px;
    justify-content: center;
    
    span {
      display: none;
    }
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  z-index: 1;
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ActiveUsersBar = styled.div`
  background: #2f3136;
  border-left: 1px solid #202225;
  width: 240px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ActiveUsersTitle = styled.h3`
  color: #dcddde;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #40444b;
  }
`;

const UserItemAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 10px;
`;

const UserItemInfo = styled.div`
  flex: 1;
`;

const UserItemName = styled.div`
  color: #dcddde;
  font-size: 13px;
  font-weight: 500;
`;

const UserItemStatus = styled.div`
  color: #96989d;
  font-size: 11px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
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

const App = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState('auth'); // 'auth', 'room-selection', 'chat', 'voice'
  const [user, setUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Socket bağlantısı
  useEffect(() => {
    console.log('Socket bağlantısı kuruluyor:', SERVER_URL);
    
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket bağlandı');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket bağlantısı kesildi');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error);
      setIsConnected(false);
    });

    newSocket.on('active_users', (users) => {
      setActiveUsers(users);
    });

    newSocket.on('user_joined', (data) => {
      console.log('Yeni kullanıcı katıldı:', data);
    });

    newSocket.on('user_left', (data) => {
      console.log('Kullanıcı ayrıldı:', data);
    });

    newSocket.on('auth_error', (data) => {
      console.error('Auth hatası:', data);
      // Kullanıcıyı tekrar auth ekranına yönlendir
      setCurrentView('auth');
      setUser(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Kullanıcı giriş yaptığında
  const handleLogin = (userData) => {
    console.log('Kullanıcı giriş yaptı:', userData);
    setUser(userData);
    
    // Kullanıcı bilgilerini localStorage'a kaydet
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Oda seçimi ekranına yönlendir
    setCurrentView('room-selection');
  };

  // Oda seçildiğinde
  const handleJoinRoom = (room) => {
    console.log('Oda seçildi:', room);
    console.log('Socket durumu:', { socket: !!socket, user: !!user });
    setSelectedRoom(room);
    
    if (socket && user) {
      // Socket'e kullanıcı bilgilerini gönder
      const joinData = {
        username: user.username,
        room: room.id
      };
      console.log('Socket user_join emit ediliyor:', joinData);
      socket.emit('user_join', joinData);
      
      // Oda tipine göre view'ı ayarla
      if (room.type === 'voice') {
        setCurrentView('voice');
      } else {
        setCurrentView('chat');
      }
    } else {
      console.error('Socket veya user yok:', { socket: !!socket, user: !!user });
    }
  };

  // Geri dön butonları
  const handleBackToRoomSelection = () => {
    setCurrentView('room-selection');
    setSelectedRoom(null);
  };



  // Çıkış yap
  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setSelectedRoom(null);
    setActiveUsers([]);
    setCurrentView('auth');
    setShowMobileMenu(false); // Close mobile menu when logging out
    localStorage.removeItem('user');
  };

  // Profil modal işlemleri
  const handleOpenProfile = () => {
    setShowProfileModal(true);
    setShowMobileMenu(false); // Close mobile menu when opening profile
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  const handleSaveProfile = async (updatedUser) => {
    try {
      // Kullanıcı bilgilerini güncelle
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Socket'e profil güncellemesini gönder
      if (socket) {
        socket.emit('update_profile', updatedUser);
      }
      
      setShowProfileModal(false);
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
    }
  };

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini kontrol et
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setCurrentView('room-selection');
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Mobile menu click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu) {
        const mobileMenu = document.querySelector('[data-mobile-menu]');
        if (mobileMenu && !mobileMenu.contains(event.target)) {
          setShowMobileMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Render fonksiyonları
  const renderAuthScreen = () => {
    return <AuthScreen onLogin={handleLogin} isConnected={isConnected} />;
  };

  const renderRoomSelection = () => {
    return (
      <RoomSelection 
        user={user} 
        onJoinRoom={handleJoinRoom}
        onOpenProfile={handleOpenProfile}
        onLogout={handleLogout}
      />
    );
  };

  const renderChatRoom = () => {
    return (
      <ChatRoom
        socket={socket}
        user={user}
        room={selectedRoom}
        onBack={handleBackToRoomSelection}
      />
    );
  };

  const renderVoiceRoom = () => {
    return (
      <VoiceRoom
        socket={socket}
        user={user}
        room={selectedRoom}
        onBack={handleBackToRoomSelection}
      />
    );
  };

  const renderHeader = () => {
    if (currentView === 'auth' || currentView === 'room-selection') {
      return null;
    }

    return (
      <ChatHeader>
        <BackButton onClick={handleBackToRoomSelection}>
          <ArrowLeft size={16} />
          Geri
        </BackButton>
        
        <RoomInfo>
          <RoomIcon>
            {selectedRoom?.type === 'voice' ? <Mic size={16} /> : <Hash size={16} />}
          </RoomIcon>
          <RoomDetails>
            <RoomName>{selectedRoom?.name}</RoomName>
            <RoomDescription>{selectedRoom?.description}</RoomDescription>
          </RoomDetails>
        </RoomInfo>
        
        <HeaderActions>
          {/* User Profile Button - Discord style */}
          <ProfileButton onClick={handleOpenProfile} title="Profil Ayarları">
            <UserAvatar $avatarUrl={user?.avatar}>
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </UserAvatar>
            <span>{user?.displayName || user?.username}</span>
          </ProfileButton>
          
          {/* Settings Button */}
          <ActionButton onClick={handleOpenProfile} title="Profil Ayarları">
            <Settings size={16} />
          </ActionButton>
          
          {/* Logout Button */}
          <LogoutButton onClick={handleLogout} title="Çıkış Yap">
            <LogOut size={16} />
            <span>Çıkış</span>
          </LogoutButton>
        </HeaderActions>
      </ChatHeader>
    );
  };

  const renderActiveUsers = () => {
    if (currentView === 'auth' || currentView === 'room-selection') {
      return null;
    }

    return (
      <ActiveUsersBar>
        <ActiveUsersTitle>
          <Users size={16} />
          Aktif Kullanıcılar ({activeUsers.length})
        </ActiveUsersTitle>
        <UserList>
          {activeUsers.map((activeUser) => (
            <UserItem key={activeUser.id}>
              <UserItemAvatar $avatarUrl={activeUser.avatar}>
                {activeUser.displayName?.charAt(0)?.toUpperCase() || activeUser.username?.charAt(0)?.toUpperCase() || 'U'}
              </UserItemAvatar>
              <UserItemInfo>
                <UserItemName>{activeUser.displayName || activeUser.username}</UserItemName>
                <UserItemStatus>{activeUser.status || 'online'}</UserItemStatus>
              </UserItemInfo>
              <StatusIndicator $status={activeUser.status || 'online'} />
            </UserItem>
          ))}
        </UserList>
      </ActiveUsersBar>
    );
  };

  return (
    <AppContainer>
      {renderHeader()}
      
      <ContentArea>
        {currentView === 'auth' && renderAuthScreen()}
        {currentView === 'room-selection' && renderRoomSelection()}
        {currentView === 'chat' && renderChatRoom()}
        {currentView === 'voice' && renderVoiceRoom()}
        
        {renderActiveUsers()}
      </ContentArea>
      
      {/* Mobile Floating Menu */}
      {(currentView === 'chat' || currentView === 'voice') && (
        <MobileFloatingMenu data-mobile-menu>
          <FloatingMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)} title="Menü">
            <Settings size={24} />
          </FloatingMenuButton>
          
          <FloatingMenu $isOpen={showMobileMenu}>
            <FloatingMenuItem onClick={handleOpenProfile}>
              <UserAvatar $avatarUrl={user?.avatar}>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </UserAvatar>
              <span>Profil Ayarları</span>
            </FloatingMenuItem>
            
            <FloatingMenuItem onClick={handleLogout}>
              <LogOut size={16} />
              <span>Çıkış Yap</span>
            </FloatingMenuItem>
          </FloatingMenu>
        </MobileFloatingMenu>
      )}
      
      {showProfileModal && (
        <ProfileModalComponent
          user={user}
          onClose={handleCloseProfile}
          onSave={handleSaveProfile}
        />
      )}
    </AppContainer>
  );
};

export default App; 