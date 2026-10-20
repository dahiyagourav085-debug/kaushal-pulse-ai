/**
 * KAUSHAL PULSE AI — REPORTS & EXPORTS MODULE
 * Produces structured institutional briefings, district skill development plans (DSDP),
 * and downloadable CSV data packages for MSDE committees.
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsvString, calculateOccupationForecast } from '../../utils/analytics';
import {
  FileText,
  Download,
  Printer,
  Building2,
  Calendar,
  Layers,
  CheckCircle,
  FileSpreadsheet,
  Sliders,
  ArrowRight,
  Info,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    language,
    selectedDistrict,
    selectedHorizon,
    occupations,
    districts,
    savedScenarios,
    recommendations,
    trainingCentres,
    setActiveTab,
  } = useApp();

  const [activeReportType, setActiveReportType] = useState<'district' | 'state' | 'scenarios' | 'recommendations'>('district');

  const targetDist = selectedDistrict === 'All' ? 'All Districts (Pilot Aggregate)' : selectedDistrict;

  // Forecasts for current target district
  const districtForecasts = useMemo(() => {
    return occupations.map((occ) => ({
      occ,
      fc: calculateOccupationForecast(occ, targetDist, selectedHorizon),
    }));
  }, [occupations, targetDist, selectedHorizon]);

  // Aggregate metrics for target district
  const districtMetrics = useMemo(() => {
    const totalDemand = districtForecasts.reduce((sum, item) => sum + item.fc.forecastDemand, 0);
    const totalSupply = districtForecasts.reduce((sum, item) => sum + item.fc.forecastSupply, 0);
    const netGap = districtForecasts.reduce((sum, item) => sum + item.fc.skillGap, 0);
    const topShortages = [...districtForecasts]
      .filter((item) => item.fc.skillGap > 0)
      .sort((a, b) => b.fc.skillGap - a.fc.skillGap);
    const topSurpluses = [...districtForecasts]
      .filter((item) => item.fc.skillGap <= 0)
      .sort((a, b) => a.fc.skillGap - b.fc.skillGap);

    return { totalDemand, totalSupply, netGap, topShortages, topSurpluses };
  }, [districtForecasts]);

  // Cross-district matrix across the 4 corridor districts
  const stateMatrix = useMemo(() => {
    const corridorDistricts: string[] =
      districts && districts.length > 0
        ? districts.map((d) => (typeof d === 'string' ? d : d.name))
        : ['Raipur', 'Durg', 'Bilaspur', 'Korba'];

    const districtRows = corridorDistricts.map((d) => {
      let dDemand = 0;
      let dSupply = 0;
      let dGap = 0;
      let maxDeficit = -Infinity;
      let topShortageName = 'N/A';
      let maxSurplus = Infinity;
      let topSurplusName = 'Balanced';

      occupations.forEach((occ) => {
        const fc = calculateOccupationForecast(occ, d, selectedHorizon);
        dDemand += fc.forecastDemand;
        dSupply += fc.forecastSupply;
        dGap += fc.skillGap;

        if (fc.skillGap > maxDeficit) {
          maxDeficit = fc.skillGap;
          topShortageName = occ.name;
        }
        if (fc.skillGap < maxSurplus) {
          maxSurplus = fc.skillGap;
          topSurplusName = occ.name;
        }
      });

      return {
        district: d,
        demand: dDemand,
        supply: dSupply,
        netGap: dGap,
        topShortage: topShortageName,
        topSurplus: maxSurplus <= 0 ? topSurplusName : 'Balanced',
        status: dGap > 1000 ? 'Acute Shortage' : dGap > 400 ? 'Moderate Shortage' : 'Balanced',
      };
    });

    const corridorTotalDemand = districtRows.reduce((acc, r) => acc + r.demand, 0);
    const corridorTotalSupply = districtRows.reduce((acc, r) => acc + r.supply, 0);
    const corridorNetGap = districtRows.reduce((acc, r) => acc + r.netGap, 0);

    // Sectoral aggregations
    const sectorMap: Record<string, { demand: number; supply: number; gap: number }> = {};
    occupations.forEach((occ) => {
      const fc = calculateOccupationForecast(occ, 'All Districts (Pilot Aggregate)', selectedHorizon);
      if (!sectorMap[occ.sector]) {
        sectorMap[occ.sector] = { demand: 0, supply: 0, gap: 0 };
      }
      sectorMap[occ.sector].demand += fc.forecastDemand;
      sectorMap[occ.sector].supply += fc.forecastSupply;
      sectorMap[occ.sector].gap += fc.skillGap;
    });

    const sectorRows = Object.entries(sectorMap).map(([sector, data]) => ({
      sector,
      demand: data.demand,
      supply: data.supply,
      gap: data.gap,
      severity: data.gap > 800 ? 'Critical' : data.gap > 300 ? 'Moderate' : 'Stable',
    }));

    return {
      districtRows,
      corridorTotalDemand,
      corridorTotalSupply,
      corridorNetGap,
      sectorRows,
    };
  }, [districts, occupations, selectedHorizon]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCurrentReport = () => {
    if (activeReportType === 'district') {
      const rows = districtForecasts.map(({ occ, fc }) => ({
        District: targetDist,
        ForecastHorizon: selectedHorizon,
        Occupation: occ.name,
        NCO_Code: occ.ncoCode,
        NSQF_Level: occ.nsqfLevel,
        Sector: occ.sector,
        ForecastDemand: fc.forecastDemand,
        ForecastSupply: fc.forecastSupply,
        SkillGap: fc.skillGap,
        GapSeverity: fc.gapSeverity,
        MedianSalaryINR: occ.medianSalaryInr,
      }));
      exportToCsvString(rows, `MSDE_District_Briefing_${targetDist}_${selectedHorizon}`);
    } else if (activeReportType === 'state') {
      const rows = stateMatrix.districtRows.map((r) => ({
        District: r.district,
        ForecastHorizon: selectedHorizon,
        TotalDemand: r.demand,
        TotalSupply: r.supply,
        NetSkillGap: r.netGap,
        PrimaryShortageTrade: r.topShortage,
        PrimarySurplusTrade: r.topSurplus,
        Status: r.status,
      }));
      exportToCsvString(rows, `MSDE_Statewide_Synthesis_Corridor_${selectedHorizon}`);
    } else if (activeReportType === 'scenarios') {
      if (savedScenarios.length > 0) {
        const rows = savedScenarios.map((s) => ({
          ScenarioName: s.name,
          District: s.district,
          HorizonMonths: s.horizonMonths,
          SeatChangePercent: `${s.seatChangePercent}%`,
          CompletionRatePercent: `${s.completionRatePercent}%`,
          DemandShockPercent: `${s.demandGrowthAssumptionPercent}%`,
          BaselineGap: s.baselineGap,
          ProjectedGap: s.projectedGap,
          GapReduction: s.baselineGap - s.projectedGap,
          BudgetAllocationLakhs: s.budgetAllocationLakhs,
          CostDeltaLakhs: s.costDeltaLakhs,
          CreatedAt: s.createdAt,
          Notes: s.notes,
        }));
        exportToCsvString(rows, `MSDE_Policy_Scenarios_Dossier`);
      } else {
        const baselineRow = [
          {
            Scenario: 'Baseline Status Quo',
            District: targetDist,
            Horizon: selectedHorizon,
            SeatChangePercent: '0%',
            DemandShockPercent: '0%',
            CompletionRatePercent: '74.5%',
            BaselineDemand: districtMetrics.totalDemand,
            BaselineSupply: districtMetrics.totalSupply,
            BaselineNetGap: districtMetrics.netGap,
            Notes: 'Standard operational configuration before policy interventions',
          },
        ];
        exportToCsvString(baselineRow, `MSDE_Policy_Scenario_Baseline`);
      }
    } else if (activeReportType === 'recommendations') {
      const rows = recommendations.map((r) => ({
        RecommendationID: r.id,
        Title: r.title,
        District: r.district,
        Sector: r.sector,
        Occupation: r.occupationName,
        Severity: r.severity,
        Confidence: r.confidence,
        Status: r.status,
        ProblemDetected: r.problemDetected,
        RecommendedAction: r.recommendedAction,
        Evidence: r.evidence,
        ReviewDate: r.reviewDate,
      }));
      exportToCsvString(rows, `MSDE_Decision_Queue_Recommendations`);
    }
  };

  const handleExportFullDataset = () => {
    const rows = occupations.map((o) => {
      const fc = calculateOccupationForecast(o, targetDist, selectedHorizon);
      return {
        Occupation: o.name,
        NCO_Code: o.ncoCode,
        NSQF_Level: o.nsqfLevel,
        Sector: o.sector,
        District: targetDist,
        ForecastHorizon: selectedHorizon,
        ForecastDemand: fc.forecastDemand,
        ForecastSupply: fc.forecastSupply,
        SkillGap: fc.skillGap,
        GapSeverity: fc.gapSeverity,
        PersistentVacanciesRatio: `${(o.persistentVacanciesRatio * 100).toFixed(0)}%`,
        MedianSalaryINR: o.medianSalaryInr,
      };
    });
    exportToCsvString(rows, `MSDE_Labour_Intelligence_Report_${targetDist}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Official Documentation & Committee Export Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'रिपोर्ट एवं डेटा निर्यात — आधिकारिक नीतिगत सारांश'
                : 'Reports & Exports: Institutional Skill Briefings & Government Data Packages'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Generate structured, print-ready policy briefs for District Skill Committees (DSC) and export canonical CSV datasets.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCurrentReport}
              className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-blue-200 transition-colors"
              title="Export currently selected report view as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {activeReportType === 'district'
                  ? 'Export District CSV'
                  : activeReportType === 'state'
                  ? 'Export Statewide CSV'
                  : activeReportType === 'scenarios'
                  ? 'Export Scenarios CSV'
                  : 'Export Decision Queue CSV'}
              </span>
            </button>
            <button
              onClick={handleExportFullDataset}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full CSV Package</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 p-2 rounded-xl shadow-xs text-xs">
        <button
          onClick={() => setActiveReportType('district')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            activeReportType === 'district'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          District Skill Gap Briefing ({targetDist})
        </button>
        <button
          onClick={() => setActiveReportType('state')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            activeReportType === 'state'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Statewide Labour Market Synthesis
        </button>
        <button
          onClick={() => setActiveReportType('scenarios')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            activeReportType === 'scenarios'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          What-If Scenario Comparison Dossier {savedScenarios.length > 0 && `(${savedScenarios.length})`}
        </button>
        <button
          onClick={() => setActiveReportType('recommendations')}
          className={`px-3 py-1.5 rounded-md font-medium transition-all ${
            activeReportType === 'recommendations'
              ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Executive Decision Queue ({recommendations.length})
        </button>
      </div>

      {/* Printable Report Document Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-4xl mx-auto space-y-6 text-slate-900">
        {/* ========================================================================= */}
        {/* TAB 1: DISTRICT SKILL GAP BRIEFING */}
        {/* ========================================================================= */}
        {activeReportType === 'district' && (
          <div className="space-y-6">
            {/* Document Crest & Header */}
            <div className="border-b-2 border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-amber-700">
                  Government of India &bull; Ministry of Skill Development and Entrepreneurship
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  DISTRICT SKILL GAP BRIEFING &bull; {targetDist.toUpperCase()}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ref: MSDE-DSDP/{targetDist.replace(/\s+/g, '_').toUpperCase()}/2026/Q1 &bull; Horizon: {selectedHorizon}
                </div>
              </div>
              <div className="w-20 h-12 rounded bg-amber-50 border border-amber-300 flex flex-col items-center justify-center text-amber-800 font-bold text-[10px] uppercase text-center p-1 leading-tight">
                <span>DSC BRIEF</span>
                <span className="text-[8px] font-normal text-amber-700">PILOT VERIFIED</span>
              </div>
            </div>

            {/* Macro Statistics Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Projected Demand</div>
                <div className="text-base font-bold text-blue-700 font-mono">
                  {districtMetrics.totalDemand.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Projected Supply</div>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {districtMetrics.totalSupply.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Net Skill Gap</div>
                <div className={`text-base font-bold font-mono ${districtMetrics.netGap > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {districtMetrics.netGap > 0 ? `+${districtMetrics.netGap.toLocaleString('en-IN')}` : districtMetrics.netGap.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Acute Shortage Trades</div>
                <div className="text-base font-bold text-amber-700 font-mono">
                  {districtMetrics.topShortages.length} Trades
                </div>
              </div>
            </div>

            {/* Section 1: Executive Assessment */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>1. Executive Assessment & Macro Indicators ({targetDist} District)</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                Analysis conducted under the Smart India Hackathon PS 26246 analytical framework indicates an acute labour market transition within {targetDist}. High expansion in renewable solar deployment and industrial automation has generated a persistent technician deficit open &gt;60 days, while legacy manual trades require structured seat rationalization and curriculum modernization.
              </p>
            </div>

            {/* Section 2: Priority Shortage Occupations */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>2. Priority Shortage Trades Requiring Capacity Expansion</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">Occupation</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">NCO / NSQF</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Demand</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Supply</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Deficit</th>
                      <th className="py-2.5 px-3">Policy Action Recommended</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {districtMetrics.topShortages.slice(0, 5).map(({ occ, fc }) => (
                      <tr key={occ.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">{occ.name}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">
                          {occ.ncoCode} (L{occ.nsqfLevel})
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold border-r border-slate-200">
                          {fc.forecastDemand}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold border-r border-slate-200">
                          {fc.forecastSupply}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-600 border-r border-slate-200">
                          +{fc.skillGap}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          Sanction Dual System Training (DST) unit expansion and local industry apprenticeships
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Potential Surplus / Seat Rationalization Candidates */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span>3. Trades for Potential Seat Rationalization or Curriculum Upgrade</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-200">Trade</th>
                      <th className="py-2 px-3 border-r border-slate-200">Demand</th>
                      <th className="py-2 px-3 border-r border-slate-200">Supply</th>
                      <th className="py-2 px-3 border-r border-slate-200">Net Balance</th>
                      <th className="py-2 px-3">Rationalization Directive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {districtMetrics.topSurpluses.slice(0, 3).map(({ occ, fc }) => (
                      <tr key={occ.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200">{occ.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-200">{fc.forecastDemand}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 border-r border-slate-200">{fc.forecastSupply}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-emerald-600 border-r border-slate-200">
                          {fc.skillGap <= 0 ? `${fc.skillGap} (Balanced/Surplus)` : `+${fc.skillGap}`}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          Modernize syllabus into advanced additive/digital competencies or retarget surplus seats
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Recommended Actions for District Skill Committee */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>4. Action Checklist for District Skill Committee (DSC)</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside bg-slate-50 p-4 rounded-lg border border-slate-200">
                <li>
                  Submit urgent CTS unit expansion proposal for Solar PV Technicians and EV Battery Specialists at Government ITI {targetDist}.
                </li>
                <li>
                  Notify local industrial estate associations (e.g., Urla, Hathkhoj, Sirgitti) to sponsor Dual System of Training (DST) stipends.
                </li>
                <li>
                  Convert underutilized manual workshop space into smart manufacturing & IoT labs.
                </li>
                <li>
                  Deploy mobile vocational assessment units to track apprenticeship completion telemetry.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STATEWIDE LABOUR MARKET SYNTHESIS */}
        {/* ========================================================================= */}
        {activeReportType === 'state' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-amber-700">
                  State Skill Development Mission (SSDM) &bull; Directorate of Employment & Training
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  STATEWIDE LABOUR MARKET SYNTHESIS &bull; 4 PILOT CORRIDORS
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Ref: SSDM-LMI/STATEWIDE-CORRIDOR/2026/Q1 &bull; Horizon: {selectedHorizon}
                </div>
              </div>
              <div className="w-24 h-12 rounded bg-blue-50 border border-blue-300 flex flex-col items-center justify-center text-blue-800 font-bold text-[10px] uppercase text-center p-1 leading-tight">
                <span>STATE SYNTHESIS</span>
                <span className="text-[8px] font-normal text-blue-700">4 DISTRICTS</span>
              </div>
            </div>

            {/* Corridor Macro Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Corridor Total Demand</div>
                <div className="text-base font-bold text-blue-700 font-mono">
                  {stateMatrix.corridorTotalDemand.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Corridor Total Supply</div>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {stateMatrix.corridorTotalSupply.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Corridor Net Gap</div>
                <div className="text-base font-bold text-rose-600 font-mono">
                  +{stateMatrix.corridorNetGap.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Active Training Centres</div>
                <div className="text-base font-bold text-slate-800 font-mono">
                  {trainingCentres.length} Centres
                </div>
              </div>
            </div>

            {/* Section 1: Statewide Executive Brief */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>1. Statewide Executive Assessment across Industrial Corridors</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-200">
                The four pilot corridors (Raipur, Durg, Bilaspur, and Korba) represent the industrial and infrastructural backbone of Chhattisgarh. Across these districts, demand for green energy technicians and automated manufacturing operators is outpacing existing ITI supply by 38%, while inter-district mobility remains underutilized to balance localized deficits.
              </p>
            </div>

            {/* Section 2: Cross-District Comparison Matrix */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>2. Cross-District Supply & Demand Equilibrium Matrix</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">District</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Demand</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Supply</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Net Gap</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Top Shortage Trade</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stateMatrix.districtRows.map((row) => (
                      <tr key={row.district} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                          {row.district}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold border-r border-slate-200">
                          {row.demand.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold border-r border-slate-200">
                          {row.supply.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-600 border-r border-slate-200">
                          +{row.netGap.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                          {row.topShortage}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Sectoral Deficit & Investment Priorities */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>3. Sectoral Deficits & State Expansion Priority Ranking</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-200">Sector</th>
                      <th className="py-2 px-3 border-r border-slate-200">Projected Demand</th>
                      <th className="py-2 px-3 border-r border-slate-200">Projected Supply</th>
                      <th className="py-2 px-3 border-r border-slate-200">Net Sector Gap</th>
                      <th className="py-2 px-3">Intervention Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stateMatrix.sectorRows.map((s) => (
                      <tr key={s.sector} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200">{s.sector}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 border-r border-slate-200">
                          {s.demand.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700 border-r border-slate-200">
                          {s.supply.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-rose-600 border-r border-slate-200">
                          +{s.gap.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              s.severity === 'Critical'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {s.severity} Priority
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: State Directives */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>4. State Skill Development Mission Directives</span>
              </h3>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside bg-slate-50 p-4 rounded-lg border border-slate-200">
                <li>
                  Establish a Centre of Excellence (CoE) in Solar & Green Hydrogen at Raipur with satellite training nodes in Korba.
                </li>
                <li>
                  Implement a unified Apprenticeship Credit Transfer scheme between Bhilai industrial cluster (Durg) and Raipur tech parks.
                </li>
                <li>
                  Re-evaluate annual CAPEX grants for ITI equipment to mandate NSQF Level 4+ digital fabrication toolkits.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WHAT-IF SCENARIO COMPARISON DOSSIER */}
        {/* ========================================================================= */}
        {activeReportType === 'scenarios' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-amber-700">
                  Policy Planning & Multi-Parameter Simulation Bureau
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  WHAT-IF SCENARIO EVALUATION DOSSIER
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Simulated Levers: Seat Scalability &bull; Completion Rates &bull; Industrial Demand Shocks
                </div>
              </div>
              <div className="w-24 h-12 rounded bg-purple-50 border border-purple-300 flex flex-col items-center justify-center text-purple-800 font-bold text-[10px] uppercase text-center p-1 leading-tight">
                <span>POLICY DOSSIER</span>
                <span className="text-[8px] font-normal text-purple-700">{savedScenarios.length} RUNS</span>
              </div>
            </div>

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Catalogued Scenarios</div>
                <div className="text-base font-bold text-purple-700 font-mono">
                  {savedScenarios.length} Scenarios
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Baseline Status Quo Gap</div>
                <div className="text-base font-bold text-slate-700 font-mono">
                  +{districtMetrics.netGap.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Model Calibration</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  YoY Trajectory + DGT Funnel
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Simulation Scope</div>
                <div className="text-xs font-semibold text-slate-700 mt-1">
                  {targetDist} ({selectedHorizon})
                </div>
              </div>
            </div>

            {/* Scenarios Content */}
            {savedScenarios.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Catalogued Policy Scenarios for Review</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200">
                    <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-slate-200">Scenario Name</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">District</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Seat Delta</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Completion</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Demand Shock</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Baseline Gap</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Projected Gap</th>
                        <th className="py-2.5 px-3 border-r border-slate-200">Gap Impact</th>
                        <th className="py-2.5 px-3">Budget Delta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {savedScenarios.map((sc) => {
                        const gapDelta = sc.baselineGap - sc.projectedGap;
                        const isImproved = gapDelta > 0;
                        return (
                          <tr key={sc.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                              <div>{sc.name}</div>
                              <div className="text-[10px] text-slate-500 font-normal">{sc.sector}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">{sc.district}</td>
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-800 border-r border-slate-200">
                              {sc.seatChangePercent >= 0 ? `+${sc.seatChangePercent}%` : `${sc.seatChangePercent}%`}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700 border-r border-slate-200">
                              {sc.completionRatePercent}%
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-700 border-r border-slate-200">
                              {sc.demandGrowthAssumptionPercent >= 0
                                ? `+${sc.demandGrowthAssumptionPercent}%`
                                : `${sc.demandGrowthAssumptionPercent}%`}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">
                              {sc.baselineGap}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900 border-r border-slate-200">
                              {sc.projectedGap}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold border-r border-slate-200">
                              <span className={isImproved ? 'text-emerald-700' : 'text-rose-600'}>
                                {isImproved ? `-${gapDelta} (Deficit Reduced)` : `+${Math.abs(gapDelta)} (Deficit Increased)`}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-800">
                              ₹{sc.costDeltaLakhs.toFixed(1)} L
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Scenario Details Cards */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Scenario Policy Notes & Implementation Feasibility
                  </div>
                  {savedScenarios.map((sc) => (
                    <div key={sc.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{sc.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{sc.createdAt}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {sc.description || sc.notes || 'Configured via What-If Policy Simulator.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Informative Empty State with Baseline Demonstration */
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 text-center space-y-3">
                  <Info className="w-8 h-8 text-blue-600 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      No Custom Policy Scenarios Saved in Current Session
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
                      Simulations created in the <strong>What-If Policy Simulator</strong> (adjusting ITI seat quotas, completion rates, and industry demand shocks) are automatically preserved and summarized in this dossier for institutional review.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('simulator')}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Open What-If Policy Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>

                {/* Baseline Reference Table */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Baseline Reference Scenario (Status Quo Calibration)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-200">
                      <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 border-r border-slate-200">Configuration</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">District</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Seat Adjustment</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Completion Norm</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Baseline Demand</th>
                          <th className="py-2.5 px-3 border-r border-slate-200">Baseline Supply</th>
                          <th className="py-2.5 px-3">Baseline Net Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                            Current Status Quo (2026 Baseline)
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">{targetDist}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">0% (Unchanged)</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700 border-r border-slate-200">74.5% (DGT Norm)</td>
                          <td className="py-2.5 px-3 font-mono text-blue-700 font-semibold border-r border-slate-200">
                            {districtMetrics.totalDemand.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold border-r border-slate-200">
                            {districtMetrics.totalSupply.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-rose-600">
                            +{districtMetrics.netGap.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EXECUTIVE DECISION QUEUE (RECOMMENDATIONS) */}
        {/* ========================================================================= */}
        {activeReportType === 'recommendations' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest font-bold text-amber-700">
                  Institutional Action Queue & DSC Decision Matrix
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  EXECUTIVE POLICY RECOMMENDATIONS TRACKER
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  Directives generated from Empirical Evidence & Vacancy Longevity Telemetry
                </div>
              </div>
              <div className="w-24 h-12 rounded bg-emerald-50 border border-emerald-300 flex flex-col items-center justify-center text-emerald-800 font-bold text-[10px] uppercase text-center p-1 leading-tight">
                <span>ACTION QUEUE</span>
                <span className="text-[8px] font-normal text-emerald-700">{recommendations.length} DIRECTIVES</span>
              </div>
            </div>

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Total Directives</div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {recommendations.length}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Critical Priority</div>
                <div className="text-base font-bold text-red-600 font-mono">
                  {recommendations.filter((r) => r.severity === 'Critical').length}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Under Committee Review</div>
                <div className="text-base font-bold text-amber-700 font-mono">
                  {recommendations.filter((r) => r.status === 'Under Review').length}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-slate-500 font-medium">Accepted / Active</div>
                <div className="text-base font-bold text-emerald-700 font-mono">
                  {recommendations.filter((r) => r.status === 'Accepted' || r.status === 'Implemented' || r.status === 'Completed').length}
                </div>
              </div>
            </div>

            {/* Recommendations Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>Institutional Recommendation Queue</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 border-r border-slate-200">ID</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Trade / Sector</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">District</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Severity</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Recommended Policy Action</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recommendations.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200 text-[11px]">
                          {rec.id}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-200">
                          <div>{rec.occupationName}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{rec.sector}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">{rec.district}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.severity === 'Critical'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : rec.severity === 'High'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {rec.severity}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200 max-w-xs">
                          {rec.recommendedAction}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rec.status === 'Accepted' || rec.status === 'Implemented' || rec.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : rec.status === 'Rejected'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Critical Intervention Detail Cards */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Evidence & Implementation Mechanisms (Top Priority)
              </div>
              {recommendations
                .filter((r) => r.severity === 'Critical')
                .slice(0, 2)
                .map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900">{r.title}</div>
                      <span className="font-mono text-[10px] text-slate-500">ID: {r.id}</span>
                    </div>
                    <div className="text-slate-700">
                      <strong>Problem Identified:</strong> {r.problemDetected}
                    </div>
                    <div className="text-slate-700">
                      <strong>Empirical Evidence:</strong> {r.evidence}
                    </div>
                    <div className="text-slate-700">
                      <strong>Implementation Mechanism:</strong> {r.expectedMechanism}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SHARED DOCUMENT FOOTER SIGNATURES (ON ALL REPORTS) */}
        {/* ========================================================================= */}
        <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <div className="h-10 border-b border-slate-300 w-48 mb-1" />
            <div className="font-semibold text-slate-900">District Employment Officer</div>
            <div>District Skill Committee, {targetDist}</div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="h-10 border-b border-slate-300 w-48 mb-1" />
            <div className="font-semibold text-slate-900">Director / Principal Secretary</div>
            <div>State Skill Development Mission (SSDM)</div>
          </div>
        </div>

        {/* Compliance & Methodology Notice */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 leading-relaxed flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong>Analytical Disclosure:</strong> Figures displayed in this institutional brief are projected using the 
            <em> YoY Trajectory Extrapolation + Cohort Funnel Matrix</em> heuristic demonstration model under the SIH 2026 Problem Statement 26246 analytical framework. 
            Calibrated on synthetic baseline pilot datasets for Chhattisgarh. For official gazetted skill notifications, consult the National Council for Vocational Education and Training (NCVET).
          </div>
        </div>
      </div>
    </div>
  );
};
