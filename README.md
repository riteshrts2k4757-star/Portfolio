# 🚀 Ritesh Kumar Rana — Portfolio

A full-stack personal portfolio web application built with **React**, **Express**, and **Supabase (PostgreSQL)**. Features a real-time chat system with AI integration, an interactive photo gallery, a playable RC Pathfinder game with phone-as-controller support, a comprehensive Tour Booking system, and a complete authentication system with email verification.

---

## ✨ Features

### 🏠 Home
- Personal introduction with profile summary, education, skills, and projects
- Glassmorphism-styled UI with smooth animations
- Responsive layout with dark/light mode support

### 💬 Real-Time Chat & AI Assistant
- WebSocket-powered live messaging between authenticated users
- Integrated **AI Chatbot** powered by the Gemini API (gemini-3.6-flash)
- Chat history clearing and granular message deletion
- Online presence indicators and persistent message history

### ✈️ Tour Booking System
- Browse, explore, and book various tour packages
- **Admin Dashboard**: Manage users, tours, and bookings
- **Guide Dashboard**: Dedicated portal for tour guides
- Simulated payment confirmation flow

### 🖼️ Gallery
- Interactive photo gallery showcasing images
- Beautifully styled with hover effects and transitions

### 🎮 RC Pathfinder Game
- Fully playable car navigation game rendered on HTML5 Canvas
- **Phone Controller** — scan a QR code to use your phone as a steering wheel via WebSocket
- HUD with live stats: speed, time, distance, collisions, and score
- Game statistics tracking (high score, games played, best time, etc.)

### 👤 Authentication & Security
- Secure signup/login with JWT-based authentication
- **Email Verification Flow**: JWT-powered email links via Nodemailer to verify users before database insertion
- Profile picture upload with cropping support
- Password management (change & forgot password)
- Rate Limiting on public APIs to prevent spam

### 📬 Contact Us
- Premium Glassmorphic UI design
- Real email delivery functionality via Nodemailer integration
- Rate-limited to prevent spam

---

## 🛠️ Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Vite 8, Lucide Icons               |
| **Backend**  | Express 5, Node.js                                            |
| **Database** | Supabase (PostgreSQL)                                         |
| **Realtime** | WebSocket (`ws`) for chat and game controller                 |
| **Auth**     | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`)                     |
| **AI**       | Google Gemini API (`@google/genai`)                           |
| **Email**    | Nodemailer                                                    |
| **Security** | Helmet, CORS, Express Rate Limit                              |
| **Maps**     | Leaflet + React-Leaflet                                       |

---

## 📁 Project Structure

```
portfolio/
├── backend/
│   ├── controllers/       # Auth, chat, tour, ai, & contact handlers
│   ├── middleware/        # JWT auth & security middlewares
│   ├── models/            # Supabase interaction models
│   ├── routes/            # API route definitions
│   └── websocket/         # Chat & game WebSocket servers
├── public/                # Static assets (images, icons)
├── src/
│   ├── components/        # Reusable UI components
│   ├── context/           # React context (AuthContext)
│   ├── games/             # RC Pathfinder game engine
│   └── pages/             # Route pages (Home, Chat, Tours, Admin, etc.)
├── server.js              # Express server entry point
├── db.js                  # Supabase connection setup
└── package.json
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** v18+
- **Supabase** Project
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
# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Authentication
JWT_SECRET=your_jwt_secret_key

# Email System
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_SECRET=your_email_verification_secret_key

# AI Chatbot
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run in Development

```bash
# Start both Vite dev server and Express backend
npm run dev:all
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

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

The controller communicates over WebSocket through the main server, so it works over any network.

---

## 🔒 Selected API Endpoints

| Method | Endpoint                    | Description              |
| ------ | --------------------------- | ------------------------ |
| POST   | `/api/auth/register`        | Initiate Sign up (sends email) |
| POST   | `/api/auth/verify-email`    | Verify email & create account |
| POST   | `/api/auth/login`           | Login & receive JWT      |
| POST   | `/api/contact`              | Send Contact Us email    |
| POST   | `/api/chat/ai`              | Communicate with Gemini AI |
| DELETE | `/api/chat/messages`        | Delete chat messages     |
| GET    | `/api/tours`                | Get all available tours  |

---

## 👨‍💻 Author

**Ritesh Kumar Rana**
B.Tech Information Technology — BIT Sindri, Dhanbad

---

## 📄 License

This project is private and not licensed for public distribution.
