import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [data, setData] = useState([]);

  // Fetch data from backend API
  useEffect(() => {
    fetch('https://your-backend-api.onrender.com/api/data')
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []);

  // Send data to backend
  const handleSubmit = async () => {
    const response = await fetch('https://your-backend-api.onrender.com/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const result = await response.json();
    alert(result.status);
    setMessage('');
  };

  return (
    <div className="App">
      <h1>Free Full-Stack App</h1>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message"
      />
      <button onClick={handleSubmit}>Save</button>

      <div>
        <h2>Messages from Database:</h2>
        {data.map((item, index) => (
          <p key={index}>{item.message}</p>
        ))}
      </div>
    </div>
  );
}

export default App;