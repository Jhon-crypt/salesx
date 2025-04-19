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
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Use relative URL instead of absolute URL to leverage the Vite proxy
  const API_BASE = '/api';

  const testConnection = async () => {
    try {
      console.log(`Attempting to connect to ${API_BASE}/test...`);
      const response = await axios.get(`${API_BASE}/test`);
      setMessage(response.data.message);
      setConnectionStatus('connected');
      setErrorDetails('');
      
      // If connected successfully, also get data
      try {
        const dataResponse = await axios.get<ApiResponse>(`${API_BASE}/data`);
        setItems(dataResponse.data.items);
      } catch (dataError) {
        console.error('Error fetching data:', dataError);
      } finally {
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error connecting to API:', error);
      setConnectionStatus('failed');
      
      // Extract and display detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setErrorDetails(`Server responded with error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        setErrorDetails('No response received from server. Server might be down or unreachable.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setErrorDetails(`Error: ${error.message}`);
      }
      
      setLoading(false);
    }
  };

  // Retry connection when the retry button is clicked
  const handleRetry = () => {
    setConnectionStatus('connecting');
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    testConnection();
    
    // Setup an interval to keep checking connection
    const intervalId = setInterval(() => {
      if (connectionStatus === 'failed') {
        testConnection();
      }
    }, 5000); // Check every 5 seconds if failed
    
    return () => clearInterval(intervalId);
  }, [API_BASE, retryCount]);

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
        {connectionStatus === 'failed' && (
          <>
            <p className="api-url">Trying to connect to: {window.location.origin}{API_BASE}</p>
            {errorDetails && <p className="error-details">{errorDetails}</p>}
            <button className="retry-button" onClick={handleRetry}>
              Retry Connection
            </button>
            <div className="troubleshooting">
              <h3>Troubleshooting:</h3>
              <ul>
                <li>Make sure the Express server is running (npm run server)</li>
                <li>Check if the server is running on port 5000</li>
                <li>Verify CORS is enabled on the server</li>
                <li>Check for firewall or network issues</li>
              </ul>
            </div>
          </>
        )}
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
