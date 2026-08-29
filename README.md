# 🚀 Ritesh Kumar Rana — Portfolio

A full-stack personal portfolio web application built with **React**, **Express**, and **PostgreSQL**. Features a real-time chat system, an interactive photo gallery, a playable RC Pathfinder game with phone-as-controller support, and a complete authentication system.

---

## ✨ Features

### 🏠 Home
- Personal introduction with profile summary, education, skills, and projects
- Glassmorphism-styled UI with smooth animations
- Responsive layout with dark/light mode support

### 💬 Real-Time Chat
- WebSocket-powered live messaging between authenticated users
- Online presence indicators and message history
- Persistent messages stored in PostgreSQL

### 🖼️ Gallery
- Interactive photo gallery showcasing images
- Beautifully styled with hover effects and transitions

### 🎮 RC Pathfinder Game
- Fully playable car navigation game rendered on HTML5 Canvas
- **Phone Controller** — scan a QR code to use your phone as a steering wheel via WebSocket
- HUD with live stats: speed, time, distance, collisions, and score
- Game statistics tracking (high score, games played, best time, etc.)

### 👤 Authentication & Accounts
- Secure signup/login with JWT-based authentication
- Profile picture upload with cropping support
- Password management (change & forgot password)
- Personal game statistics dashboard

---

## 🛠️ Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Vite 8, Lucide Icons               |
| **Backend**  | Express 5, Node.js                                            |
| **Database** | PostgreSQL (via `pg`)                                         |
| **Realtime** | WebSocket (`ws`) for chat and game controller                 |
| **Auth**     | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)                     |
| **Security** | Helmet, CORS, Express Rate Limit                              |
| **Maps**     | Leaflet + React-Leaflet                                       |
| **Other**    | QR Code generation, Image cropping, Gzip compression (morgan) |

---

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── controllers/       # Auth & chat request handlers
│   ├── middleware/         # JWT auth middleware
│   ├── models/            # PostgreSQL table schemas
│   ├── routes/            # API route definitions
│   └── websocket/         # Chat & game WebSocket servers
├── public/                # Static assets (images, icons)
├── src/
│   ├── assets/            # Images & SVGs
│   ├── components/        # Reusable UI components (Navbar, Header, etc.)
│   ├── context/           # React context (AuthContext)
│   ├── data/              # GeoJSON & location data
│   ├── games/
│   │   └── rc-pathfinder/ # Complete game engine (physics, rendering, scoring)
│   └── pages/             # Route pages (Home, Chat, Gallery, Games, etc.)
├── controller.html        # Phone controller UI for RC Pathfinder
├── server.js              # Express server entry point
├── db.js                  # PostgreSQL connection pool
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** database
- **npm**

### 1. Clone the Repository

```bash
git clone https://github.com/riteshrts2k4757-star/Portfolio.git
cd Portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

### 4. Run in Development

```bash
# Start both Vite dev server and Express backend
npm run dev:all
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### 5. Run in Production

```bash
# Build the React frontend
npm run build

# Start the production server (serves both API & frontend)
npm start
```

The entire app will be available at **http://localhost:5000**.

---

## 📜 Available Scripts

| Script          | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Start Vite dev server (frontend only)               |
| `npm run server`| Start Express backend server                        |
| `npm run dev:all`| Start frontend + backend concurrently (development)|
| `npm run build` | Build the React app for production                  |
| `npm start`     | Start the production server                         |
| `npm run lint`  | Lint source code with oxlint                        |

---

## 🎮 Phone Controller

The RC Pathfinder game supports using your **phone as a controller**:

1. Open the **Games** page and start RC Pathfinder
2. Click the **Phone** button in the game
3. Scan the QR code with your phone
4. Tilt your phone to steer the car!

The controller communicates over WebSocket through the main server, so it works over any network — no extra ports or local network required.

---

## 🔒 API Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/auth/register`        | Create a new account     |
| POST   | `/api/auth/login`           | Login & receive JWT      |
| GET    | `/api/auth/me`              | Get current user profile |
| PUT    | `/api/auth/profile-picture` | Update profile picture   |
| GET    | `/api/auth/game-stats`      | Get game statistics      |
| POST   | `/api/auth/game-stats`      | Save game statistics     |
| GET    | `/api/chat/messages/:id`    | Get chat messages        |
| GET    | `/api/chat/users`           | Get all chat users       |

---

## 👨‍💻 Author

**Ritesh Kumar Rana**
B.Tech Information Technology — BIT Sindri, Dhanbad

---

## 📄 License

This project is private and not licensed for public distribution.
