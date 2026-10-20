import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

import { generateGroundedPolicyResponse } from './src/services/copilotEngine';
import {
  DEMO_OCCUPATIONS,
  DEMO_DEMAND_RECORDS,
  DEMO_SUPPLY_RECORDS,
  DEMO_TRAINING_CENTRES,
  DEMO_EMERGING_SKILLS,
  DEMO_EMPLOYER_SURVEYS,
} from './src/data/demoData';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Kaushal Pulse AI - MSDE Labour Market Intelligence Engine',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Kaushal Copilot - Server-Side Gemini & Grounded Route
app.post('/api/copilot/chat', async (req, res) => {
  try {
    if (!req.body || typeof req.body.message !== 'string' || !req.body.message.trim()) {
      return res.status(400).json({
        error: 'Invalid request body. "message" must be a non-empty string.',
      });
    }

    const { message, context: clientContext, language = 'en' } = req.body;

    // Build complete context with safe defaults if clientContext is partial or omitted
    const effectiveContext = {
      activeDistrict: clientContext?.activeDistrict || 'Raipur',
      activeSector: clientContext?.activeSector || 'All',
      activeHorizon: clientContext?.activeHorizon || '12m',
      demandRecords: Array.isArray(clientContext?.demandRecords)
        ? clientContext.demandRecords
        : DEMO_DEMAND_RECORDS,
      supplyRecords: Array.isArray(clientContext?.supplyRecords)
        ? clientContext.supplyRecords
        : DEMO_SUPPLY_RECORDS,
      occupations: Array.isArray(clientContext?.occupations)
        ? clientContext.occupations
        : DEMO_OCCUPATIONS,
      trainingCentres: Array.isArray(clientContext?.trainingCentres)
        ? clientContext.trainingCentres
        : DEMO_TRAINING_CENTRES,
      emergingSkills: Array.isArray(clientContext?.emergingSkills)
        ? clientContext.emergingSkills
        : DEMO_EMERGING_SKILLS,
      employerSurveys: Array.isArray(clientContext?.employerSurveys)
        ? clientContext.employerSurveys
        : DEMO_EMPLOYER_SURVEYS,
      savedScenarios: Array.isArray(clientContext?.savedScenarios)
        ? clientContext.savedScenarios
        : [],
      pendingRecommendationsCount: clientContext?.pendingRecommendationsCount,
      activeAlertsCount: clientContext?.activeAlertsCount,
    };

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const grounded = generateGroundedPolicyResponse(message, effectiveContext, language);
      return res.status(200).json({
        fallback: true,
        engine: 'deterministic-grounded',
        reason: 'NO_API_KEY',
        reply: grounded.reply,
        evidence: grounded.evidence,
        isOutOfScope: grounded.isOutOfScope,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are "Kaushal Copilot", an elite Labour Market Intelligence and Policy Planning AI Assistant developed for India's Ministry of Skill Development and Entrepreneurship (MSDE), Directorate General of Training (DGT), and National Skill Development Corporation (NSDC).

Operational Context:
You are assisting state skill directors, district collectors, ITI principals, and policy planners in optimizing training capacity, identifying acute occupational shortages/oversupply, and formulating evidence-based skill interventions.

Currently Active Pilot Context (Chhattisgarh):
${JSON.stringify(effectiveContext, null, 2)}

Strict Guidelines:
1. Base all quantitative statements strictly on the provided context (observed vacancies, effective supply, skill gaps, placement rates).
2. Never hallucinate or invent figures. If asked about an unsupported district (outside Raipur, Durg, Bilaspur, Korba) or unsupported trade, explicitly declare that it is not tracked in the active dataset.
3. Clearly distinguish between "Observed Data" (e.g., job postings, enrolled seats), "Modelled Estimates" (e.g., effective jobseeker pool), and "Forecasts" (YoY Trajectory Extrapolation / Cohort projections).
4. Output concise, structured, bulleted policy advice suitable for government documentation.
5. If the user query is in Hindi or 'language' is 'hi', reply in formal, clear Hindi (Devanagari script), using appropriate Indian vocational terms (e.g., कौशल विकास, आईटीआई सीटें, मांग-आपूर्ति अंतर, अप्रेंटिसशिप, प्लेसमेंट दर).
6. Recommend actionable interventions: PMKVY 4.0 special projects, NAPS apprenticeship tie-ups, ITI dual system of training (DST), or course rationalisation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.25,
      },
    });

    const replyText = response.text || 'Unable to generate response from intelligence engine.';

    return res.json({
      fallback: false,
      engine: 'gemini-server',
      reply: replyText,
    });
  } catch (error: any) {
    console.error('Copilot API execution error:', error);
    try {
      const fallbackGrounded = generateGroundedPolicyResponse(
        req.body?.message || '',
        req.body?.context,
        req.body?.language || 'en'
      );
      return res.status(200).json({
        fallback: true,
        engine: 'deterministic-grounded',
        error: error.message,
        reply: fallbackGrounded.reply,
        evidence: fallbackGrounded.evidence,
        isOutOfScope: fallbackGrounded.isOutOfScope,
      });
    } catch (fallbackError: any) {
      console.error('Critical fallback failure:', fallbackError);
      return res.status(500).json({
        error: 'Internal server error processing policy request.',
        details: error.message,
      });
    }
  }
});


// Development Vite middleware or Production static files
async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Kaushal Pulse AI] Server running on http://0.0.0.0:${port}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
