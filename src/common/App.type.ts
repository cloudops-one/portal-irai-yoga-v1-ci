export interface AppResponse<T> extends Promise<T> {
  pageable: {
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    sortBy?: string;
    sortDirection?: string;
  };
  data: T;
  message?: string;
  errorMessage?: string;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface SettingItem {
  key: string;
  value: string;
}

export interface TagResponse {
  data: {
    settingValue: string[];
  };
}

export interface CountryOption {
  code: string;
  label: string;
  phone: string;
}
