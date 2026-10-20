/**
 * KAUSHAL PULSE AI — INDIA'S LABOUR MARKET INTELLIGENCE & SKILL PLANNING PLATFORM
 * Ministry of Skill Development and Entrepreneurship (MSDE)
 * Smart India Hackathon Problem Statement 26246
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { LabourMarketMap } from './components/map/LabourMarketMap';
import { DemandIntelligence } from './components/demand/DemandIntelligence';
import { SupplyIntelligence } from './components/supply/SupplyIntelligence';
import { ForecastSkillGaps } from './components/forecast/ForecastSkillGaps';
import { PolicySimulator } from './components/simulator/PolicySimulator';
import { RecommendationsView } from './components/recommendations/RecommendationsView';
import { EmergingSkillsRadar } from './components/radar/EmergingSkillsRadar';
import { TrainingCentresView } from './components/centres/TrainingCentresView';
import { EmployerIntelligenceView } from './components/employer/EmployerIntelligenceView';
import { KaushalCopilotView } from './components/copilot/KaushalCopilotView';
import { AlertsView } from './components/alerts/AlertsView';
import { ReportsView } from './components/reports/ReportsView';
import { DataManagementView } from './components/data/DataManagementView';
import { MethodologyView } from './components/methodology/MethodologyView';
import { SettingsView } from './components/settings/SettingsView';
import { OccupationModal } from './components/common/OccupationModal';
import { Menu, Building2 } from 'lucide-react';

function AppContent() {
  const { activeTab, language } = useApp();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'map':
        return <LabourMarketMap />;
      case 'demand':
        return <DemandIntelligence />;
      case 'supply':
        return <SupplyIntelligence />;
      case 'forecast':
        return <ForecastSkillGaps />;
      case 'simulator':
        return <PolicySimulator />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'radar':
        return <EmergingSkillsRadar />;
      case 'centres':
        return <TrainingCentresView />;
      case 'employer':
        return <EmployerIntelligenceView />;
      case 'copilot':
        return <KaushalCopilotView />;
      case 'alerts':
        return <AlertsView />;
      case 'reports':
        return <ReportsView />;
      case 'data':
        return <DataManagementView />;
      case 'methodology':
        return <MethodologyView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header />

      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between no-print">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4 text-blue-700" />
          <span>{language === 'hi' ? 'नेविगेशन मेनू' : 'Browse Modules (16)'}</span>
        </button>
        <span className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
          {activeTab.replace('_', ' ')}
        </span>
      </div>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 flex items-start gap-6">
        {/* Sticky Sidebar */}
        <Sidebar
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 min-w-0 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Occupation Dossier Modal */}
      <OccupationModal />

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-5 px-4 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="font-semibold text-slate-700">
              Kaushal Pulse AI &bull; Ministry of Skill Development and Entrepreneurship (MSDE)
            </span>
          </div>
          <div className="text-[11px] text-slate-500 text-center sm:text-right">
            Smart India Hackathon 2024-2026 Problem Statement 26246 &bull; Developed by Team Kaushal
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
