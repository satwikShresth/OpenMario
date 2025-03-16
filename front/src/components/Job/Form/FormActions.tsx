import React from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { Save, FileText, ArrowLeft, Trash2 } from 'lucide-react';

export const FormActions: React.FC<{
  onCancel?: () => void;
  onDraft?: () => void;
  isEditing?: boolean;
  isSubmitting?: boolean;
  hasErrors?: boolean;
  isDraft?: boolean;
  onCompleteDraft?: () => void;
  onDelete?: () => void;
}> = ({
  onCancel,
  onDraft,
  isEditing = false,
  isSubmitting = false,
  hasErrors = false,
  isDraft = false,
  onCompleteDraft,
  onDelete
}) => {
    return (
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          {onCancel && (
            <Button
              onClick={onCancel}
              startIcon={<ArrowLeft size={18} />}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
          )}

          {onDelete && (
            <Button
              onClick={onDelete}
              startIcon={<Trash2 size={18} />}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          )}
        </Box>

        <Box>
          {onDraft && (
            <Button
              onClick={onDraft}
              startIcon={<FileText size={18} />}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Save as Draft
            </Button>
          )}

          {isDraft && onCompleteDraft && (
            <Button
              onClick={onCompleteDraft}
              variant="contained"
              color="secondary"
              sx={{ mr: 2 }}
            >
              Complete Draft
            </Button>
          )}

          <Tooltip title={hasErrors ? "Please fix form errors before submitting" : ""}>
            <span>
              <Button
                type="submit"
                startIcon={<Save size={18} />}
                variant="contained"
                disabled={isSubmitting || hasErrors}
              >
                {isSubmitting ? "Submitting..." : isEditing ? "Update" : "Submit"}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
    );
  };
