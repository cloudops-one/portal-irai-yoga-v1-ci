import React, { useState } from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import ShortsType from "./Shorts.types";
import theme from "../../common/App.theme";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useUpdateShortsStatus } from "./Shorts.service";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import Chip from "@mui/material/Chip";
import { msToTimeString } from "../../component/Duration";

interface ShortCardProps {
  short: ShortsType;
  onEdit: (shortsId: string) => void;
  onDelete: (shorstId: string) => void;
  isActive?: boolean;
  onActivate?: () => void;
  getShortBannerUrl: (short: ShortsType) => string;
  refetch: () => void;
}

const ShortCard: React.FC<ShortCardProps> = ({
  short,
  onEdit,
  onDelete,
  isActive,
  onActivate,
  getShortBannerUrl,
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
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const { updateShortsStatus } = useUpdateShortsStatus();

  const handleStatusChange = (shortsId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    // Optimistic update
    setLocalStatus((prev) => ({ ...prev, [shortsId]: newStatus }));

    updateShortsStatus(
      { shortsId, status: newStatus },
      {
        onSuccess: async () => {
          await refetch();
          // Clear the local status after successful refetch
          setLocalStatus((prev) => {
            const newPrev = { ...prev };
            delete newPrev[shortsId];
            return newPrev;
          });
          showSnackbar("Status updated", SNACKBAR_SEVERITY.SUCCESS);
        },
        onError: (error) => {
          // Revert on error
          setLocalStatus((prev) => {
            const newPrev = { ...prev };
            delete newPrev[shortsId];
            return newPrev;
          });
          const errorMessage = error.message || "Failed to update status";
          showSnackbar(errorMessage, SNACKBAR_SEVERITY.ERROR);
        },
      },
    );
  };

  const currentStatus = localStatus[short.shortsId] ?? short.shortsStatus;

  return (
    <>
      <Box
        sx={{
          maxHeight: "500px",
          aspectRatio: "9 / 16",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          width: "100%",
          boxShadow: 4,
          transition: "transform 0.3s ease-in-out",
          border: isActive
            ? `3px solid ${theme.palette.practiceCategories?.hoverBg}`
            : "3px solid transparent",
        }}
        onClick={onActivate}
      >
        <img
          src={getShortBannerUrl(short)}
          alt={short.shortsName}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          position="absolute"
          sx={{ bottom: 440, color: "white", background: "black" }}
        >
          <Typography variant="subtitle1">
            {msToTimeString(short.duration)}
          </Typography>
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            background: "rgba(0, 0, 0, 0.6)",
            color: theme?.palette?.practiceCategories?.textColor,
            textAlign: "center",
            transition: "transform 0.3s ease",
            zIndex: 2,
          }}
        >
          <Typography variant="body2" noWrap>
            {short.shortsName}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "center" }}>
            {Array.isArray(short.tags) && short.tags.length > 0 ? (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {short.tags.map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1, mb: 1, color: "white" }}
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No tags
              </Typography>
            )}
          </Stack>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-evenly",
            }}
          >
            <Box display="flex" flexDirection="row" alignItems="center">
              <Groups2OutlinedIcon />
              <Typography variant="h6" sx={{ fontSize: "10px", ml: 0.5 }}>
                {short.views ? short.views : "0"}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center">
              <FavoriteBorderOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontSize: "10px", ml: 0.5 }}>
                {short.likes ? short.likes : "0"}
              </Typography>
            </Box>

            <Box>
              {currentStatus === "ACTIVE" ? (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(short.shortsId, currentStatus);
                  }}
                  sx={{
                    cursor: "pointer",
                    color: "white",
                    "&:hover": {
                      backgroundColor: theme.palette.background.default,
                      color: "black",
                    },
                  }}
                >
                  <RemoveRedEyeOutlinedIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(short.shortsId, currentStatus);
                  }}
                  sx={{
                    cursor: "pointer",
                    color: "white",
                    "&:hover": {
                      backgroundColor: theme.palette.background.default,
                      color: "black",
                    },
                  }}
                >
                  <VisibilityOffOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(short.shortsId);
              }}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: theme.palette.background.default,
                  color: "black",
                },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(short.shortsId);
              }}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: theme.palette.background.default,
                  color: "black",
                },
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <SnackBar
        openSnackbar={snackbar.open}
        closeSnackbar={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        severity={snackbar.severity}
        duration={3000}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          mt: "10px",
        }}
      ></Box>
    </>
  );
};

export default ShortCard;
