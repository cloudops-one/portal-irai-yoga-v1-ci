import Keycloak from "keycloak-js";
import { LOCAL_STORAGE_KEYS } from "./common/App.const";

const keycloak = new Keycloak({
  url: process.env.KEYCLOAK_URL ?? "https://keycloak.cloudops.terv.pro/auth",
  realm: process.env.KEYCLOAK_REALM ?? "terv-pro-realm",
  clientId:
    process.env.KEYCLOAK_CLIENT_ID ?? "irai-yoga-v1-service-account-client",
});
export const initializeKeycloak = async (): Promise<boolean> => {
  try {
    const authenticated = await keycloak.init({
      onLoad: "login-required",
      checkLoginIframe: false,
      pkceMethod: "S256",
    });
    return authenticated;
  } catch (error) {
    console.error("Keycloak initialization failed:", error);
    return false;
  }
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
      keycloak.logout();
    });
};

export default keycloak;

export const logoutFromKeycloak = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.ROLE);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_ID);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  keycloak.logout();
};
