import { Box } from "@mui/material";
import { useState, useEffect } from "react";

const ScrollContainer = ({ children }: { children: React.ReactNode }) => {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (scrolling) {
      timeout = setTimeout(() => setScrolling(false), 1000); // hide after 1s of no scroll
    }
    return () => clearTimeout(timeout);
  }, [scrolling]);

  return (
    <Box
      className="flex-1 overflow-y-auto h-screen"
      onScroll={() => setScrolling(true)}
      sx={{
        flexGrow: 1,
        scrollbarGutter: "stable",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "4px",
          transition: "width 0.3s ease",
        },
        "&::-webkit-scrollbar-thumb": {
          background: scrolling ? "#61B15A" : "transparent",
          borderRadius: "10px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#4a9448",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default ScrollContainer;
