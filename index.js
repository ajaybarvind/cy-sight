// Load our secret API key and import our tools
require('dotenv').config();
const express = require('express');
const axios = require('axios');

// Initialize our express app (the server)
const app = express();
const port = 3000; // The 'port' our server will listen on

// This is our main API endpoint. It will listen for requests at /check-ip/:ipAddress
app.get('/check-ip/:ipAddress', async (req, res) => {
  // Get the IP address from the URL parameters
  const ipAddress = req.params.ipAddress;
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  console.log(`Received request to check IP: ${ipAddress}`);

  try {
    const apiResponse = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: {
        ipAddress: ipAddress,
        maxAgeInDays: 90
      },
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    });

    // Send the data from AbuseIPDB back to the user's browser
    res.json(apiResponse.data);

  } catch (error) {
    console.error('Error fetching data:', error.response.data);
    // If something goes wrong, send an error message
    res.status(500).json({ error: 'Failed to fetch data from AbuseIPDB' });
  }
});

// This command starts our server and makes it listen for requests
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log('Ready to check IP addresses!');
});