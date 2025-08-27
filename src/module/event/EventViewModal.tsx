// EventViewModal.tsx
import React from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Divider,
  IconButton,
  Button,
  Paper,
  Fade,
  Grow,
  Slide,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LanguageIcon from "@mui/icons-material/Language";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DownloadIcon from "@mui/icons-material/Download";
import { EventType } from "./Events.type";
import dayjs from "dayjs";
import { status } from "./Events.const";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { UseFormattedDate } from "../../common/App.hooks";

export const EventViewModal = ({
  event,
  open,
  onClose,
}: {
  event: EventType;
  open: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [visible, setVisible] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info" | "warning",
  });
  const [calendarAdded, setCalendarAdded] = React.useState(false);
  const brochureRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setCalendarAdded(false);
    }
  }, [open]);

  if (!event) return null;

  const statusColor =
    event.eventStatus === "ACTIVE"
      ? "success"
      : event.eventStatus === "COMPLETED"
        ? "secondary"
        : event.eventStatus === "CANCELLED"
          ? "error"
          : undefined;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleShowSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddToCalendar = () => {
    const startDate = dayjs(event.eventStartDateTime).format("YYYYMMDDTHHmmss");
    const endDate = dayjs(event.eventEndDateTime)
      .add(2, "hour")
      .format("YYYYMMDDTHHmmss");
    const location =
      event.addresses?.length > 0
        ? encodeURIComponent(event.addresses[0].addressLine1)
        : "";

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.eventName)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(event.eventDescription.substring(0, 500))}&location=${location}`;

    window.open(googleCalendarUrl, "_blank");
    setCalendarAdded(true);
    handleShowSnackbar("Added to Google Calendar!", "success");
  };

  const handleDownloadBrochure = () => {
    if (!brochureRef.current) return;

    handleShowSnackbar("Generating brochure...", "info");

    setTimeout(() => {
      if (brochureRef.current) {
        html2canvas(brochureRef.current, {
          scale: 2,
          backgroundColor: theme.palette.background.default,
          useCORS: true,
        })
          .then((canvas) => {
            canvas.toBlob((blob) => {
              if (blob) {
                saveAs(
                  blob,
                  `${event.eventName.replace(/\s+/g, "_")}_brochure.png`,
                );
                handleShowSnackbar("Brochure downloaded!", "success");
              }
            });
          })
          .catch((error) => {
            console.error("Error generating brochure:", error);
            handleShowSnackbar("Failed to generate brochure", "error");
          });
      }
    }, 500);
  };

  const handleGetDirections = () => {
    if (event.addresses?.length > 0) {
      const address = encodeURIComponent(
        `${event.addresses[0].addressLine1},${event.addresses[0].addressLine2}, ${event.addresses[0].city}`,
      );
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${address}`,
        "_blank",
      );
    }
  };

  // Get registration URL
  const registrationUrl = event.urls?.find(
    (url) => url.type === "REGISTRATION_LINK",
  )?.url;
  const websiteUrl = event.urls?.find((u) => u.type === "WEBSITE")?.url;

  // Render hidden brochure
  const renderBrochure = () => (
    <Box
      ref={brochureRef}
      sx={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "600px",
        height: "400px",
        p: 4,
        background: theme.palette.background.paper,
        borderRadius: 3,
        boxShadow: 3,
        border: `2px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Brochure Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${theme.palette.divider}`,
          pb: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} color="#61b15a">
            {event.eventName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Event Brochure
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 1,
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="body2">EVENT ID</Typography>
          <Typography variant="h6" fontWeight={700}>
            {event.eventId.substring(0, 8).toUpperCase()}
          </Typography>
        </Box>
      </Box>

      {/* Event Details */}
      <Box sx={{ display: "flex", mb: 3 }}>
        {event.eventBannerStorageUrl && (
          <Box
            sx={{
              width: "40%",
              mr: 3,
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: 2,
            }}
          >
            <img
              src={event.eventBannerStorageUrl}
              alt={event.eventName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        )}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", mb: 1 }}>
            <EventIcon sx={{ mr: 1, color: "#61b15a" }} />
            <Typography>
              {dayjs(event.eventStartDateTime).format(
                "dddd, MMMM D, YYYY [at] h:mm A",
              )}{" "}
              -{" "}
              {dayjs(event.eventEndDateTime).format(
                "dddd, MMMM D, YYYY [at] h:mm A",
              )}
            </Typography>
          </Box>
          {event.addresses?.[0] && (
            <Box sx={{ display: "flex", mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, color: "#61b15a" }} />
              <Typography>
                {event.addresses[0].addressLine1}, {event.addresses[0].city}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", mb: 1 }}>
            <PersonIcon sx={{ mr: 1, color: "#61b15a" }} />
            <Typography>Hosted by {event.orgName}</Typography>
          </Box>
          <Typography
            variant="body2"
            mt={2}
            dangerouslySetInnerHTML={{
              __html: event.eventDescription.substring(0, 200) + "...",
            }}
          />
        </Box>
      </Box>
    </Box>
  );

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
        {renderBrochure()}

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
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 2,
                backgroundColor: "rgba(255,255,255,0.8)",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,1)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Event image header */}
            {event.eventBannerStorageUrl ? (
              <Box
                sx={{
                  position: "relative",
                  height: isMobile ? "200px" : "300px",
                }}
              >
                <CardMedia
                  component="img"
                  image={event.eventBannerStorageUrl}
                  alt={event.eventName}
                  sx={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                  }}
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
                    <Box>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
                      >
                        {event.eventName}
                      </Typography>
                    </Box>
                    <Chip
                      label={
                        status.find((s) => s.key === event.eventStatus)
                          ?.value || event.eventStatus
                      }
                      color={statusColor}
                      sx={{
                        fontWeight: 600,
                        fontSize: "1rem",
                        height: "32px",
                        backgroundColor:
                          statusColor && theme.palette[statusColor]
                            ? theme.palette[statusColor].main
                            : theme.palette.grey[500],
                        color:
                          statusColor && theme.palette[statusColor]
                            ? theme.palette[statusColor].contrastText
                            : theme.palette.getContrastText(
                                theme.palette.grey[500],
                              ),
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ) : (
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
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  {event.eventName}
                </Typography>
              </Box>
            )}

            {/* Main content */}
            <Box sx={{ p: isMobile ? 2 : 4 }}>
              <Grid container spacing={4}>
                {/* Left Column */}
                <Grid item xs={12} md={8}>
                  {/* Event Details */}
                  <Grow in={visible} timeout={500}>
                    <Card sx={{ mb: 4, boxShadow: 3 }}>
                      <CardContent>
                        <Typography
                          variant="h5"
                          gutterBottom
                          fontWeight={600}
                          color="#61b15a"
                        >
                          {event.eventName}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography
                              gutterBottom
                              fontWeight={500}
                              fontSize={10}
                            >
                              Organized By
                            </Typography>
                          </Box>
                          <Box display="flex" flexDirection="row">
                            {event.orgIconStorageUrl && (
                              <Box
                                component="img"
                                src={event.orgIconStorageUrl}
                                alt={event.orgName}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  objectFit: "contain",
                                  padding: "2px",
                                  ml: 2,
                                  mr: 1,
                                  border: "1px solid #eee",
                                  background: "#fff",
                                }}
                              />
                            )}
                            <Typography variant="h6" sx={{ ml: "5px" }}>
                              - {event.orgName}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            borderRadius: 1,
                            py: 2,
                            textAlign: "justify",
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? theme.palette.grey[900]
                                : theme.palette.grey[50],
                          }}
                        >
                          <div
                            className="event-description h-68 overflow-y-auto"
                            dangerouslySetInnerHTML={{
                              __html: event.eventDescription,
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={4}>
                  <Slide in={visible} direction="up" timeout={700}>
                    <Box>
                      {/* Date & Time */}
                      <Card sx={{ mb: 2, boxShadow: 3 }}>
                        <CardContent>
                          <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                          >
                            <Box
                              display="flex "
                              flexDirection="row"
                              alignItems="flex-start"
                            >
                              <EventIcon
                                sx={{ mr: 1, fontSize: 28, color: "#61b15a" }}
                              />
                              <Typography variant="body1" mb={1}>
                                {UseFormattedDate(event.eventStartDateTime)}
                                {" - "}{" "}
                                {UseFormattedDate(event.eventEndDateTime)}
                              </Typography>
                            </Box>
                            <Box
                              display="flex"
                              flexDirection="row"
                              alignItems="flex-start "
                            >
                              <AccessAlarmOutlined
                                sx={{ mr: 1, fontSize: 28, color: "#61b15a" }}
                              />
                              <Typography variant="body1">
                                {dayjs(event.eventStartDateTime).format(
                                  "h:mm A",
                                )}{" "}
                                -{" "}
                                {dayjs(event.eventEndDateTime).format("h:mm A")}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Location */}
                      {event.addresses?.length > 0 && (
                        <Card sx={{ mb: 2, boxShadow: 3 }}>
                          <CardContent>
                            <Box
                              display="flex"
                              flexDirection="row"
                              alignItems="flex-start"
                              mb={1}
                            >
                              <LocationOnIcon
                                sx={{ mr: 1, fontSize: 28, color: "#61b15a" }}
                              />
                              <Box display="flex" flexDirection="column">
                                <Typography variant="body1" fontWeight={500}>
                                  {event.addresses[0].addressLine1}
                                </Typography>
                                {event.addresses[0].addressLine2 && (
                                  <Typography variant="body1">
                                    {event.addresses[0].addressLine2}
                                  </Typography>
                                )}
                                <Typography variant="body1">
                                  {event.addresses[0].city},{" "}
                                  {event.addresses[0].stateProvince}{" "}
                                  {event.addresses[0].postalCode}
                                </Typography>
                                <Typography variant="body1">
                                  {event.addresses[0].country}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  startIcon={<LocationOnIcon />}
                                  onClick={handleGetDirections}
                                  sx={{
                                    mt: 1,
                                    color: theme.palette.badge.activeUserText,
                                    border: `1px solid ${theme.palette.badge.activeUserText}`,
                                  }}
                                >
                                  Get Directions
                                </Button>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      {/* Contact */}
                      {event.contacts?.length > 0 && (
                        <Card sx={{ mb: 3, boxShadow: 3 }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                              <Typography
                                variant="h6"
                                fontWeight={600}
                                color="#61b15a"
                              >
                                Contact
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {event.contacts.map((contact, index) => (
                              <Box key={index} mb={2}>
                                <Box display="flex" alignItems="center" mb={1}>
                                  <PersonIcon
                                    sx={{
                                      mr: 1,
                                      fontSize: 28,
                                      color: "#61b15a",
                                    }}
                                  />
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={600}
                                  >
                                    {contact.name}
                                  </Typography>
                                </Box>
                                {contact.mobile && (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    mb={1}
                                  >
                                    <PhoneIcon
                                      sx={{ mr: 1, color: "#61b15a" }}
                                    />
                                    <Typography variant="body1">
                                      {contact.mobile}
                                    </Typography>
                                  </Box>
                                )}
                                {contact.email && (
                                  <Box display="flex" alignItems="center">
                                    <EmailIcon
                                      sx={{ mr: 1, color: "#61b15a" }}
                                    />
                                    <Typography variant="body1">
                                      {contact.email}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </CardContent>
                        </Card>
                      )}

                      {/* Share */}
                      <Card sx={{ mb: 3, boxShadow: 3 }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            fontWeight={600}
                            color="#61b15a"
                          >
                            Share This Event
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {websiteUrl && (
                              <IconButton
                                href={websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  color: "#3b5998",
                                  backgroundColor: "rgba(59, 89, 152, 0.1)",
                                  "&:hover": {
                                    backgroundColor: "rgba(59, 89, 152, 0.2)",
                                  },
                                }}
                              >
                                <LanguageIcon />
                              </IconButton>
                            )}
                            <IconButton
                              sx={{
                                color: "#3b5998",
                                backgroundColor: "rgba(59, 89, 152, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(59, 89, 152, 0.2)",
                                },
                              }}
                              onClick={() =>
                                window.open(
                                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                                  "_blank",
                                )
                              }
                            >
                              <FacebookIcon />
                            </IconButton>
                            <IconButton
                              sx={{
                                color: "#1DA1F2",
                                backgroundColor: "rgba(29, 161, 242, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(29, 161, 242, 0.2)",
                                },
                              }}
                              onClick={() =>
                                window.open(
                                  `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
                                  "_blank",
                                )
                              }
                            >
                              <TwitterIcon />
                            </IconButton>
                            <IconButton
                              sx={{
                                color: "#2867B2",
                                backgroundColor: "rgba(40, 103, 178, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(40, 103, 178, 0.2)",
                                },
                              }}
                              onClick={() =>
                                window.open(
                                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                                  "_blank",
                                )
                              }
                            >
                              <LinkedInIcon />
                            </IconButton>
                            <IconButton
                              sx={{
                                color: "#E1306C",
                                backgroundColor: "rgba(225, 48, 108, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(225, 48, 108, 0.2)",
                                },
                              }}
                              onClick={() =>
                                window.open(
                                  `https://www.instagram.com/?url=${encodeURIComponent(window.location.href)}`,
                                  "_blank",
                                )
                              }
                            >
                              <InstagramIcon />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>

                      {/* Action buttons */}
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CalendarTodayIcon />}
                        onClick={handleAddToCalendar}
                        disabled={calendarAdded}
                        sx={{
                          mb: 2,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: "1rem",
                          backgroundColor: calendarAdded
                            ? theme.palette.badge.activeUserText
                            : undefined,
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 3,
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {calendarAdded
                          ? "Added to Calendar"
                          : "Add to Google Calendar"}
                      </Button>

                      {/* Registration Button (only if registration URL exists) */}
                      {registrationUrl && (
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          href={registrationUrl}
                          target="_blank"
                          rel="noopener"
                          sx={{
                            mb: 2,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: "1rem",
                            background: `linear-gradient(45deg, ${theme.palette.badge.activeUserText} 0%, ${theme.palette.badge.activeUserText} 100%)`,
                            boxShadow: 3,
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: 5,
                            },
                            transition: "all 0.3s ease",
                            color: theme.palette.background.paper,
                          }}
                        >
                          Register Now
                        </Button>
                      )}

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadBrochure}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: "1rem",
                          borderWidth: 2,
                          "&:hover": {
                            borderWidth: 2,
                            transform: "translateY(-2px)",
                            boxShadow: 2,
                          },
                          border: "1px solid #61b15a",
                          transition: "all 0.3s ease",
                          color: theme.palette.badge.activeUserText,
                        }}
                      >
                        Download Brochure
                      </Button>
                    </Box>
                  </Slide>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};
