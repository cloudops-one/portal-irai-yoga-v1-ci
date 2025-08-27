import { Audiotrack } from "@mui/icons-material";
import { Box } from "@mui/material";

// Detect social media platforms
const getPlatform = (url: string) => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("facebook.com")) return "facebook";
  return null;
};

// Detect vertical videos (9:16 aspect ratio)
const isVerticalVideo = (url: string) => {
  // Could be extended to detect actual video dimensions via API
  return url.includes("vertical=true") || url.includes("ratio=9x16");
};

const getFileType = (url: string) => {
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

export const MediaPreview = ({ url }: { url: string }) => {
  const platform = getPlatform(url);
  const fileType = getFileType(url);
  const isVertical = isVerticalVideo(url);

  // Aspect ratio handling
  const getAspectRatio = () => {
    if (platform === "instagram") return "9/16";
    if (platform === "youtube") return "16/9";
    if (isVertical) return "9/16";
    return "auto";
  };

  const aspectRatio = getAspectRatio();

  if (fileType === "image") {
    return (
      <Box
        sx={{
          width: "100%",
          maxHeight: "80vh",
          aspectRatio: aspectRatio,
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <img
          src={url}
          alt="Media content"
          style={{
            objectFit: "contain",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </Box>
    );
  } else if (fileType === "audio") {
    function getFileExtension(url: string) {
      const match = url.split(".").pop()?.split("?")[0]?.toLowerCase();
      return match ?? "";
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          p: 2,
        }}
      >
        <Audiotrack sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
        <audio controls style={{ width: "100%" }}>
          <source src={url} type={`audio/${getFileExtension(url)}`} />
          Your browser does not support the audio element.
        </audio>
      </Box>
    );
  } else if (fileType === "video") {
    return (
      <Box
        sx={{
          width: "100%",
          maxHeight: "80vh",
          aspectRatio: aspectRatio,
          backgroundColor: "#000",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <video
          controls
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        >
          <source
            src={url}
            type={`video/${url.split(".").pop()?.split("?")[0]}`}
          />
          Your browser doesn&apos;t support videos
        </video>
      </Box>
    );
  } else {
    // Handle embeds (Instagram/Facebook/YouTube)
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: aspectRatio,
          maxHeight: "80vh",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <iframe
          src={url}
          title="Embedded content"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Box>
    );
  }
};
