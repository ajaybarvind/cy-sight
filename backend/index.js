// Load environment variables and import tools
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const cors = require('cors');

// --- DATABASE CONFIGURATION ---
// This configuration is correct for services like Render that use a DATABASE_URL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- SERVER CONFIGURATION ---
const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors()); // ✅ This is the crucial line that allows frontend access
app.use(express.json()); // Middleware to parse JSON bodies


// --- API ENDPOINT: CHECK IP ---
app.get('/check-ip/:ipAddress', async (req, res) => {
  const { ipAddress } = req.params;
  const apiKey = process.env.ABUSEIPDB_API_KEY;
  console.log(`Received request to check IP: ${ipAddress}`);

  try {
    const apiResponse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: { ipAddress: ipAddress, maxAgeInDays: 90 },
      headers: { 'Key': apiKey, 'Accept': 'application/json' },
    });
    const reportData = apiResponse.data.data;

    const queryText = `
      INSERT INTO reports(ip_address, abuse_score, country_code, isp)
      VALUES($1, $2, $3, $4) RETURNING *;
    `;
    const queryValues = [
      reportData.ipAddress,
      reportData.abuseConfidenceScore,
      reportData.countryCode,
      reportData.isp
    ];
    
    await db.query(queryText, queryValues);
    res.json(reportData);

  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// --- API ENDPOINT: GET REPORTS ---
app.get('/reports', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM reports ORDER BY checked_at DESC LIMIT 20');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// --- API ENDPOINT: GEOLOCATION ---
app.get('/geolocate/:ipAddress', async (req, res) => {
  const { ipAddress } = req.params;
  try {
    const geoResponse = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    res.json(geoResponse.data);
  } catch (error) {
    console.error('Error fetching geolocation data:', error.message);
    res.status(500).json({ error: 'Failed to fetch geolocation data' });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});