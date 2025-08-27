import {
  useQuery,
  useMutation,
  UseMutationResult,
  UseQueryResult,
} from "@tanstack/react-query";
import axios, { AxiosError, AxiosInstance, Method } from "axios";
import axiosRetry from "axios-retry";
import { isTokenValid, useStore } from "./App.store";
import { SettingItem, TagResponse } from "./App.type";
import { API_METHODS, API_URLS, ROUTE_PATHS } from "./App.const";
interface UseApiProps {
  url?: string;
  method?: Method;
  body?: unknown;
  params?: ((payload: Record<string, unknown>) => object) | object;
  getUrl?: (payload: Record<string, unknown>) => string;
  enabled?: boolean;
}

// Environment configuration
const API_CONFIG = {
  BASE_URL: process.env.VITE_API_BASE_URL ?? "<CONFIGURE_VITE_API_BASE_URL>",
  // TIMEOUT: 100000,
  RETRY_ATTEMPTS: 3,
  STALE_TIME: 5 * 60 * 1000,
} as const;

// Create API client with configuration
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: { "Content-Type": "application/json" },
  // timeout: API_CONFIG.TIMEOUT,
  withCredentials: true,
});

// Enhanced retry configuration
axiosRetry(apiClient, {
  retries: API_CONFIG.RETRY_ATTEMPTS,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => {
    const status = error.response?.status;
    return !status || status >= 500 || error.code === "ECONNABORTED";
  },
});

// Improved request interceptor
apiClient.interceptors.request.use(async (config) => {
  if (config.url?.includes(API_URLS.AUTH_TOKEN_REFRESH)) {
    return config;
  }
  const token = useStore.getState().token;

  if (token && !isTokenValid(token)) {
    try {
      const newToken = await useStore.getState().refreshAccessToken();
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      useStore.getState().clearTokens();
      window.location.href = ROUTE_PATHS.ROOT_ROUTE;
      return Promise.reject(new Error("Redirecting to login"));
    }
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (originalRequest.url?.includes(API_URLS.AUTH_TOKEN_REFRESH)) {
      console.error("Refresh token rejected by server");
      useStore.getState().clearTokens();
      window.location.href = ROUTE_PATHS.ROOT_ROUTE;
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await useStore.getState().refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        useStore.getState().clearTokens();
        window.location.href = ROUTE_PATHS.ROOT_ROUTE;
        return Promise.reject(refreshError);
      }
    }

    if (status === 403) {
      useStore.getState().clearTokens();
      window.location.href = ROUTE_PATHS.ROOT_ROUTE;
    }

    return Promise.reject(error);
  },
);

// Utility function for handling URL parameters
const buildUrlWithParams = (baseUrl: string, params: object): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) {
      queryParams.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value),
      );
    }
  });
  return `${baseUrl}?${queryParams.toString()}`;
};

// Improved GET hook
export const useApi = <T = Record<string, unknown>>({
  url,
  params,
  enabled,
}: UseApiProps): UseQueryResult<T, AxiosError> => {
  const fetchData = async (): Promise<T> => {
    if (!url) throw new Error("URL is required");
    const { data } = await apiClient.get<T>(url, { params });
    return data;
  };

  return useQuery<T, AxiosError>({
    queryKey: [url, params],
    queryFn: fetchData,
    enabled,
    staleTime: API_CONFIG.STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

// Enhanced mutation hook
export const useMutationApi = <
  TData = Record<string, unknown>,
  TError = AxiosError,
  TVariables extends Record<string, unknown> = Record<string, unknown>,
  TContext = unknown,
>({
  url,
  getUrl,
  method = "post",
  params,
}: UseApiProps): UseMutationResult<TData, TError, TVariables, TContext> => {
  const mutationFn = async (payload: TVariables): Promise<TData> => {
    const finalUrl = getUrl?.(payload) || `${API_CONFIG.BASE_URL}${url}`;
    const urlWithParams = params
      ? buildUrlWithParams(
          finalUrl,
          typeof params === "function" ? params(payload) : params,
        )
      : finalUrl;
    const { data } = await apiClient({
      method,
      url: urlWithParams,
      data: payload,
      headers:
        payload instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : { "Content-Type": "application/json" },
    });
    return data;
  };

  return useMutation<TData, TError, TVariables, TContext>({ mutationFn });
};

interface SettingResponse {
  data: {
    settingValue: SettingItem[];
  };
}

export const fetchSettings = async (
  settingName: string,
): Promise<SettingItem[]> => {
  const response = await apiClient.get<SettingResponse>(
    `${API_URLS.SETTING}/${settingName}`,
  );
  return response.data.data.settingValue || [];
};

export const useGetSettingsQuery = (settingName: string) => {
  return useQuery<SettingItem[], AxiosError>({
    queryKey: ["settings", settingName],
    queryFn: () => fetchSettings(settingName),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};
export const useGetSetting = () => {
  const { mutate: getSetting, isPending: isGetSettingPending } =
    useMutationApi<SettingResponse>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { settingName } = data as { settingName: string };
        return `${API_URLS.SETTING}/${settingName}`;
      },
    });

  return { getSetting, isGetSettingPending };
};

export const useGetTag = () => {
  const { mutate: getTags, isPending: isGetTagsPending } =
    useMutationApi<TagResponse>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { settingName } = data as { settingName: string };
        return `${API_URLS.SETTING}/${settingName}`;
      },
    });

  return { getTags, isGetTagsPending };
};

interface ProfilePictureResponse {
  data: {
    userIconStorageUrl: string;
  };
}

export const useGetProfilePicture = () => {
  const { mutate: imageUrl, isPending } =
    useMutationApi<ProfilePictureResponse>({
      method: API_METHODS.GET,
      getUrl: () => {
        return `${API_URLS.USER}/profile/picture`;
      },
    });
  return { imageUrl, isPending };
};
