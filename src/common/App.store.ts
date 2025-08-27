import { create } from "zustand";
import {
  API_URLS,
  ROUTE_PATHS,
  storedRole,
  storedToken,
  storedUserData,
} from "./App.const";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { apiClient } from "./App.service.ts";

interface Store {
  token: string | null;
  refreshToken: string | null;
  data: Record<string, unknown>;
  isAuthenticated: boolean;
  refreshAccessToken: () => Promise<string | null>;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  clearTokens: () => void;
  setData: (key: string, value: unknown) => void;
  clearData: (key: string) => void;
}

interface RefreshResponse {
  message: string;
  timestamp: string;
  data: {
    accessToken: string;
    refreshToken?: string;
  };
}

// Storage Utils
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key: string, value: unknown): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
};

// Token Utils
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  const role = storage.get("role", null);
  if (role === "KEYCLOAK_USER") {
    return true; // Keycloak will handle token expiration
  }
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.exp ? decoded.exp * 1000 > Date.now() + 5000 : false;
  } catch (error) {
    console.error("Token decoding failed:", error);
    return false;
  }
};

let refreshInProgress = false;
let refreshQueue: Array<{
  resolve: (token: string | null) => void;
  reject: () => void;
}> = [];
// Store Implementation
export const useStore = create<Store>((set) => ({
  token: storage.get<string | null>("token", storedToken),
  refreshToken: storage.get<string | null>("refreshToken", null),
  isAuthenticated: isTokenValid(storage.get<string | null>("token", null)),
  data: {
    userData: storage.get("userData", storedUserData),
    role: storage.get("role", storedRole),
  },

  refreshAccessToken: async () => {
    // Return existing token if refresh is already in progress
    if (refreshInProgress) {
      return new Promise<string | null>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
    }
    refreshInProgress = true;

    const refreshToken = storage.get<string | null>("refreshToken", null);
    if (!refreshToken) {
      refreshInProgress = false;
      return null;
    }

    try {
      const response = await apiClient.post<RefreshResponse>(
        API_URLS.AUTH_TOKEN_REFRESH,
        { refreshToken },
      );

      // Add this check to handle 401 responses
      if (response.status === 401) {
        throw new Error("Refresh token rejected by server");
      }
      const { data } = response.data;
      if (!data?.accessToken) throw new Error("Invalid refresh response");

      storage.set("token", data.accessToken);
      set({ token: data.accessToken, isAuthenticated: true });

      if (data.refreshToken) {
        storage.set("refreshToken", data.refreshToken);
        set({ refreshToken: data.refreshToken });
      }
      // Resolve all queued requests
      refreshQueue.forEach(({ resolve }) => resolve(data.accessToken));
      return data.accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      storage.remove("token");
      storage.remove("refreshToken");
      set({ token: null, refreshToken: null, isAuthenticated: false });
      window.location.href = ROUTE_PATHS.ROOT_ROUTE;
      // Reject all queued requests
      refreshQueue.forEach(({ reject }) => reject());
      return null;
    } finally {
      refreshInProgress = false;
      refreshQueue = [];
    }
  },

  setToken: (token: string) => {
    storage.set("token", token);
    set({ token, isAuthenticated: true });
  },

  setRefreshToken: (refreshToken: string) => {
    storage.set("refreshToken", refreshToken);
    set({ refreshToken });
  },

  clearTokens: () => {
    storage.remove("token");
    storage.remove("refreshToken");
    set({ token: null, refreshToken: null, isAuthenticated: false });
  },

  setData: (key, value) => {
    storage.set(key, value);
    set((state) => ({
      data: { ...state.data, [key]: value },
    }));
  },

  clearData: (key) => {
    storage.remove(key);
    set((state) => ({
      data: { ...state.data, [key]: null },
    }));
  },
}));
