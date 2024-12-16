const express = require('express');
const axios = require('axios');
const pool = require('../db/connection');
const router = express.Router();
const { fetchWeatherData } = require('../api/weather.api');
const { fetchSuggestions, forwardGeocode } = require('../api/map.api');
const { getWeatherHistory, saveWeatherData, getWeather } = require('../services/weather.service');

router.get('/', async (req, res) => {
  res.render('home');
});

router.get('/home-page', async (req, res) => {
  res.render('home', {
    title: 'Home Page',
    message: 'Welcome to the Home Page!'
  });
});

router.get('/weather-page/:address', async (req, res) => {
  const { address } = req.params;
  const weatherData = await getWeather(address);
  res.render('weather',{ weatherData });
});

router.get('/history-page', async (req, res) => {

  const history = await getWeatherHistory();

  res.render('history', { history });
});

router.get('/weather/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const weatherData = await getWeather(address);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching weather data' });
  }
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

  try {

    await saveWeatherData(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const response = await getWeatherHistory();

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
