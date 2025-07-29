const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
// CORS ayarları - production ve development için
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.DOMAIN_URL || 'https://yourdomain.com'] // Domain URL'nizi buraya yazın
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
};

const io = socketIo(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Production için static dosyaları serve et
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Kullanıcı veritabanı
const usersFile = path.join(__dirname, 'users.json');

// Kullanıcıları yükle
const loadUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
};

// Kullanıcıları kaydet
const saveUsers = (usersData) => {
  fs.writeFileSync(usersFile, JSON.stringify(usersData, null, 2));
};

// Kullanıcı doğrulama
const authenticateUser = (username, password) => {
  const usersData = loadUsers();
  const user = usersData.users.find(u => u.username === username && u.password === password);
  return user;
};

// Yeni kullanıcı kaydı
const registerUser = (username, password, email) => {
  const usersData = loadUsers();
  
  // Kullanıcı adı kontrolü
  if (usersData.users.find(u => u.username === username)) {
    return { success: false, message: 'Bu kullanıcı adı zaten kullanılıyor' };
  }
  
  // Email kontrolü
  if (usersData.users.find(u => u.email === email)) {
    return { success: false, message: 'Bu email zaten kullanılıyor' };
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    email,
    createdAt: new Date().toISOString()
  };
  
  usersData.users.push(newUser);
  saveUsers(usersData);
  
  return { success: true, user: { ...newUser, password: undefined } };
};

// API Routes
app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: 'Tüm alanlar gerekli' });
  }
  
  const result = registerUser(username, password, email);
  res.json(result);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
  }
  
  const user = authenticateUser(username, password);
  
  if (user) {
    res.json({ 
      success: true, 
      user: { ...user, password: undefined } 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Kullanıcı adı veya şifre hatalı' 
    });
  }
});

// Aktif kullanıcıları saklamak için
const activeUsers = new Map();

// Sesli odaları saklamak için
const voiceRooms = new Map();

// Varsayılan sesli oda oluştur
const defaultRoom = {
  id: 'general',
  name: 'Genel Sesli Oda',
  users: new Set(),
  createdAt: new Date().toISOString()
};
voiceRooms.set('general', defaultRoom);

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı giriş yaptığında
  socket.on('user_join', (userData) => {
    activeUsers.set(socket.id, {
      id: socket.id,
      username: userData.username,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
    });
    
    // Tüm kullanıcılara yeni kullanıcıyı bildir
    io.emit('user_joined', {
      user: activeUsers.get(socket.id),
      message: `${userData.username} sohbete katıldı!`,
      timestamp: new Date().toISOString()
    });
    
    // Aktif kullanıcı listesini güncelle
    io.emit('active_users', Array.from(activeUsers.values()));
  });

  // Mesaj gönderildiğinde
  socket.on('send_message', (messageData) => {
    console.log('Server: send_message alındı:', messageData);
    console.log('Socket ID:', socket.id);
    
    const user = activeUsers.get(socket.id);
    console.log('Kullanıcı bulundu:', user);
    
    if (user) {
      const message = {
        id: Date.now() + Math.random(),
        userId: user.id,
        username: user.username,
        content: messageData.content,
        channel: messageData.channel || 'general',
        timestamp: new Date().toISOString(),
        type: 'message'
      };
      
      console.log('Mesaj oluşturuldu:', message);
      io.emit('new_message', message);
      console.log('new_message emit edildi');
    } else {
      console.log('Kullanıcı bulunamadı, aktif kullanıcılar:', Array.from(activeUsers.values()));
    }
  });

  // Yazıyor durumu
  socket.on('typing', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_typing', {
        userId: user.id,
        username: user.username
      });
    }
  });

  // Yazıyor durdurma
  socket.on('stop_typing', (data) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_stop_typing', {
        userId: user.id,
        username: user.username
      });
    }
  });

  // Kullanıcı çıkış yaptığında
  socket.on('user_logout', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      
      io.emit('user_left', {
        user: user,
        message: `${user.username} sohbetten ayrıldı.`,
        timestamp: new Date().toISOString()
      });
      
      io.emit('active_users', Array.from(activeUsers.values()));
    }
  });

  // Sesli sohbet sinyalleri
  socket.on('voice_call_signal', (data) => {
    const { to, signal, from } = data;
    const targetSocket = Array.from(activeUsers.entries()).find(([id, user]) => user.username === to);
    
    if (targetSocket) {
      io.to(targetSocket[0]).emit('voice_call_signal', {
        signal,
        from: activeUsers.get(socket.id)?.username
      });
    }
  });

  // Sesli arama başlatma
  socket.on('voice_call_start', (data) => {
    const { to } = data;
    const targetSocket = Array.from(activeUsers.entries()).find(([id, user]) => user.username === to);
    
    if (targetSocket) {
      io.to(targetSocket[0]).emit('voice_call_incoming', {
        from: activeUsers.get(socket.id)?.username
      });
    }
  });

  // Sesli arama yanıtlama
  socket.on('voice_call_answer', (data) => {
    const { to, accepted } = data;
    const targetSocket = Array.from(activeUsers.entries()).find(([id, user]) => user.username === to);
    
    if (targetSocket) {
      io.to(targetSocket[0]).emit('voice_call_answered', {
        from: activeUsers.get(socket.id)?.username,
        accepted
      });
    }
  });

  // Sesli oda katılım
  socket.on('join_voice_room', (data) => {
    const { roomId } = data;
    const user = activeUsers.get(socket.id);
    
    if (user) {
      // Oda yoksa oluştur
      if (!voiceRooms.has(roomId)) {
        voiceRooms.set(roomId, {
          id: roomId,
          name: 'Genel Sesli Oda',
          users: new Set()
        });
      }
      
      const room = voiceRooms.get(roomId);
      room.users.add(socket.id);
      socket.join(`voice_room_${roomId}`);
      
      // Odadaki diğer kullanıcılara bildir
      socket.to(`voice_room_${roomId}`).emit('user_joined_voice_room', {
        user: user,
        roomId: roomId
      });
      
      // Kullanıcıya odadaki mevcut kullanıcıları gönder
      const roomUsers = Array.from(room.users).map(userId => activeUsers.get(userId)).filter(Boolean);
      socket.emit('voice_room_users', {
        roomId: roomId,
        users: roomUsers
      });
      
      // WebRTC bağlantısı için diğer kullanıcılara bildir
      socket.broadcast.emit('user_joined_voice', socket.id);
      
      console.log(`${user.username} sesli odaya katıldı: ${roomId}`);
    }
  });

  // Sesli odadan ayrılma
  socket.on('leave_voice_room', (data) => {
    const { roomId } = data;
    const user = activeUsers.get(socket.id);
    
    if (user && voiceRooms.has(roomId)) {
      const room = voiceRooms.get(roomId);
      room.users.delete(socket.id);
      socket.leave(`voice_room_${roomId}`);
      
      // Odadaki diğer kullanıcılara bildir
      socket.to(`voice_room_${roomId}`).emit('user_left_voice_room', {
        user: user,
        roomId: roomId
      });
      
      // WebRTC bağlantılarını kapat
      socket.broadcast.emit('user_left_voice', socket.id);
      
      console.log(`${user.username} sesli odadan ayrıldı: ${roomId}`);
    }
  });

  // Sesli oda sinyalleri
  socket.on('voice_room_signal', (data) => {
    const { roomId, signal, to } = data;
    const user = activeUsers.get(socket.id);
    
    if (user && voiceRooms.has(roomId)) {
      const room = voiceRooms.get(roomId);
      if (room.users.has(to)) {
        io.to(to).emit('voice_room_signal', {
          signal,
          from: socket.id,
          roomId: roomId
        });
      }
    }
  });

  // Yeni sesli oda oluşturma
  socket.on('create_voice_room', (data) => {
    const { name } = data;
    const user = activeUsers.get(socket.id);
    
    if (user) {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRoom = {
        id: roomId,
        name: name,
        creator: user.username,
        users: new Set(),
        createdAt: new Date().toISOString()
      };
      
      voiceRooms.set(roomId, newRoom);
      
      // Tüm kullanıcılara yeni oda bildirimi
      io.emit('voice_room_created', newRoom);
      
      console.log(`${user.username} yeni sesli oda oluşturdu: ${name}`);
    }
  });

  // Sesli oda listesi isteme
  socket.on('get_voice_rooms', () => {
    const roomsList = Array.from(voiceRooms.values()).map(room => ({
      ...room,
      userCount: room.users.size,
      users: Array.from(room.users).map(userId => activeUsers.get(userId)).filter(Boolean)
    }));
    
    socket.emit('voice_rooms_list', roomsList);
  });

  // WebRTC sinyalleri
  socket.on('sending_signal', (data) => {
    const { userToSignal, callerId, signal } = data;
    io.to(userToSignal).emit('user_joined_voice', callerId);
    io.to(userToSignal).emit('receiving_returned_signal', { id: callerId, signal });
  });

  socket.on('returning_signal', (data) => {
    const { signal, callerId } = data;
    io.to(callerId).emit('receiving_returned_signal', { id: socket.id, signal });
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      
      io.emit('user_left', {
        user: user,
        message: `${user.username} sohbetten ayrıldı.`,
        timestamp: new Date().toISOString()
      });
      
      io.emit('active_users', Array.from(activeUsers.values()));
    }
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
}); 