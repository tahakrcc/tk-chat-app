const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'));
    }
  }
});

const app = express();
const server = http.createServer(app);

// SERVER_URL tanımı
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5001';

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// FOTOĞRAF UPLOAD ENDPOINTİ
app.post('/api/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }
    
    const avatarUrl = `${SERVER_URL}/uploads/${req.file.filename}`;
    res.json({ 
      message: 'Fotoğraf başarıyla yüklendi',
      avatarUrl: avatarUrl 
    });
  } catch (error) {
    console.error('Fotoğraf upload hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// MONGODB BAĞLANTISI VE USER MODELİ
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tk-chat-app';
console.log('🔧 MongoDB URI ayarlandı mı:', !!process.env.MONGO_URI);
console.log('📏 MongoDB URI uzunluğu:', MONGO_URI ? MONGO_URI.length : 0);

// MongoDB bağlantı seçenekleri
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // 10 saniye
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
  retryWrites: true,
  w: 'majority'
};

// MongoDB bağlantı fonksiyonu
async function connectToMongoDB() {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log('✅ MongoDB bağlantısı başarılı!');
    console.log('📊 Bağlantı durumu:', mongoose.connection.readyState);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('📁 Database:', mongoose.connection.name);
    console.log('🔗 URI:', MONGO_URI.substring(0, 50) + '...');
    return true;
  } catch (err) {
    console.error('❌ MongoDB bağlantı hatası:', err);
    console.error('🔍 Hata detayı:', err.message);
    console.error('📋 Hata kodu:', err.code);
    console.error('🔗 URI (ilk 50 karakter):', MONGO_URI.substring(0, 50) + '...');
    return false;
  }
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  avatar: { type: String },
  status: { type: String, default: 'online' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Kullanıcı veritabanı (artık MongoDB kullanıyoruz)
// const registeredUsers = new Map(); // Bu satırı kaldır

// Oda veritabanı
const rooms = [
  {
    id: 'general',
    name: 'Genel',
    description: 'Genel sohbet odası',
    type: 'public',
    icon: '💬'
  },
  {
    id: 'gaming',
    name: 'Oyun',
    description: 'Oyun sohbet odası',
    type: 'public',
    icon: '🎮'
  },
  {
    id: 'music',
    name: 'Müzik',
    description: 'Müzik sohbet odası',
    type: 'public',
    icon: '🎵'
  },
  {
    id: 'voice-general',
    name: 'Sesli Genel',
    description: 'Sesli genel sohbet',
    type: 'voice',
    icon: '🎤'
  }
];

// Oda istatistikleri
const roomStats = new Map();
const roomMessages = new Map();

// Çevrimiçi kullanıcılar
const users = new Map();

// Oda başlatma
const initializeRooms = () => {
  rooms.forEach(room => {
    roomStats.set(room.id, {
      users: 0, // Gerçek kullanıcı sayısı
      messages: 0, // Gerçek mesaj sayısı
      lastActivity: new Date().toISOString()
    });
    roomMessages.set(room.id, []);
  });
  console.log('Odalar başlatıldı');
};

// Kullanıcı başlatma (artık MongoDB kullanıyoruz)
const initializeUsers = () => {
  console.log('Kullanıcı sistemi başlatıldı - MongoDB kullanılıyor');
};

initializeRooms();

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
    users: users.size,
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
    console.log('📝 Register isteği alındı:', { username: req.body.username, email: req.body.email });
    
    const { username, email, password, displayName } = req.body;

    // Validasyon
    if (!username || !email || !password) {
      console.log('❌ Eksik alanlar:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }
    if (password.length < 6) {
      console.log('❌ Şifre çok kısa:', password.length);
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
    }

    // MongoDB bağlantısını kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB bağlantısı yok');
      return res.status(500).json({ error: 'Veritabanı bağlantısı yok' });
    }

    console.log('🔍 Kullanıcı kontrol ediliyor...');
    // Kullanıcı adı ve e-posta kontrolü
    const existingUser = await User.findOne({ $or: [ { username }, { email } ] });
    if (existingUser) {
      console.log('❌ Kullanıcı zaten var:', existingUser.username);
      return res.status(400).json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor' });
    }

    console.log('🔐 Şifre hash ediliyor...');
    // Yeni kullanıcı oluştur
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      displayName: displayName || username,
      avatar: null,
      status: 'online',
      email
    });
    
    console.log('💾 Kullanıcı kaydediliyor...');
    await newUser.save();
    console.log('✅ Kullanıcı kaydedildi:', username);

    // Şifreyi çıkar ve kullanıcıyı döndür
    const userObj = newUser.toObject();
    delete userObj.password;
    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: userObj
    });
  } catch (error) {
    console.error('❌ Kayıt hatası detayı:', error);
    console.error('📋 Hata stack:', error.stack);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

// Kullanıcı giriş API'si
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login isteği alındı:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('Eksik alanlar:', { username: !!username, password: !!password });
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }
    
    console.log('Kullanıcı aranıyor:', username);
    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    console.log('Kullanıcı bulundu mu:', !!user);
    
    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    // Şifreyi kontrol et
    console.log('Şifre kontrol ediliyor...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Şifre geçerli mi:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    
    // Kullanıcıyı çevrimiçi yap
    console.log('Kullanıcı çevrimiçi yapılıyor...');
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    console.log('Kullanıcı kaydedildi');
    
    // Şifreyi çıkar ve kullanıcıyı döndür
    const userObj = user.toObject();
    delete userObj.password;
    console.log('Login başarılı, kullanıcı döndürülüyor');
    res.json({
      message: 'Giriş başarılı',
      user: userObj
    });
  } catch (error) {
    console.error('Giriş hatası detayı:', error);
    console.error('Hata stack:', error.stack);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

// Çevrimiçi kullanıcılar API'si
app.get('/api/users', async (req, res) => {
  try {
    // MongoDB'den çevrimiçi kullanıcıları çek
    const onlineUsers = await User.find({ isOnline: true }).select('-password');
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
    User.findOne({ username })
      .then(user => {
        if (!user) {
          return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }
        const { password, ...userWithoutPassword } = user.toObject();
        res.json(userWithoutPassword);
      })
      .catch(err => {
        console.error('Kullanıcı profili hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
      });
  } catch (error) {
    console.error('Kullanıcı profili hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// PROFİL GÜNCELLEME ENDPOINTİ (GELİŞTİRİLMİŞ)
app.post('/api/profile/update', async (req, res) => {
  try {
    const { username, displayName, avatar } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Kullanıcı adı gerekli' });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    if (displayName) user.displayName = displayName;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;
    
    // Socket ile herkese yayınla
    io.emit('profile_updated', userObj);
    
    res.json({ 
      message: 'Profil güncellendi', 
      user: userObj 
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// KULLANICI PROFİLİ ÇEKME ENDPOINTİ
app.get('/api/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj });
  } catch (error) {
    console.error('Kullanıcı profili çekme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

io.on('connection', (socket) => {
  console.log('Yeni kullanıcı bağlandı:', socket.id);

  // Kullanıcı giriş yaptığında
  socket.on('user_join', async (userData) => {
    console.log('Kullanıcı giriş yaptı:', userData);
    
    try {
      // Kullanıcıyı bul ve çevrimiçi yap
      const registeredUser = await User.findOne({ username: userData.username });
      if (!registeredUser) {
        socket.emit('auth_error', { message: 'Kullanıcı bulunamadı' });
        return;
      }
      
      // Kullanıcıyı çevrimiçi yap
      registeredUser.isOnline = true;
      registeredUser.lastSeen = new Date();
      await registeredUser.save();
      
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
    } catch (error) {
      console.error('Kullanıcı girişi hatası:', error);
      socket.emit('auth_error', { message: 'Sunucu hatası' });
    }
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

  // SOCKET.IO PROFİL GÜNCELLEME
  socket.on('update_profile', async (data) => {
    try {
      const { username, displayName, avatar } = data;
      const user = await User.findOne({ username });
      if (!user) return;
      if (displayName) user.displayName = displayName;
      if (avatar) user.avatar = avatar;
      await user.save();
      const userObj = user.toObject();
      delete userObj.password;
      io.emit('profile_updated', userObj);
    } catch (error) {
      console.error('Socket profil güncelleme hatası:', error);
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
    
    // Sesli odadaki kullanıcıları gönder
    const voiceUsers = Array.from(users.values()).filter(user => user.room === 'voice');
    
    io.emit('voice_room_users', { users: voiceUsers });
    
    // Diğer kullanıcılara yeni kullanıcı katıldığını bildir
    socket.broadcast.emit('user_joined_voice', socket.id);
    
    console.log('Sesli oda kullanıcıları güncellendi:', voiceUsers.length);
  });

  // Sesli odadan ayrılma
  socket.on('leave_voice_room', (data) => {
    console.log('Sesli odadan ayrılma:', socket.id, data);
    
    // Sesli odadaki kullanıcıları güncelle
    const voiceUsers = Array.from(users.values()).filter(user => user.room === 'voice');
    
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
  socket.on('disconnect', async () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    const user = users.get(socket.id);
    
    if (user) {
      // MongoDB'de kullanıcıyı çevrimdışı yap
      try {
        await User.findOneAndUpdate(
          { username: user.username },
          { 
            isOnline: false, 
            lastSeen: new Date() 
          }
        );
      } catch (error) {
        console.error('Kullanıcı çevrimdışı yapma hatası:', error);
      }
      
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
    if (users.has(socket.id) && users.get(socket.id).room === 'voice') {
      users.delete(socket.id);
      const voiceUsers = Array.from(users.values()).filter(user => user.room === 'voice');
      
      io.emit('voice_room_users', { users: voiceUsers });
      socket.broadcast.emit('user_left_voice', socket.id);
    }
  });
});

const PORT = process.env.PORT || 5001;

// Server'ı MongoDB bağlantısından sonra başlat
async function startServer() {
  try {
    // MongoDB'ye bağlan
    const mongoConnected = await connectToMongoDB();
    
    if (!mongoConnected) {
      console.log('⚠️ MongoDB bağlantısı başarısız, uygulama çalışmaya devam ediyor...');
    }
    
    // Server'ı başlat
    server.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
      console.log(`CORS origins: https://tk-chat-app.netlify.app, https://tk-chat-app.onrender.com, http://localhost:3000`);
    });
  } catch (error) {
    console.error('❌ Server başlatma hatası:', error);
    process.exit(1);
  }
}

// Server'ı başlat
startServer(); 