import { useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SyncIcon from "@mui/icons-material/Sync";
import {
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from "@mui/x-data-grid";
import Tooltip from "@mui/material/Tooltip";
import { triggerLightbox } from "../../util/GlightBox.helper";
import Loading from "../../component/Loading";
import MuiDataGridComponent from "../../component/DataGrid";
import {
  useDeleteStorageFiles,
  useGetStorageFiles,
  useSyncStorage,
  useGetLastSyncTime,
} from "./Storage.service";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import { formatFileSize } from "../../util/fileUtils";
import { StorageType } from "./Storage.types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
} from "@mui/material";
import GLightbox from "glightbox";
import SnackBar from "../../component/SnackBar"; // Adjust path if necessary
import { SNACKBAR_SEVERITY } from "../../common/App.const";
import theme from "../../common/App.theme";

const Storage = () => {
  const [currentItems, setCurrentItems] = useState<StorageType[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    [],
  );
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    storageName: string | null;
  }>({
    open: false,
    storageName: null,
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "asc" }, // Default sort
  ]);
  const [rowCountState, setRowCountState] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "info" | "success" | "error" | "warning"
  >("info");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPaginationModel((prev) => ({
      ...prev,
      page: 0, // Reset to first page on new search
    }));
  };
  const { isGetFilesPending, refetch } = useGetStorageFiles(
    setCurrentItems,
    paginationModel,
    setPaginationModel,
    setRowCountState,
    searchTerm,
    sortModel,
  );
  const { deleteStorageFiles, isDeleteStorageFilesPending } =
    useDeleteStorageFiles();

  const { syncStorage, isSyncStoragePending } = useSyncStorage();
  const { lastSyncTime, refetchLastSync } = useGetLastSyncTime();

  const handleSync = () => {
    syncStorage(
      {},
      {
        onSuccess: (response: { message?: string }) => {
          refetch();
          refetchLastSync();
          setSnackbarMessage(
            response.message || "Storage synchronized successfully",
          );
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
        },
        onError: (err: Error) => {
          setSnackbarMessage(err.message || "Synchronization failed");
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
      },
    );
  };
  const handleRowDelete = (id: string) => {
    // Show the confirmation modal
    setDeleteConfirmation({ open: true, storageName: id });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.storageName) {
      deleteStorageFiles(
        { storageName: deleteConfirmation.storageName },
        {
          onSuccess: async () => {
            await refetch();
            setDeleteConfirmation({ open: false, storageName: null });
            setSnackbarMessage("File deleted successfully.");
            setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
            setOpenSnackbar(true);
          },
          onError: (err: Error) => {
            setSnackbarMessage(err.message || "Failed to delete file.");
            setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
            setOpenSnackbar(true);
            setDeleteConfirmation({ open: false, storageName: null }); // Close modal even on error
          },
        },
      );
    }
  };
  const glightboxRef = useRef<ReturnType<typeof GLightbox> | null>(null);

  const cancelDelete = () => {
    // Close the confirmation modal without deleting
    setDeleteConfirmation({ open: false, storageName: null });
  };
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    src: string | null;
    type: string | null;
    title: string;
  }>({
    open: false,
    src: null,
    type: null,
    title: "",
  });
  const columns: GridColDef<StorageType>[] = [
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <>
          <Tooltip title="View">
            <IconButton
              onClick={() => {
                const { storageUrl, contentType, storageName } = params.row;
                if (!contentType) return;
                if (contentType.startsWith("image/")) {
                  triggerLightbox(storageUrl, "image");
                } else if (contentType.startsWith("video/")) {
                  if (glightboxRef.current) glightboxRef.current.destroy();
                  glightboxRef.current = GLightbox({
                    elements: [{ href: storageUrl, type: "video" }],
                  });
                  glightboxRef.current.open();
                } else if (contentType.startsWith("audio/")) {
                  setPreviewModal({
                    open: true,
                    src: storageUrl,
                    type: "audio",
                    title: storageName,
                  });
                }
              }}
              color="primary"
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          {/* Delete Button */}

          <Tooltip title="Delete">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                handleRowDelete(params?.row?.storageName); // Show confirmation modal
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },

    { field: "storageName", headerName: "File Name", width: 400 },

    {
      field: "contentType",
      headerName: "File Type",
      width: 120,
      // Add explicit typing and null check
      valueGetter: (value: string) => {
        return value ? (value.split("/")[1]?.toUpperCase() ?? value) : "";
      },
    },
    {
      field: "size",
      headerName: "Size",
      width: 120,
      valueGetter: (value: number) => (value ? formatFileSize(value) : "0 KB"),
    },
    { field: "tags", headerName: "Tags", width: 450 },
    {
      field: "createdByName",
      headerName: "Created By",
      width: 150,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 200,
      valueFormatter: (params) => {
        if (!params) return "";
        const date = new Date(params);
        return date.toLocaleString("en-US", {
          day: "2-digit",
          year: "numeric",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
      },
    },
  ];

  const itemsWithId = (currentItems || []).map((r) => ({
    ...r,
    id: r.storageId,
  }));

  const isLoading = isDeleteStorageFilesPending || isGetFilesPending;

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchTerm, sortModel]);

  const syncButton = (
    <div className="flex justify-center items-center">
      <Button
        variant="contained"
        startIcon={<SyncIcon />}
        onClick={handleSync}
        disabled={isSyncStoragePending}
        sx={{ ml: 1 }}
      >
        Sync
      </Button>
      {lastSyncTime && (
        <Tooltip
          title={`Last synced: ${new Date(lastSyncTime).toLocaleString()}`}
        >
          <Typography
            variant="subtitle1"
            sx={{
              ml: 2,
              fontSize: "0.75rem",
              color: theme.palette.badge?.success,
            }}
          >
            {isSyncStoragePending ? (
              "Sync in progress..."
            ) : lastSyncTime ? (
              <Tooltip
                title={`Last synced: ${new Date(lastSyncTime).toLocaleString()}`}
              >
                <span>
                  Last Synced:{" "}
                  {new Date(lastSyncTime).toLocaleString([], {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
              </Tooltip>
            ) : null}
          </Typography>
        </Tooltip>
      )}
    </div>
  );
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <FullHeightDataGridContainer>
          <MuiDataGridComponent
            rows={itemsWithId}
            columns={columns}
            selectedRowIds={selectedRowIds}
            getRowId={(row) => row.id}
            setSelectedRowIds={setSelectedRowIds}
            pagination={true}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCountState}
            loading={isGetFilesPending}
            onSearchChange={handleSearch}
            searchTerm={searchTerm}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            sortingMode="server"
            extraToolbarComponents={syncButton}
          />
        </FullHeightDataGridContainer>
      )}

      <Dialog
        open={previewModal.open}
        onClose={() =>
          setPreviewModal({ open: false, src: null, type: null, title: "" })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{previewModal.title}</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {previewModal.type === "audio" && previewModal.src && (
            <audio controls autoPlay style={{ width: 300 }}>
              <source src={previewModal.src} />
              Your browser does not support the audio element.
            </audio>
          )}
          {previewModal.type === "video" && previewModal.src && (
            <video
              controls
              autoPlay
              style={{ width: "100%", maxHeight: 400, marginTop: 10 }}
            >
              <source src={previewModal.src} />
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDelete
        open={deleteConfirmation.open}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      <SnackBar
        openSnackbar={openSnackbar}
        closeSnackbar={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
        duration={3000}
      />
    </>
  );
};

export default Storage;
