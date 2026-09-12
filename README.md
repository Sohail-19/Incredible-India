# IncredibleIndia 🇮🇳

A full-stack travel discovery web app showcasing lesser-known hidden gem destinations across India. Built as a flagship portfolio project targeting SWE and AI/ML placements.

**Live Demo:** [Coming soon]
**GitHub:** https://github.com/Sohail-19/Incredible-India

---

## Features

- 🗺️ **Discover Hidden Gems** — Browse 20 lesser-known destinations across India with crowd scoring, seasonal intelligence, and budget estimates
- 🤖 **AI Trip Planner** — Generate personalized day-wise itineraries using Google Gemini AI based on your start city, duration, budget, and travel style
- 📍 **Interactive Map** — Full-screen Leaflet map with all 20 place pins, category filters, and multi-select trip builder
- ❤️ **Wishlist** — Save places and generate AI trips directly from your saved destinations
- 📓 **Travel Journal** — Log and revisit your travel memories
- 🔐 **Auth** — JWT-based authentication with bcrypt password hashing
- 📱 **Mobile-first** — Responsive design with bottom tab navigation

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (custom design tokens) |
| Routing | React Router v6 |
| Maps | Leaflet.js + react-leaflet |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (M0 free tier) |
| Auth | JWT + bcrypt |
| AI | Google Gemini API (gemini-3.1-flash-lite-preview) |
| Images | Cloudinary |
| HTTP | Axios |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, stats, featured places |
| Places | `/places` | Search, filter, Near Me, sort |
| Place Detail | `/places/:slug` | Leaflet map, nearby gems, highlights |
| AI Planner | `/planner` | 4-step wizard, Gemini API |
| Itinerary Result | `/itinerary-result` | Day cards, cost breakdown, save |
| Interactive Map | `/map` | All 20 pins, selection mode |
| Wishlist | `/wishlist` | Saved places, plan trip from wishlist |
| Wishlist Planner | `/planner/wishlist` | Simplified 3-step planner |
| Profile | `/profile` | Stats, itineraries, journal, settings |
| Login / Register | `/login` `/register` | Full auth flow |
| 404 | `*` | "This trail leads nowhere" |

---

## Key Technical Highlights

- **Geospatial search** — MongoDB 2dsphere index for proximity-based "Near Me" place discovery
- **AI itinerary generation** — Gemini API with structured JSON prompting, retry logic for 503s, and wishlist-aware destination prioritization
- **Scroll restoration** — sessionStorage-based manual scroll position tracking to fix React Router conflicts with async data
- **Selection mode map** — Multi-pin selection on Leaflet map with visual state (saffron → green checkmark) and direct planner navigation
- **Auth gate flow** — Unauthenticated users can generate trips; save action triggers AuthGateModal → login → auto-save on return
- **19 screens designed** in Google Stitch with consistent design system (saffron + deep green tokens)

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Gemini API key (free tier at aistudio.google.com)

### Installation

```bash
# Clone the repo
git clone https://github.com/Sohail-19/Incredible-India.git
cd Incredible-India

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/incredibleindia
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Seed the Database

```bash
cd server
npm run seed
```

### Run the App

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

App runs at `http://localhost:3000`

---

## Project Structure

```
Incredible-India/
├── client/                # React frontend
│   └── src/
│       ├── api/           # Axios instances and API calls
│       ├── components/    # Reusable components
│       ├── context/       # AuthContext
│       └── pages/         # All page components
└── server/                # Node.js backend
    ├── models/            # MongoDB schemas
    ├── routes/            # Express routes
    ├── middleware/         # Auth middleware
    └── seed.js            # Database seeder
```

---

## Resume Bullets

- Built full-stack travel discovery web app with React, Node.js, MongoDB Atlas, and Google Gemini AI
- Implemented geospatial search (MongoDB 2dsphere) for proximity-based place discovery
- Integrated Google Gemini API to generate personalized day-wise travel itineraries based on user preferences
- Designed 19 screens in Google Stitch with consistent design system (Tailwind custom tokens)
- Features: AI trip planner, crowd scoring, seasonal intelligence, interactive Leaflet maps, JWT auth

---

## Author

**Sohail Akhtar** — 3rd year IT, GL Bajaj Institute of Technology and Management
- GitHub: [@Sohail-19](https://github.com/Sohail-19)
- LinkedIn: [sohailakhtar19](https://linkedin.com/in/sohailakhtar19)
