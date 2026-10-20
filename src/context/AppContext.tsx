/**
 * KAUSHAL PULSE AI — GLOBAL APPLICATION CONTEXT & STATE
 * Provides synchronized filters, persistent datasets, What-If scenarios,
 * and bilingual translations (English / Hindi).
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Occupation,
  District,
  LabourDemandRecord,
  TrainingSupplyRecord,
  PolicyRecommendation,
  EmergingSkill,
  TrainingCentre,
  EmployerSurveyResponse,
  Alert,
  PolicyScenario,
  ForecastHorizon,
  RecommendationStatus,
} from '../types';
import {
  DEMO_OCCUPATIONS,
  DEMO_DISTRICTS,
  DEMO_DEMAND_RECORDS,
  DEMO_SUPPLY_RECORDS,
  DEMO_RECOMMENDATIONS,
  DEMO_EMERGING_SKILLS,
  DEMO_TRAINING_CENTRES,
  DEMO_EMPLOYER_SURVEYS,
  DEMO_ALERTS,
} from '../data/demoData';
import { runPolicySimulation } from '../utils/analytics';

export type Language = 'en' | 'hi';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Global Filters
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  selectedOccupation: string;
  setSelectedOccupation: (occ: string) => void;
  selectedSkill: string;
  setSelectedSkill: (skill: string) => void;
  selectedHorizon: ForecastHorizon;
  setSelectedHorizon: (horizon: ForecastHorizon) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected Occupation for detail view / modal
  selectedOccupationModal: Occupation | null;
  setSelectedOccupationModal: (occ: Occupation | null) => void;

  // Datasets
  occupations: Occupation[];
  districts: District[];
  demandRecords: LabourDemandRecord[];
  supplyRecords: TrainingSupplyRecord[];
  recommendations: PolicyRecommendation[];
  emergingSkills: EmergingSkill[];
  trainingCentres: TrainingCentre[];
  employerSurveys: EmployerSurveyResponse[];
  alerts: Alert[];
  savedScenarios: PolicyScenario[];

  // Mutating Actions
  updateRecommendationStatus: (
    id: string,
    status: RecommendationStatus,
    notes?: string,
    reviewer?: string
  ) => void;
  savePolicyScenario: (scenario: PolicyScenario) => void;
  deletePolicyScenario: (id: string) => void;
  addEmployerSurvey: (survey: Omit<EmployerSurveyResponse, 'id' | 'submittedAt'>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  importIngestionRecords: (records: any[]) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PRESET_SCENARIOS: PolicyScenario[] = [
  {
    ...runPolicySimulation(
      DEMO_OCCUPATIONS[0], // Solar PV
      'Raipur',
      '12m',
      0,
      84,
      15
    ),
    id: 'preset-1',
    name: 'Preset 1: Maintain Current Policy (Solar PV, Raipur)',
    description: 'Status quo baseline with 0% seat change and standard 15% demand growth',
    isPreset: true,
  },
  {
    ...runPolicySimulation(
      DEMO_OCCUPATIONS[0], // Solar PV
      'Raipur',
      '12m',
      45,
      88,
      20
    ),
    id: 'preset-2',
    name: 'Preset 2: Targeted Capacity Expansion (+45% Solar PV Seats)',
    description: 'Proactively adds 45% training capacity to alleviate critical clean energy shortage',
    isPreset: true,
  },
  {
    ...runPolicySimulation(
      DEMO_OCCUPATIONS[5], // General Welder SMAW
      'Durg',
      '12m',
      -25,
      80,
      -5
    ),
    id: 'preset-3',
    name: 'Preset 3: Capacity Reallocation (-25% Basic Welder Seats)',
    description: 'Rationalises 25% redundant basic welding capacity to eliminate persistent oversupply',
    isPreset: true,
  },
];

// Safe localStorage hydration helper with try/catch and type validation
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.warn(`Failed to parse localStorage key "${key}", falling back to default.`, err);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Filters
  const [selectedState, setSelectedState] = useState<string>('Chhattisgarh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedOccupation, setSelectedOccupation] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<string>('All');
  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon>('12m');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedOccupationModal, setSelectedOccupationModal] = useState<Occupation | null>(null);

  // Datasets with resilient localStorage hydration
  const [occupations, setOccupations] = useState<Occupation[]>(() =>
    loadFromStorage('kaushal_occupations', DEMO_OCCUPATIONS)
  );

  const [districts] = useState<District[]>(DEMO_DISTRICTS);

  const [demandRecords, setDemandRecords] = useState<LabourDemandRecord[]>(() =>
    loadFromStorage('kaushal_demand_records', DEMO_DEMAND_RECORDS)
  );

  const [supplyRecords, setSupplyRecords] = useState<TrainingSupplyRecord[]>(() =>
    loadFromStorage('kaushal_supply_records', DEMO_SUPPLY_RECORDS)
  );

  const [recommendations, setRecommendations] = useState<PolicyRecommendation[]>(() =>
    loadFromStorage('kaushal_recommendations', DEMO_RECOMMENDATIONS)
  );

  const [emergingSkills, setEmergingSkills] = useState<EmergingSkill[]>(() =>
    loadFromStorage('kaushal_emerging_skills', DEMO_EMERGING_SKILLS)
  );

  const [trainingCentres, setTrainingCentres] = useState<TrainingCentre[]>(() =>
    loadFromStorage('kaushal_training_centres', DEMO_TRAINING_CENTRES)
  );

  const [employerSurveys, setEmployerSurveys] = useState<EmployerSurveyResponse[]>(() =>
    loadFromStorage('kaushal_employer_surveys', DEMO_EMPLOYER_SURVEYS)
  );

  const [alerts, setAlerts] = useState<Alert[]>(() =>
    loadFromStorage('kaushal_alerts', DEMO_ALERTS)
  );

  const [savedScenarios, setSavedScenarios] = useState<PolicyScenario[]>(() =>
    loadFromStorage('kaushal_scenarios', PRESET_SCENARIOS)
  );

  // LocalStorage persistence effects
  useEffect(() => {
    localStorage.setItem('kaushal_occupations', JSON.stringify(occupations));
  }, [occupations]);

  useEffect(() => {
    localStorage.setItem('kaushal_demand_records', JSON.stringify(demandRecords));
  }, [demandRecords]);

  useEffect(() => {
    localStorage.setItem('kaushal_supply_records', JSON.stringify(supplyRecords));
  }, [supplyRecords]);

  useEffect(() => {
    localStorage.setItem('kaushal_recommendations', JSON.stringify(recommendations));
  }, [recommendations]);

  useEffect(() => {
    localStorage.setItem('kaushal_training_centres', JSON.stringify(trainingCentres));
  }, [trainingCentres]);

  useEffect(() => {
    localStorage.setItem('kaushal_emerging_skills', JSON.stringify(emergingSkills));
  }, [emergingSkills]);

  useEffect(() => {
    localStorage.setItem('kaushal_employer_surveys', JSON.stringify(employerSurveys));
  }, [employerSurveys]);

  useEffect(() => {
    localStorage.setItem('kaushal_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('kaushal_scenarios', JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  // Actions
  const updateRecommendationStatus = (
    id: string,
    status: RecommendationStatus,
    notes?: string,
    reviewer: string = 'Authorized MSDE Planner'
  ) => {
    setRecommendations((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          return {
            ...rec,
            status,
            reviewNotes: notes || rec.reviewNotes,
            reviewer,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return rec;
      })
    );
  };

  const savePolicyScenario = (scenario: PolicyScenario) => {
    setSavedScenarios((prev) => [scenario, ...prev]);
  };

  const deletePolicyScenario = (id: string) => {
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const addEmployerSurvey = (surveyData: Omit<EmployerSurveyResponse, 'id' | 'submittedAt'>) => {
    const newSurvey: EmployerSurveyResponse = {
      ...surveyData,
      id: `emp-survey-${Date.now()}`,
      submittedAt: new Date().toISOString(),
    };
    setEmployerSurveys((prev) => [newSurvey, ...prev]);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' as const } : a))
    );
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved' as const } : a))
    );
  };

  const importIngestionRecords = (records: any[]) => {
    if (!records || records.length === 0) return;

    const newDemand: LabourDemandRecord[] = [];
    const newSupply: TrainingSupplyRecord[] = [];
    const newOccs: Occupation[] = [];

    const existingOccMap = new Map(occupations.map((o) => [o.name.toLowerCase(), o]));

    records.forEach((row, idx) => {
      const occName = (row.occupationName || row.occupation || 'Technical Specialist').trim();
      const occLower = occName.toLowerCase();
      let occId = '';

      if (existingOccMap.has(occLower)) {
        occId = existingOccMap.get(occLower)!.id;
      } else {
        occId = `occ-user-${Date.now()}-${idx}`;
        const newOcc: Occupation = {
          id: occId,
          name: occName,
          ncoCode: row.ncoCode || '7400.0000',
          nsqfLevel: Number(row.nsqfLevel) || 4,
          sector: row.sector || row.industry || 'General Technical',
          description: `User-imported role: ${occName}`,
          coreSkills: row.requiredSkills
            ? String(row.requiredSkills)
                .split(/[;,]/)
                .map((s: string) => s.trim())
                .filter(Boolean)
            : ['Technical Domain Knowledge', 'Safety Standards'],
          emergingSkills: ['Digital Tools', 'Quality Management'],
          entrySalaryInr: 18000,
          medianSalaryInr: 24000,
          persistentVacanciesRatio: 0.28,
          historicalDemand: [1200, 1350, 1480, Number(row.distinctVacancyEstimate) || 1500],
          historicalSupply: [900, 1050, 1180, Number(row.effectiveSupply) || 1200],
        };
        newOccs.push(newOcc);
        existingOccMap.set(occLower, newOcc);
      }

      const vacancies = Math.max(0, Number(row.distinctVacancyEstimate) || 0);
      const demRec: LabourDemandRecord = {
        id: `dem-user-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        date: row.observationDate || '2026-03-01',
        state: row.state || 'Chhattisgarh',
        district: row.district || 'Raipur',
        sector: row.sector || row.industry || 'General Technical',
        occupationId: occId,
        occupationName: occName,
        ncoCode: row.ncoCode || '7400.0000',
        nsqfLevel: Number(row.nsqfLevel) || 4,
        rawPostings: Number(row.jobPostingCount) || Math.round(vacancies * 1.25),
        distinctVacanciesEstimate: vacancies,
        entryHiresRatio: 0.35,
        experienceYearsAvg: 2.1,
        salaryMedian: 22000,
        persistentVacancies: Math.round(vacancies * 0.28),
        dataSource: `${row.dataSource || 'User Ingestion'} [Imported]`,
        dataFreshnessDays: Number(row.sourceFreshness) || 1,
        confidenceScore: Number(row.dataConfidence) || 88,
        isImported: true,
        provenance: 'User Ingested',
      };
      newDemand.push(demRec);

      const seats = Number(row.trainingSeats || 0);
      const effSupply = Number(row.effectiveSupply || 0);
      if (seats > 0 || effSupply > 0) {
        const enrol = Number(row.enrolment) || Math.round(seats * 0.95);
        const comp = Number(row.completion) || Math.round(seats * 0.85);
        const cert = Number(row.certification) || Math.round(seats * 0.80);
        const placed = Number(row.relevantPlacements) || Math.round(seats * 0.65);
        const finalSupply = effSupply > 0 ? effSupply : Math.round(seats * 0.72);

        // Standardize placementRate and capacityUtilisation to decimal ratios 0.0 - 1.0
        const rawPlacement = row.placementRate !== undefined ? Number(row.placementRate) : undefined;
        const rawUtilisation = row.capacityUtilisation !== undefined ? Number(row.capacityUtilisation) : undefined;

        const calculatedPlacement = seats > 0 ? Math.min(1.0, Math.max(0, placed / (comp || seats))) : 0.68;
        const finalPlacement = rawPlacement !== undefined && !isNaN(rawPlacement)
          ? (rawPlacement > 1 ? rawPlacement / 100 : Math.max(0, Math.min(1.0, rawPlacement)))
          : calculatedPlacement;

        const calculatedUtilisation = seats > 0 ? Math.min(1.0, Math.max(0, enrol / seats)) : 0.92;
        const finalUtilisation = rawUtilisation !== undefined && !isNaN(rawUtilisation)
          ? (rawUtilisation > 1 ? rawUtilisation / 100 : Math.max(0, Math.min(1.0, rawUtilisation)))
          : calculatedUtilisation;

        const supRec: TrainingSupplyRecord = {
          id: `sup-user-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          year: parseInt(String(row.observationDate || '2026').slice(0, 4), 10) || 2026,
          state: row.state || 'Chhattisgarh',
          district: row.district || 'Raipur',
          sector: row.sector || row.industry || 'General Technical',
          occupationId: occId,
          occupationName: occName,
          trainingSeats: seats,
          enrolment: enrol,
          completionCount: comp,
          certifiedCount: cert,
          employedCount: placed,
          estimatedAvailableJobseekers: Math.round(finalSupply * 1.15),
          effectiveSupply: finalSupply,
          placementRate: finalPlacement,
          providerType: 'ITI',
          capacityUtilisation: finalUtilisation,
          isImported: true,
          provenance: 'User Ingested',
        };
        newSupply.push(supRec);
      }
    });

    if (newOccs.length > 0) {
      setOccupations((prev) => [...prev, ...newOccs]);
    }
    setDemandRecords((prev) => [...newDemand, ...prev]);
    if (newSupply.length > 0) {
      setSupplyRecords((prev) => [...newSupply, ...prev]);
    }
  };

  const resetToDemoData = () => {
    localStorage.removeItem('kaushal_occupations');
    localStorage.removeItem('kaushal_demand_records');
    localStorage.removeItem('kaushal_supply_records');
    localStorage.removeItem('kaushal_recommendations');
    localStorage.removeItem('kaushal_emerging_skills');
    localStorage.removeItem('kaushal_training_centres');
    localStorage.removeItem('kaushal_employer_surveys');
    localStorage.removeItem('kaushal_alerts');
    localStorage.removeItem('kaushal_scenarios');

    setOccupations(DEMO_OCCUPATIONS);
    setDemandRecords(DEMO_DEMAND_RECORDS);
    setSupplyRecords(DEMO_SUPPLY_RECORDS);
    setRecommendations(DEMO_RECOMMENDATIONS);
    setEmergingSkills(DEMO_EMERGING_SKILLS);
    setTrainingCentres(DEMO_TRAINING_CENTRES);
    setEmployerSurveys(DEMO_EMPLOYER_SURVEYS);
    setAlerts(DEMO_ALERTS);
    setSavedScenarios(PRESET_SCENARIOS);
    setSelectedDistrict('All');
    setSelectedSector('All');
    setSelectedOccupation('All');
    setSelectedSkill('All');
    setSelectedHorizon('12m');
    setSearchQuery('');
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeTab,
        setActiveTab,
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
        searchQuery,
        setSearchQuery,
        selectedOccupationModal,
        setSelectedOccupationModal,
        occupations,
        districts,
        demandRecords,
        supplyRecords,
        recommendations,
        emergingSkills,
        trainingCentres,
        employerSurveys,
        alerts,
        savedScenarios,
        updateRecommendationStatus,
        savePolicyScenario,
        deletePolicyScenario,
        addEmployerSurvey,
        acknowledgeAlert,
        resolveAlert,
        importIngestionRecords,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
