import React, { useEffect, useState } from "react";
import {
  AppBar,
  IconButton,
  Toolbar,
  useTheme,
  Badge,
  Menu,
  Box,
  Typography,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { Link } from "react-router-dom";
import { useGetProfilePicture } from "../common/App.service";
import { useNotifications } from "../common/NotificationContext";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CircleIcon from "@mui/icons-material/Circle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MarkAsReadIcon from "@mui/icons-material/DoneAll";

interface LayoutHeaderProps {
  isMobile: boolean;
  sidebarWidth: number;
  handleDrawerToggle: () => void;
}

const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  isMobile,
  sidebarWidth,
  handleDrawerToggle,
}) => {
  const theme = useTheme();
  const { imageUrl } = useGetProfilePicture();
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { unreadCount, notifications, markAsRead, markAllAsRead } =
    useNotifications();

  interface ProfilePictureResponse {
    data: {
      userIconStorageUrl: string;
    };
  }

  useEffect(() => {
    imageUrl(
      {},
      {
        onSuccess: (response: ProfilePictureResponse) => {
          setProfilePicUrl(response.data.userIconStorageUrl);
        },
      },
    );
  }, []);

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
        ml: isMobile ? 0 : `${sidebarWidth}px`,
        backgroundColor: theme?.palette?.sideNavigation?.headerBarBg,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon
              sx={{ color: theme?.palette?.sideNavigation?.headerMenuIcon }}
            />
          </IconButton>
        )}
        <div className="w-full flex flex-row justify-end items-center">
          <div className="flex gap-5 items-center pr-5">
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                color:
                  theme?.palette?.sideNavigation?.headerAnnouncementIconClr,
                position: "relative",
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <CampaignOutlinedIcon sx={{ width: 34, height: 34 }} />
              </Badge>
            </IconButton>

            {/* Notification Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              slots={{
                paper: Paper,
              }}
              slotProps={{
                paper: {
                  sx: {
                    width: 400,
                    maxHeight: 500,
                    mt: 1.5,
                    ml: 1.5,
                  },
                },
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Notifications</Typography>
                  {unreadCount > 0 && (
                    <Button
                      size="small"
                      startIcon={<MarkAsReadIcon />}
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </Button>
                  )}
                </Box>
                <Divider />

                {notifications.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      py: 4,
                    }}
                  >
                    <NotificationsNoneIcon
                      sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ maxHeight: 350, overflow: "auto" }}>
                    {notifications.map((notification) => (
                      <ListItem
                        key={notification.id}
                        alignItems="flex-start"
                        sx={{
                          backgroundColor: notification.read
                            ? "transparent"
                            : "action.hover",
                          borderRadius: 1,
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "action.selected",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                          {!notification.read && (
                            <CircleIcon color="primary" sx={{ fontSize: 10 }} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" component="div">
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              {notification.image && (
                                <img
                                  src={notification.image}
                                  alt="Notification"
                                  style={{
                                    width: "100%",
                                    maxHeight: 120,
                                    objectFit: "cover",
                                    borderRadius: 4,
                                    marginBottom: 8,
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                color="text.primary"
                                component="span"
                              >
                                {notification.body}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 0.5,
                                }}
                              >
                                <AccessTimeIcon
                                  sx={{ fontSize: 14, mr: 0.5 }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatTime(notification.timestamp)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        {!notification.read && (
                          <Button
                            size="small"
                            onClick={() => handleMarkAsRead(notification.id)}
                            sx={{ ml: 1, minWidth: "auto" }}
                          >
                            Mark as read
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Menu>

            <Link to="/profile">
              <Avatar
                src={profilePicUrl || undefined}
                alt="User Avatar"
                sx={{ width: 34, height: 34 }}
              >
                {!profilePicUrl && "U"}
              </Avatar>
            </Link>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default LayoutHeader;
