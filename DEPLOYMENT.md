# Deployment Guide — Vitalis AI

## 1. MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user with read/write access
4. Whitelist `0.0.0.0/0` for Render access
5. Get your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/vitalis`

---

## 2. Backend on Render

1. Go to [Render](https://render.com)
2. Create a **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add Environment Variables:
   ```
   MONGODB_URI=<your_atlas_uri>
   JWT_SECRET=<strong_random_string>
   JWT_REFRESH_SECRET=<another_strong_random_string>
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   CLIENT_URL=https://your-app.vercel.app
   NODE_ENV=production
   GOOGLE_CLIENT_ID=<your_google_client_id>
   GOOGLE_CLIENT_SECRET=<your_google_client_secret>
   GOOGLE_CALLBACK_URL=https://your-api.onrender.com/api/auth/google/callback
   ```
6. Deploy

---

## 3. Frontend on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repo
3. Settings:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-api.onrender.com/api
   ```
5. Deploy

---

## 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project or select existing
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-api.onrender.com/api/auth/google/callback` (production)
6. Copy Client ID and Secret to your environment variables

---

## 5. Post-Deployment

1. Run the seeder against your Atlas database:
   ```bash
   MONGODB_URI=<atlas_uri> node server/seed/seedData.js
   ```
2. Test login with demo credentials
3. Verify all API endpoints
4. Test PDF export functionality

---

## 6. Custom Domain (Optional)

- **Vercel**: Settings → Domains → Add your domain
- **Render**: Settings → Custom Domain → Add CNAME record

Update `CLIENT_URL` and `GOOGLE_CALLBACK_URL` accordingly.
