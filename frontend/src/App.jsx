import { useState } from 'react';
import axios from 'axios';
import './App.css'; // We will create this file next

function App() {
  const [ip, setIp] = useState(''); // State to hold the IP address from the input box
  const [report, setReport] = useState(null); // State to hold the result from our API
  const [isLoading, setIsLoading] = useState(false); // State to show a loading message
  const [error, setError] = useState(null); // State to show any errors

  const handleCheckIp = async () => {
    if (!ip) {
      setError('Please enter an IP address.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      // This is the magic! We are calling our own backend server.
      const response = await axios.get(`http://localhost:3000/check-ip/${ip}`);
      setReport(response.data);
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
    </div>
  );
}

export default App;