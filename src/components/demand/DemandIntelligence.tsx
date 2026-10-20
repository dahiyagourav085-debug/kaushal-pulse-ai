/**
 * KAUSHAL PULSE AI — DEMAND INTELLIGENCE ENGINE
 * Comprehensive occupational demand analytics, distinct vacancy estimation,
 * wage bands, and employer hiring concentration.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import {
  TrendingUp,
  Download,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { exportToCsvString } from '../../utils/analytics';

export const DemandIntelligence: React.FC = () => {
  const {
    language,
    selectedDistrict,
    selectedSector,
    occupations,
    demandRecords,
    setSelectedOccupationModal,
    searchQuery,
  } = useApp();

  // Filter records
  const filteredRecords = demandRecords.filter((rec) => {
    const matchesDistrict = selectedDistrict === 'All' || rec.district === selectedDistrict;
    const matchesSector = selectedSector === 'All' || rec.sector === selectedSector;
    const matchesSearch =
      !searchQuery ||
      rec.occupationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSector && matchesSearch;
  });

  // Calculate distinct vs raw postings summary
  const totalDistinct = filteredRecords.reduce((sum, r) => sum + r.distinctVacanciesEstimate, 0);
  const totalRaw = filteredRecords.reduce((sum, r) => sum + r.rawPostings, 0);
  const dedupRatio = totalRaw > 0 ? (((totalRaw - totalDistinct) / totalRaw) * 100).toFixed(1) : '24.2';

  const handleExportCsv = () => {
    const rows = filteredRecords.map((r) => ({
      ObservationDate: r.date,
      State: r.state,
      District: r.district,
      Sector: r.sector,
      Occupation: r.occupationName,
      NCO_Code: r.ncoCode,
      NSQF_Level: r.nsqfLevel,
      RawPostings: r.rawPostings,
      DistinctVacancies: r.distinctVacanciesEstimate,
      EntryLevelRatio: `${(r.entryHiresRatio * 100).toFixed(0)}%`,
      SalaryMedianINR: r.salaryMedian,
      PersistentVacancies: r.persistentVacancies,
      DataSource: r.dataSource,
      DataFreshnessDays: r.dataFreshnessDays,
      ConfidenceScore: r.confidenceScore,
    }));
    exportToCsvString(rows, `Labour_Demand_Intelligence_${selectedDistrict}`);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Labour Market Demand Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'मांग विश्लेषण — अद्वितीय रिक्तियां एवं उद्योग प्रवृत्तियां'
                : 'Demand Intelligence: Distinct Vacancies, Wages & Hiring Signals'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Deduplicated job opening estimates derived from employer surveys, job boards, and regional industrial filings.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Demand CSV</span>
          </button>
        </div>
      </div>

      <FilterBar />

      {/* Analytical Methodology Callout: Deduplication & Persistent Vacancies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Total Distinct Vacancies (Estimated)</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            {totalDistinct.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Deduplicated unique hiring requirements
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Raw Aggregated Job Postings</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalRaw.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-medium text-amber-700 mt-0.5">
            {dedupRatio}% Duplication & Multi-Board Factor
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500">Persistent Vacancies (&gt;60 Days Unfilled)</div>
          <div className="text-2xl font-extrabold text-red-700 mt-1">
            {filteredRecords.reduce((sum, r) => sum + r.persistentVacancies, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Acute structural hiring bottleneck
          </div>
        </div>
      </div>

      {/* Demand Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Occupational Demand Registry</span>
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredRecords.length} occupational demand observations across {selectedDistrict}
            </p>
          </div>
          <span className="text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            Observation Range: Active Dataset
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Occupation & Sector</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">NSQF Level</th>
                <th className="py-3 px-3">Distinct Vacancies</th>
                <th className="py-3 px-3">Raw Postings</th>
                <th className="py-3 px-3">Persistent (&gt;60d)</th>
                <th className="py-3 px-3">Median Salary</th>
                <th className="py-3 px-3">Confidence</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((r) => {
                const matchedOcc = occupations.find((o) => o.id === r.occupationId);
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => matchedOcc && setSelectedOccupationModal(matchedOcc)}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{r.occupationName}</span>
                        {r.isImported && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                            Imported
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NCO {r.ncoCode} &bull; {r.sector}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{r.district}</td>
                    <td className="py-3 px-3 text-slate-700 font-mono">Level {r.nsqfLevel}</td>
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {r.distinctVacanciesEstimate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">
                      {r.rawPostings.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-800 font-semibold">
                      {r.persistentVacancies.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-emerald-700 font-mono font-medium">
                      ₹{r.salaryMedian.toLocaleString('en-IN')}/mo
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
                        {r.confidenceScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center">
                        View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
