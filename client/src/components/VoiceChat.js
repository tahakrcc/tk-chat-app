import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import Peer from 'simple-peer';

const VoiceChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const VoiceButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  
  ${props => props.variant === 'call' && `
    background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
    color: white;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
    }
  `}
  
  ${props => props.variant === 'end' && `
    background: #dc3545;
    color: white;
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
    }
  `}
  
  ${props => props.variant === 'mute' && `
    background: ${props.isMuted ? '#dc3545' : '#28a745'};
    color: white;
    
    &:hover {
      transform: scale(1.1);
    }
  `}
  
  ${props => props.variant === 'volume' && `
    background: ${props.isMuted ? '#dc3545' : '#28a745'};
    color: white;
    
    &:hover {
      transform: scale(1.1);
    }
  `}
`;

const CallModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  z-index: 1001;
  min-width: 300px;
`;

const CallTitle = styled.h3`
  color: #00d4ff;
  margin-bottom: 20px;
  font-size: 20px;
`;

const CallButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

const CallButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'accept' && `
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.variant === 'reject' && `
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
      transform: translateY(-2px);
    }
  `}
`;

const VoiceChat = ({ socket, currentUser, activeUsers }) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeMuted, setIsVolumeMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callPartner, setCallPartner] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (!socket) return;

    // Gelen arama
    socket.on('voice_call_incoming', (data) => {
      setIncomingCall(data.from);
    });

    // Arama yanıtlandı
    socket.on('voice_call_answered', (data) => {
      if (data.accepted) {
        setIsInCall(true);
        setCallPartner(data.from);
        initializePeer(true, data.from);
      } else {
        setIncomingCall(null);
      }
    });

    // Arama sonlandı
    socket.on('voice_call_ended', (data) => {
      endCall();
    });

    // WebRTC sinyali
    socket.on('voice_call_signal', (data) => {
      if (peer) {
        peer.signal(data.signal);
      }
    });

    return () => {
      socket.off('voice_call_incoming');
      socket.off('voice_call_answered');
      socket.off('voice_call_ended');
      socket.off('voice_call_signal');
    };
  }, [socket, peer]);

  // UserList'ten gelen arama başlatma event'i
  useEffect(() => {
    const handleStartCall = (event) => {
      const { username } = event.detail;
      handleUserCall(username);
    };

    window.addEventListener('startVoiceCall', handleStartCall);
    
    return () => {
      window.removeEventListener('startVoiceCall', handleStartCall);
    };
  }, []);

  const initializePeer = async (isInitiator, partnerUsername) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const newPeer = new Peer({
        initiator: isInitiator,
        trickle: false,
        stream
      });

      newPeer.on('signal', (signal) => {
        socket.emit('voice_call_signal', {
          to: partnerUsername,
          signal,
          from: currentUser.username
        });
      });

      newPeer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    } catch (error) {
      console.error('Mikrofon erişimi hatası:', error);
      alert('Mikrofon erişimi gerekli!');
    }
  };

  const startCall = async (username) => {
    socket.emit('voice_call_start', { to: username });
    setIsInCall(true);
    setCallPartner(username);
    await initializePeer(true, username);
  };

  const answerCall = async (accepted) => {
    if (accepted) {
      setIsInCall(true);
      setCallPartner(incomingCall);
      await initializePeer(false, incomingCall);
    }
    
    socket.emit('voice_call_answer', { 
      to: incomingCall, 
      accepted 
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
      setRemoteStream(null);
    }
    
    setIsInCall(false);
    setCallPartner(null);
    
    if (incomingCall) {
      socket.emit('voice_call_answer', { 
        to: incomingCall, 
        accepted: false 
      });
      setIncomingCall(null);
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
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
      setIsVolumeMuted(remoteVideoRef.current.muted);
    }
  };

  const handleUserCall = (username) => {
    if (username !== currentUser.username) {
      startCall(username);
    }
  };

  return (
    <>
      <VoiceChatContainer>
        {!isInCall && (
          <VoiceButton
            variant="call"
            onClick={() => {
              if (activeUsers.length > 1) {
                const otherUser = activeUsers.find(u => u.username !== currentUser.username);
                if (otherUser) {
                  handleUserCall(otherUser.username);
                }
              }
            }}
            disabled={activeUsers.length <= 1}
            title="Sesli arama başlat"
          >
            <Phone size={24} />
          </VoiceButton>
        )}
        
        {isInCall && (
          <>
            <VoiceButton
              variant="mute"
              isMuted={isMuted}
              onClick={toggleMute}
              title={isMuted ? "Mikrofonu aç" : "Mikrofonu kapat"}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </VoiceButton>
            
            <VoiceButton
              variant="volume"
              isMuted={isVolumeMuted}
              onClick={toggleVolume}
              title={isVolumeMuted ? "Sesi aç" : "Sesi kapat"}
            >
              {isVolumeMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </VoiceButton>
            
            <VoiceButton
              variant="end"
              onClick={endCall}
              title="Aramayı sonlandır"
            >
              <PhoneOff size={24} />
            </VoiceButton>
          </>
        )}
      </VoiceChatContainer>

      {incomingCall && (
        <CallModal>
          <CallTitle>
            Gelen Arama: {incomingCall}
          </CallTitle>
          <CallButtons>
            <CallButton
              variant="accept"
              onClick={() => answerCall(true)}
            >
              Kabul Et
            </CallButton>
            <CallButton
              variant="reject"
              onClick={() => answerCall(false)}
            >
              Reddet
            </CallButton>
          </CallButtons>
        </CallModal>
      )}

      {isInCall && (
        <div style={{ 
          position: 'fixed', 
          bottom: 100, 
          right: 20, 
          background: 'rgba(15, 15, 35, 0.9)', 
          padding: '10px', 
          borderRadius: '8px',
          color: '#00d4ff',
          fontSize: '14px'
        }}>
          Sesli Sohbet: {callPartner}
        </div>
      )}

      <audio ref={localVideoRef} autoPlay muted />
      <audio ref={remoteVideoRef} autoPlay />
    </>
  );
};

export default VoiceChat; 