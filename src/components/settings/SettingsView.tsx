/**
 * KAUSHAL PULSE AI — SETTINGS & CONFIGURATION
 * Operational controls, multilingual preferences, and platform diagnostics.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Globe,
  RotateCcw,
  Cpu,
  CheckCircle,
  ShieldCheck,
  Server,
  Activity,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    language,
    setLanguage,
    selectedHorizon,
    setSelectedHorizon,
    resetToDemoData,
  } = useApp();

  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    hasGeminiKey: boolean;
    timestamp?: string;
  } | null>(null);

  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch((err) => {
        setBackendHealth({ status: 'offline', hasGeminiKey: false });
      });
  }, []);

  const handleConfirmReset = () => {
    resetToDemoData();
    setIsResetDialogOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          {language === 'hi'
            ? 'सिस्टम सेटिंग्स एवं प्लेटफ़ॉर्म डायग्नोस्टिक्स'
            : 'Settings & Platform Diagnostics: Intelligence Environment Configuration'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage localization, forecasting calibration parameters, and inspect server-side AI integrations.
        </p>

        {resetSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Pilot demonstration cache successfully restored to factory synthetic states.</span>
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization & Preferences */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Language & User Preferences</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Interface Language (इंटरफ़ेस भाषा)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  English (Institutional)
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    language === 'hi'
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  हिन्दी (राजभाषा मानक)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Default Forecasting Horizon
              </label>
              <select
                value={selectedHorizon}
                onChange={(e) => setSelectedHorizon(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="6m">6 Months (Tactical Operational Cycle)</option>
                <option value="12m">12 Months (Annual DSDP Cycle)</option>
                <option value="24m">24 Months (Capital Infrastructure Plan)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technical Diagnostics */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>Platform Telemetry & Gemini Integration</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Server Status:</span>
              <span className="font-mono font-bold text-emerald-700 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{backendHealth?.status === 'healthy' ? 'Operational' : 'Active (Dev Mode)'}</span>
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Gemini 3.8 Flash Endpoint:</span>
              <span className="font-mono font-bold text-blue-700">
                /api/copilot/chat (Server-Side)
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">AI Studio API Key Attached:</span>
              <span
                className={`font-mono font-bold ${
                  backendHealth?.hasGeminiKey ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {backendHealth?.hasGeminiKey ? 'Verified (Environment)' : 'Offline Rule-Engine Active'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-slate-600">Release Version:</span>
              <span className="font-mono font-semibold text-slate-900">MSDE Kaushal Pulse v2.4-SIH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Reset Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Reset Local Demonstration Cache</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Restores all pilot records, What-If simulation presets, recommendations, and employer surveys to default synthetic states.
          </p>
        </div>

        <button
          onClick={() => setIsResetDialogOpen(true)}
          className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-4 py-2 rounded-lg border border-rose-200 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Pilot Data</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-amber-50 border border-amber-200 shrink-0">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset Demonstration Cache?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reset all pilot data to default factory states? This will clear all custom simulations, employer survey logs, and staged records.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsResetDialogOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
