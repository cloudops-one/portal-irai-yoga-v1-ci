import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import ShortsType from "./Shorts.types";
import { AppResponse } from "../../common/App.type";

export const useGetShorts = (
  setCurrentItems: React.Dispatch<React.SetStateAction<ShortsType[]>>,
  paginationModel: { page: number; pageSize: number },

  setTotalShorts: React.Dispatch<React.SetStateAction<number>>,
) => {
  const {
    data,
    isPending: isGetAllShortsPending,
    refetch,
  } = useApi<AppResponse<ShortsType[]>>({
    url: API_URLS.SHORTS,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      sortBy: "createdAt",
      direction: "DESC",
    },
  });

  useEffect(() => {
    if (!data) return;
    const items: ShortsType[] = data.data;
    const { totalElements } = data.pageable;
    setCurrentItems((prev) => [...prev, ...items]);
    setTotalShorts(totalElements);
  }, [data]);
  return { data, isGetAllShortsPending, refetch };
};

export const useAddShorts = () => {
  const { mutate: addShorts, isPending: isAddShortsPending } = useMutationApi({
    url: API_URLS.SHORTS,
    method: API_METHODS.POST,
  });
  return { addShorts, isAddShortsPending };
};

export const useGetShortsById = () => {
  const { mutate: getShortsById, isPending: isGetShortsByIdPending } =
    useMutationApi<AppResponse<ShortsType>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { shortsId } = data as unknown as ShortsType;
        return `${API_URLS?.SHORTS}/${shortsId}`;
      },
    });
  return { getShortsById, isGetShortsByIdPending };
};

export const useEditShorts = () => {
  const { mutate: editShorts, isPending: isEditShortsPending } = useMutationApi(
    {
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { shortsId } = data as unknown as ShortsType;
        return `${API_URLS?.SHORTS}/${shortsId}`;
      },
    },
  );
  return { editShorts, isEditShortsPending };
};

export const useDeleteShorts = () => {
  const { mutate: deleteShorts, isPending: isDeleteShortsPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { shortsId } = data as unknown as ShortsType;
        return `${API_URLS?.SHORTS}/${shortsId}`;
      },
    });
  return { deleteShorts, isDeleteShortsPending };
};
export const useUpdateShortsStatus = () => {
  const { mutate: updateShortsStatus, isPending: isUpdateShortsStatusPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { shortsId, status } = data as {
          shortsId: string;
          status: string;
        };
        return `${API_URLS.SHORTS}/status/${shortsId}?status=${encodeURIComponent(status)}`;
      },
    });
  return { updateShortsStatus, isUpdateShortsStatusPending };
};
