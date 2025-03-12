import { useState } from 'react';
import { useFilterStore } from "#/stores";
import {
  Box,
  Button,
  Popover,
  Typography,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { Share, Copy } from 'lucide-react';

const ShareButton = ({ baseUrl }: { baseUrl: string }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [copied, setCopied] = useState(false);
  const filters = useFilterStore();

  const {
    skip,
    limit,
    company,
    position,
    location,
    year,
    coop_year,
    coop_cycle,
    program_level,
    distinct,
  } = useFilterStore();

  const search = {
    skip,
    limit,
    company,
    position,
    location,
    year,
    coop_year,
    coop_cycle,
    program_level,
    distinct,
  }

  const generateShareableUrl = () => {
    const searchParams = new URLSearchParams();

    Object.entries(search).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Arrays and objects need to be JSON stringified first
        if (typeof value === 'object') {
          searchParams.append(key, JSON.stringify(value));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    return `${baseUrl}?${searchParams.toString().replace(/\+/g, ' ')}`;
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareableUrl());
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'share-popover' : undefined;
  const shareableUrl = generateShareableUrl();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<Share size={18} />}
        onClick={handleClick}
      >
        Share
      </Button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Copy shareable link parameters
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              value={shareableUrl}
              InputProps={{
                readOnly: true,
              }}
              sx={{ mr: 1 }}
            />

            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton onClick={handleCopy} color={copied ? "success" : "primary"}>
                <Copy />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default ShareButton;
