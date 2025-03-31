import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import {
  InstantSearch, SearchBox, InfiniteHits, Stats, RefinementList, SortBy
} from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import 'instantsearch.css/themes/satellite.css'
import {
  Card, CardContent, Typography, Chip, Box, Grid, Button, Container,
  CircularProgress, Divider, Avatar, IconButton, Drawer, useMediaQuery,
  Fab, useTheme, alpha, Stack
} from '@mui/material'
import {
  Briefcase, MapPin, Clock, Building, GraduationCap, Calendar, Search as SearchIcon,
  Filter, SortAsc, ArrowUp, Star, ChevronDown, X, BookOpen, Layers, Menu, Award
} from 'lucide-react'

// Initialize the MeiliSearch client correctly
const { searchClient } = instantMeiliSearch(
  'http://localhost:7700',
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWFyY2hSdWxlcyI6eyIqIjp7fX0sImFwaUtleVVpZCI6ImUxN2E5YTQxLTcyYjYtNGM1ZC04YWU0LTNkY2Y2ZGE2MzRlYSIsImV4cCI6MTc0MzUzNDM3OX0.W7fVQ6_FsGoan5M2y-3QK4hsfSl0YM_2ISYAZ3cR21g"
)

// Route definition
export const Route = createFileRoute('/jobposting/')({
  pendingComponent: () => {
    const theme = useTheme();

    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={60}
            thickness={5}
            sx={{
              mb: 3,
              color: 'primary.main',
            }}
          />
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>Loading Job Search</Typography>
          <Typography variant="body1" color="text.secondary">Finding the perfect opportunities for you...</Typography>
        </Box>
      </Container>
    );
  },
  errorComponent: ({ error }) => {
    const theme = useTheme();

    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 500 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto'
            }}
          >
            <X size={60} color="#fff" />
          </Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            {error?.message || 'We encountered an error while loading the job search. Please try again.'}
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
  },
  component: JobSearchComponent,
})

function JobSearchComponent() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Count active filters
  useEffect(() => {
    const checkActiveFilters = () => {
      const checkedBoxes = document.querySelectorAll('.ais-RefinementList-checkbox:checked');
      setActiveFilters(checkedBoxes.length);
    };

    // Initial check
    setTimeout(checkActiveFilters, 1000);

    // Check when clicked
    document.addEventListener('click', checkActiveFilters);
    return () => document.removeEventListener('click', checkActiveFilters);
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      pt: 2,
      pb: 8
    }}>
      <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, md: 4 } }}>
        <InstantSearch
          searchClient={searchClient}
          indexName="job_postings"
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                sx={{
                  p: 1.5,
                  mr: 2,
                  bgcolor: 'primary.main',
                  borderRadius: '12px',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
                  border: '2px solid black',
                }}
              >
                <Briefcase size={28} color="white" />
              </Box>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Find Your Dream Job
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Explore opportunities that match your skills and interests
                </Typography>
              </Box>
            </Box>

            {isMobile && (
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
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      bgcolor: 'secondary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      border: '2px solid black',
                    }}
                  >
                    {activeFilters}
                  </Box>
                )}
              </Button>
            )}
          </Box>

          {/* Search Box */}
          <Box
            sx={{
              mb: 4,
              position: 'relative',
              mx: 'auto',
              maxWidth: '900px',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                borderRadius: 50,
                overflow: 'hidden',
                border: '3px solid black',
                boxShadow: '0 6px 0 rgba(0,0,0,0.5)',
              }}
            >
              <SearchBox
                placeholder="Search job titles, skills, or companies..."
                classNames={{
                  form: 'w-full relative',
                  input: 'w-full p-5 pl-14 rounded-full text-lg focus:outline-none',
                  submit: 'hidden',
                  reset: 'hidden',
                }}
                autoFocus
              />
            </Box>
          </Box>

          <Grid container spacing={4}>
            {/* Filters - Desktop */}
            {!isMobile && (
              <Grid item md={3} lg={3}>
                <FiltersPanel
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                />
              </Grid>
            )}

            {/* Main Content */}
            <Grid item xs={12} md={9} lg={9}>
              {/* Results count and sort */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    px: 2.5,
                    py: 1,
                    borderRadius: 50,
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '2px solid black',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  }}
                >
                  <Award size={18} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                  <Stats
                    translations={{
                      stats: ({ nbHits }) => `${nbHits.toLocaleString()} positions available`,
                    }}
                    classNames={{
                      root: 'font-bold',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    bgcolor: 'background.paper',
                    borderRadius: 50,
                    border: '2px solid black',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                  }}
                >
                  <SortBy
                    items={[
                      { label: 'Most Relevant', value: 'job_postings' },
                      { label: 'Year (Newest)', value: 'job_postings:year:desc' },
                      { label: 'Year (Oldest)', value: 'job_postings:year:asc' },
                      { label: 'Job Length (Longest)', value: 'job_postings:job_length:desc' },
                      { label: 'Minimum GPA (Highest)', value: 'job_postings:minimum_gpa:desc' },
                      { label: 'Work Hours (Most)', value: 'job_postings:work_hours:desc' },
                      { label: 'Recently Added', value: 'job_postings:created_at:desc' },
                      { label: 'Recently Updated', value: 'job_postings:updated_at:desc' }
                    ]}
                    classNames={{
                      select: 'py-2 px-10 px-4 rounded-full appearance-none cursor-pointer relative z-10 border-0 bg-transparent font-medium',
                    }}
                  />
                </Box>
              </Box>

              {/* Results list */}
              <Box
                component={InfiniteHits}
                hitComponent={JobHit}
                sx={{
                  '& .ais-InfiniteHits-list': {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    backgroundColor: 'transparent'
                  },
                  '& .ais-InfiniteHits-item': {
                    bgcolor: "transparent",
                    border: 'none',
                    padding: 0,
                    boxShadow: 'none',
                  },
                  '& .ais-InfiniteHits-loadMore': {
                    marginTop: '2rem',
                    marginX: 'auto',
                    display: 'block',
                    padding: '1rem 2.5rem',
                    borderRadius: '9999px',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 'bold',
                    position: 'relative',
                    zIndex: 10,
                    border: '2px solid black',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
                    transition: 'all 0.1s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(2px)',
                      boxShadow: '0 2px 0 rgba(0,0,0,0.5)',
                    },
                    '&:active': {
                      transform: 'translateY(4px)',
                      boxShadow: 'none',
                    },
                    '&:disabled': {
                      opacity: 0.7,
                    }
                  }
                }}
                translations={{
                  loadMore: 'Show More Opportunities',
                }}
              />
            </Grid>
          </Grid>
        </InstantSearch>

        {/* Mobile Drawer for Filters */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              width: '85%',
              maxWidth: 350,
              p: 3,
            }
          }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
              <Filter size={18} style={{ marginRight: 10 }} color={theme.palette.primary.main} />
              Filters
              {activeFilters > 0 && (
                <Box component="span" sx={{
                  ml: 1,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 50,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '0.75rem',
                  border: '2px solid black',
                }}>
                  {activeFilters}
                </Box>
              )}
            </Typography>
            <IconButton
              onClick={toggleDrawer}
            >
              <X size={20} />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ mt: 2, pb: 2, maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
            <FiltersPanel
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
            />
          </Box>
        </Drawer>
      </Container>

      {/* Back to top button */}
      {showBackToTop && (
        <Fab
          color="primary"
          aria-label="back to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            border: '2px solid black',
            boxShadow: '0 4px 0 rgba(0,0,0,0.5)',
            transition: 'all 0.1s ease-in-out',
            '&:hover': {
              transform: 'translateY(2px)',
              boxShadow: '0 2px 0 rgba(0,0,0,0.5)',
            },
            '&:active': {
              transform: 'translateY(4px)',
              boxShadow: 'none',
            }
          }}
        >
          <ArrowUp size={24} />
        </Fab>
      )}
    </Box>
  )
}

// Filters component
function FiltersPanel({ activeFilters, setActiveFilters }) {
  const theme = useTheme();

  const FilterSection = ({ title, attribute, searchable = false, icon }) => (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon && React.cloneElement(icon, {
          size: 18,
          style: { marginRight: 8 },
          color: theme.palette.primary.main
        })}
        {title}
      </Typography>
      <Box sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        p: 1.5,
        border: '2px solid black',
        boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
      }}>
        <RefinementList
          attribute={attribute}
          limit={5}
          showMore
          searchable={searchable}
          translations={{
            showMore(expanded) {
              return expanded ? 'Show less' : 'Show more';
            },
            noResults: 'No results found',
            submitTitle: 'Submit your search query',
            resetTitle: 'Clear your search query',
            placeholder: 'Search...',
          }}
          classNames={{
            checkbox: 'mr-3 rounded border-2 border-black checked:bg-primary w-4 h-4',
            count: 'ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700',
            labelText: 'text-sm font-medium',
            showMore: 'text-sm font-medium text-primary hover:underline cursor-pointer mt-2 inline-block',
            searchBox: 'mb-2',
            noResults: 'text-sm text-gray-500 italic',
          }}
        />
      </Box>
    </Box>
  );

  const clearAllFilters = () => {
    document.querySelectorAll('.ais-RefinementList-checkbox:checked').forEach(checkbox => {
      checkbox.click();
    });
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 3,
        height: 'relative',
        border: '3px solid black',
        boxShadow: '0 6px 0 rgba(0,0,0,0.5)',
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
      }}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Filter size={20} style={{ marginRight: 10 }} color={theme.palette.primary.main} />
          Filters
          {activeFilters > 0 && (
            <Box component="span" sx={{
              ml: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 50,
              bgcolor: 'primary.main',
              color: 'white',
              fontSize: '0.75rem',
              border: '2px solid black',
            }}>
              {activeFilters}
            </Box>
          )}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <FilterSection title="Job Type" attribute="job_type" icon={<Briefcase />} />
      <FilterSection title="Co-op Cycle" attribute="coop_cycle" icon={<BookOpen />} />
      <FilterSection title="Job Length" attribute="job_length" icon={<Layers />} />
      <FilterSection title="Job Status" attribute="job_status" icon={<Award />} />
      <FilterSection title="Work Hours" attribute="work_hours" icon={<Clock />} />
      <FilterSection title="Year" attribute="year" icon={<Calendar />} />
      <FilterSection title="Type of Organization" attribute="is_nonprofit" icon={<Building />} />
      <FilterSection title="Research Position" attribute="is_research_position" icon={<MapPin />} />
      <FilterSection title="Minimum GPA" attribute="minimum_gpa" icon={<GraduationCap />} />
      <FilterSection title="Experience Level" attribute="experience_levels" icon={<Award />} />
      <FilterSection title="Compensation" attribute="compensation_status" icon={<Briefcase />} />

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

// Component to render each job posting result
function JobHit({ hit }) {
  const theme = useTheme();
  const [favorited, setFavorited] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Format company name to be more readable
  const formatCompanyName = (name) => {
    return name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : 'Unknown Company';
  };

  // Determine first letter color
  const getAvatarColor = () => {
    const colors = [
      'primary.main',
      'secondary.main',
      'error.main',
      'warning.main',
      'info.main',
      'success.main',
    ];

    // Generate a consistent color based on company name
    if (!hit.company_name) return colors[0];
    const charCode = hit.company_name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        mb: 1,
        transition: 'all 0.2s ease-in-out',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    bgcolor: getAvatarColor(),
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    border: '2px solid black',
                  }}
                >
                  {hit.company_name?.charAt(0) || 'J'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {hit.position_name || 'Untitled Position'}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.secondary',
                      mb: 1,
                    }}
                  >
                    <Building size={16} style={{ marginRight: 6 }} />
                    {formatCompanyName(hit.company_name)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={5} md={4} sx={{
              display: 'flex',
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
              alignItems: 'flex-start'
            }}>
              <IconButton
                onClick={() => setFavorited(!favorited)}
                sx={{
                  color: favorited ? 'warning.main' : 'action.disabled',
                  p: 1,
                  mr: 1.5,
                  border: '2px solid black',
                  borderRadius: 2,
                  boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
                  '&:hover': {
                    transform: 'translateY(2px)',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.3)',
                  }
                }}
              >
                <Star size={20} fill={favorited ? 'currentColor' : 'none'} />
              </IconButton>

              <Button
                variant="contained"
                color="primary"
              >
                View Details
              </Button>
            </Grid>
          </Grid>

          {/* Tags */}
          <Box sx={{ my: 2 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {hit.job_type && (
                <Chip
                  icon={<Briefcase size={14} />}
                  label={hit.job_type}
                  color="primary"
                  size="small"
                />
              )}
              {hit.year && (
                <Chip
                  icon={<Calendar size={14} />}
                  label={`${hit.year}`}
                  color="secondary"
                  size="small"
                />
              )}
              {hit.coop_cycle && (
                <Chip
                  icon={<BookOpen size={14} />}
                  label={hit.coop_cycle}
                  color="success"
                  size="small"
                />
              )}
              {hit.job_length && (
                <Chip
                  icon={<Layers size={14} />}
                  label={`${hit.job_length} Month${hit.job_length > 1 ? 's' : ''}`}
                  color="info"
                  size="small"
                />
              )}
              {hit.work_hours && (
                <Chip
                  icon={<Clock size={14} />}
                  label={`${hit.work_hours} hrs/week`}
                  color="warning"
                  size="small"
                />
              )}
            </Stack>
          </Box>

          {/* Description */}
          {hit.position_description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2.5,
                lineHeight: 1.6,
              }}
            >
              {hit.position_description.length > 180
                ? `${hit.position_description.substring(0, 180)}...`
                : hit.position_description}
            </Typography>
          )}

          {/* Majors */}
          {hit.majors && hit.majors.length > 0 && (
            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <GraduationCap size={16} style={{ marginRight: 8 }} color={theme.palette.primary.main} />
                Majors Sought:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {hit.majors.map((major, index) => (
                  <Chip
                    key={index}
                    label={major}
                    size="small"
                    color="success"
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
