// src/features/footprint-calculator/lib/model/footprint.types.ts
export interface BreakdownItem {
  name: string;
  amount: number;
  emission: number;
}

export interface FootprintCalculationRequest {
  car_km: number;
  bus_km: number;
  electricity_kwh: number;
  meat_meals: number;
  veg_meals: number;
}

export interface FootprintCalculationResponse {
  total_emission: number;
  breakdown: BreakdownItem[];
}

export interface ExplanationRequest {
  car_km?: number;
  bus_km?: number;
  electricity_kwh?: number;
  meat_meals?: number;
  veg_meals?: number;
}

export interface ExplanationResponse {
  explanation: string;
  tips: string[];
}
