import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Briefcase,
  Building,
  Clock,
  DollarSign,
  Info,
  MapPin,
  PlusCircle,
} from "lucide-react";
import debounce from "lodash/debounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AutocompleteFieldWithIcon,
  CompensationField,
  DatePickerField,
  DropdownField,
  SliderField,
  TextFieldWithIcon,
} from "./fields";
import { SectionHeader } from "./SectionHeader";
import { FormActions } from "./FormActions";
import { COOP_CYCLES, COOP_YEARS, PROGRAM_LEVELS } from "#/types";
import {
  getAutocompleteCompanyOptions,
  getAutocompleteCompanyQueryKey,
  getAutocompleteLocationOptions,
  getAutocompletePositionOptions,
  getAutocompletePositionQueryKey,
  postCompanyPositionMutation,
} from "#client/react-query.gen";
import { type Position, PositionSchema } from "#/utils/validators";
import CompanyPositionModal, {
  type CompanyPosition,
} from "./CompanyPositionModal";
import { useSnackbar } from "notistack";

const JobForm: React.FC<{
  editIndex?: number;
  formDefaultValues: Position;
  onDraft: (data: Position) => void;
  onSubmit: (data: Position) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitError?: string;
  isDraft?: boolean;
  onCompleteDraft?: (data: Position) => void;
  onDelete?: () => void;
  externalErrors?: {
    field: string;
    message: string;
  }[];
}> = ({
  editIndex,
  formDefaultValues,
  onSubmit,
  onDraft,
  onCancel,
  isSubmitting: isSubmittingProp = false,
  submitError,
  isDraft = false,
  onCompleteDraft,
  onDelete,
  externalErrors = [],
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    getValues,
    watch,
    trigger,
    setValue,
    setError,
    formState: { errors, isSubmitting: formIsSubmitting },
  } = useForm<Position>({
    resolver: zodResolver(PositionSchema),
    mode: "onBlur",
    defaultValues: formDefaultValues,
  });

  const [searches, setSearches] = useState({
    company: formDefaultValues.company,
    position: formDefaultValues.position,
    location: formDefaultValues.location,
  });
  const compensation = watch("compensation");
  const workHours = watch("work_hours");
  const selectedCompany = watch("company");

  // Add watches for key form values
  const watchedCompany = watch("company");
  const watchedPosition = watch("position");
  const watchedLocation = watch("location");

  const isSubmittingRef = useRef(false);
  const weeklyPay = useMemo(
    () => compensation !== null ? compensation * workHours : null,
    [compensation, workHours],
  );
  const isSubmitting = isSubmittingProp || formIsSubmitting;

  useEffect(() => {
    if (externalErrors && externalErrors.length > 0) {
      externalErrors.forEach(({ field, message }) => {
        const fieldMapping: Record<string, string> = {
          comp: "company",
          pos: "position",
          loc: "location",
        };

        const formField = fieldMapping[field] || field;

        if (formField) {
          setError(formField as any, {
            type: "server",
            message,
          });
        }
      });
    }
  }, [externalErrors, setError]);

  // Handle submit error if provided
  useEffect(() => {
    if (submitError) {
      enqueueSnackbar(submitError, { variant: "error" });
    }
  }, [submitError, enqueueSnackbar]);

  // NEW: Effect to synchronize company form value with search state
  useEffect(() => {
    if (watchedCompany) {
      const companyValue =
        typeof watchedCompany === "object" && watchedCompany !== null
          ? watchedCompany.name
          : watchedCompany;

      if (
        companyValue && companyValue.length >= 3 &&
        companyValue !== searches.company
      ) {
        setSearches((prev) => ({ ...prev, company: companyValue }));

        // Force refetch company data
        queryClient.invalidateQueries({
          queryKey: getAutocompleteCompanyQueryKey({
            query: { comp: companyValue },
          }).queryKey,
        });
      }
    }
  }, [watchedCompany, queryClient, searches.company]);

  // NEW: Effect to synchronize position form value with search state
  useEffect(() => {
    if (
      watchedPosition && typeof watchedPosition === "string" &&
      watchedPosition.length >= 3
    ) {
      if (watchedPosition !== searches.position) {
        setSearches((prev) => ({ ...prev, position: watchedPosition }));

        // Only invalidate if we have a company
        if (watchedCompany) {
          const companyValue =
            typeof watchedCompany === "object" && watchedCompany !== null
              ? watchedCompany.name
              : watchedCompany;

          queryClient.invalidateQueries({
            queryKey: getAutocompletePositionQueryKey({
              query: { comp: companyValue, pos: watchedPosition },
            }).queryKey,
          });
        }
      }
    }
  }, [watchedPosition, watchedCompany, queryClient, searches.position]);

  // NEW: Effect to synchronize location form value with search state
  useEffect(() => {
    if (
      watchedLocation && typeof watchedLocation === "string" &&
      watchedLocation.length >= 3
    ) {
      if (watchedLocation !== searches.location) {
        setSearches((prev) => ({ ...prev, location: watchedLocation }));

        queryClient.invalidateQueries({
          queryKey: ["autocompleteLocationOptions", { loc: watchedLocation }],
        });
      }
    }
  }, [watchedLocation, queryClient, searches.location]);

  const debouncedSearch = useCallback(
    debounce((field: string, value: string) => {
      setSearches((prev) => ({ ...prev, [field]: value }));
    }, 300),
    [],
  );

  const companyQuery = useQuery({
    ...getAutocompleteCompanyOptions({
      query: { comp: searches.company },
    }),
    enabled: searches.company.length >= 3,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });

  const companyName =
    typeof selectedCompany === "object" && selectedCompany !== null
      ? selectedCompany.name
      : selectedCompany;

  const positionQuery = useQuery({
    ...getAutocompletePositionOptions({
      query: {
        comp: companyName || "",
        pos: searches.position,
      },
    }),
    enabled: !!selectedCompany && searches.position.length >= 3,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });

  const locationQuery = useQuery({
    ...getAutocompleteLocationOptions({
      query: {
        loc: searches.location || "",
      },
    }),
    enabled: searches.location.length >= 3,
    staleTime: 3000,
    placeholderData: (previousData) => previousData,
  });

  const handleFormSubmit = async (data: Position) => {
    const isValid = await trigger();

    if (isValid) {
      isSubmittingRef.current = true;
      try {
        await onSubmit(data);
      } catch (error) {
        isSubmittingRef.current = false;
        console.error("Submission error:", error);

        // Handle error response
        if (error.response?.data) {
          const errorData = error.response.data;

          if (
            errorData.message === "Validation failed" &&
            Array.isArray(errorData.details)
          ) {
            errorData.details.forEach((detail: any) => {
              const fieldName = detail.field;
              const fieldMapping: Record<string, string> = {
                comp: "company",
                pos: "position",
                loc: "location",
              };

              const formField = fieldMapping[fieldName] || fieldName;

              if (formField) {
                setError(formField as any, {
                  type: "server",
                  message: detail.message,
                });
              }
            });
          }
        }
      }
    }
  };

  const postMutation = useMutation(postCompanyPositionMutation());

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // UPDATED: handleAddCompanyPosition function
  const handleAddCompanyPosition = async (
    data: CompanyPosition,
    onReset,
    onClose,
  ) => {
    // First set form values with all options enabled
    setValue("company", data.company, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setValue("position", data.position, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // The useEffect hooks above will take care of updating searches state
    // and invalidating queries, so we don't need to do it manually here

    return postMutation.mutate({
      body: { company: data.company, position: data.position },
    }, {
      onSuccess: ({ company_id, position_id }) => {
        enqueueSnackbar("Company Position added successfully", {
          variant: "success",
        });

        // Manually trigger a refetch of position options to ensure data is fresh
        if (
          data.company && data.company.length >= 3 && data.position &&
          data.position.length >= 3
        ) {
          queryClient.refetchQueries({
            queryKey: getAutocompletePositionQueryKey({
              query: { comp: data.company, pos: data.position },
            }).queryKey,
            exact: true,
          });
        }

        onReset();
        onClose();
      },
      onError: (error: any) => {
        console.error("Error updating job:", error);

        if (error.response?.data) {
          const errorData = error.response.data;

          if (
            errorData.message === "Validation failed" &&
            Array.isArray(errorData.details)
          ) {
            errorData.details.forEach((detail: any) => {
              const fieldName = detail.field.charAt(0).toUpperCase() +
                detail.field.slice(1);
              enqueueSnackbar(`${fieldName}: ${detail.message}`, {
                variant: "error",
              });
            });
          } else {
            enqueueSnackbar(errorData.message || "Failed to update job", {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar("An unexpected error occurred. Please try again.", {
            variant: "error",
          });
        }
      },
    });
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              {editIndex !== undefined
                ? "Edit Job Submission"
                : isDraft
                ? "Edit Draft Submission"
                : "Add New Job Submission"}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PlusCircle size={16} />}
              size="small"
              sx={{ mb: 1 }}
              onClick={handleOpenModal}
            >
              Add New Company/Position
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <AutocompleteFieldWithIcon
                name="company"
                label="Company"
                control={control}
                icon={<Building size={18} />}
                options={companyQuery?.data &&
                    companyQuery?.data?.map((item) => item.name) || []}
                loading={companyQuery?.isFetching}
                getOptionLabel={(option) => option ?? ""}
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => {
                  debouncedSearch("company", value);
                }}
                placeholder="Search for a company..."
                rules={{ required: "Company is required" }}
                error={!!errors.company}
                helperText={errors?.company?.message || ""}
                freeSolo
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <AutocompleteFieldWithIcon
                name="position"
                label="Position"
                control={control}
                icon={<Briefcase size={18} />}
                options={positionQuery?.data &&
                    positionQuery?.data?.map((item) => item.name) || []}
                loading={positionQuery.isFetching}
                getOptionLabel={(option) => option ?? ""}
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => {
                  debouncedSearch("position", value);
                }}
                placeholder="Search for a position..."
                disabled={!selectedCompany}
                rules={{ required: "Position is required" }}
                error={!!errors.position}
                helperText={errors?.position?.message || ""}
                freeSolo
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <AutocompleteFieldWithIcon
                name="location"
                label="Location"
                control={control}
                icon={<MapPin size={18} />}
                options={locationQuery?.data &&
                    locationQuery?.data?.map((item) => item.name) || []}
                loading={locationQuery.isFetching}
                getOptionLabel={(option) => option ?? ""}
                isOptionEqualToValue={(option, value) => option === value}
                onInputChange={(_, value) => {
                  debouncedSearch("location", value);
                }}
                placeholder="Search for a city..."
                rules={{ required: "Location is required" }}
                error={!!errors.location}
                helperText={errors?.location?.message || ""}
                freeSolo
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DropdownField
                name="program_level"
                label="Program Level"
                control={control}
                options={PROGRAM_LEVELS}
              />
            </Grid>

            {/* Work Period Information */}
            <Grid item xs={12}>
              <SectionHeader title="Co-op Details" />
            </Grid>

            <Grid item xs={12} md={4}>
              <DropdownField
                name="coop_cycle"
                label="Co-op Cycle"
                control={control}
                options={COOP_CYCLES}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <DropdownField
                name="coop_year"
                label="Co-op Year"
                control={control}
                options={COOP_YEARS}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <DatePickerField
                name="year"
                label="Year"
                control={control}
                views={["year"]}
                openTo="year"
                minYear={2005}
              />
            </Grid>

            {/* Compensation Information */}
            <Grid item xs={12}>
              <SectionHeader title="Compensation Details" />
            </Grid>

            <Grid item xs={12} md={6}>
              <CompensationField
                control={control}
                value={compensation}
                error={!!errors.compensation}
                helperText={errors.compensation?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1, mt: 0.2 }}
              >
                <Clock size={18} />
                <Typography
                  gutterBottom
                  variant="body1"
                  sx={{
                    fontWeight: "medium",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {"Work Hours"}:
                  <Box component="span" sx={{ ml: 1 }}>
                    {`${workHours}h`}
                  </Box>
                </Typography>
              </Stack>
              <SliderField
                name="work_hours"
                control={control}
                label="Work Hours"
                min={5}
                max={60}
                step={1}
                currentValue={workHours}
                valueLabelFormat={(value) => `${value}h`}
                marks={[
                  { value: 20, label: "20h" },
                  { value: 40, label: "40h" },
                  { value: 60, label: "60h" },
                ]}
                error={!!errors.work_hours}
                helperText={errors.work_hours?.message}
                footer={weeklyPay !== null && (
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ mt: 1, fontWeight: "medium" }}
                  >
                    Weekly Salary: ${weeklyPay.toFixed(2)}
                  </Typography>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextFieldWithIcon
                name="other_compensation"
                label="Other Compensation"
                control={control}
                icon={<DollarSign size={18} />}
                placeholder="E.g., Benefits, transportation, housing allowance"
                nullable={true}
                error={!!errors.other_compensation}
                helperText={errors.other_compensation?.message}
              />
            </Grid>

            {/* Additional Details */}
            <Grid item xs={12}>
              <TextFieldWithIcon
                name="details"
                label="Additional Details"
                control={control}
                icon={<Info size={18} />}
                multiline={true}
                rows={3}
                placeholder="Any additional information about the position"
                nullable={true}
                error={!!errors.details}
                helperText={errors.details?.message}
              />
            </Grid>
          </Grid>

          <FormActions
            onCancel={onCancel}
            onDraft={() => onDraft(getValues())}
            isEditing={editIndex !== undefined || isDraft}
            isSubmitting={isSubmitting}
            hasErrors={Object.keys(errors).length > 0}
            isDraft={isDraft}
            onCompleteDraft={onCompleteDraft
              ? () => onCompleteDraft(getValues())
              : undefined}
            onDelete={onDelete}
          />
        </Box>
      </Paper>

      <CompanyPositionModal
        open={modalOpen}
        onClose={handleCloseModal}
        initialCompany={searches.company || ""}
        initialPosition={searches.position || ""}
        onSubmit={handleAddCompanyPosition}
      />
    </>
  );
};

export default JobForm;
