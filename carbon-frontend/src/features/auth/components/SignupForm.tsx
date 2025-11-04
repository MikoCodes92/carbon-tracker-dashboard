// src/features/auth/components/SignupForm.tsx
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
  Steps,
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
  IdcardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { motion } from "framer-motion";

const { Title, Text, Link } = Typography;
const { Step } = Steps;

// ---------- Styled Components ----------
const SignupContainer = styled.div`
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

const SignupCard = styled(motion(Card))`
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: none;
  overflow: hidden;

  .ant-card-body {
    padding: 40px;
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const Logo = styled.div`
  width: 70px;
  height: 70px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
`;

const ProgressSteps = styled.div`
  margin-bottom: 32px;

  .ant-steps {
    .ant-steps-item-title {
      font-size: 12px;
    }
  }
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

const PasswordStrength = styled.div<{ strength: "weak" | "medium" | "strong" }>`
  margin-top: 8px;

  .strength-bar {
    height: 4px;
    border-radius: 2px;
    background: #e2e8f0;
    overflow: hidden;

    .fill {
      height: 100%;
      background: ${(props) => {
        switch (props.strength) {
          case "weak":
            return "#e53e3e";
          case "medium":
            return "#dd6b20";
          case "strong":
            return "#38a169";
          default:
            return "#e2e8f0";
        }
      }};
      width: ${(props) => {
        switch (props.strength) {
          case "weak":
            return "33%";
          case "medium":
            return "66%";
          case "strong":
            return "100%";
          default:
            return "0%";
        }
      }};
      transition: all 0.3s ease;
    }
  }

  .strength-text {
    font-size: 12px;
    color: ${(props) => {
      switch (props.strength) {
        case "weak":
          return "#e53e3e";
        case "medium":
          return "#dd6b20";
        case "strong":
          return "#38a169";
        default:
          return "#a0aec0";
      }
    }};
    margin-top: 4px;
    font-weight: 500;
  }
`;

// ---------- Main Component ----------
interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState<
    "weak" | "medium" | "strong"
  >("weak");

  const steps = [
    {
      title: "Account",
      icon: <UserOutlined />,
    },
    {
      title: "Profile",
      icon: <IdcardOutlined />,
    },
    {
      title: "Confirm",
      icon: <SafetyCertificateOutlined />,
    },
  ];

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength("weak");
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 1) setPasswordStrength("weak");
    else if (strength <= 3) setPasswordStrength("medium");
    else setPasswordStrength("strong");
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Signup values:", values);
      message.success(
        "Account created successfully! Welcome to CarbonTracker."
      );
      onSuccess?.();
    } catch (error) {
      message.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider: string) => {
    message.info(`Signing up with ${provider}...`);
    // Implement social signup logic here
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <FormItem
              label="Full Name"
              name="name"
              rules={[
                { required: true, message: "Please enter your full name" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#a0aec0" }} />}
                placeholder="Enter your full name"
                size="large"
              />
            </FormItem>

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
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#a0aec0" }} />}
                placeholder="Create a strong password"
                size="large"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                onChange={(e) => checkPasswordStrength(e.target.value)}
              />
              <PasswordStrength strength={passwordStrength}>
                <div className="strength-bar">
                  <div className="fill" />
                </div>
                <div className="strength-text">
                  {passwordStrength === "weak" && "Weak password"}
                  {passwordStrength === "medium" && "Medium strength"}
                  {passwordStrength === "strong" && "Strong password"}
                </div>
              </PasswordStrength>
            </FormItem>
          </>
        );

      case 1:
        return (
          <>
            <FormItem label="Company/Organization" name="company">
              <Input placeholder="Where do you work? (Optional)" size="large" />
            </FormItem>

            <FormItem label="Job Title" name="jobTitle">
              <Input placeholder="Your role (Optional)" size="large" />
            </FormItem>

            <FormItem label="Industry" name="industry">
              <Input placeholder="Your industry (Optional)" size="large" />
            </FormItem>

            <FormItem name="newsletter" valuePropName="checked">
              <Checkbox>
                Send me carbon reduction tips and industry insights
              </Checkbox>
            </FormItem>
          </>
        );

      case 2:
        return (
          <>
            <FormItem
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  required: true,
                  message: "You must accept the terms and conditions",
                },
              ]}
            >
              <Checkbox>
                I agree to the{" "}
                <Link href="/terms" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank">
                  Privacy Policy
                </Link>
              </Checkbox>
            </FormItem>

            <Alert
              message="Almost there!"
              description="By creating an account, you'll be able to track your carbon footprint, get personalized insights, and join our sustainability community."
              type="info"
              showIcon
              style={{ marginBottom: "16px", borderRadius: "12px" }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SignupContainer>
      <SignupCard variants={cardVariants} initial="hidden" animate="visible">
        <LogoSection>
          <Logo>ECO</Logo>
          <Title level={2} style={{ margin: "8px 0 4px 0", color: "#2d3748" }}>
            Join CarbonTracker
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Start your sustainability journey today
          </Text>
        </LogoSection>

        <ProgressSteps>
          <Steps current={currentStep} size="small">
            {steps.map((step) => (
              <Step key={step.title} title={step.title} icon={step.icon} />
            ))}
          </Steps>
        </ProgressSteps>

        {currentStep === 0 && (
          <SocialLoginSection>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <SocialButton
                icon={<GoogleOutlined />}
                className="google"
                onClick={() => handleSocialSignup("Google")}
              >
                Sign up with Google
              </SocialButton>

              <SocialButton
                icon={<GithubOutlined />}
                className="github"
                onClick={() => handleSocialSignup("GitHub")}
              >
                Sign up with GitHub
              </SocialButton>
            </Space>

            <Divider>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Or sign up with email
              </Text>
            </Divider>
          </SocialLoginSection>
        )}

        <Form
          form={form}
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          requiredMark="optional"
        >
          {renderStepContent()}

          <div style={{ marginTop: "32px" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              {currentStep > 0 && (
                <Button
                  onClick={prevStep}
                  size="large"
                  style={{ padding: "0 24px" }}
                >
                  Back
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <GradientButton
                  onClick={nextStep}
                  size="large"
                  style={{ marginLeft: "auto" }}
                >
                  Continue
                </GradientButton>
              ) : (
                <GradientButton
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{ marginLeft: currentStep > 0 ? "auto" : 0 }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </GradientButton>
              )}
            </Space>
          </div>
        </Form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Text type="secondary" style={{ fontSize: "14px" }}>
            Already have an account?{" "}
            <Link
              onClick={onSwitchToLogin}
              style={{ fontWeight: 600, fontSize: "14px" }}
            >
              Sign in here
            </Link>
          </Text>
        </div>

        <Alert
          message="Demo Mode"
          description="This is a demonstration. No actual account will be created."
          type="info"
          showIcon
          style={{ marginTop: "24px", borderRadius: "12px" }}
        />
      </SignupCard>
    </SignupContainer>
  );
};

export default SignupForm;
