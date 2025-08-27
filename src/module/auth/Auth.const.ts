import { isValidPhoneNumber } from "react-phone-number-input";
import * as Yup from "yup";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordErrorMessage =
  "Must be at least 8 characters, include one uppercase letter and one number";

export const passwordResetSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .matches(passwordRegex, passwordErrorMessage),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords must match"),
});

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string().when("$activeTab", (activeTab, schema) => {
    return activeTab && activeTab[0] === "email"
      ? schema.required("Email is required").email("Invalid email address")
      : schema.notRequired();
  }),
  userMobile: Yup.string().when("$activeTab", (activeTab, schema) => {
    return activeTab && activeTab[0] === "mobile"
      ? schema
          .required("Mobile is required")
          .test("is-valid-phone", "Invalid phone number", (value) =>
            value ? isValidPhoneNumber(value) : false,
          )
      : schema.notRequired();
  }),
  password: Yup.string()
    .required("Password is required")
    .matches(passwordRegex, passwordErrorMessage),
});

export const USERTYPE: string = "PORTAL_USER";
export const DEFAULT_USER_STATUS: string = "INACTIVE";
