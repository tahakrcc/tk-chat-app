import React from 'react';
import styled from 'styled-components';
import { User, Circle } from 'lucide-react';

const UserListContainer = styled.div`
  width: 250px;
  background: white;
  border-left: 1px solid #e1e5e9;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e1e5e9;
    max-height: 150px;
    min-height: 150px;
  }
`;

const UserListHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserItem = styled.div`
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f3f4;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  ${props => props.isCurrentUser && `
    background: #e3f2fd;
    border-left: 3px solid #667eea;
  `}
`;



const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.src ? `url(${props.src}) center/cover` : '#667eea'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  position: relative;
`;

const OnlineIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: #28a745;
  border: 2px solid white;
  border-radius: 50%;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 14px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserStatus = styled.div`
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const UserList = ({ users, currentUser }) => {
  return (
    <UserListContainer>
      <UserListHeader>
        <User size={18} />
        Aktif Kullanıcılar ({users.length})
      </UserListHeader>
      
      {users.length === 0 ? (
        <EmptyState>
          Henüz kimse sohbette değil
        </EmptyState>
      ) : (
        users.map((user) => (
          <UserItem key={user.id} isCurrentUser={user.id === currentUser?.id}>
            <UserAvatar src={user.avatar}>
              {!user.avatar && <User size={20} />}
              <OnlineIndicator />
            </UserAvatar>
            
            <UserInfo>
              <Username>
                {user.username}
                {user.id === currentUser?.id && ' (Sen)'}
              </Username>
              <UserStatus>
                <Circle size={8} fill="#28a745" />
                Çevrimiçi
              </UserStatus>
            </UserInfo>
            

          </UserItem>
        ))
      )}
    </UserListContainer>
  );
};

export default UserList; 