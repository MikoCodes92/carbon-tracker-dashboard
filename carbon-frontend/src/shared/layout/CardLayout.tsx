// src/shared/layout/CardLayout.tsx
import React, { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Card, Button, Space, Tooltip, Dropdown, Menu, message } from "antd";
import {
  DragOutlined,
  SettingOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

const LayoutContainer = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .react-grid-item {
    transition: all 0.2s ease;

    &.react-draggable-dragging {
      transition: none;
      z-index: 1000;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .react-resizable-handle {
      background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjciPjxwYXRoIGQ9Ik0gNiA2IEwgMCA2IEwgMCA0LjIgTCA0IDQuMiBMIDQuMiA0LjIgTCA0LjIgMCBMIDYgMCBMIDYgNiBMIDYgNiB6IiBmaWxsPSIjODA4MDgwIi8+PC9nPjwvc3ZnPg==")
        no-repeat;
      background-position: bottom right;
      padding: 0 3px 3px 0;
      background-repeat: no-repeat;
      background-origin: content-box;
      box-sizing: border-box;
      cursor: se-resize;
    }
  }
`;

const DashboardCard = styled(Card)<{ isDragging?: boolean }>`
  height: 100%;
  border-radius: 12px;
  box-shadow: ${(props) =>
    props.isDragging
      ? "0 8px 25px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.09)"};
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #d9d9d9;
  }

  .ant-card-head {
    border-bottom: 1px solid #f0f0f0;
    padding: 12px 16px;
    min-height: auto;

    .ant-card-head-title {
      font-weight: 600;
      font-size: 14px;
      padding: 0;
    }

    .ant-card-extra {
      padding: 0;
    }
  }

  .ant-card-body {
    padding: 16px;
    height: calc(100% - 57px);
    overflow: auto;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const CardTitle = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
`;

const CardActions = styled(Space)`
  .ant-btn {
    border: none;
    box-shadow: none;
  }
`;

const LayoutControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const ControlSection = styled(Space)`
  .ant-btn {
    border-radius: 8px;
  }
`;

interface DashboardItem {
  i: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

interface CardLayoutProps {
  items: DashboardItem[];
  onLayoutChange?: (layout: any) => void;
  onItemAdd?: (item: DashboardItem) => void;
  onItemRemove?: (itemId: string) => void;
  onItemEdit?: (itemId: string) => void;
  editable?: boolean;
}

export const CardLayout: React.FC<AdvancedCardLayoutProps> = ({
  items,
  onLayoutChange,
  onItemAdd,
  onItemRemove,
  onItemEdit,
  editable = true,
}) => {
  const [layouts, setLayouts] = useState<any>({});
  const [isDragging, setIsDragging] = useState(false);

  // Initialize layouts from items
  useEffect(() => {
    const initialLayout = items.map((item, index) => ({
      i: item.i,
      x: (index * 6) % 12,
      y: Math.floor(index / 2) * 3,
      w: 6,
      h: 3,
      minW: item.minW || 3,
      minH: item.minH || 2,
      maxW: item.maxW || 12,
      maxH: item.maxH || 6,
    }));

    setLayouts({
      lg: initialLayout,
      md: initialLayout,
      sm: initialLayout.map((item: any) => ({ ...item, w: 6, x: 0 })),
      xs: initialLayout.map((item: any) => ({ ...item, w: 4, x: 0 })),
      xxs: initialLayout.map((item: any) => ({ ...item, w: 2, x: 0 })),
    });
  }, [items]);

  const handleLayoutChange = (currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts);
    onLayoutChange?.(allLayouts);
  };

  const handleAddItem = () => {
    const newItem: DashboardItem = {
      i: `item-${Date.now()}`,
      title: "New Card",
      content: <div>New card content</div>,
      icon: <PlusOutlined />,
    };
    onItemAdd?.(newItem);
    message.success("New card added to dashboard");
  };

  const handleRemoveItem = (itemId: string) => {
    onItemRemove?.(itemId);
    message.info("Card removed from dashboard");
  };

  const handleEditItem = (itemId: string) => {
    onItemEdit?.(itemId);
  };

  const getCardMenu = (itemId: string) => (
    <Menu
      items={[
        {
          key: "edit",
          icon: <EditOutlined />,
          label: "Edit Card",
          onClick: () => handleEditItem(itemId),
        },
        {
          key: "duplicate",
          icon: <EyeOutlined />,
          label: "Duplicate",
        },
        {
          type: "divider",
        },
        {
          key: "delete",
          icon: <DeleteOutlined />,
          label: "Remove Card",
          danger: true,
          onClick: () => handleRemoveItem(itemId),
        },
      ]}
    />
  );

  const defaultProps = {
    className: "layout",
    rowHeight: 100,
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    containerPadding: [0, 0],
    margin: [16, 16],
    isDraggable: editable,
    isResizable: editable,
    draggableHandle: ".drag-handle",
  };

  return (
    <LayoutContainer>
      <LayoutControls>
        <div>
          <h3 style={{ margin: 0, color: "#262626" }}>Dashboard</h3>
          <p style={{ margin: 0, color: "#8c8c8c", fontSize: "14px" }}>
            Organize your carbon analysis widgets
          </p>
        </div>

        <ControlSection>
          <Tooltip title="Add new card">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
            >
              Add Card
            </Button>
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                { key: "save", label: "Save Layout" },
                { key: "reset", label: "Reset to Default" },
                { key: "export", label: "Export Layout" },
              ],
            }}
            trigger={["click"]}
          >
            <Button icon={<SettingOutlined />}>Layout Options</Button>
          </Dropdown>
        </ControlSection>
      </LayoutControls>

      <ResponsiveGridLayout
        {...defaultProps}
        layouts={layouts}
        onLayoutChange={handleLayoutChange}
        onDragStart={() => setIsDragging(true)}
        onDragStop={() => setIsDragging(false)}
        onResizeStart={() => setIsDragging(true)}
        onResizeStop={() => setIsDragging(false)}
      >
        {items.map((item) => (
          <div key={item.i}>
            <DashboardCard
              isDragging={isDragging}
              title={
                <CardHeader>
                  <CardTitle>
                    {editable && (
                      <Tooltip title="Drag to move">
                        <DragOutlined
                          className="drag-handle"
                          style={{ cursor: "move", color: "#8c8c8c" }}
                        />
                      </Tooltip>
                    )}
                    {item.icon}
                    {item.title}
                  </CardTitle>

                  {editable && (
                    <CardActions>
                      <Dropdown
                        overlay={getCardMenu(item.i)}
                        trigger={["click"]}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={<SettingOutlined />}
                          size="small"
                        />
                      </Dropdown>
                    </CardActions>
                  )}
                </CardHeader>
              }
              extra={!editable ? null : undefined}
            >
              {item.content}
            </DashboardCard>
          </div>
        ))}
      </ResponsiveGridLayout>
    </LayoutContainer>
  );
};
