import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  Button,
  TextField,
  Chip,
  Box,
  CircularProgress,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Typography,
  FormControl,
} from "@mui/material";
import {
  CategoryOption,
  PracticeFormData,
  PracticeModalPropsType,
} from "./Practice.type";
import {
  useAddPractice,
  useUpdatePractice,
  useGetCategories,
  useGetPractice,
} from "./Practice.service";
import {
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
  FALLBACK_BANNER,
  FALLBACK_LOGO,
} from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { AxiosError } from "axios";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import { CustomModal } from "../../component/Modal";
import theme from "../../common/App.theme";
import { useGetTag } from "../../common/App.service";

const validationSchema = Yup.object().shape({
  practiceName: Yup.string().required("Title is required"),
  practiceDescription: Yup.string().required("Description is required"),
  practiceCategoryId: Yup.string().required("Category is required"),
  orgId: Yup.string().required("Organization is required"),
  tags: Yup.array().of(Yup.string()).required("At least one tag is required"),
  practiceIconStorageId: Yup.string().when("$iconInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Icon file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  practiceIconExternalUrl: Yup.string().when("$iconInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Icon URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  practiceBannerStorageId: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Banner file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  practiceBannerExternalUrl: Yup.string().when("$bannerInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Banner URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Practice file validation
  practiceStorageId: Yup.string().when("$practiceFileInputType", {
    is: (value: string) => value === "file",
    then: (schema) => schema.required("Practice file is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  practiceExternalUrl: Yup.string().when("$practiceFileInputType", {
    is: (value: string) => value === "url",
    then: (schema) =>
      schema.url("Invalid URL").required("Practice file URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

interface FormContext {
  iconInputType: "file" | "url";
  bannerInputType: "file" | "url";
  practiceFileInputType: "file" | "url";
}

const PracticeModal: React.FC<PracticeModalPropsType> = ({
  open,
  handleClose,
  refetch,
  practiceData,
}) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>(
    SNACKBAR_SEVERITY.INFO,
  );
  const [tag, setTag] = useState<string[]>([]);
  const [iconInputType, setIconInputType] = useState<"file" | "url">("file");
  const [bannerInputType, setBannerInputType] = useState<"file" | "url">(
    "file",
  );
  const [practiceFileInputType, setPracticeFileInputType] = useState<
    "file" | "url"
  >("file");
  const [isLoading, setIsLoading] = useState(false);
  console.log(isLoading);
  const isEdit = !!practiceData;

  const { practiceDetail, isDetailPending, refetchPracticeDetail } =
    useGetPractice(practiceData?.practiceId);

  const { addPractice, isAddPracticePending } = useAddPractice();
  const { editPractice, isEditPracticePending } = useUpdatePractice();
  const { categories, isCategoriesPending, refetchCategories } =
    useGetCategories();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    setValue,
  } = useForm<PracticeFormData>({
    resolver: yupResolver(
      validationSchema as Yup.ObjectSchema<PracticeFormData>,
    ),
    defaultValues: {
      practiceName: "",
      practiceDescription: "",
      practiceCategoryId: "",
      orgId: "",
    },
    context: {
      iconInputType,
      bannerInputType,
      practiceFileInputType,
    } as FormContext,
  });

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const { getTags } = useGetTag();
  // Create handleCloseModal function
  const handleCloseModal = () => {
    handleClose();
    reset();
    setTag([]);
  };

  // Create handleSafeClose function
  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };

  useEffect(() => {
    if (open && isEdit && practiceDetail) {
      let tagsData: string[] = [];
      const tagValue = practiceDetail.tags as string | string[] | undefined;
      if (tagValue) {
        if (Array.isArray(tagValue)) {
          tagsData = tagValue;
        } else if (typeof tagValue === "string") {
          tagsData = tagValue.split(",").filter(Boolean);
        }
      }

      reset({
        practiceName: practiceDetail?.practiceName || "",
        practiceDescription: practiceDetail?.practiceDescription || "",
        practiceCategoryId: practiceDetail.practiceCategoryId || "",
        tags: tagsData,
        orgId: practiceDetail.orgId || "",
        practiceIconStorageUrl: practiceDetail.practiceIconStorageUrl || "",
        practiceIconStorageId: practiceDetail.practiceIconStorageId || "",
        practiceIconExternalUrl: practiceDetail.practiceIconExternalUrl || "",
        practiceBannerStorageUrl: practiceDetail.practiceBannerStorageUrl || "",
        practiceBannerStorageId: practiceDetail.practiceBannerStorageId || "",
        practiceBannerExternalUrl:
          practiceDetail.practiceBannerExternalUrl || "",
        practiceStorageUrl: practiceDetail.practiceStorageUrl || "",
        practiceStorageId: practiceDetail.practiceStorageId || "",
        practiceExternalUrl: practiceDetail.practiceExternalUrl || "",
      });
      setTag(tagsData);
      if (practiceDetail.practiceIconExternalUrl)
        setIconInputType(
          practiceDetail.practiceIconExternalUrl ? "url" : "file",
        );
      if (practiceDetail.practiceBannerExternalUrl)
        setBannerInputType(
          practiceDetail.practiceBannerExternalUrl ? "url" : "file",
        );
      if (practiceDetail.practiceExternalUrl)
        setPracticeFileInputType(
          practiceDetail.practiceExternalUrl ? "url" : "file",
        );
    } else if (open && !isEdit) {
      reset({
        practiceName: "",
        practiceDescription: "",
        practiceCategoryId: "",
        tags: [],
        orgId: "",
        practiceIconStorageUrl: "",
        practiceIconStorageId: "",
        practiceIconExternalUrl: "",
        practiceBannerStorageUrl: "",
        practiceBannerStorageId: "",
        practiceStorageUrl: "",
        practiceStorageId: "",
      });
      setTag([]);
      setIconInputType("file");
      setBannerInputType("file");
      setPracticeFileInputType("file");
    }
  }, [open, practiceDetail, isEdit, reset]);

  const handleAddPractice = async (payload: Record<string, unknown>) => {
    try {
      addPractice(payload, {
        onSuccess: () => {
          setSnackbarMessage("Practice created successfully");
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
          handleClose();
          refetch();
        },
        onError: (error: AxiosError) => {
          const errorMessage =
            (error.response?.data as { message?: string })?.message ??
            error.message;
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
      });
    } catch (error) {
      console.error("Error adding practice:", error);
      setSnackbarMessage("Failed to add practice");
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const handleEditPractice = async (payload: Record<string, unknown>) => {
    if (!practiceData) return;

    try {
      await editPractice(
        { practiceId: practiceData.practiceId, ...payload },
        {
          onSuccess: () => {
            setSnackbarMessage("Practice updated successfully");
            setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
            setOpenSnackbar(true);
            handleClose();
            refetchPracticeDetail();
            refetch();
          },
          onError: (error: AxiosError) => {
            const errorMessage =
              (error.response?.data as { message?: string })?.message ??
              error.message;
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
            setOpenSnackbar(true);
          },
        },
      );
    } catch (error) {
      console.error("Error editing practice:", error);
      setSnackbarMessage("Failed to update practice");
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const onSubmit = (data: PracticeFormData) => {
    const payload = {
      practiceName: data.practiceName,
      practiceDescription: data.practiceDescription,
      practiceCategoryId: data.practiceCategoryId,
      orgId: data.orgId || null,
      tags: data.tags || null,
      practiceIconStorageId:
        iconInputType === "file"
          ? data.practiceIconStorageId || undefined
          : undefined,
      practiceIconExternalUrl:
        iconInputType === "url"
          ? data.practiceIconExternalUrl || undefined
          : undefined,
      practiceBannerStorageId:
        bannerInputType === "file"
          ? data.practiceBannerStorageId || undefined
          : undefined,
      practiceBannerExternalUrl:
        bannerInputType === "url"
          ? data.practiceBannerExternalUrl || undefined
          : undefined,
      practiceStorageId:
        practiceFileInputType === "file"
          ? data.practiceStorageId || undefined
          : undefined,
      practiceExternalUrl:
        practiceFileInputType === "url"
          ? data.practiceExternalUrl || undefined
          : undefined,
    };

    if (isEdit) {
      handleEditPractice(payload);
    } else {
      handleAddPractice(payload);
    }
  };

  useEffect(() => {
    setIsLoading(isDetailPending || (isEdit && !practiceDetail));
  }, [isDetailPending, isEdit, practiceDetail]);

  useEffect(() => {
    getTags(
      { settingName: "PRACTICE_TAGS" },
      {
        onSuccess: (res) => {
          const options = res?.data?.settingValue ?? [];
          setTag(options);
        },
        onError: (err) => {
          console.error("Failed to fetch  Shorts Tags:", err);
        },
      },
    );
  }, []);
  return (
    <>
      {showDiscardConfirm && (
        <CustomModal
          open={showDiscardConfirm}
          handleClose={() => setShowDiscardConfirm(false)}
          headingText="Unsaved Changes"
          width="500px"
        >
          <Box className="p-4">
            <Typography>
              You have unsaved changes. What would you like to do?
            </Typography>
            <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
              <Button
                variant="outlined"
                onClick={() => setShowDiscardConfirm(false)}
              >
                Continue Editing
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleSubmit(onSubmit)();
                  setShowDiscardConfirm(false);
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: theme.palette.error.main }}
                onClick={() => {
                  handleCloseModal();
                  setShowDiscardConfirm(false);
                }}
              >
                Discard
              </Button>
            </Box>
          </Box>
        </CustomModal>
      )}

      <CustomModal
        open={open}
        handleClose={handleSafeClose}
        headingText={isEdit ? "Edit Practice" : "Create Practice"}
      >
        <Box>
          <Box sx={{ maxHeight: "70vh", overflowY: "auto", p: 2 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="practiceName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Practice Name"
                    fullWidth
                    margin="normal"
                    size="small"
                    error={!!errors.practiceName}
                    helperText={errors.practiceName?.message}
                  />
                )}
              />

              <Controller
                name="practiceDescription"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 3 }}>
                    <TiptapEditor
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.practiceDescription && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {errors.practiceDescription.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              {/* Category Dropdown */}
              <Controller
                name="practiceCategoryId"
                control={control}
                render={({ field }) => (
                  <Autocomplete<CategoryOption, false, false, false>
                    options={Array.isArray(categories) ? categories : []}
                    loading={isCategoriesPending}
                    getOptionLabel={(option) => option.practiceCategoryName}
                    value={
                      (Array.isArray(categories) ? categories : []).find(
                        (c: CategoryOption) =>
                          c.practiceCategoryId === field.value,
                      ) || null
                    }
                    onOpen={() => refetchCategories()}
                    onFocus={() => refetchCategories()}
                    onChange={(_, newValue) => {
                      field.onChange(
                        newValue ? newValue.practiceCategoryId : "",
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Category"
                        fullWidth
                        margin="normal"
                        size="small"
                        error={!!errors.practiceCategoryId}
                        helperText={errors.practiceCategoryId?.message}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isCategoriesPending ? (
                                <CircularProgress size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                )}
              />

              {/* Organization Dropdown */}
              <Controller
                name="orgId"
                control={control}
                render={({ field }) => (
                  <Box>
                    <OrganizationDropdown
                      value={field.value ?? null}
                      onChange={field.onChange}
                      size="small"
                    />
                    {errors.orgId && (
                      <Typography color="error" variant="body2">
                        {errors.orgId.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />

              <Box mt={2}>
                <FormLabel>Icon</FormLabel>
                <RadioGroup
                  row
                  value={iconInputType}
                  onChange={(e) => {
                    const value = e.target.value as "file" | "url";
                    setIconInputType(value);
                    if (value === "url") {
                      setValue("practiceIconExternalUrl", "");
                      setValue("practiceIconStorageId", "");
                    } else {
                      setValue("practiceIconStorageId", "");
                      setValue("practiceIconExternalUrl", "");
                    }
                  }}
                >
                  <FormControlLabel
                    value="file"
                    control={<Radio />}
                    label="Upload File"
                  />
                  <FormControlLabel
                    value="url"
                    control={<Radio />}
                    label="Provide URL"
                  />
                </RadioGroup>

                {iconInputType === "file" ? (
                  <Controller
                    name="practiceIconStorageId"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <ProfilePictureUpload
                          onUploadSuccess={(fileId) => {
                            field.onChange(fileId);
                          }}
                          moduleType="PRACTICE"
                          initialPreviewUrl={
                            practiceData?.practiceIconStorageUrl ||
                            practiceData?.practiceIconExternalUrl ||
                            ""
                          }
                          existingFileId={
                            practiceDetail?.practiceIconStorageId || ""
                          }
                          fallbackImageUrl={FALLBACK_LOGO}
                          width={150}
                          height={150}
                        />
                        {errors.practiceIconStorageId && (
                          <Typography color="error" variant="body2">
                            {errors.practiceIconStorageId.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                ) : (
                  <Controller
                    name="practiceIconExternalUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ""}
                        label="Icon URL"
                        fullWidth
                        margin="normal"
                        error={!!errors.practiceIconExternalUrl}
                        helperText={errors.practiceIconExternalUrl?.message}
                      />
                    )}
                  />
                )}
              </Box>

              {/* Banner Input */}
              <Box mt={2}>
                <FormLabel>Banner</FormLabel>
                <RadioGroup
                  row
                  value={bannerInputType}
                  onChange={(e) => {
                    const value = e.target.value as "file" | "url";
                    setBannerInputType(value);
                    if (value === "url") {
                      setValue("practiceBannerExternalUrl", "");
                      setValue("practiceBannerStorageId", "");
                    } else {
                      setValue("practiceBannerStorageId", "");
                      setValue("practiceBannerExternalUrl", "");
                    }
                  }}
                >
                  <FormControlLabel
                    value="file"
                    control={<Radio />}
                    label="Upload File"
                  />
                  <FormControlLabel
                    value="url"
                    control={<Radio />}
                    label="Provide URL"
                  />
                </RadioGroup>

                {bannerInputType === "file" ? (
                  <Controller
                    name="practiceBannerStorageId"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <ProfilePictureUpload
                          onUploadSuccess={(fileId) => {
                            field.onChange(fileId);
                          }}
                          moduleType="PRACTICE"
                          initialPreviewUrl={
                            practiceData?.practiceBannerStorageUrl ||
                            practiceData?.practiceBannerExternalUrl ||
                            ""
                          }
                          existingFileId={
                            practiceDetail?.practiceBannerStorageId || ""
                          }
                          fallbackImageUrl={FALLBACK_BANNER}
                          width={1024}
                          height={500}
                        />
                        {errors.practiceBannerStorageId && (
                          <Typography color="error" variant="body2">
                            {errors.practiceBannerStorageId.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                ) : (
                  <Controller
                    name="practiceBannerExternalUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ""}
                        label="Banner URL"
                        fullWidth
                        margin="normal"
                        error={!!errors.practiceBannerExternalUrl}
                        helperText={errors.practiceBannerExternalUrl?.message}
                      />
                    )}
                  />
                )}
              </Box>

              {/* Practice File Input */}
              <Box mt={2}>
                <FormLabel>Practice File</FormLabel>
                <RadioGroup
                  row
                  value={practiceFileInputType}
                  onChange={(e) => {
                    const value = e.target.value as "file" | "url";
                    setPracticeFileInputType(value);
                    if (value === "url") {
                      setValue("practiceExternalUrl", "");
                      setValue("practiceStorageId", "");
                    } else {
                      setValue("practiceStorageId", "");
                      setValue("practiceExternalUrl", "");
                    }
                  }}
                >
                  <FormControlLabel
                    value="file"
                    control={<Radio />}
                    label="Upload File"
                  />
                  <FormControlLabel
                    value="url"
                    control={<Radio />}
                    label="Provide URL"
                  />
                </RadioGroup>

                {practiceFileInputType === "file" ? (
                  <Controller
                    name="practiceStorageId"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <ProfilePictureUpload
                          onUploadSuccess={(fileId) => {
                            field.onChange(fileId);
                          }}
                          moduleType="PRACTICE"
                          initialPreviewUrl={
                            practiceData?.practiceStorageUrl ||
                            practiceData?.practiceExternalUrl ||
                            ""
                          }
                          existingFileId={
                            practiceDetail?.practiceStorageId || ""
                          }
                        />
                        {errors.practiceStorageId && (
                          <Typography color="error" variant="body2">
                            {errors.practiceStorageId.message}
                          </Typography>
                        )}
                      </div>
                    )}
                  />
                ) : (
                  <Controller
                    name="practiceExternalUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ""}
                        label="Practice File URL"
                        fullWidth
                        margin="normal"
                        error={!!errors.practiceExternalUrl}
                        helperText={errors.practiceExternalUrl?.message}
                      />
                    )}
                  />
                )}
              </Box>

              <Box mt={2}>
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <Autocomplete
                          multiple
                          freeSolo
                          options={tag}
                          value={Array.isArray(field.value) ? field.value : []}
                          onChange={(_, newValue) => field.onChange(newValue)}
                          renderTags={(selected, getTagProps) =>
                            selected.map((option, index) => (
                              <Chip
                                label={option}
                                {...getTagProps({ index })}
                                sx={{ mr: 0.5, color: "black" }}
                                key={`custom-key-${index}`}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select tags"
                              placeholder="Select tags"
                              size="small"
                              fullWidth
                            />
                          )}
                        />

                        {errors.tags && (
                          <Typography color="error" variant="body2">
                            {errors.tags.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  p: 2,
                  mt: 4,
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isAddPracticePending || isEditPracticePending}
                  sx={{ ml: 2, display: "flex", justifyContent: "center" }}
                >
                  {isAddPracticePending || isEditPracticePending ? (
                    <CircularProgress size={24} />
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </CustomModal>

      <SnackBar
        openSnackbar={openSnackbar}
        closeSnackbar={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </>
  );
};

export default PracticeModal;
