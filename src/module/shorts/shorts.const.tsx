import * as Yup from "yup";

export const shortsValidationSchema = Yup.object().shape({
  shortsName: Yup.string().required("Title is required"),
  shortsDescription: Yup.string().required("Description is required"),
  orgId: Yup.string().required("Organization is required"),
  tags: Yup.array().of(Yup.string()).required("At least one tag is required"),
  duration: Yup.number().when("$videoInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema
        .min(1, "Duration must be at least 1 second")
        .required("Duration is required for external URLs"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Banner validation
  shortsBannerStorageId: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  shortsBannerExternalUrl: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Video validation
  shortsStorageId: Yup.string().when("$videoInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Video file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  shortsExternalUrl: Yup.string().when("$videoInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Video file URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const ShortsFormInitialState = {
  shortsStorageId: "",

  shortsStorageUrl: "",
  shortsExternalUrl: "",

  shortsBannerStorageId: "",
  shortsBannerStorageUrl: "",
  shortsBannerExternalUrl: "",

  shortsName: "",
  shortsDescription: "",
  tags: [],
};
const status = [
  { key: "ACTIVE", value: "Active" },
  { key: "INACTIVE", value: "Inactive" },
] as const;
export default status;
export type StatusKey = (typeof status)[number]["key"];
