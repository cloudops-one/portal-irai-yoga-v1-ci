import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Stack, Box } from "@mui/material";
import { useFileUpload } from "../component/ProfilefileUpload.service";
interface SettingProfilePictureUploadProps {
  onUploadSuccess: (fileId: string | null, duartionMs?: number) => void;
  moduleType: string;
  initialPreviewUrl?: string;
  existingFileId?: string;
  disabled?: boolean;
  viewMode?: boolean;
  onClear?: () => void;
}

interface FileUploadResponse {
  message: string;
  timestamp: string;
  data: {
    storageId: string;
  };
}

export const SettingProfilePictureUpload: React.FC<
  SettingProfilePictureUploadProps
> = ({
  onUploadSuccess,
  moduleType,
  initialPreviewUrl,
  existingFileId,
  disabled,
  viewMode,
}) => {
  const { uploadFile, isUploading } = useFileUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!previewUrl && initialPreviewUrl) {
      fetch(initialPreviewUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          setFileType(blob.type);
        })
        .catch((err) => {
          console.warn("Could not preview file:", err);
          setPreviewUrl(null);
        });
    }
  }, [initialPreviewUrl, previewUrl, existingFileId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrored(false);
    const fileUrl = URL.createObjectURL(file);

    setPreviewUrl(fileUrl);
    setFileType(file.type);
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
        onUploadSuccess(fileId);
      },
      onError: (err: unknown) => {
        console.error("File upload failed", err);
        onUploadSuccess(null);
      },
    });
  };

  const renderPreview = () => {
    if (fileType?.startsWith("image/") && previewUrl) {
      return (
        <img
          src={errored ? "" : previewUrl}
          alt="Preview"
          onError={() => setErrored(true)}
          style={{
            width: 200,
            height: 200,
            objectFit: "cover",
            borderRadius: 200,
          }}
        />
      );
    }
  };

  return (
    <Stack spacing={2} alignItems="start" className="mt-2">
      <Box
        sx={{
          width: "20%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "left",
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
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
      )}
    </Stack>
  );
};
