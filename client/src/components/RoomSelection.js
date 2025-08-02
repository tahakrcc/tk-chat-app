import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  MessageCircle, 
  Users, 
  Hash, 
  ArrowRight, 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  UserPlus, 
  UserCheck,
  Heart,
  MessageSquare,
  Mic,
  User
} from 'lucide-react';
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
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #7289da;
    text-decoration: underline;
  }
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
      case 'offline': return '#ed4245';
      default: return props.$isOnline ? '#43b581' : '#ed4245';
    }
  }};
`;

const RoomList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #96989d;
  
  &:hover {
    background: #40444b;
    color: #dcddde;
  }
`;

const CategoryTitle = styled.h3`
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
`;

const CategoryToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
  transform: ${props => props.$isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'};
`;

const CategoryContent = styled.div`
  display: ${props => props.$isExpanded ? 'block' : 'none'};
  animation: ${props => props.$isExpanded ? 'slideDown 0.2s ease' : 'none'};
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const RoomItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px 8px 36px;
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

const FollowRequestsSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  background: #292b2f;
`;

const FollowRequestsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const FollowRequestsTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FollowRequestsCount = styled.span`
  background: #ed4245;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const FollowRequestItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #40444b;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
  }
`;

const FollowRequestAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const FollowRequestInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FollowRequestName = styled.div`
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FollowRequestActions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

const FollowRequestButton = styled.button`
  background: ${props => props.$variant === 'accept' ? '#3ba55c' : '#ed4245'};
  border: none;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'accept' ? '#2d7d46' : '#c03537'};
  }
`;

const FriendsSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  background: #292b2f;
`;

const FriendsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const FriendsTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FriendsCount = styled.span`
  color: #96989d;
  font-size: 12px;
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #40444b;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
  }
`;

const FriendAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const FriendInfo = styled.div`
  flex: 1;
  min-width: 0;
  cursor: pointer;
`;

const FriendName = styled.div`
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FriendStatus = styled.div`
  color: #96989d;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const FriendChatButton = styled.button`
  background: #7289da;
  border: none;
  color: white;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #5865f2;
    transform: translateY(-1px);
  }
`;

const DirectMessagesSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  background: #292b2f;
`;

const DirectMessagesHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const DirectMessagesTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DirectMessagesCount = styled.span`
  color: #96989d;
  font-size: 12px;
`;

const DirectMessageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #40444b;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #4f545c;
  }
`;

const DirectMessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const DirectMessageInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const DirectMessageName = styled.div`
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DirectMessageLastMessage = styled.div`
  color: #96989d;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnreadBadge = styled.div`
  background: #ed4245;
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
  position: absolute;
  top: 4px;
  right: 4px;
`;

const OnlineUsersSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  background: #292b2f;
`;

const OnlineUsersTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const OnlineUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OnlineUserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #40444b;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
  }
`;

const OnlineUserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;

const OnlineUserInfo = styled.div`
  flex: 1;
  min-width: 0;
  cursor: pointer;
`;

const OnlineUserName = styled.div`
  color: #dcddde;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #7289da;
    text-decoration: underline;
  }
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
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #7289da;
    text-decoration: underline;
  }
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

const CollapsibleSection = styled.div`
  border-bottom: 1px solid #202225;
`;

const SectionHeader = styled.div`
  padding: 12px 16px;
  background: #292b2f;
  color: #dcddde;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #40444b;
  }
`;

const SectionContent = styled.div`
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
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

const RoomSelection = ({ 
  user, 
  socket, 
  onJoinRoom, 
  onOpenProfile, 
  onLogout, 
  onUserClick, 
  onSendPrivateMessage,
  onlineUsersOpen,
  setOnlineUsersOpen,
  chatRoomsOpen,
  setChatRoomsOpen,
  dmRequestsOpen,
  setDmRequestsOpen,
  friendsOpen,
  setFriendsOpen
}) => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [textChannelsExpanded, setTextChannelsExpanded] = useState(false);
  const [voiceChannelsExpanded, setVoiceChannelsExpanded] = useState(false);
  const [roomStats, setRoomStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);

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

  const fetchRoomStats = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/rooms/stats`);
      if (response.ok) {
        const stats = await response.json();
        setRoomStats(stats);
      }
    } catch (error) {
      console.error('Oda istatistikleri yüklenirken hata:', error);
    }
  };

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/users`);
      if (response.ok) {
        const online = await response.json();
        console.log('Çevrimiçi kullanıcılar:', online);
        
        // Mevcut kullanıcıyı da listeye ekle (eğer yoksa)
        const currentUserInList = online.find(u => u.username === user?.username);
        if (!currentUserInList && user) {
          online.push({
            id: 'current',
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
            status: 'online',
            isOnline: true
          });
        }
        
        setOnlineUsers(online);
      }
    } catch (error) {
      console.error('Çevrimiçi kullanıcılar yüklenirken hata:', error);
    }
  }, [user]);

  const fetchFollowRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/requests/${user.username}`);
      if (response.ok) {
      const data = await response.json();
        setFollowRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Takip istekleri yüklenirken hata:', error);
    }
  }, [user]);

  const fetchFriends = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/followers/${user.username}`);
      if (response.ok) {
      const data = await response.json();
        setFriends(data.followers || []);
      }
    } catch (error) {
      console.error('Arkadaşlar yüklenirken hata:', error);
    }
  }, [user]);

  const fetchDirectMessages = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/private-message/conversations/${user.username}`);
      if (response.ok) {
      const data = await response.json();
        setDirectMessages(data.conversations || []);
      }
    } catch (error) {
      console.error('Özel mesajlar yüklenirken hata:', error);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchRoomStats(),
          fetchOnlineUsers(),
          fetchFollowRequests(),
          fetchFriends(),
          fetchDirectMessages()
        ]);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      fetchRoomStats();
      fetchOnlineUsers();
      fetchFollowRequests();
      fetchFriends();
      fetchDirectMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchOnlineUsers, fetchFollowRequests, fetchFriends, fetchDirectMessages]);

  // Çevrimiçi kullanıcılar anlık güncelleme
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = () => {
      console.log('Yeni kullanıcı katıldı, çevrimiçi listesi güncelleniyor...');
      fetchOnlineUsers();
    };

    const handleUserLeft = () => {
      console.log('Kullanıcı ayrıldı, çevrimiçi listesi güncelleniyor...');
      fetchOnlineUsers();
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, fetchOnlineUsers]);

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

  const handleAcceptFollowRequest = async (fromUsername) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername,
          toUsername: user.username
        })
      });
      
      if (response.ok) {
        fetchFollowRequests();
        fetchFriends();
      }
    } catch (error) {
      console.error('Takip isteği kabul hatası:', error);
    }
  };

  const handleRejectFollowRequest = async (fromUsername) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername,
          toUsername: user.username
        })
      });
      
      if (response.ok) {
        fetchFollowRequests();
      }
    } catch (error) {
      console.error('Takip isteği red hatası:', error);
    }
  };

  const handleDirectMessageClick = (conversation) => {
    if (onSendPrivateMessage) {
      onSendPrivateMessage(conversation.user);
    }
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
          <UserName onClick={() => onUserClick && onUserClick(user)}>
            {user?.displayName || user?.username}
          </UserName>
            <UserStatus>
            <StatusDot $status={user?.status || 'online'} />
            {user?.status === 'online' && 'Çevrimiçi'}
            {user?.status === 'idle' && 'Boşta'}
            {user?.status === 'dnd' && 'Rahatsız Etmeyin'}
            {user?.status === 'offline' && 'Çevrimdışı'}
            </UserStatus>
        </UserInfo>

        <RoomList>
          <CategoryHeader onClick={() => setTextChannelsExpanded(!textChannelsExpanded)}>
            <CategoryTitle>
              <MessageCircle size={16} />
              Metin Kanalları
            </CategoryTitle>
            <CategoryToggle $isExpanded={textChannelsExpanded}>
              <ChevronDown size={16} />
            </CategoryToggle>
          </CategoryHeader>
          <CategoryContent $isExpanded={textChannelsExpanded}>
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
          </CategoryContent>

          <CategoryHeader onClick={() => setVoiceChannelsExpanded(!voiceChannelsExpanded)}>
            <CategoryTitle>
              <Mic size={16} />
              Sesli Kanallar
            </CategoryTitle>
            <CategoryToggle $isExpanded={voiceChannelsExpanded}>
              <ChevronDown size={16} />
            </CategoryToggle>
          </CategoryHeader>
          <CategoryContent $isExpanded={voiceChannelsExpanded}>
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
          </CategoryContent>
        </RoomList>

        {/* Takip İstekleri Bölümü */}
        {followRequests.length > 0 && (
          <FollowRequestsSection>
            <FollowRequestsHeader>
              <FollowRequestsTitle>
                <UserPlus size={16} />
                Takip İstekleri
              </FollowRequestsTitle>
              <FollowRequestsCount>{followRequests.length}</FollowRequestsCount>
            </FollowRequestsHeader>
            {followRequests.map((request) => (
              <FollowRequestItem key={request.username}>
                <FollowRequestAvatar $avatarUrl={request.avatar}>
                  {!request.avatar && (request.displayName?.charAt(0) || request.username?.charAt(0) || 'U').toUpperCase()}
                </FollowRequestAvatar>
                <FollowRequestInfo>
                  <FollowRequestName onClick={() => onUserClick && onUserClick(request)}>
                    {request.displayName || request.username}
                    {request.gender === 'female' ? ' 👩' : ' 👨'}
                  </FollowRequestName>
                </FollowRequestInfo>
                <FollowRequestActions>
                  <FollowRequestButton 
                    $variant="accept"
                    onClick={() => handleAcceptFollowRequest(request.username)}
                  >
                    Kabul
                  </FollowRequestButton>
                  <FollowRequestButton 
                    $variant="reject"
                    onClick={() => handleRejectFollowRequest(request.username)}
                  >
                    Red
                  </FollowRequestButton>
                  <FriendChatButton 
                    onClick={() => onSendPrivateMessage && onSendPrivateMessage(request)}
                    title="Sohbet başlat"
                  >
                    <MessageSquare size={12} />
                  </FriendChatButton>
                </FollowRequestActions>
              </FollowRequestItem>
            ))}
          </FollowRequestsSection>
        )}

        {/* Arkadaşlar Bölümü */}
        <FriendsSection>
          <FriendsHeader>
            <FriendsTitle>
              <Heart size={16} />
              Arkadaşlar
            </FriendsTitle>
            <FriendsCount>{friends.length}</FriendsCount>
          </FriendsHeader>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <FriendItem key={friend.username}>
                <FriendAvatar $avatarUrl={friend.avatar}>
                  {!friend.avatar && (friend.displayName?.charAt(0) || friend.username?.charAt(0) || 'U').toUpperCase()}
                </FriendAvatar>
                <FriendInfo onClick={() => onUserClick && onUserClick(friend)}>
                  <FriendName>
                    {friend.displayName || friend.username}
                    {friend.gender === 'female' ? ' 👩' : ' 👨'}
                  </FriendName>
                  <FriendStatus>
                    <StatusDot $status={friend.status || 'online'} $isOnline={friend.isOnline} />
                    {friend.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </FriendStatus>
                </FriendInfo>
                <FriendChatButton 
                  onClick={() => onSendPrivateMessage && onSendPrivateMessage(friend)}
                  title="Sohbet başlat"
                >
                  <MessageSquare size={14} />
                </FriendChatButton>
              </FriendItem>
            ))
          ) : (
            <div style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
              Henüz arkadaş yok
            </div>
          )}
        </FriendsSection>

        {/* Özel Mesajlar Bölümü */}
        <DirectMessagesSection>
          <DirectMessagesHeader>
            <DirectMessagesTitle>
              <MessageSquare size={16} />
              Özel Mesajlar
            </DirectMessagesTitle>
            <DirectMessagesCount>{directMessages.length}</DirectMessagesCount>
          </DirectMessagesHeader>
          {directMessages.length > 0 ? (
            directMessages.map((conversation) => (
              <DirectMessageItem 
                key={conversation.user.username} 
                onClick={() => handleDirectMessageClick(conversation)}
              >
                <DirectMessageAvatar $avatarUrl={conversation.user.avatar}>
                  {!conversation.user.avatar && (conversation.user.displayName?.charAt(0) || conversation.user.username?.charAt(0) || 'U').toUpperCase()}
                </DirectMessageAvatar>
                <DirectMessageInfo>
                  <DirectMessageName>
                    {conversation.user.displayName || conversation.user.username}
                    {conversation.user.gender === 'female' ? ' 👩' : ' 👨'}
                  </DirectMessageName>
                  <DirectMessageLastMessage>
                    {conversation.lastMessage ? 
                      (conversation.lastMessage.content.length > 20 
                        ? conversation.lastMessage.content.substring(0, 20) + '...' 
                        : conversation.lastMessage.content)
                      : 'Henüz mesaj yok'
                    }
                  </DirectMessageLastMessage>
                </DirectMessageInfo>
                {conversation.unreadCount > 0 && (
                  <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
                )}
              </DirectMessageItem>
            ))
          ) : (
            <div style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
              Henüz özel mesaj yok
                  </div>
                )}
        </DirectMessagesSection>

        {/* Çevrimiçi Kullanıcılar Bölümü */}
        <CollapsibleSection>
          <SectionHeader onClick={() => setOnlineUsersOpen(!onlineUsersOpen)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={14} />
              Çevrimiçi Kullanıcılar ({onlineUsers.length})
            </div>
            {onlineUsersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </SectionHeader>
          <SectionContent $isOpen={onlineUsersOpen}>
            <OnlineUsersList>
              {onlineUsers.length > 0 ? (
                onlineUsers.map((onlineUser, index) => (
                  <OnlineUserItem key={onlineUser.id || index}>
                    <OnlineUserAvatar $avatarUrl={onlineUser.avatar}>
                      {onlineUser.displayName?.charAt(0)?.toUpperCase() || onlineUser.username?.charAt(0)?.toUpperCase() || 'U'}
                    </OnlineUserAvatar>
                    <OnlineUserInfo onClick={() => onUserClick && onUserClick(onlineUser)}>
                      <OnlineUserName onClick={() => onUserClick && onUserClick(onlineUser)}>
                        {onlineUser.displayName || onlineUser.username}
                      </OnlineUserName>
                      <OnlineUserStatus>
                        <StatusDot $status={onlineUser.status || 'online'} $isOnline={onlineUser.isOnline} />
                        {onlineUser.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </OnlineUserStatus>
                    </OnlineUserInfo>
                    <FriendChatButton 
                      onClick={() => onSendPrivateMessage && onSendPrivateMessage(onlineUser)}
                      title="Sohbet başlat"
                    >
                      <MessageSquare size={14} />
                    </FriendChatButton>
                  </OnlineUserItem>
                ))
              ) : (
                <div style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
                  Henüz çevrimiçi kullanıcı yok
                </div>
              )}
            </OnlineUsersList>
          </SectionContent>
        </CollapsibleSection>
        
        <UserProfileSection>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px' }}>
            <UserAvatar $avatarUrl={user?.avatar} $size="32px">
              {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </UserAvatar>
            <UserProfileInfo>
              <UserProfileName onClick={() => onUserClick && onUserClick(user)}>
                {user?.displayName || user?.username}
              </UserProfileName>
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
          </div>
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