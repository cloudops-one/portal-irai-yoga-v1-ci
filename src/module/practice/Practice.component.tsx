import { useState } from "react";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Stack,
  Grid,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import PracticeModal from "./PracticeModal";
import {
  useGetAllPractices,
  useDeletePractice,
  useUpdatePracticeStatus,
  useGetCategories,
} from "./Practice.service";
import { CategoryOption, PracticeType } from "./Practice.type";
import MuiDataGridComponent from "../../component/DataGrid";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import Loading from "../../component/Loading";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import DOMPurify from "dompurify";
import { styled, useTheme } from "@mui/material/styles";
import { MediaPreview } from "../../component/MediaPreview.component";
import {
  UseFormattedDateTime,
  usePracticeStatus,
} from "../../common/App.hooks";
import { CustomModal } from "../../component/Modal";

const StyledImageContainer = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: theme.shadows[3],
  position: "relative",
  "&:hover .download-overlay": {
    opacity: 1,
  },
}));

const Practice = () => {
  const { settings: PracticeStatus } = usePracticeStatus();

  const renderHTML = (html: string) => {
    return { __html: DOMPurify.sanitize(html) };
  };
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [practiceForView, setPracticeForView] = useState<PracticeType | null>(
    null,
  );
  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    [],
  );
  const [openModal, setOpenModal] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<PracticeType | null>(
    null,
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    practiceId: string | null;
  }>({ open: false, practiceId: null });

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "desc" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<
    Record<string, boolean>
  >({
    tag: false,
    createdByName: false,
    createdAt: false,
    updatedAt: false,
    updatedByName: false,
    rating: false,
  });
  const {
    practices,
    totalCount,
    isPending: isGetPracticesPending,
    refetch,
  } = useGetAllPractices(
    paginationModel,
    sortModel,
    searchTerm,
    categoryFilter,
  );

  const { deletePractice, isDeletePracticePending } = useDeletePractice();
  const { updateStatus, isUpdateStatusPending } = useUpdatePracticeStatus();
  const { categories } = useGetCategories();

  // Handle category filter change
  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategoryFilter(e.target.value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleView = (practice: PracticeType) => {
    setPracticeForView(practice);
    setViewModalOpen(true);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Handle delete
  const handleRowDelete = (id: string) => {
    setDeleteConfirmation({ open: true, practiceId: id });
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, practiceId: null });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.practiceId) {
      deletePractice(
        { practiceId: deleteConfirmation.practiceId },
        {
          onSuccess: () => {
            refetch();
            showSnackbar(
              "Practice deleted successfully",
              SNACKBAR_SEVERITY.SUCCESS,
            );
            setDeleteConfirmation({ open: false, practiceId: null });
          },
          onError: (error) => {
            const errorMessage = error.message || "Failed to delete practice";
            showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
          },
        },
      );
    }
  };

  // Handle edit
  const handleEdit = (practice: PracticeType) => {
    setSelectedPractice(practice);
    setOpenModal(true);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setSelectedPractice(null);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPractice(null);
  };

  const handleStatusChange = (practiceId: string, status: string) => {
    updateStatus(
      { practiceId, status },
      {
        onSuccess: () => {
          refetch();
          showSnackbar("Status updated", SNACKBAR_SEVERITY.SUCCESS);
        },
        onError: (error) => {
          const errorMessage = error.message || "Failed to update status";
          showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
        },
      },
    );
  };

  // Columns definition
  const columns: GridColDef[] = [
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton onClick={() => handleView(params.row)} color="info">
            <Visibility />
          </IconButton>
          <IconButton onClick={() => handleEdit(params.row)} color="primary">
            <Edit />
          </IconButton>
          <IconButton
            onClick={() => handleRowDelete(params.row.practiceId)}
            color="error"
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
    {
      field: "practiceName",
      headerName: "Title",
      width: 200,
      flex: 1,
    },
    {
      field: "practiceCategoryName",
      headerName: "Category",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.createdAt);
        return formatted;
      },
    },
    {
      field: "createdByName",
      headerName: "Created By",
      width: 180,
      sortable: false,
    },
    {
      field: "updatedByName",
      headerName: "Updated By",
      width: 180,
      sortable: false,
    },
    {
      field: "updatedAt",
      headerName: "Updated On",
      width: 180,
      sortable: false,
      renderCell: (params) => {
        const formatted = UseFormattedDateTime(params.row?.updatedAt);
        return formatted;
      },
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Rating
          value={Number(params.value) || 0}
          precision={0.5}
          readOnly
          size="small"
        />
      ),
    },
    {
      field: "tag",
      headerName: "Tags",
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {params.value?.split(",").map((tag: string, index: number) => (
            <Typography
              key={index}
              variant="body2"
              sx={{
                backgroundColor: "#e0e0e0",
                px: 1,
                borderRadius: 1,
              }}
            >
              {tag.trim()}
            </Typography>
          ))}
        </Box>
      ),
    },

    {
      field: "practiceStatus",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.value}
          onChange={(e) => {
            handleStatusChange(params.row.practiceId, e.target.value);
          }}
          size="small"
          fullWidth
        >
          {PracticeStatus.map((option) => (
            <MenuItem value={option.key} key={option.key}>
              {option.value}
            </MenuItem>
          ))}
        </Select>
      ),
    },
  ];

  const isLoading =
    isGetPracticesPending || isDeletePracticePending || isUpdateStatusPending;

  const itemsWithId = Array.isArray(practices)
    ? practices.map((r: PracticeType) => ({ ...r, id: r.practiceId }))
    : [];

  return (
    <>
      {isLoading && <Loading />}

      <FullHeightDataGridContainer>
        <MuiDataGridComponent
          rows={itemsWithId}
          columns={columns}
          selectedRowIds={selectedRowIds}
          setSelectedRowIds={setSelectedRowIds}
          getRowId={(row) => row.id}
          addButtonText="Add Practice"
          onAddClick={handleOpenModal}
          pagination={true}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={totalCount}
          loading={isGetPracticesPending}
          onSearchChange={handleSearch}
          searchTerm={searchTerm}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          sortingMode="server"
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(model) =>
            setColumnVisibilityModel(model)
          }
          extraToolbarComponents={
            <FormControl size="small" sx={{ width: 200, ml: 2 }}>
              <Select
                value={categoryFilter}
                onChange={handleCategoryChange}
                displayEmpty
                inputProps={{ "aria-label": "Select category" }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {(Array.isArray(categories) ? categories : []).map(
                  (category: CategoryOption) => (
                    <MenuItem
                      key={category.practiceCategoryId}
                      value={category.practiceCategoryId}
                    >
                      {category.practiceCategoryName}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          }
        />
      </FullHeightDataGridContainer>
      <>
        {/* Add View Modal */}
        <CustomModal
          open={viewModalOpen}
          handleClose={() => setViewModalOpen(false)}
          headingText="Practice Details"
        >
          <Box className="p-4 w-full max-h-[80vh] overflow-y-auto">
            {practiceForView && (
              <Stack spacing={4}>
                {/* Banner Image */}
                <StyledImageContainer>
                  <img
                    src={
                      practiceForView.practiceBannerStorageUrl ??
                      practiceForView.practiceBannerExternalUrl ??
                      undefined
                    }
                    alt="Banner"
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                    }}
                  />
                </StyledImageContainer>

                {/* Header with Icon */}
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: theme.palette?.badge?.activeUserText,
                      boxShadow: 3,
                    }}
                  >
                    <img
                      src={
                        practiceForView.practiceIconStorageUrl ??
                        practiceForView.practiceIconExternalUrl ??
                        undefined
                      }
                      alt="Icon"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        color: theme.palette?.badge?.activeUserText,
                      }}
                    />
                  </Box>

                  <Stack sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {practiceForView.practiceName}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                      <Chip
                        label={practiceForView.practiceCategoryName}
                        color="success"
                        variant="outlined"
                        size="small"
                        sx={{ color: "black" }}
                      />
                      <Chip
                        label={practiceForView.practiceStatus}
                        color={
                          practiceForView.practiceStatus === "ACTIVE"
                            ? "success"
                            : "error"
                        }
                        size="small"
                      />
                      <Box display="flex" alignItems="center">
                        <Rating
                          value={practiceForView.rating}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography
                          variant="body2"
                          ml={0.5}
                          color="text.secondary"
                        >
                          ({practiceForView.ratingCount})
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Stack>

                {/* HTML Description */}
                {practiceForView.practiceDescription && (
                  <Box
                    sx={{
                      border: "1px solid #eee",
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Typography variant="h6" mb={1} color="text.secondary">
                      Description
                    </Typography>
                    <Box
                      dangerouslySetInnerHTML={renderHTML(
                        practiceForView.practiceDescription,
                      )}
                      sx={{
                        "& p": { marginBottom: 2 },
                        "& img": { maxWidth: "100%", borderRadius: 1 },
                        "& ul, & ol": { paddingLeft: 3, marginBottom: 2 },
                      }}
                    />
                  </Box>
                )}

                {/* Practice File */}

                <Stack spacing={1}>
                  <Typography variant="h6" color="text.secondary">
                    Practice File
                  </Typography>
                  <StyledImageContainer>
                    <MediaPreview
                      url={
                        practiceForView.practiceStorageUrl ??
                        practiceForView.practiceExternalUrl ??
                        ""
                      }
                    />
                  </StyledImageContainer>
                </Stack>

                {/* Tags */}
                {practiceForView.tags && (
                  <Stack>
                    <Typography variant="h6" color="text.secondary">
                      Tags
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {practiceForView.tags.map(
                        (tag: string, index: number) => (
                          <Chip
                            key={index}
                            label={tag.trim()}
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{ color: "black" }}
                          />
                        ),
                      )}
                    </Box>
                  </Stack>
                )}

                {/* Details Grid */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography variant="body1">
                      {practiceForView.createdByName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Updated By
                    </Typography>
                    <Typography variant="body1">
                      {practiceForView.updatedByName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(practiceForView.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body1">
                      {new Date(practiceForView.updatedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Box>
        </CustomModal>
      </>
      <PracticeModal
        open={openModal}
        handleClose={handleCloseModal}
        refetch={refetch}
        practiceData={selectedPractice ?? undefined}
      />

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
      />
    </>
  );
};

export default Practice;
