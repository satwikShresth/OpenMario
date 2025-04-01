import React, { useState } from 'react';
import { Box, Typography, Checkbox, FormControlLabel, TextField, InputAdornment, Button, Slider } from '@mui/material';
import { useRefinementList, useRange } from 'react-instantsearch';
import { useTheme } from '@mui/material/styles';
import { Search } from 'lucide-react';
import { useAppTheme } from '#/utils';

// RangeSlider component for min/max filtering
const RangeSlider = ({ min, max, step, attribute }) => {
  const { refine, range, start } = useRange({ attribute });

  // Initialize with either the current refinement or the available range from the data
  const [value, setValue] = useState([
    start[0] !== -Infinity ? start[0] : range.min,
    start[1] !== Infinity ? start[1] : range.max
  ]);

  // Use the actual range from the data instead of props
  const actualMin = range.min;
  const actualMax = range.max;
  // Minimum distance between handles
  const minDistance = Math.max(1, (actualMax - actualMin) * 0.05); // 5% of range

  // Format value for aria-valuetext
  const valuetext = (value) => {
    return `${value}`;
  };

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    // Enforce minimum distance between handles
    if (activeThumb === 0) {
      setValue([Math.min(newValue[0], value[1] - minDistance), value[1]]);
    } else {
      setValue([value[0], Math.max(newValue[1], value[0] + minDistance)]);
    }
  };

  // Apply the refinement when the slider interaction ends
  const handleChangeCommitted = (event, newValue) => {
    refine(newValue);
  };

  return (
    <Box sx={{ width: '100%', px: 1 }}>
      <Slider
        value={value}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        min={actualMin}
        max={actualMax}
        step={(actualMax - actualMin) / 100} // Dynamic step based on range
        disableSwap
        marks={[
          { value: actualMin, label: actualMin.toString() },
          { value: actualMax, label: actualMax.toString() }
        ]}
        sx={{
          '& .MuiSlider-rail': {
            height: 8,
            borderRadius: 4,
            border: '2px solid black',
          },
          '& .MuiSlider-track': {
            height: 8,
            borderRadius: 4,
            border: '2px solid black',
          },
          '& .MuiSlider-thumb': {
            width: 20,
            height: 20,
            backgroundColor: 'primary.main',
            border: '2px solid black',
            boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
            '&:hover, &.Mui-focusVisible': {
              boxShadow: '0 0 0 8px rgba(0,0,0,0.1)',
            },
            '&.Mui-active': {
              boxShadow: '0 0 0 12px rgba(0,0,0,0.1)',
            }
          },
          '& .MuiSlider-valueLabel': {
            backgroundColor: 'primary.main',
            border: '2px solid black',
            borderRadius: 1,
            boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
          },
          '& .MuiSlider-mark': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'background.paper',
            border: '1px solid black',
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }
        }}
      />
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 2,
        px: 1
      }}>
        <Typography variant="body2" fontWeight="medium">
          Current: {value[0]} - {value[1]}
        </Typography>
        {(value[0] !== actualMin || value[1] !== actualMax) && (
          <Button
            size="small"
            onClick={() => {
              setValue([actualMin, actualMax]);
              refine([actualMin, actualMax]);
            }}
            sx={{
              fontSize: '0.75rem',
              p: 0,
              minWidth: 'auto',
              fontWeight: 500,
              textTransform: 'none',
              border: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
                transform: 'none',
                boxShadow: 'none',
              }
            }}
          >
            Reset
          </Button>
        )}
      </Box>
    </Box>
  );
}

/**
 * FilterSection component for displaying refinement filters in an e-commerce or search interface
 * Uses MUI components throughout for consistent styling
 * 
 * @param {Object} props Component props
 * @param {string} props.title - The title of the filter section
 * @param {string} props.attribute - The attribute name to filter by
 * @param {boolean} [props.searchable=false] - Whether the filter section is searchable
 * @param {React.ReactElement} [props.icon] - Icon element to display next to the title
 * @param {boolean} [props.isSlider=false] - Whether to display as a slider (future implementation)
 * @param {number} [props.min=0] - Minimum value for slider
 * @param {number} [props.max=100] - Maximum value for slider
 * @param {number} [props.step=1] - Step value for slider
 * @returns {React.ReactElement} The FilterSection component
 */
const FilterSection = ({
  title,
  attribute,
  searchable = false,
  icon,
  isSlider = false,
  min = 0,
  max = 100,
  step = 1
}) => {
  const theme = useTheme();
  const appTheme = useAppTheme();

  // Use the hook instead of the component
  const { items, refine, searchForItems, canToggleShowMore, isShowingMore, toggleShowMore } = useRefinementList({
    attribute,
    limit: 5,
    showMore: true,
    searchable
  });

  return (
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
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 1.5,
          border: '2px solid black',
          boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
        }}
      >
        {isSlider ? (
          <Box sx={{ px: 1, py: 1 }}>
            <RangeSlider min={min} max={max} step={step} attribute={attribute} />
          </Box>
        ) : (
          <>
            {/* Search box if searchable is true */}
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
                      borderRadius: '50px',
                      border: '3px solid black',
                      boxShadow: '0 4px 0 rgba(0,0,0,0.3)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      }
                    }
                  }}
                  variant="outlined"
                />
              </Box>
            )}

            {/* Refinement items */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {items.length > 0 ? (
                items.map(item => (
                  <Box
                    key={item.value}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={item.isRefined}
                          onChange={() => refine(item.value)}
                          sx={{
                            '&.MuiCheckbox-root': {
                              color: 'text.secondary',
                            },
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.25rem',
                            }
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
                        '& .MuiFormControlLabel-label': {
                          fontSize: '0.875rem',
                        }
                      }}
                    />
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: theme.palette.grey[100],
                        color: theme.palette.grey[700],
                      }}
                    >
                      {item.count}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  No results found
                </Typography>
              )}

              {/* Show more button */}
              {canToggleShowMore && (
                <Button
                  onClick={toggleShowMore}
                  variant="text"
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    mt: 1,
                    color: 'primary.main',
                    p: 0,
                    minWidth: 'auto',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                      transform: 'none',
                      boxShadow: 'none',
                    },
                    '&:active': {
                      transform: 'none',
                      boxShadow: 'none',
                    }
                  }}
                >
                  {isShowingMore ? 'Show less' : 'Show more'}
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default FilterSection;
