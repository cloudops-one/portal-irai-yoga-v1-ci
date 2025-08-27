import { API_URLS } from "../../common/App.const";
import { useApi } from "../../common/App.service";
import { useEffect, useState } from "react";
import {
  OrganizationResponse,
  UserResponse,
  EventsResponse,
  PoemsResponse,
  PracticesResponse,
  ProgramsResponse,
  ShortsResponse,
  DashboardStats,
  DashboardErrors,
} from "./Dashboard.type";

export const useGetDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
    totalMobileUsers: 0,
    totalPractices: 0,
    totalPrograms: 0,
    totalPoems: 0,
    totalShorts: 0,
    topEvents: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<DashboardErrors>({});

  // Organization stats
  const {
    data: orgData,
    isPending: isOrgPending,
    error: orgError,
  } = useApi<OrganizationResponse>({
    url: API_URLS.ORGANIZATION_DASHBOARD,
  });

  // User stats
  const {
    data: userData,
    isPending: isUserPending,
    error: userError,
  } = useApi<UserResponse>({
    url: API_URLS.USER_DASHBOARD,
  });

  // Events
  const {
    data: eventsData,
    isPending: isEventsPending,
    error: eventsError,
  } = useApi<EventsResponse>({
    url: API_URLS.EVENTS_DASHBOARD,
  });

  // Poems
  const {
    data: poemsData,
    isPending: isPoemsPending,
    error: poemsError,
  } = useApi<PoemsResponse>({
    url: API_URLS.POEMS_DASHBOARD,
  });

  // Practices
  const {
    data: practicesData,
    isPending: isPracticesPending,
    error: practicesError,
  } = useApi<PracticesResponse>({
    url: API_URLS.PRACTICE_DASHBOARD,
  });

  // Programs
  const {
    data: programsData,
    isPending: isProgramsPending,
    error: programsError,
  } = useApi<ProgramsResponse>({
    url: API_URLS.PROGRAM_DASHBOARD,
  });

  // Shorts
  const {
    data: shortsData,
    isPending: isShortsPending,
    error: shortsError,
  } = useApi<ShortsResponse>({
    url: API_URLS.SHORTS_DASHBOARD,
  });

  useEffect(() => {
    // Update errors whenever they occur
    const newErrors: DashboardErrors = {};

    if (orgError) {
      newErrors.organizations = {
        message: orgError.message || "Failed to load organizations",
        status: orgError.status,
      };
    }
    if (userError) {
      newErrors.users = {
        message: userError.message || "Failed to load users",
        status: userError.status,
      };
    }
    if (eventsError) {
      newErrors.events = {
        message: eventsError.message || "Failed to load events",
        status: eventsError.status,
      };
    }
    if (poemsError) {
      newErrors.poems = {
        message: poemsError.message || "Failed to load poems",
        status: poemsError.status,
      };
    }
    if (practicesError) {
      newErrors.practices = {
        message: practicesError.message || "Failed to load practices",
        status: practicesError.status,
      };
    }
    if (programsError) {
      newErrors.programs = {
        message: programsError.message || "Failed to load programs",
        status: programsError.status,
      };
    }
    if (shortsError) {
      newErrors.shorts = {
        message: shortsError.message || "Failed to load shorts",
        status: shortsError.status,
      };
    }

    setErrors(newErrors);
  }, [
    orgError,
    userError,
    eventsError,
    poemsError,
    practicesError,
    programsError,
    shortsError,
  ]);

  useEffect(() => {
    if (
      !isOrgPending &&
      !isUserPending &&
      !isEventsPending &&
      !isPoemsPending &&
      !isPracticesPending &&
      !isProgramsPending &&
      !isShortsPending
    ) {
      setIsLoading(false);
      setStats({
        totalOrganizations: orgData?.data?.total || 0,
        totalUsers: userData?.data?.totalUser || 0,
        totalActiveUsers: userData?.data?.totalActiveUsers || 0,
        totalMobileUsers: userData?.data?.totalMobileUsers || 0,
        totalPractices: practicesData?.data?.total || 0,
        totalPrograms: programsData?.data?.total || 0,
        totalPoems: poemsData?.data?.total || 0,
        totalShorts: shortsData?.data?.total || 0,
        topEvents: eventsData?.data || [],
      });
    }
  }, [
    isOrgPending,
    isUserPending,
    isEventsPending,
    isPoemsPending,
    isPracticesPending,
    isProgramsPending,
    isShortsPending,
    orgData,
    userData,
    eventsData,
    poemsData,
    practicesData,
    programsData,
    shortsData,
  ]);

  return { stats, isLoading, errors };
};
