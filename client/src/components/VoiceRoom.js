import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Mic, MicOff, Volume2, VolumeX, Users, LogOut } from 'lucide-react';
import Peer from 'simple-peer';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
  50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8); }
  100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.5); }
`;

const VoiceRoomContainer = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const VoiceRoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 16px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 16px;
  }
`;

const VoiceControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const VoiceButton = styled.button`
  background: ${props => {
    if (props.variant === 'mute') {
      return props.isMuted 
        ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' 
        : 'linear-gradient(135deg, #4ecdc4, #44a08d)';
    } else if (props.variant === 'volume') {
      return props.isMuted 
        ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' 
        : 'linear-gradient(135deg, #4ecdc4, #44a08d)';
    } else if (props.variant === 'leave') {
      return 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
    } else {
      return 'linear-gradient(135deg, #667eea, #764ba2)';
    }
  }};
  color: white;
  border: none;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  min-width: 48px;
  min-height: 48px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
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
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    min-width: 44px;
    min-height: 44px;
    padding: 10px;
  }
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 6px;
  }
`;

const VolumeIcon = styled.div`
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
`;

const VolumeSliderInline = styled.input`
  width: 80px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 60px;
  }
`;

const TestSoundButton = styled.button`
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  min-width: 48px;
  min-height: 48px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  font-weight: 600;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    animation: ${pulse} 0.5s ease;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    min-width: 44px;
    min-height: 44px;
    font-size: 13px;
    padding: 10px 12px;
    gap: 4px;
  }
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.8s ease-out;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const UserName = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const UserStatus = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    gap: 6px;
  }
`;

const StatusIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.isMuted 
    ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' 
    : 'linear-gradient(135deg, #4ecdc4, #44a08d)'};
  box-shadow: 0 0 10px ${props => props.isMuted ? 'rgba(255, 107, 107, 0.5)' : 'rgba(78, 205, 196, 0.5)'};
  animation: ${glow} 2s infinite;
`;

const UsersList = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 1s ease-out;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const UsersHeader = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 14px;
    gap: 6px;
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding-left: 8px;
    padding-right: 8px;
  }
  
  @media (max-width: 768px) {
    gap: 8px;
    padding: 8px 0;
    font-size: 13px;
  }
`;

const UserDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'speaking') {
      return 'linear-gradient(135deg, #43b581, #3ca374)';
    } else if (props.status === 'muted') {
      return 'linear-gradient(135deg, #f04747, #d84040)';
    } else if (props.status === 'deafened') {
      return 'linear-gradient(135deg, #747f8d, #5f6a7a)';
    } else {
      return 'linear-gradient(135deg, #4ecdc4, #44a08d)';
    }
  }};
  box-shadow: 0 0 8px ${props => {
    if (props.status === 'speaking') {
      return 'rgba(67, 181, 129, 0.5)';
    } else if (props.status === 'muted') {
      return 'rgba(240, 71, 71, 0.5)';
    } else if (props.status === 'deafened') {
      return 'rgba(116, 127, 141, 0.5)';
    } else {
      return 'rgba(78, 205, 196, 0.5)';
    }
  }};
  animation: ${props => props.status === 'speaking' ? pulse : 'none'} 1s infinite;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px solid ${props => {
      if (props.status === 'speaking') {
        return 'rgba(67, 181, 129, 0.3)';
      } else if (props.status === 'muted') {
        return 'rgba(240, 71, 71, 0.3)';
      } else if (props.status === 'deafened') {
        return 'rgba(116, 127, 141, 0.3)';
      } else {
        return 'rgba(78, 205, 196, 0.3)';
      }
    }};
    animation: ${props => props.status === 'speaking' ? pulse : 'none'} 1.5s infinite;
  }
`;

const UserStatusIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  
  @media (max-width: 768px) {
    font-size: 11px;
    gap: 3px;
  }
`;

const VolumeSlider = styled.div`
  position: absolute;
  top: -100px;
  right: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 220px;
  z-index: 1000;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`;

const VolumeSliderContainer = styled.div`
  position: relative;
`;

const Slider = styled.input`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;
  margin: 12px 0;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }
  
  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }
`;

const VolumeLabel = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
`;

const VolumeValue = styled.span`
  color: #667eea;
  font-weight: 700;
  font-size: 16px;
`;

const VoiceRoom = ({ socket, currentUser, roomName }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(1.0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  const peersRef = useRef({});
  const testAudioRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Aktif kullanıcıları al
    socket.on('active_users', (users) => {
      setActiveUsers(users);
    });

    // Sesli oda kullanıcıları
    socket.on('voice_room_users', (data) => {
      setActiveUsers(data.users);
    });

    // WebRTC sinyalleri
    socket.on('user_joined_voice', (userId) => {
      console.log('Yeni kullanıcı sesli odaya katıldı:', userId);
      if (localStream) {
        const peer = createPeer(userId, socket.id, localStream);
        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    });

    socket.on('receiving_returned_signal', ({ id, signal }) => {
      const peer = peersRef.current[id];
      if (peer) {
        peer.signal(signal);
      }
    });

    socket.on('user_left_voice', (userId) => {
      console.log('Kullanıcı sesli odadan ayrıldı:', userId);
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[userId];
          return newStreams;
        });
      }
    });

    return () => {
      socket.off('active_users');
      socket.off('voice_room_users');
      socket.off('user_joined_voice');
      socket.off('receiving_returned_signal');
      socket.off('user_left_voice');
    };
  }, [socket, localStream]);

  const createPeer = (userToSignal, callerId, stream) => {
    console.log('Creating peer for:', userToSignal);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', signal => {
      console.log('Sending signal to:', userToSignal);
      socket.emit('sending_signal', { userToSignal, callerId, signal });
    });

    peer.on('stream', remoteStream => {
      console.log('Received remote stream from:', userToSignal);
      setRemoteStreams(prev => ({ ...prev, [userToSignal]: remoteStream }));
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
    });

    peer.on('connect', () => {
      console.log('Peer connected:', userToSignal);
    });

    return peer;
  };

  const joinVoiceRoom = async () => {
    try {
      console.log('Joining voice room...');
      
      // Önce mevcut izinleri kontrol et
      const permissions = await navigator.permissions.query({ name: 'microphone' });
      console.log('Microphone permission state:', permissions.state);
      
      if (permissions.state === 'denied') {
        alert('Mikrofon izni reddedildi. Tarayıcı ayarlarından mikrofon iznini etkinleştirin.');
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      });
      
      console.log('Got local stream:', stream);
      setLocalStream(stream);
      
      if (socket) {
        socket.emit('join_voice_room', { roomId: 'general' });
        console.log('Emitted join_voice_room');
      }
    } catch (error) {
      console.error('Mikrofon erişimi hatası:', error);
      if (error.name === 'NotAllowedError') {
        alert('Mikrofon izni gerekli! Lütfen mikrofon erişimine izin verin.');
      } else if (error.name === 'NotFoundError') {
        alert('Mikrofon bulunamadı! Lütfen mikrofonunuzun bağlı olduğundan emin olun.');
      } else {
        alert('Mikrofon erişimi hatası: ' + error.message);
      }
    }
  };

  const leaveVoiceRoom = () => {
    if (socket) {
      socket.emit('leave_voice_room', { roomId: 'general' });
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVolume = () => {
    setIsVolumeMuted(!isVolumeMuted);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeLevel(newVolume);
    
    // Tüm audio elementlerinin ses seviyesini güncelle
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = newVolume;
    });
  };

  const testSound = () => {
    if (testAudioRef.current) {
      testAudioRef.current.currentTime = 0;
      testAudioRef.current.volume = volumeLevel;
      testAudioRef.current.play().catch(err => {
        console.error('Test sesi çalınamadı:', err);
      });
    }
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const getVoiceStatus = (user) => {
    if (user.id === currentUser?.id) {
      if (isMuted) return 'muted';
      return 'connected';
    }
    
    // Diğer kullanıcılar için varsayılan olarak connected
    // Gerçek uygulamada bu bilgi server'dan gelir
    return 'connected';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'speaking':
        return 'Konuşuyor';
      case 'muted':
        return 'Sessiz';
      case 'deafened':
        return 'Sağır';
      default:
        return 'Bağlı';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'speaking':
        return '🎤';
      case 'muted':
        return '🔇';
      case 'deafened':
        return '🔇';
      default:
        return '��';
    }
  };

  // Otomatik olarak sesli odaya katıl
  useEffect(() => {
    joinVoiceRoom();
    
    return () => {
      leaveVoiceRoom();
    };
  }, []);

  return (
    <VoiceRoomContainer>
      <VoiceRoomHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={24} />
          <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{roomName}</span>
        </div>
        
        <VoiceControls>
          <VoiceButton
            variant="mute"
            isMuted={isMuted}
            onClick={toggleMute}
            title={isMuted ? "Mikrofonu aç" : "Mikrofonu kapat"}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </VoiceButton>
          
          <VolumeControl>
            <VolumeIcon>
              <Volume2 size={16} />
            </VolumeIcon>
            <VolumeSliderInline
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volumeLevel}
              onChange={handleVolumeChange}
              title="Ses seviyesi"
            />
            <VolumeValue>{Math.round(volumeLevel * 100)}%</VolumeValue>
          </VolumeControl>
          
          <VoiceButton
            variant="volume"
            isMuted={isVolumeMuted}
            onClick={toggleVolume}
            title={isVolumeMuted ? "Sesi aç" : "Sesi kapat"}
          >
            {isVolumeMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </VoiceButton>
          
          <TestSoundButton
            onClick={testSound}
            title="Test sesi çal"
          >
            🔊
            <span className="hide-on-mobile">Ses Testi</span>
          </TestSoundButton>
          
          <VoiceButton
            variant="leave"
            onClick={leaveVoiceRoom}
            title="Sesli odadan ayrıl"
          >
            <LogOut size={20} />
          </VoiceButton>
        </VoiceControls>
      </VoiceRoomHeader>
      
      <UserInfoSection>
        <UserAvatar>
          {currentUser?.username?.charAt(0) || 'U'}
        </UserAvatar>
        <UserDetails>
          <UserName>{currentUser?.username || 'Kullanıcı'}</UserName>
          <UserStatus>
            <StatusIndicator isMuted={isMuted} />
            {isMuted ? 'Mikrofon kapalı' : 'Mikrofon açık'}
            {isVolumeMuted && ' • Ses kapalı'}
          </UserStatus>
        </UserDetails>
      </UserInfoSection>
      
      <UsersList>
        <UsersHeader>
          <Users size={18} />
          Odadaki Kullanıcılar ({activeUsers.length})
        </UsersHeader>
        
        {activeUsers.map((user) => {
          const voiceStatus = getVoiceStatus(user);
          return (
            <UserItem key={user.id}>
              <UserDot status={voiceStatus} />
              <span>{user.username}</span>
              {user.id === currentUser?.id && ' (Sen)'}
              <UserStatusIcon>
                <span>{getStatusIcon(voiceStatus)}</span>
                <span>{getStatusText(voiceStatus)}</span>
              </UserStatusIcon>
            </UserItem>
          );
        })}
        
        {activeUsers.length === 0 && (
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
            Henüz kimse odada değil
          </div>
        )}
      </UsersList>

      {/* Test sesi için gizli audio elementi */}
      <audio
        ref={testAudioRef}
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
        preload="auto"
      />

      {/* Ses çalma için gizli audio elementleri */}
      {Object.keys(remoteStreams).map(userId => (
        <audio
          key={userId}
          autoPlay
          playsInline
          muted={isVolumeMuted}
          ref={node => {
            if (node) {
              node.srcObject = remoteStreams[userId];
              // Ses seviyesini ayarla
              node.volume = volumeLevel;
              // Hata durumunda log
              node.onerror = (e) => console.error('Audio error:', e);
              node.onloadedmetadata = () => console.log('Audio loaded for user:', userId);
            }
          }}
        />
      ))}
      
      {/* Debug bilgileri */}
      <div style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>Remote Streams: {Object.keys(remoteStreams).length}</div>
        <div>Peers: {Object.keys(peers).length}</div>
        <div>Volume Muted: {isVolumeMuted ? 'Yes' : 'No'}</div>
        <div>Volume Level: {Math.round(volumeLevel * 100)}%</div>
        <div>Local Stream: {localStream ? 'Active' : 'None'}</div>
      </div>
    </VoiceRoomContainer>
  );
};

export default VoiceRoom; 