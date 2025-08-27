export interface Event {
  eventId: string;
  eventIconStorageUrl: string | null;
  eventIconExternalUrl: string | null;
  eventName: string;
  eventDescription: string | null;
  eventStartDateTime: string;
  eventEndDateTime: string;
  addresses: {
    id: string | null;
    isPrimary: boolean;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    stateProvince: string | null;
    postalCode: string | null;
    country: string | null;
  }[];
}

// Generic API response type
export interface ApiResponse<T> {
  message?: string;
  timestamp?: string;
  data: T;
}

// Specific data types
export interface CountData {
  total: number;
}

export interface UserData {
  totalUser: number;
  totalActiveUsers: number;
  totalMobileUsers?: number;
  totalActiveMobileUsers?: number;
}

export type EventsData = Event[];

// Specific response types using the generic ApiResponse
export type OrganizationResponse = ApiResponse<CountData>;
export type UserResponse = ApiResponse<UserData>;
export type EventsResponse = ApiResponse<EventsData>;
export type PoemsResponse = ApiResponse<CountData>;
export type PracticesResponse = ApiResponse<CountData>;
export type ProgramsResponse = ApiResponse<CountData>;
export type ShortsResponse = ApiResponse<CountData>;

export interface DashboardStats {
  totalOrganizations: number;
  totalUsers: number;
  totalActiveUsers: number;
  totalMobileUsers: number;
  totalPractices: number;
  totalPrograms: number;
  totalPoems: number;
  totalShorts: number;
  topEvents: Event[];
}

export type ApiError = {
  message: string;
  status?: number;
};

export type DashboardErrors = {
  organizations?: ApiError;
  users?: ApiError;
  events?: ApiError;
  poems?: ApiError;
  practices?: ApiError;
  programs?: ApiError;
  shorts?: ApiError;
};
