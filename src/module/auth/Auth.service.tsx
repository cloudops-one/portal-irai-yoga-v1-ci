import { useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";

export const useEmailSignIn = () => {
  const { mutate: emailSignIn, isPending: isEmailSignInPending } =
    useMutationApi({
      url: API_URLS?.AUTH_SIGN_IN_EMAIL,
      method: API_METHODS.POST,
    });

  return { emailSignIn, isEmailSignInPending };
};
export const useMobileSignIn = () => {
  const { mutate: mobileSignIn, isPending: isMobileSignInPending } =
    useMutationApi({
      url: API_URLS?.AUTH_SIGN_IN_MOBILE,
      method: API_METHODS.POST,
    });

  return { mobileSignIn, isMobileSignInPending };
};

export const useUserSignout = () => {
  const { mutate: userSignout } = useMutationApi({
    url: API_URLS.AUTH_SIGN_OUT,
    method: API_METHODS.POST,
  });
  return { userSignout };
};

export const useForgotPasswordEmail = () => {
  const {
    mutate: forgotPasswordEmail,
    isPending: isForgotPasswordEmailPending,
  } = useMutationApi({
    url: API_URLS.AUTH_FORGOT_PASSWORD_EMAIL,
    method: API_METHODS.POST,
  });
  return { forgotPasswordEmail, isForgotPasswordEmailPending };
};

export const useForgotPasswordMobile = () => {
  const {
    mutate: forgotPasswordMobile,
    isPending: isForgotPasswordMobilePending,
  } = useMutationApi({
    url: API_URLS.AUTH_FORGOT_PASSWORD_MOBILE,
    method: API_METHODS.POST,
  });
  return { forgotPasswordMobile, isForgotPasswordMobilePending };
};

export const useVerifyOtp = () => {
  const { mutate: verifyOtp, isPending: isVerfifyOtpPending } = useMutationApi({
    url: API_URLS?.AUTH_VERIFY_OTP,
    method: API_METHODS.POST,
  });

  return { verifyOtp, isVerfifyOtpPending };
};

export const useSignUpPassword = () => {
  const { mutate: signUpPassword, isPending: isSignUpPasswordPending } =
    useMutationApi({
      url: API_URLS?.AUTH_UPDATE_PASSWORD,
      method: API_METHODS.PUT,
    });

  return { signUpPassword, isSignUpPasswordPending };
};
