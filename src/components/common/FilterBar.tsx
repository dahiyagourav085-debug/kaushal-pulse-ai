/**
 * KAUSHAL PULSE AI — PERSISTENT INSTITUTIONAL FILTER BAR
 * Synchronizes State, District, Sector, Occupation, Skill, and Forecast Horizon across all modules.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Filter, Calendar, MapPin, Layers, Briefcase, Sparkles, RotateCcw, Compass } from 'lucide-react';
import { ForecastHorizon } from '../../types';

export const FilterBar: React.FC = () => {
  const {
    language,
    selectedState,
    setSelectedState,
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
    districts,
    occupations,
    setSearchQuery,
  } = useApp();

  // Extract unique sectors
  const uniqueSectors = Array.from(new Set(occupations.map((o) => o.sector))).sort();

  // Extract occupations matching selected sector
  const relevantOccupations = occupations.filter(
    (o) => selectedSector === 'All' || o.sector === selectedSector
  );

  // Extract unique skills from relevant occupations
  const uniqueSkillsSet = new Set<string>();
  relevantOccupations.forEach((o) => {
    o.coreSkills.forEach((s) => uniqueSkillsSet.add(s));
    o.emergingSkills.forEach((s) => uniqueSkillsSet.add(s));
  });
  const uniqueSkills = Array.from(uniqueSkillsSet).sort();

  const handleResetFilters = () => {
    setSelectedState('Chhattisgarh');
    setSelectedDistrict('All');
    setSelectedSector('All');
    setSelectedOccupation('All');
    setSelectedSkill('All');
    setSelectedHorizon('12m');
    setSearchQuery('');
  };

  const activeFiltersCount = [
    selectedDistrict !== 'All',
    selectedSector !== 'All',
    selectedOccupation !== 'All',
    selectedSkill !== 'All',
    selectedHorizon !== '12m',
  ].filter(Boolean).length;

  const isFiltered = activeFiltersCount > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs mb-6 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Filter className="w-4 h-4 text-blue-700" />
          <span>{language === 'hi' ? 'नीतिगत योजना फ़िल्टर' : 'Institutional Planning Filters'}</span>
          {isFiltered && (
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFiltersCount} active
            </span>
          )}
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-xs font-medium text-slate-600 hover:text-blue-700 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सभी फ़िल्टर हटाएं' : 'Reset All Filters'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* State Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors">
          <Compass className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] text-slate-500 font-medium leading-none mb-0.5">
              {language === 'hi' ? 'राज्य' : 'State'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              aria-label="Filter by state"
              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="All">All States (Pilot Region)</option>
            </select>
          </div>
        </div>

        {/* District Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors">
          <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] text-slate-500 font-medium leading-none mb-0.5">
              {language === 'hi' ? 'जिला' : 'District'}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              aria-label="Filter by district"
              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">
                {language === 'hi' ? 'समग्र पायलट (All)' : 'All Districts (Pilot Aggregate)'}
              </option>
              {districts.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sector Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors">
          <Layers className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] text-slate-500 font-medium leading-none mb-0.5">
              {language === 'hi' ? 'क्षेत्र' : 'Sector'}
            </label>
            <select
              value={selectedSector}
              onChange={(e) => {
                setSelectedSector(e.target.value);
                setSelectedOccupation('All');
                setSelectedSkill('All');
              }}
              aria-label="Filter by industrial sector"
              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">
                {language === 'hi' ? 'सभी क्षेत्र (All Sectors)' : 'All Sectors'}
              </option>
              {uniqueSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Occupation Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors">
          <Briefcase className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] text-slate-500 font-medium leading-none mb-0.5">
              {language === 'hi' ? 'व्यवसाय / ट्रेड' : 'Occupation / Trade'}
            </label>
            <select
              value={selectedOccupation}
              onChange={(e) => setSelectedOccupation(e.target.value)}
              aria-label="Filter by occupation"
              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">All Occupations ({relevantOccupations.length})</option>
              {relevantOccupations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] text-slate-500 font-medium leading-none mb-0.5">
              {language === 'hi' ? 'कौशल क्षमता' : 'Competency / Skill'}
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              aria-label="Filter by skill or competency"
              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="All">All Competencies ({uniqueSkills.length})</option>
              {uniqueSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Forecast Horizon Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 hover:border-slate-400 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <label className="block text-[10px] text-slate-500 font-medium leading-none mb-0.5">
              {language === 'hi' ? 'योजना क्षितिज' : 'Horizon'}
            </label>
            <select
              value={selectedHorizon}
              onChange={(e) => setSelectedHorizon(e.target.value as ForecastHorizon)}
              aria-label="Select forecast horizon"
              className="w-full bg-transparent text-xs text-slate-900 font-semibold focus:outline-none cursor-pointer truncate"
            >
              <option value="6m">6m (Short-Cycle)</option>
              <option value="12m">12m (Annual Plan)</option>
              <option value="24m">24m (Capital / Infra)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
