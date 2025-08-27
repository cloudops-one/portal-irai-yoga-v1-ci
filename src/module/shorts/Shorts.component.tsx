import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import ShortsCardLayout from "./ShortsCard.layout";
import ShortFormDialog from "./ShortsForm.dialog";
import ShortsType from "./Shorts.types";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import SnackBar from "../../component/SnackBar";
import {
  useGetShortsById,
  useDeleteShorts,
  useGetShorts,
} from "./Shorts.service";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
const ShortsComponent = () => {
  const [shorts, setShorts] = useState<ShortsType[]>([]);
  const [activeShortId, setActiveShortId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedShort, setSelectedShort] = useState<ShortsType | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 6,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    shortsId: string | null;
  }>({
    open: false,
    shortsId: null,
  });
  const [totalShorts, setTotalShorts] = useState<number>(0);

  // API Hooks
  const { getShortsById, isGetShortsByIdPending } = useGetShortsById();
  const { deleteShorts, isDeleteShortsPending } = useDeleteShorts();
  const { isGetAllShortsPending, refetch } = useGetShorts(
    setShorts,
    paginationModel,
    setTotalShorts,
  );

  const fetchMore = useCallback(() => {
    if (!isGetAllShortsPending && hasMore && !isLoading) {
      setIsLoading(true);
      setPaginationModel((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [isGetAllShortsPending, hasMore, isLoading]);

  // Add this useEffect to handle initial loading state
  useEffect(() => {
    if (shorts.length > 0) {
      setIsLoading(false);
    }
  }, [shorts]);

  useEffect(() => {
    // Set hasMore based on total count
    if (totalShorts > 0) {
      setHasMore(shorts.length < totalShorts);
    }
  }, [shorts, totalShorts]);

  useEffect(() => {
    // Set initial pagination to load first 6 items
    setPaginationModel({ page: 0, pageSize: 6 });
  }, []);

  useEffect(() => {
    if (shorts.length > 0 && !activeShortId) {
      setActiveShortId(shorts[0].shortsId);
    }
  }, [shorts, activeShortId]);
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

  // Add Short
  const handleAdd = () => {
    setSelectedShort(null);
    setIsEditing(false);
    setFormOpen(true);
  };

  // Edit Short
  const handleEdit = (shortsId: string) => {
    getShortsById(
      { shortsId: shortsId },
      {
        onSuccess: (response) => {
          setSelectedShort(response.data);
          setIsEditing(true);
          setFormOpen(true);
        },
        onError(error) {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "failed to get Shorts Details";
          console.error("failed to get shorts Details");
          showError(errorMessage);
        },
      },
    );
  };

  // Delete Short
  const handleDelete = (id: string) => {
    setDeleteConfirmation({ open: true, shortsId: id });
  };

  // Cancel Delete Modal
  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, shortsId: null });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.shortsId) {
      deleteShorts(
        { shortsId: deleteConfirmation.shortsId },
        {
          onSuccess: async (response: { message?: string }) => {
            await refetch();
            showSuccess(response.message || "Short deleted successfully");
            setDeleteConfirmation({ open: false, shortsId: null });
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete short";
            console.error("Failed to delete short:", errorMessage);
            showError(errorMessage);
            setDeleteConfirmation({ open: false, shortsId: null });
          },
        },
      );
    }
  };
  // When form is submitted (add or update)
  const handleFormSubmit = (short: ShortsType, editMode: boolean) => {
    if (editMode) {
      setShorts((prev) =>
        prev.map((s) => (s.shortsId === short.shortsId ? short : s)),
      );
    } else {
      if (gridRef.current) {
        gridRef.current.scrollTop = 0;
      }
      setShorts((prev) => [short, ...prev]);
    }
    setFormOpen(false);
  };

  const gridRef = useRef<HTMLDivElement | null>(null);

  const getShortVideoUrl = (short: ShortsType) =>
    short.shortsStorageUrl ? short.shortsStorageUrl : short.shortsExternalUrl!;
  const getShortBannerUrl = (short: ShortsType) =>
    short.shortsBannerStorageUrl || short.shortsBannerExternalUrl || "";

  const activeShort = shorts.find((s) => s.shortsId === activeShortId);
  const singleGetLoadings = isDeleteShortsPending || isGetShortsByIdPending;
  return (
    <Box>
      <FullHeightDataGridContainer>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mx={2}
        >
          <Typography variant="h6">Shorts</Typography>
          <Button variant="contained" onClick={handleAdd}>
            Add Shorts
          </Button>
        </Box>
        <Box sx={{ display: "flex", height: "95%" }}>
          <Box
            ref={gridRef}
            sx={{ flex: 1, maxWidth: "70%", overflowY: "auto" }}
          >
            <ShortsCardLayout
              shorts={shorts}
              activeShortId={activeShortId}
              setActiveShortId={setActiveShortId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              fetchMore={fetchMore}
              hasMore={hasMore}
              containerRef={gridRef}
              getShortBannerUrl={getShortBannerUrl}
              isLoading={
                isGetAllShortsPending || isLoading || singleGetLoadings
              }
              refetch={refetch}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              maxWidth: "30%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              height: "100%",
              maxHeight: "100%",
              overflow: "auto",
            }}
          >
            {activeShort ? (
              <Box
                sx={{
                  position: "relative",
                  flexGrow: 1,
                  backgroundColor: "#000",
                  borderRadius: "8px",
                  overflow: "hidden",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  aspectRatio: "9/16",
                }}
              >
                <video
                  src={getShortVideoUrl(activeShort)}
                  controls
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    backgroundColor: "#000",
                    borderRadius: "8px",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    padding: 2,
                    color: "white",
                  }}
                >
                  <Typography variant="h6">{activeShort.shortsName}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography>Select a short to play</Typography>
            )}
          </Box>
        </Box>
      </FullHeightDataGridContainer>
      <ShortFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        short={selectedShort}
        editMode={isEditing}
        refetch={refetch}
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
        duration={3000}
      />
    </Box>
  );
};

export default ShortsComponent;
