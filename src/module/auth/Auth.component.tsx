import { useState, useEffect } from "react";
import {
  useForm,
  UseFormReturn,
  FieldError,
  UseFormRegisterReturn,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { LoginFormType, SignInResponse } from "./Auth.type";
import { loginValidationSchema, passwordResetSchema } from "./Auth.const";
import {
  Tabs,
  Tab,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

export const useAuthForm = (
  activeTab: "email" | "mobile",
  mode: "login" | "forgotPassword",
  forgotPasswordStep: 1 | 2 | 3,
) => {
  const loginForm = useForm<LoginFormType>({
    resolver: yupResolver(
      loginValidationSchema as yup.ObjectSchema<LoginFormType>,
    ),
    defaultValues: {
      email: "",
      userMobile: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
    context: { activeTab, mode, forgotPasswordStep },
  });

  const passwordResetForm = useForm<LoginFormType>({
    resolver: yupResolver(
      passwordResetSchema as yup.ObjectSchema<LoginFormType>,
    ),
    mode: "onChange",
  });

  return { loginForm, passwordResetForm };
};

// hooks/useOtpTimer.ts
export const useOtpTimer = () => {
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const startResendTimer = () => setResendTimer(60);

  return { resendTimer, startResendTimer };
};

// useKeycloakAuth.ts
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import keycloak, { initializeKeycloak } from "../../keycloak";
import { useStore } from "../../common/App.store";
import {
  KEYCLOAK_USER,
  ROUTE_PATHS,
  getDeviceInfo,
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
} from "../../common/App.const";
interface ExtendedJwtPayload {
  sub: string;
  authorities: { authority: string }[];
  organizationId: string;
  level: string;
  permissions: string[];
  iat: number;
  exp: number;
  groups: string[];
  role: string;
}

export const useKeycloakAuth = (onError: (message: string) => void) => {
  const navigate = useNavigate();
  const { setToken, setData, setRefreshToken } = useStore();

  useEffect(() => {
    const checkKeycloakReturn = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const hasKeycloakParams =
        hashParams.has("state") ||
        hashParams.has("session_state") ||
        hashParams.has("code") ||
        searchParams.has("state") ||
        searchParams.has("session_state") ||
        searchParams.has("code");

      if (!hasKeycloakParams) return;

      try {
        const authenticated = await initializeKeycloak("check-sso");

        if (authenticated && keycloak.token) {
          const token = keycloak.token;
          const refreshToken = keycloak.refreshToken ?? "";

          localStorage.setItem("token", token);
          localStorage.setItem("role", JSON.stringify(KEYCLOAK_USER));

          const decoded = jwtDecode<ExtendedJwtPayload>(token);
          if (decoded?.sub) {
            localStorage.setItem("userId", decoded.sub);
            setData("userId", decoded.sub);
          }

          setToken(token);
          if (refreshToken) {
            setRefreshToken(refreshToken);
          }

          navigate(ROUTE_PATHS?.DASHBOARD);
        }
      } catch (error) {
        console.error("Keycloak authentication error:", error);
        onError("Keycloak authentication failed");
      }
    };

    checkKeycloakReturn();
  }, [navigate, setToken, setData, setRefreshToken]);

  const handleKeycloakLogin = async () => {
    try {
      await initializeKeycloak("login-required");
    } catch (error) {
      console.error("Keycloak login error:", error);
      onError("Keycloak authentication failed");
    }
  };

  return { handleKeycloakLogin };
};

export const useFormSideEffects = (
  loginForm: UseFormReturn<LoginFormType>,
  activeTab: "email" | "mobile",
  mode: "login" | "forgotPassword",
  forgotPasswordStep: 1 | 2 | 3,
) => {
  const emailValue = loginForm.watch("email");
  const mobileValue = loginForm.watch("userMobile");

  // Clear errors when values change
  useEffect(() => {
    if (emailValue) loginForm.clearErrors("email");
    if (mobileValue) loginForm.clearErrors("userMobile");
  }, [emailValue, mobileValue, loginForm]);

  // Clear opposite field when switching tabs
  useEffect(() => {
    if (
      mode === "login" ||
      (mode === "forgotPassword" && forgotPasswordStep === 1)
    ) {
      if (activeTab === "email") {
        loginForm.setValue("userMobile", "");
        loginForm.clearErrors("userMobile");
      } else {
        loginForm.setValue("email", "");
        loginForm.clearErrors("email");
      }
    }
  }, [activeTab, mode, forgotPasswordStep, loginForm]);

  // Reset form when switching to login mode
  useEffect(() => {
    if (mode === "login") {
      loginForm.setValue("password", "");
      loginForm.setValue("newPassword", "");
      loginForm.setValue("confirmPassword", "");
    }
  }, [mode, loginForm]);
};

// ==================== UTILITY FUNCTIONS ====================
import axios, { AxiosError } from "axios";
export const extractErrorMessage = (err: AxiosError): string => {
  let errMsg = err.message;

  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data;

    if (typeof data === "object" && data !== null && "errors" in data) {
      const errors = (data as { errors?: Record<string, string> }).errors;

      // Check various possible error fields
      const errorFields = [
        "authRequestDto",
        "forgotPasswordMobileRequestDto",
        "verifyOtpRequestDto",
        "newPassword",
      ];

      for (const field of errorFields) {
        if (errors?.[field]) {
          return errors[field];
        }
      }
    } else if (
      typeof data === "object" &&
      data !== null &&
      "errorMessage" in data
    ) {
      errMsg = (data as { errorMessage?: string }).errorMessage ?? err.message;
    }
  }

  return errMsg;
};

// ==================== SUB-COMPONENTS ====================

interface TabSelectorProps {
  activeTab: "email" | "mobile";
  setActiveTab: (tab: "email" | "mobile") => void;
  marginBottom?: number;
}

const getTabStyles = (isActive: boolean) => ({
  bgcolor: isActive ? "#4caf50" : "#adce74",
  color: isActive ? "#fff" : "#333",
  borderRadius: 2,
  minWidth: 120,
  fontWeight: 600,
  border: "none",
  boxShadow: "none",
  transition: "background 0.2s, color 0.2s",
  "&.Mui-selected": {
    color: "#fff",
    bgcolor: "#4caf50",
    border: "none",
    boxShadow: "none",
    outline: "none",
  },
  "&:focus": { outline: "none" },
});

export const TabSelector: React.FC<TabSelectorProps> = ({
  activeTab,
  setActiveTab,
  marginBottom = 2,
}) => {
  return (
    <Box
      sx={{
        backgroundColor: "#adce74",
        mb: marginBottom,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        borderRadius: 2,
        p: 0,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        slotProps={{ indicator: { style: { display: "none" } } }}
        variant="fullWidth"
        sx={{ width: "100%", minHeight: 48 }}
      >
        <Tab
          label="Email"
          value="email"
          sx={getTabStyles(activeTab === "email")}
        />
        <Tab
          label="Mobile"
          value="mobile"
          sx={getTabStyles(activeTab === "mobile")}
        />
      </Tabs>
    </Box>
  );
};

import PhoneInput from "react-phone-number-input";
import styles from "./Auth.module.css";

interface PhoneInputFieldProps {
  phoneValue: string;
  handlePhoneChange: (value?: string) => void;
  error?: FieldError;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  phoneValue,
  handlePhoneChange,
  error,
}) => {
  return (
    <div className={styles["phone-input-wrapper"]}>
      <PhoneInput
        international
        defaultCountry="IN"
        value={phoneValue}
        onChange={handlePhoneChange}
        withCountryCallingCode
        countryCallingCodeEditable={false}
        placeholder="Enter phone number"
        className={styles.PhoneInput}
        inputClassName={styles.PhoneInputInput}
        dropdownClassName={styles.PhoneInputCountryDropdown}
        style={
          {
            "--PhoneInput-color--focus": "#1976d2",
            "--PhoneInputCountryFlag-height": "24px",
            "--PhoneInputCountryFlag-width": "24px",
            "--PhoneInputCountrySelectArrow-color": "#555",
            "--PhoneInputCountrySelectArrow-opacity": "1",
          } as React.CSSProperties
        }
      />
      {error && (
        <Typography color="error" variant="caption">
          {error.message}
        </Typography>
      )}
    </div>
  );
};

// components/PasswordField.tsx
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface PasswordFieldProps {
  id: string;
  label: string;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  register: UseFormRegisterReturn;
  error?: FieldError;
  className?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  showPassword,
  setShowPassword,
  register,
  error,
  className = "",
}) => {
  return (
    <FormControl fullWidth variant="standard" className={className}>
      <InputLabel htmlFor={id} error={!!error}>
        {label}
      </InputLabel>
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        {...register}
        error={!!error}
        endAdornment={
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      {error && (
        <Typography color="error" variant="caption">
          {error.message}
        </Typography>
      )}
    </FormControl>
  );
};

// components/LoginForm.tsx

interface LoginFormProps {
  loginForm: UseFormReturn<LoginFormType>;
  activeTab: "email" | "mobile";
  setActiveTab: (tab: "email" | "mobile") => void;
  phoneValue: string;
  handlePhoneChange: (value?: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onKeycloakLogin: () => void;
  isLoading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  loginForm,
  activeTab,
  setActiveTab,
  phoneValue,
  handlePhoneChange,
  showPassword,
  setShowPassword,
  onSubmit,
  onForgotPassword,
  onKeycloakLogin,
  isLoading,
}) => {
  const {
    register,
    formState: { errors, isValid },
  } = loginForm;

  return (
    <>
      <Typography variant="h1" className="!mb-3 !text-black">
        Namaskaram
      </Typography>
      <p className="text-md text-gray-600 text-center mb-1">
        Please Sign In to your account
      </p>

      <Box className="!w-full">
        <TabSelector activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "email" ? (
          <TextField
            label="Email"
            variant="standard"
            fullWidth
            {...register("email", { required: "Email is required" })}
            error={!!errors.email}
            helperText={errors.email?.message}
            className="!mb-4"
          />
        ) : (
          <PhoneInputField
            phoneValue={phoneValue}
            handlePhoneChange={handlePhoneChange}
            error={errors.userMobile}
          />
        )}

        <PasswordField
          id="password"
          label="Password"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          register={register("password", {
            required: "Password is required",
            pattern: {
              value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
              message:
                "Must be at least 8 characters, include one uppercase letter and one number",
            },
          })}
          error={errors.password}
          className="mb-3"
        />

        <div className="flex justify-end mt-2 mb-3">
          <Button
            variant="text"
            onClick={onForgotPassword}
            data-testid="ForgotPasswordButton"
            sx={{ textDecoration: "underline" }}
          >
            Forgot Password?
          </Button>
        </div>

        <Button
          variant="contained"
          size="large"
          onClick={onSubmit}
          disabled={isLoading || !isValid}
          fullWidth
          sx={{ mb: 2 }}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Sign In"
          )}
        </Button>

        <Button onClick={onKeycloakLogin}>Sign in via Keycloak</Button>
      </Box>
    </>
  );
};

// components/ForgotPasswordStep1.tsx
interface ForgotPasswordStep1Props {
  activeTab: "email" | "mobile";
  setActiveTab: (tab: "email" | "mobile") => void;
  loginForm: UseFormReturn<LoginFormType>;
  phoneValue: string;
  handlePhoneChange: (value?: string) => void;
  onSendCode: () => void;
  isLoading: boolean;
}

export const ForgotPasswordStep1: React.FC<ForgotPasswordStep1Props> = ({
  activeTab,
  setActiveTab,
  loginForm,
  phoneValue,
  handlePhoneChange,
  onSendCode,
  isLoading,
}) => {
  const {
    register,
    formState: { errors },
    getValues,
  } = loginForm;

  const isButtonDisabled =
    isLoading ||
    (activeTab === "email" && !getValues("email")) ||
    (activeTab === "mobile" && !getValues("userMobile"));

  return (
    <div className="space-y-4">
      <Typography
        variant="subtitle2"
        className="text-gray-500 text-center"
        sx={{ mb: 2 }}
      >
        Enter your {activeTab === "email" ? "email" : "phone number"} to reset
        your password
      </Typography>

      <Box className="!w-full">
        <TabSelector
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          marginBottom={activeTab === "mobile" ? 5 : 7}
        />
      </Box>

      {activeTab === "email" ? (
        <TextField
          label="Email"
          variant="standard"
          fullWidth
          {...register("email", { required: "Email is required" })}
          error={!!errors.email}
          helperText={errors.email?.message}
          className="!mb-16"
        />
      ) : (
        <PhoneInputField
          phoneValue={phoneValue}
          handlePhoneChange={handlePhoneChange}
          error={errors.userMobile}
        />
      )}

      <Button
        variant="contained"
        size="large"
        onClick={onSendCode}
        disabled={isButtonDisabled}
        fullWidth
        sx={{ mb: 1 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Send Verification Code"
        )}
      </Button>
    </div>
  );
};

// components/ForgotPasswordStep2.tsx
import { MuiOtpInput } from "mui-one-time-password-input";

interface ForgotPasswordStep2Props {
  activeTab: "email" | "mobile";
  otp: string;
  setOtp: (otp: string) => void;
  resendTimer: number;
  onVerifyOtp: () => void;
  onResendOtp: () => void;
  isLoading: boolean;
}

export const ForgotPasswordStep2: React.FC<ForgotPasswordStep2Props> = ({
  activeTab,
  otp,
  setOtp,
  resendTimer,
  onVerifyOtp,
  onResendOtp,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <Typography
        variant="h6"
        className="text-center text-gray-500"
        sx={{ mt: 5 }}
      >
        Verify Your Identity
      </Typography>
      <Typography
        variant="body2"
        className="text-center text-gray-600"
        sx={{ mt: 2, mb: 4 }}
      >
        Enter the 6-digit code sent to your{" "}
        {activeTab === "email" ? "email" : "phone"}
      </Typography>

      <div className="flex justify-center">
        <MuiOtpInput
          value={otp}
          onChange={setOtp}
          length={6}
          TextFieldsProps={{
            variant: "standard",
            className: "mx-1 w-8 h-14",
            inputProps: {
              inputMode: "numeric",
              pattern: "[0-9]*",
              className: "text-center font-mono",
            },
          }}
        />
      </div>

      <div className="flex justify-center">
        {resendTimer > 0 ? (
          <Typography variant="body2" className="text-gray-500">
            Resend code in {resendTimer}s
          </Typography>
        ) : (
          <Button
            variant="text"
            color="primary"
            onClick={onResendOtp}
            className="font-medium"
          >
            Resend Code
          </Button>
        )}
      </div>

      <Button
        variant="contained"
        size="large"
        onClick={onVerifyOtp}
        disabled={isLoading || otp.length !== 6}
        fullWidth
        sx={{ mb: 3 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Verify & Continue"
        )}
      </Button>
    </div>
  );
};

// components/ForgotPasswordStep3.tsx

interface ForgotPasswordStep3Props {
  passwordResetForm: UseFormReturn<LoginFormType>;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onResetPassword: () => void;
  isLoading: boolean;
}

export const ForgotPasswordStep3: React.FC<ForgotPasswordStep3Props> = ({
  passwordResetForm,
  showPassword,
  setShowPassword,
  onResetPassword,
  isLoading,
}) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = passwordResetForm;

  return (
    <div className="space-y-4">
      <Typography
        variant="h6"
        className="text-center text-gray-500"
        sx={{ mt: 6, mb: 2 }}
      >
        Reset Your Password
      </Typography>

      <PasswordField
        id="newPassword"
        label="New Password"
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        register={register("newPassword")}
        error={errors.newPassword}
        className="!mb-2 !mt-4"
      />

      <PasswordField
        id="confirmPassword"
        label="Confirm Password"
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        register={register("confirmPassword")}
        error={errors.confirmPassword}
        className="mb-4"
      />

      <Button
        variant="contained"
        size="large"
        onClick={handleSubmit(onResetPassword)}
        disabled={isLoading}
        fullWidth
        sx={{ mb: 1, mt: 4 }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Update Password"
        )}
      </Button>
    </div>
  );
};

// components/ForgotPasswordFlow.tsx
interface ForgotPasswordFlowProps {
  step: 1 | 2 | 3;
  activeTab: "email" | "mobile";
  setActiveTab: (tab: "email" | "mobile") => void;
  loginForm: UseFormReturn<LoginFormType>;
  passwordResetForm: UseFormReturn<LoginFormType>;
  phoneValue: string;
  handlePhoneChange: (value?: string) => void;
  otp: string;
  setOtp: (otp: string) => void;
  resendTimer: number;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSendCode: () => void;
  onVerifyOtp: () => void;
  onResetPassword: () => void;
  onResendOtp: () => void;
  isLoadingSendCode: boolean;
  isLoadingVerifyOtp: boolean;
  isLoadingResetPassword: boolean;
}

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({
  step,
  activeTab,
  setActiveTab,
  loginForm,
  passwordResetForm,
  phoneValue,
  handlePhoneChange,
  otp,
  setOtp,
  resendTimer,
  showPassword,
  setShowPassword,
  onSendCode,
  onVerifyOtp,
  onResetPassword,
  onResendOtp,
  isLoadingSendCode,
  isLoadingVerifyOtp,
  isLoadingResetPassword,
}) => {
  if (step === 1) {
    return (
      <ForgotPasswordStep1
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loginForm={loginForm}
        phoneValue={phoneValue}
        handlePhoneChange={handlePhoneChange}
        onSendCode={onSendCode}
        isLoading={isLoadingSendCode}
      />
    );
  }

  if (step === 2) {
    return (
      <ForgotPasswordStep2
        activeTab={activeTab}
        otp={otp}
        setOtp={setOtp}
        resendTimer={resendTimer}
        onVerifyOtp={onVerifyOtp}
        onResendOtp={onResendOtp}
        isLoading={isLoadingVerifyOtp}
      />
    );
  }

  return (
    <ForgotPasswordStep3
      passwordResetForm={passwordResetForm}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      onResetPassword={onResetPassword}
      isLoading={isLoadingResetPassword}
    />
  );
};

// ==================== MAIN AUTH COMPONENT ====================

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SnackBar from "../../component/SnackBar";
import {
  useEmailSignIn,
  useMobileSignIn,
  useForgotPasswordEmail,
  useForgotPasswordMobile,
  useVerifyOtp,
  useSignUpPassword,
} from "./Auth.service";

interface ExtendedJwtPayload {
  sub: string;
  authorities: { authority: string }[];
  organizationId: string;
  level: string;
  permissions: string[];
  iat: number;
  exp: number;
  groups: string[];
  role: string;
}

interface ForgotPasswordResponse {
  message: string;
  timestamp: string;
  data: {
    userId: string;
  };
}

const Auth = () => {
  const [forgotUserId, setForgotUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setToken, setData, setRefreshToken, clearTokens } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneValue, setPhoneValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
  const [mode, setMode] = useState<"login" | "forgotPassword">("login");
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>(
    SNACKBAR_SEVERITY.INFO,
  );

  // Custom hooks
  const { loginForm, passwordResetForm } = useAuthForm(
    activeTab,
    mode,
    forgotPasswordStep,
  );
  const { resendTimer, startResendTimer } = useOtpTimer();

  const showError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
    setOpenSnackbar(true);
  };

  const { handleKeycloakLogin } = useKeycloakAuth(showError);

  // API hooks
  const { emailSignIn, isEmailSignInPending } = useEmailSignIn();
  const { mobileSignIn, isMobileSignInPending } = useMobileSignIn();
  const { forgotPasswordEmail, isForgotPasswordEmailPending } =
    useForgotPasswordEmail();
  const { forgotPasswordMobile, isForgotPasswordMobilePending } =
    useForgotPasswordMobile();
  const { verifyOtp, isVerfifyOtpPending } = useVerifyOtp();
  const { signUpPassword, isSignUpPasswordPending } = useSignUpPassword();

  // Use form side effects
  useFormSideEffects(loginForm, activeTab, mode, forgotPasswordStep);

  // Handlers
  const handlePhoneChange = (value: string = "") => {
    setPhoneValue(value);
    loginForm.setValue("userMobile", value);
    loginForm.clearErrors("userMobile");
  };

  const handleBack = () => {
    if (mode === "forgotPassword") {
      if (forgotPasswordStep === 1) {
        setMode("login");
      } else {
        setForgotPasswordStep((prev) => (prev - 1) as 1 | 2);
        if (forgotPasswordStep === 3) {
          loginForm.setValue("newPassword", "");
          loginForm.setValue("confirmPassword", "");
        }
      }
    }
  };

  const handleLoginSuccess = (data: unknown) => {
    const resp = data as SignInResponse;
    if (resp?.data.accessToken && typeof resp.data.accessToken === "string") {
      setToken(resp.data.accessToken);

      try {
        const decoded = jwtDecode<ExtendedJwtPayload>(resp.data.accessToken);
        if (decoded?.role) {
          setData("role", decoded.role);
          localStorage.setItem("role", JSON.stringify(decoded.role));
        }
        if (decoded?.sub) {
          setData("userId", decoded.sub);
          localStorage.setItem("userId", decoded.sub);
        }
      } catch (error) {
        console.error("Error decoding access token:", error);
      }

      if (
        resp.data.refreshToken &&
        typeof resp.data.refreshToken === "string"
      ) {
        setRefreshToken(resp.data.refreshToken);
      }

      setSnackbarMessage("Logged in successfully!");
      setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
      setOpenSnackbar(true);
      setTimeout(() => navigate(ROUTE_PATHS?.DASHBOARD), 100);
    } else {
      setSnackbarMessage("Invalid access token received.");
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const handleApiError = (err: AxiosError) => {
    const errMsg = extractErrorMessage(err);
    setSnackbarMessage(errMsg);
    setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
    setOpenSnackbar(true);
  };

  const handleLogin = loginForm.handleSubmit(async (formData) => {
    localStorage.removeItem("userId");
    clearTokens();
    const deviceInfo = await getDeviceInfo();
    const payload = {
      ...(activeTab === "email"
        ? { userEmail: formData.email }
        : { userMobile: formData.userMobile }),
      password: btoa(formData?.password ?? ""),
      ...deviceInfo,
    };

    const signinApi = activeTab === "email" ? emailSignIn : mobileSignIn;
    signinApi(payload, {
      onSuccess: handleLoginSuccess,
      onError: handleApiError,
    });
  });

  const handleForgotPassword = async () => {
    try {
      const payload =
        activeTab === "email"
          ? { userEmail: loginForm.getValues("email") }
          : { userMobile: loginForm.getValues("userMobile") };

      const apiCall =
        activeTab === "email" ? forgotPasswordEmail : forgotPasswordMobile;

      apiCall(payload, {
        onSuccess: (data) => {
          const resp = data as unknown as ForgotPasswordResponse;
          const userId = resp.data.userId;
          setForgotUserId(userId);
          setSnackbarMessage(resp?.message || "OTP sent successfully!");
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
          setForgotPasswordStep(2);
          startResendTimer();
        },
        onError: handleApiError,
      });
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const payload = { userId: forgotUserId, otp };
      verifyOtp(payload, {
        onSuccess: () => {
          setSnackbarMessage("OTP verified successfully!");
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
          setForgotPasswordStep(3);
        },
        onError: handleApiError,
      });
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const handleResetPassword = async () => {
    const isValid = await passwordResetForm.trigger();
    if (!isValid) return;

    try {
      const { newPassword } = passwordResetForm.getValues();
      const payload = {
        userId: forgotUserId,
        password: btoa(newPassword ?? ""),
      };

      signUpPassword(payload, {
        onSuccess: () => {
          setSnackbarMessage("Password changed successfully!");
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
          setPasswordResetSuccess(true);
          setTimeout(() => {
            setMode("login");
            setForgotPasswordStep(1);
            setPasswordResetSuccess(false);
          }, 1500);
        },
        onError: handleApiError,
      });
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    handleForgotPassword();
    startResendTimer();
  };

  return (
    <div className="min-h-screen min-w-screen bg-white md:bg-gray-100 flex items-center justify-center">
      <div className="flex bg-white md:shadow-lg rounded-2xl overflow-hidden p-6 md:p-0 lg:w-3/4 flex-col md:flex-row">
        <img
          src="https://cloudops-one.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/assets/irai-yoga-vethathiri-banner.jpg"
          alt="Yoga"
          className="w-full md:w-3/5 h-auto rounded-2xl"
        />

        <div className="relative flex flex-col justify-center items-center w-full md:w-1/3 md:ml-5 p-5">
          {(mode === "forgotPassword" || passwordResetSuccess) && (
            <IconButton
              onClick={handleBack}
              className="absolute top-10 right-40 text-gray-500 hover:text-gray-700"
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {mode === "login" ? (
            <LoginForm
              loginForm={loginForm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              phoneValue={phoneValue}
              handlePhoneChange={handlePhoneChange}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onSubmit={handleLogin}
              onForgotPassword={() => setMode("forgotPassword")}
              onKeycloakLogin={handleKeycloakLogin}
              isLoading={isEmailSignInPending || isMobileSignInPending}
            />
          ) : (
            <>
              <Typography variant="h1" className="!mb-3 !text-black">
                Forgot Password
              </Typography>
              <ForgotPasswordFlow
                step={forgotPasswordStep}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                loginForm={loginForm}
                passwordResetForm={passwordResetForm}
                phoneValue={phoneValue}
                handlePhoneChange={handlePhoneChange}
                otp={otp}
                setOtp={setOtp}
                resendTimer={resendTimer}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onSendCode={handleForgotPassword}
                onVerifyOtp={handleVerifyOtp}
                onResetPassword={handleResetPassword}
                onResendOtp={handleResendOtp}
                isLoadingSendCode={
                  isForgotPasswordEmailPending || isForgotPasswordMobilePending
                }
                isLoadingVerifyOtp={isVerfifyOtpPending}
                isLoadingResetPassword={isSignUpPasswordPending}
              />
            </>
          )}
        </div>
      </div>
      <SnackBar
        openSnackbar={openSnackbar}
        closeSnackbar={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
        duration={3000}
      />
    </div>
  );
};

export default Auth;
