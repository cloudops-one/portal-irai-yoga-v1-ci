import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

export default function Loading() {
  const theme = useTheme();
  return (
    <Box className=" !flex !items-center !justify-center !h-screen">
      <CircularProgress
        sx={{ color: theme.palette.loader.default }}
        size="3rem"
      />
    </Box>
  );
}
