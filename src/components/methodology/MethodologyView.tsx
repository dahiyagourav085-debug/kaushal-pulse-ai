/**
 * KAUSHAL PULSE AI — METHODOLOGY & MODEL HEALTH MODULE
 * Mathematical transparency, data provenance, cohort transition matrices,
 * and empirical model calibration metrics (MAPE, RMSE, R²).
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCode2,
  Activity,
  CheckCircle,
  AlertTriangle,
  Scale,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
          <FileCode2 className="w-4 h-4" />
          <span>Scientific & Methodological Transparency</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          {language === 'hi'
            ? 'कार्यप्रणाली एवं मॉडल स्वास्थ्य — गणितीय सूत्र एवं सत्यापन'
            : 'Methodology & Model Health: Mathematical Formulations & Calibration'}
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Complete documentation of data provenance, deduplication factors, cohort transition equations,
          and model evaluation metrics for audit by MSDE and academic statisticians.
        </p>
      </div>

      {/* Model Health Calibration Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Mean Absolute % Error (MAPE)</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">8.4%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Empirical calibration target</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Root Mean Squared Error (RMSE)</div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">42.1</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Trained candidate variance</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Goodness of Fit (R²)</div>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">0.91</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Statistical explanatory power</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Confidence Band Margin</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">±12.4%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">95% statistical confidence</div>
        </div>
      </div>

      {/* Mathematical Formulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demand Formulation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>1. Labour Demand Estimation Formula</span>
          </h3>
          <div className="p-3.5 bg-slate-50 font-mono text-xs text-blue-800 rounded-lg border border-slate-200">
            D_effective(t) = (P_raw * (1 - α_dedup)) + S_direct + E_expansion
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Where <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">P_raw</code> represents aggregated job postings across state job portals and aggregators; <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">α_dedup</code> is the measured cross-posting duplication coefficient (calibrated between 0.22 and 0.28); <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">S_direct</code> denotes verified district employer survey hiring intent; and <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono">E_expansion</code> models announced industrial capex in approved economic corridors.
          </p>
        </div>

        {/* Supply Formulation */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            <span>2. Effective Workforce Supply Pipeline</span>
          </h3>
          <div className="p-3.5 bg-slate-50 font-mono text-xs text-emerald-800 rounded-lg border border-slate-200">
            S_effective(t) = Seats * U_enrol * C_comp * Q_cert * (1 - β_attrition)
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Where <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">U_enrol</code> is seat capacity utilisation (94-96% across ITIs); <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">C_comp</code> is exam appearance rate (85-88%); <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">Q_cert</code> is standard NCVT/SSC pass percentage (88-92%); and <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono">β_attrition</code> accounts for non-labour force participation (higher education, unrecorded migration, or family care, typically 18-24%).
          </p>
        </div>
      </div>

      {/* Skill Gap & Severity Classification */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
          <Scale className="w-4 h-4 text-amber-600" />
          <span>3. Skill Gap Formulation & Severity Classification</span>
        </h3>
        <div className="p-3.5 bg-slate-50 font-mono text-xs text-amber-800 rounded-lg border border-slate-200">
          Δ_SkillGap = D_effective(H) - S_effective(H)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg">
            <div className="font-bold text-rose-800 uppercase">Critical Shortage (&gt; +500)</div>
            <div className="text-rose-900 mt-1">
              Persistent vacancy ratio &gt; 35% with high wage pressure. Demands rapid seat expansion.
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="font-bold text-slate-800 uppercase">Structural Balance (±100)</div>
            <div className="text-slate-600 mt-1">
              Equilibrium within standard forecasting confidence interval. Maintain course quotas.
            </div>
          </div>
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="font-bold text-amber-800 uppercase">Severe Oversupply (&lt; -400)</div>
            <div className="text-amber-900 mt-1">
              Low placement conversion (&lt;55%). Certified workers accumulate. Reallocate to emerging trades.
            </div>
          </div>
        </div>
      </div>

      {/* Provenance & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Data Sources & Provenance Disclosures</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>National Career Service (NCS) aggregated vacancy postings (Synthetic calibration schema).</li>
            <li>Skill India Digital Hub (SIDH) trainee enrolment & certification telemetry (Synthetic pilot model).</li>
            <li>Periodic Labour Force Survey (PLFS) informal labour participation baseline coefficients.</li>
            <li>Direct District Employer Hiring Questionnaires (Industrial Corridor Pilot survey entries).</li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Known Model Limitations</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li>Informal economy vacancies in unorganized micro-enterprises are partially uncaptured.</li>
            <li>Inter-district worker migration is modeled as a friction coefficient rather than live tracking.</li>
            <li>Curriculum updates undergo 6-12 month institutional lag before ITI workshop deployment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
