const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["https://tk-chat-app.netlify.app", "https://tk-chat-app.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  }
});

app.use(cors());
app.use(express.json());

// Kullanıcıları saklamak için
const users = new Map();
const voiceRoomUsers = new Set();

// Ana sayfa için basit response
app.get('/', (req, res) => {
  res.json({ message: 'TK Chat Server is running!', timestamp: new Date().toISOString() });
});

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı giriş yaptığında
  socket.on('user_join', (userData) => {
    console.log('Kullanıcı giriş yaptı:', userData);
    users.set(socket.id, {
      id: socket.id,
      username: userData.username,
      room: userData.room || 'general'
    });
    
    socket.join(userData.room || 'general');
    
    // Diğer kullanıcılara yeni kullanıcı katıldığını bildir
    socket.to(userData.room || 'general').emit('user_joined', {
      user: {
        id: socket.id,
        username: userData.username
      }
    });
    
    // Aktif kullanıcıları gönder
    const roomUsers = Array.from(users.values()).filter(user => user.room === (userData.room || 'general'));
    io.to(userData.room || 'general').emit('active_users', roomUsers);
  });

  // Mesaj gönderme
  socket.on('send_message', (messageData) => {
    console.log('Mesaj gönderildi:', messageData);
    const user = users.get(socket.id);
    if (user) {
      const messageWithUser = {
        ...messageData,
        user: {
          id: user.id,
          username: user.username
        },
        timestamp: new Date().toISOString()
      };
      
      // Mesajı odadaki tüm kullanıcılara gönder (gönderen dahil)
      io.to(messageData.room || 'general').emit('new_message', messageWithUser);
    }
  });

  // Yazıyor durumu
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(data.room || 'general').emit('user_typing', {
        userId: socket.id,
        username: user.username
      });
    }
  });

  // Yazıyor durumunu durdur
  socket.on('stop_typing', (data) => {
    const user = users.get(socket.id);
    if (user) {
      socket.to(data.room || 'general').emit('user_stop_typing', {
        userId: socket.id,
        username: user.username
      });
    }
  });

  // Sesli oda katılımı
  socket.on('join_voice_room', (data) => {
    console.log('Sesli odaya katılım:', socket.id, data);
    voiceRoomUsers.add(socket.id);
    
    // Sesli odadaki kullanıcıları gönder
    const voiceUsers = Array.from(voiceRoomUsers).map(userId => {
      const user = users.get(userId);
      return user ? { id: userId, username: user.username } : null;
    }).filter(Boolean);
    
    io.emit('voice_room_users', { users: voiceUsers });
    
    // Diğer kullanıcılara yeni kullanıcı katıldığını bildir
    socket.broadcast.emit('user_joined_voice', socket.id);
  });

  // Sesli odadan ayrılma
  socket.on('leave_voice_room', (data) => {
    console.log('Sesli odadan ayrılma:', socket.id, data);
    voiceRoomUsers.delete(socket.id);
    
    // Sesli odadaki kullanıcıları güncelle
    const voiceUsers = Array.from(voiceRoomUsers).map(userId => {
      const user = users.get(userId);
      return user ? { id: userId, username: user.username } : null;
    }).filter(Boolean);
    
    io.emit('voice_room_users', { users: voiceUsers });
    
    // Diğer kullanıcılara kullanıcı ayrıldığını bildir
    socket.broadcast.emit('user_left_voice', socket.id);
  });

  // WebRTC sinyalleri
  socket.on('sending_signal', (payload) => {
    console.log('Sinyal gönderiliyor:', payload.userToSignal);
    io.to(payload.userToSignal).emit('user_joined_voice', payload.callerId);
    io.to(payload.userToSignal).emit('receiving_returned_signal', { id: payload.callerId, signal: payload.signal });
  });

  socket.on('returning_signal', (payload) => {
    console.log('Sinyal döndürülüyor:', payload.id);
    io.to(payload.id).emit('receiving_returned_signal', { id: socket.id, signal: payload.signal });
  });

  // Konuşma durumu
  socket.on('user_speaking', (data) => {
    console.log('Kullanıcı konuşma durumu:', socket.id, data.isSpeaking);
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_speaking_update', {
        userId: socket.id,
        username: user.username,
        isSpeaking: data.isSpeaking
      });
    }
  });

  // Kullanıcı ses durumu (mikrofon/ses açık/kapalı)
  socket.on('user_voice_status', (data) => {
    console.log('Kullanıcı ses durumu:', socket.id, data);
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_voice_status_update', {
        userId: socket.id,
        username: user.username,
        isMuted: data.isMuted,
        isVolumeMuted: data.isVolumeMuted
      });
    }
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    const user = users.get(socket.id);
    
    if (user) {
      // Diğer kullanıcılara kullanıcı ayrıldığını bildir
      socket.to(user.room).emit('user_left', {
        user: {
          id: user.id,
          username: user.username
        }
      });
      
      users.delete(socket.id);
      
      // Aktif kullanıcıları güncelle
      const roomUsers = Array.from(users.values()).filter(u => u.room === user.room);
      io.to(user.room).emit('active_users', roomUsers);
    }
    
    // Sesli odadan da çıkar
    if (voiceRoomUsers.has(socket.id)) {
      voiceRoomUsers.delete(socket.id);
      const voiceUsers = Array.from(voiceRoomUsers).map(userId => {
        const user = users.get(userId);
        return user ? { id: userId, username: user.username } : null;
      }).filter(Boolean);
      
      io.emit('voice_room_users', { users: voiceUsers });
      socket.broadcast.emit('user_left_voice', socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`CORS origins: https://tk-chat-app.netlify.app, https://tk-chat-app.onrender.com, http://localhost:3000`);
}); 