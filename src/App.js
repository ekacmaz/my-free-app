import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiMessageSquare, FiCheckCircle, FiLogOut } from 'react-icons/fi';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';

// 1. Create separate MessageBoard component
const MessageBoard = () => {
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      const response = await fetch('https://backend-hsn6.onrender.com/api/data');
      const messages = await response.json();
      setData(messages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      const response = await fetch('https://backend-hsn6.onrender.com/api/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      
      await fetchMessages();
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <header>
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="logo-image" />
          <h1>Damla's Message Board</h1>
        </div>
        <div>
          <button onClick={fetchMessages} className="refresh-btn">
            <FiRefreshCw /> Refresh
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </header>

      <main>
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={handleSubmit} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send'}
            <FiCheckCircle className="check-icon" />
          </button>
        </div>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : (
          <div className="messages">
            {data.length === 0 ? (
              <p className="empty">No messages yet. Be the first! 🚀</p>
            ) : (
              data.map((item, index) => (
                <div className="message-card" key={index}>
                  <p>{item.message}</p>
                  <span className="timestamp">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// 2. Create Login component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const success = await register(email, password);
    if (success) alert('Registration successful! Please login.');
  };

  return (
    <div className="auth-form">
      <h2>Welcome to Damla's Message Board</h2>
      <div className="auth-container">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="auth-buttons">
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleRegister}>Register</button>
        </div>
      </div>
    </div>
  );
};

// 3. Update main App component with routing
export default function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <MessageBoard />
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// 4. Add authentication check component
const RequireAuth = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};