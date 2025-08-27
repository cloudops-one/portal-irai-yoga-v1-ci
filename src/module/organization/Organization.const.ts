import { isValidPhoneNumber } from "react-phone-number-input";
import * as Yup from "yup";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const BANK_ACCOUNT_REGEX = /^[0-9]{8,11}$/;
const TAX_ID_REGEX = /^[A-Za-z0-9]{6,20}$/;

export const organizationSchema = Yup.object().shape({
  orgName: Yup.string().required("Organization Name is required"),
  orgRegistrationNumber: Yup.string().required(
    "Organization Registration Number is required",
  ),
  orgEmail: Yup.string()
    .email("Invalid email")
    .required("Organization Email is required"),
  orgDescription: Yup.string().required("Organization Description is Required"),
  orgStatus: Yup.string().notRequired(),
  orgIconStorageId: Yup.string().required("Organization Icon is required"),
  addresses: Yup.array().of(
    Yup.object().shape({
      addressLine1: Yup.string().required("Address Line 1 is required"),
      addressLine2: Yup.string().required("Address Line 2 is required"),
      city: Yup.string().required("City is required"),
      stateProvince: Yup.string().required("State/Province is required"),
      postalCode: Yup.string().required("Postal Code is required"),
      country: Yup.string().required("Country is required"),
      isPrimary: Yup.boolean().required(),
    }),
  ),
  contacts: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required("Contact Name is required"),
      mobile: Yup.string()
        .test("is-valid-phone", "Invalid phone number", (value) =>
          value ? isValidPhoneNumber(value) : false,
        )
        .required("Mobile is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      isPrimary: Yup.boolean().required(),
    }),
  ),
  urls: Yup.array().of(
    Yup.object().shape({
      url: Yup.string().url("Invalid URL").required("URL is required"),
      type: Yup.string().required("Type is required"),
    }),
  ),
  bankName: Yup.string().nullable(),
  bankAccountNumber: Yup.string()
    .matches(BANK_ACCOUNT_REGEX, "Invalid Bank account number")
    .nullable(),
  bankAccountType: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  bankIdentifierCode: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  bankBranch: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  bankAddress: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  bankCurrency: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  taxIdentificationNumber: Yup.string()
    .matches(TAX_ID_REGEX, "Invalid Tax Identification Number")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  permanentAccountNumber: Yup.string()
    .matches(PAN_REGEX, "Invalid PAN number")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  goodsServicesTaxNumber: Yup.string()
    .matches(GST_REGEX, "Invalid GST number")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
});

export const organizationFormInitialState = {
  orgId: "",
  orgIconStorageId: "",
  orgIconStorageUrl: "",
  orgStatus: "",
  orgName: "",
  orgRegistrationNumber: "",
  orgEmail: "",
  orgDescription: "",
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
  bankName: null,
  bankAccountNumber: null,
  bankAccountType: null,
  bankIdentifierCode: null,
  bankBranch: null,
  bankAddress: null,
  bankCurrency: null,
  taxIdentificationNumber: null,
  permanentAccountNumber: null,
  goodsServicesTaxNumber: null,
  createdBy: "",
  createdByName: "",
  createdAt: "",
  updatedBy: "",
  updatedByName: "",
  updatedAt: "",
};

export const status = [
  { key: "ACTIVE", value: "Active" },
  { key: "INACTIVE", value: "Inactive" },
] as const;
