import { isValidPhoneNumber } from "react-phone-number-input";
import * as Yup from "yup";
export const userValidationSchema = Yup.object().shape({
  userFirstName: Yup.string().required("First name is required"),
  userLastName: Yup.string().required("Last name is required"),
  userEmail: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  userMobile: Yup.string()
    .test("is-valid-phone", "Invalid phone number", (value) =>
      value ? isValidPhoneNumber(value) : false,
    )
    .required("Mobile is required"),
  orgId: Yup.string().required("Organization is required"),
  addresses: Yup.array().of(
    Yup.object().shape({
      addressLine1: Yup.string().required("Address line 1 is required"),
      addressLine2: Yup.string().required("Address line 2 is required"),
      city: Yup.string().required("City is required"),
      stateProvince: Yup.string().required("State is required"),
      postalCode: Yup.string().required("Postal code is required"),
      country: Yup.string().required("Country is required"),
    }),
  ),
  bloodGroup: Yup.string().required("Blood Group is required"),
  dateOfBirth: Yup.date().required("Date of Birth is required"),
  userIconStorageId: Yup.string().required("Profile picture is required"),
  password: Yup.string().when("$isEdit", {
    is: (isEdit: boolean) => !isEdit,
    then: (schema) => schema.required("Password is required"),
    otherwise: (schema) => schema,
  }),
  confirmPassword: Yup.string().when("$isEdit", {
    is: (isEdit: boolean) => !isEdit,
    then: (schema) =>
      schema
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm Password is required"),
    otherwise: (schema) => schema,
  }),
});

export const userFormElementsArray = [
  {
    id: "userFirstName",
    label: "First name",
    required: true,
    type: "textField",
  },
  { id: "userLastName", label: "Last name", required: true, type: "textField" },
  { id: "gender", label: "Gender", required: true, type: "textField" },
  { id: "userEmail", label: "Email", required: true, type: "textField" },
  {
    id: "userMobile",
    label: "Mobile Number",
    required: true,
    type: "textField",
  },
  {
    id: "password",
    label: "Password",
    required: true,
    type: "password",
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    required: true,
    type: "password",
  },
  {
    id: "userIconStorageId",
    label: "Profile Picture",
    type: "file",
    required: true,
  },

  {
    id: "orgId",
    label: "Organization",
    required: true,
    type: "textField",
  },
  { id: "bloodGroup", label: "Blood Group", required: true, type: "textField" },
  {
    id: "dateOfBirth",
    label: "Date of Birth",
    required: true,
    type: "date", // optional
  },
];

export const statusArray = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "New", value: "NEW" },
  { label: "Deleted", value: "DELETED" },
];

export const bloodGroupOptions = [
  { key: "A+", value: "A+" },
  { key: "A-", value: "A-" },
  { key: "B+", value: "B+" },
  { key: "B-", value: "B-" },
  { key: "O+", value: "O+" },
  { key: "O-", value: "O-" },
  { key: "AB+", value: "AB+" },
  { key: "AB-", value: "AB-" },
];

export const genderOptions = [
  { id: "MALE", value: "Male" },
  { id: "FEMALE", value: "Female" },
  { id: "OTHERS", value: "Others" },
  { id: "PREFER_NOT_TO_SAY", value: "Prefer Not to Say" },
];
