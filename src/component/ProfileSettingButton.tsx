import { Button, useTheme } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import React from "react";

interface ProfileSettingButtonProps {
  id: string;
  label: string;
  onClick?: () => void;
  handleEndIconClick?: () => void;
  focused?: boolean;
  endIcon?: React.ReactNode;
}

const ProfileSettingButton: React.FC<ProfileSettingButtonProps> = ({
  id,
  label,
  onClick,
  focused = false,
  handleEndIconClick,
  endIcon = <ArrowForwardIosIcon />,
}: ProfileSettingButtonProps) => {
  const theme = useTheme();

  return (
    <Button
      key={id}
      variant="outlined"
      fullWidth
      onClick={onClick}
      className="!mb-4"
      sx={{
        height: 56,
        borderRadius: "8px",
        borderColor: focused
          ? "black"
          : theme?.palette.settingsButton?.borderColor,
        borderWidth: focused ? 2 : 1,
        justifyContent: "space-between",
        color: theme?.palette.settingsButton?.textColor,
        "&:hover": {
          borderColor: theme?.palette.settingsButton?.borderColor,
        },
        "&.Mui-focused": {
          borderColor: theme?.palette.settingsButton?.textColor,
        },
        textTransform: "none",
      }}
    >
      <span>{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEndIconClick?.();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
        aria-label="Icon button"
      >
        {endIcon}
      </button>
    </Button>
  );
};

export default ProfileSettingButton;
