import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import { Typography, Button, CircularProgress, Alert } from "@mui/material";
import { logoutFromKeycloak } from "../keycloak";
import { KEYCLOAK_USER, LOCAL_STORAGE_KEYS } from "../common/App.const";

interface LayoutModalProps {
  open: boolean;
  handleClose: () => void;
  handleSignOutConfirmation: () => Promise<void>;
  loading?: boolean;
}

const LayoutModal: React.FC<LayoutModalProps> = ({
  open,
  handleClose,
  handleSignOutConfirmation,
  loading = false,
}) => {
  const storedRole = localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE);
  const role = storedRole ? JSON.parse(storedRole) : null;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsProcessing(true);
    setError(null);
    console.log(role, "rolee");
    console.log(KEYCLOAK_USER, "KEYCLOAK_USER");
    try {
      if (role === KEYCLOAK_USER) {
        await logoutFromKeycloak();
      } else {
        await handleSignOutConfirmation();
      }
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleModalClose = () => {
    if (!isProcessing) {
      handleClose();
      setError(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleModalClose}
      className="!flex !items-center !justify-center"
      disableEscapeKeyDown={isProcessing}
    >
      <div className="p-8 rounded-lg shadow-lg overflow-y-auto m-4 bg-white flex flex-col justify-center w-[80vw] md:w-[50vw] lg:w-100 items-center">
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{ mb: 2, textAlign: "center" }}
        >
          Are you sure you want to Sign Out?
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <div className="flex flex-row justify-around items-center w-full">
          <Button
            size="large"
            disabled={loading || isProcessing}
            onClick={handleSignOut}
            variant="contained"
            startIcon={isProcessing ? <CircularProgress size={16} /> : null}
            sx={{ minWidth: 140 }}
          >
            {isProcessing ? "Signing Out..." : "Yes, Sign Out"}
          </Button>
          <Button
            variant="text"
            onClick={handleModalClose}
            disabled={isProcessing}
          >
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LayoutModal;
