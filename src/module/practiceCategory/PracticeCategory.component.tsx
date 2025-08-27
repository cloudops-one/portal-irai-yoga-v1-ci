import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Button,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Avatar,
  Modal,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import Loading from "../../component/Loading";
import MuiDataGridComponent from "../../component/DataGrid";
import {
  PracticeCategoryType,
  formDataInitialState,
} from "./PracticeCategory.types";
import {
  useGetCategories,
  useAddCategory,
  useEditCategory,
  useDeleteCategory,
  useUpdateCategoryStatus,
  useGetCategoryById,
} from "./PracticeCategory.service";
import { formSchema } from "./PracticeCategory.const";
import * as Yup from "yup";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import { ProfilePictureUpload } from "../../component/ProfilePictureUpload";
import { CustomModal } from "../../component/Modal";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import { yupResolver } from "@hookform/resolvers/yup";
import { FALLBACK_LOGO } from "../../common/App.const";
import theme from "../../common/App.theme";
import { usePracticeCategoryStatus } from "../../common/App.hooks";

interface FormContext {
  imageInputType: "upload" | "url";
}
const PracticeCategory = () => {
  const { settings: PracticeCatstatus } = usePracticeCategoryStatus();
  const addButtonText = "Practice Category";
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    [],
  );
  const [imageInputType, setImageInputType] = useState<"upload" | "url">(
    "upload",
  );

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowCountState, setRowCountState] = useState(0);
  const [currentItems, setCurrentItems] = useState<PracticeCategoryType[]>([]);
  const [open, setOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [currentViewCategory, setCurrentViewCategory] =
    useState<PracticeCategoryType | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    practiceCategoryId: null as string | null,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<PracticeCategoryType>({
    resolver: yupResolver(formSchema as Yup.ObjectSchema<PracticeCategoryType>),
    defaultValues: formDataInitialState,
    mode: "onBlur",
    context: { imageInputType } as FormContext,
  });

  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const showSuccess = (message: string) =>
    showSnackbar(message, SNACKBAR_SEVERITY.SUCCESS);
  const showError = (message: string) =>
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);

  const { isGetAllCategoriesPending, refetch } = useGetCategories(
    setCurrentItems,
    paginationModel,
    setPaginationModel,
    setRowCountState,
    searchTerm,
    sortModel,
  );
  const { addCategory, isAddCategoryPending } = useAddCategory();
  const { editCategory, isEditCategoryPending } = useEditCategory();
  const { deleteCategory } = useDeleteCategory();
  const { updateCategoryStatus } = useUpdateCategoryStatus();
  const { getCategoryById, isGetCategoryPending } = useGetCategoryById();

  // Handle modal close safely
  const handleSafeClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setOpen(false);
    reset(formDataInitialState);
    setImageInputType("upload");
    setDeleteConfirmation({ open: false, practiceCategoryId: null });
  };

  const handleView = (categoryData: PracticeCategoryType) => {
    getCategoryById(
      { practiceCategoryId: categoryData.practiceCategoryId },
      {
        onSuccess: (response) => {
          const data = response.data as PracticeCategoryType;
          setCurrentViewCategory(data);
          setViewModalOpen(true);
        },
        onError: (error) => {
          console.error("Failed to get category:", error.message);
        },
      },
    );
  };

  const triggerRowEdit = (category: PracticeCategoryType) => {
    getCategoryById(
      { practiceCategoryId: category.practiceCategoryId },
      {
        onSuccess: (response) => {
          const data = response.data as PracticeCategoryType;
          const category = data;

          // Reset form with fetched data
          reset({
            practiceCategoryId: category.practiceCategoryId,
            practiceCategoryName: category.practiceCategoryName,
            practiceCategoryIconStorageId:
              category.practiceCategoryIconStorageId,
            practiceCategoryIconExternalUrl:
              category.practiceCategoryIconExternalUrl,
            practiceCategoryIconStorageUrl:
              category.practiceCategoryIconStorageUrl,
          });

          // Set input type based on existing data
          if (category.practiceCategoryIconStorageId) {
            setImageInputType("upload");
          } else if (category.practiceCategoryIconExternalUrl) {
            setImageInputType("url");
          }

          handleOpen();
        },
        onError: (error) => {
          console.error("Failed to get category:", error.message);
        },
      },
    );
  };

  const confirmDelete = () => {
    if (deleteConfirmation.practiceCategoryId) {
      handleDelete(deleteConfirmation.practiceCategoryId);
      setDeleteConfirmation({ open: false, practiceCategoryId: null });
    }
  };

  const handleDelete = (practiceCategoryId: string) => {
    deleteCategory(
      { practiceCategoryId },
      {
        onSuccess: () => {
          refetch();
          handleCloseModal();
          reset(formDataInitialState);
        },
        onError: (error) => {
          console.error("Failed to delete category:", error.message);
        },
      },
    );
  };

  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      width: 300,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="View">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleView(params.row);
              }}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                triggerRowEdit(params.row);
              }}
              color="primary"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setDeleteConfirmation({
                  open: true,
                  practiceCategoryId: params.row.practiceCategoryId,
                });
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
    { field: "practiceCategoryName", headerName: "Category Name", width: 550 },
    {
      field: "practiceCategoryStatus",
      headerName: "Status",
      width: 300,
      renderCell: (params) => (
        <Select
          value={params.value}
          onClick={(event) => event.stopPropagation()}
          onChange={(e) => {
            const updatedStatus = e.target.value;
            updateCategoryStatus(
              {
                practiceCategoryId: params.row.practiceCategoryId,
                status: updatedStatus,
              },
              {
                onSuccess: () => {
                  refetch();
                },
                onError: (error) => {
                  console.error("Failed to update status:", error.message);
                },
              },
            );
          }}
          size="small"
          fullWidth
        >
          {PracticeCatstatus.map((status) => (
            <MenuItem key={status.key} value={status.key}>
              {status.value}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  const handleOpen = () => {
    setOpen(true);
  };

  const onSubmit = async (data: PracticeCategoryType) => {
    try {
      // Prepare payload
      const payload = {
        practiceCategoryName: data.practiceCategoryName,
        ...(imageInputType === "upload"
          ? {
              practiceCategoryIconStorageId: data.practiceCategoryIconStorageId,
              practiceCategoryIconExternalUrl: "",
            }
          : {
              practiceCategoryIconStorageId: "",
              practiceCategoryIconExternalUrl:
                data.practiceCategoryIconExternalUrl,
            }),
      };

      if (data.practiceCategoryId) {
        // Update existing category
        editCategory(
          { ...payload, practiceCategoryId: data.practiceCategoryId },
          {
            onSuccess: (response: { message?: string }) => {
              refetch();
              handleCloseModal();
              showSuccess(
                response.message || "Practice category updated successfully",
              );
            },
            onError: (error) => {
              const errorMessage =
                (error.response?.data as { errorMessage?: string })
                  ?.errorMessage ||
                error.message ||
                "Failed to update category";
              showError(errorMessage);
            },
          },
        );
      } else {
        // Create new category
        addCategory(payload, {
          onSuccess: () => {
            refetch();
            handleCloseModal();
            showSuccess("Practice category created successfully");
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to create category";
            showError(errorMessage);
          },
        });
      }
    } catch (error) {
      console.error("Failed to create/update category:", error);
      showError("An unexpected error occurred");
    }
  };

  const isloading =
    isAddCategoryPending ||
    isGetAllCategoriesPending ||
    isEditCategoryPending ||
    isGetCategoryPending;

  const itemsWithId = currentItems?.map((r) => ({
    ...r,
    id: r?.practiceCategoryId,
  }));

  return (
    <>
      {isloading ? (
        <Loading />
      ) : (
        <FullHeightDataGridContainer>
          <MuiDataGridComponent
            rows={itemsWithId}
            columns={columns}
            selectedRowIds={selectedRowIds}
            getRowId={(row) => row.id}
            setSelectedRowIds={setSelectedRowIds}
            addButtonText={addButtonText}
            onAddClick={handleOpen}
            pagination={true}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCountState}
            loading={isGetAllCategoriesPending}
            onSearchChange={(term) => setSearchTerm(term)}
            searchTerm={searchTerm}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingMode="server"
          />
        </FullHeightDataGridContainer>
      )}

      {/* Discard Changes Confirmation */}
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

      {/* Add/Edit Modal */}
      <CustomModal
        open={open}
        handleClose={handleSafeClose}
        headingText={
          watch("practiceCategoryId")
            ? "Edit Practice Category"
            : "Add Practice Category"
        }
      >
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="practiceCategoryName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Category Name"
                  fullWidth
                  sx={{ mb: 3 }}
                  error={!!errors.practiceCategoryName}
                  helperText={errors.practiceCategoryName?.message}
                  size="small"
                />
              )}
            />

            {/* Image Source Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Image Source
              </Typography>
              <RadioGroup
                row
                value={imageInputType}
                onChange={(e) => {
                  const newType = e.target.value as "upload" | "url";
                  setImageInputType(newType);
                  // Clear the other field when switching
                  if (newType === "upload") {
                    setValue("practiceCategoryIconExternalUrl", "");
                  } else {
                    setValue("practiceCategoryIconStorageId", "");
                  }
                }}
              >
                <FormControlLabel
                  value="upload"
                  control={<Radio />}
                  label="Upload Image"
                />
                <FormControlLabel
                  value="url"
                  control={<Radio />}
                  label="Enter URL"
                />
              </RadioGroup>
            </Box>

            {/* Image Input */}
            {imageInputType === "upload" ? (
              <Box sx={{ mb: 3 }}>
                <Controller
                  name="practiceCategoryIconStorageId"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <ProfilePictureUpload
                        onUploadSuccess={(fileId) => {
                          field.onChange(fileId);
                        }}
                        moduleType="PRACTICE"
                        initialPreviewUrl={
                          watch("practiceCategoryIconExternalUrl") ||
                          watch("practiceCategoryIconStorageUrl") ||
                          ""
                        }
                        fallbackImageUrl={FALLBACK_LOGO}
                        width={150}
                        height={150}
                      />
                      {errors.practiceCategoryIconStorageId && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {errors.practiceCategoryIconStorageId.message}
                        </Typography>
                      )}
                    </div>
                  )}
                />
              </Box>
            ) : (
              <Box sx={{ mb: 3 }}>
                <Controller
                  name="practiceCategoryIconExternalUrl"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Image URL"
                      fullWidth
                      error={!!errors.practiceCategoryIconExternalUrl}
                      helperText={
                        errors.practiceCategoryIconExternalUrl?.message
                      }
                      size="small"
                    />
                  )}
                />
              </Box>
            )}

            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                type="submit"
                variant="contained"
                disabled={isAddCategoryPending || isEditCategoryPending}
              >
                {isAddCategoryPending || isEditCategoryPending ? (
                  <CircularProgress size={24} />
                ) : watch("practiceCategoryId") ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </form>
        </Box>
      </CustomModal>

      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="view-category-modal"
        aria-describedby="view-category-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {currentViewCategory?.practiceCategoryName}
          </Typography>
          {currentViewCategory?.practiceCategoryIconExternalUrl ||
            (currentViewCategory?.practiceCategoryIconStorageUrl && (
              <Box
                sx={{ mt: 2, mb: 2, display: "flex", justifyContent: "center" }}
              >
                <Avatar
                  src={
                    currentViewCategory?.practiceCategoryIconExternalUrl ||
                    currentViewCategory?.practiceCategoryIconStorageUrl
                  }
                  alt={currentViewCategory.practiceCategoryName}
                  sx={{ width: 120, height: 120 }}
                />
              </Box>
            ))}

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => setViewModalOpen(false)}
            fullWidth
          >
            Close
          </Button>
        </Box>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDelete
        open={deleteConfirmation.open}
        onCancel={() =>
          setDeleteConfirmation({ open: false, practiceCategoryId: null })
        }
        onConfirm={confirmDelete}
      />
      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={3000}
      />
    </>
  );
};

export default PracticeCategory;
