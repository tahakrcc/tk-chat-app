#!/bin/bash

echo "🚀 TK Chat App Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build frontend
echo "🔨 Building frontend..."
cd client
npm run build
cd ..

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "🌐 Deployment Instructions:"
echo "=========================="
echo ""
echo "1. BACKEND DEPLOYMENT (Railway/Render):"
echo "   - Go to https://railway.app or https://render.com"
echo "   - Connect your GitHub repository"
echo "   - Set environment variables:"
echo "     - NODE_ENV=production"
echo "     - PORT=5000"
echo "   - Build Command: cd server && npm install"
echo "   - Start Command: cd server && npm start"
echo ""
echo "2. FRONTEND DEPLOYMENT (Netlify):"
echo "   - Go to https://netlify.com"
echo "   - Connect your GitHub repository"
echo "   - Build command: cd client && npm install && npm run build"
echo "   - Publish directory: client/build"
echo "   - Add environment variable:"
echo "     - REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com"
echo ""
echo "3. UPDATE BACKEND URL:"
echo "   - After backend deployment, update the URL in:"
echo "     - client/src/App.js (line ~205)"
echo "     - server/index.js (CORS origins)"
echo ""
echo "🔗 Current Backend URL: https://tk-chat-app.onrender.com"
echo "🔗 Current Frontend URL: https://tk-chat-app.netlify.app"
echo ""
echo "📱 Test your deployment:"
echo "   - Frontend: https://tk-chat-app.netlify.app"
echo "   - Backend: https://tk-chat-app.onrender.com"
echo ""
echo "🎯 Multi-user testing:"
echo "   - Open the app in multiple browser tabs/windows"
echo "   - Test with different devices on the same network"
echo "   - Test with devices on different networks"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check browser console for connection errors"
echo "   - Verify CORS settings match your frontend URL"
echo "   - Ensure WebSocket connections are working"
echo "   - Test microphone permissions on mobile devices" 