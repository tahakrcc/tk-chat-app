# TK Chat - Modern Sohbet Uygulaması

Modern ve güzel arayüzlü gerçek zamanlı sohbet uygulaması. React, Node.js ve Socket.io kullanılarak geliştirilmiştir.

## 🌟 Özellikler

- 🚀 **Gerçek Zamanlı Mesajlaşma** - Socket.io ile anlık mesaj gönderimi
- 🎤 **Sesli Sohbet Odaları** - WebRTC ile sesli iletişim
- 👥 **Aktif Kullanıcı Listesi** - Sohbetteki kullanıcıları görme
- ✍️ **Yazıyor Göstergesi** - Kimin yazdığını görme
- 🎨 **Modern UI/UX** - Güzel ve kullanıcı dostu arayüz
- 📱 **Responsive Tasarım** - Mobil ve masaüstü uyumlu
- 🔄 **Otomatik Bağlantı** - Bağlantı durumu göstergesi
- 🔒 **Şifre Koruması** - Güvenli giriş sistemi
- ⚡ **Hızlı ve Performanslı** - Optimize edilmiş kod yapısı

## 🛠️ Teknolojiler

### Backend
- **Node.js** - Sunucu tarafı
- **Express.js** - Web framework
- **Socket.io** - Gerçek zamanlı iletişim
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - Kullanıcı arayüzü
- **Styled Components** - CSS-in-JS styling
- **Socket.io Client** - Sunucu bağlantısı
- **Simple Peer** - WebRTC peer-to-peer bağlantı
- **Lucide React** - İkonlar

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- npm veya yarn

### Development

1. **Projeyi klonlayın**
```bash
git clone https://github.com/your-username/tk-chat-app.git
cd tk-chat-app
```

2. **Tüm bağımlılıkları yükleyin**
```bash
npm run install-all
```

3. **Uygulamayı başlatın**
```bash
npm run dev
```

Bu komut hem backend (port 5000) hem de frontend (port 3000) sunucularını başlatacaktır.

### Production Deployment

#### Render.com ile Deploy

1. **Backend'i Render.com'a yükleyin:**
   - https://render.com adresine gidin
   - "New +" → "Web Service"
   - GitHub repository'nizi seçin
   - **Name:** `tk-chat-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`

2. **Frontend'i Netlify'a yükleyin:**
   - https://netlify.com adresine gidin
   - "New site from Git"
   - GitHub repository'nizi seçin
   - **Build command:** `cd client && npm install && npm run build`
   - **Publish directory:** `client/build`

## 📱 Kullanım

1. **Giriş Yapın:**
   - Kullanıcı adınızı girin
   - Şifre: `689tk`
   - Sohbet türünü seçin (Yazılı/Sesli)

2. **Sohbete Katılın:**
   - Yazılı sohbet için mesaj yazın
   - Sesli sohbet için mikrofon izni verin

3. **Özellikler:**
   - Mesaj gönderme/alma
   - Sesli konuşma
   - Aktif kullanıcıları görme
   - Yazıyor göstergesi

## 🔧 Geliştirme

### Proje Yapısı
```
tk-chat-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   └── App.js         # Ana uygulama
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Ana server dosyası
│   └── package.json
└── package.json           # Root package.json
```

### Scripts
- `npm run dev` - Development modunda başlat
- `npm run build` - Production build oluştur
- `npm run start` - Production modunda başlat

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

- **Geliştirici:** TK
- **Proje Linki:** [https://github.com/your-username/tk-chat-app](https://github.com/your-username/tk-chat-app) 