// Server configuration
const SERVER_URL = process.env.REACT_APP_SERVER_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://tk-chat-app.onrender.com'
    : 'http://localhost:5001');

export default SERVER_URL; 