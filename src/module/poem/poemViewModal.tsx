import React, { useEffect } from "react";
import { msToTimeString } from "../../component/Duration";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  IconButton,
  Fade,
  Grow,
  Slide,
  Stack,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TagIcon from "@mui/icons-material/Tag";
import { PoemType } from "./poem.type";
import { MediaPreview } from "../../component/MediaPreview.component";
import theme from "../../common/App.theme";

// Helper component for poem banner
const PoemBanner: React.FC<{ poem: PoemType; isMobile: boolean }> = ({
  poem,
  isMobile,
}) => {
  const hasBanner = poem.poemBannerStorageUrl || poem.poemBannerExternalUrl;
  if (!hasBanner) return null;

  return (
    <Box
      sx={{
        position: "relative",
        height: isMobile ? "180px" : "250px",
        background: "#fafafa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: "hidden",
      }}
    >
      <MediaPreview
        url={poem.poemBannerStorageUrl ?? poem.poemBannerExternalUrl}
      />
    </Box>
  );
};

// Helper component for poem metadata
const PoemMetadata: React.FC<{ poem: PoemType; isMobile: boolean }> = ({
  poem,
  isMobile,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: isMobile ? "flex-start" : "flex-end",
      ml: isMobile ? 0 : "auto",
      minWidth: isMobile ? "100%" : "240px",
      mt: isMobile ? 2 : 0,
    }}
  >
    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
      <VisibilityIcon sx={{ color: "primary.main" }} />
      <Typography variant="subtitle1">{poem.poemViews ?? 0} Views</Typography>
    </Stack>
    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
      <AccessTimeIcon sx={{ color: "secondary.main" }} />
      <Typography variant="subtitle1">
        {msToTimeString(poem.poemDuration)}
      </Typography>
    </Stack>
    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
      <TagIcon fontSize="small" sx={{ mr: 1 }} color="warning" />
      {Array.isArray(poem.poemTags) && poem.poemTags.length > 0 ? (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {poem.poemTags.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ mr: 1, mb: 1, color: "black" }}
            />
          ))}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No tags
        </Typography>
      )}
    </Stack>
  </Box>
);

// Helper component for poem header
const PoemHeader: React.FC<{ poem: PoemType; isMobile: boolean }> = ({
  poem,
  isMobile,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "flex-start" : "center",
      justifyContent: "space-between",
      gap: 2,
      flexWrap: "wrap",
    }}
  >
    {/* Left: Title and Author */}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="h5"
        fontWeight={700}
        color="primary"
        gutterBottom
        sx={{ wordBreak: "break-word" }}
      >
        {poem.poemName}
      </Typography>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        mb={isMobile ? 1 : 0}
      >
        <PersonIcon sx={{ color: "success.main" }} fontSize="small" />
        <Typography variant="subtitle1" fontWeight={500}>
          {poem.poemAuthor}
        </Typography>
      </Stack>
    </Box>
    {/* Right: Views, Duration, Tags */}
    <PoemMetadata poem={poem} isMobile={isMobile} />
  </Box>
);

// Helper component for poem content
const PoemContent: React.FC<{ poem: PoemType }> = ({ poem }) => (
  <Box sx={{ mt: 3 }}>
    <Typography
      variant="subtitle2"
      sx={{
        mb: 2,
        color: theme.palette.text.secondary,
        maxWidth: "100%",
        wordBreak: "break-word",
      }}
    >
      {poem.poemDescription}
    </Typography>
    <Box
      sx={{
        borderRadius: 1,
        py: 2,
        px: 1,
        textAlign: "justify",
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.grey[900]
            : theme.palette.grey[50],
        maxWidth: "100%",
      }}
    >
      <Typography
        variant="body1"
        sx={{
          whiteSpace: "pre-line",
          wordBreak: "break-word",
        }}
      >
        {poem.poemText}
      </Typography>
    </Box>
  </Box>
);

// Helper component for media preview
const PoemMediaPreview: React.FC<{ poem: PoemType }> = ({ poem }) => {
  const hasMedia = poem.poemStorageUrl || poem.poemExternalUrl;

  if (!hasMedia) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <MediaPreview url={poem.poemStorageUrl ?? poem.poemExternalUrl} />
        </CardContent>
      </Card>
    </Box>
  );
};

export const PoemViewModal = ({
  poem,
  open,
  onClose,
}: {
  poem: PoemType | null;
  open: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  if (!poem) return null;

  const handleClose = () => {
    setVisible(false);
    const timeout = setTimeout(onClose, 300);
    return () => clearTimeout(timeout);
  };

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.7)",
          zIndex: 1300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
          p: isMobile ? 1 : 4,
        }}
      >
        <Slide in={visible} direction="up" timeout={300}>
          <Paper
            sx={{
              width: "100%",
              maxWidth: "900px",
              maxHeight: "93vh",
              overflow: "auto",
              borderRadius: 3,
              boxShadow: 24,
              position: "relative",
              background: theme.palette.background.default,
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                backgroundColor: "rgba(255,255,255,0.85)",
                "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
              }}
            >
              <CloseIcon />
            </IconButton>

            <PoemBanner poem={poem} isMobile={isMobile} />

            <Box sx={{ p: isMobile ? 2 : 4 }}>
              <Grow in={visible} timeout={500}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardContent>
                    <PoemHeader poem={poem} isMobile={isMobile} />
                    <PoemContent poem={poem} />
                  </CardContent>
                </Card>
              </Grow>

              <PoemMediaPreview poem={poem} />
            </Box>
          </Paper>
        </Slide>
      </Box>
    </Fade>
  );
};
