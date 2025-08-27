import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { PracticeCategoryType } from "./PracticeCategory.types";
import { GridSortModel } from "@mui/x-data-grid";
import { useEffect } from "react";
import { AppResponse } from "../../common/App.type";

export const useGetCategories = (
  setCurrentItems: (items: PracticeCategoryType[]) => void,
  paginationModel: { page: number; pageSize: number },
  setPaginationModel: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number }>
  >,
  setRowCountState: React.Dispatch<React.SetStateAction<number>>,
  searchTerm: string = "",
  sortModel: GridSortModel = [],
) => {
  const sortBy = sortModel[0]?.field || "createdAt";
  const direction = sortModel[0]?.sort?.toUpperCase() ?? "ASC";
  const {
    data,
    isPending: isGetAllCategoriesPending,
    refetch,
  } = useApi<AppResponse<PracticeCategoryType[]>>({
    url: API_URLS.PRACTICE_CATEGORY,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      keyword: searchTerm,
      sortBy,
      direction,
    },
  });

  // Add refetch when parameters change
  useEffect(() => {
    refetch();
  }, [paginationModel.page, paginationModel.pageSize, searchTerm, sortModel]);

  useEffect(() => {
    if (!data) return;
    const items: PracticeCategoryType[] = data.data;
    const { totalElements, pageNumber, pageSize } = data.pageable;
    setCurrentItems(items);
    setRowCountState(totalElements);
    if (
      pageNumber !== paginationModel.page ||
      pageSize !== paginationModel.pageSize
    ) {
      setPaginationModel({
        page: pageNumber,
        pageSize: pageSize,
      });
    }
  }, [data]);

  return { isGetAllCategoriesPending, refetch };
};

export const useAddCategory = () => {
  const { mutate: addCategory, isPending: isAddCategoryPending } =
    useMutationApi({
      url: API_URLS.PRACTICE_CATEGORY,
      method: API_METHODS.POST,
    });

  return { addCategory, isAddCategoryPending };
};

export const useEditCategory = () => {
  const { mutate: editCategory, isPending: isEditCategoryPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { practiceCategoryId } = data as PracticeCategoryType;
        return `${API_URLS.PRACTICE_CATEGORY}/${practiceCategoryId}`;
      },
    });

  return { editCategory, isEditCategoryPending };
};

export const useUpdateCategoryStatus = () => {
  const { mutate: updateCategoryStatus, isPending: isUpdateStatusPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { practiceCategoryId, status } = data as {
          practiceCategoryId: string;
          status: string;
        };
        return `${API_URLS.PRACTICE_CATEGORY}/status/${practiceCategoryId}?status=${encodeURIComponent(status)}`;
      },
    });

  return { updateCategoryStatus, isUpdateStatusPending };
};

export const useDeleteCategory = () => {
  const { mutate: deleteCategory, isPending: isDeleteCategoryPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { practiceCategoryId } = data as { practiceCategoryId: string };
        return `${API_URLS.PRACTICE_CATEGORY}/${practiceCategoryId}`;
      },
    });

  return { deleteCategory, isDeleteCategoryPending };
};

export const useGetCategoryById = () => {
  const { mutate: getCategoryById, isPending: isGetCategoryPending } =
    useMutationApi({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { practiceCategoryId } = data as { practiceCategoryId: string };
        return `${API_URLS.PRACTICE_CATEGORY}/${practiceCategoryId}`;
      },
    });

  return { getCategoryById, isGetCategoryPending };
};
