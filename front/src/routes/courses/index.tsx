import { createFileRoute } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import {
  InstantSearch, SearchBox, InfiniteHits, Stats, RefinementList, SortBy,
  Highlight
} from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'
import 'instantsearch.css/themes/satellite.css'
import {
  Card, CardContent, Typography, Chip, Box, Grid, Button, Container,
  CircularProgress, Divider, Avatar, IconButton, Drawer, useMediaQuery,
  Fab, useTheme, alpha, Stack, Tooltip
} from '@mui/material'
import {
  BookOpen, Calendar, Clock, School, MapPin, Filter, ArrowUp,
  Star, X, Users, GraduationCap, Award, BookmarkCheck, Layers,
  ExternalLink
} from 'lucide-react'
import { useAppTheme } from '#/utils'
import FilterSection from '#/components/search/FitlerSection'

// Initialize the MeiliSearch client
const { searchClient } = instantMeiliSearch(
  `${window.location.host}/api/search`,
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWFyY2hSdWxlcyI6eyIqIjp7fX0sImFwaUtleVVpZCI6IjQ2ZTEyZjhkLWU1NTItNDY3NC1hMmI1LWMzODU3NjRjNGRkNCIsImV4cCI6MTc0MzU2MjI0NX0.FVTuiMqXqQ5w5HcPtkdorhFCaeAlE8Uoym94KlbBLSk",
  {
    primaryKey: 'crn',
    attributesToHighlight: [
      'title',
      'course',
      'description',
      'subject_name',
      'college_name',
      'instructors.name',
      'instructors.department'
    ],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>'
  }
)

export const Route = createFileRoute('/courses/')({
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
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>Loading Course Search</Typography>
          <Typography variant="body1" color="text.secondary">Finding the perfect courses for you...</Typography>
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
            {error?.message || 'We encountered an error while loading the course search. Please try again.'}
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
  component: CourseSectionsComponent,
})

// Main component
function CourseSectionsComponent() {
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
          indexName="sections"
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
                <BookOpen size={28} color="white" />
              </Box>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 0.5 }}>
                  Find Your Courses
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Explore courses that match your academic interests and schedule
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
                placeholder="Search courses, instructors, or subjects..."
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
                  <BookmarkCheck size={18} color={theme.palette.primary.main} style={{ marginRight: 8 }} />
                  <Stats
                    translations={{
                      stats: ({ nbHits }) => `${nbHits.toLocaleString()} sections available`,
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
                      { label: 'Most Relevant', value: 'sections' },
                      { label: 'Course Number (Low to High)', value: 'sections:course_number:asc' },
                      { label: 'Course Number (High to Low)', value: 'sections:course_number:desc' },
                      { label: 'Credits (Highest)', value: 'sections:credits:desc' },
                      { label: 'Credits (Lowest)', value: 'sections:credits:asc' },
                      { label: 'Start Time (Earliest)', value: 'sections:start_time:asc' },
                      { label: 'Start Time (Latest)', value: 'sections:start_time:desc' },
                      { label: 'Instructor Rating (Highest)', value: 'sections:instructors.avg_rating:desc' }
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
                hitComponent={SectionHit}
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
                  '& .ais-InfiniteHits-loadPrevious': {
                    visibility: "collapse"
                  },
                  '& .ais-InfiniteHits-disabledLoadPrevious': {
                    visibility: "collapse"
                  },
                  '& .ais-InfiniteHits-loadMore': {
                    textTransform: 'none',
                    borderRadius: 25,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    padding: '8px 16px',
                    boxShadow: `0 4px 0 ${useAppTheme().mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)'}`,
                    border: `2px solid #000000`,
                    transition: 'all 0.1s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(2px)',
                      boxShadow: `0 2px 0 ${useAppTheme().mode === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)'}`,
                      filter: 'brightness(1.05)',
                    },
                    '&:active': {
                      transform: 'translateY(4px)',
                      boxShadow: 'none',
                      filter: 'brightness(0.95)',
                    },
                    backgroundColor: useAppTheme().mode === 'light' ? '#E60012' : '#009FE3',
                  }
                }
                }
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

// FiltersPanel component
function FiltersPanel({ activeFilters, setActiveFilters }) {
  const theme = useTheme();

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

      <FilterSection title="Subject" attribute="subject_name" icon={<BookOpen />} searchable={true} />
      <FilterSection title="College" attribute="college_name" icon={<School />} searchable={true} />
      <FilterSection title="Instruction Type" attribute="instruction_type" icon={<Users />} />
      <FilterSection title="Instruction Method" attribute="instruction_method" icon={<MapPin />} />
      <FilterSection title="Credits" attribute="credits" isSlider icon={<Award />} />
      <FilterSection title="Days" attribute="days" icon={<Calendar />} />
      <FilterSection title="Term" attribute="term" icon={<Layers />} />
      <FilterSection title="Instructor" attribute="instructors.name" icon={<GraduationCap />} searchable={true} />
      <FilterSection title="Department" attribute="instructors.department" icon={<BookOpen />} searchable={true} />

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

// Helper function to format time
function formatTime(timeString) {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':');

  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM

  return `${hour}:${minutes} ${ampm}`;
}

const DayBox = ({ theme, days }) => {
  if (!days || !Array.isArray(days) || days.length === 0) {
    return <Typography variant="body2">N/A</Typography>;
  }

  const dayMapping = {
    'Monday': 'M',
    'Tuesday': 'T',
    'Wednesday': 'W',
    'Thursday': 'R',
    'Friday': 'F',
    'Saturday': 'S',
    'Sunday': 'U'
  };

  const dayCodes = days.map(day => dayMapping[day] || day);
  const allDays = ['M', 'T', 'W', 'R', 'F', 'S', 'U'];

  const displayLabels = {
    'M': 'M',
    'T': 'T',
    'W': 'W',
    'R': 'T', // Thursday displays as "T"
    'F': 'F',
    'S': 'S',
    'U': 'S'  // Sunday displays as "S"
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Calendar size={18} style={{ marginRight: 8 }} color={theme.palette.primary.main} />
      <Box sx={{ display: 'flex', ml: .7 }}>
        {allDays.map((day) => (
          <Box
            key={day}
            sx={{
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: dayCodes.includes(day)
                ? theme.palette.primary.main
                : theme.palette.background.paper,
              border: 1,
              borderColor: theme.palette.divider,
              color: dayCodes.includes(day)
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary,
              fontWeight: dayCodes.includes(day) ? 'bold' : 'normal',
              fontSize: '.9rem',
            }}
          >
            {displayLabels[day]}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// SectionHit Component
function SectionHit({ hit }) {
  const theme = useTheme();
  const [favorited, setFavorited] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Determine subject letter color
  const getAvatarColor = () => {
    const colors = [
      'primary.main',
      'secondary.main',
      'error.main',
      'warning.main',
      'info.main',
      'success.main',
    ];

    // Generate a consistent color based on subject
    if (!hit.subject_id) return colors[0];
    const charCode = hit.subject_id.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Get instructors array or empty array if not present
  const instructors = hit.instructors && Array.isArray(hit.instructors) ? hit.instructors : [];
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        mb: 1,
        transition: 'all 0.2s ease-in-out',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        width: "100%"
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          bgcolor: 'background.paper',
          border: '2px solid black',
          boxShadow: '0 6px 0 rgba(0,0,0,0.2)',
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
                  {hit.subject_id?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {hit.course ? (
                      <Highlight
                        attribute="course"
                        hit={hit}
                        classNames={{
                          highlighted: 'bg-yellow-200 px-1 rounded font-bold'
                        }}
                      />
                    ) : (
                      'Untitled Course'
                    )}
                    {' '}
                    <Typography
                      component="span"
                      variant="subtitle1"
                      sx={{
                        ml: 1,
                        color: 'text.secondary',
                        display: 'inline-block'
                      }}
                    >
                      Section {hit.section}
                    </Typography>
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
                    <School size={16} style={{ marginRight: 6 }} />
                    {hit.title ? (
                      <Highlight
                        attribute="title"
                        hit={hit}
                        classNames={{
                          highlighted: 'bg-yellow-200 px-1 rounded font-bold'
                        }}
                      />
                    ) : (
                      'No Title'
                    )}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            {
              /*
                          <Grid item xs={12} sm={5} md={4} sx={{
                            display: 'flex',
                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                            alignItems: 'flex-start'
                          }}>
                            <Tooltip title={favorited ? "Remove from favorites" : "Add to favorites"}>
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
                            </Tooltip>
              
                            <Button
                              variant="contained"
                              color="primary"
                            >
                              View Details
                            </Button>
                          </Grid>
              
               * */
            }
          </Grid>
          {/* Tags */}
          <Box sx={{ my: 2 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<School size={14} />}
                label={
                  <Highlight
                    attribute="subject_name"
                    hit={hit}
                    classNames={{
                      highlighted: 'bg-yellow-200 px-1 rounded font-bold'
                    }}
                  />
                }
                color="primary"
                size="medium"
              />

              <Chip
                icon={<BookOpen size={14} />}
                label={
                  <Highlight
                    attribute="college_name"
                    hit={hit}
                    classNames={{
                      highlighted: 'bg-yellow-200 px-1 rounded font-bold'
                    }}
                  />
                }
                color="secondary"
                size="medium"
              />

              {hit.instruction_type && (
                <Chip
                  icon={<Users size={14} />}
                  label={hit.instruction_type}
                  color="success"
                  size="medium"
                />
              )}

              {hit.instruction_method && (
                <Chip
                  icon={<MapPin size={14} />}
                  label={hit.instruction_method}
                  color="info"
                  size="medium"
                />
              )}

              {hit.credits && (
                <Chip
                  icon={<Award size={14} />}
                  label={`${hit.credits} credit${hit.credits !== 1 ? 's' : ''}`}
                  color="warning"
                  size="medium"
                />
              )}
            </Stack>
          </Box>

          {/* Schedule information */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              mt: 3,
              mb: 2.5,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              p: 2,
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            {/* Meeting Days */}
            {hit.days && hit.days.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Typography variant="body2" fontWeight="medium">
                  {hit.days && hit.days.length > 0 && (
                    <DayBox theme={theme} days={hit.days} />
                  )}
                </Typography>
              </Box>
            )}

            {/* Meeting Time */}
            {hit.start_time && hit.end_time && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <Clock size={18} style={{ marginRight: 8 }} color={theme.palette.secondary.main} />
                <Typography variant="body2" fontWeight="medium">
                  {formatTime(hit.start_time)} - {formatTime(hit.end_time)}
                </Typography>
              </Box>
            )}

            {/* Term */}
            {hit.term && (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                <BookmarkCheck size={18} style={{ marginRight: 8 }} color={theme.palette.success.main} />
                <Typography variant="body2" fontWeight="medium">
                  Term: {hit.term}
                </Typography>
              </Box>
            )}

            {/* CRN */}
            {hit.crn && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Layers size={18} style={{ marginRight: 8 }} color={theme.palette.warning.main} />
                <Typography variant="body2" fontWeight="medium">
                  CRN: {hit.crn}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Course description with Highlighting */}
          {hit.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2.5,
                lineHeight: 1.6,
              }}
            >
              <Highlight
                attribute="description"
                hit={hit}
                classNames={{
                  highlighted: 'bg-yellow-200 px-1 rounded font-bold'
                }}
              />
            </Typography>
          )}

          {/* Instructors information */}
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
              fontWeight="bold"
              sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GraduationCap size={18} style={{ marginRight: 8 }} color={theme.palette.primary.main} />
                {instructors.length !== 1 ? 'Instructors:' : 'Instructor:'}
              </Box>
            </Typography>

            {instructors.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                TBA
              </Typography>
            ) : (
              instructors.map((instructor, index) => (
                <Box
                  key={`instructor-${index}-${instructor.id || index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                    pb: index < instructors.length - 1 ? 1 : 0,
                    borderBottom: index < instructors.length - 1 ? '1px dashed' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box>
                    <Typography variant="body2">
                      {instructor.name || 'Unknown Instructor'}
                      {instructor.department && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          component="span"
                          sx={{ ml: 0.5 }}
                        >
                          ({instructor.department})
                        </Typography>
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {instructor.rmp_id && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        endIcon={<ExternalLink size={16} />}
                        sx={{
                          py: 0.5,
                          boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                          border: '1px solid black',
                          borderRadius: 10,
                          textTransform: 'none'
                        }}
                        component="a"
                        href={`https://www.ratemyprofessors.com/professor/${instructor.rmp_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        RMP Profile
                      </Button>
                    )}

                    {instructor.avg_rating && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 10,
                          border: '1px solid',
                          borderColor: 'warning.main'
                        }}
                      >
                        <Tooltip title="Rate My Professor rating">
                          <Typography
                            variant="caption"
                            sx={{
                              mr: .7,
                              mt: .4,
                              fontWeight: 'bold',
                              color: theme.palette.warning.dark
                            }}
                          >
                            RMP
                          </Typography>
                        </Tooltip>
                        <Star size={14} style={{ marginRight: 4 }} fill={theme.palette.warning.main} color={theme.palette.warning.main} />
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {instructor.avg_rating.toFixed(1)}
                          {instructor.num_ratings && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 0.5 }}
                            >
                              ({instructor.num_ratings})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
