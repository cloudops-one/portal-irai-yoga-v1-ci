import React from "react";
import Modal from "@mui/material/Modal";
import { Typography, Button } from "@mui/material";
import { useStore } from "../../src/common/App.store";
import { logoutFromKeycloak } from "../keycloak";

interface LayoutModalProps {
  open: boolean;
  handleClose: () => void;
  handleSignOutConfirmation: () => void;
  loading?: boolean;
}

const LayoutModal: React.FC<LayoutModalProps> = ({
  open,
  handleClose,
  handleSignOutConfirmation,
  loading = false,
}) => {
  const role = useStore((state) => state?.data?.role) as string;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="!flex !items-center !justify-center"
    >
      <div className="p-8 rounded-lg shadow-lg overflow-y-auto  m-4 bg-white flex flex-col justify-center w-[80vw] md:w-[50vw] lg:w-100 items-center">
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{ mb: 2 }}
        >
          Are you sure you want to Sign Out?
        </Typography>
        <div className="flex flex-row justify-around items-center w-full">
          <Button
            size="large"
            disabled={loading}
            onClick={
              role === "PORTAL_USER"
                ? handleSignOutConfirmation
                : logoutFromKeycloak
            }
            variant="contained"
          >
            Yes, Sign Out{" "}
          </Button>
          <Button variant="text" onClick={handleClose}>
            No
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LayoutModal;
