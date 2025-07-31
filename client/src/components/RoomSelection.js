import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageCircle, Users, Hash, ArrowRight, Menu, X, Settings, LogOut } from 'lucide-react';
import SERVER_URL from '../config';

const RoomSelectionContainer = styled.div`
  flex: 1;
  display: flex;
  background: #36393f;
  min-height: 100vh;
  position: relative;
`;

const Sidebar = styled.div`
  width: 240px;
  background: #2f3136;
  border-right: 1px solid #202225;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.$isOpen ? '2px 0 10px rgba(0, 0, 0, 0.3)' : 'none'};
  }
`;

const MobileOverlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #202225;
  background: #292b2f;
  position: relative;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #dcddde;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    display: flex;
    position: absolute;
    top: 20px;
    right: 20px;
  }
  
  &:hover {
    background: #40444b;
  }
`;

const UserInfo = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #292b2f;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
`;

const UserName = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 14px;
`;

const UserStatus = styled.div`
  color: #96989d;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusDot = styled.div`
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

const RoomList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
`;

const RoomCategory = styled.div`
  margin-bottom: 24px;
`;

const CategoryTitle = styled.h3`
  color: #96989d;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0 0 8px 20px;
  letter-spacing: 0.5px;
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #96989d;
  
  &:hover {
    background: #40444b;
    color: #dcddde;
  }
  
  ${props => props.$isActive && `
    background: #40444b;
    color: #fff;
  `}
`;

const RoomIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RoomInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoomName = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
`;

const RoomDescription = styled.div`
  font-size: 12px;
  color: #72767d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RoomStats = styled.div`
  font-size: 11px;
  color: #72767d;
  flex-shrink: 0;
`;

// Çevrimiçi Kullanıcılar Bölümü
const OnlineUsersSection = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #202225;
  background: #292b2f;
`;

const OnlineUsersTitle = styled.h3`
  color: #96989d;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OnlineUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OnlineUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const OnlineUserAvatar = styled.div`
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
  flex-shrink: 0;
`;

const OnlineUserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const OnlineUserName = styled.div`
  color: #dcddde;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const OnlineUserStatus = styled.div`
  color: #72767d;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UserProfileSection = styled.div`
  padding: 16px 20px;
  border-top: 1px solid #202225;
  background: #292b2f;
`;

const UserProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  color: #dcddde;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    background: #40444b;
    color: #fff;
  }
`;

const UserProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserProfileName = styled.div`
  color: #dcddde;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserProfileStatus = styled.div`
  color: #72767d;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UserProfileActions = styled.div`
  display: flex;
  gap: 4px;
`;

const ProfileActionButton = styled.button`
  background: #40444b;
  border: none;
  color: #dcddde;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
`;

const LogoutActionButton = styled.button`
  background: #ed4245;
  border: none;
  color: #fff;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c03537;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MobileHeader = styled.div`
  display: none;
  background: #292b2f;
  padding: 12px 16px;
  border-bottom: 1px solid #202225;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileTitle = styled.div`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const MobileHeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileProfileButton = styled.button`
  background: none;
  border: none;
  color: #dcddde;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #40444b;
  }
`;

const MobileLogoutButton = styled.button`
  background: #ed4245;
  border: none;
  color: #fff;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c03537;
  }
`;

const MobileMenuToggle = styled.button`
  background: none;
  border: none;
  color: #dcddde;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #40444b;
  }
`;

const WelcomeSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
`;

const WelcomeIcon = styled.div`
  color: #7289da;
  margin-bottom: 24px;
`;

const WelcomeTitle = styled.h1`
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const WelcomeSubtitle = styled.p`
  color: #96989d;
  font-size: 16px;
  margin: 0 0 32px 0;
  max-width: 500px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #40444b;
  border-top: 2px solid #7289da;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const RoomCard = styled.div`
  background: #2f3136;
  border: 1px solid #202225;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #7289da;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const RoomCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const RoomCardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7289da, #5865f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
`;

const RoomCardInfo = styled.div`
  flex: 1;
`;

const RoomCardTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
`;

const RoomCardDescription = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
`;

const RoomCardStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #72767d;
  font-size: 13px;
`;

const JoinButton = styled.button`
  background: #7289da;
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #5865f2;
  }
`;

const RoomSelection = ({ user, onJoinRoom, onOpenProfile, onLogout }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [roomStats, setRoomStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const rooms = [
    {
      id: 'general',
      name: 'Genel',
      description: 'Genel sohbet odası - herkes için açık',
      icon: <Hash size={20} />,
      type: 'public'
    },
    {
      id: 'gaming',
      name: 'Oyun',
      description: 'Oyun severler için özel oda',
      icon: <MessageCircle size={20} />,
      type: 'public'
    },
    {
      id: 'music',
      name: 'Müzik',
      description: 'Müzik ve sanat hakkında sohbet',
      icon: <MessageCircle size={20} />,
      type: 'public'
    },
    {
      id: 'tech',
      name: 'Teknoloji',
      description: 'Teknoloji ve programlama',
      icon: <MessageCircle size={20} />,
      type: 'public'
    },
    {
      id: 'voice',
      name: 'Sesli Oda',
      description: 'Sesli sohbet odası',
      icon: <Users size={20} />,
      type: 'voice'
    }
  ];

  // Oda istatistiklerini ve çevrimiçi kullanıcıları yükle
  useEffect(() => {
    const fetchRoomStats = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/rooms/stats`);
        if (response.ok) {
          const stats = await response.json();
          setRoomStats(stats);
        }
      } catch (error) {
        console.error('Oda istatistikleri yüklenirken hata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchOnlineUsers = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/users`);
        if (response.ok) {
          const users = await response.json();
          // Sadece online kullanıcıları filtrele ve kendini de ekle
          const online = users.filter(user => user.status === 'online');
          
          // Eğer mevcut kullanıcı listede yoksa ekle
          const currentUserInList = online.find(u => u.username === user?.username);
          if (!currentUserInList && user) {
            online.push({
              id: 'current',
              username: user.username,
              displayName: user.displayName,
              avatar: user.avatar,
              status: 'online'
            });
          }
          
          setOnlineUsers(online);
        }
      } catch (error) {
        console.error('Çevrimiçi kullanıcılar yüklenirken hata:', error);
      }
    };

    fetchRoomStats();
    fetchOnlineUsers();
  }, []);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    onJoinRoom(room);
    setIsSidebarOpen(false); // Mobilde sidebar'ı kapat
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getRoomStats = (roomId) => {
    return roomStats[roomId] || { users: 0, messages: 0 };
  };

  return (
    <RoomSelectionContainer>
      <MobileOverlay $isOpen={isSidebarOpen} onClick={toggleSidebar} />
      
      <Sidebar $isOpen={isSidebarOpen}>
        <Header>
          <Title>
            <MessageCircle size={24} />
            TK Chat
          </Title>
          <Subtitle>Oda seçin ve sohbete başlayın</Subtitle>
          <MobileMenuButton onClick={toggleSidebar}>
            <X size={16} />
          </MobileMenuButton>
        </Header>
        
        <UserInfo>
          <UserAvatar $avatarUrl={user?.avatar}>
            {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </UserAvatar>
          <UserName>{user?.displayName || user?.username}</UserName>
          <UserStatus>
            <StatusDot $status={user?.status || 'online'} />
            {user?.status === 'online' && 'Çevrimiçi'}
            {user?.status === 'idle' && 'Boşta'}
            {user?.status === 'dnd' && 'Rahatsız Etmeyin'}
            {user?.status === 'offline' && 'Çevrimdışı'}
          </UserStatus>
        </UserInfo>
        
        <RoomList>
          <RoomCategory>
            <CategoryTitle>Metin Kanalları</CategoryTitle>
            {rooms.filter(room => room.type === 'public').map(room => {
              const stats = getRoomStats(room.id);
              return (
                <RoomItem 
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  $isActive={selectedRoom?.id === room.id}
                >
                  <RoomIcon>{room.icon}</RoomIcon>
                  <RoomInfo>
                    <RoomName>{room.name}</RoomName>
                    <RoomDescription>{room.description}</RoomDescription>
                  </RoomInfo>
                  <RoomStats>
                    <span>{stats.users} kullanıcı</span>
                  </RoomStats>
                </RoomItem>
              );
            })}
          </RoomCategory>
          
          <RoomCategory>
            <CategoryTitle>Sesli Kanallar</CategoryTitle>
            {rooms.filter(room => room.type === 'voice').map(room => {
              const stats = getRoomStats(room.id);
              return (
                <RoomItem 
                  key={room.id}
                  onClick={() => handleRoomSelect(room)}
                  $isActive={selectedRoom?.id === room.id}
                >
                  <RoomIcon>{room.icon}</RoomIcon>
                  <RoomInfo>
                    <RoomName>{room.name}</RoomName>
                    <RoomDescription>{room.description}</RoomDescription>
                  </RoomInfo>
                  <RoomStats>
                    <span>{stats.users} kullanıcı</span>
                  </RoomStats>
                </RoomItem>
              );
            })}
          </RoomCategory>
        </RoomList>

        {/* Çevrimiçi Kullanıcılar Bölümü */}
        <OnlineUsersSection>
          <OnlineUsersTitle>
            <Users size={14} />
            Çevrimiçi Kullanıcılar ({onlineUsers.length})
          </OnlineUsersTitle>
          <OnlineUsersList>
            {onlineUsers.length > 0 ? (
              onlineUsers.map((onlineUser, index) => (
                <OnlineUserItem key={onlineUser.id || index}>
                  <OnlineUserAvatar $avatarUrl={onlineUser.avatar}>
                    {onlineUser.displayName?.charAt(0)?.toUpperCase() || onlineUser.username?.charAt(0)?.toUpperCase() || 'U'}
                  </OnlineUserAvatar>
                  <OnlineUserInfo>
                    <OnlineUserName>{onlineUser.displayName || onlineUser.username}</OnlineUserName>
                    <OnlineUserStatus>
                      <StatusDot $status={onlineUser.status || 'online'} />
                      Çevrimiçi
                    </OnlineUserStatus>
                  </OnlineUserInfo>
                </OnlineUserItem>
              ))
            ) : (
              <div style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
                Henüz çevrimiçi kullanıcı yok
              </div>
            )}
          </OnlineUsersList>
        </OnlineUsersSection>
        
        <UserProfileSection>
          <UserProfileButton onClick={onOpenProfile}>
            <UserAvatar $avatarUrl={user?.avatar} $size="32px">
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </UserAvatar>
            <UserProfileInfo>
              <UserProfileName>{user?.displayName || user?.username}</UserProfileName>
              <UserProfileStatus>
                <StatusDot $status={user?.status || 'online'} />
                {user?.status === 'online' && 'Çevrimiçi'}
                {user?.status === 'idle' && 'Boşta'}
                {user?.status === 'dnd' && 'Rahatsız Etmeyin'}
                {user?.status === 'offline' && 'Çevrimdışı'}
              </UserProfileStatus>
            </UserProfileInfo>
            <UserProfileActions>
              <ProfileActionButton onClick={onOpenProfile}>
                <Settings size={16} />
              </ProfileActionButton>
              <LogoutActionButton onClick={onLogout}>
                <LogOut size={16} />
              </LogoutActionButton>
            </UserProfileActions>
          </UserProfileButton>
        </UserProfileSection>
      </Sidebar>
      
      <MainContent>
        <MobileHeader>
          <MobileTitle>
            <MessageCircle size={20} />
            TK Chat
          </MobileTitle>
          <MobileHeaderActions>
            <MobileProfileButton onClick={onOpenProfile}>
              <UserAvatar $avatarUrl={user?.avatar} $size="24px">
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </UserAvatar>
            </MobileProfileButton>
            <MobileLogoutButton onClick={onLogout}>
              <LogOut size={16} />
            </MobileLogoutButton>
          </MobileHeaderActions>
          <MobileMenuToggle onClick={toggleSidebar}>
            <Menu size={20} />
          </MobileMenuToggle>
        </MobileHeader>
        
        <WelcomeSection>
          <WelcomeIcon>
            <MessageCircle size={48} />
          </WelcomeIcon>
          <WelcomeTitle>TK Chat'e Hoş Geldiniz!</WelcomeTitle>
          <WelcomeSubtitle>
            Sol taraftan bir oda seçin ve sohbete başlayın. 
            Metin kanallarında yazışabilir, sesli kanallarda konuşabilirsiniz.
          </WelcomeSubtitle>
          
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#96989d' }}>
              <LoadingSpinner />
              Odalar yükleniyor...
            </div>
          ) : (
            <RoomGrid>
              {rooms.map(room => {
                const stats = getRoomStats(room.id);
                return (
                  <RoomCard key={room.id} onClick={() => handleRoomSelect(room)}>
                    <RoomCardHeader>
                      <RoomCardIcon>
                        {room.icon}
                      </RoomCardIcon>
                      <RoomCardInfo>
                        <RoomCardTitle>{room.name}</RoomCardTitle>
                        <RoomCardDescription>{room.description}</RoomCardDescription>
                      </RoomCardInfo>
                    </RoomCardHeader>
                    
                    <RoomCardStats>
                      <Stat>
                        <Users size={14} />
                        {stats.users} kullanıcı
                      </Stat>
                      {room.type === 'public' && (
                        <Stat>
                          <MessageCircle size={14} />
                          {stats.messages} mesaj
                        </Stat>
                      )}
                      <JoinButton>
                        Katıl
                        <ArrowRight size={16} />
                      </JoinButton>
                    </RoomCardStats>
                  </RoomCard>
                );
              })}
            </RoomGrid>
          )}
        </WelcomeSection>
      </MainContent>
    </RoomSelectionContainer>
  );
};

export default RoomSelection; 