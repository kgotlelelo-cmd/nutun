require('dotenv').config();
const axios = require('axios');

async function fetchWeatherData(lat, lon, units = 'standard') {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    throw new Error('API key is missing. Please set OPENWEATHERMAP_API_KEY in your .env file.');
  }

  const url = 'https://api.openweathermap.org/data/3.0/onecall';

  try {
    const response = await axios.get(url, {
      params: {
        lat,
        lon,
        exclude: 'hourly,minutely',
        appid: apiKey,
        units
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  fetchWeatherData
};