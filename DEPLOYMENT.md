# Vitalis AI - Comprehensive Deployment & Operations Guide

Welcome to the **Vitalis AI** deployment documentation. This guide details everything required to build, configure, deploy, run, and troubleshoot the Vitalis AI platform in both development and production environments.

---

## 1. Project Overview

Vitalis AI is a premium, state-of-the-art Digital Twin Health & Habit Coach. It features:
* **Backend**: Express/Node.js REST API with Mongoose and MongoDB Atlas database.
* **Frontend**: React SPA styled with Tailwind CSS, built with Vite, utilizing Framer Motion and Recharts for premium animations/graphics.
* **Advanced Engines**:
  * **Digital Twin Builder**: Evaluates user scores (Sleep, Fitness, Nutrition, Consistency).
  * **Prediction Engine**: Performs 30-day health predictions and weight trending forecasts.
  * **Future Simulator**: Allows side-by-side scenario modeling.
  * **Gamification Service**: Computes logging streaks, badge achievements, and level-ups.
  * **Report Builder**: Formulates weekly summaries with high-fidelity analytics.

---

## 2. Prerequisites

* **Node.js**: `v18.x` or higher (tested on `v24.x`)
* **npm**: `v9.x` or higher
* **MongoDB**: A local instance for development or a MongoDB Atlas Account for production.
* **Google Cloud Account**: For Google OAuth 2.0 configuration.

---

## 3. Repository Structure

```
Vitalis/
├── client/                 # React Frontend (Vite Single Page Application)
│   ├── src/                # Component & Routing Logic
│   │   ├── api/            # Axios API config
│   │   ├── components/     # UI elements
│   │   └── pages/          # Full page views
│   ├── package.json        # Frontend scripts and dependencies
│   └── vite.config.js      # Vite build & proxy configurations
├── server/                 # Express Backend API
│   ├── config/             # Database connection & passport config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth filters, validation, error handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST route mapping
│   ├── seed/               # Database seed scripts
│   ├── services/           # Digital Twin & ML simulation engines
│   ├── utils/              # Helper functions & validators
│   ├── package.json        # Backend scripts and dependencies
│   └── server.js           # Main Entry Point
└── DEPLOYMENT.md           # Operational documentation (this file)
```

---

## 4. Environment Variables

Environment variables are managed using `.env` files in development, and through platform dashboards (Render/Vercel) in production.

### Backend Environment Variables (`server/.env`)

| Variable Name | Description | Status | Example (Local Dev) |
| :--- | :--- | :---: | :--- |
| `PORT` | Local network binding port. | Optional | `5050` (Recommended) |
| `MONGODB_URI` | MongoDB Atlas / Local cluster URI. | **Required** | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key used to sign Access Tokens. | **Required** | `V!talis@2026Shivika@Vaibhav` |
| `JWT_REFRESH_SECRET` | Secret key used to sign Refresh Tokens. | **Required** | `vitalis_refresh_secret_dev_2000` |
| `JWT_EXPIRE` | Expiry duration for Access Tokens. | Optional | `7d` |
| `JWT_REFRESH_EXPIRE` | Expiry duration for Refresh Tokens. | Optional | `30d` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID for Google Login. | **Required** | `283186302828-ffrg5...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET`| OAuth 2.0 Client Secret from Google. | **Required** | `GOCSPX-0nEQWAMT...` |
| `GOOGLE_CALLBACK_URL` | Route where Google redirects after auth. | **Required** | `http://localhost:5050/api/auth/google/callback` |
| `CLIENT_URL` | Base URL of the Frontend client (for CORS). | **Required** | `http://localhost:5173` |
| `NODE_ENV` | Mode settings (`development`/`production`). | Optional | `development` |

### Frontend Environment Variables (`client/.env` / Platform Dashboard)

| Variable Name | Description | Status | Example (Local Dev) |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | Base API Endpoint URL for the backend. | **Required** | `http://localhost:5050/api` |

---

## 5. Local Development Setup

Follow these steps to run the application locally on your developer machine.

### Step 1: Clone and Clean Ports
Ensure ports `5173` (Vite) and `5050` (Express) are not occupied:
```powershell
# Stop any processes using 5050 (recommended local backend port)
Get-NetTCPConnection -LocalPort 5050 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Step 2: Configure Environment Files
1. Create `server/.env` with local dev values (use `PORT=5050` as port `5000` is blocked by Windows TCP exclusions).
2. Ensure you have the `VITE_API_URL` configured in the client configuration, or let the client fallback automatically to `http://localhost:5050/api`.

### Step 3: Install Dependencies & Run Seeding
In the project root, install and run seeding:
```bash
# Install backend packages
cd server
npm install

# Seed the database
npm run seed
```

### Step 4: Launch Applications
Open two terminals to run the servers:

* **Terminal 1: Start Backend**
  ```bash
  cd server
  npm run dev
  ```
  *(Launches server using Nodemon on port `5050`)*

* **Terminal 2: Start Frontend**
  ```bash
  cd client
  npm install
  npm run dev
  ```
  *(Launches Vite dev server on port `5173`)*

---

## 6. Backend Deployment (Render)

Render is the recommended host for the Vitalis backend service.

1. Create a free account on [Render](https://render.com).
2. Connect your GitHub repository.
3. Select **New Web Service** and configure as follows:
   * **Root Directory**: `server`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add all required backend variables in the **Environment** tab:
   * `NODE_ENV=production`
   * `PORT=10000` (Render will bind automatically, but you should keep it matching)
   * `MONGODB_URI` = `<Your MongoDB Atlas connection string>`
   * `JWT_SECRET` = `<Secure Random Key>`
   * `JWT_REFRESH_SECRET` = `<Secure Random Key>`
   * `JWT_EXPIRE=7d`
   * `JWT_REFRESH_EXPIRE=30d`
   * `CLIENT_URL` = `https://your-frontend.vercel.app`
   * `GOOGLE_CALLBACK_URL` = `https://your-backend.onrender.com/api/auth/google/callback`
5. Click **Deploy Web Service**.

---

## 7. Frontend Deployment (Vercel)

Vercel is the recommended host for the React frontend client.

1. Sign up on [Vercel](https://vercel.com).
2. Import your GitHub repository.
3. In Project Settings, configure:
   * **Root Directory**: `client`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Define Environment Variables:
   * `VITE_API_URL` = `https://your-backend.onrender.com/api`
5. Click **Deploy**.

---

## 8. Database Configuration (MongoDB Atlas)

Ensure your database is properly secured and optimized.

1. **Whitelisting**: In your MongoDB Atlas Dashboard, navigate to **Network Access** and add IP address `0.0.0.0/0` (required for Render server clusters unless static IP addons are utilized).
2. **Schema Optimization**: The schemas automatically register crucial search indexes:
   * **User Model**: `email` (unique index), `googleId` (sparse index).
   * **Digital Twin**: `userId` (unique index).
   * **Achievement**: `userId` (unique index).
   
   *(Note: Redundant duplicate indexes have been removed from the models to prevent Mongoose performance warning logs)*.

---

## 9. Authentication Configuration

### JWT Setup
Authentication utilizes double-token mechanics:
* Access tokens are generated using the `JWT_SECRET` and expire in 7 days (`JWT_EXPIRE`).
* Refresh tokens are signed with `JWT_REFRESH_SECRET` and expire in 30 days (`JWT_REFRESH_EXPIRE`).
* The frontend automatically attempts token refresh interceptors on receiving HTTP 401.

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create/select a project, navigate to **APIs & Services** → **Credentials**.
3. Create an **OAuth Client ID** for Web Applications.
4. Set Authorized origins:
   * `http://localhost:5173` (development)
   * `https://your-frontend.vercel.app` (production)
5. Set Authorized redirect URIs:
   * `http://localhost:5050/api/auth/google/callback` (development callback on port 5050)
   * `https://your-backend.onrender.com/api/auth/google/callback` (production)

---

## 10. CORS Configuration

Cross-Origin Resource Sharing is controlled within `server/app.js` using the standard Express CORS middleware:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
```
Ensure `CLIENT_URL` matches the frontend domain name *exactly* without a trailing slash.

---

## 11. Build, Start & Deployment Commands Reference

| Layer | Environment | Step | Command |
| :--- | :--- | :--- | :--- |
| **Backend** | Local / Dev | Install Packages | `npm install` (in `server/`) |
| **Backend** | Local / Dev | Start Server | `npm run dev` (in `server/`) |
| **Backend** | Local / Dev | Seed Database | `npm run seed` (in `server/`) |
| **Backend** | Production | Build / Install | `npm install` |
| **Backend** | Production | Run Server | `npm start` (runs `node server.js`) |
| **Frontend** | Local / Dev | Install Packages | `npm install` (in `client/`) |
| **Frontend** | Local / Dev | Start Client | `npm run dev` (in `client/`) |
| **Frontend** | Production | Build Assets | `npm run build` (outputs to `/dist`) |
| **Frontend** | Production | Preview Locally | `npm run preview` |

---

## 12. Health Check Endpoints

A generic HTTP health checker is exposed by the API to check service availability.
* **Endpoint URL**: `GET /api/health-check`
* **Response Sample (HTTP 200)**:
  ```json
  {
    "status": "OK",
    "timestamp": "2026-06-26T09:00:00.000Z"
  }
  ```
Configure this endpoint in Render under **Health Check Path** (`/api/health-check`) to allow zero-downtime deployment rollouts.

---

## 13. Post-Deployment Verification Checklist

Once services are running, run these checks to ensure operational readiness:

- [ ] **DB Health**: Check database logging: "✅ MongoDB Connected".
- [ ] **Base API Routing**: Hit `https://your-backend.onrender.com/api/health-check` and confirm HTTP 200.
- [ ] **Registration/Signup**: Navigate to `/signup` on the frontend, register a new account, and check that the Dashboard is displayed.
- [ ] **Login Flow**: Logout and sign back in using the created credentials.
- [ ] **Habit Logging**: Log steps, water, and sleep. Verify the toast popups.
- [ ] **Twin Creation**: Verify that the "Digital Twin" page renders the scores.
- [ ] **PDF Export**: Generate a Weekly report and trigger the "Export PDF" function.
- [ ] **Admin View**: Sign in with `admin@vitalis.ai` / `admin123456` and verify database list metrics.

---

## 14. Troubleshooting & Common Errors

Here are known errors and how to resolve them:

### 1. `EACCES: permission denied 0.0.0.0:5000` (on local startup)
* **Cause**: On Windows, port 5000 is reserved under the default TCP port exclusion range, blocking node bindings.
* **Fix**: Change your local binding port inside `server/.env` to `PORT=5050`. Update the `vite.config.js` proxy target and `client/src/api/axios.js` to reference `5050`.

### 2. `ECONNREFUSED` or MongoDB connection timeout on Atlas URI (Local)
* **Cause**: Node.js standard DNS resolvers fail to process the SRV lookup records in certain ISP/local environments.
* **Fix**: In the backend initialization entrypoint (`server.js`), configure Google DNS servers as the fallback option before starting the database:
  ```javascript
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  ```

### 3. All seeded user logins returning HTTP `401 Unauthorized`
* **Cause**: Seed script hashes the default passwords before running `User.create()`, which triggers Mongoose's own pre-save hashing middleware. This double-hashes seed passwords.
* **Fix**: Provide plain text password strings inside `seedData.js`. The Mongoose pre-save hooks will handle the hashing exactly once.

### 4. Digital Twin/Achievements unique constraint conflicts during seed
* **Cause**: Mongoose schemas registering duplicate indexing definitions, causing index conflicts.
* **Fix**: Remove explicit `schema.index({ userId: 1 }, { unique: true })` lines from the schemas where `userId` is already defined with `unique: true` constraint.

---

## 15. Security Best Practices

1. **Exposed Credentials**: Never check the `.env` configuration file into source control. Add `.env` to `.gitignore`.
2. **CORS Restrictions**: Always replace `CLIENT_URL=*` or generic wildcards with your precise frontend Vercel URL in production.
3. **Database Security**: Whitelist only Render IP addresses if you have a static IP proxy. Otherwise, keep Atlas whitelists restricted to trusted service boundaries.
4. **Token Secrets**: Change default secrets to 64-character hex strings generated via crypto:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

---

## 16. Rollback Strategy

If a deployment fails:
1. **Frontend (Vercel)**:
   * Go to the Vercel Dashboard → Deployments.
   * Identify the last working build, click `...` and choose **Rollback**.
2. **Backend (Render)**:
   * Go to the Render Dashboard.
   * Locate your Web Service → Deployments.
   * Click **Rollback** to reactivate the previous successful build image.
