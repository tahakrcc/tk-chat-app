import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import io from 'socket.io-client';
import SimpleLogin from './components/SimpleLogin';
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

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
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
      radial-gradient(circle at 20% 80%, rgba(83, 82, 237, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(46, 213, 115, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 71, 87, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    height: 100vh;
    overflow: hidden;
  }
`;

const ChatHeader = styled.div`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  padding: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-weight: 700;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #5352ed, #3742fa);
  backdrop-filter: blur(15px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, #3742fa, #5352ed);
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    gap: 4px;
  }
`;

const ChatTypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2ed573;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 700;
  
  @media (max-width: 768px) {
    gap: 6px;
    font-size: 14px;
  }
`;

const UserInfo = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    gap: 6px;
    font-size: 13px;
  }
`;

const UserAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5352ed, #3742fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  animation: ${pulse} 2s infinite;
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    width: 24px;
    height: 24px;
    font-size: 10px;
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, #ff4757, #ff3742);
  border: 2px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, #ff3742, #ff4757);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    gap: 3px;
  }
`;

const ActiveUsersBar = styled.div`
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  padding: 10px 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
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
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? (window.ENV?.REACT_APP_BACKEND_URL || 'https://tk-chat-app.onrender.com')
      : 'http://localhost:5000';
    
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
    if (user && socket && socket.connected) {
      console.log('✅ Kullanıcı zaten giriş yapmış, socket\'e bağlanıyor:', user);
      socket.emit('user_join', { ...user, room: 'general' });
    }
  }, [user, socket]);

  const handleLogin = (userData) => {
    console.log('🔐 Kullanıcı giriş yapıyor:', userData);
    setUser(userData);
    
    // Kullanıcı bilgisini localStorage'a kaydet
    localStorage.setItem('chatUser', JSON.stringify(userData));
    
    // Socket bağlantısını bekle ve kullanıcıyı ekle
    if (socket && socket.connected) {
      console.log('✅ Socket bağlı, kullanıcı ekleniyor');
      socket.emit('user_join', { ...userData, room: 'general' });
    } else {
      console.log('⏳ Socket bağlantısı bekleniyor...');
      // Socket bağlantısını bekle
      const checkConnection = setInterval(() => {
        if (socket && socket.connected) {
          console.log('✅ Socket bağlandı, kullanıcı ekleniyor');
          socket.emit('user_join', { ...userData, room: 'general' });
          clearInterval(checkConnection);
        }
      }, 100);
      
      // 10 saniye sonra timeout
      setTimeout(() => {
        clearInterval(checkConnection);
        console.log('❌ Socket bağlantısı timeout');
      }, 10000);
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.emit('user_logout');
    }
    setUser(null);
    setMessages([]);
    // localStorage'dan kullanıcı bilgisini sil
    localStorage.removeItem('chatUser');
  };

  const handleBackToLogin = () => {
    if (socket) {
      socket.emit('user_logout');
    }
    setUser(null);
    setMessages([]);
    // localStorage'dan kullanıcı bilgisini sil
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

  if (!user) {
    return <SimpleLogin onLogin={handleLogin} />;
  }

  return (
    <AppContainer>
      <ChatHeader>
        <BackButton onClick={handleBackToLogin}>
          <ArrowLeft size={16} />
          <span className="hide-on-mobile">Geri Dön</span>
        </BackButton>
        
        <ChatTypeIcon>
          <span style={{ fontWeight: 'bold', color: '#2ed573' }}>TK Chat</span>
          {user.chatType === 'text' ? (
            <>
              <Hash size={20} />
              <span className="hide-on-mobile">Yazılı Sohbet</span>
            </>
          ) : (
            <>
              <Mic size={20} />
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
        <Users size={14} />
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
          currentUser={user}
          roomName="Genel Sesli Oda"
        />
      )}
    </AppContainer>
  );
};

export default App; 