import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Box, Button, Typography } from "@mui/material";
import React, { useRef } from "react";

type DropzoneProps = {
  onFileChange: (file: File) => void;
  accept: string;
  preview?: React.ReactNode;
};

const Dropzone: React.FC<DropzoneProps> = ({
  onFileChange,
  accept,
  preview,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <Box
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      sx={{
        border: "2px dashed #b2dfdb",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        bgcolor: "#fafef8",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Typography variant="body2" sx={{ mb: 1, color: "#888" }}>
        Drag and drop a file here or click
      </Typography>
      <Button
        variant="outlined"
        startIcon={<CloudUploadIcon />}
        component="label"
        sx={{
          color: "#43a047",
          borderColor: "#43a047",
          "&:hover": { borderColor: "#388e3c", background: "#e8f5e9" },
          mb: 1,
        }}
      >
        Upload
        <input
          type="file"
          accept={accept}
          hidden
          ref={inputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileChange(e.target.files[0]);
            }
          }}
        />
      </Button>
      <Typography variant="caption" sx={{ color: "#aaa" }}>
        (Max size upto 10MB)
      </Typography>
      {preview && <Box sx={{ mt: 2 }}>{preview}</Box>}
    </Box>
  );
};

export default Dropzone;
