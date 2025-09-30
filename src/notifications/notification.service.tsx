import { apiClient } from "../common/App.service";
import { API_URLS } from "../common/App.const";
import { FcmRequest } from "./notification.type";

export const sendFcmTokenToServer = async (fcmData: FcmRequest) => {
  try {
    // We use the apiClient from App.service which is already configured
    const response = await apiClient.post(
      API_URLS.NOTIFICATION_FCM_TOKEN,
      fcmData,
    );
    return response.data;
  } catch (error) {
    console.error("Error sending FCM token to server:", error);
    throw error;
  }
};
