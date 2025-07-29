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
`;

const ChatTypeIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00d4ff;
`;

const UserInfo = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #96989d;
  font-size: 14px;
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
`;

const UserDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #43b581;
`;

const App = () => {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' 
      ? (window.ENV?.REACT_APP_BACKEND_URL || 'https://tk-chat-backend.onrender.com')
      : 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Sunucuya bağlandı');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Sunucu bağlantısı kesildi');
    });

    // Aktif kullanıcıları al
    newSocket.on('active_users', (users) => {
      setActiveUsers(users);
    });

    // Yeni mesaj geldiğinde
    newSocket.on('new_message', (message) => {
      console.log('Yeni mesaj alındı:', message);
      setMessages(prev => [...prev, message]);
    });

    // Kullanıcı katıldı mesajı
    newSocket.on('user_joined', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${data.user.username} sohbete katıldı`,
        timestamp: new Date().toISOString()
      }]);
    });

    // Kullanıcı ayrıldı mesajı
    newSocket.on('user_left', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: `${data.user.username} sohbetten ayrıldı`,
        timestamp: new Date().toISOString()
      }]);
    });

    return () => newSocket.close();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    if (socket) {
      socket.emit('user_join', userData);
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
          Geri Dön
        </BackButton>
        
        <ChatTypeIcon>
          <span style={{ fontWeight: 'bold', color: '#00d4ff' }}>TK Chat</span>
          {user.chatType === 'text' ? (
            <>
              <Hash size={20} />
              Yazılı Sohbet
            </>
          ) : (
            <>
              <Mic size={20} />
              Sesli Sohbet
            </>
          )}
        </ChatTypeIcon>
        
        <UserInfo>
          <UserAvatar>
            {user.username.charAt(0).toUpperCase()}
          </UserAvatar>
          {user.username}
          <LogoutButton onClick={handleLogout}>
            <LogOut size={12} />
            Çıkış
          </LogoutButton>
        </UserInfo>
      </ChatHeader>

      <ActiveUsersBar>
        <Users size={14} />
        Çevrimiçi: {activeUsers.length} kullanıcı
        {activeUsers.length > 0 && (
          <>
            <span>•</span>
            {activeUsers.slice(0, 3).map((activeUser, index) => (
              <span key={activeUser.id} style={{ color: '#fff' }}>
                {activeUser.username}
                {index < Math.min(2, activeUsers.length - 1) && ', '}
              </span>
            ))}
            {activeUsers.length > 3 && ` ve ${activeUsers.length - 3} kişi daha`}
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