import { useMemo } from "react";
import { useGetSettingsQuery } from "./App.service";
export function UseFormattedDateTime(dateString?: string | null): string {
  return useMemo(() => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [dateString]);
}
export function UseFormattedDate(dateString?: string | null): string {
  return useMemo(() => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [dateString]);
}

//  for Status,flags,and tags
export const useSettings = (settingName: string) => {
  const query = useGetSettingsQuery(settingName);

  return {
    settings: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Pre-defined hooks for specific settings
export const useShortTags = () => useSettings("SHORTS_TAGS");

export const useProgramStatus = () => useSettings("PROGRAM_STATUS");
export const useProgramFlags = () => useSettings("PROGRAM_FLAG");
export const useProgramTags = () => useSettings("PROGRAM_TAGS");

export const usePoemStatus = () => useSettings("POEM_STATUS");
export const usePoemTags = () => useSettings("POEM_TAGS");

export const useNewsStatus = () => useSettings("NEWS_STATUS");
export const useNewsTags = () => useSettings("NEWS_TAGS");

export const usePracticeCategoryStatus = () =>
  useSettings("PRACTICE_CATEGORY_STATUS");
export const usePracticeStatus = () => useSettings("PRACTICE_STATUS");
export const usePracticeTags = () => useSettings("PRACTICE_TAGS");
export const useOrganizationStatus = () => useSettings("ORGANIZATION_STATUS");
export const useURLType = () => useSettings("URL_TYPE");

export const useUserStatus = () => useSettings("USER_STATUS");

export const useEventStatus = () => useSettings("EVENT_STATUS");
