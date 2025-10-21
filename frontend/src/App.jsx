import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// NEW: Define the base URL for our API.
// It will use the variable from our .env file, or default to localhost if it's not found.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';


function App() {
  const [ip, setIp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedIp, setSelectedIp] = useState(null);
  const [details, setDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      // UPDATED: Uses the API_BASE_URL variable
      const response = await axios.get(`${API_BASE_URL}/reports`);
      setHistory(response.data);
    } catch (err) {
      console.error("Could not fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCheckIp = async () => {
    if (!ip) {
      setError('Please enter an IP address.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSelectedIp(null);
    setDetails(null);

    try {
      // UPDATED: Uses the API_BASE_URL variable
      const response = await axios.get(`${API_BASE_URL}/check-ip/${ip}`);
      setSelectedIp(response.data.ipAddress);
      setDetails({ report: response.data });
      fetchHistory();
    } catch (err) {
      setError('Failed to fetch data. Is the backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = async (ipAddress) => {
    setSelectedIp(ipAddress);
    setIsDetailsLoading(true);
    setDetails(null);

    try {
      // UPDATED: Both calls now use the API_BASE_URL variable
      const [reportRes, geoRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/check-ip/${ipAddress}`),
        axios.get(`${API_BASE_URL}/geolocate/${ipAddress}`)
      ]);
      setDetails({ report: reportRes.data, geo: geoRes.data });
    } catch (err) {
      setError('Could not fetch full details for this IP.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Cy-SIGHT</h1>
        <p>Your Personal Threat Intelligence Dashboard</p>
      </header>

      <div className="input-group">
        <input type="text" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="Enter IP address (e.g., 8.8.8.8)"/>
        <button onClick={handleCheckIp} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check IP'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isDetailsLoading && <div className="loading-message">Loading details...</div>}
      {details && (
        <div className="report-card">
          <h2>Report for: {selectedIp}</h2>
          <div className="report-item">
            <strong>Abuse Score:</strong>
            <span className={details.report.abuseConfidenceScore > 50 ? 'high-risk' : 'low-risk'}>
              {details.report.abuseConfidenceScore} / 100
            </span>
          </div>
          <div className="report-item">
            <strong>Country:</strong> {details.report.countryCode}
          </div>
          {details.geo && (
            <>
              <div className="report-item">
                <strong>Location:</strong> {details.geo.city}, {details.geo.regionName}
              </div>
              <div className="report-item">
                <strong>ISP:</strong> {details.geo.isp}
              </div>
            </>
          )}
        </div>
      )}

      <div className="history-section">
        <h2>Recent Checks</h2>
        <ul className="history-list">
          {history.map((item) => (
            <li key={item.id} className="history-item" onClick={() => handleHistoryClick(item.ip_address)}>
              <span>{item.ip_address}</span>
              <span className={item.abuse_score > 50 ? 'high-risk' : 'low-risk'}>
                Score: {item.abuse_score}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;