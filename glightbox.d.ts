declare module "glightbox" {
  interface LightboxElement {
    href: string;
    type: string;
    content?: string;
  }

  interface Options {
    elements: LightboxElement[]; // Correctly define the elements property
    autoplayVideos?: boolean;
    // Add other GLightbox options here if needed
  }

  export default function GLightbox(options: Options): {
    open: () => void;
    destroy: () => void;
  };
}
