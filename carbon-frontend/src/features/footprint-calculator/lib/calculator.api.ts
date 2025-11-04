// src/features/footprint-calculator/lib/calculator.api.ts
import { apiClient } from "@/shared/api/client";
import type {
  FootprintCalculationRequest,
  FootprintCalculationResponse,
  BreakdownItem,
  ExplanationRequest,
  ExplanationResponse,
} from "@entities/footprint";

/**
 * Enhanced types to capture all API response data
 */
export interface EnhancedFootprintResponse
  extends FootprintCalculationResponse {
  climatiq_batch?: {
    results: Array<{
      activity_data?: {
        activity_unit: string;
        activity_value: number;
      };
      co2e?: number;
      co2e_unit?: string;
      emission_factor?: {
        name: string;
        category: string;
        region: string;
        source: string;
        year: number;
      };
      error?: string;
      error_code?: string;
      message?: string;
    }>;
  };
  climatiq_warnings?: string[];
  debug_factors?: {
    car: number;
    bus: number;
    electricity: number;
    meat: number;
    veg: number;
  };
  raw_response?: any; // Store the complete raw response
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toNumberSafe(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function mapToBreakdownItem(v: unknown): BreakdownItem {
  if (!isPlainObject(v)) {
    return { name: "Unknown", amount: 0, emission: 0 };
  }

  const obj = v as Record<string, unknown>;

  const name =
    typeof obj["name"] === "string" ? (obj["name"] as string) : "Unknown";
  const amount = toNumberSafe(obj["amount"]);
  const emission = toNumberSafe(obj["emission"]);

  return {
    name,
    amount,
    emission,
  };
}

export const calculatorApi = {
  async calculateFootprint(
    data: FootprintCalculationRequest
  ): Promise<EnhancedFootprintResponse> {
    try {
      const response = await apiClient.post("/calculate", data);
      const respData: unknown = response?.data ?? response;

      // Enhanced error handling with detailed messages
      if (isPlainObject(respData) && typeof respData["error"] === "string") {
        const errorMessage = respData["error"] as string;

        // Check if there are climatiq warnings that provide more context
        const climatiqWarnings = Array.isArray(respData["climatiq_warnings"])
          ? (respData["climatiq_warnings"] as string[])
          : [];

        if (climatiqWarnings.length > 0) {
          throw new Error(
            `${errorMessage}\n\nAdditional warnings:\n${climatiqWarnings.join(
              "\n"
            )}`
          );
        }

        throw new Error(errorMessage);
      }

      if (!isPlainObject(respData) || !Array.isArray(respData["breakdown"])) {
        throw new Error("Invalid response structure from server");
      }

      const rawBreakdown = respData["breakdown"] as unknown[];
      const breakdown: BreakdownItem[] = rawBreakdown.map(mapToBreakdownItem);
      const total_emission = toNumberSafe(respData["total_emission"]);

      // Extract additional information from the response
      const climatiq_batch = isPlainObject(respData["climatiq_batch"])
        ? respData["climatiq_batch"]
        : undefined;

      const climatiq_warnings = Array.isArray(respData["climatiq_warnings"])
        ? (respData["climatiq_warnings"] as string[])
        : [];

      const debug_factors = isPlainObject(respData["debug_factors"])
        ? (respData["debug_factors"] as {
            car: number;
            bus: number;
            electricity: number;
            meat: number;
            veg: number;
          })
        : undefined;

      // Analyze the response for insights
      const analysis = this.analyzeResponse(respData, data);

      return {
        total_emission,
        breakdown,
        climatiq_batch,
        climatiq_warnings,
        debug_factors,
        raw_response: respData,
        ...analysis,
      };
    } catch (err: unknown) {
      let message = "Failed to calculate carbon footprint";
      let details = "";

      try {
        if (err && typeof err === "object") {
          const e = err as Record<string, unknown>;

          if (e["response"] && isPlainObject(e["response"])) {
            const resp = e["response"] as Record<string, unknown>;
            const status = resp["status"] as number | undefined;
            const data = resp["data"] as unknown;

            if (typeof status === "number") {
              if (status === 400) {
                if (isPlainObject(data) && typeof data["error"] === "string") {
                  message = data["error"] as string;
                } else if (
                  isPlainObject(data) &&
                  Array.isArray(data["climatiq_warnings"])
                ) {
                  const warnings = (data["climatiq_warnings"] as string[]).join(
                    "; "
                  );
                  message = `Emission calculation issues: ${warnings}`;
                } else {
                  message = "Invalid input values or region not supported";
                }
              } else if (status === 404) {
                message = "Emission factors not available for your region";
              } else if (status === 500) {
                message = "Server error while calculating emissions";
              }

              // Extract additional details from response
              if (isPlainObject(data)) {
                if (Array.isArray(data["climatiq_warnings"])) {
                  details = (data["climatiq_warnings"] as string[]).join("\n");
                }
                if (typeof data["debug_factors"] === "object") {
                  details += `\nDebug factors: ${JSON.stringify(
                    data["debug_factors"]
                  )}`;
                }
              }
            }
          } else if (typeof (err as Error).message === "string") {
            message = (err as Error).message;
          }
        } else if (typeof err === "string") {
          message = err;
        }
      } catch (parseError) {
        console.warn("Error parsing API response:", parseError);
      }

      const fullMessage = details ? `${message}\n\n${details}` : message;
      console.error("Enhanced API Error:", fullMessage, err);
      throw new Error(fullMessage);
    }
  },

  /**
   * Analyze the API response to extract meaningful insights
   */
  analyzeResponse(respData: any, inputData: FootprintCalculationRequest) {
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Check for zero emissions despite having inputs
    const totalEmission = toNumberSafe(respData["total_emission"]);
    const hasInputs = Object.values(inputData).some((val) => val > 0);

    if (hasInputs && totalEmission === 0) {
      insights.push("⚠️ No emissions calculated despite having input data");

      // Check climatiq batch results for errors
      if (
        isPlainObject(respData["climatiq_batch"]) &&
        Array.isArray(respData["climatiq_batch"]["results"])
      ) {
        const errors = respData["climatiq_batch"]["results"]
          .filter((result: any) => result.error)
          .map((result: any) => result.message || result.error);

        if (errors.length > 0) {
          insights.push(`❌ Emission factor errors: ${errors.join(", ")}`);
          recommendations.push(
            "Try adjusting your inputs or select a different region"
          );
        }
      }
    }

    // Check debug factors
    if (isPlainObject(respData["debug_factors"])) {
      const factors = respData["debug_factors"];
      insights.push(
        `🔧 Using emission factors: Car ${factors.car}, Bus ${factors.bus}, Electricity ${factors.electricity}`
      );

      if (factors.electricity === 0) {
        recommendations.push(
          "Electricity emission factor is zero - this might indicate regional data limitations"
        );
      }
    }

    // Check for successful calculations
    if (
      isPlainObject(respData["climatiq_batch"]) &&
      Array.isArray(respData["climatiq_batch"]["results"])
    ) {
      const successful = respData["climatiq_batch"]["results"].filter(
        (r: any) => r.co2e !== undefined
      );
      if (successful.length > 0) {
        insights.push(
          `✅ ${successful.length} categories calculated successfully`
        );
      }
    }

    return {
      insights,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  },

  async getExplanation(data: ExplanationRequest): Promise<ExplanationResponse> {
    try {
      const response = await apiClient.post("/explain", data || {});
      const respData: unknown = response?.data ?? response;

      if (isPlainObject(respData) && typeof respData["error"] === "string") {
        throw new Error(respData["error"] as string);
      }

      // Enhanced AI response parsing with fallbacks
      let explanation = "No explanation available";
      let tips: string[] = [];

      // Try multiple response formats
      if (isPlainObject(respData)) {
        // Format 1: AI parsed structure
        if (
          isPlainObject(respData["ai"]) &&
          isPlainObject(respData["ai"]["ai_parsed"])
        ) {
          const parsed = respData["ai"]["ai_parsed"] as Record<string, unknown>;
          explanation =
            typeof parsed["summary"] === "string"
              ? (parsed["summary"] as string)
              : explanation;
          tips = Array.isArray(parsed["suggestions"])
            ? (parsed["suggestions"] as unknown[]).map(String)
            : tips;
        }
        // Format 2: Direct AI response
        else if (
          isPlainObject(respData["ai"]) &&
          typeof respData["ai"]["assistant_text"] === "string"
        ) {
          explanation = respData["ai"]["assistant_text"] as string;
        }
        // Format 3: Legacy structure
        else {
          explanation =
            typeof respData["explanation"] === "string"
              ? (respData["explanation"] as string)
              : explanation;
          tips = Array.isArray(respData["tips"])
            ? (respData["tips"] as unknown[]).map(String)
            : tips;
        }
      }

      // Enhanced fallback explanation based on input data
      if (explanation === "No explanation available") {
        const total = Object.values(data).reduce(
          (sum, val) => sum + (Number(val) || 0),
          0
        );
        if (total === 0) {
          explanation =
            "Based on your zero inputs, you have minimal carbon footprint. Consider adding your actual consumption data for personalized insights.";
          tips = [
            "Start by entering your weekly car travel distance",
            "Add your electricity consumption for more accurate analysis",
            "Include your dietary habits for comprehensive footprint calculation",
          ];
        } else {
          explanation =
            "Your carbon footprint analysis shows opportunities for improvement. Based on common sustainability practices, here are some general recommendations...";
          tips = [
            "Consider carpooling or using public transport to reduce transportation emissions",
            "Switch to energy-efficient appliances and LED lighting",
            "Reduce meat consumption by incorporating plant-based meals",
            "Unplug electronics when not in use to save energy",
            "Consider renewable energy options for your home",
          ];
        }
      }

      return {
        explanation,
        tips,
        raw_response: respData, // Include raw response for debugging
      };
    } catch (err: unknown) {
      let message = "Failed to get AI explanation";
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;

      console.error("Enhanced Explanation Error:", message, err);

      // Provide helpful fallback
      return {
        explanation:
          "I'm having trouble generating personalized insights right now. Here are some general tips to reduce your carbon footprint:",
        tips: [
          "Use public transportation or carpool when possible",
          "Switch to LED bulbs and energy-efficient appliances",
          "Reduce meat consumption and choose local produce",
          "Set thermostats efficiently and improve home insulation",
          "Support renewable energy sources when available",
        ],
        error: message,
      };
    }
  },
};
