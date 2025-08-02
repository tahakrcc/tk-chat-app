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

// Environment variables yükle
require('dotenv').config({ path: './production.env' });

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
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'https://tk-chat-app.onrender.com' 
  : 'http://localhost:5001';

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
    
    // Production'da doğru URL kullan
    const avatarUrl = process.env.NODE_ENV === 'production' 
      ? `https://tk-chat-app.onrender.com/uploads/${req.file.filename}`
      : `${SERVER_URL}/uploads/${req.file.filename}`;
    
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
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔗 MongoDB URI (ilk 30 karakter):', MONGO_URI ? MONGO_URI.substring(0, 30) + '...' : 'Yok');

// MongoDB bağlantı seçenekleri
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000, // 30 saniye
  socketTimeoutMS: 60000, // 60 saniye
  connectTimeoutMS: 30000, // 30 saniye
  bufferCommands: false, // Buffer'ı devre dışı bırak
  bufferMaxEntries: 0
};

// MongoDB bağlantı fonksiyonu
async function connectToMongoDB() {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...');
    
    // Eğer zaten bağlıysa, bağlantıyı kapat
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB zaten bağlı');
      return true;
    }
    
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
    
    // Bağlantı başarısız olursa in-memory moda geç
    console.log('⚠️ MongoDB bağlantısı başarısız, in-memory veritabanı kullanılıyor');
    return false;
  }
}

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  avatar: { type: String },
  gender: { type: String, enum: ['male', 'female'], default: 'male' },
  status: { type: String, default: 'online' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  // Takip sistemi
  followers: [{ type: String }], // Takipçiler (username listesi)
  following: [{ type: String }], // Takip edilenler (username listesi)
  followRequests: [{ type: String }], // Gelen takip istekleri
  sentFollowRequests: [{ type: String }], // Gönderilen takip istekleri
  isPrivate: { type: Boolean, default: false } // Özel profil mi?
});

const User = mongoose.model('User', userSchema);

// Özel mesaj şeması
const privateMessageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // Gönderen username
  to: { type: String, required: true }, // Alıcı username
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

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

// Kullanıcıların hangi odada olduğunu takip et
const userRooms = new Map();

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

// Mesajları temizleme fonksiyonu (30 dakika sonra)
const cleanupOldMessages = () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  roomMessages.forEach((messages, roomId) => {
    const filteredMessages = messages.filter(message => {
      const messageTime = new Date(message.timestamp);
      return messageTime > thirtyMinutesAgo;
    });
    roomMessages.set(roomId, filteredMessages);
  });
  
  console.log('Eski mesajlar temizlendi');
};

// Her 5 dakikada bir eski mesajları temizle
setInterval(cleanupOldMessages, 5 * 60 * 1000);

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
    
    const { username, email, password, displayName, gender } = req.body;

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
      console.log('⚠️ MongoDB bağlantısı yok, in-memory veritabanı kullanılıyor');
      
      // In-memory kullanıcı kontrolü
      const existingUser = users.get(username) || Array.from(users.values()).find(u => u.email === email);
      if (existingUser) {
        console.log('❌ Kullanıcı zaten var (in-memory):', existingUser.username);
        return res.status(400).json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor' });
      }

      // In-memory kullanıcı oluştur
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: Date.now().toString(),
        username,
        password: hashedPassword,
        displayName: displayName || username,
        avatar: null,
        gender: gender || 'male',
        status: 'online',
        email,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date()
      };
      
      users.set(username, newUser);
      console.log('✅ Kullanıcı kaydedildi (in-memory):', username);

      // Şifreyi çıkar ve kullanıcıyı döndür
      const userObj = { ...newUser };
      delete userObj.password;
      res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        user: userObj
      });
      return;
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
      gender: gender || 'male',
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
    
    // MongoDB bağlantısını kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB bağlantısı yok, in-memory veritabanı kullanılıyor');
      
      // In-memory kullanıcıyı bul
      const user = users.get(username);
      console.log('Kullanıcı bulundu mu (in-memory):', !!user);
      
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
      users.set(username, user);
      console.log('Kullanıcı kaydedildi (in-memory)');
      
      // Şifreyi çıkar ve kullanıcıyı döndür
      const userObj = { ...user };
      delete userObj.password;
      res.json({ user: userObj });
      return;
    }
    
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
    // MongoDB bağlantısını kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB bağlantısı yok, in-memory veritabanı kullanılıyor');
      const onlineUsers = Array.from(users.values()).filter(user => user.isOnline);
      return res.json(onlineUsers);
    }
    
    // MongoDB'den çevrimiçi kullanıcıları çek
    const onlineUsers = await User.find({ isOnline: true }).select('-password');
    res.json(onlineUsers);
  } catch (error) {
    console.error('Çevrimiçi kullanıcılar hatası:', error);
    
    // Hata durumunda in-memory veritabanını kullan
    try {
      const onlineUsers = Array.from(users.values()).filter(user => user.isOnline);
      res.json(onlineUsers);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Sunucu hatası' });
    }
  }
});

// Kullanıcı profili API'si
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // MongoDB bağlantısını kontrol et
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ MongoDB bağlantısı yok, in-memory veritabanı kullanılıyor');
      const user = Array.from(users.values()).find(u => u.username === username);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Kullanıcı profili hatası:', error);
    
    // Hata durumunda in-memory veritabanını kullan
    try {
      const user = Array.from(users.values()).find(u => u.username === username);
      if (!user) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Sunucu hatası' });
    }
  }
});

// PROFİL GÜNCELLEME ENDPOINTİ (GELİŞTİRİLMİŞ)
app.post('/api/profile/update', async (req, res) => {
  try {
    const { username, displayName, avatar, gender } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Kullanıcı adı gerekli' });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    if (displayName) user.displayName = displayName;
    if (avatar !== undefined) user.avatar = avatar;
    if (gender) user.gender = gender;
    
    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;
    
    // Users Map'indeki avatar bilgisini güncelle
    users.forEach((userData, socketId) => {
      if (userData.username === username) {
        userData.displayName = user.displayName;
        userData.avatar = user.avatar;
        userData.gender = user.gender;
        users.set(socketId, userData);
      }
    });
    
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

// ŞİFRE DEĞİŞTİRME ENDPOINTİ
app.post('/api/profile/change-password', async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    
    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı' });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Mevcut şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı' });
    }
    
    // Yeni şifreyi hash et
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    
    await user.save();
    
    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
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

// TAKİP SİSTEMİ ENDPOINT'LERİ
// Takip isteği gönder
app.post('/api/follow/request', async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;
    
    if (!fromUsername || !toUsername) {
      return res.status(400).json({ error: 'Kullanıcı adları gerekli' });
    }
    
    if (fromUsername === toUsername) {
      return res.status(400).json({ error: 'Kendinizi takip edemezsiniz' });
    }
    
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Zaten takip ediliyor mu kontrol et
    if (fromUser.following.includes(toUsername)) {
      return res.status(400).json({ error: 'Zaten takip ediyorsunuz' });
    }
    
    // Zaten istek gönderilmiş mi kontrol et
    if (fromUser.sentFollowRequests.includes(toUsername)) {
      return res.status(400).json({ error: 'Zaten takip isteği gönderilmiş' });
    }
    
    // Takip isteği gönder
    fromUser.sentFollowRequests.push(toUsername);
    toUser.followRequests.push(fromUsername);
    
    await fromUser.save();
    await toUser.save();
    
    res.json({ message: 'Takip isteği gönderildi' });
  } catch (error) {
    console.error('Takip isteği hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Takip isteğini kabul et
app.post('/api/follow/accept', async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;
    
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // İstekleri temizle
    fromUser.sentFollowRequests = fromUser.sentFollowRequests.filter(u => u !== toUsername);
    toUser.followRequests = toUser.followRequests.filter(u => u !== fromUsername);
    
    // Takip ilişkisini kur
    fromUser.following.push(toUsername);
    toUser.followers.push(fromUsername);
    
    await fromUser.save();
    await toUser.save();
    
    res.json({ message: 'Takip isteği kabul edildi' });
  } catch (error) {
    console.error('Takip kabul hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Takip isteğini reddet
app.post('/api/follow/reject', async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;
    
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // İstekleri temizle
    fromUser.sentFollowRequests = fromUser.sentFollowRequests.filter(u => u !== toUsername);
    toUser.followRequests = toUser.followRequests.filter(u => u !== fromUsername);
    
    await fromUser.save();
    await toUser.save();
    
    res.json({ message: 'Takip isteği reddedildi' });
  } catch (error) {
    console.error('Takip red hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Takibi bırak
app.post('/api/follow/unfollow', async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;
    
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Takip ilişkisini kaldır
    fromUser.following = fromUser.following.filter(u => u !== toUsername);
    toUser.followers = toUser.followers.filter(u => u !== fromUsername);
    
    await fromUser.save();
    await toUser.save();
    
    res.json({ message: 'Takip bırakıldı' });
  } catch (error) {
    console.error('Takip bırakma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı takip durumunu getir
app.get('/api/follow/status/:fromUsername/:toUsername', async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.params;
    
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const isFollowing = fromUser.following.includes(toUsername);
    const hasRequestSent = fromUser.sentFollowRequests.includes(toUsername);
    const hasRequestReceived = toUser.followRequests.includes(fromUsername);
    
    res.json({
      isFollowing,
      hasRequestSent,
      hasRequestReceived,
      isPrivate: toUser.isPrivate
    });
  } catch (error) {
    console.error('Takip durumu hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcının takipçilerini getir
app.get('/api/follow/followers/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const followers = await User.find({ username: { $in: user.followers } })
      .select('username displayName avatar gender isOnline');
    
    res.json({ followers });
  } catch (error) {
    console.error('Takipçi listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcının takip ettiklerini getir
app.get('/api/follow/following/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const following = await User.find({ username: { $in: user.following } })
      .select('username displayName avatar gender isOnline');
    
    res.json({ following });
  } catch (error) {
    console.error('Takip edilenler listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Gelen takip isteklerini getir
app.get('/api/follow/requests/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const requests = await User.find({ username: { $in: user.followRequests } })
      .select('username displayName avatar gender');
    
    res.json({ requests });
  } catch (error) {
    console.error('Takip istekleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ÖZEL SOHBET ENDPOINT'LERİ
// Özel mesaj gönder
app.post('/api/private-message/send', async (req, res) => {
  try {
    const { fromUsername, toUsername, content } = req.body;
    
    if (!fromUsername || !toUsername || !content) {
      return res.status(400).json({ error: 'Tüm alanlar gerekli' });
    }
    
    // Kullanıcıları kontrol et
    const fromUser = await User.findOne({ username: fromUsername });
    const toUser = await User.findOne({ username: toUsername });
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Takip ilişkisi kontrol et (özel profil için)
    if (toUser.isPrivate && !fromUser.following.includes(toUsername)) {
      return res.status(403).json({ error: 'Bu kullanıcıya mesaj gönderemezsiniz' });
    }
    
    // Mesajı kaydet
    const message = new PrivateMessage({
      from: fromUsername,
      to: toUsername,
      content: content
    });
    
    await message.save();
    
    res.json({ 
      message: 'Mesaj gönderildi',
      privateMessage: message
    });
  } catch (error) {
    console.error('Özel mesaj gönderme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Özel mesajları getir
app.get('/api/private-message/:username1/:username2', async (req, res) => {
  try {
    const { username1, username2 } = req.params;
    
    const messages = await PrivateMessage.find({
      $or: [
        { from: username1, to: username2 },
        { from: username2, to: username1 }
      ]
    }).sort({ timestamp: 1 });
    
    res.json({ messages });
  } catch (error) {
    console.error('Özel mesaj getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Okunmamış mesajları getir
app.get('/api/private-message/unread/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const unreadMessages = await PrivateMessage.find({
      to: username,
      isRead: false
    }).sort({ timestamp: -1 });
    
    res.json({ unreadMessages });
  } catch (error) {
    console.error('Okunmamış mesaj getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesajları okundu olarak işaretle
app.post('/api/private-message/mark-read', async (req, res) => {
  try {
    const { fromUsername, toUsername } = req.body;
    
    await PrivateMessage.updateMany(
      { from: fromUsername, to: toUsername, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'Mesajlar okundu olarak işaretlendi' });
  } catch (error) {
    console.error('Mesaj okundu işaretleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sohbet listesini getir (son mesajla birlikte)
app.get('/api/private-message/conversations/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Kullanıcının katıldığı tüm sohbetleri bul
    const conversations = await PrivateMessage.aggregate([
      {
        $match: {
          $or: [
            { from: username },
            { to: username }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$from', username] },
              '$to',
              '$from'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$to', username] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);
    
    // Kullanıcı bilgilerini ekle
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const user = await User.findOne({ username: conv._id })
          .select('username displayName avatar gender isOnline');
        return {
          ...conv,
          user: user || { username: conv._id, displayName: 'Bilinmeyen Kullanıcı' }
        };
      })
    );
    
    res.json({ conversations: conversationsWithUsers });
  } catch (error) {
    console.error('Sohbet listesi hatası:', error);
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
        avatar: registeredUser.avatar || null,
        gender: registeredUser.gender,
        status: registeredUser.status
      });
      
      socket.join(userData.room || 'general');
      
      // Kullanıcının hangi odada olduğunu kaydet
      userRooms.set(socket.id, userData.room || 'general');
      
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
          gender: registeredUser.gender,
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
          avatar: user.avatar || null,
          gender: user.gender
        },
        timestamp: new Date().toISOString()
      };
      
      // Mesajı odadaki tüm kullanıcılara gönder (gönderen dahil)
      const roomId = messageData.room || 'general';
      io.to(roomId).emit('new_message', messageWithUser);
      
      // Diğer odalardaki kullanıcılara bildirim gönder
      const senderRoom = userRooms.get(socket.id);
      if (senderRoom && senderRoom !== roomId) {
        // Gönderen farklı bir odadaysa, o odadaki kullanıcılara bildirim gönder
        socket.to(senderRoom).emit('notification', {
          type: 'new_message',
          room: roomId,
          sender: user.displayName || user.username,
          message: messageData.content.substring(0, 50) + (messageData.content.length > 50 ? '...' : '')
        });
      }
      
      // Mesaj sayısını güncelle
      const stats = roomStats.get(roomId);
      if (stats) {
        stats.messages += 1;
        stats.lastActivity = new Date().toISOString();
      }
      
      // Mesajı kaydet
      const roomMessagesList = roomMessages.get(roomId) || [];
      roomMessagesList.push(messageWithUser);
      
      // Mesaj sayısını sınırla (50 mesaj)
      if (roomMessagesList.length > 50) {
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

  // Takip sistemi socket event'leri
  socket.on('follow_request', async (data) => {
    try {
      const { fromUsername, toUsername } = data;
      
      // Takip isteği gönder
      const fromUser = await User.findOne({ username: fromUsername });
      const toUser = await User.findOne({ username: toUsername });
      
      if (!fromUser || !toUser) {
        socket.emit('follow_error', { message: 'Kullanıcı bulunamadı' });
        return;
      }
      
      // Zaten takip ediliyor mu kontrol et
      if (fromUser.following.includes(toUsername)) {
        socket.emit('follow_error', { message: 'Zaten takip ediyorsunuz' });
        return;
      }
      
      // Zaten istek gönderilmiş mi kontrol et
      if (fromUser.sentFollowRequests.includes(toUsername)) {
        socket.emit('follow_error', { message: 'Zaten takip isteği gönderilmiş' });
        return;
      }
      
      // Takip isteği gönder
      fromUser.sentFollowRequests.push(toUsername);
      toUser.followRequests.push(fromUsername);
      
      await fromUser.save();
      await toUser.save();
      
      // Alıcıya bildirim gönder
      socket.broadcast.emit('follow_request_received', {
        fromUsername,
        fromDisplayName: fromUser.displayName || fromUser.username,
        fromAvatar: fromUser.avatar
      });
      
      socket.emit('follow_request_sent', { message: 'Takip isteği gönderildi' });
      
    } catch (error) {
      console.error('Takip isteği hatası:', error);
      socket.emit('follow_error', { message: 'Takip isteği gönderilirken hata oluştu' });
    }
  });

  // Özel mesaj gönderme
  socket.on('private_message', async (data) => {
    try {
      const { fromUsername, toUsername, content } = data;
      
      // Kullanıcıları kontrol et
      const fromUser = await User.findOne({ username: fromUsername });
      const toUser = await User.findOne({ username: toUsername });
      
      if (!fromUser || !toUser) {
        socket.emit('private_message_error', { message: 'Kullanıcı bulunamadı' });
        return;
      }
      
      // Takip ilişkisi kontrol et (özel profil için)
      if (toUser.isPrivate && !fromUser.following.includes(toUsername)) {
        socket.emit('private_message_error', { message: 'Bu kullanıcıya mesaj gönderemezsiniz' });
        return;
      }
      
      // Mesajı kaydet
      const message = new PrivateMessage({
        from: fromUsername,
        to: toUsername,
        content: content
      });
      
      await message.save();
      
      const messageWithUser = {
        ...message.toObject(),
        user: {
          username: fromUser.username,
          displayName: fromUser.displayName || fromUser.username,
          avatar: fromUser.avatar,
          gender: fromUser.gender
        }
      };
      
      // Alıcıya mesajı gönder
      socket.broadcast.emit('private_message_received', messageWithUser);
      
      // Gönderene onay gönder
      socket.emit('private_message_sent', messageWithUser);
      
    } catch (error) {
      console.error('Özel mesaj hatası:', error);
      socket.emit('private_message_error', { message: 'Mesaj gönderilirken hata oluştu' });
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
      userRooms.delete(socket.id);
      
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