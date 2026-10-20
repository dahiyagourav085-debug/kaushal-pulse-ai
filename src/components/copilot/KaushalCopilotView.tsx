/**
 * KAUSHAL PULSE AI — KAUSHAL COPILOT (GROUNDED POLICY ASSISTANT)
 * Dual-engine architecture (Server-Side Gemini 3.8 Flash + Client-Side Grounded Policy Engine),
 * full application state context grounding, strict missing-data & out-of-scope declarations,
 * bilingual dialogue (English/Hindi), copyable briefs, and evidence citations.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { askKaushalCopilot, CopilotChatResponse } from '../../services/api';
import { CopilotEvidence } from '../../services/copilotEngine';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Layers,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  engine?: 'gemini-server' | 'deterministic-grounded';
  evidence?: CopilotEvidence;
  isOutOfScope?: boolean;
  isError?: boolean;
}

export const KaushalCopilotView: React.FC = () => {
  const {
    language,
    selectedDistrict,
    selectedSector,
    selectedHorizon,
    recommendations,
    alerts,
    occupations,
    demandRecords,
    supplyRecords,
    trainingCentres,
    emergingSkills,
    employerSurveys,
    savedScenarios,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं **कौशल कोपायलट** हूँ — कौशल विकास एवं उद्यमशीलता मंत्रालय (MSDE) का ग्राउंडेड एआई नीति सहायक। मैं आपको व्यावसायिक मांग-आपूर्ति अंतराल, जिला कौशल योजनाओं और What-If नीति सिमुलेशन में सहायता कर सकता हूँ।\n\n*डेटा दायरा: छत्तीसगढ़ पायलट कॉरिडोर (रायपुर, दुर्ग, बिलासपुर, कोरबा)।*'
          : 'Welcome! I am **Kaushal Copilot**, the Grounded AI Policy Assistant for the Ministry of Skill Development and Entrepreneurship (MSDE).\n\nI answer inquiries using the active empirical labour-market datasets for the **Chhattisgarh Industrial Pilot Corridor** (Raipur, Durg, Bilaspur, Korba). How can I assist with your occupational forecasting or seat allocation planning today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'deterministic-grounded',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Categorized quick prompt library covering both in-scope and boundary conditions
  const promptCategories = [
    {
      category: language === 'hi' ? 'कौशल अंतर एवं कमी' : 'Shortage & Gap Analysis',
      prompts: [
        {
          en: 'What is the skill gap for Solar PV System Installer in Raipur?',
          hi: 'रायपुर में सोलर पीवी इंस्टॉलर का कौशल अंतर क्या है?',
        },
        {
          en: 'Summarise the acute shortages in Durg-Bhilai industrial belt',
          hi: 'दुर्ग-भिलाई औद्योगिक बेल्ट में तीव्र कौशल कमियों का सारांश दें',
        },
        {
          en: 'Which trades show oversupply and require seat reallocation?',
          hi: 'किन ट्रेडों में अति-आपूर्ति है और सीटों के युक्तिकरण की आवश्यकता है?',
        },
      ],
    },
    {
      category: language === 'hi' ? 'नीति सिमुलेशन एवं कोहोर्ट यील्ड' : 'Policy Simulation & Funnel',
      prompts: [
        {
          en: 'How does increasing training seats by 30% affect the shortage?',
          hi: 'प्रशिक्षण सीटों में 30% वृद्धि करने से कौशल कमी पर क्या प्रभाव पड़ेगा?',
        },
        {
          en: 'Explain why 100 training seats only produce ~60 work-ready technicians',
          hi: 'समझाइए कि 100 प्रशिक्षण सीटें केवल ~60 कार्य-तैयार तकनीशियन ही क्यों बनाती हैं?',
        },
      ],
    },
    {
      category: language === 'hi' ? 'अवसंरचना एवं कलेक्टर ब्रीफ' : 'Infrastructure & Executive Brief',
      prompts: [
        {
          en: 'Audit accredited training centres and seat capacity in Durg',
          hi: 'दुर्ग में मान्यता प्राप्त प्रशिक्षण केंद्रों और सीट क्षमता का ऑडिट करें',
        },
        {
          en: 'Generate a 1-page briefing note for the District Collector',
          hi: 'जिला कलेक्टर हेतु 1-पेज का नीतिगत संक्षिप्त विवरण बनाएं',
        },
      ],
    },
    {
      category: language === 'hi' ? 'डेटा सीमा एवं अनुपलब्धता परीक्षण' : 'Boundary & Out-of-Scope Tests',
      prompts: [
        {
          en: 'What is the labour demand in Bengaluru or Mumbai?',
          hi: 'बेंगलुरु या मुंबई में श्रम मांग क्या है?',
        },
        {
          en: 'Do we have data on Airline Pilots or Registered Nurses?',
          hi: 'क्या हमारे पास एयरलाइन पायलट या नर्सों का डेटा उपलब्ध है?',
        },
      ],
    },
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setLastQuery(query);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    // Build rich grounded context payload from actual AppContext memory
    const contextPayload = {
      activeDistrict: selectedDistrict,
      activeSector: selectedSector,
      activeHorizon: selectedHorizon,
      demandRecords,
      supplyRecords,
      occupations,
      trainingCentres,
      emergingSkills,
      employerSurveys,
      savedScenarios,
      pendingRecommendationsCount: recommendations.filter((r) => r.status === 'Under Review').length,
      activeAlertsCount: alerts.filter((a) => a.status === 'Active').length,
    };

    try {
      const result: CopilotChatResponse = await askKaushalCopilot(query, contextPayload, language);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'copilot',
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: result.engine,
        evidence: result.evidence,
        isOutOfScope: result.isOutOfScope,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'copilot',
          text:
            language === 'hi'
              ? 'सिस्टम त्रुटि: खुफिया इंजन से संपर्क करने में असमर्थ। कृपया पुनः प्रयास करें।'
              : 'Intelligence Engine Connection Notice: Unable to process the inquiry through the neural model. You may retry below.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine: 'deterministic-grounded',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'copilot',
        text:
          language === 'hi'
            ? 'सत्र रीसेट हो गया है। आगामी सभी प्रश्न सक्रिय डैशबोर्ड फ़िल्टर और छत्तीसगढ़ डेटासेट पर आधारित होंगे।'
            : 'Session reset. All subsequent policy inquiries will be grounded against active dashboard filters and verified pilot records.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'deterministic-grounded',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Architecture Transparency */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Grounded Government AI Assistant</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'कौशल कोपायलट — एआई श्रम बाजार नीति सलाहकार'
                : 'Kaushal Copilot: Natural Language Labour Market & Policy Assistant'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Context-grounded intelligence for occupational shortage analysis, What-If simulation evaluation, and collectorate briefing notes.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleResetChat}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Conversation</span>
            </button>
          </div>
        </div>

        {/* Live Grounding & Engine Governance Pill */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              <strong>Active Grounding:</strong> {selectedDistrict} District &bull; {selectedSector} &bull; {selectedHorizon} Horizon ({demandRecords.length + supplyRecords.length} records in memory)
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Intelligence: Deterministic Grounded Rules + Gemini Server Route
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Chat Shell */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col h-[700px] overflow-hidden">
        {/* Chat Status Header */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Evidence-Backed Policy Synthesis</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Jurisdiction: Chhattisgarh Pilot (Raipur, Durg, Bilaspur, Korba)
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
          {messages.map((m) => {
            const isBot = m.sender === 'copilot';
            const isEvidenceOpen = expandedEvidenceId === m.id;

            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                    isBot
                      ? m.isError
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : m.isOutOfScope
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble Container */}
                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed shadow-xs ${
                    isBot
                      ? m.isError
                        ? 'bg-rose-50 border border-rose-200 text-rose-900'
                        : m.isOutOfScope
                        ? 'bg-amber-50/80 border border-amber-200 text-slate-900'
                        : 'bg-white border border-slate-200 text-slate-800'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {/* Text Body */}
                  <div className="whitespace-pre-wrap">{m.text}</div>

                  {/* Bot Message Footer */}
                  {isBot && (
                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span>{m.timestamp}</span>
                        {m.engine && (
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-semibold border ${
                              m.engine === 'gemini-server'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {m.engine === 'gemini-server' ? 'Gemini 3.8 Flash' : 'Grounded Engine'}
                          </span>
                        )}
                        {m.isOutOfScope && (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono text-[9px] font-semibold border border-amber-200">
                            Scope Boundary
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {m.evidence && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedEvidenceId(isEvidenceOpen ? null : m.id)
                            }
                            className="text-blue-700 hover:text-blue-800 font-medium hover:underline flex items-center space-x-1 cursor-pointer"
                          >
                            <Info className="w-3 h-3" />
                            <span>{isEvidenceOpen ? 'Hide Evidence' : 'Cite Evidence'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(m.id, m.text)}
                          className="text-slate-500 hover:text-slate-800 flex items-center space-x-1 cursor-pointer"
                          title="Copy text to clipboard"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Brief</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Expandable Evidence Drawer */}
                  {isBot && m.evidence && isEvidenceOpen && (
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 space-y-1.5">
                      <div className="font-semibold text-slate-900 flex items-center space-x-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        <span>Grounded Evidence &amp; Methodology Audit:</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                        <div>
                          <strong>Jurisdiction:</strong> {m.evidence.district} ({m.evidence.sector})
                        </div>
                        <div>
                          <strong>Projection Horizon:</strong> {m.evidence.horizon}
                        </div>
                        <div className="col-span-2">
                          <strong>Datasets Cited:</strong> {m.evidence.datasetsUsed.join(', ')}
                        </div>
                        <div className="col-span-2">
                          <strong>Analytical Model:</strong> {m.evidence.methodology}
                        </div>
                        <div className="col-span-2 text-slate-500">
                          <strong>Caveats:</strong> {m.evidence.limitations}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Retry Button on Error */}
                  {m.isError && lastQuery && (
                    <div className="mt-2 pt-2 border-t border-rose-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSend(lastQuery)}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded-md flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Inquiry</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-500 text-xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Evaluating empirical demand &amp; supply models across active records...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* 3. Categorized Quick Prompts Accordion */}
        <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-200 overflow-x-auto space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Suggested Policy Inquiries &amp; Boundary Tests:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {promptCategories.flatMap((c) =>
              c.prompts.map((qp, i) => {
                const text = language === 'hi' ? qp.hi : qp.en;
                return (
                  <button
                    key={`${c.category}-${i}`}
                    type="button"
                    onClick={() => handleSend(text)}
                    className="text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 transition-colors shadow-2xs cursor-pointer"
                  >
                    {text}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 4. Input Form */}
        <div className="p-3.5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'नीतिगत प्रश्न पूछें (जैसे: रायपुर में सोलर तकनीशियनों की कमी का क्या कारण है?)...'
                  : 'Ask a policy question (e.g. Compare projected demand and supply in Raipur vs Durg)...'
              }
              className="flex-1 bg-slate-50 border border-slate-300 text-xs rounded-lg px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
