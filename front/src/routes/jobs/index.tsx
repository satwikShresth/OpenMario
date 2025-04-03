"use no memo"
// src/routes/JobsRoute.jsx
import { createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { useState } from "react";
import { Highlight } from "react-instantsearch";
import { useTheme } from "@mui/material";
import {
  Award, BookOpen, Briefcase, Building, Calendar, Clock, GraduationCap, Layers, MapPin, Star,
} from "lucide-react";
import { Avatar, Box, Button, Card, CardContent, Chip, Grid, IconButton, Stack, Typography } from "@mui/material";
import FilterSection from "#/components/search/FitlerSection";
import { getAuthSearchTokenOptions } from "#client/react-query.gen";
import { useSearchClient, useQueryHook } from "#/hooks";
import { LoadingComponent, ErrorComponent, } from "#/components/search/Shared";
import SearchLayout from "#/components/search/SearchLayout";

export const Route = createFileRoute("/jobs/")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.prefetchQuery(getAuthSearchTokenOptions())
  },
  pendingComponent: () => (
    <LoadingComponent
      title="Loading Job Search"
      subtitle="Finding the perfect opportunities for you..."
    />
  ),
  errorComponent: ({ error }) => (
    <ErrorComponent error={error} />
  ),
  component: JobSearchComponent,
});

// Main component
function JobSearchComponent() {
  const { searchClient } = useSearchClient();
  const { queryHook } = useQueryHook();
  const theme = useTheme();

  // Define job filter sections
  const jobFilterSections = (
    <>
      <FilterSection
        title="Job Type"
        attribute="job_type"
        icon={<Briefcase />}
      />
      <FilterSection
        title="Co-op Cycle"
        attribute="coop_cycle"
        icon={<BookOpen />}
      />
      <FilterSection
        title="Job Length"
        attribute="job_length"
        icon={<Layers />}
      />
      <FilterSection
        title="Job Status"
        attribute="job_status"
        icon={<Award />}
      />
      <FilterSection
        title="Work Hours"
        attribute="work_hours"
        isSlider
        icon={<Clock />}
      />
      <FilterSection
        title="Year"
        attribute="year"
        isSlider
        icon={<Calendar />}
      />
      <FilterSection
        title="Type of Organization"
        attribute="is_nonprofit"
        icon={<Building />}
      />
      <FilterSection
        title="Research Position"
        attribute="is_research_position"
        icon={<MapPin />}
      />
      <FilterSection
        title="Minimum GPA"
        attribute="minimum_gpa"
        step={0.25}
        isSlider
        icon={<GraduationCap />}
      />
      <FilterSection
        title="Experience Level"
        attribute="experience_levels"
        icon={<Award />}
      />
      <FilterSection
        title="Compensation"
        attribute="compensation_status"
        icon={<Briefcase />}
      />
    </>
  );

  // Sort options for jobs
  const jobSortByItems = [
    { label: "Most Relevant", value: "job_postings" },
    {
      label: "Year (Newest)",
      value: "job_postings:year:desc",
    },
    {
      label: "Year (Oldest)",
      value: "job_postings:year:asc",
    },
    {
      label: "Job Length (Longest)",
      value: "job_postings:job_length:desc",
    },
    {
      label: "Minimum GPA (Highest)",
      value: "job_postings:minimum_gpa:desc",
    },
    {
      label: "Work Hours (Most)",
      value: "job_postings:work_hours:desc",
    },
    {
      label: "Recently Added",
      value: "job_postings:created_at:desc",
    },
    {
      label: "Recently Updated",
      value: "job_postings:updated_at:desc",
    },
  ];

  return (
    <SearchLayout
      Route={Route.fullPath}
      indexName="job_postings"
      searchClient={searchClient}
      queryHook={queryHook}
      headerIcon={<Briefcase size={28} color="white" />}
      headerTitle="Find Your Dream Job"
      headerSubtitle="Explore opportunities that match your skills and interests"
      searchPlaceholder="Search job titles, skills, or companies..."
      statsIcon={<Award size={18} color={theme.palette.primary.main} style={{ marginRight: 8 }} />}
      statsText={(nbHits) => `${nbHits.toLocaleString()} positions available`}
      sortByItems={jobSortByItems}
      hitComponent={JobHit}
      filterSections={jobFilterSections}
    />
  );
}

function JobHit({ hit }) {
  const theme = useTheme();
  const [favorited, setFavorited] = useState(false);
  const [hovered, setHovered] = useState(false);

  const getAvatarColor = () => {
    const colors = [
      "primary.main",
      "secondary.main",
      "error.main",
      "warning.main",
      "info.main",
      "success.main",
    ];

    if (!hit.company_name) return colors[0];
    const charCode = hit.company_name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        mb: 1,
        transition: "all 0.2s ease-in-out",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
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
                  {hit.company_name?.charAt(0) || "J"}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", mb: 0.5 }}>
                    {hit.position_name
                      ? (
                        <Highlight
                          attribute="position_name"
                          hit={hit}
                          classNames={{
                            highlighted: "bg-yellow-200 px-1 rounded font-bold",
                          }}
                        />
                      )
                      : (
                        "Untitled Position"
                      )}
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
                    <Building size={16} style={{ marginRight: 6 }} />
                    {hit.company_name
                      ? (
                        <Highlight
                          attribute="company_name"
                          hit={hit}
                          classNames={{
                            highlighted: "bg-yellow-200 px-1 rounded font-bold",
                          }}
                        />
                      )
                      : (
                        "Unknown Company"
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
                onClick={() => setFavorited(!favorited)}
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
              {hit.job_type && (
                <Chip
                  icon={<Briefcase size={14} />}
                  label={
                    <Highlight
                      attribute="job_type"
                      hit={hit}
                      classNames={{
                        highlighted: "bg-yellow-200 px-1 rounded font-bold",
                      }}
                    />
                  }
                  color="primary"
                  size="medium"
                />
              )}
              {hit.year && (
                <Chip
                  icon={<Calendar size={14} />}
                  label={`${hit.year}`}
                  color="secondary"
                  size="medium"
                />
              )}
              {hit.coop_cycle && (
                <Chip
                  icon={<BookOpen size={14} />}
                  label={
                    <Highlight
                      attribute="coop_cycle"
                      hit={hit}
                      classNames={{
                        highlighted: "bg-yellow-200 px-1 rounded font-bold",
                      }}
                    />
                  }
                  color="success"
                  size="medium"
                />
              )}
              {hit.job_length && (
                <Chip
                  icon={<Layers size={14} />}
                  label={`${hit.job_length} Quarter${hit.job_length > 1 ? "s" : ""
                    }`}
                  color="info"
                  size="medium"
                />
              )}
              {hit.work_hours && (
                <Chip
                  icon={<Clock size={14} />}
                  label={`${hit.work_hours} hrs/week`}
                  color="warning"
                  size="medium"
                />
              )}
            </Stack>
          </Box>

          {/* Description with Highlighting */}
          {hit.position_description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2.5,
                lineHeight: 1.6,
              }}
            >
              <Highlight
                attribute="position_description"
                hit={hit}
                classNames={{
                  highlighted: "bg-yellow-200 px-1 rounded font-bold",
                }}
              />
            </Typography>
          )}

          {/* Majors with Highlighting */}
          {hit.majors && hit.majors.length > 0 && (
            <Box
              sx={{
                mt: 2.5,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{
                  fontWeight: "bold",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <GraduationCap
                  size={16}
                  style={{ marginRight: 8 }}
                  color={theme.palette.primary.main}
                />
                Majors Sought:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {hit.majors.map((major, index) => (
                  <Chip
                    key={index}
                    label={
                      <Highlight
                        attribute={`majors.${index}`}
                        hit={hit}
                        classNames={{
                          highlighted: "bg-yellow-200 px-1 rounded font-bold",
                        }}
                      />
                    }
                    size="medium"
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
