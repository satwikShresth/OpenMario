import React, { useState, useEffect } from "react";
import { InstantSearch } from "react-instantsearch";
import { Box, Container, Grid, useMediaQuery, useTheme } from "@mui/material";
import {
  SearchHeader, EnhancedSearchBox, MobileFilterButton, StatsCounter, StyledSortBy, StyledInfiniteHits, FiltersPanel, FilterDrawer, BackToTopButton
} from "./Shared";
import { FavoritesToggle } from "./FavoritesToggle";
import { history } from 'instantsearch.js/es/lib/routers';
import { parseSearchWith, useNavigate, useRouter } from "@tanstack/react-router";
import { configure } from "instantsearch.js/es/widgets";
import { parse, stringify } from 'jsurl2'

interface SearchLayoutProps {
  Route: string,
  indexName: any,
  searchClient: any,
  queryHook: any,
  headerIcon: any,
  headerTitle: any,
  headerSubtitle: any,
  searchPlaceholder: any,
  statsIcon: any,
  statsText: any,
  sortByItems: any,
  hitComponent: any,
  filterSections: any,
  idField?: string
}

const SearchLayout: React.FC<SearchLayoutProps> = ({
  Route,
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
  filterSections,
  idField = "id"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const navigate = useNavigate({ from: Route });
  const router = useRouter();

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
          routing={{
            router: history({
              createURL({ routeState, location }) {
                const loc = router.parseLocation(location)
                const newLoc = router.buildLocation({ search: routeState, state: loc.state })
                return location.origin + newLoc.href
              },
              parseURL({ location }) {
                return parseSearchWith(parse)(location.search)
              },
              push(url) {
                const location = new URL(url);

                router.navigate({
                  to: Route,
                  search: parseSearchWith(parse)(location.search),
                  replace: true,
                  resetScroll: false,
                  reloadDocument: false
                })
              },
              cleanUrlOnDispose: false
            }),
            stateMapping: {
              stateToRoute(uiState) {
                const indexUiState = uiState[indexName];
                indexUiState?.configure && delete indexUiState?.configure
                indexUiState?.sortBy || delete indexUiState?.sortBy
                console.log(indexUiState)
                return {
                  ...indexUiState,
                }
              },
              routeToState(routeState) {
                console.log(routeState)
                return {
                  [indexName]: {
                    ...routeState,
                  }
                }
              },
            }
          }}
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
                indexName={indexName}
                toggleDrawer={toggleDrawer}
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
                  indexName={indexName}
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <StatsCounter
                    icon={statsIcon}
                    translationText={statsText}
                  />
                  <FavoritesToggle idField={idField} />
                </Box>

                <StyledSortBy items={sortByItems} />
              </Box>

              <StyledInfiniteHits hitComponent={hitComponent} />
            </Grid>
          </Grid>

          <FilterDrawer
            indexName={indexName}
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
          >
            <FiltersPanel
              indexName={indexName}
              filterSections={filterSections}
            />
          </FilterDrawer>
        </InstantSearch>
      </Container>

      <BackToTopButton show={showBackToTop} />
    </Box >
  );
}

export default SearchLayout;
