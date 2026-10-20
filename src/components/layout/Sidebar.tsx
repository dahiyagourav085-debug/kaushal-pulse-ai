/**
 * KAUSHAL PULSE AI — PRIMARY NAVIGATION SIDEBAR
 * 15 institutional sections, bilingual labels, active badges, accessible design
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Users,
  Activity,
  Sliders,
  CheckCircle2,
  Compass,
  Building,
  Briefcase,
  Sparkles,
  FileText,
  Database,
  FileCode2,
  Settings,
  BellRing,
} from 'lucide-react';

interface NavItem {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<{ isOpenMobile: boolean; onCloseMobile: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, language, recommendations, alerts } = useApp();

  const pendingRecsCount = recommendations.filter((r) => r.status === 'Under Review').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'overview',
      labelEn: 'Overview Dashboard',
      labelHi: 'विहंगावलोकन डैशबोर्ड',
      icon: LayoutDashboard,
    },
    {
      id: 'map',
      labelEn: 'Labour Market Map',
      labelHi: 'श्रम बाजार मानचित्र',
      icon: Map,
    },
    {
      id: 'demand',
      labelEn: 'Demand Intelligence',
      labelHi: 'मांग विश्लेषण',
      icon: TrendingUp,
    },
    {
      id: 'supply',
      labelEn: 'Supply Intelligence',
      labelHi: 'प्रशिक्षण एवं आपूर्ति',
      icon: Users,
    },
    {
      id: 'forecast',
      labelEn: 'Forecasts & Skill Gaps',
      labelHi: 'पूर्वानुमान एवं कौशल अंतराल',
      icon: Activity,
    },
    {
      id: 'simulator',
      labelEn: 'What-If Policy Simulator',
      labelHi: 'नीति सिमुलेटर (What-If)',
      icon: Sliders,
      highlight: true,
    },
    {
      id: 'recommendations',
      labelEn: 'Policy Recommendations',
      labelHi: 'नीतिगत सिफारिशें',
      icon: CheckCircle2,
      badgeCount: pendingRecsCount,
    },
    {
      id: 'radar',
      labelEn: 'Emerging Skills Radar',
      labelHi: 'उभरते कौशल रडार',
      icon: Compass,
    },
    {
      id: 'centres',
      labelEn: 'Training Centres',
      labelHi: 'प्रशिक्षण संस्थान',
      icon: Building,
    },
    {
      id: 'employer',
      labelEn: 'Employer Intelligence',
      labelHi: 'नियोक्ता सर्वेक्षण',
      icon: Briefcase,
    },
    {
      id: 'copilot',
      labelEn: 'Kaushal Copilot (AI)',
      labelHi: 'कौशल कोपायलट (एआई)',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'alerts',
      labelEn: 'Alerts & Early Warnings',
      labelHi: 'चेतावनी एवं सूचनाएं',
      icon: BellRing,
      badgeCount: activeAlertsCount,
    },
    {
      id: 'reports',
      labelEn: 'Reports & Exports',
      labelHi: 'रिपोर्ट एवं निर्यात',
      icon: FileText,
    },
    {
      id: 'data',
      labelEn: 'Data Management',
      labelHi: 'डेटा अंतर्ग्रहण एवं प्रबंधन',
      icon: Database,
    },
    {
      id: 'methodology',
      labelEn: 'Methodology & Health',
      labelHi: 'कार्यप्रणाली एवं मॉडल स्वास्थ्य',
      icon: FileCode2,
    },
    {
      id: 'settings',
      labelEn: 'Settings & Config',
      labelHi: 'सेटिंग्स',
      icon: Settings,
    },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-20 h-full lg:h-[calc(100vh-5.5rem)] w-64 bg-white border-r border-slate-200 rounded-none lg:rounded-xl shadow-xs flex flex-col z-50 lg:z-10 transition-transform duration-200 overflow-y-auto shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3.5 text-[11px] font-semibold tracking-wider uppercase text-slate-500 border-b border-slate-200 flex items-center justify-between">
          <span>{language === 'hi' ? 'मुख्य नेविगेशन' : 'MSDE Modules'}</span>
          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
            {NAV_ITEMS.length} Modules
          </span>
        </div>

        <nav className="p-2 space-y-0.5 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold border-l-4 border-blue-700 pl-2.5 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-700' : item.highlight ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </span>
                </div>

                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`ml-2 text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                      item.id === 'alerts'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}

                {item.highlight && !isActive && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded border border-blue-200">
                    Key
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span className="font-semibold text-slate-700">Pilot: Chhattisgarh</span>
            <span className="inline-flex items-center text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5" />
              Active Model
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 leading-tight">
            NCO 2015 &bull; NSQF L3-L6 &bull; DGT/NSDC Standards
          </div>
        </div>
      </aside>
    </>
  );
};
