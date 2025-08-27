import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { PracticeType, CategoryOption } from "./Practice.type";
import { GridSortModel } from "@mui/x-data-grid";
import { AppResponse } from "../../common/App.type";
import { useEffect } from "react";

export const useGetAllPractices = (
  paginationModel: { page: number; pageSize: number },
  sortModel: GridSortModel,
  searchTerm: string = "",
  practiceCategoryId: string = "",
) => {
  const sortBy = sortModel[0]?.field || "createdAt";
  const direction = sortModel[0]?.sort?.toUpperCase() || "DESC";

  const { data, isPending, refetch } = useApi<AppResponse<PracticeType>>({
    url: API_URLS.PRACTICE,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      keyword: searchTerm,
      sortBy,
      direction,
      categoryId: practiceCategoryId || undefined,
    },
  });

  useEffect(() => {
    refetch();
  }, [paginationModel.page, paginationModel.pageSize, searchTerm, sortModel]);

  return {
    practices: data?.data || [],
    totalCount: data?.pageable?.totalElements || 0,
    isPending,
    refetch,
  };
};
// Hook for fetching categories
export const useGetCategories = () => {
  const { data, isPending, refetch } = useApi<{
    data: CategoryOption;
  }>({
    url: API_URLS.PRACTICE_CATEGORY_DROPDOWN,
  });

  return {
    categories: data?.data || [],
    isCategoriesPending: isPending,
    refetchCategories: refetch,
  };
};

export const useAddPractice = () => {
  const { mutate: addPractice, isPending } = useMutationApi({
    url: API_URLS.PRACTICE,
    method: API_METHODS.POST,
  });

  return { addPractice, isAddPracticePending: isPending };
};

export const useUpdatePractice = () => {
  const { mutate: editPractice, isPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { practiceId } = data as unknown as PracticeType;
      return `${API_URLS.PRACTICE}/${practiceId}`;
    },
  });

  return { editPractice, isEditPracticePending: isPending };
};

export const useUpdatePracticeStatus = () => {
  const { mutate: updateStatus, isPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { practiceId, status } = data as {
        practiceId: string;
        status: string;
      };
      return `${API_URLS.PRACTICE}/status/${practiceId}?status=${status}`;
    },
  });
  return { updateStatus, isUpdateStatusPending: isPending };
};

export const useDeletePractice = () => {
  const { mutate: deletePractice, isPending } = useMutationApi({
    method: API_METHODS.DELETE,
    getUrl: (data) => `${API_URLS.PRACTICE}/${data.practiceId}`,
  });

  return { deletePractice, isDeletePracticePending: isPending };
};

export const useGetPractice = (practiceId?: string) => {
  const { data, isPending, refetch } = useApi<AppResponse<PracticeType>>({
    url: practiceId ? `${API_URLS.PRACTICE}/${practiceId}` : "",
  });

  return {
    practiceDetail: data?.data || null,
    isDetailPending: isPending,
    refetchPracticeDetail: refetch,
  };
};
