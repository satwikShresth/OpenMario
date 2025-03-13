import React from 'react';
import { Button, Box } from '@mui/material';
import { NotepadTextDashed, Save, TimerReset, X } from 'lucide-react';

type FormActionsProps = {
  onCancel?: () => void;
  isEditing: boolean;
};

export const FormActions: React.FC<FormActionsProps> = ({ onCancel, onDraft, isEditing }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
    {onCancel && (
      <Button
        variant="outlined"
        onClick={onCancel}
        startIcon={<X size={18} />}
      >
        Cancel
      </Button>
    )}

    {onDraft && (
      <Button
        variant="outlined"
        onClick={onDraft}
        startIcon={<NotepadTextDashed size={18} />}
      >
        Draft & Return
      </Button>
    )}
    <Button
      type="submit"
      variant="contained"
      color="primary"
      startIcon={<Save size={18} />}
    >
      {isEditing ? 'Update' : 'Save'}
    </Button>
  </Box>
);
