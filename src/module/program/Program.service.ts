import { useApi, useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { Program, Section, Lesson } from "./Program.type";
import { GridSortModel } from "@mui/x-data-grid";
import { useEffect } from "react";
import { AppResponse } from "../../common/App.type";

// Program CRUD hooks
export const useGetPrograms = (
  setCurrentItems: (items: Program[]) => void,
  paginationModel: { page: number; pageSize: number },
  setPaginationModel: React.Dispatch<
    React.SetStateAction<{ page: number; pageSize: number; total: number }>
  >,

  setRowCountState: React.Dispatch<React.SetStateAction<number>>,
  searchTerm: string = "",
  sortModel: GridSortModel = [],
  enabled: boolean = true,
) => {
  const sortBy = sortModel[0]?.field || "createdAt";
  const direction = sortModel[0]?.sort?.toUpperCase() ?? "ASC";

  const {
    data,
    isPending: isGetProgramsPending,
    refetch,
  } = useApi<AppResponse<Program[]>>({
    url: API_URLS.PROGRAM,
    params: {
      pageNumber: paginationModel.page,
      pageSize: paginationModel.pageSize,
      keyword: searchTerm,
      sortBy,
      direction,
    },
    enabled,
  });

  useEffect(() => {
    if (!data) return;

    const items: Program[] = data.data;
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
        total: totalElements,
      });
    }
  }, [data]);

  return { isGetProgramsPending, refetch };
};

export const useAddProgram = () => {
  const { mutate: addProgram, isPending: isAddProgramPending } = useMutationApi<
    AppResponse<Program>
  >({
    url: API_URLS.PROGRAM,
    method: API_METHODS.POST,
  });

  return { addProgram, isAddProgramPending };
};

export const useGetProgramById = () => {
  const { mutate: getProgramById, isPending: isGetProgramByIdPending } =
    useMutationApi<AppResponse<Program>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { programId } = data as { programId: string };
        return `${API_URLS.PROGRAM}/${programId}`;
      },
    });

  return { getProgramById, isGetProgramByIdPending };
};

export const useEditProgram = () => {
  const { mutate: editProgram, isPending: isEditProgramPending } =
    useMutationApi<AppResponse<Program>>({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { programId } = data as unknown as Program;
        return `${API_URLS.PROGRAM}/${programId}`;
      },
    });

  return { editProgram, isEditProgramPending };
};

export const useDeleteProgram = () => {
  const { mutate: deleteProgram, isPending: isDeleteProgramPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { programId } = data as unknown as Program;
        return `${API_URLS.PROGRAM}/${programId}`;
      },
    });

  return { deleteProgram, isDeleteProgramPending };
};

export interface UpdateProgramStatusParams {
  programId: string;
  status: string;
}
export interface UpdateProgramFlagParams {
  programId: string;
  flag: string;
}

export const useUpdateProgramStatus = () => {
  const {
    mutate: updateProgramStatus,
    isPending: isUpdateProgramStatusPending,
  } = useMutationApi<AppResponse<Program>>({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { programId, status } =
        data as unknown as UpdateProgramStatusParams;
      return `${API_URLS.PROGRAM}/status/${programId}?status=${encodeURIComponent(status)}`;
    },
  });

  return { updateProgramStatus, isUpdateProgramStatusPending };
};
export const useUpdateProgramFlag = () => {
  const { mutate: updateProgramFlag, isPending: isUpdateProgramFlagPending } =
    useMutationApi<AppResponse<Program>>({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { programId, flag } = data as unknown as UpdateProgramFlagParams;
        return `${API_URLS.PROGRAM}/flag/${programId}?flag=${encodeURIComponent(flag)}`;
      },
    });

  return { updateProgramFlag, isUpdateProgramFlagPending };
};

// Section CRUD hooks
export const useGetSectionsByProgramId = () => {
  const { mutate: getSections, isPending: isGetSectionsPending } =
    useMutationApi<AppResponse<Section[]>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { programId } = data as { programId: string };
        return `${API_URLS.PROGRAM_SECTION}/?programId=${programId}`;
      },
    });

  return { getSections, isGetSectionsPending };
};

export const useAddSection = () => {
  const { mutate: addSection, isPending: isAddSectionPending } = useMutationApi<
    AppResponse<Section>
  >({
    url: API_URLS.PROGRAM_SECTION,
    method: API_METHODS.POST,
  });

  return { addSection, isAddSectionPending };
};

export const useGetSectionById = () => {
  const { mutate: getSectionById, isPending: isGetSectionByIdPending } =
    useMutationApi<AppResponse<Section>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { sectionId } = data as { sectionId: string };
        return `${API_URLS.PROGRAM_SECTION}/${sectionId}`;
      },
    });

  return { getSectionById, isGetSectionByIdPending };
};

export const useEditSection = () => {
  const { mutate: editSection, isPending: isEditSectionPending } =
    useMutationApi<AppResponse<Section>>({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { sectionId } = data as unknown as Section;
        return `${API_URLS.PROGRAM_SECTION}/${sectionId}`;
      },
    });

  return { editSection, isEditSectionPending };
};

export const useDeleteSection = () => {
  const { mutate: deleteSection, isPending: isDeleteSectionPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { sectionId } = data as unknown as Section;
        return `${API_URLS.PROGRAM_SECTION}/${sectionId}`;
      },
    });

  return { deleteSection, isDeleteSectionPending };
};

export const useUpdateSectionOrder = () => {
  const { mutate: updateSectionOrder, isPending: isUpdateSectionOrderPending } =
    useMutationApi<AppResponse<void>>({
      url: `${API_URLS.PROGRAM_SECTION}/order`,
      method: API_METHODS.PUT,
    });

  return { updateSectionOrder, isUpdateSectionOrderPending };
};

// Lesson CRUD hooks
export const useGetLessonsBySectionId = () => {
  const { mutate: getLessons, isPending: isGetLessonsPending } = useMutationApi<
    AppResponse<Lesson[]>
  >({
    method: API_METHODS.GET,
    getUrl: (data) => {
      const { sectionId } = data as { sectionId: string };
      return `${API_URLS.PROGRAM_LESSON}?sectionId=${sectionId}`;
    },
  });

  return { getLessons, isGetLessonsPending };
};

export const useAddLesson = () => {
  const { mutate: addLesson, isPending: isAddLessonPending } = useMutationApi<
    AppResponse<Lesson>
  >({
    url: API_URLS.PROGRAM_LESSON,
    method: API_METHODS.POST,
  });

  return { addLesson, isAddLessonPending };
};

export const useGetLessonById = () => {
  const { mutate: getLessonById, isPending: isGetLessonByIdPending } =
    useMutationApi<AppResponse<Lesson>>({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { lessonId } = data as { lessonId: string };
        return `${API_URLS.PROGRAM_LESSON}/${lessonId}`;
      },
    });

  return { getLessonById, isGetLessonByIdPending };
};

export const useEditLesson = () => {
  const { mutate: editLesson, isPending: isEditLessonPending } = useMutationApi<
    AppResponse<Lesson>
  >({
    method: API_METHODS.PUT,
    getUrl: (data) => {
      const { lessonId } = data as unknown as Lesson;
      return `${API_URLS.PROGRAM_LESSON}/${lessonId}`;
    },
  });

  return { editLesson, isEditLessonPending };
};

export const useDeleteLesson = () => {
  const { mutate: deleteLesson, isPending: isDeleteLessonPending } =
    useMutationApi({
      method: API_METHODS.DELETE,
      getUrl: (data) => {
        const { lessonId } = data as unknown as Lesson;
        return `${API_URLS.PROGRAM_LESSON}/${lessonId}`;
      },
    });

  return { deleteLesson, isDeleteLessonPending };
};

export const useUpdateLessonOrder = () => {
  const { mutate: updateLessonOrder, isPending: isUpdateLessonOrderPending } =
    useMutationApi<AppResponse<void>>({
      url: `${API_URLS.PROGRAM_LESSON}/order`,
      method: API_METHODS.PUT,
    });

  return { updateLessonOrder, isUpdateLessonOrderPending };
};
