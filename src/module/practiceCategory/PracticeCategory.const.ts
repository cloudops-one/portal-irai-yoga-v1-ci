import * as Yup from "yup";

export const formSchema = Yup.object().shape({
  practiceCategoryName: Yup.string().required("Category name is required"),

  practiceCategoryIconStorageId: Yup.string().when("$imageInputType", {
    is: (value: string) => value === "upload",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  practiceCategoryIconExternalUrl: Yup.string().when("$imageInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
