/**
 * KAUSHAL PULSE AI — TYPE DEFINITIONS
 * Ministry of Skill Development and Entrepreneurship (MSDE)
 * Canonical Labour Market Intelligence and Forecasting Data Schema
 */

export type ForecastHorizon = '6m' | '12m' | '24m';

export type GapSeverity =
  | 'critical_shortage'
  | 'moderate_shortage'
  | 'balanced'
  | 'moderate_oversupply'
  | 'severe_oversupply';

export type RecommendationStatus =
  | 'Under Review'
  | 'Accepted'
  | 'Rejected'
  | 'Implemented'
  | 'Outcome Pending'
  | 'Completed';

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export interface Occupation {
  id: string;
  name: string;
  ncoCode: string; // National Classification of Occupations 2015
  nsqfLevel: number; // National Skills Qualifications Framework (1-10)
  sector: string;
  description: string;
  coreSkills: string[];
  emergingSkills: string[];
  entrySalaryInr: number;
  medianSalaryInr: number;
  persistentVacanciesRatio: number; // Vacancies open > 60 days
  historicalDemand: number[]; // 2023, 2024, 2025, 2026(Q1)
  historicalSupply: number[];
}

export interface District {
  id: string;
  name: string;
  state: string;
  totalWorkforceEstimate: number;
  activeCentresCount: number;
  topShortageSectors: string[];
  coordinates: { lat: number; lng: number };
  industrialClusters: string[];
}

export interface LabourDemandRecord {
  id: string;
  date: string;
  state: string;
  district: string;
  sector: string;
  occupationId: string;
  occupationName: string;
  ncoCode: string;
  nsqfLevel: number;
  rawPostings: number;
  distinctVacanciesEstimate: number; // Deduplicated distinct opening estimate
  entryHiresRatio: number; // % of vacancies for freshers/0-2y
  experienceYearsAvg: number;
  salaryMedian: number;
  persistentVacancies: number; // Open > 60 days
  dataSource: string;
  dataFreshnessDays: number;
  confidenceScore: number; // 0 - 100
  isImported?: boolean;
  provenance?: 'Pilot Baseline' | 'User Ingested';
}

export interface TrainingSupplyRecord {
  id: string;
  year: number;
  state: string;
  district: string;
  sector: string;
  occupationId: string;
  occupationName: string;
  trainingSeats: number;
  enrolment: number;
  completionCount: number;
  certifiedCount: number;
  employedCount: number;
  estimatedAvailableJobseekers: number; // Available unplaced certified + non-enrolled jobseekers
  effectiveSupply: number; // Estimated work-ready candidates available for hire
  placementRate: number; // % certified candidates verified placed in relevant sector
  providerType: 'ITI' | 'PMKK' | 'Polytechnic' | 'DDU-GKY' | 'Industry-Led' | 'NSTI';
  capacityUtilisation: number; // Enrolment / Seats
  isImported?: boolean;
  provenance?: 'Pilot Baseline' | 'User Ingested';
}

export interface ForecastRecord {
  occupationId: string;
  occupationName: string;
  ncoCode: string;
  sector: string;
  district: string;
  state: string;
  horizonMonths: ForecastHorizon;
  forecastDemand: number;
  forecastDemandLower: number;
  forecastDemandUpper: number;
  forecastSupply: number;
  forecastSupplyLower: number;
  forecastSupplyUpper: number;
  skillGap: number; // Forecast Demand - Forecast Supply (+ve = shortage, -ve = oversupply)
  gapSeverity: GapSeverity;
  confidenceScore: number;
  method: string;
  assumptions: string[];
  lastUpdated: string;
  explanation: string;
}

export interface PolicyScenario {
  id: string;
  name: string;
  description: string;
  district: string;
  sector: string;
  occupationId: string;
  horizonMonths: ForecastHorizon;
  seatChangePercent: number; // e.g. +30% or -20%
  completionRatePercent: number; // e.g. 82%
  demandGrowthAssumptionPercent: number; // e.g. +12%
  budgetAllocationLakhs: number;
  unitSeatCostInr: number;
  projectedSupply: number;
  projectedGap: number;
  baselineGap: number;
  costDeltaLakhs: number;
  placementImpactPercent: number;
  baselineSeats?: number;
  projectedSeats?: number;
  baselineDemand?: number;
  projectedDemand?: number;
  baselineSupply?: number;
  employmentConversionPercent?: number;
  budgetCeilingLakhs?: number;
  budgetExceeded?: boolean;
  notes: string;
  createdAt: string;
  isPreset?: boolean;
}

export interface PolicyRecommendation {
  id: string;
  title: string;
  district: string;
  sector: string;
  occupationId: string;
  occupationName: string;
  problemDetected: string;
  evidence: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: 'High' | 'Medium' | 'Low';
  recommendedAction: string;
  expectedMechanism: string;
  estimatedBudgetLakhs?: number;
  risksAndAlternatives: string;
  reviewDate: string;
  status: RecommendationStatus;
  reviewNotes?: string;
  reviewer?: string;
  updatedAt?: string;
}

export interface EmergingSkill {
  id: string;
  skillName: string;
  sector: string;
  relatedOccupations: string[];
  mentionGrowthRate: number; // e.g. +48% YoY in postings
  rawFrequency: number;
  nsqfCurriculumGap: boolean;
  curriculumGapDetails: string;
  sampleJobExcerpts: string[];
  expertValidationStatus: 'Pending Validation' | 'Validated' | 'Curriculum Revision Underway';
  confidenceScore: number;
}

export interface TrainingCentre {
  id: string;
  name: string;
  type: 'Govt ITI' | 'Private ITI' | 'PMKK' | 'Polytechnic' | 'NSTI';
  district: string;
  state: string;
  totalCapacity: number;
  enrolledSeats: number;
  tradesOffered: string[];
  completionRate: number;
  certificationRate: number;
  placementRate: number;
  utilizationRate: number;
  demandAlignmentScore: number; // 0 - 100
  dataCompletenessScore: number;
  contactPerson: string;
  phone: string;
}

export interface EmployerSurveyResponse {
  id: string;
  companyName: string;
  industry: string;
  district: string;
  contactPerson: string;
  occupationNeeded: string;
  expectedHires3m: number;
  expectedHires12m: number;
  keySkillsRequired: string[];
  experienceLevel: 'Fresher (0-1y)' | 'Mid (2-4y)' | 'Senior (5y+)';
  salaryBand: string;
  hiringDifficulty: 'Extreme' | 'Moderate' | 'Easy';
  hiringBarriers: string[];
  interestedInApprenticeship: boolean;
  submittedAt: string;
}

export interface Alert {
  id: string;
  type:
    | 'shortage'
    | 'oversupply'
    | 'rapid_growth'
    | 'declining_demand'
    | 'low_confidence'
    | 'stale_data'
    | 'curriculum_gap';
  title: string;
  severity: AlertSeverity;
  occupation: string;
  district: string;
  evidence: string;
  freshnessDays: number;
  confidence: number;
  suggestedAction: string;
  status: AlertStatus;
  timestamp: string;
}

export interface DataIngestionRow {
  observationDate: string;
  state: string;
  district: string;
  industry: string;
  sector: string;
  occupationName: string;
  ncoCode?: string;
  nsqfLevel?: number;
  requiredSkills?: string;
  distinctVacancyEstimate: number;
  jobPostingCount?: number;
  salaryRange?: string;
  employmentType?: string;
  trainingSeats?: number;
  enrolment?: number;
  completion?: number;
  certification?: number;
  effectiveSupply?: number;
  relevantPlacements?: number;
  dataSource?: string;
  sourceFreshness?: number;
  dataConfidence?: number;
}

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  errorRows: number;
  duplicateCount: number;
  missingDataFields: Record<string, number>;
  normalizedOccupationCount: number;
  normalizedDistrictCount: number;
  qualityScore: number;
  validationIssues: {
    row: number;
    column: string;
    issue: string;
    severity: 'error' | 'warning';
    suggestedFix?: string;
  }[];
}

export interface DatasetMetadata {
  id: string;
  name: string;
  category: 'Demand Postings' | 'Vocational Supply' | 'Taxonomy' | 'Infrastructure' | 'Skills Radar' | 'Field Surveys' | 'User Ingested';
  recordCount: number;
  lastUpdated: string;
  sourceAuthority: string;
  geographicCoverage: string;
  status: 'Active' | 'Synchronized' | 'Verified Pilot' | 'Dynamic';
  provenance: 'Synthetic Pilot Baseline' | 'User Ingested' | 'Pilot Baseline';
  limitations: string;
}
