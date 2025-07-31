import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MessageCircle, Users, Hash, ArrowRight, Menu, X } from 'lucide-react';

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

const MobileMenuButton = styled.button`
  display: none;
  position: absolute;
  top: 20px;
  right: 20px;
  background: #40444b;
  border: none;
  color: #dcddde;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
`;

const Title = styled.h2`
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Subtitle = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0;
`;

const UserInfo = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
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
  font-weight: 700;
  margin-bottom: 8px;
`;

const UserName = styled.div`
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
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
  padding: 16px 0;
  overflow-y: auto;
`;

const RoomCategory = styled.div`
  margin-bottom: 24px;
`;

const CategoryTitle = styled.h3`
  color: #96989d;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 20px;
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
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
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

const RoomInfo = styled.div`
  flex: 1;
`;

const RoomName = styled.div`
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
`;

const RoomDescription = styled.div`
  font-size: 12px;
  color: #72767d;
`;

const RoomStats = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #72767d;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MobileHeader = styled.div`
  display: none;
  padding: 16px 20px;
  background: #292b2f;
  border-bottom: 1px solid #202225;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const MobileTitle = styled.h2`
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MobileMenuToggle = styled.button`
  background: #40444b;
  border: none;
  color: #dcddde;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
    color: #fff;
  }
`;

const WelcomeSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const WelcomeIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7289da, #5865f2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  color: white;
  font-size: 48px;
  
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 32px;
    margin-bottom: 24px;
  }
`;

const WelcomeTitle = styled.h1`
  color: #fff;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 12px;
  }
`;

const WelcomeSubtitle = styled.p`
  color: #96989d;
  font-size: 18px;
  margin: 0 0 32px 0;
  max-width: 500px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

const RoomGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  max-width: 800px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const RoomCard = styled.div`
  background: #2f3136;
  border: 1px solid #202225;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: #7289da;
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const RoomCardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const RoomCardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7289da, #5865f2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 24px;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 20px;
    margin-right: 12px;
  }
`;

const RoomCardInfo = styled.div`
  flex: 1;
`;

const RoomCardTitle = styled.h3`
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const RoomCardDescription = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const RoomCardStats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #202225;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 12px;
    padding-top: 12px;
  }
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #96989d;
  font-size: 13px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const JoinButton = styled.button`
  background: linear-gradient(135deg, #7289da, #5865f2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  
  &:hover {
    background: linear-gradient(135deg, #5865f2, #7289da);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(114, 137, 218, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const RoomSelection = ({ user, onJoinRoom }) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [roomStats, setRoomStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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

  // Oda istatistiklerini yükle
  useEffect(() => {
    const fetchRoomStats = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/rooms/stats');
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

    fetchRoomStats();
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
      </Sidebar>
      
      <MainContent>
        <MobileHeader>
          <MobileTitle>
            <MessageCircle size={20} />
            TK Chat
          </MobileTitle>
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