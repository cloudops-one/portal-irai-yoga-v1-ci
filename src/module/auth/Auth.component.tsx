import { useState, useEffect } from "react";
import {
  TextField,
  Input,
  InputAdornment,
  IconButton,
  FormControl,
  Button,
  Box,
  Typography,
  InputLabel,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useForm, SubmitHandler } from "react-hook-form";
import axios, { AxiosError } from "axios";
import SnackBar from "../../component/SnackBar";
import { useStore } from "../../common/App.store";
import { LoginFormType, SignInResponse } from "./Auth.type";
import { loginValidationSchema, passwordResetSchema } from "./Auth.const";
import {
  useEmailSignIn,
  useMobileSignIn,
  useForgotPasswordEmail,
  useForgotPasswordMobile,
  useVerifyOtp,
  useSignUpPassword,
} from "./Auth.service";
import {
  getDeviceInfo,
  KEYCLOAK_USER,
  ROUTE_PATHS,
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
} from "../../common/App.const";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { MuiOtpInput } from "mui-one-time-password-input";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./Auth.module.css";
import keycloak, { initializeKeycloak } from "../../keycloak.ts";

interface ExtendedJwtPayload extends JwtPayload {
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
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>(
    SNACKBAR_SEVERITY.INFO,
  );
  const [phoneValue, setPhoneValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"email" | "mobile">("email");
  const [mode, setMode] = useState<"login" | "forgotPassword">("login");
  const [forgotPasswordStep, setForgotPasswordStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
    setValue,
    clearErrors,
    watch,
  } = useForm<LoginFormType>({
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
    context: {
      activeTab: activeTab,
      mode: mode,
      forgotPasswordStep: forgotPasswordStep,
    },
  });

  const passwordResetForm = useForm<LoginFormType>({
    resolver: yupResolver(
      passwordResetSchema as yup.ObjectSchema<LoginFormType>,
    ),
    mode: "onChange",
  });

  // Resend OTP timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
  };

  const { emailSignIn, isEmailSignInPending } = useEmailSignIn();
  const { mobileSignIn, isMobileSignInPending } = useMobileSignIn();
  const { forgotPasswordEmail, isForgotPasswordEmailPending } =
    useForgotPasswordEmail();
  const { forgotPasswordMobile, isForgotPasswordMobilePending } =
    useForgotPasswordMobile();
  const { verifyOtp, isVerfifyOtpPending } = useVerifyOtp();
  const { signUpPassword, isSignUpPasswordPending } = useSignUpPassword();

  const handleKeycloakLogin = async () => {
    try {
      const authenticated = await initializeKeycloak();

      if (authenticated) {
        const token = keycloak.token ?? "";
        const refreshToken = keycloak.refreshToken ?? "";
        setToken(token);
        localStorage.setItem("token", token);
        if (refreshToken && typeof refreshToken === "string") {
          setRefreshToken(refreshToken);
        }
        localStorage.setItem("role", KEYCLOAK_USER);
        const decoded = jwtDecode<ExtendedJwtPayload>(token);
        if (decoded?.sub) {
          setData("userId", decoded.sub);
          localStorage.setItem("userId", decoded.sub);
        }
        // Navigate after state updates
        setTimeout(() => {
          navigate(ROUTE_PATHS?.DASHBOARD);
        }, 100);
      }
    } catch (error) {
      console.error("Keycloak login error:", error);
      setSnackbarMessage("Keycloak authentication failed");
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const onSubmit: SubmitHandler<LoginFormType> = async (formData) => {
    localStorage.removeItem("userId");
    clearTokens();
    const deviceInfo = await getDeviceInfo();
    const payload = {
      ...(activeTab === "email"
        ? { userEmail: formData.email }
        : {
            userMobile: formData.userMobile,
          }),
      password: btoa(formData?.password ?? ""),
      ...deviceInfo,
    };

    const signinApi = activeTab === "email" ? emailSignIn : mobileSignIn;

    signinApi(payload, {
      onSuccess: (data) => {
        const resp = data as unknown as SignInResponse;
        if (
          resp?.data.accessToken &&
          typeof resp.data.accessToken === "string"
        ) {
          setToken(resp.data.accessToken);

          try {
            const decoded = jwtDecode<ExtendedJwtPayload>(
              resp.data.accessToken,
            );

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
          setTimeout(() => {
            navigate(ROUTE_PATHS?.DASHBOARD);
          }, 100);
        } else {
          setSnackbarMessage("Invalid access token received.");
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        }
      },
      onError: (err: AxiosError) => {
        let errMsg = err.message;
        if (axios.isAxiosError(err) && err.response?.data) {
          const data = err.response.data;
          if (
            typeof data === "object" &&
            data !== null &&
            "errors" in data &&
            (data as { errors?: Record<string, string> }).errors?.authRequestDto
          ) {
            errMsg = (data as { errors?: Record<string, string> }).errors!
              .authRequestDto;
          } else if (
            typeof data === "object" &&
            data !== null &&
            "errorMessage" in data
          ) {
            errMsg =
              (data as { errorMessage?: string }).errorMessage ?? err.message;
          }
        }
        setSnackbarMessage(errMsg);
        setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
        setOpenSnackbar(true);
      },
    });
  };

  const handleForgotPassword = async () => {
    try {
      const payload =
        activeTab === "email"
          ? { userEmail: getValues("email") }
          : {
              userMobile: getValues("userMobile"),
            };

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
        onError: (err: AxiosError) => {
          let errMsg = err.message;
          if (axios.isAxiosError(err) && err.response?.data) {
            const data = err.response.data;
            if (
              typeof data === "object" &&
              data !== null &&
              "errors" in data &&
              (data as { errors?: Record<string, string> }).errors
                ?.forgotPasswordMobileRequestDto
            ) {
              errMsg = (data as { errors?: Record<string, string> }).errors!
                .forgotPasswordMobileRequestDto;
            } else if (
              typeof data === "object" &&
              data !== null &&
              "errorMessage" in data
            ) {
              errMsg =
                (data as { errorMessage?: string }).errorMessage ?? err.message;
            }
          }
          setSnackbarMessage(errMsg);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
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
        onError: (err: AxiosError) => {
          let errMsg = err.message;
          if (axios.isAxiosError(err) && err.response?.data) {
            const data = err.response.data;
            if (
              typeof data === "object" &&
              data !== null &&
              "errors" in data &&
              (data as { errors?: Record<string, string> }).errors
                ?.verifyOtpRequestDto
            ) {
              errMsg = (data as { errors?: Record<string, string> }).errors!
                .verifyOtpRequestDto;
            } else if (
              typeof data === "object" &&
              data !== null &&
              "errorMessage" in data
            ) {
              errMsg =
                (data as { errorMessage?: string }).errorMessage ?? err.message;
            }
          }
          setSnackbarMessage(errMsg);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
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

    if (!isValid) {
      return; // Stop if validation fails
    }
    try {
      const { newPassword } = passwordResetForm.getValues();
      // Validate passwords match

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
        onError: (err: AxiosError) => {
          let errMsg = err.message; // fallback
          if (axios.isAxiosError(err) && err.response?.data) {
            const data = err.response.data;
            if (
              typeof data === "object" &&
              data !== null &&
              "errors" in data &&
              (data as { errors?: Record<string, string> }).errors?.newPassword
            ) {
              errMsg = (data as { errors?: Record<string, string> }).errors!
                .newPassword;
            } else if (
              typeof data === "object" &&
              data !== null &&
              "errorMessage" in data
            ) {
              errMsg =
                (data as { errorMessage?: string }).errorMessage ?? err.message;
            }
          }
          setSnackbarMessage(errMsg);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
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

  const handleBack = () => {
    if (mode === "forgotPassword") {
      if (forgotPasswordStep === 1) {
        setMode("login");
      } else {
        setForgotPasswordStep((prev) => (prev - 1) as 1 | 2);
        // Reset password fields when going back from step 3
        if (forgotPasswordStep === 3) {
          setValue("newPassword", "");
          setValue("confirmPassword", "");
        }
      }
    }
  };

  const emailValue = watch("email");
  const mobileValue = watch("userMobile");

  useEffect(() => {
    if (emailValue) clearErrors("email");
    if (mobileValue) clearErrors("userMobile");
  }, [emailValue, mobileValue, clearErrors]);

  useEffect(() => {
    if (
      mode === "login" ||
      (mode === "forgotPassword" && forgotPasswordStep === 1)
    ) {
      if (activeTab === "email") {
        setValue("userMobile", "");
        clearErrors("userMobile");
      } else {
        setValue("email", "");
        clearErrors("email");
      }
    }
  }, [activeTab, mode, forgotPasswordStep, setValue, clearErrors]);

  // Add this effect to reset form when switching between login/forgot
  useEffect(() => {
    if (mode === "login") {
      setValue("password", "");
      setValue("newPassword", "");
      setValue("confirmPassword", "");
      setOtp("");
      setForgotPasswordStep(1);
      setPasswordResetSuccess(false);
    }
  }, [mode, setValue]);

  const handlePhoneChange = (value: string = "") => {
    setPhoneValue(value);
    setValue("userMobile", value);
    clearErrors("userMobile");
  };

  return (
    <div className="min-h-screen min-w-screen bg-white md:bg-gray-100 flex items-center justify-center">
      <div className="flex bg-white md:shadow-lg rounded-2xl overflow-hidden p-6 md:p-0 lg:w-3/4 flex-col md:flex-row ">
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

          <Typography variant="h1" className="!mb-3 !text-black">
            {mode === "login" ? "Namaskaram" : "Forgot Password"}
          </Typography>

          {mode === "login" ? (
            <>
              <p className="text-md text-gray-600 text-center mb-1">
                Please Sign In to your account
              </p>

              <Box className="!w-full">
                {/* Tabs for email/mobile */}
                <Box className="!w-full">
                  <Box
                    sx={{
                      backgroundColor: "#adce74",
                      mb: 2,
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
                      sx={{
                        width: "100%",
                        minHeight: 48,
                      }}
                    >
                      <Tab
                        label="Email"
                        value="email"
                        sx={{
                          bgcolor:
                            activeTab === "email" ? "#4caf50" : "#adce74",
                          color: activeTab === "email" ? "#fff" : "#333",
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
                          "&:focus": {
                            outline: "none",
                          },
                        }}
                      />
                      <Tab
                        label="Mobile"
                        value="mobile"
                        sx={{
                          bgcolor:
                            activeTab === "mobile" ? "#4caf50" : "#adce74",
                          color: activeTab === "mobile" ? "#fff" : "#333",
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
                          "&:focus": {
                            outline: "none",
                          },
                        }}
                      />
                    </Tabs>
                  </Box>
                </Box>
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
                      style={{
                        "--PhoneInput-color--focus": "#1976d2",
                        "--PhoneInputCountryFlag-height": "24px",
                        "--PhoneInputCountryFlag-width": "24px",
                        "--PhoneInputCountrySelectArrow-color": "#555",
                        "--PhoneInputCountrySelectArrow-opacity": "1",
                      }}
                    />
                    {errors.userMobile && (
                      <Typography color="error" variant="caption">
                        {errors.userMobile.message}
                      </Typography>
                    )}
                  </div>
                )}

                <FormControl fullWidth variant="standard" className="mb-3">
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*\d).{8,}$/,
                        message:
                          "Must be at least 8 characters, include one uppercase letter and one number",
                      },
                    })}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {errors.password && (
                    <Typography color="error" variant="caption">
                      {errors.password.message}
                    </Typography>
                  )}
                </FormControl>

                <div className="flex justify-end mt-2 mb-3">
                  <Button
                    variant="text"
                    onClick={() => setMode("forgotPassword")}
                    data-testid="ForgotPasswordButton"
                    sx={{ textDecoration: "underline" }}
                  >
                    Forgot Password?
                  </Button>
                </div>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit(onSubmit)}
                  disabled={
                    isEmailSignInPending || isMobileSignInPending || !isValid
                  }
                  fullWidth
                  sx={{
                    mb: 2,
                  }}
                >
                  {isEmailSignInPending || isMobileSignInPending ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <Button onClick={handleKeycloakLogin}>
                  Sign in via Keycloak
                </Button>
              </Box>
            </>
          ) : (
            <div className="w-full">
              {forgotPasswordStep === 1 && (
                <div className="space-y-4">
                  <Typography
                    variant="subtitle2"
                    className="text-gray-500 text-center "
                    sx={{ mb: 2 }}
                  >
                    Enter your{" "}
                    {activeTab === "email" ? "email" : "phone number"} to reset
                    your password
                  </Typography>

                  {/* Tabs for email/mobile */}
                  <Box className="!w-full">
                    <Box
                      sx={{
                        backgroundColor: "#adce74",
                        mb: activeTab === "mobile" ? 5 : 7,
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
                        slotProps={{
                          indicator: { style: { display: "none" } },
                        }}
                        variant="fullWidth"
                        sx={{
                          width: "100%",
                          minHeight: 48,
                        }}
                      >
                        <Tab
                          label="Email"
                          value="email"
                          sx={{
                            bgcolor:
                              activeTab === "email" ? "#4caf50" : "#adce74",
                            color: activeTab === "email" ? "#fff" : "#333",
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
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        />
                        <Tab
                          label="Mobile"
                          value="mobile"
                          sx={{
                            bgcolor:
                              activeTab === "mobile" ? "#4caf50" : "#adce74",
                            color: activeTab === "mobile" ? "#fff" : "#333",
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
                            "&:focus": {
                              outline: "none",
                            },
                          }}
                        />
                      </Tabs>
                    </Box>
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
                        style={{
                          "--PhoneInput-color--focus": "#1976d2",
                          "--PhoneInputCountryFlag-height": "24px",
                          "--PhoneInputCountryFlag-width": "24px",
                          "--PhoneInputCountrySelectArrow-color": "#555",
                          "--PhoneInputCountrySelectArrow-opacity": "1",
                        }}
                      />
                      {errors.userMobile && (
                        <Typography color="error" variant="caption">
                          {errors.userMobile.message}
                        </Typography>
                      )}
                    </div>
                  )}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleForgotPassword}
                    disabled={
                      isForgotPasswordEmailPending ||
                      isForgotPasswordMobilePending ||
                      (activeTab === "email" && !getValues("email")) ||
                      (activeTab === "mobile" && !getValues("userMobile"))
                    }
                    fullWidth
                    sx={{
                      mb: 1,
                    }}
                  >
                    {isForgotPasswordEmailPending ||
                    isForgotPasswordMobilePending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              )}

              {forgotPasswordStep === 2 && (
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
                    className="text-center text-gray-600 "
                    sx={{ mt: 2, mb: 4 }}
                  >
                    Enter the 6-digit code sent to your{" "}
                    {activeTab === "email" ? "email" : "phone"}
                  </Typography>

                  <div className="flex justify-center ">
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

                  <div className="flex justify-center ">
                    {resendTimer > 0 ? (
                      <Typography variant="body2" className="text-gray-500">
                        Resend code in {resendTimer}s
                      </Typography>
                    ) : (
                      <Button
                        variant="text"
                        color="primary"
                        onClick={handleResendOtp}
                        className="font-medium"
                      >
                        Resend Code
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleVerifyOtp}
                    disabled={isVerfifyOtpPending || otp.length !== 6}
                    fullWidth
                    sx={{ mb: 3 }}
                  >
                    {isVerfifyOtpPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>
                </div>
              )}

              {forgotPasswordStep === 3 && (
                <div className="space-y-4">
                  <Typography
                    variant="h6"
                    className="text-center text-gray-500"
                    sx={{ mt: 6, mb: 2 }}
                  >
                    Reset Your Password
                  </Typography>

                  <FormControl fullWidth variant="standard" sx={{ mb: 2 }}>
                    <InputLabel
                      htmlFor="newPassword"
                      error={!!passwordResetForm.formState.errors.newPassword}
                    >
                      New Password
                    </InputLabel>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      {...passwordResetForm.register("newPassword")}
                      className="!mt-4"
                      error={!!passwordResetForm.formState.errors.newPassword}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {passwordResetForm.formState.errors.newPassword && (
                      <Typography color="error" variant="caption">
                        {passwordResetForm.formState.errors.newPassword.message}
                      </Typography>
                    )}
                  </FormControl>

                  <FormControl fullWidth variant="standard" className="mb-4">
                    <InputLabel
                      htmlFor="confirmPassword"
                      error={
                        !!passwordResetForm.formState.errors.confirmPassword
                      }
                    >
                      Confirm Password
                    </InputLabel>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      {...passwordResetForm.register("confirmPassword")}
                      error={
                        !!passwordResetForm.formState.errors.confirmPassword
                      }
                      className="!mb-1"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {passwordResetForm.formState.errors.confirmPassword && (
                      <Typography color="error" variant="caption">
                        {
                          passwordResetForm.formState.errors.confirmPassword
                            .message
                        }
                      </Typography>
                    )}
                  </FormControl>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={passwordResetForm.handleSubmit(
                      handleResetPassword,
                    )}
                    disabled={isSignUpPasswordPending}
                    fullWidth
                    sx={{ mb: 1, mt: 4 }}
                  >
                    {isSignUpPasswordPending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              )}
            </div>
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
