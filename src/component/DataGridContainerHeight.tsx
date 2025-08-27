import React from "react";
import { Box, BoxProps } from "@mui/material";

interface FullHeightDataGridContainerProps extends BoxProps {
  headerOffset?: number;
}

const FullHeightDataGridContainer: React.FC<
  FullHeightDataGridContainerProps
> = ({ children, headerOffset = 72, ...props }) => {
  return (
    <Box
      sx={{
        height: `calc(100vh - ${headerOffset}px)`,
        backgroundColor: "white",
        ...props.sx,
      }}
      className="my-1 mx-1 p-1 h-full"
      {...props}
    >
      {children}
    </Box>
  );
};

export default FullHeightDataGridContainer;
