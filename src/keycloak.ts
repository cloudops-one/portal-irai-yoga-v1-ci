import Keycloak from "keycloak-js";
import { LOCAL_STORAGE_KEYS } from "./common/App.const";

const keycloak = new Keycloak({
  url: process.env.KEYCLOAK_URL ?? "https://keycloak.cloudops.terv.pro/auth",
  realm: process.env.KEYCLOAK_REALM ?? "terv-pro-realm",
  clientId:
    process.env.KEYCLOAK_CLIENT_ID ?? "irai-yoga-v1-service-account-client",
});

let isKeycloakInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

export const initializeKeycloak = async (
  onLoad: "login-required" | "check-sso" = "check-sso",
): Promise<boolean> => {
  // If already initialized, return the authenticated status
  if (isKeycloakInitialized) {
    console.log("Keycloak already initialized, returning authenticated status");
    return keycloak.authenticated ?? false;
  }

  // If initialization is in progress, return the existing promise
  if (initializationPromise) {
    console.log("Keycloak initialization in progress, waiting...");
    return initializationPromise;
  }

  // Start new initialization
  initializationPromise = (async () => {
    try {
      console.log("Initializing Keycloak with onLoad:", onLoad);
      const authenticated = await keycloak.init({
        onLoad,
        checkLoginIframe: false,
        pkceMethod: "S256",
      });
      isKeycloakInitialized = true;
      console.log(
        "Keycloak initialized successfully, authenticated:",
        authenticated,
      );
      return authenticated;
    } catch (error) {
      console.error("Keycloak initialization failed:", error);
      initializationPromise = null; // Reset on error to allow retry
      return false;
    }
  })();

  return initializationPromise;
};

// Handle token expiration
keycloak.onTokenExpired = () => {
  keycloak
    .updateToken(30)
    .then((refreshed) => {
      if (refreshed) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, keycloak.token ?? "");
      }
    })
    .catch(() => {
      console.error("Failed to refresh token");
      keycloak?.logout();
    });
};

export default keycloak;

export const logoutFromKeycloak = async () => {
  // Clear localStorage first
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_ID);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);

  try {
    if (isKeycloakInitialized && keycloak.authenticated) {
      // This will log out from Keycloak server and redirect back
      await keycloak.logout({
        redirectUri: `${window.location.origin}/`,
      });
    } else {
      console.log("Keycloak not authenticated, redirecting to home");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Keycloak logout error:", error);
    // Fallback to manual redirect
    window.location.href = "/";
  }
};

// Export helper to check if keycloak is initialized
export const isKeycloakReady = () => isKeycloakInitialized;
