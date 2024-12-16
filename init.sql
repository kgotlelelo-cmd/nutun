CREATE TABLE Location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    address TEXT NOT NULL,
    timezone VARCHAR(50),
    timezone_offset INT
);

CREATE TABLE CurrentWeather (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT,
    timestamp DATETIME NOT NULL,
    sunrise DATETIME,
    sunset DATETIME,
    temperature DECIMAL(5, 2),
    feels_like DECIMAL(5, 2),
    pressure INT,
    humidity INT,
    dew_point DECIMAL(5, 2),
    uvi DECIMAL(4, 2),
    clouds INT,
    visibility INT,
    wind_speed DECIMAL(5, 2),
    wind_deg INT,
    wind_gust DECIMAL(5, 2),
    FOREIGN KEY (location_id) REFERENCES Location(id)
);

CREATE TABLE WeatherConditions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    current_weather_id INT,
    weather_id INT,
    main VARCHAR(50),
    description VARCHAR(100),
    icon VARCHAR(10),
    FOREIGN KEY (current_weather_id) REFERENCES CurrentWeather(id)
); 

INSERT INTO Location (latitude, longitude, address, timezone, timezone_offset)
VALUES (51.3787, 1.4041, '37 Invicta Road North Calsward Midrand', 'Europe/London', 0);

INSERT INTO CurrentWeather (
    location_id, timestamp, sunrise, sunset, temperature, feels_like, pressure, 
    humidity, dew_point, uvi, clouds, visibility, wind_speed, wind_deg, wind_gust
) VALUES (
    1, FROM_UNIXTIME(1734164019), FROM_UNIXTIME(1734162750), FROM_UNIXTIME(1734191163), 
    38.64, 30.87, 1021, 89, 35.69, 0, 100, 10000, 12.75, 276, 17.02
);

INSERT INTO WeatherConditions (current_weather_id, weather_id, main, description, icon)
VALUES (1, 804, 'Clouds', 'overcast clouds', '04d');
