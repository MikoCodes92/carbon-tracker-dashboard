// src/features/auth/components/LoginForm.tsx
import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Divider,
  message,
  Space,
  Typography,
  Alert,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { motion } from "framer-motion";

const { Title, Text, Link } = Typography;

// ---------- Styled Components ----------
const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  }
`;

const LoginCard = styled(motion(Card))`
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: none;
  overflow: hidden;

  .ant-card-body {
    padding: 48px 40px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
`;

const SocialLoginSection = styled.div`
  margin: 24px 0;
`;

const SocialButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  border: 2px solid #f0f0f0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  &.google {
    &:hover {
      border-color: #db4437;
      color: #db4437;
    }
  }

  &.github {
    &:hover {
      border-color: #333;
      color: #333;
    }
  }

  &.twitter {
    &:hover {
      border-color: #1da1f2;
      color: #1da1f2;
    }
  }
`;

const GradientButton = styled(Button)`
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.5);
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    color: white;
  }

  &:active {
    transform: translateY(0);
  }
`;

const FormItem = styled(Form.Item)`
  .ant-form-item-label {
    padding-bottom: 4px;
  }

  .ant-form-item-label > label {
    font-weight: 500;
    color: #2d3748;
  }

  .ant-input-affix-wrapper {
    height: 48px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    padding: 0 16px;
    transition: all 0.3s ease;

    &:hover,
    &.ant-input-affix-wrapper-focused {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  .ant-input {
    font-size: 14px;
  }
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

// ---------- Main Component ----------
interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Login values:", values);
      message.success("Welcome back! Login successful.");
      onSuccess?.();
    } catch (error) {
      message.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    message.info(`Logging in with ${provider}...`);
    // Implement social login logic here
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <LoginContainer>
      <LoginCard variants={cardVariants} initial="hidden" animate="visible">
        <LogoSection>
          <Logo>ECO</Logo>
          <Title level={2} style={{ margin: "8px 0 4px 0", color: "#2d3748" }}>
            Welcome Back
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Sign in to your CarbonTracker account
          </Text>
        </LogoSection>

        <SocialLoginSection>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <SocialButton
              icon={<GoogleOutlined />}
              className="google"
              onClick={() => handleSocialLogin("Google")}
            >
              Continue with Google
            </SocialButton>

            <SocialButton
              icon={<GithubOutlined />}
              className="github"
              onClick={() => handleSocialLogin("GitHub")}
            >
              Continue with GitHub
            </SocialButton>

            <SocialButton
              icon={<TwitterOutlined />}
              className="twitter"
              onClick={() => handleSocialLogin("Twitter")}
            >
              Continue with Twitter
            </SocialButton>
          </Space>
        </SocialLoginSection>

        <Divider>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Or continue with email
          </Text>
        </Divider>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          <FormItem
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: "Please enter your email address" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#a0aec0" }} />}
              placeholder="Enter your email"
              size="large"
            />
          </FormItem>

          <FormItem
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
              placeholder="Enter your password"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </FormItem>

          <RememberForgot>
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            >
              Remember me
            </Checkbox>
            <Link href="/forgot-password" style={{ fontSize: "14px" }}>
              Forgot password?
            </Link>
          </RememberForgot>

          <FormItem>
            <GradientButton
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              {loading ? "Signing in..." : "Sign In"}
            </GradientButton>
          </FormItem>
        </Form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link
              onClick={onSwitchToSignup}
              style={{ fontWeight: 600, fontSize: "14px" }}
            >
              Sign up now
            </Link>
          </Text>
        </div>

        <Alert
          message="Demo Account"
          description="Use any email and password to test the login"
          type="info"
          showIcon
          style={{ marginTop: "24px", borderRadius: "12px" }}
        />
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginForm;
