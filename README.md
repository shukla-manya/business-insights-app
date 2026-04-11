# Business Insights

**Business Insights** is a small-business analytics-style demo: a logged-in owner sees marketing-style metrics (profile views, search views, website clicks, calls, direction requests), a business profile card, and a list of customer reviews. The product is a **monorepo** with three parts working together:

- **Backend** — Express REST API with JWT auth, MongoDB (Mongoose) for users and data, OpenAPI spec, and Swagger UI for exploring endpoints.
- **Mobile app** — React Native (Expo) client: sign-in, then a header menu (top right) to open Insights, Business profile, and Reviews.
- **Postman** — Ready-to-import collection and environments to call the same API as the app.

Typical flow: seed the database, start the API, open the mobile app, log in, and browse insights and reviews backed by MongoDB.

## Repository layout (source)

`node_modules/`, local `.env` files, and Expo’s `.expo/` cache are not listed below.

```
business-insights-app/
├── README.md
├── .gitignore
├── render.yaml                 # Render Blueprint (web service, rootDir: backend)
├── backend/
│   ├── package.json
│   ├── server.js               # Express app entry, CORS, routes, Swagger
│   ├── openapi.yaml            # OpenAPI 3 spec (also served at /openapi.yaml)
│   ├── middleware/
│   │   └── auth.js             # JWT bearer middleware for protected routes
│   ├── models/
│   │   ├── User.js
│   │   ├── Business.js
│   │   ├── Insights.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── login.js            # POST /login
│   │   ├── business.js         # GET /business
│   │   ├── insights.js         # GET /insights
│   │   └── reviews.js          # GET /reviews
│   └── scripts/
│       └── seed.js             # Resets collections and inserts demo data
├── mobile/
│   ├── App.tsx
│   ├── index.ts
│   ├── .gitignore
│   ├── app.json                # Expo config; optional expo.extra.apiUrl
│   ├── eas.json                # EAS Build profiles
│   ├── tsconfig.json
│   ├── assets/                 # App icons and splash
│   └── src/
│       ├── api.ts              # HTTP helpers for the backend
│       ├── config.ts           # API base URL resolution
│       ├── theme.ts
│       ├── auth/
│       │   └── AuthContext.tsx # Login state and token
│       ├── components/
│       │   ├── MetricCard.tsx
│       │   └── StarsRow.tsx
│       ├── navigation/
│       │   ├── AppNavigator.tsx
│       │   └── MainHeaderMenu.tsx
│       └── screens/
│           ├── LoginScreen.tsx
│           ├── DashboardScreen.tsx
│           ├── BusinessProfileScreen.tsx
│           └── ReviewsScreen.tsx
└── postman/
    ├── Business-Insights.postman_collection.json
    ├── Local.postman_environment.json
    └── Production.postman_environment.json
```

### API surface (quick reference)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/` | API attribution JSON |
| GET | `/health` | Liveness check |
| GET | `/api-docs` | Swagger UI |
| GET | `/openapi.yaml` | Raw OpenAPI document |
| POST | `/login` | Email + password → JWT |
| GET | `/business`, `/insights`, `/reviews` | Require `Authorization: Bearer <token>` |

### Data sources (what comes from where)

Everything the app displays is **read from your MongoDB database** via the API. There is **no** built-in link to Google Business Profile, ad platforms, or other live analytics products.

| App screen | API | MongoDB | What it is |
|------------|-----|---------|------------|
| **Insights** (metric cards + bar chart) | `GET /insights` | `insights` collection — `findOne()` | Five integer counters (profile views, search views, website clicks, phone calls, direction requests). **Demo values** come from `backend/scripts/seed.js`. The chart is built **in the mobile app** from those same five numbers, not from a separate time-series API. |
| **Business profile** | `GET /business` | `business` collection — `findOne()` | One business document (name, category, address, phone, rating, review count). Seeded for demo. |
| **Reviews** | `GET /reviews` | `bi_reviews` collection — all documents, sorted by date | List of review objects. Seeded for demo. |

To change what users see, update the documents in MongoDB (e.g. Compass, `mongosh`), re-run seed, or extend the backend (e.g. admin PATCH routes or an integration that writes to these collections).

## Credentials

| Kind | Where | What it is |
|------|--------|------------|
| **MongoDB connection** | `backend/.env` → `MONGODB_URI` | Atlas SRV string; it embeds your **database username and password**. Never commit `.env` or paste the full URI in public docs. |
| **JWT signing key** | `backend/.env` → `JWT_SECRET` | Secret used to sign login tokens. If leaked, someone could mint fake tokens. Use a long random value; same variable on Render. |
| **Demo sign-in (app)** | Created by `npm run seed` | Local/demo only. After seeding, the app login screen uses: **email** `shuklamanya99@gmail.com`, **password** `demo1234`. Seeding **wipes** users and sample data—do not rely on this for production. |
| **Session token (JWT)** | Returned by `POST /login` | The mobile app and Postman store this as `Bearer` token for `/business`, `/insights`, `/reviews`. Treat it like a password while it is valid; do not commit or screenshot it. |

There are no other built-in accounts: add users in MongoDB (or extend the API) if you need more than the seeded demo user.

## How to use the app

**1. Backend**

1. Create `backend/.env` with `MONGODB_URI` and `JWT_SECRET` (see [Backend setup](#backend-setup)).
2. From `backend/`: `npm install`, then `npm run seed` (loads demo user, business, insights, reviews).
3. `npm start` and leave the server running (default [http://127.0.0.1:4000](http://127.0.0.1:4000)).
4. Optional: open [http://127.0.0.1:4000/api-docs](http://127.0.0.1:4000/api-docs) for Swagger, or `GET /health` to confirm the API is up.

**2. Point the mobile app at the API**

- **Android emulator** (API on host port 4000): `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` in `mobile/.env`.
- **iOS simulator** (same machine): often `EXPO_PUBLIC_API_URL=http://127.0.0.1:4000`.
- Physical phone: same Wi‑Fi as your computer; use `http://<your-computer-LAN-IP>:4000`.
- Hosted API: set `EXPO_PUBLIC_API_URL` to your HTTPS Render URL.

Restart Expo after changing env (`npx expo start`).

**3. Run the mobile app**

From `mobile/`: `npm install`, then `npx expo start`. Open the project in **Expo Go** or run **Android / iOS** simulator.

**4. Sign in and explore**

On the login screen, use the **demo** email and password from the table above (after a successful seed). Then:

- Tap the **menu** (top right), choose **Insights** — metric cards and chart from `/insights`.
- **Business profile** — from `/business`.
- **Reviews** — list from `/reviews`.

Sign out from the app if you need to test login again.

**5. Postman**

Import the collection and environments, set `base_url` to match your API, run **Login**, then the authenticated GET requests.

## Prerequisites

- Node.js 18 or newer
- MongoDB Atlas cluster and connection string
- Expo Go or Android Studio (for emulator/device) to run the app
- Optional: [EAS CLI](https://docs.expo.dev/build/setup/) for cloud APK builds
- Optional: Render account for hosting the API

## MongoDB Atlas

1. Create a database user and cluster.
2. Network access: allow your machine for local runs; for Render, allow `0.0.0.0/0` or Render’s outbound IPs.
3. Copy the SRV connection string.

If you reuse an Atlas database that already has a `reviews` collection from another project, this app stores documents in **`bi_reviews`** instead so seeding does not hit conflicting indexes. For a clean assignment setup, using a dedicated database name in the URI (e.g. `.../business_insights`) is still recommended.

## Backend setup

```bash
cd backend
```

Create `backend/.env` (do not commit it) with:

- `MONGODB_URI` — Atlas SRV URL (include database name in the path, for example `.../business_insights`)
- `JWT_SECRET` — long random string
- `PORT` — optional; defaults to `4000` locally (Render sets `PORT` automatically)

Install and seed:

```bash
npm install
npm run seed
npm start
```

Demo login values are listed in [Credentials](#credentials-what-you-need-and-what-to-keep-secret) (same values as in `backend/scripts/seed.js`).

### Live API URL (Render)

1. Push this repository to GitHub.
2. In Render: New → Blueprint → select the repo, or New → Web Service and point `rootDir` to `backend`.
3. Set environment variables `MONGODB_URI` and `JWT_SECRET` in the Render dashboard (mark as secret).
4. Deploy and copy the service URL (for example `https://business-insights-api.onrender.com`).

Cold starts on the free tier can take around a minute; use `GET /health` to verify the service is up.

Replace the placeholder in `mobile/app.json` under `expo.extra.apiUrl` with your Render URL, or set `EXPO_PUBLIC_API_URL` when starting Expo (recommended).

## Mobile app setup

```bash
cd mobile
npm install
```

Point the app at your API:

- **Recommended:** create `mobile/.env` with:

  `EXPO_PUBLIC_API_URL=https://your-service.onrender.com`

- Or edit `expo.extra.apiUrl` in `mobile/app.json`.

**Android emulator** (API on host port 4000): use `http://10.0.2.2:4000` as `EXPO_PUBLIC_API_URL`.

**Physical device:** use your computer’s LAN IP, for example `http://192.168.1.10:4000`, and ensure the backend is reachable; `usesCleartextTraffic` is enabled for HTTP in development.

Start the app:

```bash
npx expo start
```

Then open in Expo Go or run `npm run android` / `npm run ios` with a simulator.

## APK build

### Option A — EAS Build (no local Android SDK required)

```bash
npm install -g eas-cli
cd mobile
eas login
eas build:configure
eas build -p android --profile preview
```

Download the APK from the Expo build page when the job finishes.

### Option B — Local release build

```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK path is typically `android/app/build/outputs/apk/release/app-release.apk`. Configure signing for store-ready builds.

## Postman

Import `postman/Business-Insights.postman_collection.json`, `postman/Local.postman_environment.json`, and `postman/Production.postman_environment.json`.

1. Run **Login** — the test script stores `token` on the collection.
2. Run **Get Business**, **Get Insights**, **Get Reviews** with the saved bearer token.

Set `base_url` in **Local** to `http://127.0.0.1:4000` (or your LAN URL). Set **Production** `base_url` to your Render URL after deploy.

## API responses

Successful responses use:

`{ "success": true, "data": ... }`

Errors use:

`{ "success": false, "message": "..." }`

`POST /login` returns a JSON body with `data.token` (JWT) and `data.user`. Treat tokens like secrets; do not paste them into docs or commits.

Protected routes expect header: `Authorization: Bearer <token>` (use a token from a successful login).

## Submission checklist

- [ ] GitHub repository with `backend` and `mobile`
- [ ] APK file (from EAS or Gradle)
- [ ] Live backend URL (Render) documented in this README and set in `mobile/.env` (`EXPO_PUBLIC_API_URL`) or `mobile/app.json` `expo.extra.apiUrl`
- [ ] Postman collection in `postman/`
