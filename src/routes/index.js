const express = require('express');
const axios = require('axios');
const pool = require('../db/connection');
const router = express.Router();

// Home Page
router.get('/', (req, res) => {
  res.render('home');
});

// Fetch Weather Data
router.post('/fetch-weather', async (req, res) => {
  try {
    const { address } = req.body;

    // Fetch coordinates using MapBox
    const mapboxResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: { access_token: process.env.MAPBOX_API_KEY },
    });
    const [longitude, latitude] = mapboxResponse.data.features[0].geometry.coordinates;

    // Fetch weather data using OpenWeatherMap
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { lat: latitude, lon: longitude, appid: process.env.OPENWEATHERMAP_API_KEY },
    });

    res.json(weatherResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Save Weather Data
router.post('/save-weather', async (req, res) => {
  const { address, weatherData } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.execute('INSERT INTO weather_data (address, weather) VALUES (?, ?)', [address, JSON.stringify(weatherData)]);
    connection.release();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Retrieve History
router.get('/history', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM weather_data');
    connection.release();

    res.render('history', { history: rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
