import React, { useEffect, useState } from "react";
import { AppBar, IconButton, Toolbar, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import Avatar from "@mui/material/Avatar";
import { Link } from "react-router-dom";
import { useGetProfilePicture } from "../common/App.service";
interface LayoutHeaderProps {
  isMobile: boolean;
  sidebarWidth: number;
  handleDrawerToggle: () => void;
}

const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  isMobile,
  sidebarWidth,
  handleDrawerToggle,
}) => {
  const theme = useTheme();

  const { imageUrl } = useGetProfilePicture();
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  interface ProfilePictureResponse {
    data: {
      userIconStorageUrl: string;
    };
  }

  useEffect(() => {
    imageUrl(
      {},
      {
        onSuccess: (response: ProfilePictureResponse) => {
          setProfilePicUrl(response.data.userIconStorageUrl);
        },
      },
    );
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
        ml: isMobile ? 0 : `${sidebarWidth}px`,
        backgroundColor: theme?.palette?.sideNavigation?.headerBarBg,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon
              sx={{ color: theme?.palette?.sideNavigation?.headerMenuIcon }}
            />
          </IconButton>
        )}
        <div className="w-full flex flex-row justify-end items-center">
          <div className="flex  gap-5 items-center pr-5">
            <CampaignOutlinedIcon
              sx={{
                color:
                  theme?.palette?.sideNavigation?.headerAnnouncementIconClr,
                width: 34,
                height: 34,
              }}
            />
            <Link to="/profile">
              <Avatar
                src={profilePicUrl || undefined}
                alt="User Avatar"
                sx={{ width: 34, height: 34 }}
              >
                {!profilePicUrl && "U"}
              </Avatar>
            </Link>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default LayoutHeader;
