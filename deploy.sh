#!/bin/bash

echo "🚀 Chat App Production Deployment Başlıyor..."

# 1. Frontend build
echo "📦 Frontend build ediliyor..."
cd client
npm run build
cd ..

# 2. Backend için production environment
echo "⚙️ Production environment ayarlanıyor..."
cp server/production.env server/.env

# 3. Gerekli dosyaları kopyala
echo "📁 Dosyalar hazırlanıyor..."
mkdir -p production
cp -r server/* production/
cp -r client/build production/public

# 4. Production package.json oluştur
echo "📋 Production package.json oluşturuluyor..."
cat > production/package.json << EOF
{
  "name": "chat-app-production",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "pm2": "pm2 start index.js --name chat-app"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
EOF

echo "✅ Deployment hazır! Production klasörü oluşturuldu."
echo "📝 Sonraki adımlar:"
echo "1. production/.env dosyasında DOMAIN_URL'yi güncelleyin"
echo "2. production/ klasörünü sunucunuza yükleyin"
echo "3. npm install && npm start komutlarını çalıştırın" 