# Summary

Weather App.
This project demonstrates a simple Node.js application connected to a MySQL database using Docker Compose. The MySQL database is pre-configured with an initialization script.

---

## Prerequisites

Ensure you have the following installed on your system:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## How to Run

### 1. Clone the Repository
Clone the repository to your local machine:
```bash
git clone <repository-url>
cd project-root
```

### 2. Configure Environment Variables
Set up the `.env` file in the root directory with the required variables. Example:
```env
PORT=3000
# MYSQL_HOST=localhost // for local development
MYSQL_HOST=mysql
MYSQL_USER=myuser
MYSQL_PASSWORD=mypassword
MYSQL_DATABASE=mydb
MYSQL_ROOT_PASSWORD=root
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
MAPBOX_API_KEY=your_mapbox_api_key
```

### 3. Start the Containers
Run the following command to build and start the containers:
```bash
docker-compose up --build
```

This will:
- Start a MySQL container with the name `mysql-container`.
- Start a Node.js application container with the name `backend-container`.

### 4. Access the Node.js API
The Node.js application runs on port `3000`. You can test it by navigating to:
```
http://localhost:3000
```
You should see the application's homepage.

---

## Stopping the Containers
To stop the containers, press `Ctrl+C` or run:
```bash
docker-compose down
```

---

## Rebuilding and Resetting the Database
If you need to reset the database and re-run the initialization script:
1. Remove the existing MySQL data volume:
   ```bash
   docker-compose down -v
   ```
2. Restart the containers:
   ```bash
   docker-compose up --build
   ```

---

## Notes
- The MySQL initialization script (`init.sql`) only runs if the MySQL data volume is empty.
- Update the `.env` file to customize database or application configurations.