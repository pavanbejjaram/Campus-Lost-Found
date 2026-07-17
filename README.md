# Campus Lost & Found

A full-stack web application for reporting, claiming, and reuniting lost items across a college campus. Includes real-time chat between the person who lost an item and the person who found it.

## Features

- Report lost or found items with photos, location, and date
- Browse and filter items by status (lost / found / resolved)
- Claim an item with proof of ownership
- Real-time chat between students via WebSocket
- Admin dashboard to approve/reject items and claims

## Tech Stack

**Backend:** Java 21, Spring Boot 3.3.4, Spring Data JPA, MySQL, WebSocket
**Frontend:** React (Vite)
**Build tool:** Maven

## Prerequisites

- Java 21 (JDK)
- Maven (or use the included `mvnw` / `mvnw.cmd` wrapper — no separate install needed)
- Node.js 18+ and npm
- MySQL Server running locally (or accessible via network)

## Setup

1. Clone or unzip the project.
2. Make sure MySQL is running. The app auto-creates the database on first run — no manual schema setup needed.
3. Default DB connection assumes:
   - Host: `localhost`, Port: `3306`
   - Username: `root`, Password: `root`
   - Database name: `lost_found_db_v2`

   To use different credentials, either edit `src/main/resources/application.properties` directly, or set these environment variables before running:

   ## Running the app

### Option A — Single service (recommended, matches production)

```bash
cd frontend
npm install
npm run build

# from the project root
cp -r frontend/dist/* src/main/resources/static/

./mvnw spring-boot:run       # Mac/Linux
.\mvnw.cmd spring-boot:run   # Windows
```

Open **http://localhost:8081**

### Option B — Frontend hot-reload (for active UI development)

Terminal 1 (backend):
```bash
./mvnw spring-boot:run
```

Terminal 2 (frontend):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** (the dev server proxies API/WebSocket calls to the backend automatically)

## Default login

On first run, demo data is seeded automatically, including an admin account:

- **Email:** `admin@college.edu`
- **Password:** `admin123`

## Notes

- Uploaded images are stored in an `uploads/` folder at the project root (created automatically).
- Passwords are currently stored in plain text — fine for a course project, not production-ready security.
