import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tooltip,
  Chip,
  Avatar,
  FormControl,
} from "@mui/material";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { useForm, Controller } from "react-hook-form";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import "glightbox/dist/css/glightbox.min.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PoemType } from "./poem.type";
import MuiDataGridComponent from "../../component/DataGrid";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import {
  useAddPoem,
  useDeletePoem,
  useEditPoem,
  useGetPoem,
  useUpdatePoemStatus,
  useGetPoemById,
} from "./poem.service";
import { poemFormInitialState, poemValidationSchema } from "./poem.const";
import {
  SNACKBAR_SEVERITY,
  SnackbarSeverity,
  FALLBACK_LOGO,
  FALLBACK_THUMBNAIL,
} from "../../common/App.const";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import Loading from "../../component/Loading";
import { PoemViewModal } from "./poemViewModal";
import SnackBar from "../../component/SnackBar";
import OrganizationDropdown from "../organization/OrganizationDropdown.component";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { msToTimeString, hmsToMs, msToHms } from "../../component/Duration";
import Autocomplete from "@mui/material/Autocomplete";
import { TiptapEditor } from "../../component/TipTapTextEditor";
import { CustomModal } from "../../component/Modal";
import theme from "../../common/App.theme";
import { usePoemStatus } from "../../common/App.hooks";
import { useGetTag } from "../../common/App.service";

interface FormContext {
  poemInputType: "file" | "url";
  poemBannerInputType: "file" | "url";
  poemIconInputType: "file" | "url";
}

const PoemComponent = () => {
  const { settings: Poemstatus } = usePoemStatus();
  const { getTags } = useGetTag();

  const [tag, setTag] = useState<string[]>([]);

  const [editData, setEditData] = useState<PoemType | null>(null);
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
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    [],
  );
  const [poemInputType, setPoemInputType] = useState<"file" | "url">("file");
  const [poemIconInputType, setIconInputtype] = useState<"file" | "url">(
    "file",
  );
  const [poemBannerInputType, setPoemBannerInputType] = useState<
    "file" | "url"
  >("file");
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<PoemType>({
    resolver: yupResolver(poemValidationSchema as yup.ObjectSchema<PoemType>),
    defaultValues: poemFormInitialState,
    context: {
      poemBannerInputType,
      poemIconInputType,
      poemInputType,
    } as FormContext,
    mode: "onBlur",
  });
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [currentItems, setCurrentItems] = useState<PoemType[]>([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "asc" },
  ]);
  const [rowCountState, setRowCountState] = useState(0);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel((prev) => ({
      ...prev,
      page: 0,
    }));
  };
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    poemId: number | null;
  }>({ open: false, poemId: null });
  //API Calls
  const { isGetAllPoemPending, refetch } = useGetPoem(
    setCurrentItems,
    paginationModel,
    setPaginationModel,
    setRowCountState,
    searchTerm,
    sortModel,
  );
  const { addPoem, isAddPoemPending } = useAddPoem();
  const { deletePoem, isDeletePoemPending } = useDeletePoem();
  const { editPoem, isEditPoemPending } = useEditPoem();
  const { getPoemById, isGetPoemByIdPending } = useGetPoemById();
  const { updatePoemStatus, isUpdatePoemStatusPending } = useUpdatePoemStatus();

  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };
  // Function to handle closing the form modal
  const handleCloseModal = () => {
    setOpen(false);
    reset(poemFormInitialState);
  };

  // Function to open the form modal for adding a new poem
  const handleAdd = async (payload: Record<string, unknown>) => {
    try {
      await addPoem(payload, {
        onSuccess: (response: { message?: string }) => {
          refetch();
          setOpen(false);
          reset(poemFormInitialState);
          showSuccess(response.message || "Poem added successfully");
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to add Poem";
          console.error("Failed to add Poem:", errorMessage);

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

  const handleEdit = (id: string) => {
    getPoemById(
      { poemId: id },
      {
        onSuccess: (response) => {
          const poemData = response.data;

          setEditData(poemData);
          reset(poemData);
          setOpen(true);
        },
        onError(error) {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "failed to get Poem Details";
          console.error("failed to get Poem Details");
          showError(errorMessage);
        },
      },
    );
  };
  const handleUpdate = async (payload: Record<string, unknown>) => {
    if (!editData?.poemId) return;
    try {
      editPoem(
        { poemId: editData.poemId, ...payload },
        {
          onSuccess: (response: { message?: string }) => {
            refetch();
            setOpen(false);
            reset(poemFormInitialState);
            showSuccess(response.message || "Poem Edit successfully");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to Edit Poem";
            console.error("Failed to Edit Poem:", errorMessage);
            showError(errorMessage);
            showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
          },
        },
      );
    } catch (error) {
      console.error("Edit Poem error:", error);
    }
  };
  // Function to handle form submission
  const onSubmit = (data: PoemType) => {
    const payload = {
      poemName: data.poemName,
      poemAuthor: data.poemAuthor,
      poemText: data.poemText,
      poemDescription: data.poemDescription,
      poemDuration: data.poemDuration,
      poemTags: data.poemTags || null,
      orgId: data.orgId || null,
      poemStorageId: poemInputType === "file" ? data.poemStorageId : undefined,
      poemExternalUrl:
        poemInputType === "url" ? data.poemExternalUrl : undefined,
      poemIconStorageId:
        poemIconInputType === "file"
          ? data.poemIconStorageId || undefined
          : undefined,

      poemIconExternalUrl:
        poemIconInputType === "url"
          ? data.poemIconExternalUrl || undefined
          : undefined,

      poemBannerStorageId:
        poemBannerInputType === "file" ? data.poemBannerStorageId : undefined,
      poemBannerExternalUrl:
        poemBannerInputType === "url" ? data.poemBannerExternalUrl : undefined,
    };
    if (!editData) handleAdd(payload);
    else handleUpdate(payload);
  };
  // Function to handle delete confirmation
  const handleDelete = (id: number) => {
    setDeleteConfirmation({ open: true, poemId: id });
  };
  const confirmDelete = () => {
    if (deleteConfirmation.poemId) {
      deletePoem(
        { poemId: deleteConfirmation.poemId },
        {
          onSuccess: async (response: { message?: string }) => {
            await refetch();
            showSuccess(response.message || "Poem deleted successfully");
            setDeleteConfirmation({ open: false, poemId: null }); // Close modal after success
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete status";
            console.error("Failed to delete status:", errorMessage);
            showError(errorMessage);
            setDeleteConfirmation({ open: false, poemId: null });
          },
        },
      );
    }
  };
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentViewPoem, setCurrentViewPoem] = useState<PoemType | null>(null);
  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, poemId: null });
  };
  const handleView = (poemData: PoemType) => {
    setCurrentViewPoem(poemData);
    setViewModalOpen(true);
  };
  // Define columns for the DataGrid
  const columns: GridColDef[] = [
    {
      field: "action",
      headerName: "Action",
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleEdit(params.row.poemId);
              }}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="View">
            <IconButton
              color="primary"
              onClick={(event) => {
                event.stopPropagation();
                handleView(params.row);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
    {
      field: "poemIconStorageUrl",
      headerName: "Icon",
      minWidth: 40,
      renderCell: (params) => {
        const iconUrl =
          params.row.poemIconStorageUrl || params.row.poemIconExternalUrl || "";
        return (
          <Avatar src={iconUrl} sx={{ marginTop: 1, width: 40, height: 40 }} />
        );
      },
    },
    { field: "poemName", headerName: "Title", minWidth: 200 },
    { field: "poemAuthor", headerName: "Author", minWidth: 200 },
    { field: "poemTags", headerName: "Tags", width: 200 },
    {
      field: "poemDuration",
      headerName: "Duration",
      width: 200,
      renderCell: (params: GridRenderCellParams<PoemType>) =>
        msToTimeString(params.row.poemDuration),
    },
    {
      field: "poemStatus",
      headerName: "Status",
      minWidth: 130,
      renderCell: (params: GridRenderCellParams<PoemType, string>) => {
        const poemId = params.row.poemId;
        const currentStatus = params.value;
        return (
          <Select
            value={currentStatus}
            onClick={(event) => event.stopPropagation()}
            onChange={(e) => {
              const newStatus = e.target.value;
              updatePoemStatus(
                { poemId, status: newStatus },
                {
                  onSuccess: (response: { message?: string }) => {
                    setCurrentItems((prevItems) =>
                      prevItems.map((item) =>
                        item.poemId === poemId
                          ? { ...item, Status: newStatus }
                          : item,
                      ),
                    );
                    showSuccess(
                      response.message || "Status updated successfully",
                    );
                    refetch();
                  },
                  onError: (error) => {
                    const errorMessage =
                      (error.response?.data as { errorMessage?: string })
                        ?.errorMessage ||
                      error.message ||
                      "Failed to update status";
                    console.error("Failed to update status:", errorMessage);
                    showError(errorMessage);
                  },
                },
              );
            }}
            size="small"
            fullWidth
            disabled={isUpdatePoemStatusPending}
          >
            {Poemstatus.map((option) => (
              <MenuItem value={option.key} key={option.key}>
                {option.value}
              </MenuItem>
            ))}
          </Select>
        );
      },
    },
  ];

  const isLoading =
    isGetAllPoemPending ||
    isDeletePoemPending ||
    isAddPoemPending ||
    isEditPoemPending ||
    isGetPoemByIdPending ||
    isUpdatePoemStatusPending;
  const itemsWithId = currentItems?.map((r) => ({ ...r, id: r?.poemId }));

  useEffect(() => {
    getTags(
      { settingName: "POEM_TAGS" },
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
      {isLoading ? (
        <Loading />
      ) : (
        <Box>
          <FullHeightDataGridContainer>
            <MuiDataGridComponent
              rows={itemsWithId}
              columns={columns}
              selectedRowIds={selectedRowIds}
              getRowId={(row) => row.id}
              setSelectedRowIds={setSelectedRowIds}
              addButtonText="Add Poems"
              onAddClick={() => {
                setOpen(true);
                reset(poemFormInitialState);
                setEditData(null);
              }}
              pagination={true}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={rowCountState}
              loading={isGetAllPoemPending}
              onSearchChange={handleSearch}
              searchTerm={searchTerm}
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              sortingMode="server"
            />
          </FullHeightDataGridContainer>
          {/* CustomModal*/}

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
            headingText={editData ? "Edit Poem" : "Add Poem"}
          >
            <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ gap: 3 }}>
                  <Box flex={1}>
                    <Controller
                      name="poemName"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Name"
                          size="small"
                          className="mb-4"
                          sx={{ mb: 2 }}
                          error={!!errors.poemName}
                          helperText={errors.poemName?.message}
                        />
                      )}
                    />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Description
                    </Typography>
                    <Controller
                      name="poemDescription"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Box sx={{ mb: 3 }}>
                          <TiptapEditor
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                          {errors.poemDescription && (
                            <Typography
                              color="error"
                              variant="body2"
                              sx={{ mt: 1 }}
                            >
                              {errors.poemDescription.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Poem Script
                    </Typography>
                    <Controller
                      name="poemText"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Box sx={{ mb: 3 }}>
                          <TiptapEditor
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                          {errors.poemText && (
                            <Typography
                              color="error"
                              variant="body2"
                              sx={{ mt: 1 }}
                            >
                              {errors.poemText.message}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                    <Controller
                      name="poemAuthor"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Author"
                          size="small"
                          className="mb-4"
                          sx={{ mb: 2 }}
                          error={!!errors.poemAuthor}
                          helperText={errors.poemAuthor?.message}
                        />
                      )}
                    />
                  </Box>
                  <Controller
                    name="orgId"
                    control={control}
                    render={({ field }) => (
                      <Box sx={{ mb: 3 }}>
                        <OrganizationDropdown
                          size="small"
                          value={field.value ?? null}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
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
                  <Box>
                    <Typography variant="subtitle1">Icon</Typography>
                    <RadioGroup
                      row
                      value={poemIconInputType}
                      onChange={(e) => {
                        const value = e.target.value as "file" | "url";
                        setIconInputtype(value);
                        if (value === "url") {
                          setValue("poemIconExternalUrl", "");
                          setValue("poemIconStorageId", ""); // Clear URL field
                        } else {
                          setValue("poemIconStorageId", "");
                          setValue("poemIconExternalUrl", ""); // Optionally clear file field
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
                    {poemIconInputType === "file" ? (
                      <Controller
                        name="poemIconStorageId"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <ProfilePictureUpload
                              onUploadSuccess={(fileId) => {
                                field.onChange(fileId);
                              }}
                              moduleType="POEM"
                              initialPreviewUrl={
                                watch("poemIconStorageUrl") ||
                                watch("poemIconExternalUrl") ||
                                ""
                              }
                              fallbackImageUrl={FALLBACK_LOGO}
                              width={150}
                              height={150}
                            />
                            {errors.poemIconStorageId && (
                              <Typography color="error" variant="body2">
                                {errors.poemIconStorageId.message}
                              </Typography>
                            )}
                          </div>
                        )}
                      />
                    ) : (
                      <Controller
                        name="poemIconExternalUrl"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Poem Icon URL"
                            fullWidth
                            margin="normal"
                            error={!!errors.poemIconExternalUrl}
                            helperText={errors.poemIconExternalUrl?.message}
                          />
                        )}
                      />
                    )}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Thumbnail</Typography>
                    <RadioGroup
                      row
                      value={poemBannerInputType}
                      onChange={(e) => {
                        const value = e.target.value as "file" | "url";
                        setPoemBannerInputType(value);
                        if (value === "url") {
                          setValue("poemBannerExternalUrl", "");
                          setValue("poemBannerStorageId", ""); // Clear URL field
                        } else {
                          setValue("poemBannerStorageId", "");
                          setValue("poemBannerExternalUrl", ""); // Optionally clear file field
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
                    {poemBannerInputType === "file" ? (
                      <Controller
                        name="poemBannerStorageId"
                        control={control}
                        render={({ field }) => (
                          <div>
                            <ProfilePictureUpload
                              onUploadSuccess={(fileId) => {
                                field.onChange(fileId);
                              }}
                              moduleType="POEM"
                              initialPreviewUrl={
                                watch("poemBannerExternalUrl") ||
                                watch("poemBannerStorageUrl") ||
                                ""
                              }
                              fallbackImageUrl={FALLBACK_THUMBNAIL}
                              width={300}
                              height={300}
                            />
                            {errors.poemBannerStorageId && (
                              <Typography color="error" variant="body2">
                                {errors.poemBannerStorageId.message}
                              </Typography>
                            )}
                          </div>
                        )}
                      />
                    ) : (
                      <Controller
                        name="poemBannerExternalUrl"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Thumbnail URL"
                            fullWidth
                            margin="normal"
                            error={!!errors.poemBannerExternalUrl}
                            helperText={errors.poemBannerExternalUrl?.message}
                          />
                        )}
                      />
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1">Poem Audio/Video</Typography>
                  <RadioGroup
                    row
                    value={poemInputType}
                    onChange={(e) => {
                      const value = e.target.value as "file" | "url";
                      setPoemInputType(value);
                      if (value === "url") {
                        setValue("poemExternalUrl", "");
                        setValue("poemStorageId", ""); // Clear URL field
                      } else {
                        setValue("poemStorageId", "");
                        setValue("poemExternalUrl", ""); // Optionally clear file field
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
                  {poemInputType === "file" ? (
                    <Controller
                      name="poemStorageId"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <ProfilePictureUpload
                            onUploadSuccess={(fileId, durationMs) => {
                              field.onChange(fileId);
                              if (durationMs) {
                                setValue("poemDuration", durationMs);
                              }
                            }}
                            moduleType="POEM"
                            initialPreviewUrl={
                              watch("poemExternalUrl") ||
                              watch("poemStorageUrl") ||
                              ""
                            }
                          />
                          {errors.poemStorageId && (
                            <Typography color="error" variant="body2">
                              {errors.poemStorageId.message}
                            </Typography>
                          )}
                        </div>
                      )}
                    />
                  ) : (
                    <Controller
                      name="poemExternalUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Poem URL"
                          fullWidth
                          margin="normal"
                          error={!!errors.poemExternalUrl}
                          helperText={errors.poemExternalUrl?.message}
                        />
                      )}
                    />
                  )}
                  {errors.poemExternalUrl && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.poemExternalUrl.message}
                    </Typography>
                  )}
                  {errors.poemStorageUrl && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.poemStorageUrl.message}
                    </Typography>
                  )}
                </Box>
                {poemInputType === "url" && (
                  <Box>
                    <Typography variant="subtitle1">Duration</Typography>
                    <Controller
                      name="poemDuration"
                      control={control}
                      defaultValue={0}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Poem Duration (hh:mm:ss)"
                          value={msToHms(field.value)} // show as hh:mm:ss
                          onChange={(e) => {
                            const ms = hmsToMs(e.target.value);
                            field.onChange(ms);
                          }}
                          fullWidth
                          size="small"
                          margin="normal"
                          placeholder="hh:mm:ss"
                          inputProps={{ pattern: "[0-9]{2}:[0-9]{2}:[0-9]{2}" }}
                        />
                      )}
                    />
                  </Box>
                )}
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Controller
                    name="poemTags"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth size="small">
                        <Autocomplete
                          multiple
                          freeSolo
                          options={tag as unknown as string[]}
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
                      </FormControl>
                    )}
                  />
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                >
                  <Button onClick={handleCloseModal}>Cancel</Button>
                  <Button type="submit" variant="contained" color="success">
                    {editData ? "Update" : "Add"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </CustomModal>
          {currentViewPoem && (
            <PoemViewModal
              poem={currentViewPoem}
              open={viewModalOpen}
              onClose={() => setViewModalOpen(false)}
            />
          )}
          <ConfirmDelete
            open={deleteConfirmation.open}
            onCancel={cancelDelete}
            onConfirm={confirmDelete}
          />
          <SnackBar
            openSnackbar={snackbar.open}
            closeSnackbar={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
            severity={snackbar.severity}
            duration={3000}
          />
        </Box>
      )}
    </>
  );
};

export default PoemComponent;
