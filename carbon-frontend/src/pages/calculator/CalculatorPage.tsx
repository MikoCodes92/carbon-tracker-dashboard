import React, { useCallback, useMemo, useState } from "react";
import {
  Typography,
  Alert,
  Space,
  Row,
  Col,
  Grid,
  Tabs as AntTabs,
  Card,
  Statistic,
  Progress,
  Button,
  Breadcrumb,
  Tooltip,
  Dropdown,
  message,
  Drawer,
  Layout,
  Collapse,
  Empty,
} from "antd";
import {
  CalculatorForm,
  ResultDisplay,
  ExplanationView,
} from "@features/footprint-calculator";
import { useCalculatorStore } from "@features/footprint-calculator";
import styled from "styled-components";
import {
  HomeOutlined,
  CalculatorOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  PieChartOutlined,
  BulbOutlined,
  PlusOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  EyeOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { useBreakpoint } = Grid;
const { Title, Paragraph } = Typography;
const { TabPane } = AntTabs;
const { Sider, Content } = Layout;
const { Panel } = Collapse;

// ---------- Styled Components ----------
const PageShell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f7fb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial;
`;

const Main = styled.main`
  flex: 1;
  padding: 28px 20px;
  margin-top: 64px; /* Account for header height */

  @media (max-width: 768px) {
    padding: 16px 12px;
    margin-top: 56px; /* Smaller header on mobile */
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
`;

const PanelCard = styled(motion(Card))`
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff, #f1f3f6);

  @media (max-width: 768px) {
    border-radius: 12px;
    margin-bottom: 16px;
  }
`;

const GradientButton = styled(Button)`
  background: linear-gradient(135deg, #4e91f9, #1fd1f9);
  border: none;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 16px rgba(78, 145, 249, 0.4);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(78, 145, 249, 0.5);
  }

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 6px 12px;
    height: auto;
  }
`;

const StatWrapper = styled.div<{ color?: string }>`
  padding: 16px;
  border-radius: 14px;
  background: ${(props) => props.color || "#fafafa"};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.03);
  }

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 8px;
  }
`;

const SideMenuButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 4px 8px;
  }
`;

const IconButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  padding: 0;
  font-size: 18px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.15);
    background: #1fd1f9;
    color: #fff;
    box-shadow: 0 6px 20px rgba(31, 209, 249, 0.4);
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
`;

const StyledCollapse = styled(Collapse)`
  .ant-collapse-header {
    font-weight: 600;
    font-size: 14px;
    border-radius: 12px;
    padding: 12px 20px !important;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #e0f7fa, #e1f5fe);

    &:hover {
      background: linear-gradient(135deg, #b2ebf2, #81d4fa);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  }

  .ant-collapse-content-box {
    padding: 16px;
    background: linear-gradient(145deg, #f9f9f9, #e6f7ff);
    border-radius: 12px;
  }

  @media (max-width: 768px) {
    .ant-collapse-header {
      padding: 10px 16px !important;
      font-size: 13px;
    }

    .ant-collapse-content-box {
      padding: 12px;
    }
  }
`;

// ---------- Mobile Widgets Styles ----------
const MobileWidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const MobileWidgetCard = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .anticon {
    font-size: 20px;
    color: #4e91f9;
  }
`;

// ---------- Header Component ----------
const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Logout handler
  const handleLogout = useCallback(() => {
    // Add your logout logic here
    console.log("Logging out...");
    message.success("Logged out successfully");
    // Example: clear auth tokens, redirect to login, etc.
    // window.location.href = '/login';
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: "blur(6px)",
        background: "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        height: "64px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
            fontWeight: 600,
            fontSize: "18px",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              padding: "6px 10px",
              borderRadius: "6px",
              background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
              color: "white",
              fontSize: "0.9rem",
            }}
          >
            ECO
          </span>
          CarbonTracker
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {/* Logout Button 
          <Button
            type="primary"
            danger
            onClick={handleLogout}
            style={{
              background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
              border: "none",
              color: "white",
              fontWeight: 500,
              boxShadow: "0 4px 16px rgba(255, 107, 107, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🚪</span>
            Logout
          </Button>*/}

          {/* Mobile Toggle */}
          <Button
            type="text"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              width: "40px",
              height: "40px",
            }}
            className="mobile-toggle"
          >
            <span>☰</span>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            borderBottom: "1px solid #f0f0f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "16px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              type="primary"
              danger
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                border: "none",
                color: "white",
                fontWeight: 500,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>🚪</span>
              Logout
            </Button>
          </Space>
        </div>
      )}
    </header>
  );
};

// ---------- Types ----------
interface DashboardItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  render: React.ReactNode;
  description?: string;
}

// ---------- Main Component ----------
export const CalculatorPage: React.FC = () => {
  const screens = useBreakpoint();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode | null>(
    null
  );
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    calculation,
    result,
    explanation,
    loading,
    error,
    updateCalculation,
    calculateFootprint,
    getExplanation,
    resetCalculator,
  } = useCalculatorStore();

  const widgets = useMemo<DashboardItem[]>(
    () => [
      {
        id: "insights",
        title: "AI Insights",
        icon: <BulbOutlined />,
        description: "Get AI-powered insights and recommendations",
        render: explanation ? (
          <ExplanationView explanation={explanation} />
        ) : (
          <Empty description="No insights yet" />
        ),
      },
      {
        id: "metrics",
        title: "Key Metrics",
        icon: <DashboardOutlined />,
        description: "View important carbon metrics and data quality",
        render: (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            <StatWrapper color="#ffe6e6">
              <Statistic
                title="Total Emissions"
                value={result?.total_emission ?? 0}
                precision={2}
                suffix="kg CO₂"
              />
            </StatWrapper>

            <StatWrapper color="#e6f7ff">
              <Statistic
                title="Data Quality"
                value={
                  result
                    ? Math.round(
                        ((result.analysis?.successfulCalculations ?? 0) /
                          Math.max(1, result.breakdown.length)) *
                          100
                      )
                    : 0
                }
                suffix="%"
              />
              <Progress
                percent={
                  result
                    ? Math.round(
                        ((result.analysis?.successfulCalculations ?? 0) /
                          Math.max(1, result.breakdown.length)) *
                          100
                      )
                    : 0
                }
                strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
                status="active"
              />
            </StatWrapper>
          </Space>
        ),
      },
    ],
    [result, explanation, loading, getExplanation]
  );

  const openDrawerFor = useCallback(
    (id: string) => {
      const item = widgets.find((w) => w.id === id);
      if (!item) return;
      setDrawerContent(item.render);
      setDrawerOpen(true);
      setSelectedWidget(id);
    },
    [widgets]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => setDrawerContent(null), 300);
  }, []);

  const handleExport = useCallback(
    () => message.info("Exporting layout... (not implemented)"),
    []
  );
  const handleResetLayout = useCallback(
    () => message.info("Reset layout to defaults"),
    []
  );
  const handleCalculate = async () => {
    await calculateFootprint(); // Run the calculation first
    setActiveTab("results"); // Switch to the Results tab automatically
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mobile widgets section
  const renderMobileWidgets = () => (
    <div style={{ marginBottom: 20 }}>
      <PanelCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            Available Widgets
          </Title>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => message.info("Widget settings")}
          />
        </div>

        <MobileWidgetsGrid>
          {widgets.map((widget) => (
            <MobileWidgetCard
              key={widget.id}
              onClick={() => openDrawerFor(widget.id)}
            >
              <WidgetHeader>
                {widget.icon}
                <Title level={5} style={{ margin: 0 }}>
                  {widget.title}
                </Title>
              </WidgetHeader>
              <Paragraph
                type="secondary"
                style={{ fontSize: "12px", marginBottom: 16 }}
              >
                {widget.description}
              </Paragraph>
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  openDrawerFor(widget.id);
                }}
              >
                Open Widget
              </Button>
            </MobileWidgetCard>
          ))}
        </MobileWidgetsGrid>
      </PanelCard>
    </div>
  );

  return (
    <PageShell>
      <Header />
      <Main>
        <Container>
          {/* Header */}
          <PanelCard style={{ marginBottom: 20 }}>
            <Breadcrumb
              items={[
                { title: <HomeOutlined /> },
                { title: "Sustainability" },
                { title: "Carbon Management" },
                { title: "Dashboard" },
              ]}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
                flexWrap: screens.md ? "nowrap" : "wrap",
              }}
            >
              <div style={{ minWidth: screens.md ? "auto" : "100%" }}>
                <Title
                  level={screens.md ? 2 : 3}
                  style={{ margin: 0, fontSize: screens.md ? "32px" : "24px" }}
                >
                  Carbon Footprint Dashboard
                </Title>
                <Paragraph style={{ margin: "6px 0 0 0", color: "#8c8c8c" }}>
                  Organized views with drawers & tabs — click any widget to open
                  in a side panel.
                </Paragraph>
              </div>

              <Space
                style={{
                  marginTop: screens.md ? 0 : 12,
                  flexWrap: "wrap",
                  justifyContent: screens.md ? "flex-end" : "flex-start",
                }}
              >
                <GradientButton onClick={resetCalculator}>Reset</GradientButton>
                <GradientButton
                  type="primary"
                  onClick={handleCalculate}
                  loading={loading}
                >
                  Calculate
                </GradientButton>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: "export",
                        label: "Export Layout",
                        onClick: handleExport,
                      },
                      {
                        key: "reset",
                        label: "Reset Layout",
                        onClick: handleResetLayout,
                      },
                    ],
                  }}
                >
                  <Button icon={<SettingOutlined />}>
                    {screens.sm ? "Options" : ""}
                  </Button>
                </Dropdown>
              </Space>
            </div>
          </PanelCard>

          {/* Mobile Widgets Section - Only show on mobile */}
          {!screens.lg && renderMobileWidgets()}

          <Layout style={{ background: "transparent" }}>
            {/* Sidebar - Hidden on small screens */}
            {screens.lg && (
              <Sider
                width={320}
                style={{ background: "#f0f5ff", padding: 16, borderRadius: 16 }}
                breakpoint="lg"
                collapsedWidth={0}
              >
                <PanelCard
                  size="small"
                  style={{
                    height: "100%",
                    background: "transparent",
                    boxShadow: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Title level={5} style={{ margin: 0 }}>
                      Widgets
                    </Title>
                    <Space>
                      <Tooltip title="Add widget">
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            message.info("Add widget not implemented yet")
                          }
                        />
                      </Tooltip>
                      <Tooltip title="List view">
                        <SideMenuButton icon={<UnorderedListOutlined />}>
                          List
                        </SideMenuButton>
                      </Tooltip>
                    </Space>
                  </div>

                  <StyledCollapse defaultActiveKey={["calculator"]} ghost>
                    {widgets.map((w) => (
                      <Panel
                        header={
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {w.icon}
                            <strong>{w.title}</strong>
                          </span>
                        }
                        key={w.id}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: 12,
                          }}
                        >
                          <Tooltip title="View Details">
                            <IconButton
                              type="primary"
                              icon={<EyeOutlined />}
                              onClick={() => openDrawerFor(w.id)}
                            />
                          </Tooltip>
                        </div>
                      </Panel>
                    ))}
                  </StyledCollapse>
                </PanelCard>
              </Sider>
            )}

            {/* Center Content */}
            <Content style={{ paddingLeft: screens.lg ? 8 : 0 }}>
              <PanelCard>
                <AntTabs
                  activeKey={activeTab}
                  onChange={(k) => setActiveTab(String(k))}
                  type={screens.md ? "card" : "line"}
                  size={screens.md ? "middle" : "small"}
                >
                  {/* Dashboard Tab */}
                  <TabPane
                    key="dashboard"
                    tab={
                      <span>
                        <DashboardOutlined />
                        {screens.sm ? "Overview" : ""}
                      </span>
                    }
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: screens.lg ? "1fr 420px" : "1fr",
                        gap: 16,
                      }}
                    >
                      {/* Left Column */}
                      <div>
                        <PanelCard size="small" style={{ marginBottom: 16 }}>
                          <Title level={5}>Quick Actions</Title>
                          <Space wrap>
                            <GradientButton
                              onClick={() => openDrawerFor("results")}
                              icon={<PieChartOutlined />}
                            >
                              View Results
                            </GradientButton>
                            {!screens.lg && (
                              <>
                                <GradientButton
                                  onClick={() => openDrawerFor("insights")}
                                  icon={<BulbOutlined />}
                                >
                                  AI Insights
                                </GradientButton>
                                <GradientButton
                                  onClick={() => openDrawerFor("metrics")}
                                  icon={<DashboardOutlined />}
                                >
                                  Metrics
                                </GradientButton>
                              </>
                            )}
                          </Space>
                        </PanelCard>
                        <PanelCard size="small">
                          <Title level={5}>Live Summary</Title>
                          <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                              <StatWrapper color="#ffe6e6">
                                <Statistic
                                  title="Total Emissions"
                                  value={result?.total_emission ?? 0}
                                  suffix="kg CO₂"
                                />
                              </StatWrapper>
                            </Col>
                            <Col xs={24} sm={12}>
                              <StatWrapper color="#e6f7ff">
                                <Statistic
                                  title="Data Quality"
                                  value={
                                    result
                                      ? Math.round(
                                          ((result.analysis
                                            ?.successfulCalculations ?? 0) /
                                            Math.max(
                                              1,
                                              result.breakdown.length
                                            )) *
                                            100
                                        )
                                      : 0
                                  }
                                  suffix="%"
                                />
                                <Progress
                                  percent={
                                    result
                                      ? Math.round(
                                          ((result.analysis
                                            ?.successfulCalculations ?? 0) /
                                            Math.max(
                                              1,
                                              result.breakdown.length
                                            )) *
                                            100
                                        )
                                      : 0
                                  }
                                  strokeColor={{
                                    "0%": "#108ee9",
                                    "100%": "#87d068",
                                  }}
                                  status="active"
                                />
                              </StatWrapper>
                            </Col>
                          </Row>
                        </PanelCard>
                        <PanelCard size="small" style={{ marginTop: 16 }}>
                          <Title level={5}>Recent Breakdown</Title>
                          <div style={{ maxHeight: 240, overflow: "auto" }}>
                            {result?.breakdown?.length ? (
                              result.breakdown.map((b: any, i: number) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: 8,
                                    borderBottom: "1px solid #f0f0f0",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div>{b.name}</div>
                                    <div>{b.emission} kg</div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <Empty description="No breakdown yet" />
                            )}
                          </div>
                        </PanelCard>
                      </div>
                    </div>
                  </TabPane>

                  {/* Calculator Tab */}
                  <TabPane
                    key="calculator"
                    tab={
                      <span>
                        <CalculatorOutlined />
                        {screens.sm ? "Calculator" : ""}
                      </span>
                    }
                  >
                    <PanelCard>
                      <CalculatorForm
                        calculation={calculation}
                        onUpdate={updateCalculation}
                        onCalculate={calculateFootprint}
                        loading={loading}
                      />
                    </PanelCard>
                  </TabPane>

                  {/* Results Tab */}
                  <TabPane
                    key="results"
                    tab={
                      <span>
                        <PieChartOutlined />
                        {screens.sm ? "Results" : ""}
                      </span>
                    }
                  >
                    <PanelCard>
                      {error && (
                        <Alert
                          type="error"
                          message={error}
                          style={{ marginBottom: 16 }}
                        />
                      )}
                      {result ? (
                        <ResultDisplay
                          result={result}
                          onGetExplanation={getExplanation}
                          loading={loading}
                        />
                      ) : (
                        <Empty description="No calculation available" />
                      )}
                    </PanelCard>
                  </TabPane>
                </AntTabs>
              </PanelCard>
            </Content>
          </Layout>

          {/* Drawer */}
          <Drawer
            title={
              selectedWidget
                ? widgets.find((w) => w.id === selectedWidget)?.title
                : "Details"
            }
            placement="right"
            onClose={closeDrawer}
            open={drawerOpen}
            width={screens.md ? 560 : "100%"}
          >
            <div style={{ paddingBottom: 24 }}>{drawerContent}</div>
          </Drawer>
        </Container>
      </Main>
    </PageShell>
  );
};

export default CalculatorPage;
