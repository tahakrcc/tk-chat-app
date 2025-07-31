import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Send, ArrowLeft, MessageCircle, Users, User } from 'lucide-react';
import SERVER_URL from '../config';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PrivateChatContainer = styled.div`
  flex: 1;
  background: #36393f;
  display: flex;
  flex-direction: column;
  height: 100vh;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    height: calc(100vh - 120px);
  }
`;

const Header = styled.div`
  background: #292b2f;
  border-bottom: 1px solid #202225;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: #dcddde;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #40444b;
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h2`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const HeaderSubtitle = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const ConversationsList = styled.div`
  width: 300px;
  background: #2f3136;
  border-right: 1px solid #202225;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    display: ${props => props.$showChat ? 'none' : 'flex'};
  }
`;

const ConversationsHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const ConversationsTitle = styled.h3`
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const ConversationsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ConversationItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #202225;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #40444b;
  }
  
  ${props => props.$isActive && `
    background: #40444b;
    border-left: 3px solid #7289da;
  `}
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const ConversationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
`;

const ConversationAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$avatarUrl ? `url(${props.$avatarUrl}) center/cover` : 'linear-gradient(135deg, #7289da, #5865f2)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ConversationName = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ConversationLastMessage = styled.div`
  color: #96989d;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
`;

const UnreadBadge = styled.div`
  background: #ed4245;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  position: absolute;
  top: 8px;
  right: 8px;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: ${props => props.$showChat ? 'flex' : 'none'};
  }
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const MessageContainer = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: ${props => props.$isOwn ? 'row-reverse' : 'row'};
  gap: 12px;
`;

const MessageBubble = styled.div`
  background: ${props => props.$isOwn ? '#7289da' : '#40444b'};
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 18px;
  max-width: 70%;
  word-wrap: break-word;
  
  @media (max-width: 768px) {
    max-width: 85%;
    padding: 10px 14px;
  }
`;

const MessageTime = styled.div`
  color: #96989d;
  font-size: 11px;
  margin-top: 4px;
  text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

const MessageInputContainer = styled.div`
  background: #292b2f;
  border-top: 1px solid #202225;
  padding: 16px 20px;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #40444b;
  border-radius: 8px;
  border: 1px solid #202225;
  padding: 12px 16px;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: #7289da;
    box-shadow: 0 0 0 2px rgba(114, 137, 218, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
  }
`;

const MessageInput = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  color: #dcddde;
  font-size: 16px;
  font-family: inherit;
  resize: none;
  outline: none;
  min-height: 20px;
  max-height: 120px;
  line-height: 1.4;
  
  &::placeholder {
    color: #72767d;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const SendButton = styled.button`
  background: #7289da;
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  
  &:hover {
    background: #5865f2;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #40444b;
    color: #72767d;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #96989d;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const EmptySubtitle = styled.p`
  color: #96989d;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const FriendsSection = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
`;

const FriendsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const FriendsTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const FriendsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FriendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #40444b;
  border-radius: 6px;
  cursor: pointer;
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

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$isOnline ? '#43b581' : '#ed4245'};
`;

const TypingIndicator = styled.div`
  color: #96989d;
  font-size: 12px;
  font-style: italic;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActiveUsersBar = styled.div`
  background: #2f3136;
  border-left: 1px solid #202225;
  width: 240px;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ActiveUsersTitle = styled.h3`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #202225;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #40444b;
  }
`;

const UserItemAvatar = styled.div`
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

const UserItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserItemName = styled.div`
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserItemStatus = styled.div`
  color: #96989d;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PrivateChat = ({ 
  currentUser, 
  socket, 
  onBack,
  onSendPrivateMessage 
}) => {
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
      fetchFriends();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
      markMessagesAsRead();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessageReceived = (message) => {
      setMessages(prev => [...prev, message]);
      fetchConversations(); // Sohbet listesini güncelle
    };

    const handleFollowRequestReceived = (data) => {
      // Takip isteği bildirimi
      console.log('Takip isteği alındı:', data);
    };

    const handleUserTyping = (data) => {
      if (data.room === `private_${currentUser.username}_${selectedConversation?.user.username}` ||
          data.room === `private_${selectedConversation?.user.username}_${currentUser.username}`) {
        setTypingUsers(prev => {
          const filtered = prev.filter(user => user.username !== data.username);
          return [...filtered, { username: data.username, timestamp: Date.now() }];
        });
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.room === `private_${currentUser.username}_${selectedConversation?.user.username}` ||
          data.room === `private_${selectedConversation?.user.username}_${currentUser.username}`) {
        setTypingUsers(prev => prev.filter(user => user.username !== data.username));
      }
    };

    const handleUserJoined = (data) => {
      if (data.room === 'private') {
        setActiveUsers(prev => {
          const filtered = prev.filter(user => user.username !== data.user.username);
          return [...filtered, data.user];
        });
      }
    };

    const handleUserLeft = (data) => {
      if (data.room === 'private') {
        setActiveUsers(prev => prev.filter(user => user.username !== data.username));
      }
    };

    socket.on('private_message_received', handlePrivateMessageReceived);
    socket.on('follow_request_received', handleFollowRequestReceived);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.off('private_message_received', handlePrivateMessageReceived);
      socket.off('follow_request_received', handleFollowRequestReceived);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [socket, currentUser, selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/private-message/conversations/${currentUser.username}`);
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Sohbet listesi hatası:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/follow/followers/${currentUser.username}`);
      const data = await response.json();
      setFriends(data.followers || []);
    } catch (error) {
      console.error('Arkadaşlar yüklenirken hata:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(`${SERVER_URL}/api/private-message/${currentUser.username}/${selectedConversation.user.username}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Mesaj getirme hatası:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation) return;
    
    try {
      await fetch(`${SERVER_URL}/api/private-message/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUsername: selectedConversation.user.username,
          toUsername: currentUser.username
        })
      });
      
      // Sohbet listesini güncelle
      fetchConversations();
    } catch (error) {
      console.error('Mesaj okundu işaretleme hatası:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    const messageData = {
      fromUsername: currentUser.username,
      toUsername: selectedConversation.user.username,
      content: newMessage.trim()
    };

    socket.emit('private_message', messageData);
    setNewMessage('');
    
    // Yazıyor durumunu durdur
    if (isTyping) {
      setIsTyping(false);
      socket.emit('stop_typing', {
        room: `private_${currentUser.username}_${selectedConversation.user.username}`,
        username: currentUser.username
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        room: `private_${currentUser.username}_${selectedConversation?.user.username}`,
        username: currentUser.username
      });
    }
  };

  const handleInputBlur = () => {
    if (isTyping) {
      setIsTyping(false);
      socket.emit('stop_typing', {
        room: `private_${currentUser.username}_${selectedConversation?.user.username}`,
        username: currentUser.username
      });
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleFriendSelect = (friend) => {
    // Arkadaşla sohbet başlat
    const conversation = {
      user: friend,
      lastMessage: null,
      unreadCount: 0
    };
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastMessage = (message) => {
    if (!message) return 'Henüz mesaj yok';
    return message.content.length > 30 
      ? message.content.substring(0, 30) + '...' 
      : message.content;
  };

  return (
    <PrivateChatContainer>
      <Header>
        <BackButton onClick={onBack}>
          <ArrowLeft size={20} />
        </BackButton>
        <HeaderInfo>
          <HeaderTitle>Özel Mesajlar</HeaderTitle>
          <HeaderSubtitle>
            {selectedConversation 
              ? `${selectedConversation.user.displayName || selectedConversation.user.username} ile sohbet`
              : 'Sohbet listesi'
            }
          </HeaderSubtitle>
        </HeaderInfo>
      </Header>

      <Content>
        <ConversationsList $showChat={showChat}>
          <ConversationsHeader>
            <MessageCircle size={16} />
            <ConversationsTitle>Sohbetler</ConversationsTitle>
          </ConversationsHeader>
          
          <ConversationsContainer>
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.user.username}
                  $isActive={selectedConversation?.user.username === conversation.user.username}
                  onClick={() => handleConversationSelect(conversation)}
                >
                  <ConversationHeader>
                    <ConversationAvatar $avatarUrl={conversation.user.avatar}>
                      {!conversation.user.avatar && (conversation.user.displayName?.charAt(0) || conversation.user.username?.charAt(0) || 'U').toUpperCase()}
                    </ConversationAvatar>
                    <ConversationInfo>
                      <ConversationName>
                        {conversation.user.displayName || conversation.user.username}
                        {conversation.user.gender === 'female' ? ' 👩' : ' 👨'}
                      </ConversationName>
                      <ConversationLastMessage>
                        {formatLastMessage(conversation.lastMessage)}
                      </ConversationLastMessage>
                    </ConversationInfo>
                  </ConversationHeader>
                  
                  {conversation.unreadCount > 0 && (
                    <UnreadBadge>{conversation.unreadCount}</UnreadBadge>
                  )}
                </ConversationItem>
              ))
            ) : (
              <EmptyState>
                <EmptyIcon>💬</EmptyIcon>
                <EmptyTitle>Henüz sohbet yok</EmptyTitle>
                <EmptySubtitle>
                  Takip ettiğiniz kişilerle özel mesajlaşmaya başlayın
                </EmptySubtitle>
              </EmptyState>
            )}
          </ConversationsContainer>

          {/* Arkadaşlar Bölümü */}
          <FriendsSection>
            <FriendsHeader>
              <Users size={16} />
              <FriendsTitle>Arkadaşlar ({friends.length})</FriendsTitle>
            </FriendsHeader>
            <FriendsList>
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <FriendItem 
                    key={friend.username}
                    onClick={() => handleFriendSelect(friend)}
                  >
                    <FriendAvatar $avatarUrl={friend.avatar}>
                      {!friend.avatar && (friend.displayName?.charAt(0) || friend.username?.charAt(0) || 'U').toUpperCase()}
                    </FriendAvatar>
                    <FriendInfo>
                      <FriendName>
                        {friend.displayName || friend.username}
                        {friend.gender === 'female' ? ' 👩' : ' 👨'}
                      </FriendName>
                      <FriendStatus>
                        <StatusDot $isOnline={friend.isOnline} />
                        {friend.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                      </FriendStatus>
                    </FriendInfo>
                  </FriendItem>
                ))
              ) : (
                <div style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '8px 0' }}>
                  Henüz arkadaş yok
                </div>
              )}
            </FriendsList>
          </FriendsSection>
        </ConversationsList>

                 <ChatArea $showChat={showChat}>
           {selectedConversation ? (
             <>
               <MessagesArea>
                 {messages.length > 0 ? (
                   messages.map((message, index) => (
                     <MessageContainer 
                       key={index} 
                       $isOwn={message.from === currentUser.username}
                     >
                       <MessageBubble $isOwn={message.from === currentUser.username}>
                         {message.content}
                         <MessageTime $isOwn={message.from === currentUser.username}>
                           {formatTime(message.timestamp)}
                         </MessageTime>
                       </MessageBubble>
                     </MessageContainer>
                   ))
                 ) : (
                   <EmptyState>
                     <EmptyIcon>💬</EmptyIcon>
                     <EmptyTitle>Henüz mesaj yok</EmptyTitle>
                     <EmptySubtitle>
                       İlk mesajınızı göndererek sohbete başlayın
                     </EmptySubtitle>
                   </EmptyState>
                 )}
                 
                 {/* Yazıyor durumu */}
                 {typingUsers.length > 0 && (
                   <TypingIndicator>
                     <div>✏️</div>
                     <div>
                       {typingUsers.map(user => user.username).join(', ')} yazıyor...
                     </div>
                   </TypingIndicator>
                 )}
                 
                 <div ref={messagesEndRef} />
               </MessagesArea>

               <MessageInputContainer>
                 <InputWrapper>
                   <MessageInput
                     value={newMessage}
                     onChange={handleInputChange}
                     onKeyPress={handleKeyPress}
                     onBlur={handleInputBlur}
                     placeholder={`${selectedConversation.user.displayName || selectedConversation.user.username} kullanıcısına mesaj gönder...`}
                     rows={1}
                   />
                   <SendButton 
                     onClick={handleSendMessage}
                     disabled={!newMessage.trim()}
                   >
                     <Send size={16} />
                   </SendButton>
                 </InputWrapper>
               </MessageInputContainer>
             </>
           ) : (
             <EmptyState>
               <EmptyIcon>👥</EmptyIcon>
               <EmptyTitle>Sohbet seçin</EmptyTitle>
               <EmptySubtitle>
                 Sol taraftan bir sohbet seçerek mesajlaşmaya başlayın
               </EmptySubtitle>
             </EmptyState>
           )}
         </ChatArea>

         {/* Aktif Kullanıcılar Bölümü */}
         <ActiveUsersBar>
           <ActiveUsersTitle>
             <Users size={16} />
             Aktif Kullanıcılar ({activeUsers.length})
           </ActiveUsersTitle>
           <UserList>
             {activeUsers.length > 0 ? (
               activeUsers.map((user) => (
                 <UserItem key={user.username}>
                   <UserItemAvatar $avatarUrl={user.avatar}>
                     {!user.avatar && (user.displayName?.charAt(0) || user.username?.charAt(0) || 'U').toUpperCase()}
                   </UserItemAvatar>
                   <UserItemInfo>
                     <UserItemName>
                       {user.displayName || user.username}
                       {user.gender === 'female' ? ' 👩' : ' 👨'}
                     </UserItemName>
                     <UserItemStatus>
                       <StatusDot $isOnline={user.isOnline} />
                       {user.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                     </UserItemStatus>
                   </UserItemInfo>
                 </UserItem>
               ))
             ) : (
               <div style={{ color: '#72767d', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                 Henüz aktif kullanıcı yok
               </div>
             )}
           </UserList>
         </ActiveUsersBar>
      </Content>
    </PrivateChatContainer>
  );
};

export default PrivateChat; 