import { isValidPhoneNumber } from "react-phone-number-input";
import * as Yup from "yup";

export const eventValidationSchema = Yup.object().shape({
  eventName: Yup.string().required("Event Name is required"),
  eventDescription: Yup.string().required("Description is required"),
  eventStartDateTime: Yup.string().required("Start Date & Time is required"),
  eventEndDateTime: Yup.string().required("End Date & Time is required"),
  addresses: Yup.array()
    .of(
      Yup.object().shape({
        addressLine1: Yup.string().required("Address Line 1 is required"),
        addressLine2: Yup.string().required("Address Line 2 is required"),
        city: Yup.string().required("City is required"),
        stateProvince: Yup.string().required("State is required"),
        postalCode: Yup.string().required("Postal Code is required"),
        country: Yup.string().required("Country is required"),
        isPrimary: Yup.boolean(),
      }),
    )
    .min(1, "At least one address is required"),
  contacts: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Contact name is required"),
        mobile: Yup.string()
          .test("is-valid-phone", "Invalid phone number", (value) =>
            value ? isValidPhoneNumber(value) : false,
          )
          .required("Mobile is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        isPrimary: Yup.boolean(),
      }),
    )
    .min(1, "At least one contact is required"),
  urls: Yup.array()
    .of(
      Yup.object().shape({
        url: Yup.string().url("Invalid URL").required("URL is required"),
        type: Yup.string().required("URL type is required"),
      }),
    )
    .min(1, "At least one URL is required"),
  orgId: Yup.string().required("Organization is required"),
  eventBannerStorageId: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  eventBannerExternalUrl: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  eventIconStorageId: Yup.string().when("$iconInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  eventIconExternalUrl: Yup.string().when("$iconInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const formDataInitialState = {
  orgId: "",
  eventName: "",
  eventDescription: "",
  eventStartDateTime: "",
  eventEndDateTime: "",
  eventBannerStorageId: null,
  eventBannerExternalUrl: null,
  eventIconStorageId: null,
  eventIconExternalUrl: null,

  addresses: [
    {
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateProvince: "",
      postalCode: "",
      country: "",
      isPrimary: true,
    },
  ],
  contacts: [
    {
      name: "",
      mobile: "",
      email: "",
      isPrimary: true,
    },
  ],
  urls: [
    {
      url: "",
      type: "",
    },
  ],
};

export const status = [
  { key: "ACTIVE", value: "Active" },
  { key: "INACTIVE", value: "Inactive" },
  { key: "COMPLETED", value: "Completed" },
  { key: "ONGOING", value: "Ongoing" },
  { key: "UPCOMING", value: "Upcoming" },
] as const;

export type StatusKey = (typeof status)[number]["key"];
