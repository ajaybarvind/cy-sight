// Load environment variables and import tools
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg'); // Import the pg Pool object
const cors = require('cors');

// --- DATABASE CONFIGURATION ---
const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- SERVER CONFIGURATION ---
const app = express();
const port = 3000;

app.use(cors());

// --- API ENDPOINT ---
app.get('/check-ip/:ipAddress', async (req, res) => {
  const { ipAddress } = req.params;
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  console.log(`Received request to check IP: ${ipAddress}`);

  try {
    // Step 1: Fetch data from AbuseIPDB API
    const apiResponse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: { ipAddress: ipAddress, maxAgeInDays: 90 },
      headers: { 'Key': apiKey, 'Accept': 'application/json' },
    });

    const reportData = apiResponse.data.data;

    // Step 2: Save the relevant data to our PostgreSQL database
    const queryText = `
      INSERT INTO reports(ip_address, abuse_score, country_code, isp)
      VALUES($1, $2, $3, $4)
      RETURNING *;
    `;
    const queryValues = [
      reportData.ipAddress,
      reportData.abuseConfidenceScore,
      reportData.countryCode,
      reportData.isp
    ];
    
    const dbResult = await db.query(queryText, queryValues);
    console.log('Saved to database:', dbResult.rows[0]);

    // Step 3: Send the original API data back to the browser
    res.json(reportData);

  } catch (error) {
    console.error('An error occurred:', error.message);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
});

// --- NEW: API ENDPOINT TO GET ALL REPORTS ---
app.get('/reports', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM reports ORDER BY checked_at DESC LIMIT 20');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reports:', error.message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// --- NEW: API ENDPOINT FOR GEOLOCATION ---
app.get('/geolocate/:ipAddress', async (req, res) => {
  const { ipAddress } = req.params;
  console.log(`Received request to geolocate IP: ${ipAddress}`);

  try {
    // We call the external IP-API.com service
    const geoResponse = await axios.get(`http://ip-api.com/json/${ipAddress}`);
    res.json(geoResponse.data);
  } catch (error) {
    console.error('Error fetching geolocation data:', error.message);
    res.status(500).json({ error: 'Failed to fetch geolocation data' });
  }
});

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});