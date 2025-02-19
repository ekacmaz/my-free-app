import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Fetch data from backend API
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

  // Load messages on component mount and auto-refresh every 30 seconds
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Send message to backend
  const handleSubmit = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      const response = await fetch('https://backend-hsn6.onrender.com/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      await response.json();
      await fetchMessages(); // Refresh messages after submission
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="App">
      <header>
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="logo-image" />
          <h1>Damla's Message Board</h1>
        </div>
        <button onClick={fetchMessages} className="refresh-btn">
          <FiRefreshCw /> Refresh
        </button>
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
}

export default App;