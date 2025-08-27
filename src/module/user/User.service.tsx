// hooks/useOrganizations.ts
import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { UserType } from "./User.type";
import { GridSortModel } from "@mui/x-data-grid";
import { AppResponse } from "../../common/App.type";

// getUSers
export const useGetUsers = (
  setCurrentItems: (items: UserType[]) => void,
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
    isPending: isGetAllUsersPending,
    refetch,
  } = useApi<AppResponse<UserType[]>>({
    url: API_URLS.USER,
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
    const items: UserType[] = data.data;
    setCurrentItems(items);
    setRowCountState(data?.pageable?.totalElements ?? 0);
    setPaginationModel((prev) => ({
      page: data?.pageable?.pageNumber ?? 0,
      pageSize: data?.pageable?.pageSize ?? prev.pageSize,
    }));
  }, [data]);

  return { isGetAllUsersPending, refetch };
};

export const useAddUser = () => {
  const { mutate: addUser, isPending: isAddUserPending } = useMutationApi({
    url: API_URLS.USER,
    method: API_METHODS.POST,
  });
  return { addUser, isAddUserPending };
};

export const useGetUserById = () => {
  const { mutate: getUserById, isPending: isGetUserByIdPending } =
    useMutationApi({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { userId } = data as unknown as UserType;
        return `${API_URLS?.USER}/${userId}`;
      },
    });
  return { getUserById, isGetUserByIdPending };
};

export const useGetUserAoiById = () => {
  const { mutate: getUserAoiById, isPending: isGetUserByAoiIdPending } =
    useMutationApi({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { userId } = data as unknown as UserType;
        return `${API_URLS?.USER}/aoi/${userId}`;
      },
    });
  return { getUserAoiById, isGetUserByAoiIdPending };
};

export const useEditUser = () => {
  const { mutate: editUser, isPending: isEditUserPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { userId } = data as unknown as UserType;
      return `${API_URLS?.USER}/${userId}`;
    },
  });

  return { editUser, isEditUserPending };
};

// status update hook
export const useUpdateUserStatus = () => {
  const { mutate: updateUserStatus, isPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { userId, status } = data as { userId: string; status: string };
      return `${API_URLS.USER}/status/${userId}?status=${status}`;
    },
  });
  return { updateUserStatus, isUpdateUserStatusPending: isPending };
};

export const useDeleteUser = () => {
  const { mutate: deleteUser, isPending } = useMutationApi({
    method: API_METHODS.DELETE,
    getUrl: (data) => `${API_URLS.USER}/${data.userId}`,
  });
  return { deleteUser, isDeleteUserPending: isPending };
};
