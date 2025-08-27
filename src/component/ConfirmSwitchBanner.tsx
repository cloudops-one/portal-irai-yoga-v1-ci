import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

const ConfirmSwitchBanner = ({
  open,
  onClose,
  onConfirm,
  currentType,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentType: "url" | "file";
}) => {
  const messages = {
    file: {
      title: "Switch to File Upload",
      content:
        "This will remove the existing external URL. Are you sure you want to upload a file instead?",
    },
    url: {
      title: "Switch to External URL",
      content:
        "This will remove the uploaded file. Are you sure you want to use an external URL instead?",
    },
  };

  const { title, content } = messages[currentType];

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Confirm Switch
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmSwitchBanner;
