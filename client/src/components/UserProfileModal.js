import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, User, MessageCircle, Users, UserPlus, UserCheck, UserX, Lock, Unlock } from 'lucide-react';
import SERVER_URL from '../config';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ModalContent = styled.div`
  background: #36393f;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  border: 1px solid #202225;
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #40444b;
  border: none;
  color: #dcddde;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4f545c;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #202225;
`;

const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: 700;
  border: 3px solid #7289da;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const DisplayName = styled.h2`
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Username = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0 0 8px 0;
`;

const UserStats = styled.div`
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #96989d;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.$variant === 'follow') return '#7289da';
    if (props.$variant === 'unfollow') return '#ed4245';
    if (props.$variant === 'message') return '#3ba55c';
    if (props.$variant === 'request') return '#faa61a';
    return '#40444b';
  }};
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120px;
  justify-content: center;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
    min-width: 100px;
  }
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FollowersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const FollowerItem = styled.div`
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

const FollowerAvatar = styled.div`
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

const FollowerInfo = styled.div`
  flex: 1;
`;

const FollowerName = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const FollowerStatus = styled.div`
  color: #96989d;
  font-size: 12px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isOnline ? '#3ba55c' : '#96989d'};
  flex-shrink: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #96989d;
  font-size: 14px;
  padding: 20px;
`;

const UserProfileModal = ({ 
  isOpen, 
  onClose, 
  targetUser, 
  currentUser, 
  socket,
  onSendPrivateMessage 
}) => {
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    hasRequestSent: false,
    hasRequestReceived: false,
    isPrivate: false
  });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && targetUser && currentUser) {
      fetchFollowStatus();
      fetchFollowers();
      fetchFollowing();
    }
  }, [isOpen, targetUser, currentUser]);

  const fetchFollowStatus = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/status/${currentUser.username}/${targetUser.username}`);
      const data = await response.json();
      setFollowStatus(data);
    } catch (error) {
      console.error('Takip durumu getirme hatası:', error);
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/followers/${targetUser.username}`);
      const data = await response.json();
      setFollowers(data.followers || []);
    } catch (error) {
      console.error('Takipçi listesi hatası:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/following/${targetUser.username}`);
      const data = await response.json();
      setFollowing(data.following || []);
    } catch (error) {
      console.error('Takip edilenler hatası:', error);
    }
  };

  const handleFollowRequest = async () => {
    if (!socket || !currentUser || !targetUser) return;
    
    setIsLoading(true);
    try {
      socket.emit('follow_request', {
        fromUsername: currentUser.username,
        toUsername: targetUser.username
      });
      
      // Optimistic update
      setFollowStatus(prev => ({ ...prev, hasRequestSent: true }));
    } catch (error) {
      console.error('Takip isteği hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername: targetUser.username,
          toUsername: currentUser.username
        })
      });
      
      if (response.ok) {
        setFollowStatus(prev => ({ 
          ...prev, 
          hasRequestReceived: false, 
          isFollowing: true 
        }));
        fetchFollowers();
        fetchFollowing();
      }
    } catch (error) {
      console.error('Takip kabul hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/unfollow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername: currentUser.username,
          toUsername: targetUser.username
        })
      });
      
      if (response.ok) {
        setFollowStatus(prev => ({ ...prev, isFollowing: false }));
        fetchFollowers();
        fetchFollowing();
      }
    } catch (error) {
      console.error('Takip bırakma hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername: targetUser.username,
          toUsername: currentUser.username
        })
      });
      
      if (response.ok) {
        setFollowStatus(prev => ({ ...prev, hasRequestReceived: false }));
      }
    } catch (error) {
      console.error('Takip red hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (onSendPrivateMessage) {
      onSendPrivateMessage(targetUser);
    }
    onClose();
  };

  const getActionButton = () => {
    if (currentUser.username === targetUser.username) {
      return null; // Kendi profilinde buton gösterme
    }

    if (followStatus.hasRequestReceived) {
      return (
        <>
          <ActionButton onClick={handleFollow} disabled={isLoading}>
            <UserCheck size={16} />
            Kabul Et
          </ActionButton>
          <ActionButton onClick={handleReject} disabled={isLoading}>
            <UserX size={16} />
            Reddet
          </ActionButton>
        </>
      );
    }

    if (followStatus.isFollowing) {
      return (
        <>
          <ActionButton 
            $variant="unfollow" 
            onClick={handleUnfollow} 
            disabled={isLoading}
          >
            <UserX size={16} />
            Takibi Bırak
          </ActionButton>
          <ActionButton 
            $variant="message" 
            onClick={handleSendMessage}
          >
            <MessageCircle size={16} />
            Mesaj Gönder
          </ActionButton>
        </>
      );
    }

    if (followStatus.hasRequestSent) {
      return (
        <ActionButton disabled>
          <UserPlus size={16} />
          İstek Gönderildi
        </ActionButton>
      );
    }

    return (
      <ActionButton 
        $variant="follow" 
        onClick={handleFollowRequest} 
        disabled={isLoading}
      >
        <UserPlus size={16} />
        Takip Et
      </ActionButton>
    );
  };

  if (!isOpen || !targetUser) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={16} />
        </CloseButton>

        <ProfileHeader>
          <ProfileAvatar $avatarUrl={targetUser.avatar}>
            {!targetUser.avatar && (targetUser.displayName?.charAt(0) || targetUser.username?.charAt(0) || 'U').toUpperCase()}
          </ProfileAvatar>
          
          <ProfileInfo>
            <DisplayName>
              {targetUser.displayName || targetUser.username}
              {targetUser.gender === 'female' ? ' 👩' : ' 👨'}
              {targetUser.isPrivate && ' 🔒'}
            </DisplayName>
            <Username>@{targetUser.username}</Username>
            <UserStats>
              <Stat>
                <Users size={14} />
                {followers.length} takipçi
              </Stat>
              <Stat>
                <User size={14} />
                {following.length} takip
              </Stat>
            </UserStats>
          </ProfileInfo>
        </ProfileHeader>

        <ActionButtons>
          {getActionButton()}
        </ActionButtons>

        <Section>
          <SectionTitle>
            <Users size={16} />
            Takipçiler ({followers.length})
          </SectionTitle>
          {followers.length > 0 ? (
            <FollowersList>
              {followers.map((follower) => (
                <FollowerItem key={follower.username}>
                  <FollowerAvatar $avatarUrl={follower.avatar}>
                    {!follower.avatar && (follower.displayName?.charAt(0) || follower.username?.charAt(0) || 'U').toUpperCase()}
                  </FollowerAvatar>
                  <FollowerInfo>
                    <FollowerName>
                      {follower.displayName || follower.username}
                      {follower.gender === 'female' ? ' 👩' : ' 👨'}
                    </FollowerName>
                    <FollowerStatus>@{follower.username}</FollowerStatus>
                  </FollowerInfo>
                  <StatusIndicator $isOnline={follower.isOnline} />
                </FollowerItem>
              ))}
            </FollowersList>
          ) : (
            <EmptyState>
              Henüz takipçi yok
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionTitle>
            <User size={16} />
            Takip Edilenler ({following.length})
          </SectionTitle>
          {following.length > 0 ? (
            <FollowersList>
              {following.map((followed) => (
                <FollowerItem key={followed.username}>
                  <FollowerAvatar $avatarUrl={followed.avatar}>
                    {!followed.avatar && (followed.displayName?.charAt(0) || followed.username?.charAt(0) || 'U').toUpperCase()}
                  </FollowerAvatar>
                  <FollowerInfo>
                    <FollowerName>
                      {followed.displayName || followed.username}
                      {followed.gender === 'female' ? ' 👩' : ' 👨'}
                    </FollowerName>
                    <FollowerStatus>@{followed.username}</FollowerStatus>
                  </FollowerInfo>
                  <StatusIndicator $isOnline={followed.isOnline} />
                </FollowerItem>
              ))}
            </FollowersList>
          ) : (
            <EmptyState>
              Henüz kimseyi takip etmiyor
            </EmptyState>
          )}
        </Section>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UserProfileModal; 