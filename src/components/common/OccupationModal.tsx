/**
 * KAUSHAL PULSE AI — OCCUPATIONAL INTELLIGENCE DOSSIER MODAL
 * Detailed drill-down for any occupation, showing historical trends, skill requirements,
 * and quick trigger to the What-If Policy Simulator.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateOccupationForecast, getDistrictWeight } from '../../utils/analytics';
import {
  X,
  TrendingUp,
  Award,
  Layers,
  Banknote,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const OccupationModal: React.FC = () => {
  const {
    selectedOccupationModal,
    setSelectedOccupationModal,
    selectedDistrict,
    selectedHorizon,
    setActiveTab,
    language,
  } = useApp();

  if (!selectedOccupationModal) return null;

  const occ = selectedOccupationModal;
  const targetDistrict = selectedDistrict === 'All' ? 'All Districts (Pilot Aggregate)' : selectedDistrict;
  const forecast = calculateOccupationForecast(occ, targetDistrict, selectedHorizon);
  const distWeight = getDistrictWeight(targetDistrict);

  const historyData = [
    { year: '2023', Demand: Math.round(occ.historicalDemand[0] * distWeight), Supply: Math.round(occ.historicalSupply[0] * distWeight) },
    { year: '2024', Demand: Math.round(occ.historicalDemand[1] * distWeight), Supply: Math.round(occ.historicalSupply[1] * distWeight) },
    { year: '2025', Demand: Math.round(occ.historicalDemand[2] * distWeight), Supply: Math.round(occ.historicalSupply[2] * distWeight) },
    { year: '2026 (Q1 Ann.)', Demand: Math.round(occ.historicalDemand[3] * distWeight), Supply: Math.round(occ.historicalSupply[3] * distWeight) },
  ];

  const handleLaunchSimulation = () => {
    setSelectedOccupationModal(null);
    setActiveTab('simulator');
  };

  const isShortage = forecast.skillGap > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 sticky top-0 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-[11px] font-mono uppercase bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                NCO: {occ.ncoCode}
              </span>
              <span className="text-[11px] font-mono bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-semibold flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>NSQF Level {occ.nsqfLevel}</span>
              </span>
              <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center space-x-1">
                <Layers className="w-3 h-3 text-slate-500" />
                <span>{occ.sector}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{occ.name}</h2>
          </div>

          <button
            onClick={() => setSelectedOccupationModal(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close occupation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {occ.description}
          </p>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
              <div className="text-[11px] font-medium text-slate-500">Entry Salary (INR)</div>
              <div className="text-base font-bold text-slate-900 mt-1 flex items-center space-x-1">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>₹{occ.entrySalaryInr.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
              <div className="text-[11px] font-medium text-slate-500">Median Salary (INR)</div>
              <div className="text-base font-bold text-slate-900 mt-1 flex items-center space-x-1">
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>₹{occ.medianSalaryInr.toLocaleString('en-IN')}/mo</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl shadow-xs">
              <div className="text-[11px] font-medium text-amber-800">Persistent Vacancies (&gt;60d)</div>
              <div className="text-base font-bold text-amber-900 mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{(occ.persistentVacanciesRatio * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border shadow-xs ${
                isShortage
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="text-[11px] font-medium">
                {selectedHorizon} Projected Gap ({targetDistrict})
              </div>
              <div className="text-base font-bold mt-1">
                {isShortage ? '+' : ''}
                {forecast.skillGap.toLocaleString('en-IN')} seats
              </div>
            </div>
          </div>

          {/* Historical Demand vs Supply Trend Chart */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <TrendingUp className="w-4 h-4 text-blue-700" />
                <span>Historical Trajectory (2023 - 2026)</span>
              </div>
              <span className="text-[11px] text-slate-500">Annual Unique Candidates vs Openings</span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="Demand" fill="#2563eb" name="Labour Demand" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Supply" fill="#059669" name="Effective Supply" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Core and Emerging Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span>Core Competencies (NSQF Curricula)</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {occ.coreSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-900 flex items-center space-x-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                <span>Emerging Skills Signals</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {occ.emergingSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-white text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-medium shadow-2xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
          <span className="text-[11px] text-slate-500">
            Source: Synthetic Pilot Intelligence Model &bull; Method: YoY Trajectory Extrapolation
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedOccupationModal(null)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleLaunchSimulation}
              className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulate Training Policy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
