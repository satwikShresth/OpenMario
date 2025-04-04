import React, { useState } from "react";
import { Box, IconButton, InputBase, Stack, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import { DollarSign, Edit } from "lucide-react";
import { SliderField } from "./Slider";

type CompensationFieldProps = {
  control: any;
  value: number | null;
};

export const CompensationField: React.FC<CompensationFieldProps> = ({
  control,
  value,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Controller
        name="compensation"
        control={control}
        render={({ field }) => (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <DollarSign size={18} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: "medium",
                display: "flex",
                alignItems: "center",
              }}
            >
              Hourly Rate:
              {!isEditing
                ? (
                  <Box component="span" sx={{ ml: 1 }}>
                    {`${field?.value ? field?.value : "0.00"}/hr`}
                  </Box>
                )
                : (
                  <InputBase
                    sx={{
                      ml: 1,
                      fontSize: "inherit",
                      width: "80px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      px: 1,
                    }}
                    autoFocus
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "") {
                        field.onChange(null);
                      } else {
                        const parsed = parseFloat(value);
                        if (!isNaN(parsed)) {
                          field.onChange(parsed);
                        }
                      }
                    }}
                    onBlur={() => setIsEditing(false)}
                    type="number"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                )}
            </Typography>
            <Typography variant="body2" sx={{ ml: 0.5 }}></Typography>
            <IconButton
              size="small"
              onClick={handleEditToggle}
              sx={{
                ml: 1,
                bgcolor: isEditing ? "primary.light" : "transparent",
                "&:hover": {
                  bgcolor: isEditing ? "primary.main" : "action.hover",
                },
              }}
            >
              <Box sx={{ transform: "translateY(1px)" }}>
                <Edit size={16} />
              </Box>
            </IconButton>
          </Stack>
        )}
      />
      <SliderField
        name="compensation"
        control={control}
        label=""
        min={0}
        max={100}
        step={0.5}
        valueLabelFormat={(value) => `$${value.toFixed(2)}`}
        marks={[
          { value: 0, label: "$0" },
          { value: 25, label: "$25" },
          { value: 50, label: "$50" },
          { value: 75, label: "$75" },
          { value: 100, label: "$100" },
        ]}
      />
    </Box>
  );
};
