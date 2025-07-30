import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Mic, MicOff, Volume2, VolumeX, Users, LogOut } from 'lucide-react';
import Peer from 'simple-peer';

const VoiceRoomContainer = styled.div`
  flex: 1;
  background: #2f3136;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const VoiceRoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 24px;
`;

const VoiceControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
`;

const VoiceButton = styled.button`
  background: ${props => props.variant === 'mute' ? (props.isMuted ? '#dc3545' : '#28a745') : 
                props.variant === 'volume' ? (props.isMuted ? '#dc3545' : '#28a745') : 
                props.variant === 'leave' ? '#dc3545' : '#40444b'};
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-width: 48px;
  min-height: 48px;
  
  &:hover {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #40444b;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #0099cc);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  text-transform: uppercase;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 16px;
`;

const UserStatus = styled.span`
  color: #96989d;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.isMuted ? '#dc3545' : '#28a745'};
`;

const UsersList = styled.div`
  background: #40444b;
  border-radius: 8px;
  padding: 16px;
`;

const UsersHeader = styled.div`
  color: #96989d;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  color: #dcddde;
  font-size: 14px;
`;

const UserDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #43b581;
`;

const VolumeSlider = styled.div`
  position: absolute;
  top: -80px;
  right: 0;
  background: #40444b;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  z-index: 1000;
`;

const VolumeSliderContainer = styled.div`
  position: relative;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #202225;
  outline: none;
  -webkit-appearance: none;
  margin: 8px 0;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #00d4ff;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #00d4ff;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const VolumeLabel = styled.div`
  color: #96989d;
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VolumeValue = styled.span`
  color: #00d4ff;
  font-weight: 600;
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
  const peersRef = useRef({});

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
  }, [socket, localStream, createPeer]);

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

  const addPeer = (incomingSignal, callerId, stream) => {
    console.log('Adding peer for:', callerId);
    const peer = new Peer({
      initiator: false,
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
      console.log('Returning signal to:', callerId);
      socket.emit('returning_signal', { signal, callerId });
    });

    peer.on('stream', remoteStream => {
      console.log('Received remote stream from:', callerId);
      setRemoteStreams(prev => ({ ...prev, [callerId]: remoteStream }));
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
    });

    peer.on('connect', () => {
      console.log('Peer connected:', callerId);
    });

    peer.signal(incomingSignal);
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

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  // Otomatik olarak sesli odaya katıl
  useEffect(() => {
    joinVoiceRoom();
    
    return () => {
      leaveVoiceRoom();
    };
  }, [joinVoiceRoom, leaveVoiceRoom]);

  return (
    <VoiceRoomContainer>
      <VoiceRoomHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={24} />
          {roomName}
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
          
          <VolumeSliderContainer>
            <VoiceButton
              variant="volume"
              isMuted={isVolumeMuted}
              onClick={toggleVolumeSlider}
              title="Ses seviyesini ayarla"
            >
              {isVolumeMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </VoiceButton>
            
            {showVolumeSlider && (
              <VolumeSlider>
                <VolumeLabel>
                  <span>Ses Seviyesi</span>
                  <VolumeValue>{Math.round(volumeLevel * 100)}%</VolumeValue>
                </VolumeLabel>
                <Slider
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volumeLevel}
                  onChange={handleVolumeChange}
                  title="Ses seviyesi"
                />
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '10px', 
                  color: '#96989d' 
                }}>
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </VolumeSlider>
            )}
          </VolumeSliderContainer>
          
          <VoiceButton
            variant="volume"
            isMuted={isVolumeMuted}
            onClick={toggleVolume}
            title={isVolumeMuted ? "Sesi aç" : "Sesi kapat"}
            style={{ background: isVolumeMuted ? '#dc3545' : '#28a745' }}
          >
            {isVolumeMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </VoiceButton>
          
          <VoiceButton
            variant="leave"
            onClick={leaveVoiceRoom}
            title="Sesli odadan ayrıl"
          >
            <LogOut size={20} />
          </VoiceButton>
          
          <VoiceButton
            variant="mute"
            onClick={() => {
              if (localStream) {
                const audioTrack = localStream.getAudioTracks()[0];
                if (audioTrack) {
                  console.log('Audio track enabled:', audioTrack.enabled);
                  console.log('Audio track muted:', audioTrack.muted);
                  console.log('Audio track readyState:', audioTrack.readyState);
                }
              }
            }}
            title="Ses durumunu kontrol et"
            style={{ background: '#40444b' }}
          >
            🔍
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
          <Users size={16} />
          Odadaki Kullanıcılar ({activeUsers.length})
        </UsersHeader>
        
        {activeUsers.map((user) => (
          <UserItem key={user.id}>
            <UserDot />
            <span>{user.username}</span>
            {user.id === currentUser?.id && ' (Sen)'}
          </UserItem>
        ))}
        
        {activeUsers.length === 0 && (
          <div style={{ color: '#96989d', fontStyle: 'italic' }}>
            Henüz kimse odada değil
          </div>
        )}
      </UsersList>

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