/**
 * KAUSHAL PULSE AI — SUPPLY INTELLIGENCE MODULE
 * Cohort pipeline analysis, certification attrition, effective supply estimation,
 * and training provider capacity utilisation.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { exportToCsvString } from '../../utils/analytics';
import {
  Users,
  Award,
  CheckCircle,
  Building,
  Download,
  ChevronRight,
  ShieldCheck,
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

export const SupplyIntelligence: React.FC = () => {
  const {
    language,
    selectedDistrict,
    selectedSector,
    supplyRecords,
    setSelectedOccupationModal,
    occupations,
    searchQuery,
  } = useApp();

  const filteredSupply = supplyRecords.filter((rec) => {
    const matchesDistrict = selectedDistrict === 'All' || rec.district === selectedDistrict;
    const matchesSector = selectedSector === 'All' || rec.sector === selectedSector;
    const matchesSearch =
      !searchQuery ||
      rec.occupationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSector && matchesSearch;
  });

  const totalSeats = filteredSupply.reduce((sum, r) => sum + r.trainingSeats, 0);
  const totalEnrolment = filteredSupply.reduce((sum, r) => sum + r.enrolment, 0);
  const totalCertified = filteredSupply.reduce((sum, r) => sum + r.certifiedCount, 0);
  const totalEffectiveSupply = filteredSupply.reduce((sum, r) => sum + r.effectiveSupply, 0);
  const avgPlacement = Math.round(
    (filteredSupply.reduce((sum, r) => {
      const p = r.placementRate > 1 ? r.placementRate / 100 : r.placementRate;
      return sum + p;
    }, 0) / (filteredSupply.length || 1)) * 100
  );

  // Provider breakdown chart
  const providerChartData = [
    {
      Provider: 'Govt ITI (Craftsmen)',
      Seats: filteredSupply.filter((r) => r.providerType === 'ITI').reduce((sum, r) => sum + r.trainingSeats, 0),
      Certified: filteredSupply.filter((r) => r.providerType === 'ITI').reduce((sum, r) => sum + r.certifiedCount, 0),
    },
    {
      Provider: 'PMKK (Short-Term)',
      Seats: filteredSupply.filter((r) => r.providerType === 'PMKK').reduce((sum, r) => sum + r.trainingSeats, 0),
      Certified: filteredSupply.filter((r) => r.providerType === 'PMKK').reduce((sum, r) => sum + r.certifiedCount, 0),
    },
    {
      Provider: 'Polytechnics / State Inst.',
      Seats: filteredSupply.filter((r) => r.providerType === 'Polytechnic').reduce((sum, r) => sum + r.trainingSeats, 0),
      Certified: filteredSupply.filter((r) => r.providerType === 'Polytechnic').reduce((sum, r) => sum + r.certifiedCount, 0),
    },
    {
      Provider: 'NSTI / Apex Centres',
      Seats: filteredSupply.filter((r) => r.providerType === 'NSTI').reduce((sum, r) => sum + r.trainingSeats, 0),
      Certified: filteredSupply.filter((r) => r.providerType === 'NSTI').reduce((sum, r) => sum + r.certifiedCount, 0),
    },
  ];

  const handleExportCsv = () => {
    const rows = filteredSupply.map((s) => {
      const pRate = s.placementRate > 1 ? s.placementRate / 100 : s.placementRate;
      const cUtil = s.capacityUtilisation > 1 ? s.capacityUtilisation / 100 : s.capacityUtilisation;
      return {
        Year: s.year,
        State: s.state,
        District: s.district,
        Sector: s.sector,
        Occupation: s.occupationName,
        TrainingSeats: s.trainingSeats,
        Enrolment: s.enrolment,
        CompletionCount: s.completionCount,
        CertifiedCount: s.certifiedCount,
        EmployedCount: s.employedCount,
        AvailableJobseekers: s.estimatedAvailableJobseekers,
        EffectiveSupply: s.effectiveSupply,
        PlacementRatePercent: `${(pRate * 100).toFixed(0)}%`,
        ProviderType: s.providerType,
        CapacityUtilisation: `${(cUtil * 100).toFixed(0)}%`,
      };
    });
    exportToCsvString(rows, `Training_Supply_Intelligence_${selectedDistrict}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Users className="w-4 h-4" />
              <span>Vocational Training Pipeline Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'आपूर्ति विश्लेषण — प्रशिक्षण क्षमता, प्रमाणन एवं प्रभावी श्रम आपूर्ति'
                : 'Supply Intelligence: Cohort Funnel, Certifications & Provider Health'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tracks candidates from enrolment to certification, adjusting for labour non-participation to project true effective work-ready supply.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-300 shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Supply CSV</span>
          </button>
        </div>
      </div>

      <FilterBar />

      {/* Cohort Funnel Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
            <Building className="w-3.5 h-3.5 text-blue-700" />
            <span>Total Sanctioned Seats</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalSeats.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Enrolment: {totalEnrolment.toLocaleString('en-IN')} (96% util)
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Certified Candidates</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">
            {totalCertified.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            NCVT & SSC verified assessments
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Effective Available Supply</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {totalEffectiveSupply.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Work-ready candidates in market
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>Avg Relevant Placement</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {avgPlacement}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Employed in trade of training
          </div>
        </div>
      </div>

      {/* Cohort Definitions Callout */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <span className="font-semibold text-blue-900">1. Certified Candidates:</span> Trainees who passed formal NCVT/SSC competency evaluations.
        </div>
        <div>
          <span className="font-semibold text-teal-900">2. Effective Supply:</span> Certified jobseekers actively seeking employment, excluding higher education or dropouts.
        </div>
        <div>
          <span className="font-semibold text-amber-900">3. Deduplication:</span> Excludes already-placed candidates from the available jobseeker pool.
        </div>
      </div>

      {/* Provider Capacity Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 mb-3">
          <Building className="w-4 h-4 text-blue-700" />
          <span>Training Output Comparison by Institution Stream</span>
        </h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={providerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="Provider" stroke="#64748b" fontSize={11} />
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
              <Bar dataKey="Seats" fill="#2563eb" name="Sanctioned Seats" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Certified" fill="#059669" name="Certified Graduates" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supply Registry Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-700" />
            <span>Vocational Trade Supply Breakdown</span>
          </h3>
          <span className="text-xs text-slate-600 font-mono bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            {filteredSupply.length} Trade Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Trade / Occupation</th>
                <th className="py-3 px-3">District & Type</th>
                <th className="py-3 px-3">Seats</th>
                <th className="py-3 px-3">Enrolled</th>
                <th className="py-3 px-3">Certified</th>
                <th className="py-3 px-3">Effective Supply</th>
                <th className="py-3 px-3">Placement</th>
                <th className="py-3 px-3">Utilisation</th>
                <th className="py-3 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSupply.map((s) => {
                const matchedOcc = occupations.find((o) => o.id === s.occupationId);
                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => matchedOcc && setSelectedOccupationModal(matchedOcc)}
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span>{s.occupationName}</span>
                        {s.isImported && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                            Imported
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{s.sector}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {s.district} &bull; <span className="text-blue-800 font-mono font-medium">{s.providerType}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">{s.trainingSeats}</td>
                    <td className="py-3 px-3 font-mono text-slate-700">{s.enrolment}</td>
                    <td className="py-3 px-3 font-mono text-amber-800 font-semibold">{s.certifiedCount}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {s.effectiveSupply}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {((s.placementRate > 1 ? s.placementRate / 100 : s.placementRate) * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {((s.capacityUtilisation > 1 ? s.capacityUtilisation / 100 : s.capacityUtilisation) * 100).toFixed(0)}%
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
