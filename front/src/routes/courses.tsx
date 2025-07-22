"use no memo"
// src/routes/CoursesRoute.jsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, Grid, Box, Typography, Avatar, Stack, Chip, alpha, Button, IconButton } from "@mui/material";
import {
  Award, BarChart2, BookmarkCheck, BookOpen, Calendar, Clock, ExternalLink, GraduationCap, Layers, MapPin, School, Star, Users,
} from "lucide-react";
import { useTheme } from "@mui/material";
import { Highlight, useInstantSearch } from "react-instantsearch";
import FilterSection from "#/components/search/FitlerSection";
import { getAuthSearchTokenOptions } from "#client/react-query.gen";
import { useSearchClient, useQueryHook } from "#/hooks";
import { LoadingComponent, ErrorComponent, } from "#/components/search/Shared";
import SearchLayout from "#/components/search/SearchLayout";
import { FavoritesProvider, useFavoritesStore } from "#/stores/useFavoriteStore";

export const Route = createFileRoute("/courses")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.fetchQuery(getAuthSearchTokenOptions())
  },
  staleTime: 1000 * 60 * 110,
  gcTime: 1000 * 60 * 110,
  pendingComponent: () => (
    <LoadingComponent
      title="Loading Course Search"
      subtitle="Finding the perfect courses for you..."
    />
  ),
  errorComponent: ({ error }) => (
    <ErrorComponent error={error} />
  ),
  component: CourseSectionsComponent,
});

// Main component
function CourseSectionsComponent() {
  const { searchClient } = useSearchClient();
  const { queryHook } = useQueryHook();
  const theme = useTheme();

  // Define course filter sections
  const courseFilterSections = (
    <>
      <FilterSection
        title="Subject"
        attribute="subject_name"
        icon={<BookOpen />}
        searchable={true}
      />
      <FilterSection
        title="College"
        attribute="college_name"
        icon={<School />}
        searchable={true}
      />
      <FilterSection
        title="Instruction Type"
        attribute="instruction_type"
        icon={<Users />}
      />
      <FilterSection
        title="Instruction Method"
        attribute="instruction_method"
        icon={<MapPin />}
      />
      <FilterSection
        title="Credits"
        attribute="credits"
        isSlider
        step={.5}
        icon={<Award />}
      />
      <FilterSection title="Days" attribute="days" icon={<Calendar />} />
      <FilterSection title="Term" attribute="term" icon={<Layers />} />
      <FilterSection
        title="Instructor"
        attribute="instructors.name"
        icon={<GraduationCap />}
        searchable={true}
      />
      <FilterSection
        title="Department"
        attribute="instructors.department"
        icon={<BookOpen />}
        searchable={true}
      />
    </>
  );

  // Sort options for courses
  const courseSortByItems = [
    { label: "Most Relevant", value: "sections" },
    {
      label: "Course Number (Low to High)",
      value: "sections:course_number:asc",
    },
    {
      label: "Course Number (High to Low)",
      value: "sections:course_number:desc",
    },
    {
      label: "Credits (Highest)",
      value: "sections:credits:desc",
    },
    {
      label: "Credits (Lowest)",
      value: "sections:credits:asc",
    },
    {
      label: "Start Time (Earliest)",
      value: "sections:start_time:asc",
    },
    {
      label: "Start Time (Latest)",
      value: "sections:start_time:desc",
    },
    {
      label: "Instructor Rating (Highest)",
      value: "sections:instructors.avg_rating:desc",
    },
  ];

  return (
    <FavoritesProvider initialValue={{ index: "sections" }}>
      <SearchLayout
        Route={Route.fullPath}
        indexName="sections"
        searchClient={searchClient}
        queryHook={queryHook}
        headerIcon={<BookOpen size={28} color="white" />}
        headerTitle="Find Your Courses"
        headerSubtitle="Explore courses that match your academic interests and schedule"
        searchPlaceholder="Search courses, instructors, or subjects..."
        statsIcon={<BookmarkCheck size={18} color={theme.palette.primary.main} style={{ marginRight: 8 }} />}
        statsText={(nbHits) => `${nbHits.toLocaleString()} sections available`}
        sortByItems={courseSortByItems}
        hitComponent={SectionHit}
        filterSections={courseFilterSections}
        idField="crn"
      />
    </FavoritesProvider>
  );
}

// Helper function to format time
function formatTime(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");

  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert 0 to 12 for 12 AM

  return `${hour}:${minutes} ${ampm}`;
}

const DayBox = ({ theme, days }) => {
  if (!days || !Array.isArray(days) || days.length === 0) {
    return <Typography variant="body2" component="div">N/A</Typography>;
  }

  const dayMapping = {
    "Monday": "M",
    "Tuesday": "T",
    "Wednesday": "W",
    "Thursday": "R",
    "Friday": "F",
    "Saturday": "S",
    "Sunday": "U",
  };

  const dayCodes = days.map((day) => dayMapping[day] || day);
  const allDays = ["M", "T", "W", "R", "F", "S", "U"];

  const displayLabels = {
    "M": "M",
    "T": "T",
    "W": "W",
    "R": "T", // Thursday displays as "T"
    "F": "F",
    "S": "S",
    "U": "S", // Sunday displays as "S"
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Calendar
        size={18}
        style={{ marginRight: 8 }}
        color={theme.palette.primary.main}
      />
      <Box sx={{ display: "flex", ml: .7 }}>
        {allDays.map((day) => (
          <Box
            key={day}
            sx={{
              width: 22,
              height: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: dayCodes.includes(day)
                ? theme.palette.primary.main
                : theme.palette.background.paper,
              border: 1,
              borderColor: theme.palette.divider,
              color: dayCodes.includes(day)
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary,
              fontWeight: dayCodes.includes(day) ? "bold" : "normal",
              fontSize: ".9rem",
            }}
          >
            {displayLabels[day]}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

function SectionHit({ hit }) {
  const theme = useTheme();
  const { isFavorite, toggleFavorite, favorites } = useFavoritesStore();
  const favorited = useMemo(() => isFavorite(hit.crn), [favorites]);
  const [hovered, setHovered] = useState(false);

  const ratingColors = {
    gold: { main: '#FFC107', dark: '#FFB300' },           // Amber for top-tier (5.0)
    excellent: { main: '#4CAF50', dark: '#388E3C' },      // Balanced green
    good: { main: '#42A5F5', dark: '#1E88E5' },           // Clear sky blue
    average: { main: '#FF7043', dark: '#F4511E' },        // Soft orange
    poor: { main: '#E53935', dark: '#C62828' }            // Strong red
  };

  const difficultyColors = {
    easy: { main: '#81C784', dark: '#388E3C' },           // Calmer green
    medium: { main: '#64B5F6', dark: '#1976D2' },         // Approachable blue
    challenging: { main: '#FFB74D', dark: '#F57C00' },    // Warm amber
    hard: { main: '#E53935', dark: '#B71C1C' }            // Intense red
  };
  // Helper function to get rating color
  function getRatingColor(rating, opacity = 1) {
    // Special case for 5.0 rating - must be exactly 5.0
    if (Math.abs(rating - 5.0) < 0.01) return opacity < 1 ? ratingColors.gold.dark : ratingColors.gold.main;
    // Scale: 1-2 (red), 2-3 (orange), 3-4 (yellow), 4-5 (green)
    if (rating >= 4) return opacity < 1 ? ratingColors.excellent.dark : ratingColors.excellent.main;
    if (rating >= 3) return opacity < 1 ? ratingColors.good.dark : ratingColors.good.main;
    if (rating >= 2) return opacity < 1 ? ratingColors.average.dark : ratingColors.average.main;
    return opacity < 1 ? ratingColors.poor.dark : ratingColors.poor.main;
  }

  // Helper function to get difficulty color
  function getDifficultyColor(difficulty, opacity = 1) {
    // Scale: 1-2 (green/easy), 2-3 (blue/medium), 3-4 (purple/challenging), 4-5 (red/hard)
    if (difficulty >= 4) return opacity < 1 ? difficultyColors.hard.dark : difficultyColors.hard.main;
    if (difficulty >= 3) return opacity < 1 ? difficultyColors.challenging.dark : difficultyColors.challenging.main;
    if (difficulty >= 2) return opacity < 1 ? difficultyColors.medium.dark : difficultyColors.medium.main;
    return opacity < 1 ? difficultyColors.easy.dark : difficultyColors.easy.main;
  }



  const getAvatarColor = () => {
    const colors = [
      "primary.main",
      "secondary.main",
      "error.main",
      "warning.main",
      "info.main",
      "success.main",
    ];

    // Generate a consistent color based on subject
    if (!hit.subject_id) return colors[0];
    const charCode = hit.subject_id.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Get instructors array or empty array if not present
  const instructors = hit.instructors && Array.isArray(hit.instructors)
    ? hit.instructors
    : [];

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        mb: 1,
        transition: "all 0.2s ease-in-out",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        width: "100%",
      }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          transition: "all 0.2s ease-in-out",
          bgcolor: "background.paper",
          border: "2px solid black",
          boxShadow: "0 6px 0 rgba(0,0,0,0.2)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7} md={8}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mr: 2,
                    bgcolor: getAvatarColor(),
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    border: "2px solid black",
                  }}
                >
                  {hit.subject_id?.charAt(0) || "C"}
                </Avatar>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    {hit.course
                      ? (
                        <Highlight
                          attribute="course"
                          hit={hit}
                          classNames={{
                            highlighted: "bg-yellow-200 px-1 rounded font-bold",
                          }}
                        />
                      )
                      : (
                        "Untitled Course"
                      )}{" "}
                    <Typography
                      component="span"
                      variant="subtitle1"
                      sx={{
                        ml: 1,
                        color: "text.secondary",
                        display: "inline-block",
                      }}
                    >
                      Section {hit.section}
                    </Typography>
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "text.secondary",
                      mb: 1,
                    }}
                  >
                    <School size={16} style={{ marginRight: 6 }} />
                    {hit.title
                      ? (
                        <Highlight
                          attribute="title"
                          hit={hit}
                          classNames={{
                            highlighted: "bg-yellow-200 px-1 rounded font-bold",
                          }}
                        />
                      )
                      : (
                        "No Title"
                      )}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={5}
              md={4}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", sm: "flex-end" },
                alignItems: "flex-start",
              }}
            >
              <IconButton
                onClick={() => toggleFavorite(hit.crn)}
                sx={{
                  color: favorited ? "warning.main" : "action.disabled",
                  p: 1,
                  mr: 1.5,
                  border: "2px solid black",
                  borderRadius: 2,
                  boxShadow: "0 3px 0 rgba(0,0,0,0.3)",
                  "&:hover": {
                    transform: "translateY(2px)",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Star size={20} fill={favorited ? "currentColor" : "none"} />
              </IconButton>
            </Grid>

          </Grid>

          {/* Tags */}
          <Box sx={{ my: 2 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              <Chip
                icon={<School size={14} />}
                label={
                  <Highlight
                    attribute="subject_name"
                    hit={hit}
                    classNames={{
                      highlighted: "bg-yellow-200 px-1 rounded font-bold",
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
                      highlighted: "bg-yellow-200 px-1 rounded font-bold",
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
                  label={`${hit.credits} credit${hit.credits !== 1 ? "s" : ""}`}
                  color="warning"
                  size="medium"
                />
              )}
            </Stack>
          </Box>

          {/* Schedule information */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: 3,
              mb: 2.5,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              p: 2,
              borderRadius: 2,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            {/* Meeting Days */}
            {hit.days && hit.days.length > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                <Typography variant="body2" component="div" fontWeight="medium">
                  {hit.days && hit.days.length > 0 && (
                    <DayBox theme={theme} days={hit.days} />
                  )}
                </Typography>
              </Box>
            )}

            {/* Meeting Time */}
            {hit.start_time && hit.end_time && (
              <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                <Clock
                  size={18}
                  style={{ marginRight: 8 }}
                  color={theme.palette.secondary.main}
                />
                <Typography variant="body2" component="div" fontWeight="medium">
                  {formatTime(hit.start_time)} - {formatTime(hit.end_time)}
                </Typography>
              </Box>
            )}

            {/* Term */}
            {hit.term && (
              <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                <BookmarkCheck
                  size={18}
                  style={{ marginRight: 8 }}
                  color={theme.palette.success.main}
                />
                <Typography variant="body2" component="div" fontWeight="medium">
                  Term: {hit.term}
                </Typography>
              </Box>
            )}

            {/* CRN */}
            {hit.crn && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Layers
                  size={18}
                  style={{ marginRight: 8 }}
                  color={theme.palette.warning.main}
                />
                <Typography variant="body2" component="div" fontWeight="medium">
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
                  highlighted: "bg-yellow-200 px-1 rounded font-bold",
                }}
              />
            </Typography>
          )}

          {/* Instructors information */}
          <Box
            sx={{
              mt: 2.5,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <GraduationCap
                  size={18}
                  style={{ marginRight: 8 }}
                  color={theme.palette.primary.main}
                />
                {instructors.length !== 1 ? "Instructors:" : "Instructor:"}
              </Typography>
            </Box>

            {instructors.length === 0
              ? (
                <Typography variant="body2" color="text.secondary">
                  TBA
                </Typography>
              )
              : (
                instructors.map((instructor, index) => (
                  <Box
                    key={`instructor-${index}-${instructor.id || index}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                      pb: index < instructors.length - 1 ? 1 : 0,
                      borderBottom: index < instructors.length - 1
                        ? "1px dashed"
                        : "none",
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography variant="body2">
                        {instructor.name || "Unknown Instructor"}
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

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {instructor.rmp_id && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          endIcon={<ExternalLink size={14} />}
                          sx={{
                            py: 0.3,
                            px: 1,
                            boxShadow: "0 1px 0 rgba(0,0,0,0.1)",
                            border: "1px solid",
                            borderColor: "info.main",
                            borderRadius: 10,
                            textTransform: "none",
                            fontSize: "0.75rem",
                            minWidth: "auto"
                          }}
                          component="a"
                          href={`https://www.ratemyprofessors.com/professor/${instructor.rmp_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          RMP
                        </Button>
                      )}

                      {instructor.avg_difficulty && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: alpha(getDifficultyColor(instructor.avg_difficulty), 0.2),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 10,
                            border: "1px solid",
                            borderColor: getDifficultyColor(instructor.avg_difficulty),
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              mr: .7,
                              mt: .4,
                              fontWeight: "bold",
                              color: getDifficultyColor(instructor.avg_difficulty, 0.8),
                            }}
                          >
                            Difficulty
                          </Typography>
                          <BarChart2
                            size={14}
                            style={{ marginRight: 4 }}
                            fill={getDifficultyColor(instructor.avg_difficulty)}
                            color={getDifficultyColor(instructor.avg_difficulty)}
                          />
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{
                              color: getDifficultyColor(instructor.avg_difficulty),
                              textShadow: "0px 0px 1px rgba(0,0,0,0.1)"
                            }}
                          >
                            {instructor.avg_difficulty.toFixed(1)}
                          </Typography>
                        </Box>
                      )}


                      {instructor.avg_rating && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: alpha(getRatingColor(instructor.avg_rating), 0.2),
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 10,
                            border: "1px solid",
                            borderColor: getRatingColor(instructor.avg_rating),
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              mr: .7,
                              mt: .4,
                              fontWeight: "bold",
                              color: getRatingColor(instructor.avg_rating, 0.8),
                            }}
                          >
                            Rating
                          </Typography>
                          <Star
                            size={14}
                            style={{ marginRight: 4 }}
                            fill={getRatingColor(instructor.avg_rating)}
                            color={getRatingColor(instructor.avg_rating)}
                          />
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{
                              color: getRatingColor(instructor.avg_rating),
                              textShadow: "0px 0px 1px rgba(0,0,0,0.1)"
                            }}
                          >
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
