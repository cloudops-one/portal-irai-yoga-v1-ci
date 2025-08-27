import { useMutationApi } from "../../common/App.service";
import { API_URLS, API_METHODS } from "../../common/App.const";
import { UserType } from "../user/User.type";

// export const useGetUserDetails = () => {
//   const { mutate: getUserData, isPending: isGetUserDetailsPending } =
//     useMutationApi({
//       url: API_URLS?.USER,
//       method: API_METHODS.GET,
//     });

//   return { getUserData, isGetUserDetailsPending };
// };

export const useGetUserDetails = () => {
  const { mutate: getUserData, isPending: isGetUserDetailsPending } =
    useMutationApi({
      method: API_METHODS.GET,
      getUrl: (data) => {
        const { userId } = data as unknown as UserType;
        return `${API_URLS?.USER}/${userId}`;
      },
    });
  return { getUserData, isGetUserDetailsPending };
};

export const useResetPassword = () => {
  const { mutate: resetPwd, isPending: isResetPasswordPending } =
    useMutationApi({
      method: API_METHODS.PUT,
      getUrl: (data) => {
        const { userId } = data as { userId: string };
        return `${API_URLS.USER}/reset/password/${userId}`;
      },
    });

  return { resetPwd, isResetPasswordPending };
};
