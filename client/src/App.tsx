import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface Item {
  id: number;
  name: string;
}

interface ApiResponse {
  items: Item[];
}

function App() {
  const [message, setMessage] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Test basic API connection
    axios.get(`${API_URL}/api/test`)
      .then(response => {
        setMessage(response.data.message);
        setConnectionStatus('connected');
      })
      .catch(error => {
        console.error('Error fetching test data:', error);
        setMessage('Error connecting to API');
        setConnectionStatus('failed');
      });
    
    // Fetch items from API
    axios.get<ApiResponse>(`${API_URL}/api/data`)
      .then(response => {
        setItems(response.data.items);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching items:', error);
        setLoading(false);
      });
  }, [API_URL]);

  return (
    <div className="container">
      <h1>React + Express App</h1>
      
      <div className={`card ${connectionStatus === 'connected' ? 'success' : connectionStatus === 'failed' ? 'error' : ''}`}>
        <h2>API Connection Status</h2>
        <div className="status-indicator">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span className="status-text">
            {connectionStatus === 'connecting' && 'Connecting to API...'}
            {connectionStatus === 'connected' && 'Connected to API!'}
            {connectionStatus === 'failed' && 'Failed to connect to API'}
          </span>
        </div>
        {connectionStatus === 'connected' && <p className="api-message">Server says: "{message}"</p>}
        {connectionStatus === 'failed' && <p className="api-url">Trying to connect to: {API_URL}</p>}
      </div>

      <div className="card">
        <h2>Data from API</h2>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : items.length > 0 ? (
          <ul className="items-list">
            {items.map(item => (
              <li key={item.id} className="item">
                <span className="item-id">#{item.id}</span>
                <span className="item-name">{item.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No data received from API</p>
        )}
      </div>
    </div>
  )
}

export default App
