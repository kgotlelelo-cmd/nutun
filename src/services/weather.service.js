const { get } = require('jquery');
const pool = require('../db/connection');
const { forwardGeocode } = require('../api/map.api');
const { fetchWeatherData } = require('../api/weather.api');

async function getWeather(address) {

  const geocodingData = await forwardGeocode(address);
  const coordinates = geocodingData.features[0].geometry.coordinates;
  const lat = coordinates[1];
  const lon = coordinates[0];

  const weatherData = await fetchWeatherData(lat, lon);

  return weatherData;
}

async function getWeatherHistory() {
  const connection = await pool.getConnection();

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

  return rows;
}

async function saveWeatherData(weatherData) {

  const { address, current, lat, lon, timezone, timezone_offset } = weatherData;
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
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    throw error;
  }
}

module.exports = {
  getWeatherHistory,
  saveWeatherData,
  getWeather
};