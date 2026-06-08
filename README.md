# EcoWatch AI — Environmental Incident Reporting Platform

> **See it. Report it. Protect it.**

EcoWatch AI is a production-quality, AI-powered environmental monitoring platform. It empowers citizens to document and track ecological threats in real time, validating submissions using state-of-the-art vision models and community consensus.

---

## 🚀 Key Features

*   **AI-Powered Vision Diagnostics**: Uses Gemini Vision API to instantly classify incidents (illegal dumping, water/air pollution, deforestation, hazardous waste), estimate severity levels, and generate ecological impact evaluations.
*   **Dual-Mode Storage Engine**: Operates seamlessly in a **mock fallback state** (utilizing LocalStorage and an in-memory server database) for quick setups and demos, and transitions to a live **Supabase Postgres + Auth** environment when credentials are configured.
*   **Command Center Analytics**: Visualizes statistics with Recharts, highlighting classification breakdowns, monthly trends, severity slices, and high-risk hotspots.
*   **Interactive Geolocation Map**: Renders a dark-themed Leaflet Map plot representing active records. Markers display distinct color codes and icons based on severity and category.
*   **Community Verification System**: Enables users to confirm or dispute reports. Active validation dynamically updates the report status and composite risk scores.
*   **Before & After Recovery Logs**: Citizens can upload recovery photos on active incidents, invoking Gemini image comparisons to evaluate cleanup percentages.

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
*   **Mapping**: Leaflet Maps (OpenStreetMap, CartoDB tiles).
*   **Charts**: Recharts.
*   **AI**: Google Gemini Vision (`gemini-1.5-flash` model).
*   **Backend & DB**: Supabase (PostgreSQL, Supabase Auth).
*   **Hosting Ready**: Vercel.

---

## 📂 Project Directory Structure

```
ecowatch-ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with Glassmorphism Theme & Providers
│   │   ├── page.tsx               # High-converting climate-tech Landing Page
│   │   ├── login/                 # Auth: Login Page
│   │   ├── signup/                # Auth: Signup Page
│   │   ├── dashboard/             # Analytics, Interactive Map, Reports Feed, AI Summaries
│   │   │   └── page.tsx
│   │   ├── report/                # Submission page with Live Gemini Preview & GPS Map
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── [id]/              # Details, Before/After update upload, confirmation system
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── analyze/           # AI Image Analysis endpoint (Gemini Vision API)
│   │       ├── reports/           # GET/POST reports handler
│   │       │   └── [id]/
│   │       │       ├── route.tsx  # GET report detail handler
│   │       │       ├── votes/
│   │       │       │   └── route.ts # POST vote handler
│   │       │       └── updates/
│   │       │           └── route.ts # GET/POST updates handler
│   │   components/
│   │   ├── theme-provider.tsx     # Dark / Light Mode provider
│   │   ├── navigation.tsx         # Modern glassmorphic header / mobile nav
│   │   ├── leaflet-map.tsx        # Dynamic Leaflet component (No API key required)
│   │   ├── auth-provider.tsx      # Dual-mode authentication wrapper
│   ├── lib/
│   │   ├── db.ts                  # Dual-mode database layer (Supabase vs global memory)
│   │   ├── gemini.ts              # Gemini API service helper (real vs simulation)
│   │   ├── risk.ts                # Calculation helper for Risk Scores
│   │   └── utils.ts               # CSS class merger utility
│   ├── types/
│   │   └── index.ts               # Core model interfaces
│   └── styles/
│       └── globals.css            # Base Tailwind definitions + Glassmorphism animations
├── public/                        # Static assets
├── schema.sql                     # Supabase database initialization queries
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── .env.example                   # Environment credentials blueprint
```

---

## 🛢 Database Schema (PostgreSQL)

The platform is designed around 5 interconnected relational tables. Refer to [schema.sql](file:///C:/Users/WALTON/.gemini/antigravity/scratch/ecowatch-ai/schema.sql) to set them up:

*   **`users`**: Stores synchronized user accounts (email, full name, dates) linked to Supabase Auth.
*   **`reports`**: Holds incident locations (latitude, longitude), classifications, severity level, status, and computed composite risk index.
*   **`report_votes`**: Stores user confirmations or disputes, ensuring a unique constraint per report-user pair.
*   **`report_updates`**: Keeps history logs of cleanup pictures, progress notes, and Gemini comparison outcomes.
*   **`ai_analysis`**: Documents Gemini Vision diagnostic outcomes, logs confidence percentages, and saves raw responses.

---

## 🔌 API Endpoints Documentation

All requests process JSON bodies and parameters:

1.  **`GET /api/reports`**: Fetches all reports.
    *   *Parameters*: `category`, `severity`, `status`, `search` (text search).
2.  **`POST /api/reports`**: Submits a report.
    *   *Body*: `{ title, description, category, latitude, longitude, location_name, image_url, user_id }`
    *   *Behavior*: Saves record -> Triggers Gemini Analysis -> Saves AI details -> Updates report severity & risk -> Returns report.
3.  **`GET /api/reports/[id]`**: Retrieves specific incident details and its AI analysis.
4.  **`POST /api/reports/[id]/votes`**: Votes on a report.
    *   *Body*: `{ userId, voteType }` (where `voteType` is 'confirm' | 'dispute')
    *   *Behavior*: Logs vote -> Recalculates risk -> Updates status.
5.  **`GET /api/reports/[id]/updates`**: Fetches before & after timeline logs.
6.  **`POST /api/reports/[id]/updates`**: Log recovery follow-ups.
    *   *Body*: `{ userId, image_url, description }`
    *   *Behavior*: Retrieves original image -> Calls Gemini Image Comparison -> Logs recovery percentages -> Resolves incident if recovered.
7.  **`POST /api/api/analyze`**: Performs quick, standalone photo scans during submission step.

---

## ⚙️ Local Setup & Installation

### Prerequisites
*   Node.js (v18+) and npm installed.

### Steps
1.  **Extract/Navigate** to the project directory:
    ```bash
    cd ecowatch-ai
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup environment files**:
    Clone the env blueprint to configure options:
    ```bash
    cp .env.example .env.local
    ```
    *(You can leave these blank; the application will launch in high-fidelity mock mode immediately!)*

4.  **Start development server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` to review the application.

---

## ⚡ Supabase Setup (Optional)

To connect live Supabase resources:
1.  Create a project on [Supabase.com](https://supabase.com).
2.  Open the **SQL Editor** in the Supabase console, paste the contents of `schema.sql`, and execute it.
3.  Navigate to **Project Settings > API** and copy the project URL and Anon key.
4.  Paste these credentials in your local `.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```
5.  Restart your dev server. The application will automatically connect to your PostgreSQL instance.

---

## ☁️ Vercel Deployment Guide

Deploying Next.js 15 to Vercel is straightforward:

1.  Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  Import the repository into your [Vercel Dashboard](https://vercel.com).
3.  Under **Environment Variables**, configure:
    *   `NEXT_PUBLIC_SUPABASE_URL` (optional)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
    *   `GEMINI_API_KEY` (optional - for live AI Vision)
4.  Click **Deploy**. Vercel will automatically build the Next.js static assets, bundle edge handlers, and host the platform.
