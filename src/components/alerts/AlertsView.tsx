/**
 * KAUSHAL PULSE AI — ALERTS & EARLY WARNINGS MODULE
 * Detects persistent shortages, structural oversupplies, stale data feeds,
 * and curriculum divergence with workflow acknowledgement actions.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import { AlertSeverity, AlertStatus } from '../../types';
import {
  BellRing,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { language, alerts, acknowledgeAlert, resolveAlert, setActiveTab, setSelectedDistrict } = useApp();
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredAlerts = alerts.filter((a) => {
    const matchSeverity = severityFilter === 'All' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <BellRing className="w-4 h-4" />
              <span>Early Warning Radar</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'चेतावनी एवं प्रारंभिक सूचनाएं — विसंगति पहचान'
                : 'Alerts & Early Warnings: Acute Bottlenecks & Data Staleness'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Automated anomaly detection flagging persistent vacancies, curriculum divergence, and saturated trades.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-rose-50 px-3.5 py-1.5 rounded-lg border border-rose-200 text-xs font-medium shrink-0">
            <span className="text-rose-700 font-bold font-mono">
              {alerts.filter((a) => a.status === 'Active').length} Active Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-500">Severity:</span>
          {['All', 'Critical', 'Warning', 'Info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-md transition-all ${
                severityFilter === sev
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-slate-500">Status:</span>
          {['All', 'Active', 'Acknowledged', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md transition-all ${
                statusFilter === st
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.map((alt) => (
          <div
            key={alt.id}
            className={`border rounded-xl p-6 shadow-xs space-y-3 transition-colors ${
              alt.severity === 'Critical'
                ? 'border-rose-200 bg-rose-50/40'
                : alt.severity === 'Warning'
                ? 'border-amber-200 bg-amber-50/40'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    alt.severity === 'Critical'
                      ? 'bg-rose-500'
                      : alt.severity === 'Warning'
                      ? 'bg-amber-500'
                      : 'bg-blue-500'
                  }`}
                />
                <span className="text-xs font-mono uppercase font-bold text-slate-700">
                  {alt.type.replace('_', ' ')}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-xs text-blue-700 font-semibold">{alt.district}</span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  alt.status === 'Active'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : alt.status === 'Acknowledged'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {alt.status}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900">{alt.title}</h3>

            <div className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-900">Evidence: </span>
              {alt.evidence}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <div className="text-slate-700 font-medium">
                <span className="font-semibold text-slate-900">Suggested Action: </span>
                {alt.suggestedAction}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                {alt.status === 'Active' && (
                  <button
                    onClick={() => acknowledgeAlert(alt.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium border border-slate-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                {alt.status !== 'Resolved' && (
                  <button
                    onClick={() => resolveAlert(alt.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
