# TK Chat App - Deployment & Troubleshooting Guide

## 🚀 Quick Deployment

### Backend Deployment (Railway/Render)

1. **Railway.app** (Recommended)
   - Go to https://railway.app
   - Connect your GitHub repository
   - Set environment variables:
     ```
     NODE_ENV=production
     PORT=5000
     ```
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

2. **Render.com** (Alternative)
   - Go to https://render.com
   - Create new Web Service
   - Connect your GitHub repository
   - Set environment variables:
     ```
     NODE_ENV=production
     PORT=5000
     ```
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`

### Frontend Deployment (Netlify)

1. Go to https://netlify.com
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
4. Add environment variable:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
   ```

## 🔧 Configuration Updates

### After Backend Deployment

1. **Update Frontend Backend URL**
   - File: `client/src/App.js` (line ~205)
   - Change: `https://tk-chat-app.onrender.com` to your actual backend URL

2. **Update Server CORS**
   - File: `server/index.js`
   - Add your frontend URL to CORS origins array

## 🐛 Common Issues & Solutions

### 1. "Page Not Found" on Netlify
**Problem**: React Router not working on Netlify
**Solution**: 
- Ensure `netlify.toml` exists in client folder
- Add redirect rule: `/* /index.html 200`

### 2. Socket Connection Failed
**Problem**: Frontend can't connect to backend
**Solutions**:
- Check backend URL in `client/src/App.js`
- Verify CORS settings in `server/index.js`
- Ensure backend is running and accessible
- Check browser console for specific error messages

### 3. No Sound in Voice Chat
**Problem**: Microphone not working
**Solutions**:
- Check browser permissions (HTTPS required)
- Verify microphone is not muted
- Test on different browsers/devices
- Check volume controls in the app

### 4. Messages Not Sending
**Problem**: Text chat not working
**Solutions**:
- Check socket connection status
- Verify backend is running
- Check browser console for errors
- Ensure user is properly logged in

### 5. Users Not Visible
**Problem**: Online users list not updating
**Solutions**:
- Check socket events in browser console
- Verify `user_join` event is being sent
- Check server logs for connection issues

### 6. Multi-User Communication Issues
**Problem**: Users can't see each other from different locations
**Solutions**:
- Ensure backend is publicly accessible
- Check firewall/network settings
- Verify WebSocket connections are working
- Test with different networks/devices

## 📱 Mobile Testing

### iOS Safari
- Requires HTTPS for microphone access
- May need to manually enable microphone permissions
- Test in private browsing mode

### Android Chrome
- Generally works well with HTTPS
- Check site settings for microphone permissions
- May need to refresh page after permission grant

## 🔍 Debugging Steps

### 1. Check Browser Console
```javascript
// Test socket connection
console.log('Socket connected:', socket.connected);
console.log('Socket ID:', socket.id);
```

### 2. Check Server Logs
- Monitor server console for connection events
- Check for error messages
- Verify user join/leave events

### 3. Test Backend Health
```bash
curl https://your-backend-url.onrender.com
# Should return: {"message":"TK Chat Server is running!"}
```

### 4. Test WebSocket Connection
```javascript
// In browser console
const testSocket = io('https://your-backend-url.onrender.com');
testSocket.on('connect', () => console.log('Connected!'));
```

## 🌐 Environment Variables

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
```

## 📊 Performance Monitoring

### Key Metrics to Monitor
- Socket connection success rate
- Message delivery time
- Voice chat latency
- User session duration

### Tools
- Browser DevTools Network tab
- Server logs
- Real-time user feedback

## 🔒 Security Considerations

### HTTPS Required
- Voice chat requires HTTPS
- All production deployments should use HTTPS
- Check SSL certificate validity

### CORS Configuration
- Only allow necessary origins
- Avoid using `*` in production
- Keep CORS origins list updated

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review browser console errors
3. Check server logs
4. Test with different browsers/devices
5. Verify network connectivity

## 🎯 Testing Checklist

- [ ] Backend deploys successfully
- [ ] Frontend builds without errors
- [ ] Socket connection established
- [ ] User login works
- [ ] Text messages send/receive
- [ ] Voice chat permissions granted
- [ ] Sound works in voice chat
- [ ] Multiple users can connect
- [ ] Cross-network communication works
- [ ] Mobile devices work properly 