/**
 * KAUSHAL PULSE AI — EXECUTIVE LABOUR MARKET INTELLIGENCE DASHBOARD
 * National Skill Development & Labour-Market Forecasting Intelligence Cockpit.
 * Ministry of Skill Development and Entrepreneurship (MSDE).
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { calculateOccupationForecast, getDistrictWeight, DISTRICT_WEIGHTS } from '../../utils/analytics';
import {
  TrendingUp,
  Users,
  Activity,
  Award,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Building,
  CheckCircle2,
  Layers,
  Briefcase,
  Sparkles,
  MapPin,
  Info,
  Sliders,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const {
    language,
    selectedState,
    selectedDistrict,
    setSelectedDistrict,
    selectedSector,
    setSelectedSector,
    selectedOccupation,
    setSelectedOccupation,
    selectedSkill,
    setSelectedSkill,
    selectedHorizon,
    setSelectedHorizon,
    occupations,
    districts,
    recommendations,
    trainingCentres,
    setActiveTab,
    setSelectedOccupationModal,
    searchQuery,
    setSearchQuery,
  } = useApp();

  // Multi-dimensional breakdown tabs
  const [breakdownTab, setBreakdownTab] = useState<'districts' | 'sectors' | 'skills' | 'occupations'>('occupations');

  // Chart view toggle: Demand vs Supply or Net Gap Trajectory
  const [timeSeriesMetric, setTimeSeriesMetric] = useState<'demand_supply' | 'net_gap'>('demand_supply');

  // Collapsible assumptions card
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);

  // Target district name for calculation
  const targetDist = selectedDistrict === 'All' ? 'All Districts (Pilot Aggregate)' : selectedDistrict;
  const distWeight = getDistrictWeight(targetDist);

  // Filter occupations by active multi-tier criteria
  const filteredOccs = occupations.filter((occ) => {
    const matchesSector = selectedSector === 'All' || occ.sector === selectedSector;
    const matchesOccupation =
      selectedOccupation === 'All' || occ.id === selectedOccupation || occ.name === selectedOccupation;
    const matchesSkill =
      selectedSkill === 'All' ||
      occ.coreSkills.includes(selectedSkill) ||
      occ.emergingSkills.includes(selectedSkill);
    const matchesSearch =
      !searchQuery ||
      occ.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      occ.ncoCode.includes(searchQuery) ||
      occ.coreSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      occ.emergingSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSector && matchesOccupation && matchesSkill && matchesSearch;
  });

  // Calculate forecasts for all filtered occupations with district scaling
  const forecasts = filteredOccs.map((occ) => ({
    occ,
    forecast: calculateOccupationForecast(occ, targetDist, selectedHorizon),
  }));

  // Aggregated totals
  const totalForecastDemand = forecasts.reduce((sum, f) => sum + f.forecast.forecastDemand, 0);
  const totalForecastSupply = forecasts.reduce((sum, f) => sum + f.forecast.forecastSupply, 0);
  const netSkillGap = totalForecastDemand - totalForecastSupply;

  // Shortage vs Oversupply ranks
  const shortages = [...forecasts]
    .filter((f) => f.forecast.skillGap > 0)
    .sort((a, b) => b.forecast.skillGap - a.forecast.skillGap);

  const oversupplies = [...forecasts]
    .filter((f) => f.forecast.skillGap < 0)
    .sort((a, b) => a.forecast.skillGap - b.forecast.skillGap);

  // Persistent vacancies hard-to-fill metric
  const avgPersistentVacancies =
    filteredOccs.length > 0
      ? Math.round(
          (filteredOccs.reduce((sum, o) => sum + o.persistentVacanciesRatio, 0) / filteredOccs.length) * 100
        )
      : 0;

  // Capacity utilization & placements filtered by district
  const relevantCentres =
    selectedDistrict === 'All'
      ? trainingCentres
      : trainingCentres.filter((tc) => tc.district === selectedDistrict || tc.district.includes(selectedDistrict));
  const avgPlacementRate = Math.round(
    (relevantCentres.reduce((sum, tc) => {
      const p = tc.placementRate > 1 ? tc.placementRate / 100 : tc.placementRate;
      return sum + p;
    }, 0) / (relevantCentres.length || 1)) * 100
  );
  const avgCapacityUtil = Math.round(
    (relevantCentres.reduce((sum, tc) => {
      const u = tc.utilizationRate > 1 ? tc.utilizationRate / 100 : tc.utilizationRate;
      return sum + u;
    }, 0) / (relevantCentres.length || 1)) * 100
  );

  // Time-series aggregated chart data
  const timeSeriesData = [
    {
      period: '2023',
      Demand: Math.round(filteredOccs.reduce((sum, o) => sum + o.historicalDemand[0] * distWeight, 0)),
      Supply: Math.round(filteredOccs.reduce((sum, o) => sum + o.historicalSupply[0] * distWeight, 0)),
      NetGap: Math.round(
        filteredOccs.reduce((sum, o) => sum + (o.historicalDemand[0] - o.historicalSupply[0]) * distWeight, 0)
      ),
      type: 'Observed Historical',
    },
    {
      period: '2024',
      Demand: Math.round(filteredOccs.reduce((sum, o) => sum + o.historicalDemand[1] * distWeight, 0)),
      Supply: Math.round(filteredOccs.reduce((sum, o) => sum + o.historicalSupply[1] * distWeight, 0)),
      NetGap: Math.round(
        filteredOccs.reduce((sum, o) => sum + (o.historicalDemand[1] - o.historicalSupply[1]) * distWeight, 0)
      ),
      type: 'Observed Historical',
    },
    {
      period: '2025',
      Demand: Math.round(filteredOccs.reduce((sum, o) => sum + o.historicalDemand[2] * distWeight, 0)),
      Supply: Math.round(filteredOccs.reduce((sum, o) => sum + o.historicalSupply[2] * distWeight, 0)),
      NetGap: Math.round(
        filteredOccs.reduce((sum, o) => sum + (o.historicalDemand[2] - o.historicalSupply[2]) * distWeight, 0)
      ),
      type: 'Observed Historical',
    },
    {
      period: `2026 (${selectedHorizon})`,
      Demand: totalForecastDemand,
      Supply: totalForecastSupply,
      NetGap: netSkillGap,
      type: 'Predictive Projection',
    },
  ];

  // District Breakdown Comparison Data
  const districtBreakdown = districts.map((d) => {
    const dWeight = getDistrictWeight(d.name);
    const dDemand = Math.round(
      occupations.reduce((sum, o) => {
        const matchesSector = selectedSector === 'All' || o.sector === selectedSector;
        if (!matchesSector) return sum;
        const fc = calculateOccupationForecast(o, d.name, selectedHorizon);
        return sum + fc.forecastDemand;
      }, 0)
    );
    const dSupply = Math.round(
      occupations.reduce((sum, o) => {
        const matchesSector = selectedSector === 'All' || o.sector === selectedSector;
        if (!matchesSector) return sum;
        const fc = calculateOccupationForecast(o, d.name, selectedHorizon);
        return sum + fc.forecastSupply;
      }, 0)
    );
    const dGap = dDemand - dSupply;

    return {
      district: d,
      demand: dDemand,
      supply: dSupply,
      gap: dGap,
      weightPercent: Math.round(dWeight * 100),
    };
  });

  // Sector Breakdown Data
  const uniqueSectors = Array.from(new Set(occupations.map((o) => o.sector)));
  const sectorBreakdown = uniqueSectors.map((sectorName) => {
    const sectorOccs = occupations.filter((o) => o.sector === sectorName);
    const sDemand = sectorOccs.reduce((sum, o) => {
      const fc = calculateOccupationForecast(o, targetDist, selectedHorizon);
      return sum + fc.forecastDemand;
    }, 0);
    const sSupply = sectorOccs.reduce((sum, o) => {
      const fc = calculateOccupationForecast(o, targetDist, selectedHorizon);
      return sum + fc.forecastSupply;
    }, 0);
    const sGap = sDemand - sSupply;

    return {
      sector: sectorName,
      occupationsCount: sectorOccs.length,
      demand: sDemand,
      supply: sSupply,
      gap: sGap,
    };
  });

  // High-velocity Skills Breakdown
  const allSkillsList: { name: string; type: 'core' | 'emerging'; relatedOccs: string[]; persistentRatio: number }[] = [];
  occupations.forEach((o) => {
    o.coreSkills.forEach((s) => {
      const existing = allSkillsList.find((item) => item.name === s);
      if (existing) {
        if (!existing.relatedOccs.includes(o.name)) existing.relatedOccs.push(o.name);
      } else {
        allSkillsList.push({
          name: s,
          type: 'core',
          relatedOccs: [o.name],
          persistentRatio: o.persistentVacanciesRatio,
        });
      }
    });
    o.emergingSkills.forEach((s) => {
      const existing = allSkillsList.find((item) => item.name === s);
      if (existing) {
        if (!existing.relatedOccs.includes(o.name)) existing.relatedOccs.push(o.name);
      } else {
        allSkillsList.push({
          name: s,
          type: 'emerging',
          relatedOccs: [o.name],
          persistentRatio: o.persistentVacanciesRatio,
        });
      }
    });
  });

  // Filter skills matching active sector
  const relevantSkills = allSkillsList.filter((sk) => {
    if (selectedSector === 'All') return true;
    return sk.relatedOccs.some((occName) => {
      const occ = occupations.find((o) => o.name === occName);
      return occ && occ.sector === selectedSector;
    });
  });

  // Filter recommendations matching active district/sector
  const relevantRecommendations = recommendations.filter((rec) => {
    const matchesDist = selectedDistrict === 'All' || rec.district.includes(selectedDistrict);
    const matchesSec = selectedSector === 'All' || rec.sector === selectedSector;
    return matchesDist && matchesSec;
  });

  const handleResetAllFilters = () => {
    setSelectedDistrict('All');
    setSelectedSector('All');
    setSelectedOccupation('All');
    setSelectedSkill('All');
    setSelectedHorizon('12m');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Institutional Mission & Governance Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-700" />
              <span>Ministry of Skill Development and Entrepreneurship (MSDE) &bull; Govt of India</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'श्रम बाजार बुद्धिमत्ता एवं कौशल योजना कॉकपिट'
                : 'Labour Market Intelligence & Skill Planning Cockpit'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'hi'
                ? `सक्रिय पायलट: ${selectedState} (${targetDist}) | योजना क्षितिज: ${selectedHorizon}`
                : `Active Pilot Scope: ${selectedState} (${targetDist}) | Forecast Horizon: ${selectedHorizon}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('simulator')}
              className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-xs transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>What-If Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Planner Dossier</span>
            </button>
          </div>
        </div>

        {/* Data Governance & Provenance Tags */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-700">Data Provenance:</span>
          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono">
            Observed Historical: 2023 - 2025
          </span>
          <span className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-blue-800 font-mono">
            Estimated Baseline: 2026 Q1
          </span>
          <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-mono">
            Forecast Horizon: {selectedHorizon} Projected
          </span>
          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-amber-800 font-mono">
            SIH PS 26246 Demonstration Pilot Dataset
          </span>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar />

      {/* Empty State Banner if 0 occupations match filters */}
      {filteredOccs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Occupations Match the Active Filter Combination
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5">
            Your current filter combination (District: <span className="font-medium text-slate-700">{selectedDistrict}</span>, Sector: <span className="font-medium text-slate-700">{selectedSector}</span>, Occupation: <span className="font-medium text-slate-700">{selectedOccupation}</span>, Skill: <span className="font-medium text-slate-700">{selectedSkill}</span>) yielded 0 records.
          </p>
          <div className="mt-4">
            <button
              onClick={handleResetAllFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* KPI 1: Forecast Labour Demand */}
            <div
              onClick={() => setActiveTab('demand')}
              className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
              title="Click to inspect detailed demand records"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Forecast Demand</span>
                <TrendingUp className="w-4 h-4 text-blue-700" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {totalForecastDemand.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Headcount / Vacancies ({selectedHorizon})
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-blue-700 mt-2">
                <ArrowUpRight className="w-3 h-3" />
                <span>+24.8% YoY Expansion</span>
              </div>
            </div>

            {/* KPI 2: Effective Workforce Supply */}
            <div
              onClick={() => setActiveTab('supply')}
              className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
              title="Click to inspect training supply pipeline"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Effective Supply</span>
                <Users className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {totalForecastSupply.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Work-Ready Candidates
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 mt-2">
                <CheckCircle2 className="w-3 h-3" />
                <span>84% Cohort Completion</span>
              </div>
            </div>

            {/* KPI 3: Net Skill Gap */}
            <div
              onClick={() => setActiveTab('forecast')}
              className={`border p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm ${
                netSkillGap > 0
                  ? 'bg-red-50/60 border-red-200 hover:border-red-300'
                  : 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
              }`}
              title="Click to inspect occupation gap forecasts"
            >
              <div className="flex items-center justify-between text-slate-600 text-xs font-medium">
                <span>Net Skill Gap</span>
                <Activity className={`w-4 h-4 ${netSkillGap > 0 ? 'text-red-700' : 'text-emerald-700'}`} />
              </div>
              <div
                className={`text-2xl font-extrabold mt-2 ${
                  netSkillGap > 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {netSkillGap > 0 ? `+${netSkillGap.toLocaleString('en-IN')}` : netSkillGap.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] font-medium text-slate-600 mt-0.5">
                {netSkillGap > 0 ? 'Net Deficit (Shortage)' : 'Net Surplus (Oversupply)'}
              </div>
              <div className="text-[10px] text-slate-500 mt-2 font-mono">
                Formula: Gap = Demand - Supply
              </div>
            </div>

            {/* KPI 4: Infrastructure & Placements */}
            <div
              onClick={() => setActiveTab('centres')}
              className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm"
              title="Click to inspect training centres registry"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Placements & Seats</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {avgPlacementRate}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Utilisation: {avgCapacityUtil}% of seats
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                {relevantCentres.length} Active Training Centres
              </div>
            </div>

            {/* KPI 5: Hard-To-Fill Friction Index */}
            <div
              onClick={() => setActiveTab('forecast')}
              className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl cursor-pointer transition-all shadow-xs hover:shadow-sm col-span-2 lg:col-span-1"
              title="Persistent vacancies open > 60 days"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Persistent Vacancy Index</span>
                <Briefcase className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {avgPersistentVacancies}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Open &gt; 60 Days
              </div>
              <div className="text-[11px] font-medium text-amber-700 mt-2">
                Structural Skill Mismatch
              </div>
            </div>
          </div>

          {/* Decisions Requiring Immediate Planner Attention (Action Queue) */}
          {relevantRecommendations.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Decisions Requiring Immediate Planner Attention ({relevantRecommendations.length} Actions)</span>
                </div>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="text-xs text-amber-800 font-semibold hover:underline flex items-center"
                >
                  View Policy Queue <ChevronRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {relevantRecommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setActiveTab('recommendations')}
                    className="bg-white border border-amber-200 hover:border-amber-400 p-3.5 rounded-lg cursor-pointer transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-blue-800 font-semibold">
                          {rec.district} &bull; {rec.sector}
                        </span>
                        <span className="text-red-700 font-bold uppercase">{rec.severity} Severity</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{rec.recommendedAction}</p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Est. Budget: ₹{rec.estimatedBudgetLakhs || 25} Lakhs</span>
                      <span className="text-blue-700 font-semibold hover:underline flex items-center">
                        Review Action <ChevronRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time-Series Trajectory Chart (2023 - 2026) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <span>Demand vs Effective Supply Trajectory (2023 - 2026)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate technician requirement versus trained pipeline across {targetDist} (Units: Headcount / Seats)
                </p>
              </div>

              {/* Chart Mode Controls */}
              <div className="flex items-center space-x-2">
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex text-xs">
                  <button
                    onClick={() => setTimeSeriesMetric('demand_supply')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      timeSeriesMetric === 'demand_supply'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Demand &amp; Supply
                  </button>
                  <button
                    onClick={() => setTimeSeriesMetric('net_gap')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      timeSeriesMetric === 'net_gap'
                        ? 'bg-white text-blue-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Net Skill Gap
                  </button>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => Number(val).toLocaleString('en-IN')}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      `${Number(value).toLocaleString('en-IN')} technicians`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      color: '#0f172a',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                  {timeSeriesMetric === 'demand_supply' ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey="Demand"
                        stroke="#1d4ed8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#demandGrad)"
                        name="Projected Labour Demand"
                      />
                      <Area
                        type="monotone"
                        dataKey="Supply"
                        stroke="#059669"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#supplyGrad)"
                        name="Effective Trained Supply"
                      />
                    </>
                  ) : (
                    <Area
                      type="monotone"
                      dataKey="NetGap"
                      stroke="#dc2626"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#gapGrad)"
                      name="Net Skill Gap (+Deficit / -Surplus)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-700" />
                  <span>2023 - 2025: Observed PLFS &amp; Postings</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                  <span>2026 ({selectedHorizon}): Trajectory Extrapolation</span>
                </span>
              </div>
              <span className="font-mono text-slate-400">
                Model: YoY Trajectory Extrapolation + Cohort Funnel Model
              </span>
            </div>
          </div>

          {/* Multi-Dimensional Breakdown Tabs & Views */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-700" />
                  <span>Multi-Dimensional Breakdown &amp; Analysis</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Inspect workforce indicators across districts, sectors, skills, and occupational registries:
                </p>
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto">
                <button
                  onClick={() => setBreakdownTab('occupations')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                    breakdownTab === 'occupations'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Occupations ({filteredOccs.length})
                </button>
                <button
                  onClick={() => setBreakdownTab('districts')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                    breakdownTab === 'districts'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Districts (4 Hubs)
                </button>
                <button
                  onClick={() => setBreakdownTab('sectors')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                    breakdownTab === 'sectors'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sectors ({uniqueSectors.length})
                </button>
                <button
                  onClick={() => setBreakdownTab('skills')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                    breakdownTab === 'skills'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  High-Velocity Skills ({relevantSkills.length})
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Occupations Registry */}
            {breakdownTab === 'occupations' && (
              <div className="mt-4 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/80">
                        <th className="py-2.5 px-3">Occupation / Trade</th>
                        <th className="py-2.5 px-3">Sector &bull; NCO</th>
                        <th className="py-2.5 px-3 text-right">Demand ({selectedHorizon})</th>
                        <th className="py-2.5 px-3 text-right">Trained Supply</th>
                        <th className="py-2.5 px-3 text-right">Net Gap</th>
                        <th className="py-2.5 px-3 text-center">Hard-to-Fill</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {forecasts.map(({ occ, forecast }) => {
                        const isShortage = forecast.skillGap > 0;
                        return (
                          <tr key={occ.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <div
                                onClick={() => setSelectedOccupationModal(occ)}
                                className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer"
                              >
                                {occ.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {occ.coreSkills.slice(0, 3).join(', ')}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-slate-700">{occ.sector}</div>
                              <div className="text-[10px] font-mono text-slate-500">
                                NCO: {occ.ncoCode} &bull; NSQF {occ.nsqfLevel}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-slate-900">
                              {forecast.forecastDemand.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-slate-900">
                              {forecast.forecastSupply.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span
                                className={`inline-block font-extrabold px-2 py-0.5 rounded text-[11px] ${
                                  isShortage
                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {isShortage ? `+${forecast.skillGap.toLocaleString('en-IN')}` : forecast.skillGap.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="text-[11px] text-slate-700 font-medium">
                                {(occ.persistentVacanciesRatio * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => setSelectedOccupationModal(occ)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-blue-700 text-[11px] font-semibold rounded transition-colors"
                                >
                                  Inspect
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedOccupation(occ.id);
                                    setActiveTab('simulator');
                                  }}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-semibold rounded transition-colors"
                                >
                                  Simulate
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: District Comparison */}
            {breakdownTab === 'districts' && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {districtBreakdown.map(({ district: d, demand, supply, gap, weightPercent }) => {
                    const isSelected = selectedDistrict === d.name;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDistrict(d.name)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{d.name}</span>
                          <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                            {weightPercent}% pilot share
                          </span>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Demand:</span>
                            <span className="font-semibold text-slate-900">{demand.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Supply:</span>
                            <span className="font-semibold text-slate-900">{supply.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                            <span>Net Gap:</span>
                            <span className={`font-bold ${gap > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                              {gap > 0 ? `+${gap.toLocaleString('en-IN')}` : gap.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                          <span>{d.activeCentresCount} Centres</span>
                          <span className="text-blue-700 font-semibold hover:underline">
                            {isSelected ? 'Active Filter' : 'Filter by District'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-700 hover:underline"
                  >
                    <span>Open Full GIS Choropleth Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Sector Breakdown */}
            {breakdownTab === 'sectors' && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {sectorBreakdown.map((sec) => (
                    <div
                      key={sec.sector}
                      onClick={() => setSelectedSector(sec.sector)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedSector === sec.sector
                          ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{sec.sector}</span>
                        <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {sec.occupationsCount} Trades
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-200 text-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <div className="text-[10px] text-slate-500">Demand</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">
                            {sec.demand.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <div className="text-[10px] text-slate-500">Supply</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">
                            {sec.supply.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <div className="text-[10px] text-slate-500">Net Gap</div>
                          <div
                            className={`text-xs font-extrabold mt-0.5 ${
                              sec.gap > 0 ? 'text-red-700' : 'text-emerald-700'
                            }`}
                          >
                            {sec.gap > 0 ? `+${sec.gap.toLocaleString('en-IN')}` : sec.gap.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        <span className="text-[11px] text-blue-700 font-semibold hover:underline">
                          {selectedSector === sec.sector ? 'Currently Filtered' : 'Filter by this Sector'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: High-Velocity & Emerging Skills */}
            {breakdownTab === 'skills' && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relevantSkills.slice(0, 12).map((sk) => {
                    const isSelected = selectedSkill === sk.name;
                    return (
                      <div
                        key={sk.name}
                        onClick={() => setSelectedSkill(isSelected ? 'All' : sk.name)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-500 ring-1 ring-blue-500'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                              sk.type === 'emerging'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}
                          >
                            {sk.type === 'emerging' ? 'Emerging Trend' : 'Core Foundation'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {sk.relatedOccs.length} Trades
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-2">{sk.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          Applicable: {sk.relatedOccs.join(', ')}
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            Persistent Vacancy: {(sk.persistentRatio * 100).toFixed(0)}%
                          </span>
                          <span className="text-blue-700 font-semibold hover:underline">
                            {isSelected ? 'Remove Filter' : 'Filter by Skill'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mathematical Assumptions, Formulas & Skill-Gap Drivers Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Mathematical Methodology, Assumptions &amp; Skill-Gap Drivers
                </h3>
              </div>
              <button
                onClick={() => setShowAssumptions(!showAssumptions)}
                className="text-xs font-semibold text-blue-700 hover:underline flex items-center space-x-1"
              >
                <span>{showAssumptions ? 'Hide Methodology' : 'Inspect Mathematical Framework'}</span>
                {showAssumptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAssumptions && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs text-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Formula 1: Demand */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900">1. Forecast Demand Formulation</div>
                    <div className="font-mono text-[11px] text-blue-800 bg-white p-2 rounded mt-1.5 border border-slate-200">
                      D_eff = D_annualized &times; (1 + g) &times; M_horizon &times; w_dist
                    </div>
                    <p className="mt-2 text-[11px] text-slate-600">
                      D_annualized is estimated from distinct vacancy postings. Growth rate (g) uses annualized trajectory trend adjusted for employer surveys and policy deltas. M_horizon is 0.5 (6m), 1.0 (12m), or 2.08 (24m).
                    </p>
                  </div>

                  {/* Formula 2: Supply */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900">2. Effective Supply Funnel</div>
                    <div className="font-mono text-[11px] text-emerald-800 bg-white p-2 rounded mt-1.5 border border-slate-200">
                      S_eff = Seats &times; 94% &times; 84% &times; 92% &times; 82% &times; w_dist
                    </div>
                    <p className="mt-2 text-[11px] text-slate-600">
                      Supply translates approved capacity through the empirical transition matrix: 94% Enrolment &rarr; 84% Completion &rarr; 92% Certification &rarr; 82% Active Labour-Market Entry.
                    </p>
                  </div>

                  {/* Formula 3: Net Gap */}
                  <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div className="font-bold text-slate-900">3. Net Skill Gap &amp; Classification</div>
                    <div className="font-mono text-[11px] text-red-800 bg-white p-2 rounded mt-1.5 border border-slate-200">
                      Skill Gap (&Delta;) = D_eff - S_eff
                    </div>
                    <p className="mt-2 text-[11px] text-slate-600">
                      Positive gap (&gt; +120) triggers Shortage mitigation recommendations. Negative gap (&lt; -100) triggers Capacity Rationalisation to prevent candidate underemployment.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg text-[11px] text-slate-700">
                  <span className="font-bold text-blue-900">District Weighting Allocation: </span>
                  When evaluating individual districts, economic workforce footprints are applied proportionally: Raipur (35%), Durg (30%), Bilaspur (20%), and Korba (15%), which aggregate to 100% when "All Districts (Pilot Aggregate)" is active.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

