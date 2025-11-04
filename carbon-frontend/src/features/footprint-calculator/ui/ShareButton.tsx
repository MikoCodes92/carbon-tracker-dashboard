// src/shared/ui/ShareButton.tsx
import React, { useState } from "react";
import { Button, Modal, Space, message, Input, Tooltip, Tag } from "antd";
import {
  ShareAltOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  LinkOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from "@ant-design/icons";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  EmailShareButton,
} from "react-share";
import styled from "styled-components";

const ShareModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 20px;
    overflow: hidden;
  }

  .ant-modal-header {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
  }
`;

const ShareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SharePlatform = styled.div<{ color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border: 2px solid ${(props) => props.color}20;
  border-radius: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    border-color: ${(props) => props.color};
    box-shadow: 0 12px 30px ${(props) => props.color}30;

    .share-icon {
      transform: scale(1.1);
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.color};
  }
`;

const PlatformIcon = styled.div<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  transition: all 0.3s ease;

  .anticon {
    font-size: 28px;
    color: white;
  }
`;

const PlatformName = styled.span`
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-align: center;
`;

const CopySection = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
  border: 1px solid #e2e8f0;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const StyledInput = styled(Input)`
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 14px;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CopyButton = styled(Button)`
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border: none;
  color: white;
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, #2563eb, #1e40af);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  }
`;

const ShareStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const StatTag = styled(Tag)`
  border-radius: 20px;
  padding: 6px 12px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  background: white;
`;

export interface ShareContent {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  image?: string;
}

interface ShareButtonProps {
  shareContent: ShareContent;
  variant?: "primary" | "secondary" | "text";
  size?: "small" | "middle" | "large";
  onShare?: (platform: string) => void;
  showShareCount?: boolean;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  shareContent,
  variant = "primary",
  size = "middle",
  onShare,
  showShareCount = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const platforms = [
    {
      key: "facebook",
      name: "Facebook",
      icon: <FacebookOutlined />,
      color: "#1877F2",
      component: FacebookShareButton,
    },
    {
      key: "twitter",
      name: "Twitter",
      icon: <TwitterOutlined />,
      color: "#1DA1F2",
      component: TwitterShareButton,
      extraProps: {
        hashtags: shareContent.hashtags || [
          "CarbonFootprint",
          "Sustainability",
        ],
      },
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      icon: <LinkedinOutlined />,
      color: "#0A66C2",
      component: LinkedinShareButton,
    },
    {
      key: "whatsapp",
      name: "WhatsApp",
      icon: <WhatsAppOutlined />,
      color: "#25D366",
      component: WhatsappShareButton,
    },
    {
      key: "email",
      name: "Email",
      icon: <MailOutlined />,
      color: "#EA4335",
      component: EmailShareButton,
      extraProps: {
        subject: shareContent.title,
        body: `${shareContent.description}\n\n${shareContent.url}`,
      },
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareContent.url);
      setCopied(true);
      message.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      message.error("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    onShare?.(platform);
    message.success(`Sharing via ${platform}`);
  };

  const getButtonProps = () => {
    const base = {
      icon: <ShareAltOutlined />,
      size,
      onClick: () => setIsModalVisible(true),
    };

    switch (variant) {
      case "primary":
        return {
          ...base,
          type: "primary" as const,
          style: {
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
            border: "none",
            borderRadius: "12px",
          },
        };
      case "secondary":
        return {
          ...base,
          type: "default" as const,
          style: {
            border: "1px solid #cbd5e1",
            borderRadius: "12px",
            color: "#64748b",
          },
        };
      case "text":
        return {
          ...base,
          type: "text" as const,
          style: { color: "#64748b" },
        };
    }
  };

  const getShareStats = () => {
    // In a real app, you might fetch these from analytics
    return {
      totalShares: 124,
      popularPlatform: "Twitter",
    };
  };

  const stats = showShareCount ? getShareStats() : null;

  const renderPlatformButton = (platform: (typeof platforms)[0]) => {
    const ShareComponent = platform.component;
    const extraProps = platform.extraProps || {};

    return (
      <ShareComponent
        key={platform.key}
        url={shareContent.url}
        title={shareContent.title}
        {...extraProps}
        onClick={() => handleShare(platform.key)}
      >
        <SharePlatform color={platform.color}>
          <PlatformIcon color={platform.color} className="share-icon">
            {platform.icon}
          </PlatformIcon>
          <PlatformName>{platform.name}</PlatformName>
        </SharePlatform>
      </ShareComponent>
    );
  };

  return (
    <>
      <Tooltip title="Share this report">
        <Button {...getButtonProps()}>Share Report</Button>
      </Tooltip>

      <ShareModal
        title={
          <Space direction="vertical" size={4}>
            <span style={{ fontSize: "18px", fontWeight: 700 }}>
              Share Report
            </span>
            {stats && (
              <ShareStats>
                <StatTag>
                  <strong>{stats.totalShares}</strong> total shares
                </StatTag>
                <StatTag>Most popular: {stats.popularPlatform}</StatTag>
              </ShareStats>
            )}
          </Space>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={520}
        centered
      >
        <ShareGrid>{platforms.map(renderPlatformButton)}</ShareGrid>

        <CopySection>
          <div style={{ fontWeight: 600, color: "#374151", marginBottom: 8 }}>
            <LinkOutlined style={{ marginRight: 8 }} />
            Share via link
          </div>
          <InputGroup>
            <StyledInput
              value={shareContent.url}
              readOnly
              placeholder="Loading share link..."
            />
            <CopyButton
              icon={<LinkOutlined />}
              onClick={handleCopyLink}
              type="primary"
            >
              {copied ? "Copied!" : "Copy"}
            </CopyButton>
          </InputGroup>
        </CopySection>
      </ShareModal>
    </>
  );
};
