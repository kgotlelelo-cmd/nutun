const express = require('express');
const axios = require('axios');
const pool = require('../db/connection');
const router = express.Router();
const { fetchWeatherData } = require('../api/weather.api');
const { fetchSuggestions, forwardGeocode } = require('../api/map.api');

router.get('/', async (req, res) => {
  console.log('Received request to /');
  res.render('home');
});

router.get('/weather', async (req, res) => {
  try {
    const { lat, lon, unit } = req.query;
    const weatherData = await fetchWeatherData(lat, lon, unit);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Error fetching weather data' });
  }
});

router.get('/geocoding', async (req, res) => {
  const { searchText } = req.query;
  try {
    const geocodingData = await forwardGeocode(searchText);
    res.json(geocodingData);
  } catch (error) {
    console.error('Error performing geocoding:', error);
    res.status(500).json({ error: 'Error performing geocoding' });
  }
});

router.get('/suggestions', async (req, res) => {
  const { searchText } = req.query;
  try {
    const suggestions = await fetchSuggestions(searchText);
    res.json(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Error fetching suggestions' });
  }
});

router.post('/save-weather', async (req, res) => {
  const { address, current, lat, lon, timezone, timezone_offset } = req.body;
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [locationResult] = await connection.execute(
      `INSERT INTO Location (latitude, longitude, address, timezone, timezone_offset) 
      VALUES (?, ?, ?, ?, ?)`,
      [lat, lon, address, timezone, timezone_offset]
    );

    const locationId = locationResult.insertId;

    const [currentWeatherResult] = await connection.execute(
      `INSERT INTO CurrentWeather (location_id, timestamp, sunrise, sunset, temperature, 
      feels_like, pressure, humidity, dew_point, uvi, clouds, visibility, wind_speed, wind_deg, wind_gust) 
      VALUES (?, FROM_UNIXTIME(?), FROM_UNIXTIME(?), FROM_UNIXTIME(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        locationId,
        current.dt,
        current.sunrise,
        current.sunset,
        current.temp,
        current.feels_like,
        current.pressure,
        current.humidity,
        current.dew_point,
        current.uvi,
        current.clouds,
        current.visibility,
        current.wind_speed,
        current.wind_deg,
        current.wind_gust
      ]
    );

    const currentWeatherId = currentWeatherResult.insertId;

    for (const condition of current.weather) {
      await connection.execute(
        `INSERT INTO WeatherConditions (current_weather_id, weather_id, main, description, icon) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          currentWeatherId,
          condition.id,
          condition.main,
          condition.description,
          condition.icon
        ]
      );
    }

    await connection.commit();

    connection.release();

    res.json({ success: true });
  } catch (error) {
    console.error(error);

    if (connection) {
      await connection.rollback();
      connection.release();
    }

    res.status(500).json({ error: 'Failed to save data' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // Query to fetch all data with relationships
    const [rows] = await connection.execute(`
      SELECT 
        L.id AS location_id,
        L.latitude,
        L.longitude,
        L.address,
        L.timezone,
        L.timezone_offset,
        CW.id AS current_weather_id,
        CW.timestamp,
        CW.sunrise,
        CW.sunset,
        CW.temperature,
        CW.feels_like,
        CW.pressure,
        CW.humidity,
        CW.dew_point,
        CW.uvi,
        CW.clouds,
        CW.visibility,
        CW.wind_speed,
        CW.wind_deg,
        CW.wind_gust,
        WC.weather_id,
        WC.main,
        WC.description,
        WC.icon
      FROM Location L
      LEFT JOIN CurrentWeather CW ON L.id = CW.location_id
      LEFT JOIN WeatherConditions WC ON CW.id = WC.current_weather_id
    `);

    connection.release();

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
