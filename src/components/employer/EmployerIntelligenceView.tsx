/**
 * KAUSHAL PULSE AI — EMPLOYER INTELLIGENCE MODULE
 * Collects and aggregates real-time employer hiring intent surveys from industrial corridors,
 * tracking difficulty-to-fill trades and apprenticeship willingness.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { exportToCsvString } from '../../utils/analytics';
import {
  Briefcase,
  PlusCircle,
  TrendingUp,
  Download,
  CheckCircle,
  AlertTriangle,
  Building,
  User,
  Banknote,
  Send,
  X,
} from 'lucide-react';

export const EmployerIntelligenceView: React.FC = () => {
  const {
    language,
    employerSurveys,
    addEmployerSurvey,
    selectedDistrict,
    districts,
    occupations,
  } = useApp();

  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string>('');

  // Form State
  const [companyName, setCompanyName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [industry, setIndustry] = useState<string>('Capital Goods & Heavy Fabrication');
  const [district, setDistrict] = useState<string>('Raipur');
  const [occupationNeeded, setOccupationNeeded] = useState<string>(
    occupations[0]?.name || 'Solar PV System Installer'
  );
  const [expectedHires3m, setExpectedHires3m] = useState<number>(25);
  const [expectedHires12m, setExpectedHires12m] = useState<number>(90);
  const [keySkillsInput, setKeySkillsInput] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<'Fresher (0-1y)' | 'Mid (2-4y)' | 'Senior (5y+)'>('Fresher (0-1y)');
  const [salaryBand, setSalaryBand] = useState<string>('₹20,000 - ₹28,000/mo');
  const [hiringDifficulty, setHiringDifficulty] = useState<'Extreme' | 'Moderate' | 'Easy'>('Extreme');
  const [hiringBarrierInput, setHiringBarrierInput] = useState<string>('Candidates lack practical machine handling experience');
  const [interestedInApprenticeship, setInterestedInApprenticeship] = useState<boolean>(true);

  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    addEmployerSurvey({
      companyName,
      industry,
      district,
      contactPerson: contactPerson || 'HR Manager',
      occupationNeeded,
      expectedHires3m,
      expectedHires12m,
      keySkillsRequired: keySkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      experienceLevel,
      salaryBand,
      hiringDifficulty,
      hiringBarriers: hiringBarrierInput.split(';').map((s) => s.trim()).filter(Boolean),
      interestedInApprenticeship,
    });

    setSuccessBanner('Employer demand submission logged! Incorporated into real-time forecasting engine.');
    setIsSurveyModalOpen(false);
    setCompanyName('');
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  const handleExportCsv = () => {
    const rows = employerSurveys.map((s) => ({
      CompanyName: s.companyName,
      Industry: s.industry,
      District: s.district,
      ContactPerson: s.contactPerson,
      OccupationNeeded: s.occupationNeeded,
      ExpectedHires3M: s.expectedHires3m,
      ExpectedHires12M: s.expectedHires12m,
      ExperienceLevel: s.experienceLevel,
      SalaryBand: s.salaryBand,
      HiringDifficulty: s.hiringDifficulty,
      InterestedInApprenticeship: s.interestedInApprenticeship ? 'Yes' : 'No',
      SubmittedAt: s.submittedAt,
    }));
    exportToCsvString(rows, `Employer_Survey_Findings_${selectedDistrict}`);
  };

  const filteredSurveys = employerSurveys.filter(
    (s) => selectedDistrict === 'All' || s.district === selectedDistrict
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>Direct Industry Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'नियोक्ता सर्वेक्षण एवं उद्योग मांग बुद्धिमत्ता'
                : 'Employer Intelligence: Direct Corridor Demand & Apprenticeship Intent'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Ground truth hiring requirements submitted directly by manufacturing, clean tech, and infrastructure firms across Chhattisgarh.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsSurveyModalOpen(true)}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record Employer Survey</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
        )}
      </div>

      <FilterBar />

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Surveyed 12-Month Hires</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">
            {filteredSurveys.reduce((sum, s) => sum + s.expectedHires12m, 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Committed employer requirements
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Hiring Difficulty: Extreme</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            {Math.round(
              (filteredSurveys.filter((s) => s.hiringDifficulty === 'Extreme').length /
                (filteredSurveys.length || 1)) *
                100
            )}
            %
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Acute talent scarcity reported
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">NAPS Apprenticeship Readiness</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {Math.round(
              (filteredSurveys.filter((s) => s.interestedInApprenticeship).length /
                (filteredSurveys.length || 1)) *
                100
            )}
            %
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Willing to sign dual contracts
          </div>
        </div>
      </div>

      {/* Survey Results Registry Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Employer Demand Records</span>
          </h3>
          <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-medium">
            {filteredSurveys.length} Filings Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-3">Enterprise / Company</th>
                <th className="py-3 px-3">District & Sector</th>
                <th className="py-3 px-3">Target Occupation</th>
                <th className="py-3 px-3">3M / 12M Intent</th>
                <th className="py-3 px-3">Salary Band</th>
                <th className="py-3 px-3">Hiring Difficulty</th>
                <th className="py-3 px-3">Apprenticeship</th>
                <th className="py-3 px-3">Reported Barriers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSurveys.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    <div>{s.companyName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Spoc: {s.contactPerson}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {s.district} &bull; <span className="text-slate-500">{s.industry}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-blue-700">{s.occupationNeeded}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">
                    {s.expectedHires3m} / <span className="font-bold text-blue-700">{s.expectedHires12m}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-mono font-medium">{s.salaryBand}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        s.hiringDifficulty === 'Extreme'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : s.hiringDifficulty === 'Moderate'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {s.hiringDifficulty}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    {s.interestedInApprenticeship ? (
                      <span className="text-emerald-700 flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                    {s.hiringBarriers.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Survey Modal */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Record Employer Demand Survey</span>
              </h3>
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSurvey} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Company / Enterprise Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Bhilai Precision Forgings Ltd."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Person / Role</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. HR Manager / Plant Lead"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="Green Energy / Solar EPC">Green Energy / Solar EPC</option>
                    <option value="Automotive & Clean Mobility">Automotive & Clean Mobility</option>
                    <option value="Capital Goods & Heavy Fabrication">Capital Goods & Heavy Fabrication</option>
                    <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                    <option value="Electrical & Power Systems">Electrical & Power Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Occupation Needed</label>
                <select
                  value={occupationNeeded}
                  onChange={(e) => setOccupationNeeded(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  {occupations.map((o) => (
                    <option key={o.id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Hires (3 Months)</label>
                  <input
                    type="number"
                    min="1"
                    value={expectedHires3m}
                    onChange={(e) => setExpectedHires3m(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Hires (12 Months)</label>
                  <input
                    type="number"
                    min="1"
                    value={expectedHires12m}
                    onChange={(e) => setExpectedHires12m(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Salary Range Band</label>
                  <input
                    type="text"
                    value={salaryBand}
                    onChange={(e) => setSalaryBand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hiring Difficulty</label>
                  <select
                    value={hiringDifficulty}
                    onChange={(e) => setHiringDifficulty(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="Extreme">Extreme (Unfilled &gt;60d)</option>
                    <option value="Moderate">Moderate (Takes 30-45d)</option>
                    <option value="Easy">Easy (Filled in &lt;15d)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Primary Hiring Barriers</label>
                <input
                  type="text"
                  value={hiringBarrierInput}
                  onChange={(e) => setHiringBarrierInput(e.target.value)}
                  placeholder="e.g. Lack of 5-axis experience; high initial attrition"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="apprCheck"
                  checked={interestedInApprenticeship}
                  onChange={(e) => setInterestedInApprenticeship(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="apprCheck" className="text-slate-700 cursor-pointer">
                  Interested in signing National Apprenticeship Promotion Scheme (NAPS) MoUs
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSurveyModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-medium border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Submit Survey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
