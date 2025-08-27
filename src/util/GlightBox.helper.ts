import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.min.css";

declare module "glightbox" {
  interface Options {
    touchNavigation?: boolean;
    loop?: boolean;
    openEffect?: string;
    closeEffect?: string;
    slideEffect?: string;
    closeOnOutsideClick?: boolean;
    autoplayVideos?: boolean;
    fullscreen?: {
      enabled?: boolean;
      iosNative?: boolean;
    };
    plyr?: {
      css?: string;
      js?: string;
      config?: {
        ratio?: string;
        muted?: boolean;
        hideControls?: boolean;
        controls?: string[];
        settings?: string[];
        blankVideo?: string;
      };
    };
  }
}
export const generatePreview = (file: File): Promise<string> => {
  const isVideo = file.type.startsWith("video/");
  if (isVideo) {
    return Promise.resolve(URL.createObjectURL(file));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const triggerLightbox = (src: string, title = "Preview") => {
  const anchor = document.createElement("a");
  anchor.href = src;

  anchor.className = "glightbox";

  const isVideo =
    src.startsWith("blob:") ||
    src.startsWith("data:video") ||
    [".mp4", ".webm", ".ogv"].some((ext) => src.toLowerCase().endsWith(ext));

  // Set GLightbox data attributes
  const lightboxType = isVideo ? "video" : "image";
  anchor.dataset.glightbox = `title: ${title}; type: ${lightboxType}`;

  if (isVideo) {
    anchor.dataset.width = "100%";
    anchor.dataset.height = "100%";
    anchor.dataset.autoplay = "true";
  }

  document.body.appendChild(anchor);

  // Initialize GLightbox with video-specific settings
  const lightbox = GLightbox({
    elements: [
      {
        href: src,
        type: isVideo ? "video" : "image",
      },
    ],
    autoplayVideos: false,
    touchNavigation: true,
    loop: true,
    openEffect: "zoom",
    closeEffect: "zoom",
    slideEffect: "slide",
    closeOnOutsideClick: true,
    fullscreen: {
      enabled: true,
      iosNative: false,
    },
    plyr: {
      css: "https://cdn.plyr.io/3.7.8/plyr.css",
      js: "https://cdn.plyr.io/3.7.8/plyr.js",
      config: {
        ratio: isVideo ? "16:9" : "1:1",
        muted: false,
        hideControls: false,
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
        ],
        settings: ["quality", "speed", "loop"],
        blankVideo: "https://cdn.plyr.io/static/blank.mp4",
      },
    },
  });

  lightbox.open();

  // Cleanup function
  const cleanup = () => {
    setTimeout(() => {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
      lightbox.destroy();
    }, 5000); // Small delay to ensure lightbox is closed
  };

  cleanup();

  // Since 'on' is not available, attach cleanup after a timeout or when destroy is called
  // Optionally, you can call cleanup manually after closing the lightbox elsewhere if needed

  return lightbox;
};
