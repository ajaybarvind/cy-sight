import { useState, useEffect } from 'react'; // NEW: useEffect added
import axios from 'axios';
import './App.css';

function App() {
  const [ip, setIp] = useState('');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]); // NEW: State to hold the report history

  // NEW: Function to fetch the history from our backend
  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/reports');
      setHistory(response.data);
    } catch (err) {
      console.error("Could not fetch history", err);
    }
  };

  // NEW: useEffect hook to run fetchHistory() when the component first loads
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
    setReport(null);

    try {
      const response = await axios.get(`http://localhost:3000/check-ip/${ip}`);
      setReport(response.data);
      fetchHistory(); // NEW: Refresh the history list after a new check
    } catch (err) {
      setError('Failed to fetch data. Is the backend server running?');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Cy-SIGHT</h1>
        <p>Your Personal Threat Intelligence Dashboard</p>
      </header>

      <div className="input-group">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          placeholder="Enter IP address (e.g., 8.8.8.8)"
        />
        <button onClick={handleCheckIp} disabled={isLoading}>
          {isLoading ? 'Checking...' : 'Check IP'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {report && (
        <div className="report-card">
          <h2>Report for: {report.ipAddress}</h2>
          <div className="report-item">
            <strong>Abuse Score:</strong>
            <span className={report.abuseConfidenceScore > 50 ? 'high-risk' : 'low-risk'}>
              {report.abuseConfidenceScore} / 100
            </span>
          </div>
          <div className="report-item">
            <strong>Country:</strong> {report.countryCode}
          </div>
          <div className="report-item">
            <strong>ISP:</strong> {report.isp}
          </div>
        </div>
      )}

      {/* NEW: Section to display the history */}
      <div className="history-section">
        <h2>Recent Checks</h2>
        <ul className="history-list">
          {history.map((item) => (
            <li key={item.id} className="history-item">
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