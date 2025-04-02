"use no memo"
import { useState, useEffect } from "react";
import { InstantSearch } from "react-instantsearch";
import { Box, Container, Grid, useMediaQuery, useTheme } from "@mui/material";
import {
  SearchHeader, EnhancedSearchBox, MobileFilterButton, StatsCounter, StyledSortBy, StyledInfiniteHits, FiltersPanel, FilterDrawer, BackToTopButton
} from "./Shared";

function SearchLayout({
  indexName,
  searchClient,
  queryHook,
  headerIcon,
  headerTitle,
  headerSubtitle,
  searchPlaceholder,
  statsIcon,
  statsText,
  sortByItems,
  hitComponent,
  filterSections
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Count active filters
  useEffect(() => {
    const checkActiveFilters = () => {
      const checkedBoxes = document.querySelectorAll(
        ".ais-RefinementList-checkbox:checked",
      );
      setActiveFilters(checkedBoxes.length);
    };

    // Initial check
    setTimeout(checkActiveFilters, 1000);

    // Check when clicked
    document.addEventListener("click", checkActiveFilters);
    return () => document.removeEventListener("click", checkActiveFilters);
  }, []);

  // Show back to top button when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 8,
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 4 } }}>
        <InstantSearch
          future={{ preserveSharedStateOnUnmount: true }}
          searchClient={searchClient}
          indexName={indexName}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 4,
            }}
          >
            <SearchHeader
              icon={headerIcon}
              title={headerTitle}
              subtitle={headerSubtitle}
            />

            {isMobile && (
              <MobileFilterButton
                toggleDrawer={toggleDrawer}
                activeFilters={activeFilters}
              />
            )}
          </Box>

          <EnhancedSearchBox
            placeholder={searchPlaceholder}
            queryHook={queryHook}
          />

          <Grid container spacing={4}>
            {!isMobile && (
              <Grid item md={3} lg={3}>
                <FiltersPanel
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                  filterSections={filterSections}
                />
              </Grid>
            )}

            <Grid item xs={12} md={9} lg={9}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <StatsCounter
                  icon={statsIcon}
                  translationText={statsText}
                />

                <StyledSortBy items={sortByItems} />
              </Box>

              <StyledInfiniteHits hitComponent={hitComponent} />
            </Grid>
          </Grid>

          <FilterDrawer
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            activeFilters={activeFilters}
          >
            <FiltersPanel
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              filterSections={filterSections}
            />
          </FilterDrawer>
        </InstantSearch>
      </Container>

      <BackToTopButton show={showBackToTop} />
    </Box>
  );
}

export default SearchLayout;
