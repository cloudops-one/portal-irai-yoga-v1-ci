import React from "react";
import {
  Box,
  Typography,
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
import { EventType } from "./Events.type";
import dayjs from "dayjs";
import { status } from "./Events.const";
import { AccessAlarmOutlined } from "@mui/icons-material";
import { UseFormattedDate } from "../../common/App.hooks";
import Grid from "@mui/material/Grid2";
import theme from "../../common/App.theme";
import CloseIcon from "@mui/icons-material/Close";

const getStatusBackgroundColor = (eventStatus: string): string => {
  if (eventStatus === "ACTIVE") return theme.palette.badge.success;
  if (eventStatus === "COMPLETED") return theme.palette.badge.info;
  if (eventStatus === "CANCELLED") return theme.palette.badge.error;
  return theme.palette.grey[500];
};

const EventBanner: React.FC<{ event: EventType; isMobile: boolean }> = ({
  event,
  isMobile,
}) => {
  if (event.eventBannerStorageUrl) {
    return (
      <Box sx={{ position: "relative", height: isMobile ? "200px" : "300px" }}>
        <CardMedia
          component="img"
          image={event.eventBannerStorageUrl}
          alt={event.eventName}
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
              {event.eventName}
            </Typography>
            <Chip
              label={
                status.find((s) => s.key === event.eventStatus)?.value ??
                event.eventStatus
              }
              sx={{
                fontWeight: 600,
                fontSize: "1rem",
                height: "32px",
                backgroundColor: getStatusBackgroundColor(event.eventStatus),
                color: "white",
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
  );
};

// Helper component for event details
const EventDetails: React.FC<{ event: EventType; visible: boolean }> = ({
  event,
  visible,
}) => (
  <Grow in={visible} timeout={500}>
    <Card sx={{ mb: 4, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight={600} color="#61b15a">
          {event.eventName}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography gutterBottom fontWeight={500} fontSize={10}>
            Organized By
          </Typography>
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
            dangerouslySetInnerHTML={{ __html: event.eventDescription }}
          />
        </Box>
      </CardContent>
    </Card>
  </Grow>
);

// Helper component for date and time
const DateTimeCard: React.FC<{ event: EventType }> = ({ event }) => (
  <Card sx={{ mb: 2, boxShadow: 3 }}>
    <CardContent>
      <Box display="flex" flexDirection="column" justifyContent="center">
        <Box display="flex" flexDirection="row" alignItems="flex-start">
          <EventIcon sx={{ mr: 1, fontSize: 28, color: "#61b15a" }} />
          <Typography variant="body1" mb={1}>
            {UseFormattedDate(event.eventStartDateTime)} -{" "}
            {UseFormattedDate(event.eventEndDateTime)}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="row" alignItems="flex-start">
          <AccessAlarmOutlined sx={{ mr: 1, fontSize: 28, color: "#61b15a" }} />
          <Typography variant="body1">
            {dayjs(event.eventStartDateTime).format("h:mm A")} -{" "}
            {dayjs(event.eventEndDateTime).format("h:mm A")}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Helper component for location
const LocationCard: React.FC<{
  event: EventType;
  onGetDirections: () => void;
}> = ({ event, onGetDirections }) => {
  if (!event.addresses?.length) return null;

  const address = event.addresses[0];
  return (
    <Card sx={{ mb: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" flexDirection="row" alignItems="flex-start" mb={1}>
          <LocationOnIcon sx={{ mr: 1, fontSize: 28, color: "#61b15a" }} />
          <Box display="flex" flexDirection="column">
            <Typography variant="body1" fontWeight={500}>
              {address.addressLine1}
            </Typography>
            {address.addressLine2 && (
              <Typography variant="body1">{address.addressLine2}</Typography>
            )}
            <Typography variant="body1">
              {address.city}, {address.stateProvince} {address.postalCode}
            </Typography>
            <Typography variant="body1">{address.country}</Typography>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LocationOnIcon />}
              onClick={onGetDirections}
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
  );
};

// Helper component for contacts
const ContactCard: React.FC<{ event: EventType }> = ({ event }) => {
  if (!event.contacts?.length) return null;

  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} color="#61b15a" mb={1}>
          Contact
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {event.contacts.map((contact) => (
          <Box key={contact.id} mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <PersonIcon sx={{ mr: 1, fontSize: 28, color: "#61b15a" }} />
              <Typography variant="subtitle1" fontWeight={600}>
                {contact.name}
              </Typography>
            </Box>
            {contact.mobile && (
              <Box display="flex" alignItems="center" mb={1}>
                <PhoneIcon sx={{ mr: 1, color: "#61b15a" }} />
                <Typography variant="body1">{contact.mobile}</Typography>
              </Box>
            )}
            {contact.email && (
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1, color: "#61b15a" }} />
                <Typography variant="body1">{contact.email}</Typography>
              </Box>
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// Helper component for social share
const ShareCard: React.FC<{ websiteUrl?: string }> = ({ websiteUrl }) => (
  <Card sx={{ mb: 3, boxShadow: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom fontWeight={600} color="#61b15a">
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
              "&:hover": { backgroundColor: "rgba(59, 89, 152, 0.2)" },
            }}
          >
            <LanguageIcon />
          </IconButton>
        )}
        <IconButton
          sx={{
            color: "#3b5998",
            backgroundColor: "rgba(59, 89, 152, 0.1)",
            "&:hover": { backgroundColor: "rgba(59, 89, 152, 0.2)" },
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
            "&:hover": { backgroundColor: "rgba(29, 161, 242, 0.2)" },
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
            "&:hover": { backgroundColor: "rgba(40, 103, 178, 0.2)" },
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
            "&:hover": { backgroundColor: "rgba(225, 48, 108, 0.2)" },
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
);

// Helper component for action buttons
const ActionButtons: React.FC<{
  calendarAdded: boolean;
  registrationUrl?: string;
  onAddToCalendar: () => void;
}> = ({ calendarAdded, registrationUrl, onAddToCalendar }) => (
  <>
    <Button
      fullWidth
      variant="contained"
      startIcon={<CalendarTodayIcon />}
      onClick={onAddToCalendar}
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
        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
        transition: "all 0.3s ease",
      }}
    >
      {calendarAdded ? "Added to Calendar" : "Add to Google Calendar"}
    </Button>

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
          "&:hover": { transform: "translateY(-2px)", boxShadow: 5 },
          transition: "all 0.3s ease",
          color: theme.palette.background.paper,
        }}
      >
        Register Now
      </Button>
    )}
  </>
);

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

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setCalendarAdded(false);
    }
  }, [open]);

  if (!event) return null;

  const registrationUrl = event.urls?.find(
    (url) => url.type === "REGISTRATION_LINK",
  )?.url;
  const websiteUrl = event.urls?.find((u) => u.type === "WEBSITE")?.url;

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

            <EventBanner event={event} isMobile={isMobile} />

            <Box sx={{ p: isMobile ? 2 : 4 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <EventDetails event={event} visible={visible} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Slide in={visible} direction="up" timeout={700}>
                    <Box>
                      <DateTimeCard event={event} />
                      <LocationCard
                        event={event}
                        onGetDirections={handleGetDirections}
                      />
                      <ContactCard event={event} />
                      <ShareCard websiteUrl={websiteUrl} />
                      <ActionButtons
                        calendarAdded={calendarAdded}
                        registrationUrl={registrationUrl}
                        onAddToCalendar={handleAddToCalendar}
                      />
                    </Box>
                  </Slide>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Slide>

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
