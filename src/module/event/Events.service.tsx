import { useEffect } from "react";
import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { EventType } from "./Events.type";
import { GridSortModel } from "@mui/x-data-grid";
import { AppResponse } from "../../common/App.type";

export const useGetEvents = (
  setCurrentItems: (items: EventType[]) => void,
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
    isPending: isGetAllEventsPending,
    refetch,
  } = useApi<AppResponse<EventType[]>>({
    url: API_URLS.EVENT,
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

    const items: EventType[] = data.data;
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

  return { isGetAllEventsPending, refetch };
};

export const useAddEvent = () => {
  const { mutate: addEvent, isPending: isAddEventPending } = useMutationApi({
    url: API_URLS.EVENT,
    method: API_METHODS.POST,
  });

  return { addEvent, isAddEventPending };
};

export const useGetEventById = () => {
  const { mutate: getEventById, isPending: isGetEventByIdPending } =
    useMutationApi<AppResponse<EventType>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { eventId } = data as { eventId: string };
        return `${API_URLS?.EVENT}/${eventId}`;
      },
    });

  return { getEventById, isGetEventByIdPending };
};

export const useEditEvent = () => {
  const { mutate: editEvent, isPending: isEditEventPending } = useMutationApi({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { eventId } = data as unknown as EventType;
      return `${API_URLS?.EVENT}/${eventId}`;
    },
  });

  return { editEvent, isEditEventPending };
};

export interface UpdateEventStatusParams {
  eventId: string;
  status: string;
}

export const useUpdateEventStatus = () => {
  const { mutate: updateEventStatus, isPending: isUpdateEventStatusPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { eventId, status } = data as { eventId: string; status: string };
        return `${API_URLS.EVENT}/status/${eventId}?status=${encodeURIComponent(status)}`;
      },
    });

  return { updateEventStatus, isUpdateEventStatusPending };
};

export const useDeleteEvent = () => {
  const { mutate: deleteEvent, isPending: isDeleteEventPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { eventId } = data as unknown as EventType;
        return `${API_URLS?.EVENT}/${eventId}`;
      },
    });

  return { deleteEvent, isDeleteEventPending };
};
