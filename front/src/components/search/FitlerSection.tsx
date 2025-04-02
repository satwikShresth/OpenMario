import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { useRange, useRefinementList } from "react-instantsearch";
import { useTheme } from "@mui/material/styles";
import { Search } from "lucide-react";
import { useAppTheme } from "#/utils";

// Component for list-based refinements
const FilterList = ({ title, attribute, searchable, icon }) => {
  const theme = useTheme();
  const {
    items,
    refine,
    searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
    createURL,
  } = useRefinementList({
    attribute,
    limit: 5,
    showMore: true,
    searchable,
  });

  console.log(items)

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ mb: 1.5, display: "flex", alignItems: "center" }}
      >
        {icon && React.cloneElement(icon, {
          size: 18,
          style: { marginRight: 8 },
          color: theme.palette.primary.main,
        })}
        {title}
      </Typography>
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 1.5,
          border: "2px solid black",
          boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
        }}
      >
        {searchable && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search..."
              size="small"
              onChange={(e) => searchForItems(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "50px",
                  border: "3px solid black",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.3)",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                },
              }}
              variant="outlined"
            />
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.length > 0
            ? (
              items.map((item) => (
                <Box
                  key={item.value}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={item.isRefined}
                        onChange={() => refine(item.value)}
                        sx={{
                          "&.MuiCheckbox-root": { color: "text.secondary" },
                          "&.Mui-checked": { color: "primary.main" },
                          "& .MuiSvgIcon-root": { fontSize: "1.25rem" },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                    }
                    sx={{
                      margin: 0,
                      "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
                    }}
                  />
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.125rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      backgroundColor: theme.palette.grey[100],
                      color: theme.palette.grey[700],
                    }}
                  >
                    {item.count}
                  </Box>
                </Box>
              ))
            )
            : (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontStyle: "italic" }}
              >
                No results found
              </Typography>
            )}
          {canToggleShowMore && (
            <Button
              onClick={toggleShowMore}
              variant="text"
              size="small"
              sx={{
                alignSelf: "flex-start",
                mt: 1,
                color: "primary.main",
                p: 0,
                minWidth: "auto",
                fontWeight: 500,
                fontSize: "0.875rem",
                textTransform: "none",
                border: "none",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline",
                  transform: "none",
                  boxShadow: "none",
                },
                "&:active": { transform: "none", boxShadow: "none" },
              }}
            >
              {isShowingMore ? "Show less" : "Show more"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};
const FilterSlider = ({ title, attribute, min, max, step = 1, icon }) => {
  const theme = useTheme();
  const { currentRefinement, refine, range, start } = useRange({
    attribute,
  });

  const effectiveMin = range?.min ?? min;
  const effectiveMax = range?.max ?? max;

  const [value, setValue] = useState([
    currentRefinement?.min ?? effectiveMin,
    currentRefinement?.max ?? effectiveMax,
  ]);

  useEffect(() => {
    setValue([
      currentRefinement?.min ?? effectiveMin,
      currentRefinement?.max ?? effectiveMax,
    ]);
  }, [currentRefinement, effectiveMin, effectiveMax]);

  const valuetext = (val) => `${val}`;

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    // Enforce minimum distance between handles
    if (activeThumb === 0) {
      setValue([Math.min(newValue[0], value[1]), value[1]]);
    } else {
      setValue([value[0], Math.max(newValue[1], value[0])]);
    }
  };

  const handleChangeCommitted = (event, newValue) => {
    refine(newValue);
  };

  // Generate marks based on the step value
  const marks = [];
  for (let i = effectiveMin; i <= effectiveMax; i += step) {
    marks.push({ value: i, label: "" });
  }

  const totalMarks = marks.length;
  if (totalMarks <= 5) {
    marks.forEach((mark) => mark.label = mark.value.toString());
  } else {
    const positions = [
      0,
      Math.floor((totalMarks - 1) * 1 / 3),
      Math.floor((totalMarks - 1) * 2 / 3),
      totalMarks - 1,
    ];

    positions.forEach((pos) => {
      marks[pos].label = marks[pos].value.toString();
    });
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="subtitle1"
        fontWeight="bold"
        sx={{ mb: 1.5, color: theme.palette.text.primary }}
      >
        {title}
      </Typography>
      {/* Display the currently selected range */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Selected: {value[0]} - {value[1]}
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        min={effectiveMin}
        max={effectiveMax}
        step={step}
        disableSwap
        marks={marks}
      />
    </Box>
  );
};

const FilterSection = (props) => {
  const { isSlider, ...rest } = props;
  return isSlider ? <FilterSlider {...rest} /> : <FilterList {...rest} />;
};

export default FilterSection;
