import { createTheme } from "@mui/material/styles";

// Extend the MUI theme with custom palette properties
declare module "@mui/material/styles" {
  interface Palette {
    sideNavigation: {
      iconActive: string;
      iconInactive: string;
      sideBarBg: string;
      text: string;
      scrollBarThumbBg: string;
      scrollbarThumbHoverBg?: string;
      selectedNavigationItemBg: string;
      navigationHoverBg: string;
      headerBarBg: string;
      headerMenuIcon: string;
      headerSearchFieldBg: string;
      headerAnnouncementIconClr?: string;
      mainLayoutContentBg: string;
      borderTopLineClr: string;
    };
    badge: {
      success: string;
      error: string;
      warning: string;
      info: string;
      activeUserBg?: string;
      newUserBg?: string;
      activeUserText?: string;
      newUserText?: string;
    };
    settingsButton?: {
      borderColor?: string;
      textColor?: string;
    };
    practiceCategories?: {
      bgColor?: string;
      textColor?: string;
      cardImageBg?: string;
      unSelectedBg?: string;
      unselectedTextColor?: string;
      hoverBg?: string;
      categoryTextColor?: string;
      tagBg?: string;
    };
    loader: {
      default: string;
    };
  }

  interface PaletteOptions {
    sideNavigation?: {
      iconActive?: string;
      iconInactive?: string;
      sideBarBg?: string;
      text?: string;
      scrollbarThumbBg?: string;
      scrollbarThumbHoverBg?: string;
      selectedNavigationItemBg?: string;
      navigationHoverBg?: string;
      headerBarBg?: string;
      headerMenuIcon?: string;
      headerSearchFieldBg?: string;
      headerAnnouncementIconClr?: string;
      mainLayoutContentBg?: string;
      borderTopLineClr?: string;
    };
    badge?: {
      success?: string;
      error?: string;
      warning?: string;
      info?: string;
      activeUserBg?: string;
      newUserBg?: string;
      activeUserText?: string;
      newUserText?: string;
    };
    settingsButton?: {
      borderColor?: string;
      textColor?: string;
    };
    practiceCategories?: {
      bgColor?: string;
      textColor?: string;
      cardImageBg?: string;
      unSelectedBg?: string;
      unselectedTextColor?: string;
      hoverBg?: string;
      categoryTextColor?: string;
      tagBg?: string;
    };
    loader?: {
      default?: string;
    };
  }
}

// MUI Theme Configuration
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 1026,
      lg: 1027,
      xl: 1536,
    },
  },
  palette: {
    background: {
      default: "#f4f4f4",
      paper: "#ffffff",
    },
    text: {
      primary: "#333",
      secondary: "#666",
    },
    sideNavigation: {
      iconActive: "#ffffff",
      iconInactive: "#a9b3a9",
      sideBarBg: "#1e1e1e",
      text: "#ffffff",
      scrollbarThumbBg: "#333333",
      scrollbarThumbHoverBg: "#555555",
      selectedNavigationItemBg: "#053d01",
      navigationHoverBg: "#053d0180",
      headerBarBg: "#ffffff",
      headerMenuIcon: "#000000",
      headerSearchFieldBg: "#f8f9fb",
      headerAnnouncementIconClr: "#000000",
      mainLayoutContentBg: "#f4f8ec",
      borderTopLineClr: "#333",
    },
    badge: {
      success: "#4caf50",
      error: "#f44336",
      warning: "#ff9800",
      info: "#2196f3",
      activeUserBg: "#dcfdd4",
      newUserBg: "#d2e7fc",
      activeUserText: "#61b15a",
      newUserText: "#1e87f0",
    },
    settingsButton: {
      borderColor: "#ccc",
      textColor: "#676767",
    },
    practiceCategories: {
      bgColor: "#96a183",
      textColor: "#fff",
      unselectedTextColor: "#22c55e",
      unSelectedBg: "#d7e7bc",
      cardImageBg: "#f4f8ec",
      hoverBg: "#adce74",
      categoryTextColor: "#6b7280",
      tagBg: "#4a8f46",
    },
    loader: {
      default: "#15803d",
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif",
    h1: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.2rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.9rem",
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          "& .MuiButtonBase-root.Mui-focusVisible": {
            outline: "none !important",
            boxShadow: "none !important",
          },
          "& .MuiButtonBase-root.Mui-expanded": {
            outline: "none !important",
            boxShadow: "none !important",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus": {
            outline: "none",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        text: {
          textTransform: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          color: "#545454",
          padding: "8px 16px",
          transition: "0.3s",
          "&:hover": {
            backgroundColor: "rgba(76, 175, 80, 0.1)",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "none",
          },
          "&:active": {
            backgroundColor: "rgba(76, 175, 80, 0.2)",
          },
        },
        contained: {
          backgroundColor: "#61b15a",
          color: "#ffffff",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "#4a8f46",
          },
          "&:focus": {
            outline: "none",
            boxShadow: "0 0 5px rgba(97, 177, 90, 0.5)",
          },
          "&:active": {
            backgroundColor: "#3a7c36",
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        size: "medium",
      },
      styleOverrides: {
        root: {
          borderRadius: "5px",
          "& .MuiInputBase-root": {
            borderRadius: "4px",
          },
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "#61b15a",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#61b15a",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #ccc", // Border on hover
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #1976d2", // Border on focus
            },
          },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: "0.75rem",
          fontWeight: 600,
          padding: "4px 6px",
          borderRadius: "4px",
          minWidth: "20px",
          height: "20px",
          lineHeight: "1",
          color: "#ffffff",
        },
        colorError: {
          backgroundColor: "#f44336",
        },
        colorSuccess: {
          backgroundColor: "#4caf50",
        },
        colorWarning: {
          backgroundColor: "#ff9800",
        },
        colorInfo: {
          backgroundColor: "#2196f3",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          // backgroundColor: "#c2c2c2",
          variants: [
            {
              // props: { variant: 'outlined' },
              style: {
                color: "white",
                //   // borderWidth: '3px',
              },
            },
          ],
        },
      },
    },
  },
});

export default theme;
