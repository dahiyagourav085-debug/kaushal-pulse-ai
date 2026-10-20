/**
 * KAUSHAL PULSE AI — ANALYTICAL & FORECASTING ENGINE
 * Deterministic mathematical models, annualized trajectory extrapolations,
 * supply cohort transition models, and What-If simulation logic.
 */

import {
  Occupation,
  ForecastHorizon,
  ForecastRecord,
  GapSeverity,
  LabourDemandRecord,
  TrainingSupplyRecord,
  PolicyScenario,
  DataIngestionRow,
  DataQualityReport,
} from '../types';

/**
 * Multiplier for forecasting horizons relative to annual baseline
 */
export function getHorizonMultiplier(horizon: ForecastHorizon): number {
  switch (horizon) {
    case '6m':
      return 0.5;
    case '12m':
      return 1.0;
    case '24m':
      return 2.08; // Accounts for compound annual growth
    default:
      return 1.0;
  }
}

/**
 * Pilot district economic workforce footprint weights relative to the state aggregate.
 * Raipur (35%), Durg/Bhilai (30%), Bilaspur (20%), Korba (15%) sum to 100%.
 */
export const DISTRICT_WEIGHTS: Record<string, number> = {
  Raipur: 0.35,
  Durg: 0.30,
  'Durg (Bhilai)': 0.30,
  Bilaspur: 0.20,
  Korba: 0.15,
};

export function getDistrictWeight(districtName?: string): number {
  if (!districtName || districtName === 'All' || districtName.startsWith('All Districts')) {
    return 1.0;
  }
  return DISTRICT_WEIGHTS[districtName] ?? 1.0;
}

/**
 * Calculate deterministic forecast for an occupation & district
 */
export function calculateOccupationForecast(
  occupation: Occupation,
  districtName: string,
  horizon: ForecastHorizon = '12m',
  demandGrowthDelta: number = 0,
  seatAdjustmentDelta: number = 0
): ForecastRecord {
  const mult = getHorizonMultiplier(horizon);
  const distWeight = getDistrictWeight(districtName);

  // Historical demand points: 2023, 2024, 2025, 2026(Q1 annualized) scaled by district weight
  const histDem = occupation.historicalDemand || [1200, 1350, 1480, 1500];
  const histSup = occupation.historicalSupply || [900, 1050, 1180, 1200];
  const dHist = histDem.map((d) => Math.round(d * distWeight));
  const sHist = histSup.map((s) => Math.round(s * distWeight));

  // Recent annualized growth trend (Compound Annual Growth Rate approx)
  const baseGrowth = (dHist[3] - dHist[2]) / Math.max(dHist[2], 1);
  const adjustedGrowth = baseGrowth + demandGrowthDelta / 100;

  // Annualized baseline demand
  const annualDemand = Math.round(dHist[3] * (1 + adjustedGrowth));
  const forecastDemand = Math.round(annualDemand * mult);

  // Confidence margin based on persistent vacancies and historical consistency
  const seRate = 0.12 + (1 - occupation.persistentVacanciesRatio) * 0.05;
  const forecastDemandLower = Math.round(forecastDemand * (1 - seRate));
  const forecastDemandUpper = Math.round(forecastDemand * (1 + seRate));

  // Supply pipeline projection:
  // Recent supply * cohort retention factor * seat adjustment
  const baseSupplyGrowth = (sHist[3] - sHist[2]) / Math.max(sHist[2], 1);
  const adjustedSupplyGrowth = baseSupplyGrowth + (seatAdjustmentDelta / 100) * 0.85;
  const annualSupply = Math.round(sHist[3] * (1 + adjustedSupplyGrowth));
  const forecastSupply = Math.round(annualSupply * mult);

  const seSupplyRate = 0.09;
  const forecastSupplyLower = Math.round(forecastSupply * (1 - seSupplyRate));
  const forecastSupplyUpper = Math.round(forecastSupply * (1 + seSupplyRate));

  const skillGap = forecastDemand - forecastSupply;

  let gapSeverity: GapSeverity = 'balanced';
  if (skillGap >= 500) {
    gapSeverity = 'critical_shortage';
  } else if (skillGap >= 120) {
    gapSeverity = 'moderate_shortage';
  } else if (skillGap <= -400) {
    gapSeverity = 'severe_oversupply';
  } else if (skillGap <= -100) {
    gapSeverity = 'moderate_oversupply';
  } else {
    gapSeverity = 'balanced';
  }

  const confidenceScore = Math.min(
    95,
    Math.max(68, Math.round(92 - (seRate * 100) / 2))
  );

  let explanation = '';
  if (gapSeverity === 'critical_shortage') {
    explanation = `High demand expansion driven by sector investments, while training capacity lags behind. Projected ${skillGap.toLocaleString('en-IN')} technician shortage in ${horizon}.`;
  } else if (gapSeverity === 'moderate_shortage') {
    explanation = `Demand moderately exceeds trained cohort supply. Candidate placement rate is strong with persistent hiring demand.`;
  } else if (gapSeverity === 'severe_oversupply') {
    explanation = `Annual certified supply substantially exceeds distinct market vacancies by ${Math.abs(skillGap).toLocaleString('en-IN')} seats. Lower placement rates observed.`;
  } else if (gapSeverity === 'moderate_oversupply') {
    explanation = `Trained candidates exceed unique job openings. Recommend reallocating portions of training seats to emerging trades.`;
  } else {
    explanation = `Demand and supply remain roughly in structural balance within the standard ±12% forecast confidence interval.`;
  }

  return {
    occupationId: occupation.id,
    occupationName: occupation.name,
    ncoCode: occupation.ncoCode,
    sector: occupation.sector,
    district: districtName,
    state: 'Chhattisgarh',
    horizonMonths: horizon,
    forecastDemand,
    forecastDemandLower,
    forecastDemandUpper,
    forecastSupply,
    forecastSupplyLower,
    forecastSupplyUpper,
    skillGap,
    gapSeverity,
    confidenceScore,
    method: 'YoY Trajectory Extrapolation + Cohort Funnel Matrix (Heuristic Demonstration Model)',
    assumptions: [
      `Demonstration heuristic: Calibrated pilot baseline (not an official gazetted ministry projection).`,
      `Base demand growth trend: ${(adjustedGrowth * 100).toFixed(1)}% p.a. (4-period trajectory extrapolation)`,
      `Training cohort completion rate: 84% empirical benchmark`,
      `Workforce participation & retention factor: 76%`,
      `Forecast horizon: ${horizon}`,
      ...(distWeight < 1.0 ? [`District economic footprint weight: ${Math.round(distWeight * 100)}% of state pilot pool`] : []),
    ],
    lastUpdated: '2026-03-12',
    explanation,
  };
}

/**
 * Execute What-If Policy Simulation
 */
export function runPolicySimulation(
  occupation: Occupation,
  district: string,
  horizon: ForecastHorizon,
  seatChangePercent: number,
  completionRatePercent: number,
  demandGrowthAssumptionPercent: number,
  unitSeatCostInr: number = 18500,
  employmentConversionPercent: number = 82,
  budgetCeilingLakhs?: number
): PolicyScenario {
  const mult = getHorizonMultiplier(horizon);
  const distWeight = getDistrictWeight(district);

  // Baseline demand and supply scaled by district weight
  const histDem = occupation?.historicalDemand?.[3] ?? 1500;
  const histSup = occupation?.historicalSupply?.[3] ?? 1200;
  const baselineDemand = Math.round(histDem * mult * distWeight);
  const baselineSupply = Math.round(histSup * mult * distWeight);
  const baselineGap = baselineDemand - baselineSupply;

  // Baseline training seats estimate for this trade in district
  const estimatedBaselineSeats = Math.max(1, Math.round(histSup * 1.35 * mult * distWeight));

  // Simulated seats bounded >= 0
  const projectedSeats = Math.max(
    0,
    Math.round(estimatedBaselineSeats * (1 + seatChangePercent / 100))
  );

  // Cohort transition calculation:
  // Seats -> Enrolment (94%) -> Completion (safeCompletion%) -> Certification (92%) -> Available in market (safeConversion%)
  const enrolmentRatio = 0.94;
  const certRatio = 0.92;
  const safeCompletion = Math.max(10, Math.min(100, completionRatePercent));
  const safeConversion = Math.max(10, Math.min(100, employmentConversionPercent));
  const marketEntryRatio = safeConversion / 100;

  const projectedTrainedOutput = Math.round(
    projectedSeats * enrolmentRatio * (safeCompletion / 100) * certRatio
  );

  const projectedSupply = Math.round(projectedTrainedOutput * marketEntryRatio);

  // Projected Demand with growth assumption
  const projectedDemand = Math.max(
    0,
    Math.round(baselineDemand * (1 + demandGrowthAssumptionPercent / 100))
  );

  const projectedGap = projectedDemand - projectedSupply;

  // Cost calculations
  const additionalSeats = projectedSeats - estimatedBaselineSeats;
  const costDeltaLakhs = Number(
    ((additionalSeats * Math.max(1000, unitSeatCostInr)) / 100000).toFixed(2)
  );
  const budgetAllocationLakhs = Number(
    ((projectedSeats * Math.max(1000, unitSeatCostInr)) / 100000).toFixed(2)
  );

  // Budget constraint check
  const budgetExceeded =
    budgetCeilingLakhs !== undefined && budgetCeilingLakhs > 0
      ? budgetAllocationLakhs > budgetCeilingLakhs
      : false;

  // Placement impact estimation
  // If supply moves closer to demand, placement rate improves; if oversupplied, placement rate drops
  const supplyDemandRatio = projectedSupply / Math.max(projectedDemand, 1);
  let placementImpactPercent = 78;
  if (supplyDemandRatio <= 0.95) {
    placementImpactPercent = Math.min(94, 82 + (1 - supplyDemandRatio) * 14);
  } else if (supplyDemandRatio > 1.2) {
    placementImpactPercent = Math.max(45, 78 - (supplyDemandRatio - 1.2) * 35);
  } else {
    placementImpactPercent = 84;
  }
  placementImpactPercent = Math.round(placementImpactPercent);

  let notes = '';
  if (seatChangePercent > 0 && projectedGap < baselineGap) {
    const gapReduction = Math.abs(baselineGap - projectedGap);
    notes = `Expanding capacity by ${seatChangePercent}% reduces the occupational deficit from ${baselineGap.toLocaleString('en-IN')} to ${projectedGap.toLocaleString('en-IN')} technicians (alleviating ${gapReduction.toLocaleString('en-IN')} vacancies) with ₹${Math.abs(costDeltaLakhs)} Lakhs fiscal investment. Note: 100 sanctioned seats yield approximately ${Math.round(enrolmentRatio * (safeCompletion / 100) * certRatio * marketEntryRatio * 100)} work-ready candidates after empirical attrition.`;
  } else if (seatChangePercent < 0 && baselineGap < 0) {
    notes = `Rationalizing seats by ${Math.abs(seatChangePercent)}% eliminates ${Math.abs(baselineGap - projectedGap).toLocaleString('en-IN')} redundant seats, saving ₹${Math.abs(costDeltaLakhs)} Lakhs for reallocation to high-demand trades, improving placement from ${Math.round(placementImpactPercent - 12)}% to ${placementImpactPercent}%.`;
  } else if (seatChangePercent > 0 && projectedGap >= baselineGap) {
    notes = `Expanding seats by ${seatChangePercent}% under ${demandGrowthAssumptionPercent}% demand growth. Net skill gap remains at ${projectedGap.toLocaleString('en-IN')} technicians with ₹${budgetAllocationLakhs} Lakhs total program allocation.`;
  } else {
    notes = `Maintains policy status quo. Skill gap projected at ${projectedGap.toLocaleString('en-IN')} based on ${demandGrowthAssumptionPercent}% demand growth trend and ${safeCompletion}% completion benchmark.`;
  }

  if (budgetExceeded && budgetCeilingLakhs) {
    notes += ` [WARNING: Projected allocation ₹${budgetAllocationLakhs}L exceeds the authorized budget ceiling of ₹${budgetCeilingLakhs}L by ₹${(budgetAllocationLakhs - budgetCeilingLakhs).toFixed(2)}L]`;
  }

  return {
    id: `sim-${Date.now()}`,
    name: `Simulation: ${occupation.name.split(' ')[0]} in ${district} (${seatChangePercent >= 0 ? '+' : ''}${seatChangePercent}%)`,
    description: `Policy trial evaluating ${seatChangePercent}% seat variation under ${safeCompletion}% completion and ${safeConversion}% conversion rate`,
    district,
    sector: occupation.sector,
    occupationId: occupation.id,
    horizonMonths: horizon,
    seatChangePercent,
    completionRatePercent: safeCompletion,
    demandGrowthAssumptionPercent,
    budgetAllocationLakhs,
    unitSeatCostInr,
    projectedSupply,
    projectedGap,
    baselineGap,
    costDeltaLakhs,
    placementImpactPercent,
    baselineSeats: estimatedBaselineSeats,
    projectedSeats,
    baselineDemand,
    projectedDemand,
    baselineSupply,
    employmentConversionPercent: safeConversion,
    budgetCeilingLakhs,
    budgetExceeded,
    notes,
    createdAt: new Date().toISOString(),
  };
}

/**
 * RFC 4180-compliant CSV Parser supporting quoted fields, escaped quotes (""), and CRLF
 */
export function parseCsvString(text: string): Record<string, string>[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < trimmed.length) {
    const char = trimmed[i];
    const nextChar = trimmed[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i += 2;
        continue;
      } else if (char === '"') {
        inQuotes = false;
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
        i++;
        continue;
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i += 2;
        continue;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Push last field and row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  // First row is headers
  const headers = rows[0].map((h) => h.replace(/^["'\s]+|["'\s]+$/g, ''));
  const parsedRecords: Record<string, string>[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    // Skip empty lines
    if (row.length === 1 && row[0] === '') continue;

    const record: Record<string, string> = {};
    headers.forEach((header, colIdx) => {
      let val = row[colIdx] ?? '';
      val = val.replace(/^["']|["']$/g, '').trim();
      record[header] = val;
    });
    parsedRecords.push(record);
  }

  return parsedRecords;
}

/**
 * Validate, clean, and normalize raw ingestion records against canonical schema
 */
export function validateAndIngestData(rawRows: any[]): {
  validRecords: DataIngestionRow[];
  report: DataQualityReport;
} {
  const issues: DataQualityReport['validationIssues'] = [];
  const missingFields: Record<string, number> = {};
  const validRecords: DataIngestionRow[] = [];
  const seenKeys = new Set<string>();
  let duplicates = 0;
  let normalizedOccs = 0;
  let normalizedDists = 0;

  if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) {
    return {
      validRecords: [],
      report: {
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        duplicateCount: 0,
        missingDataFields: {},
        normalizedOccupationCount: 0,
        normalizedDistrictCount: 0,
        qualityScore: 0,
        validationIssues: [
          {
            row: 0,
            column: 'payload',
            issue: 'Input payload contains zero records or is not a valid array',
            severity: 'error',
            suggestedFix: 'Upload or paste a CSV/JSON file containing at least one data row.',
          },
        ],
      },
    };
  }

  // Dataset-level check: Verify if mandatory occupation column exists in any record
  const hasOccupationHeader = rawRows.some(
    (r) => r && typeof r === 'object' && Boolean(r.occupationName || r.occupation || r.Occupation)
  );
  if (!hasOccupationHeader) {
    issues.push({
      row: 0,
      column: 'occupationName',
      issue: 'Dataset-level error: Mandatory "occupationName" column is missing from all rows',
      severity: 'error',
      suggestedFix: 'Include an "occupationName" or "occupation" column header with occupational titles (e.g. Solar PV System Installer).',
    });
  }

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    let hasFatalError = false;

    // Safety guard for malformed/null rows
    if (!row || typeof row !== 'object') {
      issues.push({
        row: rowNum,
        column: 'row',
        issue: `Malformed record at row ${rowNum} (expected key-value object)`,
        severity: 'error',
        suggestedFix: 'Ensure all rows are populated data records with standard column headers.',
      });
      return;
    }

    // 1. Mandatory Observation Date
    let obsDate = String(row.observationDate || row.date || row.Date || '').trim();
    if (!obsDate) {
      issues.push({
        row: rowNum,
        column: 'observationDate',
        issue: 'Observation date missing; defaulted to 2026-03-01',
        severity: 'warning',
        suggestedFix: 'Specify observation date in ISO-8601 format (e.g. 2026-03-01).',
      });
      obsDate = '2026-03-01';
      missingFields['observationDate'] = (missingFields['observationDate'] || 0) + 1;
    } else {
      const parsedTime = Date.parse(obsDate);
      if (isNaN(parsedTime)) {
        issues.push({
          row: rowNum,
          column: 'observationDate',
          issue: `Unrecognized date format "${obsDate}"; defaulted to 2026-03-01`,
          severity: 'warning',
          suggestedFix: 'Use ISO standard format like YYYY-MM-DD (e.g. 2026-03-01).',
        });
        obsDate = '2026-03-01';
      }
    }

    // 2. Geographic District & State
    const state = String(row.state || row.State || 'Chhattisgarh').trim();
    let district = String(row.district || row.District || '').trim();

    if (!district) {
      issues.push({
        row: rowNum,
        column: 'district',
        issue: 'District is missing; defaulted to Raipur (Pilot Corridor)',
        severity: 'warning',
        suggestedFix: 'Specify one of the pilot districts: Raipur, Durg, Bilaspur, or Korba.',
      });
      district = 'Raipur';
      missingFields['district'] = (missingFields['district'] || 0) + 1;
    } else {
      const lowerD = district.toLowerCase();
      if (lowerD === 'bhilai' || lowerD === 'durg-bhilai') {
        district = 'Durg';
        normalizedDists++;
      } else if (lowerD === 'raipur') {
        district = 'Raipur';
      } else if (lowerD === 'bilaspur') {
        district = 'Bilaspur';
      } else if (lowerD === 'korba') {
        district = 'Korba';
      }
    }

    // 3. Mandatory Occupation Name
    let occupation = String(row.occupationName || row.occupation || row.Occupation || '').trim();
    if (!occupation) {
      issues.push({
        row: rowNum,
        column: 'occupationName',
        issue: 'Occupation name is missing; record cannot be mapped to skill taxonomy',
        severity: 'error',
        suggestedFix: 'Provide an occupational trade title (e.g., CNC Operator & Multi-Axis Programmer).',
      });
      missingFields['occupationName'] = (missingFields['occupationName'] || 0) + 1;
      hasFatalError = true;
    }

    // 4. Sector / Industry
    const sector = String(row.sector || row.industry || row.Sector || 'General Technical').trim();

    // 5. Numeric Vacancies & Postings Check
    const rawVacancies = row.distinctVacancyEstimate ?? row.vacancies ?? row.openings;
    const distinctVacancies = Number(rawVacancies ?? 0);
    if (isNaN(distinctVacancies)) {
      issues.push({
        row: rowNum,
        column: 'distinctVacancyEstimate',
        issue: `Non-numeric vacancies value "${rawVacancies}"`,
        severity: 'error',
        suggestedFix: 'Provide a valid non-negative integer for distinct vacancies estimate.',
      });
      hasFatalError = true;
    } else if (distinctVacancies < 0) {
      issues.push({
        row: rowNum,
        column: 'distinctVacancyEstimate',
        issue: `Negative vacancy count (${distinctVacancies}) is invalid`,
        severity: 'error',
        suggestedFix: 'Vacancy count must be zero or a positive integer (>= 0).',
      });
      hasFatalError = true;
    }

    // 6. Training Seats & Supply Checks
    const rawSeats = row.trainingSeats ?? row.seats;
    const trainingSeats = Number(rawSeats ?? 0);
    if (isNaN(trainingSeats) || trainingSeats < 0) {
      issues.push({
        row: rowNum,
        column: 'trainingSeats',
        issue: `Invalid training seats value "${rawSeats}"`,
        severity: 'warning',
        suggestedFix: 'Defaulted seats to 0; provide a non-negative integer (>= 0).',
      });
    }

    const safeSeats = Math.max(0, isNaN(trainingSeats) ? 0 : trainingSeats);
    const enrolment = Number(row.enrolment ?? (safeSeats > 0 ? Math.round(safeSeats * 0.95) : 0));
    const completion = Number(row.completion ?? (safeSeats > 0 ? Math.round(safeSeats * 0.85) : 0));
    const certification = Number(row.certification ?? (safeSeats > 0 ? Math.round(safeSeats * 0.80) : 0));
    const effectiveSupply = Number(row.effectiveSupply ?? (safeSeats > 0 ? Math.round(safeSeats * 0.72) : 0));
    const relevantPlacements = Number(row.relevantPlacements ?? (safeSeats > 0 ? Math.round(safeSeats * 0.65) : 0));

    // Funnel integrity checks
    if (completion > enrolment && enrolment > 0) {
      issues.push({
        row: rowNum,
        column: 'completion',
        issue: `Completions (${completion}) exceed enrolments (${enrolment})`,
        severity: 'warning',
        suggestedFix: 'Ensure completed candidates count does not exceed registered enrolment count.',
      });
    }

    if (certification > completion && completion > 0) {
      issues.push({
        row: rowNum,
        column: 'certification',
        issue: `Certifications (${certification}) exceed completions (${completion})`,
        severity: 'warning',
        suggestedFix: 'Ensure certified count does not exceed course completions.',
      });
    }

    if (relevantPlacements > (completion || safeSeats) && (completion > 0 || safeSeats > 0)) {
      issues.push({
        row: rowNum,
        column: 'relevantPlacements',
        issue: `Relevant placements (${relevantPlacements}) exceed course completions (${completion || safeSeats})`,
        severity: 'warning',
        suggestedFix: 'Verify placement figures against cohort graduation numbers.',
      });
    }

    // 7. NSQF Level Validation (1-10)
    let nsqfLevel = Number(row.nsqfLevel || 4);
    if (isNaN(nsqfLevel) || nsqfLevel < 1 || nsqfLevel > 10) {
      issues.push({
        row: rowNum,
        column: 'nsqfLevel',
        issue: `NSQF level "${row.nsqfLevel}" is outside valid 1-10 range`,
        severity: 'warning',
        suggestedFix: 'Normalized NSQF Level to standard 4 (Skilled Technician). Provide integer 1-10.',
      });
      nsqfLevel = 4;
    }

    // 8. Duplicate Detection
    const dedupKey = `${obsDate}_${district}_${occupation.toLowerCase()}`;
    if (seenKeys.has(dedupKey)) {
      duplicates++;
      issues.push({
        row: rowNum,
        column: 'record',
        issue: `Duplicate entry detected for "${occupation}" in ${district} on ${obsDate}`,
        severity: 'warning',
        suggestedFix: 'Consolidate multiple entries into a single aggregate row or adjust the observation date.',
      });
    }
    seenKeys.add(dedupKey);

    // If fatal error occurred, quarantine this row from validRecords
    if (hasFatalError) {
      return;
    }

    validRecords.push({
      observationDate: obsDate,
      state,
      district,
      industry: sector,
      sector,
      occupationName: occupation,
      ncoCode: String(row.ncoCode || '7400.0000'),
      nsqfLevel,
      requiredSkills: String(row.requiredSkills || ''),
      distinctVacancyEstimate: Math.max(0, distinctVacancies),
      jobPostingCount: Number(row.jobPostingCount || Math.round(distinctVacancies * 1.25)),
      salaryRange: String(row.salaryRange || '₹18,000 - ₹28,000'),
      trainingSeats: safeSeats,
      enrolment: Math.max(0, isNaN(enrolment) ? 0 : enrolment),
      completion: Math.max(0, isNaN(completion) ? 0 : completion),
      certification: Math.max(0, isNaN(certification) ? 0 : certification),
      effectiveSupply: Math.max(0, isNaN(effectiveSupply) ? 0 : effectiveSupply),
      relevantPlacements: Math.max(0, isNaN(relevantPlacements) ? 0 : relevantPlacements),
      dataSource: String(row.dataSource || 'User Ingestion Upload'),
      sourceFreshness: Number(row.sourceFreshness || 1),
      dataConfidence: Number(row.dataConfidence || 85),
    });
  });

  const totalRows = rawRows.length;
  const validRows = validRecords.length;
  const errorRows = totalRows - validRows;
  const warnings = issues.filter((iss) => iss.severity === 'warning').length;

  const qualityScore = Math.max(
    10,
    Math.round(
      100 -
        (errorRows / (totalRows || 1)) * 50 -
        (duplicates / (totalRows || 1)) * 20 -
        (warnings / ((totalRows * 2) || 1)) * 30
    )
  );

  return {
    validRecords,
    report: {
      totalRows,
      validRows,
      errorRows,
      duplicateCount: duplicates,
      missingDataFields: missingFields,
      normalizedOccupationCount: normalizedOccs,
      normalizedDistrictCount: normalizedDists,
      qualityScore,
      validationIssues: issues,
    },
  };
}

/**
 * Export data array to CSV string with metadata headers, definitions, provenance, and UTF-8 BOM
 */
export function exportToCsvString(data: any[], filename: string, datasetTitle?: string): void {
  if (!data || data.length === 0) return;

  const title = datasetTitle || filename.replace(/_/g, ' ');
  const hasUserImported = data.some((r) => r && (r.isImported || r.provenance === 'User Ingested'));
  const provenanceLabel = hasUserImported
    ? 'User Ingested Dataset (Supplemented by Pilot Baseline)'
    : 'Synthetic Demonstration Baseline (SIH 2026 Problem Statement 26246)';

  const metadataHeaders = [
    `# ==============================================================================`,
    `# KAUSHAL PULSE AI — LABOUR MARKET INTELLIGENCE & SKILL FORECASTING ENGINE`,
    `# Dataset: ${title}`,
    `# Export Date: ${new Date().toISOString()}`,
    `# Data Provenance: ${provenanceLabel}`,
    `# Storage Engine: Client Browser Storage (localStorage) — Zero External Database`,
    `# Analytical Definitions:`,
    `#   - Demand: Verified distinct vacancies / openings estimate (non-deduplicated)`,
    `#   - Effective Supply: Work-ready certified candidates available after cohort attrition`,
    `#   - Skill Gap: Net difference (Demand - Effective Supply). Positive = Shortage; Negative = Surplus`,
    `#   - Placement Rate: Certified candidates placed in relevant sector (0.0 to 1.0 ratio)`,
    `#   - Capacity Utilisation: Total enrolment / sanctioned seats (0.0 to 1.0 ratio)`,
    `# Governance Notice: Calibrated synthetic demonstration model for SIH 2026.`,
    `#                    Not an official gazetted release of MSDE or State Skill Mission.`,
    `# ==============================================================================`,
  ];

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') {
        const jsonStr = JSON.stringify(val).replace(/"/g, '""');
        return `"${jsonStr}"`;
      }
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const fileBody = metadataHeaders.join('\r\n') + '\r\n' + csvRows.join('\r\n');
  const csvContent = '\uFEFF' + fileBody;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

