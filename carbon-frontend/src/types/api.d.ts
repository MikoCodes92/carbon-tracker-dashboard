export type BreakdownItem = {
  name: string;
  amount: number;
  emission: number;
};

export type CalculationResponse = {
  total_emission: number;
  breakdown: BreakdownItem[];
};

export type ExplainResponse = {
  payload: CalculationResponse;
  ai: {
    assistant_text?: string;
    raw_openai?: unknown;
  };
};
