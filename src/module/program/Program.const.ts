import * as yup from "yup";
import { LessonFormData } from "./Program.type";

// Helper function for file or URL validation
const createFileOrUrlValidation = (fileField: string, urlField: string) => {
  return {
    [fileField]: yup
      .string()
      .test(
        "file-or-url",
        "Either file upload or URL is required",
        function (value) {
          return !!(value || this.parent[urlField]);
        },
      ),
    [urlField]: yup
      .string()
      .url("Must be a valid URL")
      .test(
        "file-or-url",
        "Either file upload or URL is required",
        function (value) {
          return !!(value || this.parent[fileField]);
        },
      ),
  };
};

// Program form validation
export const programValidationSchema = yup.object().shape({
  programName: yup.string().required("Program name is required"),
  orgId: yup.string().required("Organization is required"),
  programDescription: yup.string().required("Program description is required"),
  programAuthor: yup.string(),
  ...createFileOrUrlValidation(
    "programBannerStorageId",
    "programBannerExternalUrl",
  ),
  tags: yup.array().of(yup.string()),
});

// Section form validation
export const sectionValidationSchema = yup.object().shape({
  sectionName: yup.string().required("Section name is required"),
  sectionDescription: yup.string().required("Section description is required"),
});

// Lesson form validation
export const lessonValidationSchema = yup.object().shape({
  lessonName: yup.string().required("Lesson name is required"),
  lessonDescription: yup.string(),
  lessonText: yup.string(),
  ...createFileOrUrlValidation("lessonStorageId", "lessonExternalUrl"),
  duration: yup
    .number()
    .required("Duration is required")
    .min(0, "Duration must be positive")
    .typeError("Duration must be a number"),
});

export const initialLessonFormState: LessonFormData = {
  sectionId: "",
  lessonName: "",
  lessonDescription: "",
  lessonText: "",
  lessonStorageId: undefined,
  lessonStorageUrl: undefined,
  lessonExternalUrl: undefined,
  duration: 0,
  lessonOrder: 0,
};
