import React, { createContext, useContext, useEffect } from "react";
import { useNotificationStore, Notification } from "./Notification.store";
import { messaging } from "../notifications/firebase";
import { onMessage } from "firebase/messaging";
interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    unreadCount,
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationStore();

  // Listen for new messages
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window !== "undefined") {
          const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);

            // Add the new notification to the store
            const newNotification = {
              id: Date.now().toString(),
              title: payload.notification?.title ?? "New Notification",
              body: payload.notification?.body ?? "",
              image: payload.notification?.image,
              timestamp: new Date(),
              read: false,
              data: payload.data,
            };

            addNotification(newNotification);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Error initializing messaging:", error);
      }
    };

    initializeMessaging();
  }, [addNotification]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
