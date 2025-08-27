import * as Yup from "yup";
export const poemValidationSchema = Yup.object().shape({
  poemName: Yup.string().required("Poem Name is required"),
  poemDescription: Yup.string().required("Poem Description is required"),
  poemText: Yup.string().required("Poem Text is required"),
  poemAuthor: Yup.string().required("Poem Author is required"),
  orgId: Yup.string().required("Organization is required"),
  poemStorageId: Yup.string().when("$poemInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  poemExternalUrl: Yup.string().when("$poemInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  poemIconStorageId: Yup.string().when("$poemIconInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  poemIconExternalUrl: Yup.string().when("$poemIconInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  poemBannerStorageId: Yup.string().when("$poemBannerInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Banner file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  poemBannerExternalUrl: Yup.string().when("$poemBannerInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Banner URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const poemFormInitialState = {
  poemName: "",
  poemDescription: "",
  poemStorageId: "",
  poemExternalUrl: "",
  poemIconStorageId: "",
  poemIconStorageUrl: "",
  poemIconExternalUrl: "",
  poemBannerStorageId: "",
  poemBannerStorageUrl: "",
  poemBannerExternalUrl: "",
  poemText: "",
  poemAuthor: "",
  poemDuration: 0,
  poemTags: [],
};
const status = [
  { key: "ACTIVE", value: "Active" },
  { key: "INACTIVE", value: "Inactive" },
] as const;
export default status;
export type StatusKey = (typeof status)[number]["key"];
