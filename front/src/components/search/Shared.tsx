// src/components/search/SharedComponents.jsx
import {
  InfiniteHits, RefinementList, SearchBox, SortBy, Stats,
  useInstantSearch
} from "react-instantsearch";
import {
  alpha, Box, Button, CircularProgress, Container, Divider, Drawer, Fab, IconButton, Typography, useTheme,
} from "@mui/material";
import {
  ArrowUp, Filter, X,
} from "lucide-react";
import { useAppTheme } from "#/utils";
import { useMemo } from "react";

export function LoadingComponent({ title, subtitle }) {
  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress
          size={60}
          thickness={5}
          sx={{
            mb: 3,
            color: "primary.main",
          }}
        />
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          {title || "Loading..."}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {subtitle || "Finding the perfect matches for you..."}
        </Typography>
      </Box>
    </Container>
  );
}

// Error component for routes
export function ErrorComponent({ error }) {
  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box sx={{ textAlign: "center", maxWidth: 500 }}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            bgcolor: "error.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            mx: "auto",
          }}
        >
          <X size={60} color="#fff" />
        </Box>
        <Typography
          variant="h4"
          gutterBottom
          fontWeight="bold"
          color="error.main"
        >
          Oops! Something went wrong
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
          {error?.message ||
            "We encountered an error while loading. Please try again."}
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    </Container>
  );
}

// Header component for search pages
export function SearchHeader({ icon, title, subtitle }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box
        sx={{
          p: 1.5,
          mr: 2,
          bgcolor: "primary.main",
          borderRadius: "12px",
          boxShadow: "0 4px 0 rgba(0,0,0,0.5)",
          border: "2px solid black",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{ mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}

// Reusable search box component
export function EnhancedSearchBox({ placeholder, queryHook }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mb: 4,
        position: "relative",
        mx: "auto",
        maxWidth: "900px",
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: 50,
          overflow: "hidden",
          border: "3px solid black",
          boxShadow: "0 6px 0 rgba(0,0,0,0.5)",
          "& .ais-SearchBox": {
            width: "100%",
          },
          "& .ais-SearchBox-form": {
            width: "100%",
            position: "relative",
            display: "flex",
            alignItems: "center",
          },
          "& .ais-SearchBox-input": {
            width: "100%",
            padding: "12px 18px 12px 48px",
            fontSize: "1rem",
            borderRadius: "50px",
            border: "none",
            outline: "none",
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            height: "48px",
          },
          "& .ais-SearchBox-submit, .ais-SearchBox-reset": {
            position: "absolute",
            top: "50%",
            transform: "translateY(-50%)",
            padding: "8px",
            border: "none",
            background: "none",
            cursor: "pointer",
          },
          "& .ais-SearchBox-submit": {
            left: "14px",
          },
          "& .ais-SearchBox-reset": {
            right: "16px",
          },
          "& .ais-SearchBox-submitIcon": {
            width: "18px",
            height: "18px",
            fill: theme.palette.primary.main,
          },
          "& .ais-SearchBox-resetIcon": {
            width: "16px",
            height: "16px",
            fill: theme.palette.text.secondary,
          },
        }}
      >
        <SearchBox
          placeholder={placeholder}
          queryHook={queryHook}
          autoFocus
        />
      </Box>
    </Box>
  );
}

// Filter button for mobile
export function MobileFilterButton({ indexName, toggleDrawer }) {
  const { uiState } = useInstantSearch();
  const activeFilters = useMemo(() => {
    if (!uiState[indexName] || !uiState[indexName].refinementList) {
      return 0;
    }

    // Count all selected refinements by summing the length of each refinement array
    return Object.values(uiState[indexName].refinementList)
      .reduce((total, filters) => total + (Array.isArray(filters) ? filters.length : 0), 0);
  }, [uiState, indexName]);

  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={toggleDrawer}
      startIcon={<Filter size={20} />}
    >
      Filters
      {activeFilters > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: -8,
            right: -8,
            bgcolor: "secondary.main",
            color: "white",
            borderRadius: "50%",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "0.75rem",
            border: "2px solid black",
          }}
        >
          {activeFilters}
        </Box>
      )}
    </Button>
  );
}

// Stats counter with styling
export function StatsCounter({ icon, translationText }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        px: 2.5,
        py: 1,
        borderRadius: 50,
        display: "inline-flex",
        alignItems: "center",
        border: "2px solid black",
        boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
      }}
    >
      {icon}
      <Stats
        translations={{
          stats: ({ nbHits }) => translationText(nbHits),
        }}
        classNames={{
          root: "font-bold",
        }}
      />
    </Box>
  );
}

// SortBy dropdown with styling
export function StyledSortBy({ items }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "background.paper",
        borderRadius: 50,
        border: "2px solid black",
        boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
        overflow: "hidden",
        "& .ais-SortBy": {
          width: "100%",
        },
        "& .ais-SortBy-select": {
          padding: "8px 40px 8px 20px",
          fontSize: "0.95rem",
          fontWeight: 500,
          color: theme.palette.text.primary,
          background: "transparent",
          border: "none",
          borderRadius: "50px",
          cursor: "pointer",
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
          zIndex: 10,
          position: "relative",
          minWidth: "200px",
          "&:focus": {
            outline: "none",
          }
        },
        "&::after": {
          content: '""',
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "0",
          height: "0",
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: `5px solid ${theme.palette.text.primary}`,
          pointerEvents: "none"
        }
      }}
    >
      <SortBy items={items} />
    </Box>
  );
}

// Custom InfiniteHits component
export function StyledInfiniteHits({ hitComponent }) {
  const HitComponent = hitComponent;
  const appTheme = useAppTheme();

  // This custom component wrapper ensures each hit has a key
  const CustomHit = ({ hit, sendEvent }) => {
    return (
      <HitComponent
        key={hit?.id || String(hit?.crn)}
        hit={hit}
        sendEvent={sendEvent}
      />
    );
  };

  return (
    <Box
      component={InfiniteHits}
      hitComponent={CustomHit}
      sx={{
        "& .ais-InfiniteHits-list": {
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          backgroundColor: "transparent",
        },
        "& .ais-InfiniteHits-item": {
          bgcolor: "transparent",
          border: "none",
          padding: 0,
          boxShadow: "none",
        },
        "& .ais-InfiniteHits-loadPrevious": {
          visibility: "collapse",
        },
        "& .ais-InfiniteHits-disabledLoadPrevious": {
          visibility: "collapse",
        },
        "& .ais-InfiniteHits-loadMore": {
          textTransform: "none",
          borderRadius: 25,
          fontWeight: 700,
          fontSize: "0.95rem",
          padding: "8px 16px",
          boxShadow: `0 4px 0 ${appTheme.mode === "light"
            ? "rgba(0,0,0,0.5)"
            : "rgba(0,0,0,0.7)"
            }`,
          border: `2px solid #000000`,
          transition: "all 0.1s ease-in-out",
          "&:hover": {
            transform: "translateY(2px)",
            boxShadow: `0 2px 0 ${appTheme.mode === "light"
              ? "rgba(0,0,0,0.5)"
              : "rgba(0,0,0,0.7)"
              }`,
            filter: "brightness(1.05)",
          },
          "&:active": {
            transform: "translateY(4px)",
            boxShadow: "none",
            filter: "brightness(0.95)",
          },
          backgroundColor: appTheme.mode === "light"
            ? "#E60012"
            : "#009FE3",
        },
      }}
    />
  );
}

// FiltersPanel component
export function FiltersPanel({ indexName, filterSections }) {
  const theme = useTheme();
  const { uiState, setUiState
  } = useInstantSearch();
  const activeFilters = useMemo(() => {
    if (!uiState[indexName] || !uiState[indexName].refinementList) {
      return 0;
    }

    return Object.values(uiState[indexName].refinementList)
      .reduce((total, filters) => total + (Array.isArray(filters) ? filters.length : 0), 0);
  }, [uiState, indexName]);

  const clearAllFilters = () => setUiState((prev) => {
    const ret = { ...prev };
    ret[indexName].refinementList = {}
    return ret
  });

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        p: 3,
        height: "relative",
        border: "3px solid black",
        boxShadow: "0 6px 0 rgba(0,0,0,0.5)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          component="div"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Filter
            size={20}
            style={{ marginRight: 10 }}
            color={theme.palette.primary.main}
          />
          Filters
          {activeFilters > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 50,
                bgcolor: "primary.main",
                color: "white",
                fontSize: "0.75rem",
                border: "2px solid black",
              }}
            >
              {activeFilters}
            </Box>
          )}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {filterSections}

      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          fullWidth
          color="primary"
          startIcon={<X size={18} />}
          onClick={clearAllFilters}
          disabled={activeFilters === 0}
        >
          Clear All Filters
        </Button>
      </Box>
    </Box>
  );
}

// Filter drawer for mobile
export function FilterDrawer({ drawerOpen, toggleDrawer, indexName, children }) {
  const theme = useTheme();
  const { uiState } = useInstantSearch();
  const activeFilters = useMemo(() => {
    if (!uiState[indexName] || !uiState[indexName].refinementList) {
      return 0;
    }

    // Count all selected refinements by summing the length of each refinement array
    return Object.values(uiState[indexName].refinementList)
      .reduce((total, filters) => total + (Array.isArray(filters) ? filters.length : 0), 0);
  }, [uiState, indexName]);

  return (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={toggleDrawer}
      ModalProps={{
        keepMounted: true,
      }}
      PaperProps={{
        sx: {
          width: "85%",
          maxWidth: 350,
          p: 3,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          component="div"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Filter
            size={18}
            style={{ marginRight: 10 }}
            color={theme.palette.primary.main}
          />
          Filters
          {activeFilters > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: 50,
                bgcolor: "primary.main",
                color: "white",
                fontSize: "0.75rem",
                border: "2px solid black",
              }}
            >
              {activeFilters}
            </Box>
          )}
        </Typography>
        <IconButton onClick={toggleDrawer}>
          <X size={20} />
        </IconButton>
      </Box>
      <Divider />
      <Box
        sx={{
          mt: 2,
          pb: 2,
          maxHeight: "calc(100vh - 180px)",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
}

// Back to top button
export function BackToTopButton({ show }) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!show) return null;

  return (
    <Fab
      color="primary"
      aria-label="back to top"
      onClick={scrollToTop}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
        border: "2px solid black",
        boxShadow: "0 4px 0 rgba(0,0,0,0.5)",
        transition: "all 0.1s ease-in-out",
        "&:hover": {
          transform: "translateY(2px)",
          boxShadow: "0 2px 0 rgba(0,0,0,0.5)",
        },
        "&:active": {
          transform: "translateY(4px)",
          boxShadow: "none",
        },
      }}
    >
      <ArrowUp size={24} />
    </Fab>
  );
}
