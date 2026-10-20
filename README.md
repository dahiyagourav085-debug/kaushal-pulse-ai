# KAUSHAL PULSE AI — Labour Market Intelligence & Skill Demand-Supply Engine
**Ministry of Skill Development and Entrepreneurship (MSDE) &bull; Smart India Hackathon (SIH 2026 Problem Statement 26246)**

KAUSHAL PULSE AI is a full-stack institutional labour market intelligence and skill-planning platform designed for District Skill Committees (DSC), ITI principals, and State Skill Development Missions (SSDM). It monitors real-time industry vacancies, evaluates training capacity, forecasts multi-horizon skill shortages, simulates policy interventions (What-If scenario modeling), and tracks policy implementation queues.

---

## 🏛️ Operational Scope & Disclosures

- **Geographic Pilot Corridor**: Actively monitors the Chhattisgarh State Industrial Pilot Corridor across 4 focal districts: **Raipur, Durg, Bilaspur, and Korba**.
- **Vocational Standards**: Structured around National Classification of Occupations (**NCO-2015**) and National Skills Qualifications Framework (**NSQF Levels 3–6**).
- **Forecasting Methodology**: Implements an annualized **Year-over-Year (YoY) Trajectory Extrapolation + Cohort Funnel Matrix** heuristic demonstration model.
- **Data Provenance**: Default baseline datasets are synthetic demonstration benchmarks calibrated to represent district industrial characteristics. All user-imported data is quarantined and validated with clear provenance badges.
- **Privacy & Security**: Operates client-side state via browser `localStorage` with canonical CSV export/import workflows.

---

## 🚀 Public Deployment on Render

This repository includes a production-ready [`render.yaml`](render.yaml) blueprint specification for 1-click deployment on [Render](https://render.com).

### Service Configuration
- **Runtime**: Node.js (`>=18.0.0`)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Health Check Path**: `/api/health`
- **Port**: Dynamically bound to `process.env.PORT` on host `0.0.0.0`

### Environment Variables
| Variable | Required | Default | Description |
|---|:---:|---|---|
| `PORT` | Auto | `3000` | Port assigned by Render / hosting environment |
| `NODE_ENV` | Yes | `production` | Enables production static file serving and optimizations |
| `GEMINI_API_KEY` | Optional | *None* | Optional Google Gemini API key. If omitted, Kaushal Copilot automatically activates its built-in deterministic grounded intelligence engine. |

---

## 💻 Local Development & Verification

### Prerequisites
- Node.js `>= 18.0.0`
- npm `>= 9.0.0`

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Start development server (Express + Vite HMR)
npm run dev

# 3. Type check & verify code integrity
npm run lint

# 4. Compile production bundle
npm run build

# 5. Run production server locally
npm run start
```

### Health Check
Once running, verify backend readiness:
```bash
curl http://localhost:3000/api/health
# {"status":"healthy","platform":"Kaushal Pulse AI - MSDE Labour Market Intelligence Engine","hasGeminiKey":false}
```
