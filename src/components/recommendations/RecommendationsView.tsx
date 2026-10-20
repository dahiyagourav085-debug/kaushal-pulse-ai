/**
 * KAUSHAL PULSE AI — POLICY RECOMMENDATIONS ENGINE
 * Deterministic evidence-backed policy interventions with full approval workflow,
 * justification notes, and fiscal estimates.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { RecommendationStatus, PolicyRecommendation } from '../../types';
import {
  CheckCircle2,
  X,
  MessageSquare,
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const {
    language,
    selectedDistrict,
    selectedSector,
    recommendations,
    updateRecommendationStatus,
    setSelectedOccupationModal,
    occupations,
  } = useApp();

  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('All');
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [reviewNotesInput, setReviewNotesInput] = useState<string>('');
  const [reviewerNameInput, setReviewerNameInput] = useState<string>('Director, State Skill Mission');

  const filteredRecs = recommendations.filter((r) => {
    const matchesDistrict = selectedDistrict === 'All' || r.district === selectedDistrict;
    const matchesSector = selectedSector === 'All' || r.sector === selectedSector;
    const matchesStatus = activeStatusFilter === 'All' || r.status === activeStatusFilter;
    return matchesDistrict && matchesSector && matchesStatus;
  });

  const handleOpenStatusModal = (rec: PolicyRecommendation) => {
    setEditingRecId(rec.id);
    setReviewNotesInput(rec.reviewNotes || '');
    setReviewerNameInput(rec.reviewer || 'Authorized MSDE Officer');
  };

  const handleSaveStatus = (newStatus: RecommendationStatus) => {
    if (editingRecId) {
      updateRecommendationStatus(editingRecId, newStatus, reviewNotesInput, reviewerNameInput);
      setEditingRecId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Evidence-Based Decision Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {language === 'hi'
                ? 'नीतिगत सिफारिशें एवं अनुमोदन कार्यप्रणाली'
                : 'Policy Recommendations & Executive Approval Workflow'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Actionable capacity adjustments and industry linkages generated from deterministic gap rules, requiring human official sign-off.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-amber-800 font-bold font-mono">
              {recommendations.filter((r) => r.status === 'Under Review').length}
            </span>
            <span className="text-slate-600">Pending Review</span>
          </div>
        </div>
      </div>

      <FilterBar />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 p-2.5 rounded-xl text-xs shadow-xs">
        {['All', 'Under Review', 'Accepted', 'Implemented', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeStatusFilter === status
                ? 'bg-blue-50 text-blue-800 border border-blue-300 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {status} (
            {status === 'All'
              ? recommendations.length
              : recommendations.filter((r) => r.status === status).length}
            )
          </button>
        ))}
      </div>

      {/* Recommendations Cards List */}
      <div className="space-y-4">
        {filteredRecs.map((rec) => {
          const matchedOcc = occupations.find((o) => o.id === rec.occupationId);
          return (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-1.5">
                    <span className="text-blue-800 font-semibold">{rec.district}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500">{rec.sector}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span
                      className={`font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                        rec.severity === 'Critical'
                          ? 'bg-red-50 text-red-800 border border-red-200'
                          : rec.severity === 'High'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {rec.severity} Severity
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-emerald-700 font-mono font-medium">Confidence: {rec.confidence}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{rec.title}</h3>
                </div>

                {/* Status Badge & Action */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                      rec.status === 'Accepted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : rec.status === 'Implemented'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : rec.status === 'Rejected'
                        ? 'bg-red-50 text-red-800 border-red-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}
                  >
                    {rec.status}
                  </span>
                  <button
                    onClick={() => handleOpenStatusModal(rec)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1 rounded-lg border border-slate-200 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>

              {/* Problem & Evidence Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-200">
                  <div className="text-[10px] font-bold uppercase text-red-800 mb-1">
                    Problem Detected:
                  </div>
                  <div className="text-slate-800 leading-relaxed">{rec.problemDetected}</div>
                </div>

                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
                  <div className="text-[10px] font-bold uppercase text-blue-800 mb-1">
                    Empirical Evidence:
                  </div>
                  <div className="text-slate-800 leading-relaxed">{rec.evidence}</div>
                </div>
              </div>

              {/* Recommended Action & Mechanism */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                <div>
                  <span className="font-semibold text-blue-900">Recommended Action:</span>{' '}
                  <span className="text-slate-800">{rec.recommendedAction}</span>
                </div>
                <div>
                  <span className="font-semibold text-teal-900">Mechanism of Impact:</span>{' '}
                  <span className="text-slate-700">{rec.expectedMechanism}</span>
                </div>
                {rec.risksAndAlternatives && (
                  <div>
                    <span className="font-semibold text-amber-900">Risks & Mitigations:</span>{' '}
                    <span className="text-slate-600">{rec.risksAndAlternatives}</span>
                  </div>
                )}
              </div>

              {/* Review notes & reviewer if available */}
              {rec.reviewNotes && (
                <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-600 flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-900 font-semibold">Official Record ({rec.reviewer}):</span>{' '}
                    {rec.reviewNotes} <span className="text-slate-400 font-mono text-[10px]">({rec.updatedAt})</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Review Workflow Modal */}
      {editingRecId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Record Policy Decision</h3>
              <button
                onClick={() => setEditingRecId(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Reviewer Title / Designation
              </label>
              <input
                type="text"
                value={reviewerNameInput}
                onChange={(e) => setReviewerNameInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Justification & Administrative Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotesInput}
                onChange={(e) => setReviewNotesInput(e.target.value)}
                placeholder="Enter justification for committee minutes..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleSaveStatus('Accepted')}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Accept Recommendation
              </button>
              <button
                onClick={() => handleSaveStatus('Implemented')}
                className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Mark Implemented
              </button>
              <button
                onClick={() => handleSaveStatus('Rejected')}
                className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Reject with Cause
              </button>
              <button
                onClick={() => setEditingRecId(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
