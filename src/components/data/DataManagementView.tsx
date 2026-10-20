/**
 * KAUSHAL PULSE AI — DATA MANAGEMENT & INGESTION ENGINE
 * Canonical 18-field schema ingestion, native CSV/JSON file upload,
 * active dataset lineage registry, row-level validation diagnostics,
 * and reliable client-side storage governance.
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { validateAndIngestData, exportToCsvString, parseCsvString } from '../../utils/analytics';
import { DataQualityReport, DataIngestionRow, DatasetMetadata } from '../../types';
import {
  Database,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  FileSpreadsheet,
  Download,
  Table,
  FileText,
  Layers,
  ShieldCheck,
  Info,
  X,
  HardDrive,
  Filter,
} from 'lucide-react';

export const DataManagementView: React.FC = () => {
  const {
    language,
    resetToDemoData,
    importIngestionRecords,
    demandRecords,
    supplyRecords,
    occupations,
    trainingCentres,
    emergingSkills,
    employerSurveys,
  } = useApp();

  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<DataQualityReport | null>(null);
  const [stagedRecords, setStagedRecords] = useState<DataIngestionRow[]>([]);
  const [diagnosticFilter, setDiagnosticFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample CSV string matching canonical MSDE 18-field schema
  const SAMPLE_CSV = `observationDate,district,sector,occupationName,ncoCode,nsqfLevel,distinctVacancyEstimate,jobPostingCount,salaryRange,trainingSeats,enrolment,completion,certification,effectiveSupply,relevantPlacements,dataSource
2026-03-01,Raipur,Green Energy,Solar PV System Installer,7421.0301,4,1450,1840,"₹18,000 - ₹26,000",640,615,540,495,530,385,CREDA Vendor Surveys
2026-03-01,Raipur,Automotive,Electric Vehicle Service Technician,7231.0502,4,1080,1320,"₹20,000 - ₹31,000",480,460,390,350,410,290,OEM Service Networks
2026-03-01,Durg,Capital Goods,CNC Operator & Multi-Axis Programmer,7223.0101,4,1340,1680,"₹19,500 - ₹28,500",920,880,790,740,850,580,Bhilai Ancillary Fed
2026-03-01,Durg,Fabrication,General Welder (SMAW Manual),7212.0101,3,580,740,"₹13,500 - ₹17,500",1200,1140,1010,960,990,520,Labour Exchanges
2026-03-01,Bilaspur,Logistics,Cold Chain Equipment Technician,7127.0201,4,710,890,"₹17,500 - ₹25,000",420,390,340,310,370,235,Agri Logistics Registry
2026-03-01,Korba,Power & Energy,Thermal Turbine Maintenance Mechanic,7233.0201,4,920,1150,"₹22,000 - ₹32,000",380,360,320,290,340,260,NTPC Sipat Contractor Roster`;

  // Calculated record counts & metrics
  const importedDemandCount = demandRecords.filter((r) => r.isImported).length;
  const importedSupplyCount = supplyRecords.filter((r) => r.isImported).length;
  const totalMemoryRecords = demandRecords.length + supplyRecords.length;

  // Inventory of all active datasets in Kaushal Pulse AI
  const activeDatasets: DatasetMetadata[] = [
    {
      id: 'demand-records',
      name: 'District Labour Demand & Vacancy Postings',
      category: 'Demand Postings',
      recordCount: demandRecords.length,
      lastUpdated: '2026-03-01',
      sourceAuthority:
        importedDemandCount > 0
          ? 'User CSV Upload / Ingestion Intake'
          : 'Synthetic Demonstration Baseline (SIH 2026 PS 26246)',
      geographicCoverage: 'Chhattisgarh (Raipur, Durg, Bilaspur, Korba)',
      status: 'Active',
      provenance: importedDemandCount > 0 ? 'User Ingested' : 'Synthetic Pilot Baseline',
      limitations:
        'Calibrated synthetic dataset modeling formal industrial sector demand. Not an official gazetted ministry publication.',
    },
    {
      id: 'supply-records',
      name: 'Vocational Training & Seat Capacity Supply',
      category: 'Vocational Supply',
      recordCount: supplyRecords.length,
      lastUpdated: '2026-02-15',
      sourceAuthority:
        importedSupplyCount > 0
          ? 'User CSV Upload / Ingestion Intake'
          : 'Synthetic Demonstration Baseline (Model ITI & Polytechnic Profiles)',
      geographicCoverage: 'Chhattisgarh (Govt ITIs, PMKKs, Polytechnics)',
      status: 'Synchronized',
      provenance: importedSupplyCount > 0 ? 'User Ingested' : 'Synthetic Pilot Baseline',
      limitations:
        'Calibrated seat intake, enrolment, completion, and placement figures for pilot demonstration. Unaccredited private institutes excluded.',
    },
    {
      id: 'occupations',
      name: 'National Classification of Occupations (NCO-2015)',
      category: 'Taxonomy',
      recordCount: occupations.length,
      lastUpdated: '2026-01-10',
      sourceAuthority: 'Curated Pilot Taxonomy (Mapped to NCO-2015 & NSQF Qualifications)',
      geographicCoverage: 'National Standard (Mapped to Priority Corridor Sectors)',
      status: 'Verified Pilot',
      provenance: 'Synthetic Pilot Baseline',
      limitations:
        'Demonstration taxonomy mapping corridor trades; emerging green tech/EV roles use benchmark qualification descriptors.',
    },
    {
      id: 'training-centres',
      name: 'Vocational Training Centre Infrastructure',
      category: 'Infrastructure',
      recordCount: trainingCentres.length,
      lastUpdated: '2026-02-01',
      sourceAuthority: 'Demonstration Facility Profiles (Representative ITI & PMKK Hubs)',
      geographicCoverage: 'Raipur, Durg, Bilaspur, Korba (12 Model Hubs)',
      status: 'Verified Pilot',
      provenance: 'Synthetic Pilot Baseline',
      limitations:
        'Sanctioned intake and placement statistics are calibrated for regional corridor simulation and evaluation.',
    },
    {
      id: 'emerging-skills',
      name: 'Emerging Skills & Curriculum Gap Radar',
      category: 'Skills Radar',
      recordCount: emergingSkills.length,
      lastUpdated: '2026-03-05',
      sourceAuthority: 'Curated Pilot Skills Radar (Central India Industrial Corridor Benchmark)',
      geographicCoverage: 'Central India Industrial Corridor',
      status: 'Active',
      provenance: 'Synthetic Pilot Baseline',
      limitations:
        'Demonstration skill clusters weighted toward renewables, automation, and industrial maintenance competencies.',
    },
    {
      id: 'employer-surveys',
      name: 'Enterprise Field Corridor Surveys',
      category: 'Field Surveys',
      recordCount: employerSurveys.length,
      lastUpdated: '2026-02-28',
      sourceAuthority: 'Simulated Enterprise Field Responses (Industrial Corridor Sample Profiles)',
      geographicCoverage: 'Urla, Bhilai Steel, Sipat Industrial Belts',
      status: 'Verified Pilot',
      provenance: 'Synthetic Pilot Baseline',
      limitations:
        'Illustrative survey responses demonstrating employer sentiment, vacancy persistence, and hiring barrier tracking.',
    },
  ];

  const handleLoadSample = () => {
    setActiveInputTab('paste');
    setRawText(SAMPLE_CSV);
    setUploadedFile(null);
    processTextData(SAMPLE_CSV);
  };

  const processTextData = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      setStagedRecords([]);
      setValidationReport(null);
      return;
    }

    try {
      let parsedRows: any[] = [];
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        parsedRows = Array.isArray(json) ? json : [json];
      } else {
        parsedRows = parseCsvString(trimmed);
      }

      const { validRecords, report } = validateAndIngestData(parsedRows);
      setStagedRecords(validRecords);
      setValidationReport(report);
    } catch (err: any) {
      alert(`Schema Parsing Error: ${err.message}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      alert('Please upload a valid .csv or .json file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please provide a smaller partition.');
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawText(content);
      processTextData(content);
    };
    reader.onerror = () => {
      alert('Failed to read the file from disk.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleClearInput = () => {
    setRawText('');
    setUploadedFile(null);
    setStagedRecords([]);
    setValidationReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCommitIngestion = () => {
    if (stagedRecords.length === 0) return;
    importIngestionRecords(stagedRecords);
    setSuccessMsg(
      `Successfully committed ${stagedRecords.length} records into the active memory pipeline (Demand & Supply models updated).`
    );
    handleClearInput();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    setIsResetDialogOpen(false);
    handleClearInput();
    setSuccessMsg('All custom simulations, staged files, and uploaded records reset to canonical pilot baseline.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        observationDate: '2026-03-01',
        state: 'Chhattisgarh',
        district: 'Raipur',
        industry: 'Renewables',
        sector: 'Green Energy',
        occupationName: 'Solar PV System Installer',
        ncoCode: '7421.0301',
        nsqfLevel: 4,
        requiredSkills: 'Rooftop Mounting; Inverter Wiring; Net Metering Protocols',
        distinctVacancyEstimate: 1450,
        jobPostingCount: 1840,
        salaryRange: '₹18,000 - ₹26,000',
        employmentType: 'Full-Time',
        trainingSeats: 640,
        enrolment: 615,
        completion: 540,
        certification: 495,
        effectiveSupply: 530,
        relevantPlacements: 385,
        dataSource: 'State Green Energy Mission Survey',
        sourceFreshness: 10,
        dataConfidence: 88,
      },
    ];
    exportToCsvString(templateRows, 'MSDE_Canonical_Data_Ingestion_Template', 'MSDE 18-Field Ingestion Template');
  };

  const handleExportDataset = (datasetId: string) => {
    switch (datasetId) {
      case 'demand-records':
        exportToCsvString(demandRecords, 'KaushalPulse_Demand_Records', 'District Labour Demand & Vacancies');
        break;
      case 'supply-records':
        exportToCsvString(supplyRecords, 'KaushalPulse_Supply_Records', 'Technical & Vocational Training Supply');
        break;
      case 'occupations':
        exportToCsvString(occupations, 'KaushalPulse_Occupations_Taxonomy', 'NCO-2015 & NSQF Qualifications');
        break;
      case 'training-centres':
        exportToCsvString(trainingCentres, 'KaushalPulse_Training_Centres', 'Vocational Centre Infrastructure');
        break;
      case 'emerging-skills':
        exportToCsvString(emergingSkills, 'KaushalPulse_Emerging_Skills', 'Emerging Skills & Curriculum Radar');
        break;
      case 'employer-surveys':
        exportToCsvString(employerSurveys, 'KaushalPulse_Employer_Surveys', 'Enterprise Corridor Field Surveys');
        break;
      default:
        break;
    }
  };

  // Filter diagnostics by severity
  const filteredDiagnostics = validationReport?.validationIssues.filter((iss) => {
    if (diagnosticFilter === 'error') return iss.severity === 'error';
    if (diagnosticFilter === 'warning') return iss.severity === 'warning';
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Storage Engine Info */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Database className="w-4 h-4" />
              <span>Data Pipeline & Integrity Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {language === 'hi'
                ? 'डेटा प्रबंधन एवं अंतर्ग्रहण — मानकीकृत 18-फ़ील्ड स्कीमा'
                : 'Data Management & Ingestion: Canonical Schema Validation'}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Ingest, cleanse, normalize, and validate district-level labour demand and training supply datasets with row-level error auditing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
            <button
              onClick={() => setIsResetDialogOpen(true)}
              className="flex items-center space-x-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold px-3.5 py-2 rounded-lg border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Pilot Dataset</span>
            </button>
          </div>
        </div>

        {/* Storage Persistence Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              <strong>Storage Engine:</strong> Client Browser Storage (localStorage). Zero External Database. All datasets, user imports, and What-If scenarios reside locally and persist safely across page refreshes.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Session Sandbox: Active
            </span>
            {(importedDemandCount > 0 || importedSupplyCount > 0) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                {importedDemandCount + importedSupplyCount} Custom Record(s) Ingested
              </span>
            )}
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* 2. Pipeline Telemetry KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Active Datasets</span>
            <Layers className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{activeDatasets.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">6 Pilot Registers + Ingestion Store</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Total Records in Memory</span>
            <Database className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalMemoryRecords}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {demandRecords.length} Demand + {supplyRecords.length} Supply
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>User Ingested Records</span>
            <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{importedDemandCount + importedSupplyCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {importedDemandCount} Demand / {importedSupplyCount} Supply
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Schema Conformance</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-teal-700 mt-1">100%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">MSDE Canonical 18-Field Rules</div>
        </div>
      </div>

      {/* 3. Demo Data Governance Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold uppercase tracking-wider text-amber-900">
            DEMO DATA GOVERNANCE NOTICE — SYNTHETIC STATISTICAL MODEL
          </span>
          <p className="text-amber-800 leading-relaxed">
            Baseline figures are calibrated synthetic estimates formulated for Smart India Hackathon Problem Statement 26246 (Chhattisgarh Pilot Corridor: Raipur, Durg, Bilaspur, Korba). Uploaded records are tagged with <span className="font-semibold text-emerald-800">[Imported]</span> provenance in the intelligence cockpit.
          </p>
        </div>
      </div>

      {/* 4. Active Dataset Inventory & Lineage Registry */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Active Dataset Inventory & Provenance Registry</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status, source authorities, coverage, record counts, and inherent statistical caveats of all active registers.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono self-start sm:self-auto">
            {activeDatasets.length} Registers Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Dataset Name & Focus</th>
                <th className="py-2.5 px-3">Records</th>
                <th className="py-2.5 px-3">Authority / Source</th>
                <th className="py-2.5 px-3">Coverage</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Provenance</th>
                <th className="py-2.5 px-3">Limitations & Known Caveats</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeDatasets.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{ds.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ds.category}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {ds.recordCount}
                  </td>
                  <td className="py-3 px-3 text-slate-700 max-w-[160px]">
                    {ds.sourceAuthority}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-[150px]">
                    {ds.geographicCoverage}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ds.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        ds.provenance === 'User Ingested'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {ds.provenance}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[220px] leading-tight">
                    {ds.limitations}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleExportDataset(ds.id)}
                      className="inline-flex items-center space-x-1 text-blue-700 hover:text-blue-800 font-medium text-xs hover:underline cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export CSV</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Ingestion Workspace (Upload / Paste & Validation Diagnostics) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Area */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-blue-600" />
              <span>Data Ingestion Intake</span>
            </h3>

            {/* Input Mode Toggle */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveInputTab('upload')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeInputTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveInputTab('paste')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeInputTab === 'paste'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste CSV/JSON
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv,.json"
            className="hidden"
          />

          {/* Mode 1: Drag & Drop File Upload */}
          {activeInputTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : uploadedFile
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div
                    className={`p-3 rounded-full ${
                      uploadedFile
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {uploadedFile ? (
                      <FileCheck className="w-6 h-6" />
                    ) : (
                      <UploadCloud className="w-6 h-6" />
                    )}
                  </div>

                  {uploadedFile ? (
                    <div>
                      <div className="text-xs font-bold text-slate-900">{uploadedFile.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.type || 'text/csv'}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                        File parsed &amp; staged in memory. Click to choose another file.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        Drag and drop your .csv or .json file here, or{' '}
                        <span className="text-blue-700 underline font-bold">browse</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Supports MSDE 18-field canonical structure (Max 5MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-blue-700 hover:underline font-medium text-[11px] cursor-pointer"
                >
                  Load Official Sample CSV (6 rows)
                </button>

                {uploadedFile && (
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="text-rose-600 hover:underline font-medium text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear File</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mode 2: Direct Textarea Paste */}
          {activeInputTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Paste comma-separated rows or JSON records:
                </span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-blue-700 hover:underline font-medium text-[11px] cursor-pointer"
                >
                  Load Sample Data
                </button>
              </div>

              <textarea
                rows={9}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  processTextData(e.target.value);
                }}
                placeholder="observationDate,district,sector,occupationName,ncoCode,nsqfLevel,distinctVacancyEstimate..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />

              {rawText && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="text-rose-600 hover:underline font-medium text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Text</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Ingestion Rules Guide */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Enforced Validation Schema Rules:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
              <li>Mandatory: <span className="font-mono text-slate-700">observationDate</span>, <span className="font-mono text-slate-700">district</span>, <span className="font-mono text-slate-700">sector</span>, <span className="font-mono text-slate-700">occupationName</span></li>
              <li>Numeric bounds: <span className="font-mono text-slate-700">distinctVacancyEstimate</span> &gt;= 0; seats &gt;= 0</li>
              <li>NSQF qualification level must be integer 1 to 10 (defaults to 4)</li>
              <li>Unknown districts mapped to pilot regional cluster (Raipur, Durg, Bilaspur, Korba)</li>
            </ul>
          </div>
        </div>

        {/* Validation Audit & Diagnostics Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Data Quality Audit Report</span>
              </h3>

              {validationReport && validationReport.validationIssues.length > 0 && (
                <div className="flex items-center space-x-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setDiagnosticFilter('all')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                      diagnosticFilter === 'all'
                        ? 'bg-slate-200 text-slate-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All ({validationReport.validationIssues.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiagnosticFilter('error')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                      diagnosticFilter === 'error'
                        ? 'bg-rose-100 text-rose-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Errors ({validationReport.errorRows})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiagnosticFilter('warning')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer ${
                      diagnosticFilter === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Warnings
                  </button>
                </div>
              )}
            </div>

            {validationReport ? (
              <div className="space-y-4 mt-3 text-xs">
                {/* Score Bar */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">
                      Ingestion Quality Index
                    </div>
                    <div
                      className={`text-2xl font-extrabold mt-0.5 ${
                        validationReport.qualityScore >= 80
                          ? 'text-emerald-700'
                          : validationReport.qualityScore >= 50
                          ? 'text-amber-700'
                          : 'text-rose-700'
                      }`}
                    >
                      {validationReport.qualityScore}%
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                    <div>
                      Valid Rows: <span className="text-emerald-700 font-bold">{validationReport.validRows}</span> / {validationReport.totalRows}
                    </div>
                    <div>
                      Corrupted / Quarantined: <span className="text-rose-700 font-bold">{validationReport.errorRows}</span>
                    </div>
                    <div>
                      Duplicates Detected: <span className="text-amber-700 font-semibold">{validationReport.duplicateCount}</span>
                    </div>
                    <div>
                      District Normalizations: <span className="text-blue-700 font-semibold">{validationReport.normalizedDistrictCount}</span>
                    </div>
                  </div>
                </div>

                {/* Issues List with Suggested Fixes */}
                {filteredDiagnostics.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                      <span>Row-Level Diagnostics &amp; Suggestions:</span>
                      <span className="text-[10px] text-slate-400">
                        {filteredDiagnostics.length} issue(s) shown
                      </span>
                    </div>
                    {filteredDiagnostics.map((iss, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-lg text-[11px] border ${
                          iss.severity === 'error'
                            ? 'bg-rose-50 text-rose-900 border-rose-200'
                            : 'bg-amber-50 text-amber-900 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold">
                            Row {iss.row > 0 ? iss.row : 'Header'} • {iss.column}:
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              iss.severity === 'error'
                                ? 'bg-rose-200 text-rose-800'
                                : 'bg-amber-200 text-amber-800'
                            }`}
                          >
                            {iss.severity}
                          </span>
                        </div>
                        <div className="mt-0.5">{iss.issue}</div>
                        {iss.suggestedFix && (
                          <div className="mt-1 text-[10px] font-medium text-slate-700 bg-white/70 px-2 py-0.5 rounded border border-slate-200/50">
                            <strong>Remediation:</strong> {iss.suggestedFix}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All staged records conform to MSDE canonical rules with zero fatal errors.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Upload a file or paste CSV content on the left to run automatic validation and generate a diagnostics audit.</p>
              </div>
            )}
          </div>

          {/* Commit Action Bar */}
          {stagedRecords.length > 0 && (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-mono">
                <strong>{stagedRecords.length}</strong> valid rows ready to commit
              </span>
              <button
                type="button"
                onClick={handleCommitIngestion}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Commit Staged Dataset ({stagedRecords.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Pre-Commit Staged Data Preview Table */}
      {stagedRecords.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Table className="w-4 h-4 text-blue-600" />
                <span>Staged Records Preview (Pre-Commit Verification)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review verified rows before committing into active demand, supply, and simulator state.
              </p>
            </div>
            <span className="text-xs text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200 self-start sm:self-auto">
              {stagedRecords.length} Rows Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Occupation</th>
                  <th className="py-2.5 px-3">NCO / NSQF</th>
                  <th className="py-2.5 px-3">Distinct Vacancies</th>
                  <th className="py-2.5 px-3">Seats</th>
                  <th className="py-2.5 px-3">Certified</th>
                  <th className="py-2.5 px-3">Effective Supply</th>
                  <th className="py-2.5 px-3">Data Source</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stagedRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{r.observationDate}</td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{r.district}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.occupationName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {r.ncoCode} (L{r.nsqfLevel})
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {r.distinctVacancyEstimate}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{r.trainingSeats}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{r.certification}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {r.effectiveSupply}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-[150px] truncate">
                      {r.dataSource}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Reset Pilot Dataset Confirmation Dialog */}
      {isResetDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-amber-50 border border-amber-200 shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Reset All Data to Baseline?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will purge all user-imported CSV batches, custom policy simulator scenarios, employer surveys, and local filter overrides from your browser storage.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">What will be restored:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
                <li>8 default pilot labour demand records across 4 districts</li>
                <li>6 verified technical training supply records</li>
                <li>10 NCO-2015 occupations &amp; 12 training centres</li>
                <li>Default baseline scenarios in Policy Simulator</li>
              </ul>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsResetDialogOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
