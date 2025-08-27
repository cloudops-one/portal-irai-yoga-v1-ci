import * as Yup from "yup";

export const newsValidationSchema = Yup.object().shape({
  newsName: Yup.string().required("News Name is required"),
  newsDescription: Yup.string().required("Description is required"),
  tags: Yup.array().of(Yup.string()).min(1, "At least one tag is required"),
  newsIconStorageId: Yup.string().when("$iconInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  newsIconExternalUrl: Yup.string().when("$iconInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  newsBannerStorageId: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Banner file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  newsBannerExternalUrl: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Banner URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const newsFormInitialState = {
  newsName: "",
  newsDescription: "",
  newsIconStorageId: "",
  newsIconExternalUrl: "",
  newsBannerStorageId: "",
  newsBannerExternalUrl: "",
  isRecommended: false,
  tags: [],
};
