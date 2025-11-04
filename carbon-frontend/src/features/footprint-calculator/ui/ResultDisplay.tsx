// src/features/footprint-calculator/ui/ResultDisplay.tsx
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  Statistic,
  Progress,
  Tag,
  Tooltip,
  Space,
  Collapse,
  Table,
  Badge,
  Row,
  Col,
  Grid,
  Avatar,
  List,
  Divider,
} from "antd";
import {
  InfoCircleOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import styled, { keyframes, css } from "styled-components";
import type {
  EnhancedFootprintResponse,
  ClimatiqBatchResult,
} from "../lib/calculator.api";

const { useBreakpoint } = Grid;
const { Panel } = Collapse;

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.6);
  }
`;

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled Components
const AdvancedCard = styled(Card)`
  border-radius: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08),
    0 10px 30px -10px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  overflow: hidden;
  animation: ${fadeInUp} 0.6s ease-out;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);
    background-size: 200% 200%;
    animation: ${gradientShift} 3s ease infinite;
  }

  .ant-card-body {
    padding: 32px;
  }
`;

const SuccessBadge = styled(Badge)`
  .ant-badge-count {
    background: linear-gradient(135deg, #10b981, #22c55e);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
`;

const EmissionStatCard = styled.div<{ color: string }>`
  background: linear-gradient(
    135deg,
    ${(props) => props.color}15,
    ${(props) => props.color}08
  );
  border: 1px solid ${(props) => props.color}20;
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      ${(props) => props.color},
      ${(props) => props.color}dd
    );
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const ProgressContainer = styled.div`
  position: relative;
  display: inline-block;

  .ant-progress-circle-path {
    stroke-linecap: round;
  }
`;

const GlowingProgress = styled(Progress)`
  .ant-progress-inner {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    padding: 8px;
  }
`;

const DataSourceCard = styled(Card)`
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.15);
    transform: translateY(-2px);
  }

  .ant-card-body {
    padding: 20px;
  }
`;

const BreakdownItemCard = styled(motion.div)<{ color: string }>`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-left: 4px solid ${(props) => props.color};
  border-radius: 16px;
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      ${(props) => props.color}08,
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const StyledTable = styled(Table)`
  .ant-table-thead > tr > th {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 2px solid #e2e8f0;
    font-weight: 600;
    color: #475569;
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(59, 130, 246, 0.04);
  }
`;

const InsightPill = styled(motion.div)`
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
`;

const GradientButton = styled(motion.button)<{ disabled?: boolean }>`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  width: 100%;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;

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
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:not(:disabled):hover {
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
    transform: translateY(-2px);
  }
`;

interface Props {
  result: EnhancedFootprintResponse;
  onGetExplanation: () => void;
  loading: boolean;
}

export const ResultDisplay: React.FC<Props> = ({
  result,
  onGetExplanation,
  loading,
}) => {
  const screens = useBreakpoint();
  const [activeBreakdown, setActiveBreakdown] = useState<string | null>(null);

  const {
    total_emission = 0,
    breakdown = [],
    climatiq_batch,
    debug_factors,
  } = result;

  // Filter out zero emission items for display
  const relevantBreakdown = useMemo(
    () => breakdown.filter((item) => item.amount > 0 || item.emission > 0),
    [breakdown]
  );

  // Analyze Climatiq results
  const climatiqResults = climatiq_batch?.results || [];
  const successfulCalculations = climatiqResults.filter((r) => !r.error).length;
  const successfulResults = useMemo(
    () => climatiqResults.filter((r) => !r.error && r.co2e !== undefined),
    [climatiqResults]
  );

  const totalCalculations = climatiqResults.length;
  const successRate =
    totalCalculations > 0
      ? (successfulCalculations / totalCalculations) * 100
      : 0;

  // Enhanced level calculation with professional color scheme
  const getLevel = (co2: number) => {
    if (co2 === 0)
      return {
        label: "No Data",
        color: "#94a3b8",
        description: "Awaiting calculation",
        gradient: "linear-gradient(135deg, #94a3b8, #64748b)",
      };
    if (co2 < 5)
      return {
        label: "Excellent",
        color: "#10b981",
        description: "Minimal environmental impact",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
      };
    if (co2 < 10)
      return {
        label: "Good",
        color: "#22c55e",
        description: "Low environmental impact",
        gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      };
    if (co2 < 20)
      return {
        label: "Moderate",
        color: "#f59e0b",
        description: "Average environmental impact",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
      };
    if (co2 < 50)
      return {
        label: "High",
        color: "#f97316",
        description: "High environmental impact",
        gradient: "linear-gradient(135deg, #f97316, #ea580c)",
      };
    return {
      label: "Critical",
      color: "#ef4444",
      description: "Very high environmental impact",
      gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
    };
  };

  const levelInfo = getLevel(total_emission);

  // Prepare chart data
  const chartData = useMemo(
    () =>
      relevantBreakdown.map((item, index) => ({
        ...item,
        fill: getLevel(item.emission).color,
        gradient: getLevel(item.emission).gradient,
        hasData: item.amount > 0,
        factor:
          debug_factors?.[
            item.name
              .toLowerCase()
              .replace(" ", "_") as keyof typeof debug_factors
          ],
      })),
    [relevantBreakdown, debug_factors]
  );

  // Prepare pie chart data for sources
  const pieData = useMemo(
    () =>
      relevantBreakdown
        .filter((item) => item.emission > 0)
        .map((item) => ({
          name: item.name,
          value: item.emission,
          color: getLevel(item.emission).color,
        })),
    [relevantBreakdown]
  );

  // Success messages
  const getSuccessMessage = () => {
    if (successfulCalculations === 0) {
      return {
        title: "Ready for Analysis",
        description:
          "Enter your consumption data to begin carbon footprint calculation",
        icon: <RocketOutlined />,
        gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      };
    }

    if (successRate === 100) {
      return {
        title: "Comprehensive Analysis Complete",
        description:
          "All emission factors successfully calculated with high-quality data sources",
        icon: <SafetyCertificateOutlined />,
        gradient: "linear-gradient(135deg, #10b981, #059669)",
      };
    }

    if (successRate >= 70) {
      return {
        title: "High-Quality Analysis",
        description: `${successfulCalculations} of ${totalCalculations} categories analyzed with premium data sources`,
        icon: <CheckCircleOutlined />,
        gradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      };
    }

    return {
      title: "Analysis in Progress",
      description: `${successfulCalculations} categories successfully analyzed`,
      icon: <DatabaseOutlined />,
      gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    };
  };

  const successMessage = getSuccessMessage();

  // Climatiq table data
  const climatiqTableData = useMemo(
    () =>
      successfulResults.map((result: ClimatiqBatchResult, index: number) => ({
        key: index,
        activity: result.emission_factor?.name || "Unknown Activity",
        category: result.emission_factor?.category || "General",
        region: result.emission_factor?.region || "Global",
        co2e: result.co2e?.toFixed(4) || "0.0000",
        unit: result.co2e_unit || "kg",
        source: result.emission_factor?.source || "Verified Database",
        year: result.emission_factor?.year || "Current",
        dataQuality:
          result.emission_factor?.data_quality_flags?.length === 0
            ? "High"
            : "Standard",
        calculationMethod: result.co2e_calculation_method || "AR5",
      })),
    [successfulResults]
  );

  const climatiqColumns = [
    {
      title: "Emission Activity",
      dataIndex: "activity",
      key: "activity",
      width: 220,
      render: (text: string, record: any) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#10b981" }} />
          <Tooltip title={text}>
            <span style={{ fontWeight: 500 }}>{text}</span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "CO₂e",
      dataIndex: "co2e",
      key: "co2e",
      width: 100,
      render: (value: string, record: any) => (
        <Statistic
          value={value}
          suffix="kg"
          valueStyle={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#059669",
          }}
        />
      ),
    },
    {
      title: "Quality",
      dataIndex: "dataQuality",
      key: "dataQuality",
      width: 90,
      render: (quality: string) => (
        <Badge
          status={quality === "High" ? "success" : "processing"}
          text={quality}
        />
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 120,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ color: "#64748b" }}>{text}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <AdvancedCard>
      {/* Header Section */}
      <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Space direction="vertical" size={16}>
              <div>
                <Tag
                  icon={<ThunderboltOutlined />}
                  color="blue"
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  CARBON FOOTPRINT ANALYSIS
                </Tag>
                <h1
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: screens.xs ? "28px" : "36px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #1e293b, #475569)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Environmental Impact Report
                </h1>
              </div>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Comprehensive analysis of your carbon emissions based on
                verified environmental data
              </p>
            </Space>
          </motion.div>
        </Col>

        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              display: "flex",
              justifyContent: screens.lg ? "flex-end" : "flex-start",
            }}
          >
            <Space size={24} align="center">
              <SuccessBadge count={successfulCalculations} showZero={false}>
                <Avatar
                  size={64}
                  style={{
                    background: successMessage.gradient,
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  icon={successMessage.icon}
                />
              </SuccessBadge>
              <div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: 4,
                  }}
                >
                  {successMessage.title}
                </div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  {successMessage.description}
                </div>
              </div>
            </Space>
          </motion.div>
        </Col>
      </Row>

      {/* Main Metrics Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {/* Total Emission Card */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <EmissionStatCard color={levelInfo.color}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Statistic
                    title={
                      <Space>
                        <GlobalOutlined />
                        <span style={{ color: "#64748b", fontSize: "14px" }}>
                          Total Carbon Footprint
                        </span>
                      </Space>
                    }
                    value={total_emission}
                    precision={2}
                    suffix="kg CO₂"
                    valueStyle={{
                      fontSize: screens.xs ? "32px" : "40px",
                      fontWeight: 700,
                      color: levelInfo.color,
                    }}
                  />
                  <Tag
                    color={levelInfo.color}
                    style={{
                      border: "none",
                      borderRadius: "20px",
                      padding: "6px 12px",
                      fontWeight: 600,
                      background: levelInfo.gradient,
                      color: "white",
                    }}
                  >
                    {levelInfo.label}
                  </Tag>
                </div>
                <Progress
                  percent={Math.min((total_emission / 50) * 100, 100)}
                  showInfo={false}
                  strokeColor={{
                    "0%": levelInfo.color,
                    "100%": levelInfo.color,
                  }}
                  trailColor="#e2e8f0"
                />
                <div style={{ color: "#64748b", fontSize: "14px" }}>
                  {levelInfo.description}
                </div>
              </Space>
            </EmissionStatCard>
          </motion.div>
        </Col>

        {/* Success Rate Card */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <EmissionStatCard color="#3b82f6">
              <Space
                direction="vertical"
                size={16}
                style={{ width: "100%", textAlign: "center" }}
              >
                <ProgressContainer>
                  <GlowingProgress
                    type="circle"
                    percent={Math.round(successRate)}
                    size={80}
                    strokeWidth={8}
                    strokeColor={{
                      "0%": "#3b82f6",
                      "100%": "#1d4ed8",
                    }}
                    format={(percent) => (
                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#3b82f6",
                        }}
                      >
                        {percent}%
                      </div>
                    )}
                  />
                </ProgressContainer>
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: 4,
                    }}
                  >
                    Data Coverage
                  </div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    {successfulCalculations} of {totalCalculations} categories
                  </div>
                </div>
              </Space>
            </EmissionStatCard>
          </motion.div>
        </Col>

        {/* Sources Card */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <EmissionStatCard color="#8b5cf6">
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <DatabaseOutlined
                    style={{ fontSize: "24px", color: "#8b5cf6" }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {successfulResults.length}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "14px" }}>
                      Data Sources
                    </div>
                  </div>
                </div>
                <Divider style={{ margin: "12px 0" }} />
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  Verified emission factors from global environmental databases
                  and research institutions
                </div>
              </Space>
            </EmissionStatCard>
          </motion.div>
        </Col>
      </Row>

      {/* Visualization Section */}
      {relevantBreakdown.length > 0 && (
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <DataSourceCard
                title={
                  <Space>
                    <BarChartOutlined />
                    <span>Emission Breakdown</span>
                  </Space>
                }
                extra={<InsightPill>Real-time</InsightPill>}
              >
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#64748b"
                        width={80}
                      />
                      <RechartsTooltip
                        formatter={(value: any) => [
                          `${value} kg CO₂`,
                          "Emission",
                        ]}
                        labelFormatter={(label) => `Category: ${label}`}
                        contentStyle={{
                          background:
                            "linear-gradient(135deg, #ffffff, #f8fafc)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Bar dataKey="emission" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.gradient} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DataSourceCard>
            </motion.div>
          </Col>

          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <DataSourceCard
                title={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Emission Distribution</span>
                  </Space>
                }
                extra={<InsightPill>Interactive</InsightPill>}
              >
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: any, name) => [
                          `${value} kg CO₂`,
                          name,
                        ]}
                        contentStyle={{
                          background:
                            "linear-gradient(135deg, #ffffff, #f8fafc)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DataSourceCard>
            </motion.div>
          </Col>
        </Row>
      )}

      {/* Breakdown Details */}
      {relevantBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ marginBottom: 32 }}
        >
          <DataSourceCard
            title="Detailed Emission Analysis"
            extra={
              <Tag color="blue" icon={<InfoCircleOutlined />}>
                {relevantBreakdown.length} Categories
              </Tag>
            }
          >
            <Row gutter={[16, 16]}>
              {relevantBreakdown.map((item, index) => {
                const itemLevel = getLevel(item.emission);
                const percentage =
                  total_emission > 0
                    ? (item.emission / total_emission) * 100
                    : 0;

                return (
                  <Col xs={24} md={12} lg={8} key={item.name}>
                    <BreakdownItemCard
                      color={itemLevel.color}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() =>
                        setActiveBreakdown(
                          activeBreakdown === item.name ? null : item.name
                        )
                      }
                    >
                      <Space
                        direction="vertical"
                        size={12}
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {item.name}
                          </div>
                          <Tag color={itemLevel.color} style={{ margin: 0 }}>
                            {percentage.toFixed(1)}%
                          </Tag>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Statistic
                            value={item.emission}
                            precision={2}
                            suffix="kg"
                            valueStyle={{
                              fontSize: "18px",
                              fontWeight: 600,
                              color: itemLevel.color,
                            }}
                          />
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                              {item.amount} units
                            </div>
                            {debug_factors?.[
                              item.name.toLowerCase().replace(" ", "_")
                            ] && (
                              <div
                                style={{ fontSize: "10px", color: "#94a3b8" }}
                              >
                                {
                                  debug_factors[
                                    item.name.toLowerCase().replace(" ", "_")
                                  ]
                                }{" "}
                                kg/unit
                              </div>
                            )}
                          </div>
                        </div>

                        <Progress
                          percent={percentage}
                          showInfo={false}
                          strokeColor={itemLevel.gradient}
                          trailColor="#f1f5f9"
                          size="small"
                        />
                      </Space>
                    </BreakdownItemCard>
                  </Col>
                );
              })}
            </Row>
          </DataSourceCard>
        </motion.div>
      )}

      {/* Data Sources Table */}
      {successfulResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{ marginBottom: 32 }}
        >
          <DataSourceCard
            title="Emission Data Sources"
            extra={
              <Space>
                <Tag color="green">Verified</Tag>
                <Tag color="blue">Real-time</Tag>
              </Space>
            }
          >
            <StyledTable
              dataSource={climatiqTableData}
              columns={climatiqColumns}
              pagination={false}
              size="middle"
              scroll={{ x: 800 }}
            />
          </DataSourceCard>
        </motion.div>
      )}

      {/* AI Analysis Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <GradientButton
          onClick={onGetExplanation}
          disabled={loading || successfulCalculations === 0}
          whileHover={{
            scale: loading || successfulCalculations === 0 ? 1 : 1.02,
          }}
          whileTap={{
            scale: loading || successfulCalculations === 0 ? 1 : 0.98,
          }}
        >
          <Space size={12}>
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: 20,
                    height: 20,
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                  }}
                />
                <span>Generating AI Analysis...</span>
              </>
            ) : successfulCalculations === 0 ? (
              <>
                <RocketOutlined />
                <span>Enter Data for AI Insights</span>
              </>
            ) : (
              <>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🧠
                </motion.span>
                <span>Generate Advanced AI Insights</span>
              </>
            )}
          </Space>
        </GradientButton>
      </motion.div>
    </AdvancedCard>
  );
};
