// src/features/footprint-calculator/ui/ExplanationView.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Typography,
  Tag,
  Space,
  Collapse,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Badge,
  Divider,
  Grid,
} from "antd";
import {
  BulbOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import styled, { keyframes, css } from "styled-components";
import { ExportButton, ShareButton } from "@features/footprint-calculator";
import type { ExplanationResponse } from "@entities/footprint";

const { useBreakpoint } = Grid;
const { Title, Paragraph, Text } = Typography;
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

const pulseGlow = keyframes`
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
const AdvancedExplanationCard = styled(Card)`
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
    padding: 0;
  }
`;

const HeaderSection = styled.div`
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.05) 0%,
    rgba(59, 130, 246, 0.05) 100%
  );
  padding: 40px 32px 32px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
`;

const AIAvatar = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 16px 40px rgba(16, 185, 129, 0.3);
  animation: ${pulseGlow} 2s ease-in-out infinite;

  &::after {
    content: "🤖";
    font-size: 36px;
    filter: grayscale(0.3);
  }
`;

const ContentSection = styled.div`
  padding: 32px;
`;

const ExplanationCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #10b981, #3b82f6);
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

const TipCard = styled(motion.div)<{ color: string }>`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-left: 4px solid ${(props) => props.color};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
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

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TipHeader = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`;

const TipIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 6px 20px ${(props) => props.color}40;
`;

const ImpactMeter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(241, 245, 249, 0.6);
  border-radius: 12px;
`;

const ImpactBar = styled.div<{ level: number; color: string }>`
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${(props) => props.level}%;
    background: ${(props) => props.color};
    border-radius: 4px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-top: 1px solid rgba(226, 232, 240, 0.8);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const StatsContainer = styled(Row)`
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ color: string }>`
  background: linear-gradient(
    135deg,
    ${(props) => props.color}15,
    ${(props) => props.color}08
  );
  border: 1px solid ${(props) => props.color}20;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const StyledCollapse = styled(Collapse)`
  background: transparent;
  border: none;

  .ant-collapse-item {
    border: none !important;
    margin-bottom: 16px;
  }

  .ant-collapse-header {
    background: linear-gradient(135deg, #ffffff, #f8fafc) !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    border-radius: 16px !important;
    padding: 24px !important;
    font-weight: 600;
    color: #1e293b !important;
    font-size: 16px;
  }

  .ant-collapse-content {
    border: none !important;
    background: transparent !important;
  }

  .ant-collapse-content-box {
    padding: 0 24px 24px !important;
    background: transparent;
  }
`;

const GradientButton = styled(motion.button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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

  &:hover {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    transform: translateY(-2px);
  }
`;

interface ExplanationViewProps {
  explanation: ExplanationResponse;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  explanation,
}) => {
  const screens = useBreakpoint();
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  const getImpactLevel = (
    tip: string
  ): { level: number; color: string; label: string } => {
    if (
      tip.toLowerCase().includes("significant") ||
      tip.toLowerCase().includes("major")
    ) {
      return {
        level: 90,
        color: "linear-gradient(90deg, #10b981, #22c55e)",
        label: "High",
      };
    }
    if (
      tip.toLowerCase().includes("moderate") ||
      tip.toLowerCase().includes("medium")
    ) {
      return {
        level: 60,
        color: "linear-gradient(90deg, #f59e0b, #fbbf24)",
        label: "Medium",
      };
    }
    if (
      tip.toLowerCase().includes("small") ||
      tip.toLowerCase().includes("minor")
    ) {
      return {
        level: 30,
        color: "linear-gradient(90deg, #6b7280, #9ca3af)",
        label: "Low",
      };
    }
    return {
      level: 50,
      color: "linear-gradient(90deg, #3b82f6, #60a5fa)",
      label: "Moderate",
    };
  };

  const getTipCategory = (
    tip: string
  ): { icon: string; color: string; category: string; gradient: string } => {
    const lowerTip = tip.toLowerCase();
    if (
      lowerTip.includes("car") ||
      lowerTip.includes("transport") ||
      lowerTip.includes("vehicle")
    ) {
      return {
        icon: "🚗",
        color: "#3b82f6",
        gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        category: "Transportation",
      };
    }
    if (
      lowerTip.includes("energy") ||
      lowerTip.includes("electric") ||
      lowerTip.includes("power")
    ) {
      return {
        icon: "⚡",
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        category: "Energy",
      };
    }
    if (
      lowerTip.includes("food") ||
      lowerTip.includes("meal") ||
      lowerTip.includes("diet")
    ) {
      return {
        icon: "🍽️",
        color: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        category: "Diet",
      };
    }
    if (
      lowerTip.includes("home") ||
      lowerTip.includes("house") ||
      lowerTip.includes("living")
    ) {
      return {
        icon: "🏠",
        color: "#8b5cf6",
        gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        category: "Lifestyle",
      };
    }
    return {
      icon: "🌱",
      color: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #059669)",
      category: "General",
    };
  };

  // Calculate statistics
  const totalTips = explanation.tips?.length || 0;
  const highImpactTips =
    explanation.tips?.filter((tip) => getImpactLevel(tip).label === "High")
      .length || 0;
  const mediumImpactTips =
    explanation.tips?.filter((tip) => getImpactLevel(tip).label === "Medium")
      .length || 0;

  const handleExportSuccess = (format: string) => {
    console.log(`Successfully exported as ${format}`);
  };

  const handleExportError = (format: string, error: any) => {
    console.error(`Export failed for ${format}:`, error);
  };

  const handleShare = (platform: string) => {
    console.log(`Shared via ${platform}`);
  };

  // Prepare export data
  const exportData = {
    title: "Carbon Footprint Analysis & Recommendations",
    description: explanation.explanation,
    data:
      explanation.tips?.map((tip, index) => ({
        id: index + 1,
        recommendation: tip,
        category: getTipCategory(tip).category,
        impact: getImpactLevel(tip).level,
        impactLevel: getImpactLevel(tip).label,
        priority:
          getImpactLevel(tip).label === "High"
            ? 1
            : getImpactLevel(tip).label === "Medium"
            ? 2
            : 3,
      })) || [],
    columns: [
      { key: "id", label: "#" },
      { key: "recommendation", label: "Recommendation" },
      { key: "category", label: "Category" },
      { key: "impact", label: "Impact Score" },
      { key: "impactLevel", label: "Impact Level" },
      { key: "priority", label: "Priority" },
    ],
    fileName: "carbon_footprint_analysis_recommendations",
    metadata: {
      generatedAt: new Date().toISOString(),
      totalRecommendations: totalTips,
      highImpactCount: highImpactTips,
      mediumImpactCount: mediumImpactTips,
    },
  };

  // Prepare share content
  const shareContent = {
    url: window.location.href,
    title: "AI-Powered Carbon Footprint Analysis",
    description: `${explanation.explanation.substring(0, 120)}...`,
    hashtags: [
      "CarbonFootprint",
      "Sustainability",
      "EcoFriendly",
      "ClimateAction",
      "AI",
    ],
  };

  return (
    <AdvancedExplanationCard>
      <HeaderSection>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <AIAvatar />
            </motion.div>
          </Col>
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
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
                      marginBottom: "12px",
                    }}
                  >
                    AI ENVIRONMENTAL ANALYSIS
                  </Tag>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: "#1e293b",
                      fontSize: screens.xs ? "28px" : "32px",
                    }}
                  >
                    Intelligent Insights Report
                  </Title>
                </div>
                <Text
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                    lineHeight: 1.6,
                  }}
                >
                  Advanced AI-powered analysis of your carbon footprint with
                  personalized, actionable recommendations
                </Text>
              </Space>
            </motion.div>
          </Col>
        </Row>
      </HeaderSection>

      <ContentSection>
        {/* Statistics Overview */}
        {totalTips > 0 && (
          <StatsContainer gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <StatCard color="#3b82f6">
                  <Statistic
                    title="Total Recommendations"
                    value={totalTips}
                    valueStyle={{
                      color: "#3b82f6",
                      fontSize: "32px",
                      fontWeight: 700,
                    }}
                    suffix={<BulbOutlined style={{ color: "#3b82f6" }} />}
                  />
                </StatCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <StatCard color="#10b981">
                  <Statistic
                    title="High Impact Actions"
                    value={highImpactTips}
                    valueStyle={{
                      color: "#10b981",
                      fontSize: "32px",
                      fontWeight: 700,
                    }}
                    suffix={<RocketOutlined style={{ color: "#10b981" }} />}
                  />
                </StatCard>
              </motion.div>
            </Col>
            <Col xs={24} sm={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <StatCard color="#f59e0b">
                  <Statistic
                    title="Medium Impact"
                    value={mediumImpactTips}
                    valueStyle={{
                      color: "#f59e0b",
                      fontSize: "32px",
                      fontWeight: 700,
                    }}
                    suffix={
                      <SafetyCertificateOutlined style={{ color: "#f59e0b" }} />
                    }
                  />
                </StatCard>
              </motion.div>
            </Col>
          </StatsContainer>
        )}

        {/* Actionable Recommendations */}
        {explanation.tips?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <StyledCollapse
              defaultActiveKey={["1"]}
              expandIcon={({ isActive }) => (
                <motion.div
                  animate={{ rotate: isActive ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRightOutlined style={{ color: "#3b82f6" }} />
                </motion.div>
              )}
              expandIconPosition="end"
            >
              <Panel
                header={
                  <Space size={12}>
                    <RocketOutlined
                      style={{ color: "#10b981", fontSize: "18px" }}
                    />
                    <Text strong style={{ fontSize: "18px" }}>
                      Action Plan & Recommendations
                    </Text>
                    <Badge
                      count={totalTips}
                      style={{ backgroundColor: "#10b981" }}
                      showZero={false}
                    />
                  </Space>
                }
                key="1"
                extra={
                  <Space>
                    <Tag color="green">{highImpactTips} High Impact</Tag>
                    <Tag color="orange">{mediumImpactTips} Medium Impact</Tag>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: "100%" }} size={16}>
                  <AnimatePresence>
                    {explanation.tips.map((tip, index) => {
                      const category = getTipCategory(tip);
                      const impact = getImpactLevel(tip);
                      const isExpanded = expandedTip === index;

                      return (
                        <TipCard
                          key={index}
                          color={category.color}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          onClick={() =>
                            setExpandedTip(isExpanded ? null : index)
                          }
                        >
                          <TipHeader>
                            <TipIcon color={category.gradient}>
                              {category.icon}
                            </TipIcon>
                            <div style={{ flex: 1 }}>
                              <Space
                                direction="vertical"
                                size={8}
                                style={{ width: "100%" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "16px",
                                      color: "#1e293b",
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    {tip}
                                  </Text>
                                  <Tag
                                    color={
                                      impact.label === "High"
                                        ? "green"
                                        : impact.label === "Medium"
                                        ? "orange"
                                        : "default"
                                    }
                                    style={{
                                      border: "none",
                                      borderRadius: "12px",
                                      fontWeight: 600,
                                      flexShrink: 0,
                                      marginLeft: "12px",
                                    }}
                                  >
                                    {impact.label} Impact
                                  </Tag>
                                </div>
                                <Tag
                                  color="blue"
                                  style={{
                                    border: "none",
                                    borderRadius: "12px",
                                    background: category.gradient,
                                    color: "white",
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  {category.category}
                                </Tag>
                              </Space>
                            </div>
                            <CheckCircleOutlined
                              style={{
                                color: "#10b981",
                                fontSize: "20px",
                                flexShrink: 0,
                              }}
                            />
                          </TipHeader>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ImpactMeter>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "14px",
                                      color: "#374151",
                                      minWidth: "100px",
                                    }}
                                  >
                                    Impact Score:
                                  </Text>
                                  <ImpactBar
                                    level={impact.level}
                                    color={impact.color}
                                  />
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "14px",
                                      color:
                                        impact.label === "High"
                                          ? "#10b981"
                                          : impact.label === "Medium"
                                          ? "#f59e0b"
                                          : "#6b7280",
                                      minWidth: "60px",
                                      textAlign: "right",
                                    }}
                                  >
                                    {impact.level}%
                                  </Text>
                                </ImpactMeter>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </TipCard>
                      );
                    })}
                  </AnimatePresence>
                </Space>
              </Panel>
            </StyledCollapse>
          </motion.div>
        )}
      </ContentSection>

      {/* Action Bar */}
      <ActionBar>
        <Space>
          <EnvironmentOutlined style={{ color: "#10b981", fontSize: "18px" }} />
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: "14px", color: "#1e293b" }}>
              {totalTips} Actionable Recommendations
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Ready to implement
            </Text>
          </Space>
        </Space>

        <Space size={16}>
          <ExportButton
            data={exportData}
            variant="primary"
            onExportSuccess={handleExportSuccess}
            onExportError={handleExportError}
          />

          <ShareButton
            shareContent={shareContent}
            variant="secondary"
            onShare={handleShare}
          />
        </Space>
      </ActionBar>
    </AdvancedExplanationCard>
  );
};
