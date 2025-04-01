import React, { useState } from "react";
import { useFilterStore } from "#/stores/useFilterStore";
import { Share } from "lucide-react";
import { Box, Button } from "@mui/material";

const ShareFilterButton: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const generateShareableUrl = useFilterStore((state) =>
    state.generateShareableUrl
  );

  const handleShare = async () => {
    const url = generateShareableUrl();

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL: ", err);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<Share size={18} />}
        onClick={handleShare}
      >
        {copied ? "Copied to clipboard!" : "Share"}
      </Button>
    </Box>
  );
};

export default ShareFilterButton;
