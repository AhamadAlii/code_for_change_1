const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

// Cache object to store API response
let cache = null;

// Function to fetch news from API
async function fetchHealthNews() {
    try {
        console.log('Fetching fresh data from MediaStack API...');
        const API_URL = 'https://api.mediastack.com/v1/news?access_key=d4533d1f0085837778ce79ae393d41f1&categories=health&languages=en&limit=100';
        const response = await axios.get(API_URL);
        cache = response.data;  // Store data in cache
        return cache;
    } catch (error) {
        console.error('Error fetching health news:', error);
        throw new Error('Failed to fetch health news');
    }
}

// Single API endpoint with caching
app.get('/health-news', async (req, res) => {
    if (cache) {
        return res.json(cache);
    }

    try {
        const data = await fetchHealthNews();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
