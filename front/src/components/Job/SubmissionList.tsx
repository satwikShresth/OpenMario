// components/Job/SubmissionList.tsx
import React from "react";
import JobCard from "./Card";
import { Box, Paper, Typography } from "@mui/material";
import { AlertCircle } from "lucide-react";
import type { Submission } from "#/types";

interface SubmissionListProps {
  onEdit: (idOrIndex: string | number) => void;
  onDelete: (idOrIndex: string | number) => void;
  submissions?: Submission[] | Map<string, Submission>;
  isDraftList?: boolean;
  onSelect?: (index: number) => void;
}

const SubmissionList: React.FC<SubmissionListProps> = ({
  onEdit,
  onDelete,
  submissions,
  isDraftList = false,
  onSelect,
}) => {
  const isEmpty = !submissions ||
    (submissions instanceof Map
      ? submissions.size === 0
      : submissions.length === 0);

  if (isEmpty) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          variant: "outlined",
          color: "info",
        }}
      >
        <AlertCircle size={48} />
        <Typography variant="h6" component="div" color="primary" sx={{ mt: 2 }}>
          {isDraftList ? "No Draft Submissions" : "No Submissions"}
        </Typography>
        <Typography variant="body1" align="center">
          {isDraftList
            ? 'Save your progress by clicking "Save as Draft" when creating a new submission.'
            : 'Click "Add New Salary" to get started.'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ mt: 2 }}>
        {isDraftList
          ? (
            // Handle draft submissions as an array
            (submissions as Submission[]).map((submission, index) => (
              <Box
                key={`draft-${index}`}
                onClick={onSelect ? () => onSelect(index) : undefined}
                sx={onSelect
                  ? {
                    cursor: "pointer",
                    "&:hover": {
                      "& > div": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                    },
                  }
                  : undefined}
              >
                <JobCard
                  submission={submission}
                  index={index}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDraft={true}
                />
              </Box>
            ))
          )
          : (
            // Handle regular submissions as a Map
            Array.from((submissions as Map<string, Submission>).entries()).map((
              [id, submission],
              index,
            ) => (
              <Box
                key={id}
                sx={undefined}
              >
                <JobCard
                  submission={submission}
                  index={index}
                  id={id}
                  onEdit={() => onEdit(id)}
                  onDelete={() => onDelete(id)}
                  isDraft={false}
                />
              </Box>
            ))
          )}
      </Box>
    </Box>
  );
};

export default SubmissionList;
