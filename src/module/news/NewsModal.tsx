import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Chip,
  FormControl,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  CircularProgress,
  FormGroup,
  Switch,
} from "@mui/material";
import { NewsType, NewsRequestDto } from "./news.type";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import { useForm, Controller } from "react-hook-form";
import { newsFormInitialState, newsValidationSchema } from "./news.const";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CustomModal } from "../../component/Modal";
import { useAddNews, useEditNews } from "./news.service";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { FALLBACK_LOGO, FALLBACK_BANNER } from "../../common/App.const";
import { useGetTag } from "../../common/App.service";
import theme from "../../common/App.theme";

interface NewsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  news?: NewsType;
}

interface FormContext {
  iconInputType: "file" | "url";
  bannerInputType: "file" | "url";
}

const NewsModal: React.FC<NewsModalProps> = ({
  open,
  onClose,
  onSave,
  news,
}) => {
  const [iconInputType, setIconInputType] = useState<"file" | "url">("file");
  const [bannerInputType, setBannerInputType] = useState<"file" | "url">(
    "file",
  );
  const [tags, setTag] = useState<string[]>([]);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });
  const { addNews, isAddNewsPending } = useAddNews();
  const { editNews, isEditNewsPending } = useEditNews();
  const { getTags } = useGetTag();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<NewsRequestDto>({
    resolver: yupResolver(
      newsValidationSchema as yup.ObjectSchema<NewsRequestDto>,
    ),
    defaultValues: newsFormInitialState,
    mode: "onBlur",
    context: {
      iconInputType,
      bannerInputType,
    } as FormContext,
  });

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const showSuccess = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.SUCCESS);
  };

  const showError = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);
  };

  useEffect(() => {
    if (news) {
      // Set form values when editing
      const formValues = {
        newsName: news.newsName,
        newsDescription: news.newsDescription,
        isRecommended: news.isRecommended || false,
        tags: news.tags || [],
        newsIconStorageId: news.newsIconStorageId || "",
        newsIconExternalUrl: news.newsIconExternalUrl || "",
        newsBannerStorageId: news.newsBannerStorageId || "",
        newsBannerExternalUrl: news.newsBannerExternalUrl || "",
      };
      reset(formValues);

      // Set input types based on existing data
      if (news.newsIconExternalUrl) setIconInputType("url");
      if (news.newsBannerExternalUrl) setBannerInputType("url");
    } else {
      reset(newsFormInitialState);
      setIconInputType("file");
      setBannerInputType("file");
    }
  }, [news, reset]);

  const onSubmit = (data: NewsRequestDto) => {
    // Prepare payload
    const payload: NewsRequestDto = {
      newsName: data.newsName,
      newsDescription: data.newsDescription,
      tags: data.tags,
      isRecommended: data.isRecommended,
      ...(iconInputType === "file"
        ? {
            newsIconStorageId: data.newsIconStorageId,
          }
        : {
            newsIconExternalUrl: data.newsIconExternalUrl,
          }),
      ...(bannerInputType === "file"
        ? {
            newsBannerStorageId: data.newsBannerStorageId,
          }
        : {
            newsBannerExternalUrl: data.newsBannerExternalUrl,
          }),
    };

    if (news) {
      // Edit existing news
      editNews(
        { newsId: news.newsId, ...payload },
        {
          onSuccess: (response: { message?: string }) => {
            showSuccess(response.message || "News updated successfully");
            onSave();
            handleCloseModal();
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to update Poem";
            showError(errorMessage);
          },
        },
      );
    } else {
      // Add new news
      addNews(payload, {
        onSuccess: (response: { message?: string }) => {
          showSuccess(response.message || "News created successfully");
          onSave();
          handleCloseModal();
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to add Poem";
          showError(errorMessage);
        },
      });
    }
  };

  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    onClose();
    reset(newsFormInitialState);
  };

  useEffect(() => {
    getTags(
      { settingName: "NEWS_TAGS" },
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
      {/* Discard Changes Confirmation Modal */}
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
                disabled={isAddNewsPending || isEditNewsPending}
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

      {/* Main News Modal */}
      <CustomModal
        open={open}
        handleClose={handleSafeClose}
        headingText={news ? "Edit News" : "Create News"}
      >
        <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="newsName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="News Title"
                  margin="normal"
                  size="small"
                  error={!!errors.newsName}
                  helperText={errors.newsName?.message as string}
                />
              )}
            />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Description
            </Typography>
            <Controller
              name="newsDescription"
              control={control}
              render={({ field }) => (
                <Box sx={{ mb: 2 }}>
                  <TiptapEditor
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                  {errors.newsDescription && (
                    <FormHelperText error>
                      {errors.newsDescription.message as string}
                    </FormHelperText>
                  )}
                </Box>
              )}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Icon
              </Typography>
              <RadioGroup
                row
                value={iconInputType}
                onChange={(e) => {
                  const value = e.target.value as "file" | "url";
                  setIconInputType(value);
                  if (value === "url") {
                    setValue("newsIconExternalUrl", "");
                    setValue("newsIconStorageId", "");
                  } else {
                    setValue("newsIconStorageId", "");
                    setValue("newsIconExternalUrl", "");
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
              {iconInputType === "file" ? (
                <Controller
                  name="newsIconStorageId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <ProfilePictureUpload
                        onUploadSuccess={(fileId) => {
                          field.onChange(fileId);
                        }}
                        moduleType="NEWS"
                        fallbackImageUrl={FALLBACK_LOGO}
                        width={150}
                        height={150}
                        initialPreviewUrl={
                          news?.newsIconStorageUrl ||
                          news?.newsIconExternalUrl ||
                          ""
                        }
                      />

                      {errors.newsIconStorageId && (
                        <Typography color="error" variant="body2">
                          {errors.newsIconStorageId.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />
              ) : (
                <Controller
                  name="newsIconExternalUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Icon URL"
                      fullWidth
                      margin="normal"
                      error={!!errors.newsIconExternalUrl}
                      helperText={errors.newsIconExternalUrl?.message as string}
                    />
                  )}
                />
              )}
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Banner
              </Typography>
              <RadioGroup
                row
                value={bannerInputType}
                onChange={(e) => {
                  const value = e.target.value as "file" | "url";
                  setBannerInputType(value);
                  if (value === "url") {
                    setValue("newsBannerExternalUrl", "");
                    setValue("newsBannerStorageId", "");
                  } else {
                    setValue("newsBannerStorageId", "");
                    setValue("newsBannerExternalUrl", "");
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
                  name="newsBannerStorageId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <ProfilePictureUpload
                        onUploadSuccess={(fileId) => {
                          field.onChange(fileId);
                        }}
                        moduleType="NEWS"
                        fallbackImageUrl={FALLBACK_BANNER}
                        width={1024}
                        height={500}
                        initialPreviewUrl={
                          news?.newsBannerStorageUrl ||
                          news?.newsBannerExternalUrl ||
                          ""
                        }
                      />
                      {errors.newsBannerStorageId && (
                        <Typography color="error" variant="body2">
                          {errors.newsBannerStorageId.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />
              ) : (
                <Controller
                  name="newsBannerExternalUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Banner URL"
                      fullWidth
                      margin="normal"
                      error={!!errors.newsBannerExternalUrl}
                      helperText={
                        errors.newsBannerExternalUrl?.message as string
                      }
                    />
                  )}
                />
              )}
            </Box>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tags}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={tags}
                      value={field.value || []}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderTags={(selected, getTagProps) =>
                        selected.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            sx={{ mr: 0.5 }}
                            key={index}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Add tags"
                          size="small"
                        />
                      )}
                    />
                    {errors.tags && (
                      <FormHelperText>
                        {errors.tags.message as string}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Box>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Controller
                name="isRecommended"
                control={control}
                render={({ field }) => (
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label="Recommended News"
                    />
                  </FormGroup>
                )}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSubmit(onSubmit)}
                color="success"
                disabled={isAddNewsPending || isEditNewsPending}
              >
                {isAddNewsPending || isEditNewsPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : news ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </CustomModal>

      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={3000}
      />
    </>
  );
};

export default NewsModal;
