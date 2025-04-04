import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import { type PaletteMode } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

// Create context for theme management
type ThemeContextType = {
  toggleColorMode: () => void;
  mode: PaletteMode;
};

const ThemeContext = createContext<ThemeContextType>({
  toggleColorMode: () => { },
  mode: "light",
});

// Custom hook to use the theme context
export const useAppTheme = () => useContext(ThemeContext);

const marioColors = {
  red: "#E60012", // Mario red - stays vibrant
  blue: "#009FE3", // Sky blue - maintains harmony
  green: "#1ABC3F", // Pipe green - balanced
  yellow: "#FFC300", // Star/coin yellow - warm and inviting

  // Secondary palette
  brown: "#8E562E", // Question block brown
  lightBlue: "#00D2FF", // Ice world blue
  orange: "#FF8C00", // Fire flower orange
  purple: "#9754CE", // Poison mushroom purple

  // Neutrals
  black: "#000000", // Outline
  white: "#FFFFFF", // Background
  cream: "#FFF5E6", // Paper/menu background
  darkGrey: "#222222", // Dark mode background

  // Simplified dark mode colors
  darkBlue: "#141A2B", // Dark mode background – a deeper navy for an immersive feel
  darkPaper: "#1F2430", // Dark mode paper surface – slightly lighter to distinguish cards/elements
  darkAccent: "#009FE3", // Mario-inspired accent blue – subdued for better legibility in dark mode
  darkSecondary: "#A42D6D", // Subtle accent – a muted version of Mario red/pink for contrast
};

interface ThemeContextProviderProps {
  children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = (
  { children },
) => {
  const [mode, setMode] = useState<PaletteMode>("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      const prefersDarkMode =
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDarkMode ? "dark" : "light");
    }
  }, []);

  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };

  const theme = useMemo(() =>
    createTheme({
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 1250,
          lg: 1200,
          xl: 1536,
        },
      },
      palette: {
        mode,
        ...(mode === "light"
          ? {
            primary: {
              main: marioColors.red,
              light: "#FF4D60",
              dark: "#BF0010",
              contrastText: marioColors.white,
            },
            secondary: {
              main: marioColors.blue,
              light: "#5BD3FF",
              dark: "#0070A0",
              contrastText: marioColors.white,
            },
            info: {
              main: marioColors.blue,
              light: "#5BD3FF",
              dark: "#0070A0",
              contrastText: marioColors.white,
            },
            warning: {
              main: marioColors.orange,
              light: "#FFB04D",
              dark: "#CC7000",
              contrastText: marioColors.black,
            },
            error: {
              main: marioColors.red,
              light: "#FF4D60",
              dark: "#BF0010",
              contrastText: marioColors.white,
            },
            success: {
              main: marioColors.green,
              light: "#4DE974",
              dark: "#108A30",
              contrastText: marioColors.white,
            },
            background: {
              default: marioColors.cream,
              paper: marioColors.white,
            },
            text: {
              primary: "#222222",
              secondary: "#666666",
            },
            divider: "rgba(0, 0, 0, 0.09)",
          }
          : {
            // Simplified Dark mode Mario palette - more subtle with Mario accents
            primary: {
              main: marioColors.darkAccent,
              light: "#2B95E9",
              dark: "#005DA6",
              contrastText: marioColors.white,
            },
            secondary: {
              main: marioColors.darkSecondary,
              light: "#D55C9E",
              dark: "#9C1C62",
              contrastText: marioColors.white,
            },
            info: {
              main: marioColors.blue,
              light: "#5BD3FF",
              dark: "#0070A0",
              contrastText: marioColors.white,
            },
            warning: {
              main: marioColors.yellow,
              light: "#FFD54D",
              dark: "#CC9C00",
              contrastText: marioColors.black,
            },
            error: {
              main: marioColors.red,
              light: "#FF4D60",
              dark: "#BF0010",
              contrastText: marioColors.white,
            },
            success: {
              main: marioColors.green,
              light: "#4DE974",
              dark: "#108A30",
              contrastText: marioColors.white,
            },
            background: {
              default: marioColors.darkBlue,
              paper: marioColors.darkPaper,
            },
            text: {
              primary: "#F5F5F5",
              secondary: "#BBBBBB",
            },
            divider: "rgba(255, 255, 255, 0.12)",
          }),
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h5: {
          fontWeight: 700,
        },
        h6: {
          fontWeight: 600,
        },
        subtitle1: {
          fontWeight: 500,
        },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              borderRadius: 25, // Rounded buttons like Mario coins
              fontWeight: 700,
              fontSize: "0.95rem",
              padding: "8px 16px",
              boxShadow: `0 4px 0 ${mode === "light" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.7)"
                }`,
              border: `2px solid ${marioColors.black}`,
              transition: "all 0.1s ease-in-out",
              "&:hover": {
                transform: "translateY(2px)",
                boxShadow: `0 2px 0 ${mode === "light" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.7)"
                  }`,
                filter: "brightness(1.05)",
              },
              "&:active": {
                transform: "translateY(4px)",
                boxShadow: "none",
                filter: "brightness(0.95)",
              },
            },
            // Color variants with coordinated styles
            containedPrimary: {
              backgroundColor: mode === "light"
                ? marioColors.red
                : marioColors.darkAccent,
              color: marioColors.white,
              "&:hover": {
                backgroundColor: mode === "light"
                  ? marioColors.red
                  : marioColors.darkAccent,
              },
            },
            containedSecondary: {
              backgroundColor: mode === "light"
                ? marioColors.blue
                : marioColors.darkSecondary,
              color: marioColors.white,
              "&:hover": {
                backgroundColor: mode === "light"
                  ? marioColors.blue
                  : marioColors.darkSecondary,
              },
            },
            outlinedPrimary: {
              borderColor: mode === "light"
                ? marioColors.red
                : marioColors.darkAccent,
              color: mode === "light"
                ? marioColors.red
                : marioColors.darkAccent,
              backgroundColor: mode === "light"
                ? `${marioColors.red}10`
                : "rgba(0, 120, 212, 0.1)",
            },
            outlinedSecondary: {
              borderColor: mode === "light"
                ? marioColors.blue
                : marioColors.darkSecondary,
              color: mode === "light"
                ? marioColors.blue
                : marioColors.darkSecondary,
              backgroundColor: mode === "light"
                ? `${marioColors.blue}10`
                : "rgba(184, 50, 128, 0.1)",
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              border: `3px solid ${marioColors.black}`,
              boxShadow: mode === "light"
                ? `0 8px 0 rgba(0,0,0,0.5)`
                : `0 8px 0 rgba(0,0,0,0.7)`,
              overflow: "hidden",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: mode === "light"
                  ? `0 12px 0 rgba(0,0,0,0.5)`
                  : `0 12px 0 rgba(0,0,0,0.7)`,
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            rounded: {
              borderRadius: 16,
            },
            root: {
              backgroundImage: mode === "light"
                ? "repeating-linear-gradient(45deg)"
                : "none",
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: `0 6px 0 ${mode === "light" ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.7)"
                }`,
              borderBottom: `3px solid ${marioColors.black}`,
              backgroundColor: mode === "light"
                ? marioColors.white
                : marioColors.darkBlue,
              backgroundImage: mode === "light"
                ? `linear-gradient(90deg, ${marioColors.white} 50%, ${marioColors.cream} 100%)`
                : "none",
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: mode === "light"
                ? marioColors.cream
                : marioColors.darkBlue,
              borderRight: `3px solid ${marioColors.black}`,
              backgroundImage: mode === "light"
                ? "repeating-linear-gradient(45deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 10px, rgba(0,0,0,0) 10px, rgba(0,0,0,0) 20px)"
                : "none",
            },
          },
        },
        MuiSwitch: {
          styleOverrides: {
            switchBase: {
              color: mode === "light"
                ? marioColors.yellow
                : marioColors.darkAccent,
              "&.Mui-checked": {
                color: mode === "light" ? marioColors.green : marioColors.green,
              },
              "&.Mui-checked + .MuiSwitch-track": {
                backgroundColor: mode === "light"
                  ? `${marioColors.green}90`
                  : "rgba(26, 188, 63, 0.7)",
                opacity: 1,
              },
            },
            track: {
              backgroundColor: mode === "light"
                ? `${marioColors.yellow}90`
                : "rgba(0, 120, 212, 0.5)",
              opacity: 1,
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              borderBottom: `2px solid ${marioColors.black}`,
            },
            indicator: {
              backgroundColor: mode === "light"
                ? marioColors.red
                : marioColors.darkAccent,
              height: 4,
              borderRadius: "4px 4px 0 0",
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              fontSize: "0.95rem",
              transition: "all 0.2s",
              "&.Mui-selected": {
                color: mode === "light"
                  ? marioColors.red
                  : marioColors.darkAccent,
                backgroundColor: mode === "light"
                  ? `${marioColors.red}10`
                  : "rgba(0, 120, 212, 0.1)",
              },
              "&:hover": {
                backgroundColor: mode === "light"
                  ? "rgba(0,0,0,0.04)"
                  : "rgba(255,255,255,0.04)",
                color: mode === "light"
                  ? marioColors.red
                  : marioColors.darkAccent,
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              fontWeight: 700,
              border: `2px solid ${marioColors.black}`,
              borderRadius: 16,
            },
            colorPrimary: {
              backgroundColor: mode === "light"
                ? marioColors.red
                : marioColors.darkAccent,
              color: marioColors.white,
            },
            colorSecondary: {
              backgroundColor: mode === "light"
                ? marioColors.blue
                : marioColors.darkSecondary,
              color: marioColors.white,
            },
            colorSuccess: {
              backgroundColor: mode === "light"
                ? marioColors.green
                : marioColors.green,
              color: mode === "light" ? marioColors.white : marioColors.white,
            },
            colorWarning: {
              backgroundColor: marioColors.yellow,
              color: marioColors.black,
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              margin: "4px 0",
              "&.Mui-selected": {
                backgroundColor: mode === "light"
                  ? `${marioColors.yellow}30`
                  : "rgba(0, 120, 212, 0.15)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 4,
                  height: "70%",
                  backgroundColor: mode === "light"
                    ? marioColors.yellow
                    : marioColors.darkAccent,
                  borderRadius: "0 4px 4px 0",
                },
              },
              "&:hover": {
                backgroundColor: mode === "light"
                  ? "rgba(0,0,0,0.04)"
                  : "rgba(255,255,255,0.04)",
              },
            },
          },
        },
        // Add Snackbar styling to match the Super Mario theme
        MuiSnackbar: {
          styleOverrides: {
            root: {
              "& .MuiSnackbarContent-root": {
                borderRadius: 16,
                border: `3px solid ${marioColors.black}`,
                boxShadow: `0 4px 0 ${mode === "light" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.7)"
                  }`,
                fontWeight: 600,
              },
            },
          },
        },
        // Style SnackbarContent separately for better control
        MuiSnackbarContent: {
          styleOverrides: {
            root: {
              backgroundColor: mode === "light"
                ? marioColors.blue
                : marioColors.darkPaper,
              color: mode === "light" ? marioColors.white : marioColors.white,
              "& .MuiSnackbarContent-message": {
                padding: "2px 0",
              },
              "& .MuiSnackbarContent-action": {
                marginRight: -8,
                paddingLeft: 16,
                color: mode === "light"
                  ? marioColors.yellow
                  : marioColors.yellow,
              },
            },
          },
        },
        // Style the Alert component used within Snackbars
        MuiAlert: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              border: `2px solid ${marioColors.black}`,
              fontSize: "0.95rem",
              alignItems: "center",
            },
            standardSuccess: {
              backgroundColor: mode === "light"
                ? `${marioColors.green}A0`
                : `${marioColors.green}80`,
              color: mode === "light" ? marioColors.white : marioColors.white,
              "& .MuiAlert-icon": {
                color: mode === "light" ? marioColors.white : marioColors.white,
              },
            },
            standardError: {
              backgroundColor: mode === "light"
                ? `${marioColors.red}A0`
                : `${marioColors.red}80`,
              color: marioColors.white,
              "& .MuiAlert-icon": {
                color: marioColors.white,
              },
            },
            standardWarning: {
              backgroundColor: mode === "light"
                ? `${marioColors.yellow}A0`
                : `${marioColors.yellow}80`,
              color: marioColors.black,
              "& .MuiAlert-icon": {
                color: marioColors.black,
              },
            },
            standardInfo: {
              backgroundColor: mode === "light"
                ? `${marioColors.blue}A0`
                : `${marioColors.blue}80`,
              color: marioColors.white,
              "& .MuiAlert-icon": {
                color: marioColors.white,
              },
            },
          },
        },
      },
    }), [mode]);

  // Create context value with useMemo to avoid unnecessary re-renders
  const contextValue = useMemo(() => ({
    toggleColorMode,
    mode,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContextProvider;
