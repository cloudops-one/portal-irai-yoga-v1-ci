import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Grid,
  IconButton,
  Select,
  MenuItem,
  Chip,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import NewsModal from "./NewsModal";
import {
  useGetNews,
  useDeleteNews,
  useGetNewsById,
  useUpdateNewsStatus,
} from "./news.service";
import { NewsType } from "./news.type";
import ConfirmDelete from "../../component/ConfirmDelete.dialog";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";
import SnackBar from "../../component/SnackBar";
import FullHeightDataGridContainer from "../../component/DataGridContainerHeight";
import theme from "../../common/App.theme";
import { formatDistanceToNow } from "date-fns";
import { useNewsStatus } from "../../common/App.hooks";
interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

const NewsComponent = () => {
  const [newsItems, setNewsItems] = useState<NewsType[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    pageSize: 9, // 3x3 grid
    total: 0,
  });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    newsId: string | null;
  }>({ open: false, newsId: null });

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

  const showError = (message: string) => {
    showSnackbar(message, SNACKBAR_SEVERITY.ERROR);
  };

  const handleDeleteNews = (newsId: string) => {
    setDeleteConfirmation({ open: true, newsId });
  };
  const { settings: newsStatus } = useNewsStatus();

  const { refetch: fetchNews, isGetAllNewsPending } = useGetNews(
    setNewsItems,
    pagination,
    (newPagination) => setPagination((prev) => ({ ...prev, ...newPagination })),
    (total) => setPagination((prev) => ({ ...prev, total: total as number })),
    "",
  );

  const { deleteNews } = useDeleteNews();
  const { getNewsById } = useGetNewsById();
  const { updateNewsStatus } = useUpdateNewsStatus();

  const confirmDelete = () => {
    if (deleteConfirmation.newsId) {
      deleteNews(
        { newsId: deleteConfirmation.newsId },
        {
          onSuccess: (response: { message?: string }) => {
            fetchNews();
            showSuccess(response.message || "News deleted successfully");
            setDeleteConfirmation({ open: false, newsId: null });
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { errorMessage?: string })
                ?.errorMessage ||
              error.message ||
              "Failed to delete news";
            showError(errorMessage);
            setDeleteConfirmation({ open: false, newsId: null });
          },
        },
      );
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ open: false, newsId: null });
  };

  const handleOpenModal = (news?: NewsType) => {
    if (news) {
      getNewsById(
        { newsId: news.newsId },
        {
          onSuccess: (response) => {
            setSelectedNews(response.data);
            setIsModalOpen(true);
          },
        },
      );
    } else {
      setSelectedNews(null);
      setIsModalOpen(true);
    }
  };

  const handleStatusChange = (newStatus: string, newsId: string) => {
    updateNewsStatus(
      { newsId, status: newStatus },
      {
        onSuccess: (response: { message?: string }) => {
          showSuccess(response.message || "Status updated successfully");
          fetchNews();
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { errorMessage?: string })?.errorMessage ||
            error.message ||
            "Failed to add Poem";
          showError(errorMessage);
        },
      },
    );
  };

  const handleSaveNews = () => {
    fetchNews();
  };

  useEffect(() => {
    fetchNews();
  }, [pagination.page, pagination.pageSize]);

  return (
    <FullHeightDataGridContainer>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          backgroundColor: theme.palette.background.default,
          p: 2,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">News</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenModal()}
            sx={{
              backgroundColor: theme.palette.badge?.success,
              "&:hover": {
                backgroundColor: theme.palette.badge?.success,
              },
            }}
          >
            Add News
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
          {isGetAllNewsPending ? (
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
          ) : newsItems.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                textAlign: "center",
                p: 4,
              }}
            >
              <Typography variant="h6" gutterBottom>
                No news found
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Create your first news article to get started
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => handleOpenModal()}
              >
                Create News
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {newsItems.map((news) => (
                <Grid item xs={12} sm={6} md={4} lg={3.5} key={news.newsId}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: 3,
                      },
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    {/* Image with status badge */}
                    <Box sx={{ position: "relative" }}>
                      {news.newsBannerStorageUrl ||
                      news.newsBannerExternalUrl ? (
                        <CardMedia
                          component="img"
                          sx={{
                            height: 160,
                            width: "100%",
                            objectFit: "cover",
                          }}
                          image={
                            news.newsBannerStorageUrl ||
                            news.newsBannerExternalUrl ||
                            ""
                          }
                          alt={news.newsName}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 160,
                            width: "100%",
                            bgcolor: "grey.200",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            No Banner
                          </Typography>
                        </Box>
                      )}
                      <Chip
                        label={news?.newsStatus}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          backgroundColor:
                            news.newsStatus === "ACTIVE"
                              ? theme.palette?.badge?.success
                              : theme.palette?.badge?.error,
                          color: "white",
                          fontWeight: "bold",
                          boxShadow: 1,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          lineHeight: 1.3,
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          minHeight: "3em", // Ensure consistent height for 2 lines
                        }}
                      >
                        {news?.newsName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 1, textAlign: "right" }}
                      >
                        Created{" "}
                        {formatDistanceToNow(new Date(news?.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>

                      {news?.tags && news.tags.length > 0 && (
                        <Box
                          sx={{
                            mt: 1.5,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                          }}
                        >
                          {news.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "0.7rem",
                                color: "background.paper",
                                borderColor: "background.paper",
                                backgroundColor: "success.main",
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>

                    <CardActions
                      sx={{
                        justifyContent: "space-between",
                        padding: "8px 16px",
                        borderTop: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box>
                        <IconButton
                          onClick={() => handleOpenModal(news)}
                          size="small"
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              backgroundColor: "primary.main",
                              color: "primary.contrastText",
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteNews(news.newsId)}
                          size="small"
                          sx={{
                            color: "text.secondary",
                            "&:hover": {
                              backgroundColor: "error.main",
                              color: "error.contrastText",
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={news.newsStatus}
                          onChange={(e) =>
                            handleStatusChange(e.target.value, news.newsId)
                          }
                          sx={{
                            height: 36,
                            "& .MuiSelect-select": {
                              py: 0.5,
                              fontSize: "0.875rem",
                            },
                          }}
                        >
                          {newsStatus.map((status) => (
                            <MenuItem key={status.key} value={status.key}>
                              {status.value}
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

        {/* Pagination - Bottom Right */}
        {newsItems.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mt: 2,
              pr: 2,
            }}
          >
            <Button
              disabled={pagination.page === 0}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              sx={{ mr: 1 }}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ mx: 1 }}>
              Page {pagination.page + 1} of{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </Typography>
            <Button
              disabled={
                (pagination.page + 1) * pagination.pageSize >= pagination.total
              }
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              sx={{ ml: 1 }}
            >
              Next
            </Button>
          </Box>
        )}

        {/* Modals */}
        <NewsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveNews}
          news={selectedNews || undefined}
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

export default NewsComponent;
