import { API_METHODS, API_URLS } from "../common/App.const";
import { useMutationApi } from "../common/App.service";

// hooks/useFileUpload.ts
export const useFileUpload = () => {
  const { mutate: uploadFile, isPending: isUploading } = useMutationApi({
    url: API_URLS.STORAGE_UPLOAD,
    method: API_METHODS.POST,
  });

  return { uploadFile, isUploading };
};
