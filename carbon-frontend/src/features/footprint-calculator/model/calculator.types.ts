// src/entities/footprint.ts

// Base request types
export interface FootprintCalculationRequest {
  car_km: number;
  bus_km: number;
  electricity_kwh: number;
  meat_meals: number;
  veg_meals: number;
}

export interface ExplanationRequest {
  car_km: number;
  bus_km: number;
  electricity_kwh: number;
  meat_meals: number;
  veg_meals: number;
  current_result?: EnhancedFootprintResponse;
}

// Core response types
export interface BreakdownItem {
  name: string;
  amount: number;
  emission: number;
  factor?: number;
  hasData?: boolean;
}

// Climatiq API specific types
export interface ClimatiqActivityData {
  activity_unit: string;
  activity_value: number;
}

export interface ClimatiqEmissionFactor {
  access_type: string;
  activity_id: string;
  category: string;
  data_quality_flags: string[];
  id: string;
  name: string;
  region: string;
  source: string;
  source_dataset: string;
  source_lca_activity: string;
  year: number;
}

export interface ClimatiqConstituentGases {
  ch4: number | null;
  co2: number | null;
  co2e_other: number | null;
  co2e_total: number;
  n2o: number | null;
}

export interface ClimatiqBatchResult {
  activity_data?: ClimatiqActivityData;
  audit_trail?: string;
  co2e?: number;
  co2e_calculation_method?: string;
  co2e_calculation_origin?: string;
  co2e_unit?: string;
  constituent_gases?: ClimatiqConstituentGases;
  emission_factor?: ClimatiqEmissionFactor;
  error?: string;
  error_code?: string;
  message?: string;
  notices: string[];
}

export interface ClimatiqBatch {
  results: ClimatiqBatchResult[];
}

export interface DebugFactors {
  [key: string]: number;
}

// Response analysis types
export interface ResponseAnalysis {
  insights: string[];
  recommendations?: string[];
  hasCalculationIssues: boolean;
  hasWarnings: boolean;
  successfulCalculations: number;
  failedCalculations: number;
  dataQuality: string;
}

// Main enhanced response type
export interface EnhancedFootprintResponse {
  total_emission: number;
  breakdown: BreakdownItem[];
  climatiq_batch?: ClimatiqBatch;
  climatiq_warnings?: string[];
  debug_factors?: DebugFactors;
  analysis: ResponseAnalysis;
  emission_level: {
    label: string;
    color: string;
    description: string;
  };
  calculated_at: string;
  data_version?: string;
  region?: string;
  raw_response?: unknown;
}

// Legacy response type
export interface FootprintCalculationResponse {
  total_emission: number;
  breakdown: BreakdownItem[];
}

// AI Explanation types
export interface AIResponse {
  assistant_text?: string;
  ai_parsed?: {
    summary: string;
    suggestions: string[];
  };
}

export interface ExplanationResponse {
  explanation: string;
  tips: string[];
  ai?: AIResponse;
  error?: string;
  raw_response?: unknown;
}

// Store state types
export interface CalculatorState {
  calculation: FootprintCalculationRequest;
  result: EnhancedFootprintResponse | null;
  explanation: ExplanationResponse | null;
  loading: boolean;
  error: string | null;
}

// Chart and visualization types
export interface ChartDataItem extends BreakdownItem {
  fill: string;
  hasData: boolean;
  factor?: number;
  percentage?: number;
}

export interface EmissionLevel {
  label: string;
  color: string;
  description: string;
  min: number;
  max: number;
}

// Export and share types
export interface ExportData {
  title: string;
  description?: string;
  data: unknown[];
  columns?: { key: string; label: string }[];
  fileName?: string;
  metadata?: {
    generatedAt: string;
    totalEmission: number;
    dataQuality: string;
  };
}

export interface ShareContent {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  image?: string;
  emissionData?: {
    total: number;
    level: string;
    breakdown: string[];
  };
}
