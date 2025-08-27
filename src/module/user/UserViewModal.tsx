import {
  Modal,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { UserAoiType } from "./User.type";

interface UserViewModalProps {
  userAoi: UserAoiType[] | null;
  open: boolean;
  onClose: () => void;
}

export const UserViewModal = ({
  userAoi,
  open,
  onClose,
}: UserViewModalProps) => {
  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: 800,
    maxHeight: "80vh",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    overflowY: "auto",
    borderRadius: 2,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="user-aoi-modal-title"
      aria-describedby="user-aoi-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="user-aoi-modal-title"
          variant="h6"
          component="h2"
          mb={2}
        >
          User Areas of Interest
        </Typography>

        {userAoi && userAoi.length > 0 ? (
          userAoi.map((aoi, index) => (
            <Accordion key={index} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">{aoi.questionName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" mb={1}>
                  <strong>Question Type:</strong> {aoi.optionType}
                </Typography>
                <Typography variant="body1" mb={2}>
                  <strong>Status:</strong> {aoi.status}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Selected Options:
                </Typography>
                {aoi.options.length > 0 ? (
                  <ul style={{ marginTop: 0, paddingLeft: 20 }}>
                    {aoi.options
                      .filter((option) => option.selected)
                      .map((option, optIndex) => (
                        <li key={optIndex}>
                          <Typography variant="body2">
                            {option.value}
                          </Typography>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No options selected
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography variant="body1" color="textSecondary">
            No areas of interest data available
          </Typography>
        )}
      </Box>
    </Modal>
  );
};
