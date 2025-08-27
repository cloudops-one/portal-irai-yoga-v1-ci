import { StorageType } from "./Storage.types";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import { GridSortModel } from "@mui/x-data-grid";
import { AppResponse } from "../../common/App.type";

export const useGetStorageFiles = (
  setCurrentItems: (items: StorageType[]) => void,
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
    isPending: isGetFilesPending,
    refetch,
  } = useApi<AppResponse<StorageType[]>>({
    url: API_URLS.STORAGE,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      keyword: searchTerm,
      sortBy,
      direction,
    },
  });

  useEffect(() => {
    if (!data) return;
    const items: StorageType[] = data.data;
    setCurrentItems(items);
    setRowCountState(data.pageable.totalElements);
    setPaginationModel((prev) => ({
      page: data.pageable.pageNumber,
      pageSize: data.pageable.pageSize ?? prev.pageSize,
    }));
  }, [data]);

  return { isGetFilesPending, refetch };
};
export const useDeleteStorageFiles = () => {
  const { mutate: deleteStorageFiles, isPending: isDeleteStorageFilesPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { storageName } = data as unknown as StorageType;
        return `${API_URLS?.STORAGE}/${storageName}`;
      },
    });
  return { deleteStorageFiles, isDeleteStorageFilesPending };
};

export const useSyncStorage = () => {
  const { mutate: syncStorage, isPending: isSyncStoragePending } =
    useMutationApi({
      method: API_METHODS.GET,
      url: `${API_URLS?.STORAGE}/sync`,
    });

  return { syncStorage, isSyncStoragePending };
};

export const useGetLastSyncTime = () => {
  const {
    data,
    isPending: isLastSyncPending,
    refetch: refetchLastSync,
  } = useApi<AppResponse<string>>({
    url: `${API_URLS?.STORAGE}/sync/updatedat`,
  });

  return {
    lastSyncTime: data?.data,
    isLastSyncPending,
    refetchLastSync,
  };
};
