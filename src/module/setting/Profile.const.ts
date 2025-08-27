import * as yup from "yup";

export const ProfileFormElementsArray = [
  { id: "mobile", label: "Mobile", required: true, type: "text" },
  {
    id: "bloodGroup",
    label: "Blood Group",
    required: true,
    type: "select",
    options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  { id: "address", label: "Address", required: true, type: "text" },
  { id: "city", label: "City", required: true, type: "text" },
  { id: "state", label: "State", required: true, type: "text" },
  { id: "country", label: "Country", required: true, type: "text" },
  { id: "pincode", label: "Pincode", required: true, type: "text" },
  { id: "organizationName", label: "Organization Name", required: true },
];

export const profileAppButtonsArray = [
  { id: "appLanguage", label: "App Language" },
  { id: "notification", label: "Notification" },
  { id: "generalSetting", label: "General Setting" },
  { id: "inviteMyFriend", label: "Invite My Friend" },
];

export const profileAppButtonsSecondaryArray = [
  { id: "customerCare", label: "Customer Care" },
  { id: "rateUs", label: "Rate Us" },
  { id: "deleteYourAccount", label: "Delete Your Account" },
  { id: "reset-password", label: "Reset Password" },
];

export const profileFormValidationSchema: yup.ObjectSchema<
  Record<string, string>
> = yup.object().shape(
  ProfileFormElementsArray.reduce(
    (acc, field) => {
      if (field.id === "country") {
        return acc;
      }

      if (field.required) {
        if (field.id === "email") {
          acc[field.id] = yup
            .string()
            .email("Invalid email format")
            .required("Email is required");
        } else if (field.id === "mobile") {
          acc[field.id] = yup
            .string()
            .matches(/^\d+$/, "Mobile must contain only numbers")
            .required("Mobile is required");
        } else {
          acc[field.id] = yup.string().required(`${field.label} is required`);
        }
      }
      return acc;
    },
    {} as Record<string, yup.AnySchema>,
  ),
);
