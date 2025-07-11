export const handleShare = (str: string, alert) => {
  navigator.clipboard
    .writeText(str)
    .then(() => {
      alert("Link copied to clipboard!", { variant: "success" });
    })
    .catch((error) => {
      alert("Failed to copy link to clipboard!", {
        variant: "error",
      });
      console.error("Failed to copy: ", error);
    });
};
