import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Grid,
  CircularProgress,
  IconButton,
  Avatar,
  MenuItem,
  Chip,
  FormControl,
  Select,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import ProgramModal from "./ProgramModal";
import {
  useGetPrograms,
  useDeleteProgram,
  useGetProgramById,
  useUpdateProgramStatus,
  useUpdateProgramFlag,
} from "./Program.service";
import { Program } from "./Program.type";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import theme from "../../common/App.theme";
import { useProgramStatus } from "../../common/App.hooks";
import { useGetSetting } from "../../common/App.service";
import { SettingItem } from "../../common/App.type";
interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
const ProgramComponent: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    pageSize: 10,
    total: 0,
  });
  const [isMounted, setIsMounted] = useState(false);
  const { getSetting: getFlags } = useGetSetting();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    programId: string | null;
  }>({ open: false, programId: null });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
  }>({
    open: false,
    message: "",
    severity: SNACKBAR_SEVERITY.INFO,
  });

  const { updateProgramStatus } = useUpdateProgramStatus();
  const { updateProgramFlag } = useUpdateProgramFlag();
  const { deleteProgram } = useDeleteProgram();
  const { getProgramById } = useGetProgramById();
  const { settings: programStatus } = useProgramStatus();
  const [flags, setFlags] = useState<SettingItem[]>([]);
  const handleStatusChange = (newStatus: string, programId: string) => {
    updateProgramStatus(
      { programId, status: newStatus },
      {
        onSuccess: (response) => {
          showSuccess(response.message || "Status updated successfully");
          fetchPrograms();
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to update status";
          showError(errorMessage);
        },
      },
    );
  };
  const handleFlagChange = (newFlag: string, programId: string) => {
    updateProgramFlag(
      { programId, flag: newFlag },
      {
        onSuccess: (response) => {
          showSuccess(response.message || "Flag updated successfully");
          fetchPrograms();
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to update status";
          showError(errorMessage);
        },
      },
    );
  };

  const showSnackbar = (message: string, severity: SnackbarSeverity) => {
    setSnackbar({ open: true, message, severity });
  };

  const showSuccess = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.SUCCESS);
  };

  const showError = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);
  };

  const handleDeleteProgram = (programId: string) => {
    setDeleteConfirmation({ open: true, programId });
  };
  const { refetch: fetchPrograms, isGetProgramsPending } = useGetPrograms(
    setPrograms,
    pagination,
    (newPagination) => setPagination((prev) => ({ ...prev, ...newPagination })),
    (total) => setPagination((prev) => ({ ...prev, total: total as number })),
    "",
    [],
    isMounted,
  );

  const confirmDelete = () => {
    if (deleteConfirmation.programId) {
      deleteProgram(
        { programId: deleteConfirmation.programId },
        {
          onSuccess: (response: { message?: string }) => {
            fetchPrograms();
            showSuccess(response.message || "Program deleted successfully");
            setDeleteConfirmation({ open: false, programId: null });
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete program";
            showError(errorMessage);
            setDeleteConfirmation({ open: false, programId: null });
          },
        },
      );
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, programId: null });
  };

  const handleOpenModal = (program?: Program) => {
    if (program) {
      // Load program details when editing
      getProgramById(
        { programId: program.programId },
        {
          onSuccess: (response) => {
            setSelectedProgram(response.data);
            setIsModalOpen(true);
          },
        },
      );
    } else {
      setSelectedProgram(null);
      setIsModalOpen(true);
    }
  };

  const handleSaveProgram = () => {
    fetchPrograms();
  };
  useEffect(() => {
    if (isMounted) {
      fetchPrograms();
    }
  }, [isMounted]);

  useEffect(() => {
    getFlags(
      { settingName: "PROGRAM_FLAG" },
      {
        onSuccess: (res) => {
          const options = res?.data?.settingValue ?? [];
          setFlags(options);
        },
        onError: (err) => {
          console.error("Failed to fetch program flags:", err);
        },
      },
    );
  }, []);
  return (
    <FullHeightDataGridContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">Programs</Typography>
          <Button
            variant="contained"
            onClick={() => handleOpenModal()}
            sx={{
              backgroundColor: theme.palette.badge?.success,
              "&:hover": {
                backgroundColor: theme.palette.badge?.success,
              },
            }}
          >
            Add Program
          </Button>
        </Box>
        {/* Content Section */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            pb: 2,
          }}
        >
          {isGetProgramsPending ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {programs.map((program) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3.5}
                  key={program.programId}
                >
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: "relative",
                        height: 160,
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <CardMedia
                        component="img"
                        sx={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          transition: "transform 0.3s ease",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                        image={
                          program.programBannerStorageUrl ||
                          program.programBannerExternalUrl ||
                          "/placeholder-banner.jpg"
                        }
                        alt={program.programName}
                      />
                      <Chip
                        label={program.flag || "No Flag"}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          backgroundColor: theme.palette?.badge?.info,
                          color: "white",
                          fontWeight: "bold",
                          borderRadius: 1,
                          padding: "4px 8px",
                        }}
                      />
                      <Chip
                        label={program.programStatus}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor:
                            program.programStatus === "ACTIVE"
                              ? theme.palette?.badge?.success
                              : theme.palette?.badge?.error,
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    </Box>

                    {/* Card Content */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        padding: "16px 16px 8px",
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          lineHeight: 1.3,
                          mb: 1,
                        }}
                      >
                        {program.programName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          "& *": {
                            display: "inline",
                            margin: 0,
                            padding: 0,
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html: program.programDescription || "",
                        }}
                      />
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 1 }}
                      >
                        <Avatar
                          src={program.orgIconStorageUrl}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {program.orgName}
                        </Typography>
                      </Box>
                    </CardContent>

                    {/* Card Actions */}
                    <CardActions
                      sx={{
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        borderTop: "1px solid rgba(0,0,0,0.1)",
                      }}
                    >
                      <Box>
                        <IconButton
                          onClick={() => handleOpenModal(program)}
                          size="small"
                          sx={{
                            color: theme.palette?.badge?.success,
                            "&:hover": {
                              backgroundColor: theme.palette?.badge?.success,
                              color: "white",
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteProgram(program.programId)}
                          size="small"
                          sx={{
                            color: theme.palette?.badge?.error,
                            "&:hover": {
                              backgroundColor: theme.palette?.badge?.error,
                              color: "white",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>

                      <FormControl
                        size="small"
                        sx={{ minWidth: 90, maxWidth: "auto", mr: 0.5 }}
                      >
                        <Select
                          value={program.flag}
                          onChange={(e) =>
                            handleFlagChange(e.target.value, program.programId)
                          }
                          sx={{ height: 36 }}
                        >
                          {flags.map((option) => (
                            <MenuItem value={option.key} key={option.key}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl
                        size="small"
                        sx={{ minWidth: 80, maxWidth: "auto", mr: 0.5 }}
                      >
                        <Select
                          value={program.programStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              e.target.value,
                              program.programId,
                            )
                          }
                          sx={{ height: 36 }}
                        >
                          {programStatus.map((option) => (
                            <MenuItem value={option.key} key={option.key}>
                              {option.value}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Modals and other fixed elements */}
        <ProgramModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProgram}
          program={selectedProgram || undefined}
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
    </FullHeightDataGridContainer>
  );
};

export default ProgramComponent;
