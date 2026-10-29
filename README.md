# 🚀 Ritesh Kumar Rana — Portfolio

A full-stack personal portfolio web application built with **React**, **Express**, and **Supabase (PostgreSQL)**. Features a real-time chat system with AI integration, an interactive photo gallery, a playable RC Pathfinder game with phone-as-controller support, a comprehensive Tour Booking system, and a complete authentication system with email verification.

---

## ✨ Features

### 🏠 Home
- Responsive developer portfolio highlighting full-stack, IoT, and applied ML work
- Interactive project previews, engineering architecture, skills filters, and education
- **EcoGrid — Sustainable Energy Utilization**: React/Vite and Flask/XGBoost project showcase for solar and wind telemetry, predictive panel cleaning, three-class turbine fault detection, and energy distribution prioritized across critical, industrial, local, and national loads
- EcoGrid's interactive preview covers generation, priority distribution, and maintenance; displayed figures are illustrative sample data, not live telemetry
- Persistent light/dark themes with green, orange, and purple accent choices
- Responsive desktop and mobile navigation, reduced-motion support, and keyboard-accessible controls

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
- Contact form with direct email fallback
- Nodemailer delivery when `EMAIL_USER` and `EMAIL_PASS` are configured
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

### Selected project

**EcoGrid — Sustainable Energy Utilization**

The portfolio showcase presents a renewable-energy monitoring and operations project: telemetry-based panel-cleaning recommendations, turbine fault classification, and priority-aware distribution across critical, industrial, local, and national loads. Its project details describe the XGBoost prediction workflow and React/Flask stack.
Source: [Sustainable_Utilization on GitHub](https://github.com/riteshrts2k4757-star/Sustainable_Utilization).

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

### Test from a phone on your hotspot

1. Connect the Windows laptop and phone to the same phone hotspot.
2. Double-click `start-phone-test.bat` from the project folder. It opens separate windows for the frontend (port `5173`) and backend (port `5000`); keep both open.
3. In Windows Command Prompt, run `ipconfig`. Under the Wi-Fi adapter connected to the phone hotspot, note its `IPv4 Address` (do not use a WSL, Docker, or loopback address).
4. On the phone, open `http://<that-IPv4-address>:5173`, for example `http://192.168.1.23:5173`.

The Vite frontend and Express backend already listen on network interfaces. The frontend uses the same hostname as the page for API and WebSocket requests, so it reaches the laptop backend at port `5000` rather than the phone's own `localhost`. Local email verification links also use the current development hostname when the request comes from Vite on port `5173`.

The portfolio's static pages and RC Pathfinder canvas can run without the backend. Login, registration, chat, tour data/bookings, contact requests, and saved game stats need the Express backend and a configured Supabase project. AI chat additionally needs `GEMINI_API_KEY`; email delivery needs the email settings in `.env`.

If Windows Firewall blocks access, first set the hotspot's Windows network profile to **Private** in **Settings → Network & Internet → Wi-Fi → the connected hotspot → Network profile type**. In an elevated PowerShell, add inbound rules for only the two development ports on the Private profile:

```powershell
New-NetFirewallRule -DisplayName "Portfolio phone test - Vite" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173 -Profile Private
New-NetFirewallRule -DisplayName "Portfolio phone test - API" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000 -Profile Private
```

Do not disable Windows Firewall. Confirm the network category with `Get-NetConnectionProfile`. If the page still will not load, verify both service windows show that their servers started, confirm the phone and laptop are still on the same hotspot, check the hotspot's connected-device/client-isolation settings, and re-check the Wi-Fi IPv4 address with `ipconfig`.

---

## 📜 Available Scripts

| Script          | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Start Vite dev server (frontend only)               |
| `npm run dev:phone` | Start Vite on all interfaces for phone/LAN testing |
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
