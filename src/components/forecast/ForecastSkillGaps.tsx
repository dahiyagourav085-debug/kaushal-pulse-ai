/**
 * KAUSHAL PULSE AI — FORECASTING & SKILL GAP ENGINE
 * Transparent forecasting models, 6m/12m/24m horizons, 95% confidence intervals,
 * and deterministic shortage/oversupply severity rankings.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { calculateOccupationForecast, exportToCsvString } from '../../utils/analytics';
import {
  Activity,
  Sliders,
  ChevronRight,
  Download,
} from 'lucide-react';

export const ForecastSkillGaps: React.FC = () => {
  const {
    language,
    selectedDistrict,
    selectedSector,
    selectedHorizon,
    occupations,
    setSelectedOccupationModal,
    setActiveTab,
    searchQuery,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const targetDist = selectedDistrict === 'All' ? 'All Districts (Pilot Aggregate)' : selectedDistrict;

  // Compute forecasts for all occupations
  const allForecasts = occupations
    .filter((occ) => {
      const matchesSector = selectedSector === 'All' || occ.sector === selectedSector;
      const matchesSearch =
        !searchQuery ||
        occ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        occ.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSector && matchesSearch;
    })
    .map((occ) => calculateOccupationForecast(occ, targetDist, selectedHorizon));

  const filteredForecasts = allForecasts.filter((f) => {
    if (severityFilter === 'shortage') return f.skillGap > 0;
    if (severityFilter === 'oversupply') return f.skillGap < 0;
    if (severityFilter === 'critical') return f.gapSeverity === 'critical_shortage';
    return true;
  });

  const handleExportCsv = () => {
    const rows = filteredForecasts.map((f) => ({
      Occupation: f.occupationName,
      NCO_Code: f.ncoCode,
      Sector: f.sector,
      District: f.district,
      Horizon: f.horizonMonths,
      ForecastDemand: f.forecastDemand,
      DemandLower95: f.forecastDemandLower,
      DemandUpper95: f.forecastDemandUpper,
      ForecastSupply: f.forecastSupply,
      SupplyLower95: f.forecastSupplyLower,
      SupplyUpper95: f.forecastSupplyUpper,
      SkillGap: f.skillGap,
      GapSeverity: f.gapSeverity,
      ConfidenceScore: f.confidenceScore,
      Methodology: f.method,
      Explanation: f.explanation,
    }));
    exportToCsvString(rows, `Skill_Gap_Forecast_${selectedHorizon}_${targetDist}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Multi-Horizon Forecasting Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'पूर्वानुमान एवं कौशल अंतराल — 6/12/24 माह की मांग-आपूर्ति'
                : 'Forecasts & Skill Gaps: Multi-Horizon Projections & Confidence Bands'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Statistical time-series baseline integrated with training cohort transition matrices to predict net workforce deficits.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Forecast CSV</span>
          </button>
        </div>
      </div>

      <FilterBar />

      {/* Severity Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <span>Filter Gap Profile:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              severityFilter === 'all'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Trades ({allForecasts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              severityFilter === 'critical'
                ? 'bg-red-100 text-red-800 font-bold border border-red-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical Shortage
          </button>
          <button
            onClick={() => setSeverityFilter('shortage')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              severityFilter === 'shortage'
                ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Shortages (Gap &gt; 0)
          </button>
          <button
            onClick={() => setSeverityFilter('oversupply')}
            className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
              severityFilter === 'oversupply'
                ? 'bg-teal-100 text-teal-800 font-bold border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Oversupply / Surplus (Gap &lt; 0)
          </button>
        </div>
      </div>

      {/* Forecast Dossier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredForecasts.map((fc) => {
          const matchedOcc = occupations.find((o) => o.id === fc.occupationId);
          const isShortage = fc.skillGap > 0;
          return (
            <div
              key={fc.occupationId}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between hover:shadow-sm ${
                fc.gapSeverity === 'critical_shortage'
                  ? 'border-red-300 hover:border-red-400'
                  : fc.gapSeverity === 'severe_oversupply'
                  ? 'border-amber-300 hover:border-amber-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                    NCO {fc.ncoCode} &bull; {fc.sector}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                      fc.gapSeverity === 'critical_shortage'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : fc.gapSeverity === 'moderate_shortage'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : fc.gapSeverity === 'severe_oversupply'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : fc.gapSeverity === 'moderate_oversupply'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {fc.gapSeverity.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{fc.occupationName}</h3>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Demand Projection</div>
                    <div className="text-sm font-bold text-blue-700 mt-0.5">
                      {fc.forecastDemand.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      CI: {fc.forecastDemandLower} - {fc.forecastDemandUpper}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Effective Supply</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">
                      {fc.forecastSupply.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">
                      CI: {fc.forecastSupplyLower} - {fc.forecastSupplyUpper}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-medium text-slate-500">Net Skill Gap</div>
                    <div
                      className={`text-sm font-extrabold mt-0.5 ${
                        isShortage ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {isShortage ? `+${fc.skillGap}` : fc.skillGap}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {isShortage ? 'Technician Shortfall' : 'Seat Surplus'}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {fc.explanation}
                </p>

                {/* Model Assumptions Chips */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {fc.assumptions.map((asm, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono"
                    >
                      {asm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => matchedOcc && setSelectedOccupationModal(matchedOcc)}
                  className="text-xs text-blue-700 font-semibold hover:underline flex items-center"
                >
                  <span>Occupation Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                <button
                  onClick={() => setActiveTab('simulator')}
                  className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Test Seat Change</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
