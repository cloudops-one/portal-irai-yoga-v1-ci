import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Paper,
  Fade,
  Slide,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardMedia,
  Grow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { NewsType } from "./news.type";
import { format } from "date-fns";
import Grid from "@mui/material/Grid2";
import theme from "../../common/App.theme";

const NewsHeader: React.FC<{ news: NewsType; isMobile: boolean }> = ({
  news,
  isMobile,
}) => {
  const hasBanner = news.newsBannerStorageUrl || news.newsBannerExternalUrl;

  if (hasBanner) {
    return (
      <Box sx={{ position: "relative", height: isMobile ? "200px" : "300px" }}>
        <CardMedia
          component="img"
          image={news.newsBannerStorageUrl || news.newsBannerExternalUrl || ""}
          alt={news.newsName}
          sx={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)",
            p: 3,
            color: "white",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
            >
              {news.newsName}
            </Typography>
            <Chip
              label={news.newsStatus}
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                height: "32px",
                backgroundColor:
                  news.newsStatus === "ACTIVE"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                color:
                  news.newsStatus === "ACTIVE"
                    ? theme.palette.success.contrastText
                    : theme.palette.error.contrastText,
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: isMobile ? "150px" : "200px",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: "''",
          position: "absolute",
          top: -10,
          left: -10,
          right: -10,
          bottom: -10,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
          transform: "rotate(20deg)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          px: 3,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography
          variant="h3"
          fontWeight={700}
          sx={{
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            textAlign: "center",
            flex: 1,
          }}
        >
          {news.newsName}
        </Typography>
        <Chip
          label={news.newsStatus}
          sx={{
            fontWeight: 600,
            fontSize: "1rem",
            height: "32px",
            backgroundColor: "rgba(255,255,255,0.2)",
            color: "white",
            backdropFilter: "blur(10px)",
          }}
        />
      </Box>
    </Box>
  );
};

const NewsContent: React.FC<{ news: NewsType; visible: boolean }> = ({
  news,
  visible,
}) => (
  <Grow in={visible} timeout={500}>
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography
          variant="h5"
          gutterBottom
          fontWeight={600}
          color="primary.main"
        >
          {news.newsName}
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {news.tags && news.tags.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Tags:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {news.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: "0.75rem",
                    borderColor: theme.palette.success.main,
                    color: theme.palette.success.main,
                    backgroundColor: `${theme.palette.success.main}10`,
                    "&:hover": {
                      backgroundColor: `${theme.palette.success.main}20`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 3 }}>
          <Chip
            label={news.isRecommended ? "✨ Recommended" : "Not Recommended"}
            variant={news.isRecommended ? "filled" : "outlined"}
            sx={{
              fontWeight: 600,
              fontSize: "0.875rem",
              backgroundColor: news.isRecommended
                ? theme.palette.badge?.activeUserText
                : "transparent",
              color: news.isRecommended
                ? "white"
                : theme.palette.badge?.success,
              borderColor: news.isRecommended
                ? theme.palette.badge?.activeUserText
                : theme.palette.badge?.success,
            }}
          />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography
          variant="h6"
          gutterBottom
          fontWeight={600}
          color="primary.main"
        >
          Description
        </Typography>
        <Box
          sx={{
            borderRadius: 2,
            p: 3,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[900]
                : theme.palette.grey[50],
            border: `1px solid ${theme.palette.divider}`,
            minHeight: 200,
            "& p": { mb: 2 },
            "& h1, & h2, & h3, & h4, & h5, & h6": {
              color: theme.palette.primary.main,
              fontWeight: 600,
              mb: 1,
              mt: 2,
            },
            "& ul, & ol": { pl: 3 },
            "& img": { maxWidth: "100%", height: "auto" },
          }}
          dangerouslySetInnerHTML={{ __html: news.newsDescription }}
        />
      </CardContent>
    </Card>
  </Grow>
);

const NewsSidebar: React.FC<{ news: NewsType; visible: boolean }> = ({
  news,
  visible,
}) => (
  <Slide in={visible} direction="up" timeout={700}>
    <Box>
      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={600}
            color="primary.main"
          >
            Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box display="flex" alignItems="center" mb={2}>
            <CalendarTodayIcon
              sx={{ mr: 1, fontSize: 20, color: "primary.main" }}
            />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {format(new Date(news.createdAt), "PPpp")}
              </Typography>
            </Box>
          </Box>

          {news.updatedAt && news.updatedAt !== news.createdAt && (
            <Box display="flex" alignItems="center" mb={2}>
              <CalendarTodayIcon
                sx={{ mr: 1, fontSize: 20, color: "primary.main" }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {format(new Date(news.updatedAt), "PPpp")}
                </Typography>
              </Box>
            </Box>
          )}

          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1, fontSize: 20, color: "primary.main" }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={news.newsStatus}
                size="small"
                sx={{
                  backgroundColor:
                    news.newsStatus === "ACTIVE"
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={600}
            color="primary.main"
          >
            Author Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box display="flex" alignItems="center" mb={2}>
            <PersonIcon sx={{ mr: 1, fontSize: 20, color: "primary.main" }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Created by
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {news.createdByName}
              </Typography>
            </Box>
          </Box>

          {news.updatedByName && (
            <Box display="flex" alignItems="center">
              <PersonIcon sx={{ mr: 1, fontSize: 20, color: "primary.main" }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last updated by
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {news.updatedByName}
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight={600}
            color="primary.main"
          >
            Quick Stats
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: theme.palette.primary.main + "10",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {news.tags?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tags
              </Typography>
            </Box>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: news.isRecommended
                  ? theme.palette.success.main + "10"
                  : theme.palette.grey[100],
                borderRadius: 1,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                color={news.isRecommended ? "success.main" : "text.secondary"}
              >
                {news.isRecommended ? "✨" : "—"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Featured
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  </Slide>
);

interface ViewNewsModalProps {
  open: boolean;
  onClose: () => void;
  news: NewsType | null;
}

const ViewNewsModal: React.FC<ViewNewsModalProps> = ({
  open,
  onClose,
  news,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
    }
  }, [open]);

  if (!news) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
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
              maxWidth: "1200px",
              maxHeight: "90vh",
              overflow: "auto",
              borderRadius: 3,
              boxShadow: 24,
              position: "relative",
              background: theme.palette.background.default,
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 2,
                backgroundColor: "rgba(255,255,255,0.8)",
                "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
              }}
            >
              <CloseIcon />
            </IconButton>

            <NewsHeader news={news} isMobile={isMobile} />

            <Box sx={{ p: isMobile ? 2 : 4 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <NewsContent news={news} visible={visible} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <NewsSidebar news={news} visible={visible} />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>
      </Box>
    </Fade>
  );
};

export default ViewNewsModal;
