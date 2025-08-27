import { Method } from "axios";

export const API_URLS = {
  AUTH_CHECK: "auth/check",
  AUTH_SIGN_IN_EMAIL: "auth/signin/email",
  AUTH_SIGN_IN_MOBILE: "auth/signin/mobile",
  AUTH_TOKEN_REFRESH: "auth/refresh/token",
  AUTH_SIGN_OUT: "auth/signout",
  AUTH_FORGOT_PASSWORD_EMAIL: "auth/forgot/password/email",
  AUTH_FORGOT_PASSWORD_MOBILE: "auth/forgot/password/mobile",
  AUTH_VERIFY_OTP: "auth/verify/otp",
  AUTH_UPDATE_PASSWORD: "auth/update/password",
  DASHBOARD_PORTAL: "dashboard/portal",
  ORGANIZATION: "organization",
  ORGANIZATION_DROPDOWN: "organization/dropdown",
  EVENT: "events",
  EVENT_STATUS: "events/status",
  PRACTICE_CATEGORY: "practice/category",
  PRACTICE: "practice",
  POEM: "poems",
  PRACTICE_CATEGORY_DROPDOWN: "/practice/category/dropdown",
  USER: "users",
  SHORTS: "shorts",
  STORAGE: "storage",
  STORAGE_UPLOAD: "storage/upload",
  SETTING: "setting",
  PROGRAM: "program",
  PROGRAM_SECTION: "program/section",
  PROGRAM_LESSON: "program/section/lesson",
  NEWS: "news",
  ORGANIZATION_DASHBOARD: "organization/dashboard/portal",
  USER_DASHBOARD: "users/dashboard/portal",
  EVENTS_DASHBOARD: "events/dashboard/portal",
  POEMS_DASHBOARD: "poems/dashboard/portal",
  PRACTICE_DASHBOARD: "practice/dashboard/portal",
  PROGRAM_DASHBOARD: "program/dashboard/portal",
  SHORTS_DASHBOARD: "shorts/dashboard/portal",
} as const;

export const API_METHODS: Record<string, Method> = {
  POST: "post",
  PUT: "put",
  GET: "get",
  DELETE: "delete",
};

export const MODULES = {
  DASHBOARD: "Dashboard",
  USER: "User",
  ORGANIZATION: "Organization",
  PRACTICE: "Practice",
  STATUS: "Status",
  EVENT: "Event",
  WISDOM: "Wisdom",
  SHORTS: "Shorts",
  PROGRAM: "Program",
  POEM: "Poem",
  NEWS: "News",
  ONLINE_ORDER: "Online Order",
  SUPPORT: "Support",
  SETTING: "Setting",
  PRACTICE_CATEGORY: "Practice Category",
  STORAGE: "Storage",
  PROFILE: "Profile",
} as const;

export const ROUTE_PATHS = {
  DASHBOARD: "/dashboard",
  USER: "/user",
  ORGANIZATION: "/organization",
  PRACTICE: "/practice",
  STATUS: "/status",
  EVENT: "/event",
  SHORTS: "/shorts",
  PROGRAM: "/program",
  POEM: "/poem",
  NEWS: "/news",
  ONLINE_ORDER: "/online-order",
  SUPPORT: "/support",
  SETTING: "/setting",
  PRACTICE_CATEGORY: "/practice-category",
  STORAGE: "/storage",
  PROFILE: "/profile",
  ROOT_ROUTE: "/",
} as const;

export const SNACKBAR_SEVERITY = {
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  SUCCESS: "success",
} as const;
export type SnackbarSeverity =
  (typeof SNACKBAR_SEVERITY)[keyof typeof SNACKBAR_SEVERITY];

const getLocalStorageItem = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing localStorage item with key "${key}":`, error);
    return null;
  }
};
export const storedToken = localStorage.getItem("token") ?? null;
export const storedUserData = getLocalStorageItem("userData") ?? {};
export const storedRole = getLocalStorageItem("role") ?? null;

export const LOCAL_STORAGE_KEYS = {
  TOKEN: "token",
  ROLE: "role",
  USER_ID: "userId",
  REFRESH_TOKEN: "refreshToken",
};
export const URL_TYPE = [
  { key: "WEBSITE", value: "Website" },
  { key: "FACEBOOK", value: "Facebook" },
  { key: "TWITTER", value: "Twitter" },
  { key: "INSTAGRAM", value: "Instagram" },
  { key: "LINKEDIN", value: "LinkedIn" },
  { key: "YOUTUBE", value: "YouTube" },
  { key: "TELEGRAM", value: "Telegram" },
  { key: "WHATSAPP", value: "WhatsApp" },
  { key: "REGISTRATION_LINK", value: "Registration Link" },
  { key: "OTHER", value: "Other" },
];

export const DEFAULT_SORT_FIELD = "createdAt";
export const DEFAULT_SORT_ORDER = "ASC";

export const FALLBACK_PROFILE =
  "https://irai-yoga-v1.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/default-avatar-profile-icon.webp";
export const FALLBACK_LOGO =
  "https://irai-yoga-v1.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/logo-default.avif";
export const FALLBACK_BANNER =
  "https://irai-yoga-v1.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/event-banner-image-default.jpg";
export const FALLBACK_THUMBNAIL =
  "https://irai-yoga-v1.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/banner-image-default.jpg";
export const FALLBACK_SHORTS_THUMBNAIL =
  "https://irai-yoga-v1.blr1.cdn.digitaloceanspaces.com/irai-yoga-v1-website-public/short-banner-image-default.jpg";

export const KEYCLOAK_USER = "KEYCLOAK_USER";
