import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { NewsType } from "./news.type";
import { AppResponse } from "../../common/App.type";
import { GridSortModel } from "@mui/x-data-grid";

export const useGetNews = (
  setCurrentItems: (items: NewsType[]) => void,
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
    isPending: isGetAllNewsPending,
    refetch,
  } = useApi<AppResponse<NewsType[]>>({
    url: API_URLS.NEWS,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      keyword: searchTerm,
      sortBy,
      direction,
    },
  });
  useEffect(() => {
    // refetch();
  }, [paginationModel.page, paginationModel.pageSize, searchTerm, sortModel]);
  useEffect(() => {
    if (!data) return;
    const items: NewsType[] = data.data;
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

  return { isGetAllNewsPending, refetch };
};

export const useAddNews = () => {
  const { mutate: addNews, isPending: isAddNewsPending } = useMutationApi({
    url: API_URLS.NEWS,
    method: API_METHODS.POST,
  });
  return { addNews, isAddNewsPending };
};

export const useDeleteNews = () => {
  const { mutate: deleteNews, isPending: isDeleteNewsPending } = useMutationApi(
    {
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { newsId } = data as unknown as NewsType;
        return `${API_URLS?.NEWS}/${newsId}`;
      },
    },
  );
  return { deleteNews, isDeleteNewsPending };
};

export const useGetNewsById = () => {
  const { mutate: getNewsById, isPending: isGetNewsByIdPending } =
    useMutationApi<AppResponse<NewsType>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { newsId } = data as unknown as NewsType;
        return `${API_URLS?.NEWS}/${newsId}`;
      },
    });
  return { getNewsById, isGetNewsByIdPending };
};

export const useEditNews = () => {
  const { mutate: editNews, isPending: isEditNewsPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { newsId } = data as unknown as NewsType;
      return `${API_URLS?.NEWS}/${newsId}`;
    },
  });
  return { editNews, isEditNewsPending };
};

export const useUpdateNewsStatus = () => {
  const { mutate: updateNewsStatus, isPending: isUpdateNewsStatusPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { newsId, status } = data as { newsId: string; status: string };
        return `${API_URLS.NEWS}/status/${newsId}?status=${encodeURIComponent(status)}`;
      },
    });
  return { updateNewsStatus, isUpdateNewsStatusPending };
};
