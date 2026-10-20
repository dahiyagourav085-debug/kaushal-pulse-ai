/**
 * KAUSHAL PULSE AI — WHAT-IF POLICY SIMULATOR (SIGNATURE FEATURE)
 * Evidence-informed scenario laboratory for MSDE planners and District Skill Committees.
 * Models training-seat reallocation, completion benchmarks, employment conversion, and fiscal budget impact.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { runPolicySimulation, exportToCsvString, getDistrictWeight } from '../../utils/analytics';
import { PolicyScenario, ForecastHorizon } from '../../types';
import {
  Sliders,
  Save,
  Download,
  Printer,
  TrendingUp,
  Users,
  Banknote,
  Award,
  Layers,
  CheckCircle,
  AlertCircle,
  Trash2,
  CheckCircle2,
  RotateCcw,
  UploadCloud,
  HelpCircle,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Info,
  Scale,
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

export const PolicySimulator: React.FC = () => {
  const {
    language,
    selectedDistrict,
    setSelectedDistrict,
    selectedSector,
    setSelectedSector,
    selectedHorizon,
    setSelectedHorizon,
    occupations,
    districts,
    savedScenarios,
    savePolicyScenario,
    deletePolicyScenario,
  } = useApp();

  // Active Dimensions Filter
  const [activeDistrict, setActiveDistrict] = useState<string>(
    selectedDistrict === 'All' ? 'Raipur' : selectedDistrict
  );
  const [activeSectorFilter, setActiveSectorFilter] = useState<string>(
    selectedSector === 'All' ? 'All' : selectedSector
  );
  const [activeOccupationId, setActiveOccupationId] = useState<string>(
    occupations[0]?.id || 'occ-solar-pv'
  );
  const [horizon, setHorizon] = useState<ForecastHorizon>(selectedHorizon);

  // Seat input mode: 'percent' | 'absolute'
  const [seatInputMode, setSeatInputMode] = useState<'percent' | 'absolute'>('percent');

  // Policy Levers
  const [seatChangePercent, setSeatChangePercent] = useState<number>(30); // +30%
  const [completionRatePercent, setCompletionRatePercent] = useState<number>(84); // 84%
  const [employmentConversionPercent, setEmploymentConversionPercent] = useState<number>(82); // 82%
  const [demandGrowthPercent, setDemandGrowthPercent] = useState<number>(12); // +12%
  const [unitSeatCostInr, setUnitSeatCostInr] = useState<number>(18500);

  // Optional Fiscal Constraint
  const [budgetCeilingLakhs, setBudgetCeilingLakhs] = useState<number>(0); // 0 = unconstrained

  // Custom scenario save name & description
  const [scenarioName, setScenarioName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Unique Sectors list
  const uniqueSectors = useMemo(() => {
    return Array.from(new Set(occupations.map((o) => o.sector))).sort();
  }, [occupations]);

  // Filtered occupations based on active sector
  const sectorOccupations = useMemo(() => {
    if (activeSectorFilter === 'All') return occupations;
    return occupations.filter((o) => o.sector === activeSectorFilter);
  }, [occupations, activeSectorFilter]);

  // Selected occupation object
  const selectedOcc = useMemo(() => {
    const found = sectorOccupations.find((o) => o.id === activeOccupationId);
    if (found) return found;
    return sectorOccupations[0] || occupations[0];
  }, [sectorOccupations, activeOccupationId, occupations]);

  // Live calculated simulation result
  const currentResult: PolicyScenario = useMemo(() => {
    return runPolicySimulation(
      selectedOcc,
      activeDistrict,
      horizon,
      seatChangePercent,
      completionRatePercent,
      demandGrowthPercent,
      unitSeatCostInr,
      employmentConversionPercent,
      budgetCeilingLakhs > 0 ? budgetCeilingLakhs : undefined
    );
  }, [
    selectedOcc,
    activeDistrict,
    horizon,
    seatChangePercent,
    completionRatePercent,
    demandGrowthPercent,
    unitSeatCostInr,
    employmentConversionPercent,
    budgetCeilingLakhs,
  ]);

  // Baseline figures
  const baselineSeats = currentResult.baselineSeats || 1000;
  const projectedSeats = currentResult.projectedSeats || Math.round(baselineSeats * (1 + seatChangePercent / 100));
  const baselineDemand = currentResult.baselineDemand || 1200;
  const projectedDemand = currentResult.projectedDemand || 1350;
  const baselineSupply = currentResult.baselineSupply || 600;
  const projectedSupply = currentResult.projectedSupply;
  const baselineGap = currentResult.baselineGap;
  const projectedGap = currentResult.projectedGap;
  const baselineBudgetLakhs = Number(((baselineSeats * unitSeatCostInr) / 100000).toFixed(2));

  // Handle direct target seat count change
  const handleTargetSeatsChange = (target: number) => {
    const safeTarget = Math.max(0, target);
    if (baselineSeats > 0) {
      const deltaPercent = Math.round(((safeTarget - baselineSeats) / baselineSeats) * 100);
      setSeatChangePercent(deltaPercent);
    }
  };

  // Preset Handlers
  const handlePresetMaintain = () => {
    setSeatChangePercent(0);
    setCompletionRatePercent(84);
    setEmploymentConversionPercent(82);
    setDemandGrowthPercent(12);
  };

  const handlePresetExpansion = () => {
    setSeatChangePercent(45);
    setCompletionRatePercent(88);
    setEmploymentConversionPercent(85);
    setDemandGrowthPercent(20);
  };

  const handlePresetReallocation = () => {
    setSeatChangePercent(-25);
    setCompletionRatePercent(80);
    setEmploymentConversionPercent(75);
    setDemandGrowthPercent(-5);
  };

  const handleResetToBaseline = () => {
    setSeatChangePercent(0);
    setCompletionRatePercent(84);
    setEmploymentConversionPercent(82);
    setDemandGrowthPercent(12);
    setUnitSeatCostInr(18500);
    setBudgetCeilingLakhs(0);
  };

  // Load a saved scenario into the simulator controls
  const handleLoadScenario = (sc: PolicyScenario) => {
    setActiveDistrict(sc.district);
    setSelectedDistrict(sc.district);
    setHorizon(sc.horizonMonths);
    setSelectedHorizon(sc.horizonMonths);
    setActiveOccupationId(sc.occupationId);

    const occ = occupations.find((o) => o.id === sc.occupationId);
    if (occ) {
      setActiveSectorFilter(occ.sector);
    }

    setSeatChangePercent(sc.seatChangePercent);
    setCompletionRatePercent(sc.completionRatePercent);
    setDemandGrowthPercent(sc.demandGrowthAssumptionPercent);
    setUnitSeatCostInr(sc.unitSeatCostInr || 18500);
    if (sc.employmentConversionPercent) {
      setEmploymentConversionPercent(sc.employmentConversionPercent);
    }
    if (sc.budgetCeilingLakhs) {
      setBudgetCeilingLakhs(sc.budgetCeilingLakhs);
    }
    setSaveSuccessMsg(`Loaded scenario: "${sc.name}" into simulator controls.`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSaveScenario = () => {
    const finalName =
      scenarioName.trim() ||
      `${selectedOcc.name.split(' ')[0]} in ${activeDistrict} (${seatChangePercent >= 0 ? '+' : ''}${seatChangePercent}%)`;

    savePolicyScenario({
      ...currentResult,
      id: `custom-sim-${Date.now()}`,
      name: finalName,
      isPreset: false,
    });

    setScenarioName('');
    setSaveSuccessMsg('Scenario successfully saved to comparison register!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleExportCsv = () => {
    const exportData = savedScenarios.map((s) => ({
      ScenarioName: s.name,
      District: s.district,
      Sector: s.sector,
      Horizon: s.horizonMonths,
      SeatChangePercent: s.seatChangePercent,
      CompletionRate: s.completionRatePercent,
      ConversionRate: s.employmentConversionPercent || 82,
      DemandGrowth: s.demandGrowthAssumptionPercent,
      BaselineSeats: s.baselineSeats || 'N/A',
      ProjectedSeats: s.projectedSeats || 'N/A',
      BaselineSupply: s.baselineSupply || 'N/A',
      ProjectedSupply: s.projectedSupply,
      BaselineDemand: s.baselineDemand || 'N/A',
      ProjectedDemand: s.projectedDemand || 'N/A',
      BaselineGap: s.baselineGap,
      ProjectedGap: s.projectedGap,
      BudgetDeltaLakhs: s.costDeltaLakhs,
      TotalBudgetLakhs: s.budgetAllocationLakhs,
      PlacementImpact: s.placementImpactPercent,
      Notes: s.notes,
      CreatedAt: s.createdAt,
    }));
    exportToCsvString(exportData, `Policy_Simulation_Scenarios_${activeDistrict}`);
  };

  const handlePrintBrief = () => {
    window.print();
  };

  // Side-by-side comparison chart data
  const comparisonChartData = [
    {
      Metric: 'Baseline (Status Quo)',
      Demand: baselineDemand,
      Supply: baselineSupply,
      'Skill Gap': baselineGap,
    },
    {
      Metric: 'Proposed Intervention',
      Demand: projectedDemand,
      Supply: projectedSupply,
      'Skill Gap': projectedGap,
    },
  ];

  // Effective yield per 100 seats
  const yieldPer100Seats = Math.round(
    0.94 * (completionRatePercent / 100) * 0.92 * (employmentConversionPercent / 100) * 100
  );

  return (
    <div className="space-y-6">
      {/* Title & Governance Introduction */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Evidence-Informed What-If Policy Lab &bull; MSDE Planning</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'नीति सिमुलेटर — प्रशिक्षण सीट आवंटन एवं परिणाम मॉडलिंग'
                : 'What-If Policy Simulator: Training Seat Allocation & Fiscal Impact'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Model the downstream consequences of altering ITI, PMKK, and polytechnic seat quotas,
              completion benchmarks, and industry demand assumptions prior to sanctioning government funds.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 no-print">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintBrief}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Brief</span>
            </button>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1">
            Policy Presets:
          </span>
          <button
            onClick={handlePresetMaintain}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            1. Maintain Current Policy
          </button>
          <button
            onClick={handlePresetExpansion}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            2. Targeted Capacity Expansion (+45%)
          </button>
          <button
            onClick={handlePresetReallocation}
            className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
          >
            3. Capacity Reallocation (-25%)
          </button>
          <button
            onClick={handleResetToBaseline}
            className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Reset to Baseline Defaults</span>
          </button>
        </div>

        {/* Transparent Methodology & Assumption Disclosure */}
        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-900 flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-950">
              Heuristic Policy Simulation Model &bull; Synthetic Baseline Notice
            </span>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Simulation projections are exploratory scenario calculations based on user-configured cohort attrition (enrolment, completion, certification, and market conversion) and district weights. These figures are illustrative decision-support projections for hackathon planning, not verified empirical guarantees or official gazetted budget sanctions.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Workspace: Left Controls (1 col) + Right Projections (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Controls Column */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-700" />
              <span>Simulation Parameters</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Footprint: {Math.round(getDistrictWeight(activeDistrict) * 100)}%
            </span>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Industrial Sector
            </label>
            <select
              value={activeSectorFilter}
              onChange={(e) => {
                setActiveSectorFilter(e.target.value);
                setSelectedSector(e.target.value);
              }}
              aria-label="Filter by sector"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            >
              <option value="All">All Sectors ({uniqueSectors.length})</option>
              {uniqueSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target District Hub
            </label>
            <select
              value={activeDistrict}
              onChange={(e) => {
                setActiveDistrict(e.target.value);
                setSelectedDistrict(e.target.value);
              }}
              aria-label="Target district for simulation"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            >
              <option value="All">All Districts (Pilot Aggregate)</option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          {/* Occupation Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Occupation / Trade (NCO 2015)
            </label>
            <select
              value={activeOccupationId}
              onChange={(e) => setActiveOccupationId(e.target.value)}
              aria-label="Target occupation for simulation"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            >
              {sectorOccupations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} (NCO: {o.ncoCode} &bull; NSQF L{o.nsqfLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Horizon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Forecast Horizon
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['6m', '12m', '24m'] as ForecastHorizon[]).map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setHorizon(h);
                    setSelectedHorizon(h);
                  }}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    horizon === h
                      ? 'bg-blue-50 text-blue-800 border-blue-400 font-bold shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {h === '6m' ? '6 Months' : h === '12m' ? '12 Months' : '24 Months'}
                </button>
              ))}
            </div>
          </div>

          {/* Seat Input Mode Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Seat Allocation Mode:
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-md border border-slate-200 text-[11px]">
                <button
                  onClick={() => setSeatInputMode('percent')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    seatInputMode === 'percent'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Percentage (%)
                </button>
                <button
                  onClick={() => setSeatInputMode('absolute')}
                  className={`px-2 py-0.5 rounded font-medium transition-colors ${
                    seatInputMode === 'absolute'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Direct Seats
                </button>
              </div>
            </div>

            {seatInputMode === 'percent' ? (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Proposed Seat Adjustment</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      seatChangePercent > 0
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : seatChangePercent < 0
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {seatChangePercent > 0 ? `+${seatChangePercent}%` : `${seatChangePercent}%`} ({projectedSeats} seats)
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="200"
                  step="5"
                  value={seatChangePercent}
                  onChange={(e) => setSeatChangePercent(Number(e.target.value))}
                  aria-label="Proposed seat adjustment percent"
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>-100% (Zero Seats)</span>
                  <span>0% (Baseline: {baselineSeats})</span>
                  <span>+200% (Surge)</span>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Sanctioned Seats Count</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    {seatChangePercent > 0 ? `+${seatChangePercent}%` : `${seatChangePercent}%`}
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={projectedSeats}
                  onChange={(e) => handleTargetSeatsChange(Number(e.target.value))}
                  aria-label="Target seat count"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
                <div className="text-[10px] text-slate-500 mt-1">
                  Baseline capacity: {baselineSeats.toLocaleString('en-IN')} seats
                </div>
              </div>
            )}
          </div>

          {/* Lever 2: Training Completion & Exam Benchmark */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Completion Benchmark</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {completionRatePercent}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="98"
              step="1"
              value={completionRatePercent}
              onChange={(e) => setCompletionRatePercent(Number(e.target.value))}
              aria-label="Completion benchmark percentage"
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>40% (High Dropout)</span>
              <span>84% (National Benchmark)</span>
              <span>98% (Exemplary)</span>
            </div>
          </div>

          {/* Lever 3: Employment & Market Conversion */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Employment Conversion Rate</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {employmentConversionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="40"
              max="98"
              step="1"
              value={employmentConversionPercent}
              onChange={(e) => setEmploymentConversionPercent(Number(e.target.value))}
              aria-label="Employment conversion rate percentage"
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>40% (Low Linkage)</span>
              <span>82% (Standard Conversion)</span>
              <span>98% (Direct Apprenticeship)</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              % of certified completers actively entering local workforce (NAPS linkage).
            </p>
          </div>

          {/* Lever 4: Employer Demand Growth Trend */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">Industry Demand Growth Trend</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {demandGrowthPercent > 0 ? `+${demandGrowthPercent}%` : `${demandGrowthPercent}%`}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="50"
              step="1"
              value={demandGrowthPercent}
              onChange={(e) => setDemandGrowthPercent(Number(e.target.value))}
              aria-label="Employer demand growth trend percent"
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>-25% (Contraction)</span>
              <span>+12% (Baseline CAGR)</span>
              <span>+50% (Industrial Surge)</span>
            </div>
          </div>

          {/* Unit Seat Cost Config & Budget Ceiling */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost per Training Seat (PMKVY/DGT Norms in INR)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={unitSeatCostInr}
                onChange={(e) => setUnitSeatCostInr(Math.max(1000, Number(e.target.value)))}
                aria-label="Cost per training seat in rupees"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Authorized Budget Ceiling (₹ Lakhs)
                </label>
                <span className="text-[10px] text-slate-500">0 = Unconstrained</span>
              </div>
              <input
                type="number"
                min="0"
                step="5"
                value={budgetCeilingLakhs}
                onChange={(e) => setBudgetCeilingLakhs(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 50 (₹50 Lakhs limit)"
                aria-label="Budget ceiling limit in Lakhs"
                className={`w-full bg-slate-50 border rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none transition-colors ${
                  currentResult.budgetExceeded
                    ? 'border-red-400 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                }`}
              />
              {currentResult.budgetExceeded && (
                <div className="text-[11px] text-red-700 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>
                    Exceeds ceiling by ₹{(currentResult.budgetAllocationLakhs - budgetCeilingLakhs).toFixed(2)} Lakhs!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Projections & Outcomes Column (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Defined Baseline Scenario Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>Defined Baseline Status Quo Scenario ({selectedOcc.name})</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {activeDistrict} &bull; {horizon} Horizon
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Approved Seats</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {baselineSeats.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Baseline Capacity</div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Work-Ready Supply</div>
                <div className="text-sm font-bold text-emerald-700 mt-0.5">
                  {baselineSupply.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Cohort Yield (60%)</div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Industry Demand</div>
                <div className="text-sm font-bold text-blue-700 mt-0.5">
                  {baselineDemand.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">Unadjusted Need</div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Status Quo Gap</div>
                <div
                  className={`text-sm font-extrabold mt-0.5 ${
                    baselineGap > 0 ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {baselineGap > 0 ? `+${baselineGap.toLocaleString('en-IN')}` : baselineGap.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-400">
                  {baselineGap > 0 ? 'Deficit' : 'Surplus'}
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500">Program Budget</div>
                <div className="text-sm font-bold text-slate-800 mt-0.5">
                  ₹{baselineBudgetLakhs} L
                </div>
                <div className="text-[10px] text-slate-400">Status Quo Cost</div>
              </div>
            </div>
          </div>

          {/* Output Impact Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: Effective Supply */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                <span>Simulated Supply</span>
                <Users className="w-3.5 h-3.5 text-teal-700" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {projectedSupply.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-teal-700 font-medium mt-0.5 flex items-center space-x-1">
                <span>
                  {projectedSupply >= baselineSupply ? `+${projectedSupply - baselineSupply}` : projectedSupply - baselineSupply} vs baseline
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                From {projectedSeats} sanctioned seats
              </div>
            </div>

            {/* Metric 2: Net Gap */}
            <div
              className={`p-4 rounded-xl border shadow-xs ${
                projectedGap > 0
                  ? 'bg-red-50/70 border-red-200 text-red-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="text-[11px] font-medium flex items-center justify-between">
                <span>Projected Skill Gap</span>
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-extrabold mt-1">
                {projectedGap > 0 ? `+${projectedGap.toLocaleString('en-IN')}` : projectedGap.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] mt-0.5 font-medium">
                {baselineGap > 0 && projectedGap < baselineGap
                  ? `Deficit reduced by ${(baselineGap - projectedGap).toLocaleString('en-IN')}`
                  : baselineGap < 0 && projectedGap > baselineGap
                  ? `Surplus reduced by ${(projectedGap - baselineGap).toLocaleString('en-IN')}`
                  : `${projectedGap > 0 ? 'Deficit' : 'Surplus'}`}
              </div>
              <div className="text-[10px] opacity-75 mt-1 font-mono">
                Baseline was: {baselineGap > 0 ? `+${baselineGap}` : baselineGap}
              </div>
            </div>

            {/* Metric 3: Fiscal Impact */}
            <div
              className={`border p-4 rounded-xl shadow-xs ${
                currentResult.budgetExceeded
                  ? 'bg-red-50 border-red-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                <span>Fiscal Delta</span>
                <Banknote className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {currentResult.costDeltaLakhs > 0 ? `+₹${currentResult.costDeltaLakhs}` : `₹${currentResult.costDeltaLakhs}`} L
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Total: ₹{currentResult.budgetAllocationLakhs} L
              </div>
              {currentResult.budgetExceeded && (
                <div className="text-[10px] text-red-700 font-bold mt-1">
                  Budget Cap Exceeded!
                </div>
              )}
            </div>

            {/* Metric 4: Placement Conversion */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-[11px] font-medium text-slate-500 flex items-center justify-between">
                <span>Est. Placement Rate</span>
                <Award className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">
                {currentResult.placementImpactPercent}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Market absorption yield
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {projectedSupply > projectedDemand * 1.15 ? 'Oversupply pressure' : 'Strong demand pull'}
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-700" />
                  <span>Comparative Policy Impact: Baseline vs Proposed Intervention</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visual comparison of demand, effective supply, and projected skill gap:
                </p>
              </div>
              <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-mono">
                {horizon} Planning Horizon
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="Metric" stroke="#64748b" fontSize={11} />
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="Demand" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Labour Demand" />
                  <Bar dataKey="Supply" fill="#059669" radius={[4, 4, 0, 0]} name="Effective Supply" />
                  <Bar dataKey="Skill Gap" fill="#ea580c" radius={[4, 4, 0, 0]} name="Skill Gap" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side-by-Side Detailed Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2 mb-3">
              <Scale className="w-4 h-4 text-blue-700" />
              <span>Side-by-Side Policy Comparison Matrix</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <th className="py-2 px-3">Policy Indicator</th>
                    <th className="py-2 px-3 text-right">Baseline (Status Quo)</th>
                    <th className="py-2 px-3 text-right">Proposed Intervention</th>
                    <th className="py-2 px-3 text-right">Net Variance (&Delta;)</th>
                    <th className="py-2 px-3 text-left">Analytical Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Training Capacity (Seats)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{baselineSeats.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {projectedSeats.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {projectedSeats - baselineSeats >= 0
                        ? `+${(projectedSeats - baselineSeats).toLocaleString('en-IN')}`
                        : (projectedSeats - baselineSeats).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {seatChangePercent >= 0 ? `+${seatChangePercent}% capacity expansion` : `${seatChangePercent}% seat rationalisation`}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium">Enrolled Trainees (94%)</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {Math.round(baselineSeats * 0.94).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {Math.round(projectedSeats * 0.94).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {Math.round((projectedSeats - baselineSeats) * 0.94) >= 0
                        ? `+${Math.round((projectedSeats - baselineSeats) * 0.94).toLocaleString('en-IN')}`
                        : Math.round((projectedSeats - baselineSeats) * 0.94).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      Seat occupancy benchmark based on state ITI historical enrolment
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium">Certified Completers</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {Math.round(baselineSeats * 0.94 * 0.84 * 0.92).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {Math.round(
                        projectedSeats * 0.94 * (completionRatePercent / 100) * 0.92
                      ).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {Math.round(
                        projectedSeats * 0.94 * (completionRatePercent / 100) * 0.92 -
                          baselineSeats * 0.94 * 0.84 * 0.92
                      ) >= 0
                        ? `+${Math.round(
                            projectedSeats * 0.94 * (completionRatePercent / 100) * 0.92 -
                              baselineSeats * 0.94 * 0.84 * 0.92
                          ).toLocaleString('en-IN')}`
                        : Math.round(
                            projectedSeats * 0.94 * (completionRatePercent / 100) * 0.92 -
                              baselineSeats * 0.94 * 0.84 * 0.92
                          ).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      Under {completionRatePercent}% completion &amp; 92% DGT certification
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium">Effective Work-Ready Supply (S)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{baselineSupply.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {projectedSupply.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {projectedSupply - baselineSupply >= 0
                        ? `+${(projectedSupply - baselineSupply).toLocaleString('en-IN')}`
                        : (projectedSupply - baselineSupply).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      Yield: {yieldPer100Seats} active candidates per 100 sanctioned seats
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium">Projected Labour Demand (D)</td>
                    <td className="py-2.5 px-3 text-right font-mono">{baselineDemand.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                      {projectedDemand.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {projectedDemand - baselineDemand >= 0
                        ? `+${(projectedDemand - baselineDemand).toLocaleString('en-IN')}`
                        : (projectedDemand - baselineDemand).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      Includes {demandGrowthPercent > 0 ? `+${demandGrowthPercent}%` : `${demandGrowthPercent}%`} employer demand growth
                    </td>
                  </tr>

                  <tr className="bg-slate-50/60 font-semibold">
                    <td className="py-2.5 px-3">Net Skill Gap (&Delta; = D - S)</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className={baselineGap > 0 ? 'text-red-700' : 'text-emerald-700'}>
                        {baselineGap > 0 ? `+${baselineGap.toLocaleString('en-IN')}` : baselineGap.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold">
                      <span className={projectedGap > 0 ? 'text-red-700' : 'text-emerald-700'}>
                        {projectedGap > 0 ? `+${projectedGap.toLocaleString('en-IN')}` : projectedGap.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold">
                      <span className={projectedGap < baselineGap ? 'text-emerald-700' : 'text-red-700'}>
                        {projectedGap - baselineGap > 0
                          ? `+${(projectedGap - baselineGap).toLocaleString('en-IN')}`
                          : (projectedGap - baselineGap).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      {baselineGap > 0 && projectedGap < baselineGap
                        ? `Deficit reduced by ${(baselineGap - projectedGap).toLocaleString('en-IN')} technicians`
                        : baselineGap < 0 && projectedGap > baselineGap
                        ? `Oversupply reduced by ${(projectedGap - baselineGap).toLocaleString('en-IN')} seats`
                        : projectedGap > 0
                        ? 'Deficit expands'
                        : 'Surplus expands'}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 px-3 font-medium">Program Budget Allocation</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{baselineBudgetLakhs} L</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{currentResult.budgetAllocationLakhs} L
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      {currentResult.costDeltaLakhs > 0
                        ? `+₹${currentResult.costDeltaLakhs} L`
                        : `₹${currentResult.costDeltaLakhs} L`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      Based on ₹{unitSeatCostInr.toLocaleString('en-IN')} per seat norm
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mathematical Funnel & Cohort Yield Transparency Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Transparent Cohort Transition Funnel (Why 100 Seats &ne; 100 Workers)</span>
            </h4>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                <span className="bg-white px-2 py-1 rounded border border-slate-200 font-bold text-slate-900">
                  100 Seats Sanctioned
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-blue-800">
                  94 Enrolled (94%)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-emerald-800">
                  {Math.round(94 * (completionRatePercent / 100))} Completed ({completionRatePercent}%)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="bg-white px-2 py-1 rounded border border-slate-200 text-teal-800">
                  {Math.round(94 * (completionRatePercent / 100) * 0.92)} Certified (92%)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="bg-blue-50 px-2 py-1 rounded border border-blue-200 font-bold text-blue-900">
                  {yieldPer100Seats} Work-Ready ({employmentConversionPercent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Policy decisions account for attrition at each stage. For <span className="font-semibold text-slate-800">{selectedOcc.name}</span>, sanctioning {projectedSeats} seats is expected to yield approximately <span className="font-semibold text-emerald-700">{projectedSupply}</span> certified candidates entering the labour market.
              </p>
            </div>

            {/* Explainable Policy Mechanism Summary */}
            <div className="mt-4 pt-3.5 border-t border-slate-200">
              <h5 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5 mb-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700" />
                <span>Simulated Policy Mechanism &amp; Evidence-Based Rationale:</span>
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-200">
                {currentResult.notes}
              </p>

              {/* Save Scenario Bar */}
              <div className="mt-3.5 pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="Optional scenario title (e.g. Clean Energy Batch 2026)..."
                    aria-label="Custom title for policy scenario"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  />
                </div>

                <button
                  onClick={handleSaveScenario}
                  className="w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Scenario Register</span>
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="text-xs text-emerald-700 font-semibold mt-2.5 flex items-center space-x-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Saved Scenarios Comparison Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Scenario Comparison Register</span>
            </h3>
            <p className="text-xs text-slate-500">
              Compare multiple alternative policy configurations or reload them into the simulator controls:
            </p>
          </div>
          <span className="text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {savedScenarios.length} Scenarios Catalogued
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Scenario Name</th>
                <th className="py-3 px-3">District &bull; Sector</th>
                <th className="py-3 px-3">Horizon</th>
                <th className="py-3 px-3 text-right">Seat Delta</th>
                <th className="py-3 px-3 text-right">Projected Supply</th>
                <th className="py-3 px-3 text-right">Skill Gap</th>
                <th className="py-3 px-3 text-right">Fiscal Delta</th>
                <th className="py-3 px-3 text-center">Placement</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {savedScenarios.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div className="flex items-center space-x-1.5">
                      {sc.isPreset && (
                        <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-mono font-medium">
                          PRESET
                        </span>
                      )}
                      <span>{sc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {sc.district} &bull; <span className="text-slate-500">{sc.sector}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{sc.horizonMonths}</td>
                  <td className="py-3 px-3 font-mono text-right">
                    <span
                      className={
                        sc.seatChangePercent > 0
                          ? 'text-blue-700 font-semibold'
                          : sc.seatChangePercent < 0
                          ? 'text-amber-800 font-semibold'
                          : 'text-slate-600'
                      }
                    >
                      {sc.seatChangePercent > 0 ? `+${sc.seatChangePercent}%` : `${sc.seatChangePercent}%`}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-900 text-right">
                    {sc.projectedSupply.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-right">
                    <span className={sc.projectedGap > 0 ? 'text-red-700' : 'text-emerald-700'}>
                      {sc.projectedGap > 0 ? `+${sc.projectedGap.toLocaleString('en-IN')}` : sc.projectedGap.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 text-right">
                    {sc.costDeltaLakhs > 0 ? `+₹${sc.costDeltaLakhs}` : `₹${sc.costDeltaLakhs}`} L
                  </td>
                  <td className="py-3 px-3 text-emerald-700 font-semibold text-center">
                    {sc.placementImpactPercent}%
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleLoadScenario(sc)}
                        className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 text-[11px] font-semibold rounded border border-slate-200 hover:border-blue-300 transition-colors flex items-center space-x-1"
                        title="Load this scenario into simulator sliders"
                      >
                        <UploadCloud className="w-3 h-3" />
                        <span>Load</span>
                      </button>
                      {!sc.isPreset && (
                        <button
                          onClick={() => deletePolicyScenario(sc.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete custom scenario"
                          aria-label="Delete custom scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Regulatory & Calculation Integrity Disclaimer */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center space-x-2 text-slate-800 font-semibold">
          <AlertCircle className="w-4 h-4 text-blue-700" />
          <span>Calculation Integrity &amp; Methodological Disclosures (SIH PS 26246)</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          1. <strong>Deterministic Simulation:</strong> Projections are computed strictly using deterministic cohort transition matrices (enrolment, examination, certification, and market conversion) based on MSDE/DGT standards. Outputs are simulated estimates for planning purposes, not guaranteed employment placements or certified censuses.
        </p>
        <p className="text-[11px] leading-relaxed">
          2. <strong>Non-Equivalence Principle:</strong> Sanctioning one additional training seat does not guarantee one qualified employed technician. Cumulative attrition across stages reduces gross capacity by approximately 40% before candidates enter the active labor pool.
        </p>
        <p className="text-[11px] leading-relaxed">
          3. <strong>District Representation:</strong> Baseline figures are calibrated to pilot district workforce footprints within Chhattisgarh (Raipur 35%, Durg 30%, Bilaspur 20%, Korba 15%).
        </p>
      </div>
    </div>
  );
};

