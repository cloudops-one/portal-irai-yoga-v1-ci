import React, { useEffect, useState } from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

interface SnackBarProps {
  openSnackbar: boolean;
  closeSnackbar: () => void;
  message?: string; //  Custom message
  severity?: "error" | "warning" | "info" | "success"; //  Custom severity
  duration?: number; //  Custom auto-hide duration
}

const SnackBar: React.FC<SnackBarProps> = ({
  openSnackbar,
  closeSnackbar,
  message = "This is a success Alert inside a Snackbar!",
  severity = "info",
  duration = 6000,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(openSnackbar);
  }, [openSnackbar]);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
    closeSnackbar();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      key={"top" + "right"}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackBar;
