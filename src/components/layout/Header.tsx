/**
 * KAUSHAL PULSE AI — INSTITUTIONAL HEADER
 * National MSDE branding, bilingual toggle, quick search, and alert telemetry.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  Building2,
  Sparkles,
  X,
  Info,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    alerts,
    setActiveTab,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs no-print">
      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & National Emblem Badge */}
        <div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => setActiveTab('overview')}
        >
          {/* Government Tech Crest */}
          <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs border border-blue-800 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 uppercase">
                Kaushal Pulse <span className="text-blue-700 font-extrabold">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                MSDE &bull; SIH 26246
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {language === 'hi'
                ? 'श्रम बाजार बुद्धिमत्ता एवं कौशल मांग-आपूर्ति पूर्वानुमान इंजन'
                : "India's Labour Market Intelligence & Skill Demand-Supply Forecasting Engine"}
            </p>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'व्यवसाय, कौशल या जिला खोजें (जैसे सोलर, सीएनसी, रायपुर)...'
                  : 'Search trade, skill, or district (e.g. Solar, CNC, Raipur)...'
              }
              aria-label="Global search trade, skill, or district"
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-lg pl-9 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Multilingual Switch */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* AI Copilot Button */}
          <button
            onClick={() => setActiveTab('copilot')}
            className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span className="hidden sm:inline">Kaushal Copilot</span>
          </button>

          {/* Alerts Notification Button */}
          <button
            onClick={() => setActiveTab('alerts')}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="System Early Warnings & Alerts"
            aria-label="View system alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Bilingual Switch (EN / HI) */}
          <div className="flex items-center bg-slate-100 border border-slate-300 rounded-lg p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                language === 'en'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                language === 'hi'
                  ? 'bg-white text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
