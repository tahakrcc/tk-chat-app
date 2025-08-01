import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Mic, MicOff, Volume2, VolumeX, Users, LogOut } from 'lucide-react';
import Peer from 'simple-peer';
import 'webrtc-adapter';

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

const speakingPulse = keyframes`
  0% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.3); }
  100% { opacity: 0.4; transform: scale(0.9); }
`;

const echoLines = keyframes`
  0% { transform: scale(0.8); opacity: 0.9; }
  50% { transform: scale(1.3); opacity: 0.5; }
  100% { transform: scale(1.8); opacity: 0; }
`;

const VoiceRoomContainer = styled.div`
  flex: 1;
  background: #36393f;
  display: flex;
  flex-direction: column;
  padding: 20px;
  animation: ${fadeIn} 0.6s ease-out;
  position: relative;
  
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
  background: #292b2f;
  border-radius: 8px;
  padding: 16px 20px;
  border: 1px solid #202225;
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
  background: #40444b;
  border-radius: 8px;
  padding: 8px 12px;
  border: 1px solid #202225;
  
  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 6px;
  }
`;

const VolumeInput = styled.input`
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background: #72767d;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #7289da;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #7289da;
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
  background: #2f3136;
  border-radius: 8px;
  border: 1px solid #202225;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
`;

const UserCard = styled.div`
  background: #40444b;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #202225;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #7289da;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(114, 137, 218, 0.2);
  }
  
  ${props => props.isSpeaking && `
    animation: ${glow} 2s infinite;
    border-color: #40e0d0;
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
  position: relative;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7289da, #5865f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(114, 137, 218, 0.3);
  animation: ${pulse} 2s infinite;
  position: relative;
  
  ${props => props.isSpeaking && `
    animation: ${speakingPulse} 1s infinite;
  `}
  
  @media (max-width: 768px) {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }
`;

const EchoLines = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  ${props => props.isSpeaking && props.voiceLevel > 0 && `
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${60 + (props.voiceLevel * 0.6)}px;
      height: ${60 + (props.voiceLevel * 0.6)}px;
      border: 3px solid rgba(64, 224, 208, ${0.4 + (props.voiceLevel * 0.01)});
      border-radius: 50%;
      animation: ${echoLines} 1.2s infinite;
      box-shadow: 0 0 10px rgba(64, 224, 208, ${0.3 + (props.voiceLevel * 0.01)});
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${80 + (props.voiceLevel * 0.8)}px;
      height: ${80 + (props.voiceLevel * 0.8)}px;
      border: 2px solid rgba(64, 224, 208, ${0.3 + (props.voiceLevel * 0.008)});
      border-radius: 50%;
      animation: ${echoLines} 1.2s infinite 0.4s;
      box-shadow: 0 0 15px rgba(64, 224, 208, ${0.2 + (props.voiceLevel * 0.008)});
    }
  `}
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  color: #dcddde;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const UserStatus = styled.div`
  color: #96989d;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const SpeakingIndicator = styled.div`
  color: #40e0d0;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${speakingPulse} 1s infinite;
  text-shadow: 0 0 8px rgba(64, 224, 208, 0.6);
  background: rgba(64, 224, 208, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(64, 224, 208, 0.3);
  
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
    return '#7289da';
  }};
  animation: ${props => props.status === 'speaking' ? pulse : 'none'} 1s infinite;
`;

const VoiceMonitor = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #36393f;
  border-radius: 8px;
  padding: 30px;
  border: 1px solid #202225;
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
  background: #40444b;
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #4f545c;
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
  background: #40444b;
  border-radius: 8px;
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
  background: linear-gradient(135deg, #7289da, #5865f2);
  width: ${props => props.level}%;
  transition: width 0.1s ease;
  border-radius: 8px;
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

    const handleUserJoined = (userId) => {
      try {
        if (stream && userId !== socket.id) {
          const peer = createPeer(userId, socket.id, stream);
          if (peer) {
            peersRef.current[userId] = peer;
            setPeers(prev => ({ ...prev, [userId]: peer }));
          } else {
            console.error('Peer oluşturulamadı:', userId);
          }
        }
      } catch (error) {
        console.error('User joined error:', error);
      }
    };

    const handleSignal = (payload) => {
      try {
        const peer = peersRef.current[payload.id];
        if (peer) {
          try {
            peer.signal(payload.signal);
          } catch (error) {
            console.error('Sinyal gönderme hatası:', error);
          }
        } else if (stream && payload.id !== socket.id) {
          const newPeer = addPeer(payload.signal, payload.id, stream);
          if (newPeer) {
            peersRef.current[payload.id] = newPeer;
            setPeers(prev => ({ ...prev, [payload.id]: newPeer }));
          } else {
            console.error('Peer oluşturulamadı (sinyal ile):', payload.id);
          }
        }
      } catch (error) {
        console.error('Signal handling error:', error);
      }
    };

    const handleUserLeft = (userId) => {
      try {
        if (peersRef.current[userId]) {
          peersRef.current[userId].destroy();
          delete peersRef.current[userId];
          setPeers(prev => {
            const newPeers = { ...prev };
            delete newPeers[userId];
            return newPeers;
          });
        }
      } catch (error) {
        console.error('User left error:', error);
      }
    };

    const handleVoiceRoomUsers = (data) => {
      try {
        setVoiceRoomUsers(data.users || []);
      } catch (error) {
        console.error('Voice room users error:', error);
      }
    };

    const handleUserSpeaking = (data) => {
      try {
        setVoiceRoomUsers(prev => 
          prev.map(user => 
            user.id === data.userId 
              ? { ...user, isSpeaking: data.isSpeaking, voiceLevel: data.voiceLevel || 0 }
              : user
          )
        );
      } catch (error) {
        console.error('User speaking error:', error);
      }
    };

    const handleUserVoiceStatus = (data) => {
      try {
        setVoiceRoomUsers(prev => 
          prev.map(user => 
            user.id === data.userId 
              ? { ...user, isMuted: data.isMuted, isVolumeMuted: data.isVolumeMuted }
              : user
          )
        );
      } catch (error) {
        console.error('User voice status error:', error);
      }
    };

    socket.on('user_joined_voice', handleUserJoined);
    socket.on('receiving_returned_signal', handleSignal);
    socket.on('user_left_voice', handleUserLeft);
    socket.on('voice_room_users', handleVoiceRoomUsers);
    socket.on('user_speaking_update', handleUserSpeaking);
    socket.on('user_voice_status_update', handleUserVoiceStatus);

    return () => {
      socket.off('user_joined_voice', handleUserJoined);
      socket.off('receiving_returned_signal', handleSignal);
      socket.off('user_left_voice', handleUserLeft);
      socket.off('voice_room_users', handleVoiceRoomUsers);
      socket.off('user_speaking_update', handleUserSpeaking);
      socket.off('user_voice_status_update', handleUserVoiceStatus);
    };
  }, [socket, stream]);

  const createPeer = (userToSignal, callerId, stream) => {
    console.log('createPeer çağrıldı:', { userToSignal, callerId, hasStream: !!stream });
    
    try {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', signal => {
        console.log('Sinyal gönderiliyor:', userToSignal, 'Signal:', signal);
        if (socket && socket.connected) {
          socket.emit('sending_signal', { userToSignal, callerId, signal });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('Uzak ses akışı alındı (createPeer):', userToSignal);
        console.log('Remote stream:', remoteStream);
        
        try {
          // Uzak ses akışını oynat
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.autoplay = true;
          audio.volume = volume;
          
          // Audio element'i sakla
          peer.audioElement = audio;
          
          // Ses oynatmayı başlat
          audio.play().catch(e => {
            console.error('Ses oynatma hatası:', e);
            // Kullanıcı etkileşimi gerekebilir
            console.log('Ses oynatma için kullanıcı etkileşimi gerekebilir');
          });
        } catch (error) {
          console.error('Audio oluşturma hatası:', error);
        }
      });

      peer.on('error', (err) => {
        console.error('Peer hatası (createPeer):', err);
      });

      peer.on('close', () => {
        console.log('Peer bağlantısı kapandı (createPeer):', userToSignal);
      });

      peer.on('connect', () => {
        console.log('Peer bağlantısı kuruldu (createPeer):', userToSignal);
      });

      return peer;
    } catch (error) {
      console.error('Peer oluşturma hatası:', error);
      return null;
    }
  };

  const addPeer = (incomingSignal, callerId, stream) => {
    console.log('addPeer çağrıldı:', { callerId, hasStream: !!stream, signal: incomingSignal });
    
    try {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', signal => {
        console.log('Sinyal döndürülüyor:', callerId, 'Signal:', signal);
        if (socket && socket.connected) {
          socket.emit('returning_signal', { signal, callerId });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('Uzak ses akışı alındı (addPeer):', callerId);
        console.log('Remote stream:', remoteStream);
        
        try {
          // Uzak ses akışını oynat
          const audio = new Audio();
          audio.srcObject = remoteStream;
          audio.autoplay = true;
          audio.volume = volume;
          
          // Audio element'i sakla
          peer.audioElement = audio;
          
          // Ses oynatmayı başlat
          audio.play().catch(e => {
            console.error('Ses oynatma hatası:', e);
            // Kullanıcı etkileşimi gerekebilir
            console.log('Ses oynatma için kullanıcı etkileşimi gerekebilir');
          });
        } catch (error) {
          console.error('Audio oluşturma hatası:', error);
        }
      });

      peer.on('error', (err) => {
        console.error('Peer hatası (addPeer):', err);
      });

      peer.on('close', () => {
        console.log('Peer bağlantısı kapandı (addPeer):', callerId);
      });

      peer.on('connect', () => {
        console.log('Peer bağlantısı kuruldu (addPeer):', callerId);
      });

      peer.signal(incomingSignal);
      return peer;
    } catch (error) {
      console.error('Peer oluşturma hatası (addPeer):', error);
      return null;
    }
  };

  const joinVoiceRoom = async () => {
    try {
      console.log('Sesli odaya katılmaya çalışılıyor...');
      console.log('Socket durumu:', socket?.connected);
      console.log('Kullanıcı:', user);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
          latency: 0.01,
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true
        }
      });
      
      console.log('Mikrofon erişimi başarılı');
      setStream(mediaStream);
      
      if (userVideo.current) {
        userVideo.current.srcObject = mediaStream;
      }

      // Kullanıcı bilgilerini de gönder
      const joinData = { 
        room: 'voice',
        user: {
          id: socket.id,
          username: user.username
        }
      };
      console.log('join_voice_room gönderiliyor:', joinData);
      socket.emit('join_voice_room', joinData);
      
      // Ses seviyesi izlemeyi başlat
      startVoiceMonitoring(mediaStream);
      
      // Ses durumunu diğer kullanıcılara bildir
      socket.emit('user_voice_status', {
        isMuted: isMuted,
        isVolumeMuted: isVolumeMuted
      });
      
      console.log('Sesli odaya başarıyla katıldı!');
      
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
        socket.emit('user_speaking', { isSpeaking: false, voiceLevel: 0 });
        
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
    
    // Tüm peer'ların ses seviyesini güncelle
    Object.values(peersRef.current).forEach(peer => {
      if (peer.audioElement) {
        peer.audioElement.volume = newVolume;
      }
    });
  };

  const testSound = () => {
    try {
      // Bip sesi oluştur
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz bip sesi
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Ses seviyesini ayarla
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('Test sesi çalındı');
    } catch (error) {
      console.error('Test sesi hatası:', error);
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
      analyserNode.smoothingTimeConstant = 0.8;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      source.connect(analyserNode);
      
      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArray);
      
      let isRunning = true;
      
      const updateVoiceLevel = () => {
        if (!isRunning) return;
        
        try {
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
            const speaking = level > 5;
            if (speaking !== isSpeaking) {
              setIsSpeaking(speaking);
              if (socket && socket.connected) {
                socket.emit('user_speaking', { isSpeaking: speaking, voiceLevel: level });
              }
            }
          } else {
            setVoiceLevel(0);
            if (isSpeaking) {
              setIsSpeaking(false);
              if (socket && socket.connected) {
                socket.emit('user_speaking', { isSpeaking: false, voiceLevel: 0 });
              }
            }
          }
          
          if (isRunning) {
            const animationId = requestAnimationFrame(updateVoiceLevel);
            setAnimationId(animationId);
          }
        } catch (error) {
          console.error('Ses seviyesi güncelleme hatası:', error);
          isRunning = false;
        }
      };
      
      updateVoiceLevel();
      console.log('Ses izleme başlatıldı');
      
      // Cleanup function
      return () => {
        isRunning = false;
      };
    } catch (error) {
      console.error('Ses izleme hatası:', error);
    }
  };

  const stopVoiceMonitoring = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      setAnimationId(null);
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close();
      } catch (error) {
        console.log('AudioContext zaten kapalı');
      }
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
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch (error) {
          console.log('AudioContext zaten kapalı (cleanup)');
        }
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
    { id: socket?.id, username: user?.username, isMuted, isVolumeMuted, isSpeaking, voiceLevel },
    ...voiceRoomUsers.filter(u => u.id !== socket?.id)
  ].filter(Boolean);

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
          <>
            <VoiceButton onClick={joinVoiceRoom}>
              <Mic size={18} />
              <span className="hide-on-mobile">Sesli Odaya Katıl</span>
            </VoiceButton>
            <div style={{ 
              background: 'rgba(64, 224, 208, 0.1)', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid rgba(64, 224, 208, 0.3)',
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#40e0d0', fontWeight: '700', marginBottom: '8px' }}>
                🎤 Sesli Sohbet Özellikleri
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.5' }}>
                • Gerçek zamanlı ses iletimi<br/>
                • Konuşma göstergeleri<br/>
                • Ses seviyesi takibi<br/>
                • Mikrofon ve ses kontrolleri<br/>
                • Animasyonlu konuşma göstergeleri
              </div>
            </div>
          </>
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

            <VoiceButton onClick={() => setShowVoiceMonitor(true)}>
              <Mic size={18} />
              <span className="hide-on-mobile">Ses Monitörü</span>
            </VoiceButton>

            <VoiceButton onClick={testSound}>
              🔊
              <span className="hide-on-mobile">Test Sesi</span>
            </VoiceButton>

            <VoiceButton variant="leave" onClick={leaveVoiceRoom}>
              <LogOut size={18} />
              <span className="hide-on-mobile">Odadan Ayrıl</span>
            </VoiceButton>
          </>
        )}
      </VoiceControls>

      <UsersContainer>
        {allUsers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '16px'
          }}>
            Henüz kimse sesli odaya katılmadı. İlk siz katılın! 🎤
          </div>
        ) : (
          allUsers.map((user) => {
            const status = getVoiceStatus(user);
            return (
              <UserCard 
                key={user.id} 
                isSpeaking={status === 'speaking'}
              >
              <UserHeader>
                <UserAvatar isSpeaking={status === 'speaking'}>
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                  <EchoLines 
                    isSpeaking={status === 'speaking'} 
                    voiceLevel={user.voiceLevel || 0}
                  />
                </UserAvatar>
                <UserInfo>
                  <Username>{user.username || 'Bilinmeyen Kullanıcı'}</Username>
                  <UserStatus>
                    <StatusIcon status={status} />
                    {getStatusText(status)}
                    {status === 'speaking' && (
                      <SpeakingIndicator>
                        🎤 Konuşuyor
                      </SpeakingIndicator>
                    )}
                  </UserStatus>
                </UserInfo>
                <div style={{ color: '#40e0d0' }}>
                  {getStatusIcon(status)}
                </div>
              </UserHeader>
            </UserCard>
            );
          })
        )}
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