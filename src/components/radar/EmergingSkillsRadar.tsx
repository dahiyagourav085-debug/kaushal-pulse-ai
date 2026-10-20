/**
 * KAUSHAL PULSE AI — EMERGING SKILLS RADAR
 * Detection of accelerating skill mentions in job postings, NSQF curriculum gaps,
 * and expert vocational validation workflows.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import {
  Compass,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const EmergingSkillsRadar: React.FC = () => {
  const { language, emergingSkills } = useApp();
  const [skillsList, setSkillsList] = useState(emergingSkills);

  const handleUpdateStatus = (
    id: string,
    newStatus: 'Pending Validation' | 'Validated' | 'Curriculum Revision Underway'
  ) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expertValidationStatus: newStatus } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Vocational Intelligence Telemetry</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'उभरते कौशल रडार — नए कौशलों की पहचान एवं पाठ्यक्रम अंतराल'
                : 'Emerging Skills Radar: Hiring Acceleration & NSQF Curriculum Gaps'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Extracts high-velocity competency keywords from employer job descriptions to signal curriculum obsolescence.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-200 text-xs font-medium shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-amber-900">
              {skillsList.filter((s) => s.nsqfCurriculumGap).length} Curriculum Gaps Flagged
            </span>
          </div>
        </div>
      </div>

      {/* Radar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {skillsList.map((skill) => (
          <div
            key={skill.id}
            className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-700 font-semibold">{skill.sector}</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                    skill.expertValidationStatus === 'Validated'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : skill.expertValidationStatus === 'Curriculum Revision Underway'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {skill.expertValidationStatus}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2">{skill.skillName}</h3>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Growth Rate</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5">
                    +{skill.mentionGrowthRate}% YoY
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Frequency</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {skill.rawFrequency} postings
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Curriculum Status</div>
                  <div
                    className={`text-sm font-bold mt-0.5 ${
                      skill.nsqfCurriculumGap ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {skill.nsqfCurriculumGap ? 'Gap Detected' : 'Aligned'}
                  </div>
                </div>
              </div>

              {/* Curriculum Gap Details */}
              {skill.nsqfCurriculumGap && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs">
                  <div className="flex items-center space-x-1.5 text-rose-800 font-semibold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Curriculum Divergence:</span>
                  </div>
                  <p className="text-rose-900 leading-relaxed">{skill.curriculumGapDetails}</p>
                </div>
              )}

              {/* Related Trades */}
              <div className="mt-3 text-xs">
                <span className="text-slate-500 font-semibold">Associated Occupations: </span>
                <span className="text-slate-800">{skill.relatedOccupations.join(', ')}</span>
              </div>

              {/* Sample Excerpt */}
              {skill.sampleJobExcerpts.length > 0 && (
                <div className="mt-3 text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                  "{skill.sampleJobExcerpts[0]}"
                </div>
              )}
            </div>

            {/* Validation Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Signal Confidence: {skill.confidenceScore}%
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus(skill.id, 'Validated')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-200 transition-colors"
                >
                  Mark Validated
                </button>
                <button
                  onClick={() => handleUpdateStatus(skill.id, 'Curriculum Revision Underway')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                >
                  Forward to SSC
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
