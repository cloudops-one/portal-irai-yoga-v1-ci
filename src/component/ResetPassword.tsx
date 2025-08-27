import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios, { AxiosError } from "axios";
import { useResetPassword } from "../module/setting/Profile.service";
import { SNACKBAR_SEVERITY, SnackbarSeverity } from "../common/App.const";
import { useUserSignout } from "../module/auth/Auth.service";
import SnackBar from "../component/SnackBar";
interface Props {
  open: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog: React.FC<Props> = ({ open, onClose }) => {
  const { userSignout } = useUserSignout();
  const { resetPwd, isResetPasswordPending } = useResetPassword();
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<SnackbarSeverity>(
    SNACKBAR_SEVERITY.INFO,
  );
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"form" | "success">("form");

  const userId = localStorage.getItem("userId");

  const handleSubmit = () => {
    if (newPw !== confirmPw) {
      setError("New password and confirmation do not match");
      return;
    }
    if (!userId) {
      setError("No user ID found");
      return;
    }
    setError(null);
    resetPwd(
      { userId, oldPassword: btoa(oldPw), newPassword: btoa(newPw) },
      {
        onSuccess: (responseData: { message?: string }) => {
          setSnackbarMessage(
            responseData?.message ?? "Signed out successfully!",
          );
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
          handleClose();
        },
        onError: (err: AxiosError) => {
          let errMsg = err.message; // fallback

          if (axios.isAxiosError(err) && err.response?.data) {
            const data = err.response.data;
            if (
              typeof data === "object" &&
              data !== null &&
              "errors" in data &&
              (data as { errors?: Record<string, string> }).errors?.newPassword
            ) {
              errMsg = (data as { errors?: Record<string, string> }).errors!
                .newPassword;
            } else if (
              typeof data === "object" &&
              data !== null &&
              "errorMessage" in data
            ) {
              errMsg =
                (data as { errorMessage?: string }).errorMessage ?? err.message;
            }
          }
          setSnackbarMessage(errMsg);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
      },
    );
  };

  const handleLogoutChoice = () => {
    if (!userId) {
      onClose();
      return;
    }
    userSignout(
      { userId },
      {
        onSuccess: (responseData: { message?: string }) => {
          setSnackbarMessage(
            responseData?.message ?? "Signed out successfully!",
          );
          setSnackbarSeverity(SNACKBAR_SEVERITY.SUCCESS);
          setOpenSnackbar(true);
        },
        onError: (err: AxiosError) => {
          let errMsg = err.message;
          if (
            err.response &&
            err.response.data &&
            typeof err.response.data === "object" &&
            "errorMessage" in err.response.data
          ) {
            errMsg =
              (err.response.data as { errorMessage?: string }).errorMessage ??
              err.message;
          }
          setSnackbarMessage(errMsg);
          setSnackbarSeverity(SNACKBAR_SEVERITY.ERROR);
          setOpenSnackbar(true);
        },
      },
    );
  };

  const handleClose = () => {
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
    setError(null);
    setStage("form");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {stage === "form" ? "Reset Password" : "Password Reset Successful"}
        </DialogTitle>
        <DialogContent dividers>
          {stage === "form" ? (
            <>
              <TextField
                label="Old Password"
                type={showOld ? "text" : "password"}
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowOld(!showOld)}>
                        {showOld ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="New Password"
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)}>
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error?.includes("uppercase letter and one number") && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <TextField
                label="Confirm New Password"
                type={showConfirm ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error === "New password and confirmation do not match" && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
            </>
          ) : (
            <Typography>
              Your password has been reset successfully.
              <br />
              Do you want to logout and sign in again?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {stage === "form" ? (
            <>
              <Button onClick={handleClose} disabled={isResetPasswordPending}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={
                  !oldPw || !newPw || !confirmPw || isResetPasswordPending
                }
              >
                Submit
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleLogoutChoice()}>Logout</Button>
              <Button onClick={handleClose}>Skip</Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <SnackBar
        openSnackbar={openSnackbar}
        closeSnackbar={() => setOpenSnackbar(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
        duration={3000}
      />
    </>
  );
};
