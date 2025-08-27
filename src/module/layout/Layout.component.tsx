import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import SnackBar from "../../component/SnackBar";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../../common/App.store";
import { ROUTE_PATHS, MODULES } from "../../common/App.const";
import LayoutModal from "../../component/LayoutModal";
import { Menus, MenuItem } from "./Layout.const";
import LayoutHeader from "../../component/LayoutHeader";
import { useUserSignout } from "../auth/Auth.service";
import { AxiosError } from "axios";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../../common/App.const";

const drawerWidth = 240;
const miniWidth = 90;

interface Props {
  window?: () => Window;
  children: React.ReactNode;
}

const getInitialSubNavState = (
  menus: MenuItem[],
): { [key: string]: boolean } => {
  const initialState: { [key: string]: boolean } = {};

  menus.forEach((menu) => {
    if (menu.submenu) {
      initialState[menu.title] = true;
    }
  });

  return initialState;
};

const ResponsiveDrawer: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearTokens } = useStore();
  const role = useStore((state) => state?.data?.role) as string;

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>(
    SNACKBAR_SEVERITY.INFO,
  );
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { window, children } = props;
  const [mobileOpen, setMobileOpen] = useState(false);

  const { userSignout } = useUserSignout();
  //modal state
  const [open, setOpen] = React.useState(false);
  const [signoutLoading, setSignoutLoading] = useState(false);

  //modal actions
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // State for managing sub-navigation expansion
  const [openSubNav, setOpenSubNav] = useState<{ [key: string]: boolean }>(
    getInitialSubNavState(Menus),
  );

  const [isMinimized, setIsMinimized] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Toggle Drawer
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // Toggle Sub-Navigation
  const handleSubNavToggle = (key: string) => {
    setOpenSubNav((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter menus based on role
  const filteredMenus = Menus.filter((menu) => {
    // If role is PORTAL_USER, hide SETTING menu
    if (role === "PORTAL_USER" && menu.title === MODULES.SETTING) {
      return false;
    }
    // KEYCLOAK_USER sees all menus
    return true;
  });

  const handleSignOut = () => {
    handleOpen();
  };

  const handleSignOutConfirmation = () => {
    const userId = localStorage.getItem("userId");
    setSignoutLoading(true);

    try {
      const payload = { userId };
      userSignout(payload, {
        onSuccess: (responseData: { message?: string }) => {
          setSignoutLoading(false);

          handleClose();
          clearTokens();
          localStorage.removeItem("userId");
          localStorage.removeItem("role");
          navigate(ROUTE_PATHS?.ROOT_ROUTE);
          setSnackbarMessage(
            responseData?.message ?? "Signed out successfully!",
          );
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
        },
        onError: (error: AxiosError) => {
          setSignoutLoading(false);

          const errorMessage =
            (error.response?.data as { message?: string })?.message ??
            error.message;
          setSnackbarMessage(errorMessage);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
      });
    } catch (err: unknown) {
      setSignoutLoading(false);
      if (err instanceof Error) {
        setSnackbarMessage(err.message);
      } else {
        setSnackbarMessage("An unknown error occurred");
      }
      setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
      setOpenSnackbar(true);
    }
  };

  const handleMinimizeSidebar = () => {
    setIsMinimized((prevState) => !prevState);
  };

  // Drawer items with sub-navigation
  const drawer = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: theme?.palette?.sideNavigation?.sideBarBg,
        color: theme?.palette?.sideNavigation?.text,
      }}
    >
      {/* Scrollable Navigation Section */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme?.palette?.sideNavigation?.sideBarBg,
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#61B15A",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme?.palette?.sideNavigation?.scrollbarThumbHoverBg,
          },
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div className="flex flex-row justify-between items-center w-full">
            {!isMinimized && (
              <div className="flex items-center pt-[10px]">
                <img
                  src="https://cloudops-one.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/assets/irai-yoga-white-logo.png"
                  alt="Logo"
                  className="w-10"
                />

                <Typography
                  sx={{
                    marginLeft: "10px",
                    marginTop: "10px",
                    fontSize: "20px",
                  }}
                >
                  Portal
                </Typography>
              </div>
            )}
            {!isMobile && (
              <div className="w-full flex justify-end items-center">
                <IconButton
                  sx={{
                    backgroundColor: theme?.palette?.sideNavigation?.iconActive,
                    marginTop: 1,
                    padding: 1,
                    "&:hover": {
                      backgroundColor:
                        theme?.palette?.sideNavigation?.iconActive,
                    },
                    "&.Mui-selected": {
                      backgroundColor:
                        theme?.palette?.sideNavigation?.iconActive,
                    },
                  }}
                  onClick={handleMinimizeSidebar}
                  size="small"
                >
                  <MenuIcon />
                </IconButton>
              </div>
            )}
          </div>
        </Toolbar>
        <Divider />
        <List>
          {filteredMenus.map((menu) => (
            <div key={menu.title}>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    backgroundColor:
                      location?.pathname === menu.to
                        ? theme?.palette?.sideNavigation
                            ?.selectedNavigationItemBg
                        : "transparent",
                    color:
                      location?.pathname === menu.to
                        ? theme?.palette?.sideNavigation?.iconActive
                        : theme?.palette?.sideNavigation?.iconInactive,
                    "&:hover": {
                      backgroundColor:
                        theme?.palette?.sideNavigation?.navigationHoverBg,
                      color: theme?.palette?.sideNavigation?.iconActive,
                    },
                  }}
                  onClick={() => {
                    if (menu.submenu) {
                      handleSubNavToggle(menu.title);
                    } else if (menu.to) {
                      navigate(menu.to);
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: theme?.palette?.sideNavigation?.iconActive,
                      minWidth: "40px",
                    }}
                  >
                    {menu.icon}
                  </ListItemIcon>

                  {(!isMinimized || isMobile) && (
                    <ListItemText primary={menu.title} />
                  )}

                  {menu.submenu &&
                    (openSubNav[menu.title] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {menu.submenu && (
                <Collapse
                  in={openSubNav[menu.title]}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {menu.submenuItems?.map((submenu) => (
                      <ListItemButton
                        key={submenu.title}
                        onClick={() => navigate(submenu.to)}
                        sx={{
                          backgroundColor:
                            location?.pathname === submenu.to
                              ? theme?.palette?.sideNavigation
                                  ?.selectedNavigationItemBg
                              : "transparent",
                          color: theme?.palette?.sideNavigation?.iconActive,
                          "&:hover": {
                            backgroundColor:
                              theme?.palette?.sideNavigation?.navigationHoverBg,
                            color: theme?.palette?.sideNavigation?.iconActive,
                          },
                        }}
                      >
                        {/* Icon Before Text */}
                        <ListItemIcon
                          sx={{
                            color: theme?.palette?.sideNavigation?.iconActive,
                            minWidth: "40px",
                          }}
                        >
                          {submenu?.icon}
                        </ListItemIcon>

                        {(!isMinimized || isMobile) && (
                          <ListItemText primary={submenu.title} />
                        )}
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </Box>
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: theme?.palette?.sideNavigation?.sideBarBg,
          zIndex: 10,
          borderTop: `1px solid ${theme?.palette?.sideNavigation?.borderTopLineClr}`,
        }}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleSignOut}>
              <ListItemIcon
                sx={{
                  color: theme?.palette?.sideNavigation?.iconActive,
                  minWidth: "40px",
                }}
              >
                <PowerSettingsNewIcon />
              </ListItemIcon>
              {(!isMinimized || isMobile) && (
                <ListItemText primary="Sign Out" />
              )}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const sidebarWidth = isMinimized ? miniWidth : drawerWidth;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Top AppBar */}
      <LayoutHeader
        isMobile={isMobile}
        sidebarWidth={sidebarWidth}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Drawer Navigation */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarWidth },
          flexShrink: { md: 0 },
        }}
        aria-label="mailbox folders"
      >
        {/* Mobile/iPad Drawer */}
        <Drawer
          container={container}
          variant={isMobile ? "temporary" : "permanent"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: theme?.palette?.sideNavigation?.sideBarBg,
              color: theme?.palette?.sideNavigation?.text,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: isMobile ? "none" : "block",
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: sidebarWidth,
              backgroundColor: theme?.palette?.sideNavigation?.sideBarBg,
              color: theme?.palette?.sideNavigation?.text,
            },
          }}
          open={!isMobile}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          overflowX: "hidden",
          width: (() => {
            return isMobile ? "100vw" : `calc(100vw - ${sidebarWidth}px)`;
          })(),
          backgroundColor: theme?.palette?.sideNavigation?.mainLayoutContentBg,
          flexGrow: 1,
        }}
      >
        <Toolbar />
        {children}
      </Box>
      <LayoutModal
        open={open}
        handleClose={handleClose}
        handleSignOutConfirmation={handleSignOutConfirmation}
        loading={signoutLoading}
      />
      <SnackBar
        openSnackbar={openSnackbar}
        closeSnackbar={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
        duration={3000}
      />
    </Box>
  );
};

export default ResponsiveDrawer;
