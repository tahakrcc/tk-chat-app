import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import SimpleLogin from './components/SimpleLogin';
import ChatRoom from './components/ChatRoom';
import VoiceRoom from './components/VoiceRoom';
import { ArrowLeft, Users, Hash, Mic, LogOut } from 'lucide-react';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #36393f;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    height: 100vh;
    overflow: hidden;
  }
`;

const ChatHeader = styled.div`
  background: #36393f;
  padding: 16px;
  border-bottom: 1px solid #40444b;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-weight: 600;
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
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
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 13px;
    gap: 4px;
  }
`;

const ChatTypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00d4ff;
  
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
  color: #96989d;
  font-size: 14px;
  
  @media (max-width: 768px) {
    gap: 6px;
    font-size: 13px;
  }
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 12px;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
`;

const LogoutButton = styled.button`
  background: #dc3545;
  border: none;
  color: white;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c82333;
  }
  
  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 11px;
    gap: 3px;
  }
`;

const ActiveUsersBar = styled.div`
  background: #2f3136;
  padding: 8px 16px;
  border-bottom: 1px solid #40444b;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #96989d;
  font-size: 14px;
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
    gap: 6px;
  }
`;

// UserDot component removed - unused

const App = () => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
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
        content: `${data.user.username} sohbete katıldı`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Kullanıcı ayrıldı mesajı
    newSocket.on('user_left', (data) => {
      console.log('👋 Kullanıcı ayrıldı:', data);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${data.user.username} sohbetten ayrıldı`,
        timestamp: new Date().toISOString()
      }]);
    });

    return () => {
      console.log('🔌 Socket bağlantısı kapatılıyor');
      newSocket.close();
    };
  }, []);

  const handleLogin = (userData) => {
    console.log('🔐 Kullanıcı giriş yapıyor:', userData);
    setUser(userData);
    
    // Socket bağlantısını bekle ve kullanıcıyı ekle
    if (socket && socket.connected) {
      console.log('✅ Socket bağlı, kullanıcı ekleniyor');
      socket.emit('user_join', userData);
    } else {
      console.log('⏳ Socket bağlantısı bekleniyor...');
      // Socket bağlantısını bekle
      const checkConnection = setInterval(() => {
        if (socket && socket.connected) {
          console.log('✅ Socket bağlandı, kullanıcı ekleniyor');
          socket.emit('user_join', userData);
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
  };

  const handleBackToLogin = () => {
    if (socket) {
      socket.emit('user_logout');
    }
    setUser(null);
    setMessages([]);
  };

  const handleSendMessage = (messageContent) => {
    console.log('App.js handleSendMessage çağrıldı:', messageContent);
    console.log('Socket durumu:', socket);
    
    if (socket && messageContent.trim()) {
      const messageData = {
        content: messageContent.trim(),
        channel: 'general'
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
          <span style={{ fontWeight: 'bold', color: '#00d4ff' }}>TK Chat</span>
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
                <span key={activeUser.id} style={{ color: '#fff' }}>
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