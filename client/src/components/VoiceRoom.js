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
  0% { box-shadow: 0 0 5px rgba(64, 224, 208, 0.5); }
  50% { box-shadow: 0 0 20px rgba(64, 224, 208, 0.8); }
  100% { box-shadow: 0 0 5px rgba(64, 224, 208, 0.5); }
`;

const VoiceRoomContainer = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 70%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 30%, rgba(64, 224, 208, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(255, 105, 180, 0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const VoiceRoomHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 24px;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 16px 20px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  
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
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const VoiceButton = styled.button`
  background: ${props => {
    if (props.variant === 'mute') {
      return props.isMuted 
        ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' 
        : 'linear-gradient(135deg, #8a2be2, #40e0d0)';
    } else if (props.variant === 'volume') {
      return props.isMuted 
        ? 'linear-gradient(135deg, #ff6b6b, #ee5a24)' 
        : 'linear-gradient(135deg, #8a2be2, #40e0d0)';
    } else if (props.variant === 'leave') {
      return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    } else {
      return 'linear-gradient(135deg, #8a2be2, #40e0d0)';
    }
  }};
  color: #ffffff;
  border: none;
  border-radius: 16px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  min-width: 48px;
  min-height: 48px;
  
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
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
    min-width: 44px;
    min-height: 44px;
  }
`;

const VolumeSlider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 8px 12px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 6px;
  }
`;

const VolumeInput = styled.input`
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8a2be2, #40e0d0);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8a2be2, #40e0d0);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 80px;
  }
`;

const UsersContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  overflow-y: auto;
  padding: 20px;
  background: rgba(15, 15, 35, 0.5);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 2px solid rgba(138, 43, 226, 0.2);
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
`;

const UserCard = styled.div`
  background: rgba(15, 15, 35, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(138, 43, 226, 0.1), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    border-color: rgba(64, 224, 208, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }
  
  ${props => props.isSpeaking && `
    animation: ${glow} 2s infinite;
    border-color: rgba(64, 224, 208, 0.5);
  `}
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(138, 43, 226, 0.3);
  animation: ${pulse} 2s infinite;
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  color: #40e0d0;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const UserStatus = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const StatusIcon = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.status === 'speaking') return '#40e0d0';
    if (props.status === 'muted') return '#ff6b6b';
    if (props.status === 'volume-muted') return '#ffa500';
    return '#8a2be2';
  }};
  animation: ${props => props.status === 'speaking' ? pulse : 'none'} 1s infinite;
`;

const VoiceMonitor = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 15, 35, 0.98);
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 30px;
  border: 2px solid rgba(138, 43, 226, 0.3);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.8);
  z-index: 2000;
  width: 90vw;
  max-width: 400px;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    padding: 24px;
    width: 95vw;
    max-width: 350px;
  }
`;

const VoiceMonitorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const VoiceMonitorTitle = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const VoiceMonitorContent = styled.div`
  text-align: center;
`;

const VoiceLevel = styled.div`
  width: 100%;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  margin-bottom: 20px;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    height: 50px;
    margin-bottom: 16px;
  }
`;

const VoiceLevelBar = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #8a2be2, #40e0d0);
  width: ${props => props.level}%;
  transition: width 0.1s ease;
  border-radius: 16px;
`;

const VoiceLevelText = styled.div`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1999;
  cursor: pointer;
`;

const VoiceRoom = ({ socket, user, activeUsers }) => {
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showVoiceMonitor, setShowVoiceMonitor] = useState(false);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceRoomUsers, setVoiceRoomUsers] = useState([]);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(null);
  const [animationId, setAnimationId] = useState(null);
  const userVideo = useRef();
  const peersRef = useRef({});

  useEffect(() => {
    if (!socket) return;

    socket.on('user_joined_voice', (userId) => {
      console.log('Kullanıcı sesli odaya katıldı:', userId);
      if (stream) {
        const peer = createPeer(userId, socket.id, stream);
        peersRef.current[userId] = peer;
        setPeers(prev => ({ ...prev, [userId]: peer }));
      }
    });

    socket.on('receiving_returned_signal', (payload) => {
      const peer = peersRef.current[payload.id];
      if (peer) {
        peer.signal(payload.signal);
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
      }
    });

    socket.on('voice_room_users', (data) => {
      console.log('Sesli oda kullanıcıları:', data.users);
      setVoiceRoomUsers(data.users);
    });

    socket.on('user_speaking_update', (data) => {
      console.log('Kullanıcı konuşma durumu:', data);
      setVoiceRoomUsers(prev => 
        prev.map(user => 
          user.id === data.userId 
            ? { ...user, isSpeaking: data.isSpeaking }
            : user
        )
      );
    });

    socket.on('user_voice_status_update', (data) => {
      console.log('Kullanıcı ses durumu:', data);
      setVoiceRoomUsers(prev => 
        prev.map(user => 
          user.id === data.userId 
            ? { ...user, isMuted: data.isMuted, isVolumeMuted: data.isVolumeMuted }
            : user
        )
      );
    });

    return () => {
      socket.off('user_joined_voice');
      socket.off('receiving_returned_signal');
      socket.off('user_left_voice');
      socket.off('voice_room_users');
      socket.off('user_speaking_update');
      socket.off('user_voice_status_update');
    };
  }, [socket, stream]);

  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socket.emit('sending_signal', { userToSignal, callerId, signal });
    });

    return peer;
  };

  const addPeer = (incomingSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socket.emit('returning_signal', { signal, callerId });
    });

    peer.signal(incomingSignal);
    return peer;
  };

  const joinVoiceRoom = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }

      socket.emit('join_voice_room', { room: 'voice' });
      
      // Ses seviyesi izlemeyi başlat
      startVoiceMonitoring(mediaStream);
      
      // Ses durumunu diğer kullanıcılara bildir
      socket.emit('user_voice_status', {
        isMuted: isMuted,
        isVolumeMuted: isVolumeMuted
      });
      
    } catch (error) {
      console.error('Mikrofon erişimi hatası:', error);
      alert('Mikrofon erişimi gerekli! Lütfen mikrofon iznini verin.');
    }
  };

  const leaveVoiceRoom = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    peersRef.current = {};
    setPeers({});
    
    socket.emit('leave_voice_room', { room: 'voice' });
    
    stopVoiceMonitoring();
    setIsSpeaking(false);
  };

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMutedState = !audioTrack.enabled;
        setIsMuted(newMutedState);
        
        // Konuşma durumunu sıfırla
        setIsSpeaking(false);
        socket.emit('user_speaking', { isSpeaking: false });
        
        // Ses durumunu diğer kullanıcılara bildir
        socket.emit('user_voice_status', {
          isMuted: newMutedState,
          isVolumeMuted: isVolumeMuted
        });
      }
    }
  };

  const toggleVolume = () => {
    const newVolumeMutedState = !isVolumeMuted;
    setIsVolumeMuted(newVolumeMutedState);
    
    // Ses durumunu diğer kullanıcılara bildir
    socket.emit('user_voice_status', {
      isMuted: isMuted,
      isVolumeMuted: newVolumeMutedState
    });
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsVolumeMuted(newVolume === 0);
  };

  const testSound = () => {
    if (stream) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      setTimeout(() => {
        source.disconnect();
        gainNode.disconnect();
        audioContext.close();
      }, 1000);
    }
  };

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const startVoiceMonitoring = (mediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(mediaStream);
      
      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyserNode);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArray);
      
      const updateVoiceLevel = () => {
        if (analyserNode && !isMuted) {
          analyserNode.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const level = Math.min(100, (average / 128) * 100);
          
          setVoiceLevel(level);
          
          // Konuşma durumunu güncelle
          const speaking = level > 10;
          if (speaking !== isSpeaking) {
            setIsSpeaking(speaking);
            socket.emit('user_speaking', { isSpeaking: speaking });
          }
          
          const animationId = requestAnimationFrame(updateVoiceLevel);
          setAnimationId(animationId);
        } else {
          setVoiceLevel(0);
          if (isSpeaking) {
            setIsSpeaking(false);
            socket.emit('user_speaking', { isSpeaking: false });
          }
          const animationId = requestAnimationFrame(updateVoiceLevel);
          setAnimationId(animationId);
        }
      };
      
      updateVoiceLevel();
    } catch (error) {
      console.error('Ses izleme hatası:', error);
    }
  };

  const stopVoiceMonitoring = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
    
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    
    setAnalyser(null);
    setDataArray(null);
    setVoiceLevel(0);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [animationId, audioContext]);

  const getVoiceStatus = (user) => {
    if (user.isMuted) return 'muted';
    if (user.isVolumeMuted) return 'volume-muted';
    if (user.isSpeaking) return 'speaking';
    return 'normal';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'speaking': return 'Konuşuyor';
      case 'muted': return 'Sessiz';
      case 'volume-muted': return 'Ses Kapalı';
      default: return 'Çevrimiçi';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'speaking': return <Mic size={16} />;
      case 'muted': return <MicOff size={16} />;
      case 'volume-muted': return <VolumeX size={16} />;
      default: return <Volume2 size={16} />;
    }
  };

  const allUsers = [
    { id: socket?.id, username: user?.username, isMuted, isVolumeMuted, isSpeaking },
    ...voiceRoomUsers.filter(u => u.id !== socket?.id)
  ];

  return (
    <VoiceRoomContainer>
      <VoiceRoomHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mic size={20} style={{ color: '#40e0d0' }} />
          <span>Sesli Sohbet</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} style={{ color: '#40e0d0' }} />
          <span>{allUsers.length} kullanıcı</span>
        </div>
      </VoiceRoomHeader>

      <VoiceControls>
        {!stream ? (
          <VoiceButton onClick={joinVoiceRoom}>
            <Mic size={18} />
            <span className="hide-on-mobile">Odaya Katıl</span>
          </VoiceButton>
        ) : (
          <>
            <VoiceButton 
              variant="mute" 
              isMuted={isMuted} 
              onClick={toggleMute}
            >
              {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              <span className="hide-on-mobile">
                {isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              </span>
            </VoiceButton>

            <VoiceButton 
              variant="volume" 
              isMuted={isVolumeMuted} 
              onClick={toggleVolume}
            >
              {isVolumeMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="hide-on-mobile">
                {isVolumeMuted ? 'Sesi Aç' : 'Sesi Kapat'}
              </span>
            </VoiceButton>

            {showVolumeSlider && (
              <VolumeSlider>
                <Volume2 size={16} style={{ color: '#40e0d0' }} />
                <VolumeInput
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
                <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '600' }}>
                  {Math.round(volume * 100)}%
                </span>
              </VolumeSlider>
            )}

            <VoiceButton onClick={toggleVolumeSlider}>
              <Volume2 size={18} />
              <span className="hide-on-mobile">Ses Seviyesi</span>
            </VoiceButton>

            <VoiceButton variant="leave" onClick={leaveVoiceRoom}>
              <LogOut size={18} />
              <span className="hide-on-mobile">Odadan Ayrıl</span>
            </VoiceButton>
          </>
        )}
      </VoiceControls>

      <UsersContainer>
        {allUsers.map((user) => {
          const status = getVoiceStatus(user);
          return (
            <UserCard 
              key={user.id} 
              isSpeaking={status === 'speaking'}
            >
              <UserHeader>
                <UserAvatar>
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </UserAvatar>
                <UserInfo>
                  <Username>{user.username || 'Bilinmeyen Kullanıcı'}</Username>
                  <UserStatus>
                    <StatusIcon status={status} />
                    {getStatusText(status)}
                  </UserStatus>
                </UserInfo>
                <div style={{ color: '#40e0d0' }}>
                  {getStatusIcon(status)}
                </div>
              </UserHeader>
            </UserCard>
          );
        })}
      </UsersContainer>

      {showVoiceMonitor && (
        <>
          <Overlay onClick={() => setShowVoiceMonitor(false)} />
          <VoiceMonitor>
            <VoiceMonitorHeader>
              <VoiceMonitorTitle>Ses Monitörü</VoiceMonitorTitle>
              <CloseButton 
                onClick={() => setShowVoiceMonitor(false)}
                onMouseDown={(e) => e.stopPropagation()}
              >
                ✕
              </CloseButton>
            </VoiceMonitorHeader>
            <VoiceMonitorContent>
              <VoiceLevel>
                <VoiceLevelBar level={voiceLevel} />
              </VoiceLevel>
              <VoiceLevelText>
                Ses Seviyesi: {Math.round(voiceLevel)}%
              </VoiceLevelText>
            </VoiceMonitorContent>
          </VoiceMonitor>
        </>
      )}

      <video 
        ref={userVideo} 
        autoPlay 
        muted 
        style={{ display: 'none' }} 
      />
    </VoiceRoomContainer>
  );
};

export default VoiceRoom; 