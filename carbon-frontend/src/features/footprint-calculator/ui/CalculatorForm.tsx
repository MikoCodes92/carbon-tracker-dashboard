// src/features/footprint-calculator/ui/CalculatorForm.tsx
import React, { useState } from "react";
import { Form, Typography, Progress, Tooltip } from "antd";
import { InfoCircleOutlined, CalculatorOutlined } from "@ant-design/icons";
import type { FootprintCalculationRequest } from "@entities/footprint";
import { Card, Button, Input } from "@shared/ui";
import styled from "styled-components";

const { Title, Text } = Typography;

// Styled components for advanced design
const AdvancedFormCard = styled(Card)`
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff 0%, #f8faff 100%);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);
    border-radius: 20px 20px 0 0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledInput = styled(Input)`
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1),
      0 4px 20px rgba(59, 130, 246, 0.2);
    background: rgba(255, 255, 255, 1);
  }

  &:hover {
    border-color: #94a3b8;
    background: rgba(255, 255, 255, 1);
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  letter-spacing: -0.01em;
`;

const InputUnit = styled.span`
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
  margin-left: 4px;
`;

const IconWrapper = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  transition: color 0.3s ease;
`;

const ProgressContainer = styled.div`
  margin: 24px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CalculateButton = styled(Button)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  border-radius: 14px;
  padding: 18px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  width: 100%;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3),
    0 2px 6px rgba(16, 185, 129, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(16, 185, 129, 0.4),
      0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.6s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding: 0 20px;
`;

const GradientTitle = styled(Title)`
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  margin-bottom: 12px !important;
  font-size: 28px !important;
`;

const Subtitle = styled(Text)`
  color: #64748b;
  font-size: 15px;
  line-height: 1.6;
  display: block;
`;

interface CalculatorFormProps {
  calculation: FootprintCalculationRequest;
  onUpdate: (field: keyof FootprintCalculationRequest, value: number) => void;
  onCalculate: () => void;
  loading: boolean;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  calculation,
  onUpdate,
  onCalculate,
  loading,
}) => {
  const [completion, setCompletion] = useState(0);

  const fields: {
    key: keyof FootprintCalculationRequest;
    label: string;
    unit: string;
    icon: string;
    tooltip: string;
  }[] = [
    {
      key: "car_km",
      label: "Car Distance",
      unit: "km/week",
      icon: "🚗",
      tooltip: "Total distance traveled by car per week",
    },
    {
      key: "bus_km",
      label: "Bus Travel",
      unit: "km/week",
      icon: "🚌",
      tooltip: "Total distance traveled by bus per week",
    },
    {
      key: "electricity_kwh",
      label: "Electricity Usage",
      unit: "kWh/month",
      icon: "⚡",
      tooltip: "Monthly electricity consumption",
    },
    {
      key: "meat_meals",
      label: "Meat Meals",
      unit: "meals/week",
      icon: "🍖",
      tooltip: "Number of meat-based meals consumed per week",
    },
    {
      key: "veg_meals",
      label: "Vegetarian Meals",
      unit: "meals/week",
      icon: "🥗",
      tooltip: "Number of vegetarian meals consumed per week",
    },
  ];

  const handleInputChange =
    (key: keyof FootprintCalculationRequest) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) || 0;
      onUpdate(key, value);

      // Calculate form completion
      const filledFields =
        Object.values(calculation).filter((val) => val > 0).length + 1;
      const totalFields = Object.keys(calculation).length;
      setCompletion(Math.min(100, (filledFields / totalFields) * 100));
    };

  const getCompletionColor = () => {
    if (completion < 33) return "#ef4444";
    if (completion < 66) return "#f59e0b";
    return "#10b981";
  };

  return (
    <AdvancedFormCard>
      <HeaderSection>
        <GradientTitle level={2}>🌱 Carbon Footprint Calculator</GradientTitle>
        <Subtitle>
          Enter your consumption data to calculate your environmental impact
          with precision analytics
        </Subtitle>
      </HeaderSection>

      <ProgressContainer>
        <ProgressLabel>
          <Text strong style={{ color: "#374151", fontSize: 14 }}>
            Form Completion
          </Text>
          <Text strong style={{ color: getCompletionColor(), fontSize: 14 }}>
            {Math.round(completion)}%
          </Text>
        </ProgressLabel>
        <Progress
          percent={completion}
          strokeColor={getCompletionColor()}
          showInfo={false}
          strokeWidth={8}
          trailColor="#e2e8f0"
          style={{ borderRadius: 10 }}
        />
      </ProgressContainer>

      <Form layout="vertical" onFinish={onCalculate}>
        <FormGrid>
          <FormSection>
            <InputLabel>
              Transportation 🚦
              <Tooltip title="Your weekly transportation habits">
                <InfoCircleOutlined
                  style={{ marginLeft: 8, color: "#9ca3af", fontSize: 12 }}
                />
              </Tooltip>
            </InputLabel>

            {fields.slice(0, 2).map(({ key, label, unit, icon, tooltip }) => (
              <InputContainer key={key}>
                <InputLabel>
                  {icon} {label}
                  <InputUnit>({unit})</InputUnit>
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined
                      style={{ marginLeft: 6, color: "#9ca3af", fontSize: 12 }}
                    />
                  </Tooltip>
                </InputLabel>
                <div style={{ position: "relative" }}>
                  <StyledInput
                    type="number"
                    min={0}
                    step={0.1}
                    value={calculation[key] || ""}
                    onChange={handleInputChange(key)}
                    placeholder={`0 ${unit}`}
                  />
                  <IconWrapper>
                    <CalculatorOutlined />
                  </IconWrapper>
                </div>
              </InputContainer>
            ))}
          </FormSection>

          <FormSection>
            <InputLabel>
              Lifestyle & Energy 🏠
              <Tooltip title="Your energy consumption and dietary habits">
                <InfoCircleOutlined
                  style={{ marginLeft: 8, color: "#9ca3af", fontSize: 12 }}
                />
              </Tooltip>
            </InputLabel>

            {fields.slice(2).map(({ key, label, unit, icon, tooltip }) => (
              <InputContainer key={key}>
                <InputLabel>
                  {icon} {label}
                  <InputUnit>({unit})</InputUnit>
                  <Tooltip title={tooltip}>
                    <InfoCircleOutlined
                      style={{ marginLeft: 6, color: "#9ca3af", fontSize: 12 }}
                    />
                  </Tooltip>
                </InputLabel>
                <div style={{ position: "relative" }}>
                  <StyledInput
                    type="number"
                    min={0}
                    step={0.1}
                    value={calculation[key] || ""}
                    onChange={handleInputChange(key)}
                    placeholder={`0 ${unit}`}
                  />
                  <IconWrapper>
                    <CalculatorOutlined />
                  </IconWrapper>
                </div>
              </InputContainer>
            ))}
          </FormSection>
        </FormGrid>

        <CalculateButton variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <div style={{ display: "inline-block", marginRight: 8 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid transparent",
                    borderTop: "2px solid white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
              Calculating Impact...
            </>
          ) : (
            <>
              <CalculatorOutlined style={{ marginRight: 8 }} />
              Calculate Carbon Footprint
            </>
          )}
        </CalculateButton>
      </Form>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </AdvancedFormCard>
  );
};
