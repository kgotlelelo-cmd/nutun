require('dotenv').config();
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function fetchSuggestions(searchText) {
  const apiKey = process.env.MAPBOX_API_KEY;
  if (!apiKey) {
    throw new Error('API key is missing. Please set MAPBOX_API_KEY in your .env file.');
  }

  const url = 'https://api.mapbox.com/search/searchbox/v1/suggest';
  const sessionToken = uuidv4();

  try {
    const response = await axios.get(url, {
      params: {
        q: searchText,
        access_token: apiKey,
        session_token: sessionToken
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error.response?.data || error.message);
    throw error;
  }
}

async function forwardGeocode(searchText) {
  const apiKey = process.env.MAPBOX_API_KEY;
  if (!apiKey) {
    throw new Error('API key is missing. Please set MAPBOX_API_KEY in your .env file.');
  }

  const url = 'https://api.mapbox.com/search/geocode/v6/forward';

  try {
    const response = await axios.get(url, {
      params: {
        q: searchText,
        access_token: apiKey
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error performing forward geocoding:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  fetchSuggestions,
  forwardGeocode
};
