import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import {
  API_URLS,
  API_METHODS,
  DEFAULT_SORT_FIELD,
  DEFAULT_SORT_ORDER,
} from "../../common/App.const";
import { OrganizationType, OrganizationDropdown } from "./Organization.type";
import { GridSortModel } from "@mui/x-data-grid";
import { AppResponse } from "../../common/App.type";

export const useGetOrganizations = (
  setCurrentItems: (items: OrganizationType[]) => void,
  paginationModel: { page: number; pageSize: number },
  setPaginationModel: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number }>
  >,
  setRowCountState: React.Dispatch<React.SetStateAction<number>>,
  searchTerm: string = "",
  sortModel: GridSortModel = [],
) => {
  const sortBy = sortModel[0]?.field || DEFAULT_SORT_FIELD;
  const direction = sortModel[0]?.sort?.toUpperCase() ?? DEFAULT_SORT_ORDER;
  const {
    data,
    isPending: isGetOrganizationsPending,
    refetch,
  } = useApi<AppResponse<OrganizationType[]>>({
    url: API_URLS.ORGANIZATION,
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
    const items: OrganizationType[] = data.data;
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
  return { isGetOrganizationsPending, refetch };
};

export const useAddOrganization = () => {
  const { mutate: addOrganization, isPending: isAddOrganizationPending } =
    useMutationApi({
      url: API_URLS.ORGANIZATION,
      method: API_METHODS.POST,
    });
  return { addOrganization, isAddOrganizationPending };
};

export const useGetOrganizationById = () => {
  const { mutate: getOrganizationId, isPending: isGetOrganizationByIdPending } =
    useMutationApi<AppResponse<OrganizationType>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { orgId } = data as { orgId: string };
        return `${API_URLS?.ORGANIZATION}/${orgId}`;
      },
    });
  return { getOrganizationId, isGetOrganizationByIdPending };
};

export const useEditOrganization = () => {
  const { mutate: editOrganization, isPending: isEditOrganizationPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { orgId } = data as unknown as OrganizationType;
        return `${API_URLS?.ORGANIZATION}/${orgId}`;
      },
    });
  return { editOrganization, isEditOrganizationPending };
};

export const useUpdateOrganizationStatus = () => {
  const {
    mutate: updateOrganizationStatus,
    isPending: isUpdateOrganizationStatusPending,
  } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { orgId, status } = data as { orgId: string; status: string };
      return `${API_URLS.ORGANIZATION}/status/${orgId}?status=${encodeURIComponent(status)}`;
    },
  });
  return { updateOrganizationStatus, isUpdateOrganizationStatusPending };
};

export const useGetOrganizationDropdown = () => {
  const { data, isPending, refetch } = useApi<{ data: OrganizationDropdown[] }>(
    {
      url: API_URLS.ORGANIZATION_DROPDOWN,
    },
  );
  return {
    organizations: data?.data ?? [],
    isPending,
    refetch,
  };
};
