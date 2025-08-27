import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import theme from "../common/App.theme";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ShortDeleteDialog: React.FC<Props> = ({ open, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this item?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            color: theme.palette.sideNavigation.text,
            bgcolor: theme.palette.badge.error,
          }}
          autoFocus
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShortDeleteDialog;
