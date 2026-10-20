/**
 * KAUSHAL PULSE AI — TRAINING CENTRE INTELLIGENCE
 * Directory of ITIs, PMKKs, polytechnics, and apex training institutions
 * with capacity utilisation, demand alignment, and placement performance.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import {
  Building,
  Award,
  CheckCircle,
  MapPin,
  Phone,
  Layers,
  Search,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const TrainingCentresView: React.FC = () => {
  const { language, trainingCentres, selectedDistrict } = useApp();
  const [centreTypeFilter, setCentreTypeFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const filteredCentres = trainingCentres.filter((tc) => {
    const matchesDistrict = selectedDistrict === 'All' || tc.district === selectedDistrict;
    const matchesType = centreTypeFilter === 'All' || tc.type === centreTypeFilter;
    const matchesSearch =
      !search ||
      tc.name.toLowerCase().includes(search.toLowerCase()) ||
      tc.tradesOffered.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesDistrict && matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Building className="w-4 h-4" />
              <span>Vocational Infrastructure Inventory</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'प्रशिक्षण संस्थान बुद्धिमत्ता — आईटीआई एवं कौशल केंद्र'
                : 'Training Centre Intelligence: Capacity, Infrastructure & Outcomes'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Comprehensive institutional directory auditing seat capacity, demand alignment index, and verified placement conversion.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50 px-3.5 py-1.5 rounded-lg border border-emerald-200 text-xs font-medium shrink-0">
            <span className="text-emerald-700 font-bold font-mono">
              {trainingCentres.length} Institutions
            </span>
            <span className="text-emerald-900">Audited in Pilot</span>
          </div>
        </div>
      </div>

      <FilterBar />

      {/* Type Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setCentreTypeFilter('All')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              centreTypeFilter === 'All'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Types
          </button>
          <button
            onClick={() => setCentreTypeFilter('Govt ITI')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              centreTypeFilter === 'Govt ITI'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Govt ITIs
          </button>
          <button
            onClick={() => setCentreTypeFilter('PMKK')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              centreTypeFilter === 'PMKK'
                ? 'bg-teal-50 text-teal-700 font-bold border border-teal-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PMKK Centres
          </button>
          <button
            onClick={() => setCentreTypeFilter('NSTI')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              centreTypeFilter === 'NSTI'
                ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NSTI / Apex
          </button>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search centre name or trade..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Centre Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCentres.map((centre) => (
          <div
            key={centre.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 font-medium">
                  {centre.type} &bull; {centre.district}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {((centre.placementRate > 1 ? centre.placementRate / 100 : centre.placementRate) * 100).toFixed(0)}% Placement
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{centre.name}</h3>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Capacity / Enrolled</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {centre.totalCapacity} <span className="text-xs font-normal text-slate-500">({centre.enrolledSeats})</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Seat Utilisation</div>
                  <div className="text-sm font-bold text-blue-700 mt-0.5">
                    {((centre.utilizationRate > 1 ? centre.utilizationRate / 100 : centre.utilizationRate) * 100).toFixed(0)}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Demand Alignment</div>
                  <div className="text-sm font-bold text-amber-700 mt-0.5">
                    {centre.demandAlignmentScore} / 100
                  </div>
                </div>
              </div>

              {/* Trades Offered */}
              <div className="mt-3">
                <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Trade Offerings:</div>
                <div className="flex flex-wrap gap-1.5">
                  {centre.tradesOffered.map((trade, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md"
                    >
                      {trade}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Footer */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{centre.phone}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Audit Completeness: {centre.dataCompletenessScore}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
