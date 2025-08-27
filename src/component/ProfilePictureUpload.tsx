import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Box, Typography } from "@mui/material";
import { useFileUpload } from "../component/ProfilefileUpload.service";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";

interface ProfilePictureUploadProps {
  onUploadSuccess: (fileId: string | null, duartionMs?: number) => void;
  moduleType: string;
  initialPreviewUrl?: string;
  existingFileId?: string;
  disabled?: boolean;
  viewMode?: boolean;
  onClear?: () => void;
  fallbackImageUrl?: string;
  width?: number | string;
  height?: number | string;
}

interface FileUploadResponse {
  message: string;
  timestamp: string;
  data: {
    storageId: string;
  };
}

const getFileTypeFromUrl = (url: string) => {
  if (!url) return "unknown";

  const extension = url.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return "image";
  } else if (["mp3", "wav", "ogg", "m4a"].includes(extension)) {
    return "audio";
  } else if (["mp4", "webm", "mov", "avi"].includes(extension)) {
    return "video";
  }

  return "unknown";
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  onUploadSuccess,
  moduleType,
  initialPreviewUrl,
  disabled,
  viewMode,
  fallbackImageUrl,
  width = "100%",
  height = "100%",
}) => {
  const { uploadFile, isUploading } = useFileUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<
    "image" | "audio" | "video" | "unknown"
  >("unknown");
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (initialPreviewUrl) {
      setPreviewUrl(initialPreviewUrl);
      setFileType(getFileTypeFromUrl(initialPreviewUrl));
    }
  }, [initialPreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrored(false);
    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);

    // Determine file type from the actual file object
    if (file.type.startsWith("image/")) {
      setFileType("image");
    } else if (file.type.startsWith("audio/")) {
      setFileType("audio");
    } else if (file.type.startsWith("video/")) {
      setFileType("video");
    } else {
      setFileType("unknown");
    }

    // Handle media duration for audio/video
    if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
      const media = document.createElement(
        file.type.startsWith("audio/") ? "audio" : "video",
      );

      if (file.name.toLowerCase().endsWith(".mkv")) {
        alert("MKV files are not allowed");
        e.target.value = "";
        return;
      }

      media.src = fileUrl;
      media.onloadedmetadata = () => {
        const durationMs = Math.round(media.duration * 1000);
        uploadMediaFile(file, durationMs);
      };
      return;
    }

    // For images and other files
    uploadMediaFile(file);
  };

  const uploadMediaFile = (file: File, durationMs?: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("moduleType", moduleType);
    const data: Record<string, unknown> = formData as unknown as Record<
      string,
      unknown
    >;
    uploadFile(data, {
      onSuccess: (data: Record<string, unknown>) => {
        const response = data as unknown as FileUploadResponse;
        const fileId = response?.data?.storageId ?? null;
        onUploadSuccess(fileId, durationMs);
      },
      onError: (err: unknown) => {
        console.error("File upload failed", err);
        onUploadSuccess(null);
      },
    });
  };

  const containerStyle = {
    position: "relative",
    width: width,
    height: height,
    overflow: "hidden",
    borderRadius: "8px",
    backgroundColor: "#f5f5f5",
    display: "flex",
    justifyContent: "flex-start",
  };

  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    borderRadius: "8px",
    padding: "2px",
  };

  const renderPreview = () => {
    if (!previewUrl || errored) {
      return renderFallback();
    }

    switch (fileType) {
      case "image":
        return (
          <Box sx={containerStyle}>
            <img
              src={previewUrl}
              alt="Preview"
              onError={() => setErrored(true)}
              style={imageStyle}
            />
          </Box>
        );
      case "video":
        return (
          <Box sx={containerStyle}>
            <video
              controls
              src={previewUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          </Box>
        );
      case "audio":
        return (
          <Box
            sx={{
              ...containerStyle,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <audio controls style={{ width: "80%" }}>
              <source
                src={previewUrl}
                type={`audio/${previewUrl.split(".").pop()?.split("?")[0]}`}
              />
              Your browser does not support the audio element.
            </audio>
          </Box>
        );
      default:
        return renderFallback();
    }
  };

  const renderFallback = () => {
    if (fallbackImageUrl) {
      return (
        <Box sx={containerStyle}>
          <img src={fallbackImageUrl} alt="Fallback" style={imageStyle} />
        </Box>
      );
    }
    return (
      <Box
        sx={{
          ...containerStyle,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BrokenImageIcon sx={{ fontSize: 60, color: "#bdbdbd" }} />
        <Typography variant="body2" color="textSecondary">
          No Media
        </Typography>
      </Box>
    );
  };

  const ACCEPTED_MEDIA_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/m4a",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
  ].join(",");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        mt: 1,
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        {renderPreview()}
      </Box>
      {!viewMode && (
        <Button
          variant="outlined"
          component="label"
          disabled={isUploading || disabled}
          startIcon={isUploading && <CircularProgress size={16} />}
        >
          {isUploading ? "Uploading..." : "Choose File"}
          <input
            type="file"
            accept={ACCEPTED_MEDIA_TYPES}
            hidden
            onChange={handleFileChange}
            data-testid="orgLogoStorageUrl"
          />
        </Button>
      )}
    </Box>
  );
};
