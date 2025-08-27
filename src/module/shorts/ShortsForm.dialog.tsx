import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
  Chip,
  FormControl,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import ShortsType from "./Shorts.types";
import {
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
  FALLBACK_SHORTS_THUMBNAIL,
} from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { useAddShorts, useEditShorts } from "./Shorts.service";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import { ShortsFormInitialState, shortsValidationSchema } from "./shorts.const";
import Loading from "../../component/Loading";
import { DurationInput } from "../../component/Duration";
import { CustomModal } from "../../component/Modal";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useGetTag } from "../../common/App.service";
interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (short: ShortsType, editMode: boolean) => void;
  short: ShortsType | null;
  editMode: boolean;
  refetch: () => void;
}

interface FormContext {
  bannerInputType: "file" | "url";
  videoInputType: "file" | "url";
}
const ShortFormDialog: React.FC<Props> = ({
  open,
  onClose,
  short,
  editMode,
  refetch,
}) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });
  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };
  const showSuccess = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.SUCCESS);
  };
  const showError = (message: string) =>
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);

  const [bannerInputType, setBannerInputType] = useState<"file" | "url">(
    "file",
  );
  const [videoInputType, setVideoInputType] = useState<"file" | "url">("file");
  const [tag, setTag] = useState<string[]>([]);
  // const { settings: tag } = useShortTags();
  const { getTags } = useGetTag();

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ShortsType>({
    resolver: yupResolver(
      shortsValidationSchema as Yup.ObjectSchema<ShortsType>,
    ),
    defaultValues: ShortsFormInitialState,
    context: {
      bannerInputType,
      videoInputType,
    } as FormContext,
  });

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Create handleSafeClose function
  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };
  const { addShorts, isAddShortsPending } = useAddShorts();
  const { editShorts, isEditShortsPending } = useEditShorts();

  // Reset form on open/close or when editing different short
  useEffect(() => {
    if (editMode && short) {
      reset({
        ...short,
        shortsStorageUrl: short.shortsStorageUrl, // Make sure this is included
        shortsBannerStorageUrl: short.shortsBannerStorageUrl,
      });
      setBannerInputType(short.shortsBannerStorageId ? "file" : "url");
      setVideoInputType(short.shortsStorageId ? "file" : "url");
    } else {
      reset(ShortsFormInitialState);
      setBannerInputType("file");
      setVideoInputType("file");
    }
  }, [short, editMode, open, reset]);

  // Use async (payload: Record<string, unknown>)
  const handleAdd = async (payload: Record<string, unknown>) => {
    try {
      await addShorts(payload, {
        onSuccess: (response: { message?: string }) => {
          reset(ShortsFormInitialState);
          refetch();
          onClose();
          showSuccess(response.message || "Shorts added successfully");
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to add shorts";
          console.error("Failed to add shorts:", errorMessage);
          showError(errorMessage);
        },
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("An unknown error occurred");
      }
    }
  };

  const handleUpdate = async (payload: Record<string, unknown>) => {
    try {
      editShorts(
        { shortsId: payload.shortsId, ...payload },
        {
          onSuccess: (response: { message?: string }) => {
            reset(ShortsFormInitialState);
            refetch();
            onClose();
            showSuccess(response.message || "Shorts updated successfully");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to update shorts";
            console.error("Failed to update shorts:", errorMessage);
            showError(errorMessage);
          },
        },
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        showError(err.message);
      } else {
        showError("An unknown error occurred");
      }
    }
  };
  // On form submit
  const onFormSubmit = (data: ShortsType) => {
    // Only use the correct fields for banner/video based on input type
    const payload: Record<string, unknown> = {
      shortsName: data.shortsName,
      shortsDescription: data.shortsDescription,
      tags: data.tags || null,
      orgId: data.orgId || null,
      duration: data.duration,
      shortsBannerStorageId:
        bannerInputType === "file" ? data.shortsBannerStorageId : undefined,
      shortsBannerExternalUrl:
        bannerInputType === "url" ? data.shortsBannerExternalUrl : undefined,
      shortsStorageId:
        videoInputType === "file" ? data.shortsStorageId : undefined,
      shortsExternalUrl:
        videoInputType === "url" ? data.shortsExternalUrl : undefined,
    };
    if (editMode && data.shortsId) {
      payload.shortsId = data.shortsId;
    }
    if (editMode) handleUpdate(payload);
    else handleAdd(payload);
  };
  const loading = isAddShortsPending || isEditShortsPending;
  useEffect(() => {
    getTags(
      { settingName: "SHORTS_TAGS" },
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
      l
      {loading ? (
        <Loading />
      ) : (
        <>
          {showDiscardConfirm && (
            <CustomModal
              open={showDiscardConfirm}
              handleClose={() => setShowDiscardConfirm(false)}
              headingText="Unsaved Changes"
              width="400px"
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
                      handleSubmit(onFormSubmit)();
                      setShowDiscardConfirm(false);
                    }}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      onClose();
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
            headingText={editMode ? "Edit Shorts" : "Add Shorts"}
          >
            <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
              <Box component="form" onSubmit={handleSubmit(onFormSubmit)}>
                <Controller
                  name="shortsName"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      margin="normal"
                      size="small"
                      error={!!errors.shortsName}
                      helperText={errors.shortsName?.message}
                    />
                  )}
                />

                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Description
                </Typography>
                <Controller
                  name="shortsDescription"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ mb: 3 }}>
                      <TiptapEditor
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                      {errors.shortsDescription && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {errors.shortsDescription.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
                <Controller
                  name="orgId"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ mb: 3 }}>
                      <OrganizationDropdown
                        size="small"
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                      {errors.orgId && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {errors.orgId.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />

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
                            <div>
                              <TextField
                                {...params}
                                label="Select tags"
                                placeholder="Select tags"
                                size="small"
                                fullWidth
                              />
                              {errors.tags && (
                                <Typography color="error" variant="body2">
                                  {errors.tags.message}
                                </Typography>
                              )}
                            </div>
                          )}
                        />
                      </FormControl>
                    )}
                  />
                </Box>

                {/* Banner */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">
                    Banner (upload Banner file with 9:16 aspect ratio only)
                  </Typography>
                  <RadioGroup
                    row
                    value={bannerInputType}
                    onChange={(e) => {
                      const value = e.target.value as "file" | "url";
                      setBannerInputType(value);
                      if (value === "file") {
                        setValue("shortsBannerExternalUrl", "");
                        setValue("shortsBannerStorageId", "");
                      } else {
                        setValue("shortsBannerStorageId", "");
                        setValue("shortsBannerExternalUrl", "");
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
                      label="External URL"
                    />
                  </RadioGroup>

                  {bannerInputType === "file" ? (
                    <Controller
                      name="shortsBannerStorageId"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <ProfilePictureUpload
                            onUploadSuccess={(fileId) => {
                              field.onChange(fileId);
                            }}
                            moduleType="SHORTS"
                            initialPreviewUrl={
                              watch("shortsBannerStorageUrl") ||
                              watch("shortsBannerExternalUrl") ||
                              ""
                            }
                            fallbackImageUrl={FALLBACK_SHORTS_THUMBNAIL}
                            width={300}
                            height={500}
                          />
                          {errors.shortsBannerStorageId && (
                            <Typography color="error" variant="body2">
                              {errors.shortsBannerStorageId.message}
                            </Typography>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <Controller
                      name="shortsBannerExternalUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Banner URL"
                          fullWidth
                          margin="normal"
                          size="small"
                          error={!!errors.shortsBannerExternalUrl}
                          helperText={errors.shortsBannerExternalUrl?.message}
                        />
                      )}
                    />
                  )}
                </Box>

                {/* Video */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">
                    Video (upload video file with 9:16 aspect ratio only)
                  </Typography>
                  <RadioGroup
                    row
                    value={videoInputType}
                    onChange={(e) => {
                      const value = e.target.value as "file" | "url";
                      setVideoInputType(value);
                      if (value === "file") {
                        setValue("shortsExternalUrl", "");
                        setValue("shortsStorageId", "");
                      } else {
                        setValue("shortsExternalUrl", "");
                        setValue("shortsStorageId", "");
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
                      label="External URL"
                    />
                  </RadioGroup>

                  {videoInputType === "file" ? (
                    <Controller
                      name="shortsStorageId"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <ProfilePictureUpload
                            onUploadSuccess={(fileId, durationMs) => {
                              field.onChange(fileId);
                              if (durationMs) {
                                setValue("duration", durationMs);
                              }
                            }}
                            moduleType="SHORTS"
                            initialPreviewUrl={
                              watch("shortsStorageUrl") ||
                              watch("shortsExternalUrl") ||
                              ""
                            }
                          />
                          {errors.shortsStorageId && (
                            <Typography color="error" variant="body2">
                              {errors.shortsStorageId.message}
                            </Typography>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <Controller
                      name="shortsExternalUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Video URL"
                          fullWidth
                          margin="normal"
                          size="small"
                          error={!!errors.shortsExternalUrl}
                          helperText={errors.shortsExternalUrl?.message}
                        />
                      )}
                    />
                  )}
                </Box>
                <Box>
                  {videoInputType === "url" && (
                    <Box>
                      <Typography variant="subtitle1">Duration</Typography>
                      <Controller
                        name="duration"
                        control={control}
                        defaultValue={0}
                        render={({ field }) => (
                          <Box>
                            <DurationInput
                              value={field.value}
                              onChange={field.onChange}
                            />
                            {errors.duration && (
                              <Typography color="error" variant="body2">
                                {errors.duration.message}
                              </Typography>
                            )}
                          </Box>
                        )}
                      />
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button type="submit" variant="contained" color="success">
                    {editMode ? "Update" : "Create Shorts"}
                  </Button>
                </Box>

                <SnackBar
                  openSnackbar={snackbar.open}
                  closeSnackbar={() =>
                    setSnackbar({ ...snackbar, open: false })
                  }
                  message={snackbar.message}
                  severity={snackbar.severity}
                  duration={3000}
                />
              </Box>
            </Box>
          </CustomModal>
        </>
      )}
    </>
  );
};

export default ShortFormDialog;
