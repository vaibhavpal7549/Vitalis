# 🧬 Vitalis AI — Digital Twin Health Habit Coach

A production-ready AI-powered health coaching platform that builds a **Digital Twin** of the user from lifestyle data, predicts future health outcomes, and provides personalized recommendations.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS3-blue) ![License](https://img.shields.io/badge/license-MIT-yellow)

---

## ✨ Features

### Core
- 🔐 **Authentication** — JWT + Google OAuth, protected routes
- 📊 **Dashboard** — Real-time health metrics with animated score rings
- 📝 **Health Logger** — Log 8 daily metrics with slider controls
- 🧬 **Digital Twin** — AI-generated health avatar with 5 composite scores
- 📈 **Analytics** — 6 trend charts with 7d/30d/90d period selection

### AI-Powered
- 🔮 **Predictions** — 30-day forecasts for weight, fitness, health score
- 💡 **Recommendations** — Quantified suggestions with Explainable AI
- 🧪 **Future Simulator** — "What-if" scenario projections
- ⚠️ **Risk Detection** — Burnout, dehydration, sedentary, overtraining alerts

### Gamification
- 🔥 **Streak Counter** — Daily logging streaks
- 🏆 **10 Achievements** — Badges with unlock animations
- ⭐ **Level System** — XP-based progression

### Reports & Admin
- 📋 **Weekly AI Report** — Week-over-week comparison with highlights
- 📄 **PDF Export** — Client-side report generation
- 🛡️ **Admin Panel** — User management, platform analytics, health stats

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Recharts, Framer Motion |
| **Backend** | Node.js, Express.js, Mongoose ODM |
| **Database** | MongoDB (Atlas compatible) |
| **Auth** | JWT (access + refresh), Passport.js (Google OAuth 2.0) |
| **AI** | Custom: Linear Regression, Moving Averages, Trend Analysis |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd Vitalis

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# In server/ directory
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
```

### 3. Seed Sample Data

```bash
cd server
npm run seed
```

This creates:
- **Demo user**: `demo@vitalis.ai` / `demo123456` (30 days of health data)
- **Admin user**: `admin@vitalis.ai` / `admin123456`

### 4. Start Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
Vitalis/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── api/               # Axios client + API services
│   │   ├── components/        # Reusable components
│   │   ├── contexts/          # React Context (Auth)
│   │   ├── layouts/           # Main layout with sidebar
│   │   ├── pages/             # 11 page components
│   │   └── index.css          # Tailwind + design system
│   └── tailwind.config.js
│
├── server/                    # Express.js backend
│   ├── config/                # DB, Passport, Constants
│   ├── controllers/           # 8 route controllers
│   ├── middleware/             # Auth, Admin, Validation, Errors
│   ├── models/                # 5 Mongoose schemas
│   ├── routes/                # 8 route modules
│   ├── services/              # 6 AI engine modules
│   ├── utils/                 # Linear regression, moving avg, helpers
│   └── seed/                  # Sample data seeder
```

---

## 🧠 AI Modules

| Module | Purpose |
|--------|---------|
| **Health Score Calculator** | Weighted 0-100 score from 6 sub-scores |
| **Trend Analysis Engine** | SMA, EMA, linear regression, anomaly detection |
| **Risk Detection Engine** | Pattern-based burnout, dehydration, sedentary alerts |
| **Recommendation Generator** | Quantified suggestions with impact + reasoning |
| **Future Simulation Engine** | What-if scenario projections with gradual transitions |
| **Digital Twin Builder** | Composite twin profile with history tracking |

---

## 🗄️ Database Schemas

- **User** — Profile, streak, level, auth, preferences
- **HealthLog** — Daily metrics (compound unique: userId + date)
- **DigitalTwin** — 5 scores, risk factors, score history
- **Prediction** — 30-day forecasts, chart data, recommendations
- **Achievement** — Unlocked badges per user

---

## 🌐 API Endpoints

- `POST /api/auth/signup` • `POST /api/auth/login` • `GET /api/auth/me`
- `POST /api/health/log` • `GET /api/health/logs` • `GET /api/health/logs/today`
- `GET /api/twin` • `POST /api/twin/refresh`
- `POST /api/predictions/generate` • `GET /api/predictions`
- `POST /api/simulator/simulate`
- `GET /api/achievements` • `POST /api/achievements/check`
- `GET /api/reports/weekly`
- `GET /api/admin/users` • `GET /api/admin/analytics`

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 📄 License

MIT License
