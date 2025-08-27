import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { PoemType } from "./poem.type";
import { AppResponse } from "../../common/App.type";
import { GridSortModel } from "@mui/x-data-grid";
export const useGetPoem = (
  setCurrentItems: (items: PoemType[]) => void,
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
    isPending: isGetAllPoemPending,
    refetch,
  } = useApi<AppResponse<PoemType[]>>({
    url: API_URLS.POEM,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      keyword: searchTerm,
      sortBy,
      direction,
    },
  });

  useEffect(() => {
    refetch();
  }, [paginationModel.page, paginationModel.pageSize, searchTerm, sortModel]);
  useEffect(() => {
    if (!data) return;
    const items: PoemType[] = data.data;
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
  return { isGetAllPoemPending, refetch };
};
export const useAddPoem = () => {
  const { mutate: addPoem, isPending: isAddPoemPending } = useMutationApi({
    url: API_URLS.POEM,
    method: API_METHODS.POST,
  });
  return { addPoem, isAddPoemPending };
};

export const useDeletePoem = () => {
  const { mutate: deletePoem, isPending: isDeletePoemPending } = useMutationApi(
    {
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { poemId } = data as unknown as PoemType;
        return `${API_URLS?.POEM}/${poemId}`;
      },
    },
  );
  return { deletePoem, isDeletePoemPending };
};
export const useGetPoemById = () => {
  const { mutate: getPoemById, isPending: isGetPoemByIdPending } =
    useMutationApi<AppResponse<PoemType>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { poemId } = data as unknown as PoemType;
        return `${API_URLS?.POEM}/${poemId}`;
      },
    });
  return { getPoemById, isGetPoemByIdPending };
};
export const useEditPoem = () => {
  const { mutate: editPoem, isPending: isEditPoemPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { poemId } = data as unknown as PoemType;
      return `${API_URLS?.POEM}/${poemId}`;
    },
  });
  return { editPoem, isEditPoemPending };
};
export const useUpdatePoemStatus = () => {
  const { mutate: updatePoemStatus, isPending: isUpdatePoemStatusPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { poemId, status } = data as { poemId: string; status: string };
        return `${API_URLS.POEM}/status/${poemId}?status=${encodeURIComponent(status)}`;
      },
    });
  return { updatePoemStatus, isUpdatePoemStatusPending };
};
