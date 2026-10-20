/**
 * KAUSHAL PULSE AI — API CLIENT SERVICE
 * Communicates with server-side Gemini routes and deterministic fallback engine.
 */

import {
  generateGroundedPolicyResponse,
  GroundedContext,
  CopilotEvidence,
} from './copilotEngine';

export interface CopilotChatResponse {
  reply: string;
  engine: 'gemini-server' | 'deterministic-grounded';
  fallback: boolean;
  evidence?: CopilotEvidence;
  isOutOfScope?: boolean;
  error?: string;
}

export async function askKaushalCopilot(
  message: string,
  context: GroundedContext,
  language: 'en' | 'hi' = 'en'
): Promise<CopilotChatResponse> {
  try {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        context,
        language,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        const isServerGemini = !data.fallback && data.engine === 'gemini-server';
        return {
          reply: data.reply,
          engine: isServerGemini ? 'gemini-server' : 'deterministic-grounded',
          fallback: Boolean(data.fallback),
          evidence: data.evidence || {
            district: context.activeDistrict,
            sector: context.activeSector,
            horizon: context.activeHorizon,
            datasetsUsed: ['MSDE Verified Live Dataset', 'Active Grounded Context'],
            methodology: isServerGemini
              ? 'Server-Side Gemini 3.8 Flash Neural Generation with Context Grounding'
              : 'Server-Side Grounded Deterministic Policy Engine',
            recordCount: (context.demandRecords?.length || 0) + (context.supplyRecords?.length || 0),
            limitations: 'Generative output conditioned on pilot dataset parameters.',
          },
          isOutOfScope: Boolean(data.isOutOfScope),
        };
      }
    } else {
      console.warn(`Backend Copilot endpoint responded with HTTP ${res.status}`);
    }
  } catch (err: any) {
    console.info('Backend Copilot endpoint unavailable, engaging client deterministic grounded engine:', err.message);
  }

  // Fallback to client-side grounded deterministic policy engine
  const groundedResult = generateGroundedPolicyResponse(message, context, language);
  return {
    reply: groundedResult.reply,
    engine: 'deterministic-grounded',
    fallback: true,
    evidence: groundedResult.evidence,
    isOutOfScope: groundedResult.isOutOfScope,
  };
}
