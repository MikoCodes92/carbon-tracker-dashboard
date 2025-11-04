// src/features/footprint-calculator/hooks/useCalculatorStore.ts
import { useState } from "react";
import type {
  FootprintCalculationRequest,
  ExplanationResponse,
} from "@/entities/footprint";
import {
  calculatorApi,
  type EnhancedFootprintResponse,
} from "../lib/calculator.api";

export const useCalculatorStore = () => {
  const [calculation, setCalculation] = useState<FootprintCalculationRequest>({
    car_km: 0,
    bus_km: 0,
    electricity_kwh: 0,
    meat_meals: 0,
    veg_meals: 0,
  });

  const [result, setResult] = useState<EnhancedFootprintResponse | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCalculation = (
    field: keyof FootprintCalculationRequest,
    value: number
  ) => {
    setCalculation((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const calculateFootprint = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await calculatorApi.calculateFootprint(calculation);
      setResult(response);
      setExplanation(null);

      // Log detailed analysis for debugging
      console.log("Enhanced footprint analysis:", {
        totalEmission: response.total_emission,
        breakdown: response.breakdown,
        insights: response.insights,
        warnings: response.climatiq_warnings,
        factors: response.debug_factors,
      });
    } catch (err: unknown) {
      let message = "Failed to calculate carbon footprint";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      setError(message);
      console.error("Enhanced calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getExplanation = async () => {
    if (!result) return;

    setLoading(true);
    setError(null);
    try {
      const response = await calculatorApi.getExplanation({
        ...calculation,
        current_result: result,
      });
      setExplanation(response);
    } catch (err: unknown) {
      let message = "Failed to generate AI insights";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      setError(message);
      console.error("Explanation generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setCalculation({
      car_km: 0,
      bus_km: 0,
      electricity_kwh: 0,
      meat_meals: 0,
      veg_meals: 0,
    });
    setResult(null);
    setExplanation(null);
    setError(null);
  };

  return {
    calculation,
    result,
    explanation,
    loading,
    error,
    updateCalculation,
    calculateFootprint,
    getExplanation,
    resetCalculator,
  };
};
