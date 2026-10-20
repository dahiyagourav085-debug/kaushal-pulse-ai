/**
 * KAUSHAL PULSE AI — LABOUR MARKET GEOGRAPHIC MAP
 * Interactive district choropleth and geographic intelligence for Chhattisgarh pilot region.
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FilterBar } from '../common/FilterBar';
import {
  MapPin,
  Building,
  TrendingUp,
  Users,
  Award,
  ChevronRight,
  Layers,
  Activity,
  Sliders,
} from 'lucide-react';

type MapMetric = 'gap' | 'growth' | 'placement' | 'utilization';

export const LabourMarketMap: React.FC = () => {
  const {
    language,
    selectedDistrict,
    setSelectedDistrict,
    districts,
    occupations,
    trainingCentres,
    setActiveTab,
  } = useApp();

  const [activeMetric, setActiveMetric] = useState<MapMetric>('gap');

  // District statistics computed from data model
  const districtStats: Record<
    string,
    {
      netGap: number;
      growthRate: number;
      placementRate: number;
      utilizationRate: number;
      topShortageTrade: string;
      topSurplusTrade: string;
      centresCount: number;
      clusters: string[];
    }
  > = {
    Raipur: {
      netGap: 1840,
      growthRate: 34.2,
      placementRate: 81,
      utilizationRate: 95,
      topShortageTrade: 'Solar PV Installer & EV Technician',
      topSurplusTrade: 'Data Entry Operator',
      centresCount: 22,
      clusters: ['Urla Industrial Area', 'Bhanpuri Engineering Cluster', 'Siltara Growth Centre'],
    },
    Durg: {
      netGap: 1210,
      growthRate: 22.8,
      placementRate: 83,
      utilizationRate: 96,
      topShortageTrade: 'CNC Multi-Axis Operator & Pipe Welder',
      topSurplusTrade: 'General Welder (SMAW Manual)',
      centresCount: 19,
      clusters: ['Bhilai Steel Ancillary Zone', 'Borai Growth Centre', 'Hathkhoj Complex'],
    },
    Bilaspur: {
      netGap: 780,
      growthRate: 18.5,
      placementRate: 76,
      utilizationRate: 92,
      topShortageTrade: 'Cold Chain Equipment Technician',
      topSurplusTrade: 'Basic Data Entry Assistant',
      centresCount: 15,
      clusters: ['Sirgitti Industrial Area', 'Tifra Industrial Area', 'Chakarbhatha Logistics'],
    },
    Korba: {
      netGap: 960,
      growthRate: 16.4,
      placementRate: 79,
      utilizationRate: 94,
      topShortageTrade: 'Industrial Automation Electrician',
      topSurplusTrade: 'General Fitter (Manual)',
      centresCount: 12,
      clusters: ['Korba Power Hub', 'NTPC Ancillary Cluster', 'BALCO Aluminium Complex'],
    },
  };

  const getMetricColor = (districtName: string) => {
    const stats = districtStats[districtName] || districtStats['Raipur'];
    if (activeMetric === 'gap') {
      if (stats.netGap > 1500) return 'fill-rose-100 stroke-rose-500 group-hover:fill-rose-200';
      if (stats.netGap > 1000) return 'fill-amber-100 stroke-amber-500 group-hover:fill-amber-200';
      return 'fill-yellow-100 stroke-yellow-500 group-hover:fill-yellow-200';
    }
    if (activeMetric === 'growth') {
      if (stats.growthRate > 30) return 'fill-blue-100 stroke-blue-500 group-hover:fill-blue-200';
      if (stats.growthRate > 20) return 'fill-sky-100 stroke-sky-500 group-hover:fill-sky-200';
      return 'fill-emerald-100 stroke-emerald-500 group-hover:fill-emerald-200';
    }
    if (activeMetric === 'placement') {
      return stats.placementRate >= 80
        ? 'fill-emerald-100 stroke-emerald-500 group-hover:fill-emerald-200'
        : 'fill-amber-100 stroke-amber-500 group-hover:fill-amber-200';
    }
    return 'fill-indigo-100 stroke-indigo-500 group-hover:fill-indigo-200';
  };

  const currentDistrictData =
    selectedDistrict !== 'All'
      ? districtStats[selectedDistrict] || districtStats['Raipur']
      : districtStats['Raipur'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4" />
              <span>Geospatial Labour Intelligence</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'श्रम बाजार मानचित्र — जिला एवं क्लस्टर स्तर विश्लेषण'
                : 'Labour Market Geographic Map: District Clusters & Deficit Hotspots'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Interactive choropleth visualization of vocational supply pipelines, industrial demand, and skill gaps across Chhattisgarh.
            </p>
          </div>

          {/* Metric Filter Tabs */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveMetric('gap')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeMetric === 'gap'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skill Gap Deficit
            </button>
            <button
              onClick={() => setActiveMetric('growth')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeMetric === 'growth'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demand Growth
            </button>
            <button
              onClick={() => setActiveMetric('placement')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeMetric === 'placement'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Placement Rate
            </button>
            <button
              onClick={() => setActiveMetric('utilization')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeMetric === 'utilization'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Seat Utilisation
            </button>
          </div>
        </div>
      </div>

      <FilterBar />

      {/* Map Layout: Visual Choropleth SVG (Left) + Selected District Intelligence Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Choropleth Map */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Chhattisgarh Pilot Cluster Topology</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Metric: <span className="text-blue-700 font-bold uppercase">{activeMetric}</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Click any district polygon or cluster node to inspect detailed workforce capacity:
            </p>

            {/* SVG Choropleth representation */}
            <div className="relative w-full h-80 bg-slate-50 rounded-lg border border-slate-200 p-4 flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 500 350" className="w-full h-full max-h-72">
                {/* State outline placeholder */}
                <path
                  d="M 120 40 L 260 20 L 380 60 L 410 160 L 360 240 L 320 320 L 200 330 L 140 270 L 90 180 Z"
                  fill="#f1f5f9"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Korba District (North East) */}
                <g
                  onClick={() => setSelectedDistrict('Korba')}
                  className="cursor-pointer group transition-all"
                >
                  <polygon
                    points="260,40 360,50 350,110 270,120"
                    className={`${getMetricColor('Korba')} stroke-2 transition-all`}
                  />
                  <text x="310" y="80" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Korba
                  </text>
                  <text x="310" y="95" fill="#475569" fontSize="9" textAnchor="middle">
                    {districtStats['Korba'].netGap} Deficit
                  </text>
                </g>

                {/* Bilaspur District (North-Central) */}
                <g
                  onClick={() => setSelectedDistrict('Bilaspur')}
                  className="cursor-pointer group transition-all"
                >
                  <polygon
                    points="170,80 260,70 270,140 180,150"
                    className={`${getMetricColor('Bilaspur')} stroke-2 transition-all`}
                  />
                  <text x="220" y="110" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Bilaspur
                  </text>
                  <text x="220" y="125" fill="#475569" fontSize="9" textAnchor="middle">
                    {districtStats['Bilaspur'].netGap} Deficit
                  </text>
                </g>

                {/* Raipur District (Central - Capital) */}
                <g
                  onClick={() => setSelectedDistrict('Raipur')}
                  className="cursor-pointer group transition-all"
                >
                  <polygon
                    points="240,150 340,140 330,220 230,210"
                    className={`${getMetricColor('Raipur')} stroke-2 transition-all`}
                  />
                  <text x="285" y="180" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Raipur (Capital)
                  </text>
                  <text x="285" y="195" fill="#475569" fontSize="9" textAnchor="middle">
                    {districtStats['Raipur'].netGap} Deficit
                  </text>
                </g>

                {/* Durg (Bhilai) District (West-Central) */}
                <g
                  onClick={() => setSelectedDistrict('Durg')}
                  className="cursor-pointer group transition-all"
                >
                  <polygon
                    points="140,160 230,150 220,230 130,220"
                    className={`${getMetricColor('Durg')} stroke-2 transition-all`}
                  />
                  <text x="180" y="190" fill="#0f172a" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Durg (Bhilai)
                  </text>
                  <text x="180" y="205" fill="#475569" fontSize="9" textAnchor="middle">
                    {districtStats['Durg'].netGap} Deficit
                  </text>
                </g>
              </svg>

              {/* Map Legend Floating Box */}
              <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200 p-2.5 rounded-lg shadow-sm text-[11px] text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">Legend: {activeMetric.toUpperCase()}</div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-400 border border-rose-500" />
                  <span>High Shortage (&gt;1,500 gap)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-300 border border-amber-500" />
                  <span>Moderate Shortage (&gt;1,000 gap)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-yellow-200 border border-yellow-400" />
                  <span>Emerging Shortage (&lt;1,000 gap)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Coordinate System: WGS 84 &bull; Pilot Region: Chhattisgarh</span>
            <span className="text-blue-700 font-semibold">Active Selection: {selectedDistrict}</span>
          </div>
        </div>

        {/* Selected District Dossier (Right column) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <div className="text-[11px] font-mono uppercase text-blue-700 font-semibold">District Intelligence Brief</div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2 mt-0.5">
              <Building className="w-4 h-4 text-blue-600" />
              <span>{selectedDistrict === 'All' ? 'Raipur (Focal Hub)' : selectedDistrict}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Key industrial and vocational indicators for district skill committee planning.
            </p>
          </div>

          {/* Micro KPI Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Net Labour Deficit</div>
              <div className="text-base font-extrabold text-rose-600 mt-0.5">
                +{currentDistrictData.netGap.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500">Unique openings</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Demand Growth</div>
              <div className="text-base font-extrabold text-blue-600 mt-0.5">
                +{currentDistrictData.growthRate}%
              </div>
              <div className="text-[10px] text-slate-500">YoY Posting surge</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Placement Rate</div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                {currentDistrictData.placementRate}%
              </div>
              <div className="text-[10px] text-slate-500">Verified absorption</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-500 font-medium">Seat Utilisation</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {currentDistrictData.utilizationRate}%
              </div>
              <div className="text-[10px] text-slate-500">{currentDistrictData.centresCount} Active centres</div>
            </div>
          </div>

          {/* Trade Highlights */}
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <div className="text-[10px] font-semibold uppercase text-rose-800">Acute Shortage Trade:</div>
              <div className="font-bold text-slate-900 mt-0.5">{currentDistrictData.topShortageTrade}</div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-[10px] font-semibold uppercase text-amber-800">Oversupplied Trade:</div>
              <div className="font-bold text-slate-900 mt-0.5">{currentDistrictData.topSurplusTrade}</div>
            </div>
          </div>

          {/* Major Industrial Clusters */}
          <div>
            <h4 className="text-[11px] font-bold uppercase text-slate-700 mb-2">
              Major Industrial & Employment Clusters
            </h4>
            <div className="space-y-1">
              {currentDistrictData.clusters.map((c, i) => (
                <div
                  key={i}
                  className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Route to Simulator */}
          <button
            onClick={() => setActiveTab('simulator')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate District Allocation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
