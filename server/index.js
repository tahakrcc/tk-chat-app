const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: true, // Tüm origin'lere izin ver
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(helmet());
app.use(cors({
  origin: true, // Tüm origin'lere izin ver
  credentials: true
}));
app.use(express.json());

// Kullanıcı veritabanı (gerçek uygulamada MongoDB veya PostgreSQL kullanılır)
const users = new Map();
const registeredUsers = new Map(); // Kayıtlı kullanıcılar
const voiceRoomUsers = new Set();

// Oda istatistikleri
const roomStats = new Map();
const roomMessages = new Map();

// Oda verilerini başlat
const initializeRooms = () => {
  const rooms = [
    { id: 'general', name: 'Genel', description: 'Genel sohbet odası - herkes için açık' },
    { id: 'gaming', name: 'Oyun', description: 'Oyun severler için özel oda' },
    { id: 'music', name: 'Müzik', description: 'Müzik ve sanat hakkında sohbet' },
    { id: 'tech', name: 'Teknoloji', description: 'Teknoloji ve programlama' },
    { id: 'voice', name: 'Sesli Oda', description: 'Sesli sohbet odası' }
  ];
  
  rooms.forEach(room => {
    roomStats.set(room.id, {
      users: 0, // Gerçek kullanıcı sayısı
      messages: 0, // Gerçek mesaj sayısı
      lastActivity: new Date().toISOString()
    });
    roomMessages.set(room.id, []);
  });
};

initializeRooms();

// Kullanıcı başlatma (artık test kullanıcıları yok)
const initializeUsers = () => {
  // Gerçek kullanıcılar kayıt oldukça eklenecek
  console.log('Kullanıcı sistemi başlatıldı - test kullanıcıları kaldırıldı');
};

initializeUsers();

// Ana sayfa için basit response
app.get('/', (req, res) => {
  res.json({ message: 'TK Chat Server is running!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is healthy', 
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    users: registeredUsers.size,
    rooms: roomStats.size
  });
});

// Oda istatistikleri API'si
app.get('/api/rooms/stats', (req, res) => {
  try {
    const stats = {};
    roomStats.forEach((value, key) => {
      stats[key] = value;
    });
    res.json(stats);
  } catch (error) {
    console.error('Oda istatistikleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Oda mesajları API'si
app.get('/api/rooms/:roomId/messages', (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = roomMessages.get(roomId) || [];
    res.json(messages);
  } catch (error) {
    console.error('Oda mesajları hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı kayıt API'si
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;
    
    // Validasyon
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
    }
    
    // Kullanıcı adı kontrolü
    if (registeredUsers.has(username)) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }
    
    // E-posta kontrolü
    const existingUser = Array.from(registeredUsers.values()).find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    // Yeni kullanıcı oluştur
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      displayName: displayName || username,
      bio: '',
      avatar: null,
      status: 'online',
      createdAt: new Date().toISOString()
    };
    
    registeredUsers.set(username, newUser);
    
    // Şifreyi çıkar ve kullanıcıyı döndür
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı giriş API'si
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validasyon
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }
    
    // Kullanıcıyı bul
    const user = registeredUsers.get(username);
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    // Şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    // Şifreyi çıkar ve kullanıcıyı döndür
    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Giriş başarılı',
      user: userWithoutPassword 
    });
    
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Çevrimiçi kullanıcılar API'si
app.get('/api/users', (req, res) => {
  try {
    // Sadece çevrimiçi kullanıcıları döndür
    const onlineUsers = Array.from(users.values()).map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      status: 'online',
      room: user.room
    }));
    res.json(onlineUsers);
  } catch (error) {
    console.error('Çevrimiçi kullanıcılar hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı profili API'si
app.get('/api/users/:username', (req, res) => {
  try {
    const { username } = req.params;
    const user = registeredUsers.get(username);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Kullanıcı profili hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı giriş yaptığında
  socket.on('user_join', (userData) => {
    console.log('Kullanıcı giriş yaptı:', userData);
    
    // Kayıtlı kullanıcıyı bul
    const registeredUser = registeredUsers.get(userData.username);
    if (!registeredUser) {
      socket.emit('auth_error', { message: 'Kullanıcı bulunamadı' });
      return;
    }
    
    users.set(socket.id, {
      id: socket.id,
      username: userData.username,
      room: userData.room || 'general',
      displayName: registeredUser.displayName,
      avatar: registeredUser.avatar,
      status: registeredUser.status
    });
    
    socket.join(userData.room || 'general');
    
    // Oda istatistiklerini güncelle
    const roomId = userData.room || 'general';
    const stats = roomStats.get(roomId);
    if (stats) {
      stats.users = Array.from(users.values()).filter(u => u.room === roomId).length;
      stats.lastActivity = new Date().toISOString();
    }
    
    // Diğer kullanıcılara yeni kullanıcı katıldığını bildir
    socket.to(roomId).emit('user_joined', {
      user: {
        id: socket.id,
        username: userData.username,
        displayName: registeredUser.displayName,
        avatar: registeredUser.avatar,
        status: registeredUser.status
      }
    });
    
    // Aktif kullanıcıları gönder
    const roomUsers = Array.from(users.values()).filter(user => user.room === roomId);
    io.to(roomId).emit('active_users', roomUsers);
    
    // Oda istatistiklerini gönder
    io.to(roomId).emit('room_stats_updated', roomStats.get(roomId));
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
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar
        },
        timestamp: new Date().toISOString()
      };
      
      // Mesajı odadaki tüm kullanıcılara gönder (gönderen dahil)
      const roomId = messageData.room || 'general';
      io.to(roomId).emit('new_message', messageWithUser);
      
      // Mesaj sayısını güncelle
      const stats = roomStats.get(roomId);
      if (stats) {
        stats.messages += 1;
        stats.lastActivity = new Date().toISOString();
      }
      
      // Mesajı kaydet
      const roomMessagesList = roomMessages.get(roomId) || [];
      roomMessagesList.push(messageWithUser);
      if (roomMessagesList.length > 100) {
        roomMessagesList.shift(); // En eski mesajı sil
      }
      roomMessages.set(roomId, roomMessagesList);
      
      // Oda istatistiklerini güncelle
      io.to(roomId).emit('room_stats_updated', roomStats.get(roomId));
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

  // Profil güncelleme
  socket.on('update_profile', (updatedUser) => {
    console.log('Profil güncellendi:', updatedUser);
    const user = users.get(socket.id);
    if (user) {
      // Kullanıcı bilgilerini güncelle
      users.set(socket.id, {
        ...user,
        ...updatedUser
      });
      
      // Diğer kullanıcılara profil güncellemesini bildir
      socket.to(user.room || 'general').emit('profile_updated', {
        userId: socket.id,
        user: updatedUser
      });
    }
  });

  // Sesli oda katılımı
  socket.on('join_voice_room', (data) => {
    console.log('Sesli odaya katılım:', socket.id, data);
    
    // Kullanıcıyı users Map'ine ekle (eğer yoksa)
    if (!users.has(socket.id)) {
      users.set(socket.id, {
        id: socket.id,
        username: data.user?.username || `User_${socket.id.slice(-4)}`,
        room: 'voice'
      });
    } else {
      // Mevcut kullanıcının bilgilerini güncelle
      const existingUser = users.get(socket.id);
      existingUser.username = data.user?.username || existingUser.username;
      existingUser.room = 'voice';
      users.set(socket.id, existingUser);
    }
    
    voiceRoomUsers.add(socket.id);
    
    // Sesli odadaki kullanıcıları gönder
    const voiceUsers = Array.from(voiceRoomUsers).map(userId => {
      const user = users.get(userId);
      return user ? { id: userId, username: user.username } : null;
    }).filter(Boolean);
    
    io.emit('voice_room_users', { users: voiceUsers });
    
    // Diğer kullanıcılara yeni kullanıcı katıldığını bildir
    socket.broadcast.emit('user_joined_voice', socket.id);
    
    console.log('Sesli oda kullanıcıları güncellendi:', voiceUsers.length);
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
    console.log('Sinyal gönderiliyor:', payload.userToSignal, 'CallerId:', payload.callerId);
    io.to(payload.userToSignal).emit('user_joined_voice', payload.callerId);
    io.to(payload.userToSignal).emit('receiving_returned_signal', { id: payload.callerId, signal: payload.signal });
  });

  socket.on('returning_signal', (payload) => {
    console.log('Sinyal döndürülüyor:', payload.callerId, 'TargetId:', socket.id);
    io.to(payload.callerId).emit('receiving_returned_signal', { id: socket.id, signal: payload.signal });
  });

  // Konuşma durumu
  socket.on('user_speaking', (data) => {
    console.log('Kullanıcı konuşma durumu:', socket.id, data.isSpeaking, 'Ses seviyesi:', data.voiceLevel);
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_speaking_update', {
        userId: socket.id,
        username: user.username,
        isSpeaking: data.isSpeaking,
        voiceLevel: data.voiceLevel || 0
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
      
      // Oda istatistiklerini güncelle
      const roomId = user.room;
      const stats = roomStats.get(roomId);
      if (stats) {
        stats.users = Array.from(users.values()).filter(u => u.room === roomId).length;
        stats.lastActivity = new Date().toISOString();
      }
      
      // Aktif kullanıcıları güncelle
      const roomUsers = Array.from(users.values()).filter(u => u.room === user.room);
      io.to(user.room).emit('active_users', roomUsers);
      
      // Oda istatistiklerini güncelle
      io.to(user.room).emit('room_stats_updated', roomStats.get(roomId));
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

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`CORS origins: https://tk-chat-app.netlify.app, https://tk-chat-app.onrender.com, http://localhost:3000`);
}); 