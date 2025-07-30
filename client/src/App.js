import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import io from 'socket.io-client';
import SimpleLogin from './components/SimpleLogin';
import RoomSelection from './components/RoomSelection';
import ChatRoom from './components/ChatRoom';
import VoiceRoom from './components/VoiceRoom';
import { ArrowLeft, Users, Hash, Mic, LogOut } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.6s ease-out;
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
    height: 100vh;
    overflow: hidden;
  }
`;

const ChatHeader = styled.div`
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(25px);
  padding: 20px;
  border-bottom: 2px solid rgba(138, 43, 226, 0.3);
  display: flex;
  align-items: center;
  gap: 16px;
  color: #ffffff;
  font-weight: 700;
  position: relative;
  z-index: 1;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #8a2be2, #9370db);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 12px 18px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(138, 43, 226, 0.3);
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
    background: linear-gradient(135deg, #9370db, #8a2be2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(138, 43, 226, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 13px;
    gap: 6px;
  }
`;

const ChatTypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  font-size: 16px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    gap: 6px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  border: none;
  color: #ffffff;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #ee5a24, #ff6b6b);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    gap: 4px;
  }
`;

const ActiveUsersBar = styled.div`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(20px);
  padding: 12px 20px;
  border-bottom: 1px solid rgba(138, 43, 226, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b8b8b8;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  
  span {
    color: #40e0d0;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    gap: 6px;
  }
`;

const App = () => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(() => {
    // localStorage'dan kullanıcı bilgisini al
    const savedUser = localStorage.getItem('chatUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [showRoomSelection, setShowRoomSelection] = useState(() => {
    // Eğer kullanıcı varsa ama chatType yoksa oda seçimi göster
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      return !userData.chatType;
    }
    return false;
  });
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? (window.ENV?.REACT_APP_BACKEND_URL || 'https://tk-chat-app.onrender.com')
      : 'http://localhost:5001';
    
    console.log('Socket URL:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      timeout: 20000,
      forceNew: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Sunucuya bağlandı, Socket ID:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Bağlantı hatası:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Sunucu bağlantısı kesildi:', reason);
    });

    // Aktif kullanıcıları al
    newSocket.on('active_users', (users) => {
      console.log('👥 Aktif kullanıcılar alındı:', users);
      setActiveUsers(users);
    });

    // Yeni mesaj geldiğinde
    newSocket.on('new_message', (message) => {
      console.log('💬 Yeni mesaj alındı:', message);
      setMessages(prev => [...prev, message]);
    });

    // Kullanıcı katıldı mesajı
    newSocket.on('user_joined', (data) => {
      console.log('👋 Kullanıcı katıldı:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${data?.user?.username || data?.username || 'Bir kullanıcı'} sohbete katıldı`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Kullanıcı ayrıldı mesajı
    newSocket.on('user_left', (data) => {
      console.log('👋 Kullanıcı ayrıldı:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${data?.user?.username || 'Bir kullanıcı'} sohbetten ayrıldı`,
        timestamp: new Date().toISOString()
      }]);
    });

    return () => {
      console.log('🔌 Socket bağlantısı kapatılıyor');
      newSocket.close();
    };
  }, []);

  // Kullanıcı varsa socket'e bağlan
  useEffect(() => {
    if (user && socket && socket.connected && user.chatType) {
      console.log('✅ Kullanıcı zaten giriş yapmış, socket\'e bağlanıyor:', user);
      socket.emit('user_join', { ...user, room: 'general' });
    }
  }, [user, socket]);

  const handleLogin = (userData) => {
    console.log('🔐 Kullanıcı giriş yapıyor:', userData);
    setUser(userData);
    setShowRoomSelection(true);
    
    // Kullanıcı bilgisini localStorage'a kaydet (chatType olmadan)
    localStorage.setItem('chatUser', JSON.stringify(userData));
  };

  const handleRoomSelect = (userWithChatType) => {
    console.log('🏠 Oda seçildi:', userWithChatType);
    const updatedUser = { ...user, ...userWithChatType };
    setUser(updatedUser);
    setShowRoomSelection(false);
    
    // Kullanıcı bilgisini localStorage'a kaydet (chatType ile)
    localStorage.setItem('chatUser', JSON.stringify(updatedUser));
    
    // Socket'e bağlan ve odaya katıl
    if (socket && socket.connected) {
      socket.emit('user_join', { ...updatedUser, room: 'general' });
    }
  };

  const handleBackToLogin = () => {
    console.log('🔙 Giriş sayfasına dönülüyor');
    setUser(null);
    setShowRoomSelection(false);
    setMessages([]);
    setActiveUsers([]);
    localStorage.removeItem('chatUser');
  };

  const handleBackToRoomSelection = () => {
    console.log('🔙 Oda seçimi sayfasına dönülüyor');
    const userWithoutChatType = { username: user.username, password: user.password };
    setUser(userWithoutChatType);
    setShowRoomSelection(true);
    setMessages([]);
    setActiveUsers([]);
    localStorage.setItem('chatUser', JSON.stringify(userWithoutChatType));
  };

  const handleLogout = () => {
    console.log('🚪 Çıkış yapılıyor');
    setUser(null);
    setShowRoomSelection(false);
    setMessages([]);
    setActiveUsers([]);
    localStorage.removeItem('chatUser');
  };

  const handleSendMessage = (messageContent) => {
    console.log('App.js handleSendMessage çağrıldı:', messageContent);
    console.log('Socket durumu:', socket);
    
    if (socket && messageContent.trim()) {
      const messageData = {
        content: messageContent.trim(),
        room: 'general'
      };
      console.log('Socket.emit çağrılıyor:', messageData);
      socket.emit('send_message', messageData);
    } else {
      console.log('Mesaj gönderilemedi:', {
        hasSocket: !!socket,
        messageContent: messageContent,
        messageTrimmed: messageContent.trim()
      });
    }
  };

  // Login sayfası
  if (!user) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

  // Oda seçimi sayfası
  if (showRoomSelection) {
    return (
      <RoomSelection 
        user={user} 
        onRoomSelect={handleRoomSelect}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  // Chat odası
  return (
    <AppContainer>
      <ChatHeader>
        <BackButton onClick={handleBackToRoomSelection}>
          <ArrowLeft size={16} />
          <span className="hide-on-mobile">Oda Seçimi</span>
        </BackButton>
        
        <ChatTypeIcon>
          <span style={{ 
            fontWeight: 'bold', 
            background: 'linear-gradient(135deg, #8a2be2, #40e0d0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '18px'
          }}>
            TK Chat
          </span>
          {user.chatType === 'text' ? (
            <>
              <Hash size={20} style={{ color: '#40e0d0' }} />
              <span className="hide-on-mobile">Yazılı Sohbet</span>
            </>
          ) : (
            <>
              <Mic size={20} style={{ color: '#40e0d0' }} />
              <span className="hide-on-mobile">Sesli Sohbet</span>
            </>
          )}
        </ChatTypeIcon>
        
        <UserInfo>
          <UserAvatar>
            {user.username.charAt(0).toUpperCase()}
          </UserAvatar>
          <span className="hide-on-mobile">{user.username}</span>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={12} />
            <span className="hide-on-mobile">Çıkış</span>
          </LogoutButton>
        </UserInfo>
      </ChatHeader>

      <ActiveUsersBar>
        <Users size={14} style={{ color: '#40e0d0' }} />
        <span>Çevrimiçi: {activeUsers.length} kullanıcı</span>
        {activeUsers.length > 0 && (
          <>
            <span>•</span>
            <span className="hide-on-mobile">
              {activeUsers.slice(0, 3).map((activeUser, index) => (
                <span key={activeUser.id} style={{ color: '#ffffff' }}>
                  {activeUser.username}
                  {index < Math.min(2, activeUsers.length - 1) && ', '}
                </span>
              ))}
              {activeUsers.length > 3 && ` ve ${activeUsers.length - 3} kişi daha`}
            </span>
          </>
        )}
      </ActiveUsersBar>

      {user.chatType === 'text' ? (
        <ChatRoom 
          socket={socket} 
          user={user} 
          messages={messages}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <VoiceRoom 
          socket={socket} 
          user={user} 
          activeUsers={activeUsers}
        />
      )}
    </AppContainer>
  );
};

export default App; 