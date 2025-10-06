import { create } from "zustand";
import {
  getNotificationsFromIndexedDB,
  clearNotificationsFromIndexedDB,
} from "./IndexedDB.service";
export interface Notification {
  id: string;
  title: string;
  body: string;
  image?: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

interface NotificationStore {
  unreadCount: number;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
  setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  unreadCount: 0,
  notifications: [],

  addNotification: (notification) => {
    const currentNotifications = get().notifications;
    // Check if notification already exists to avoid duplicates
    const exists = currentNotifications.some(
      (n) =>
        n.id === notification.id ||
        (n.title === notification.title &&
          n.body === notification.body &&
          Math.abs(n.timestamp.getTime() - notification.timestamp.getTime()) <
            60000),
    );

    if (!exists) {
      const updatedNotifications = [notification, ...currentNotifications];
      const unreadCount = updatedNotifications.filter((n) => !n.read).length;

      set({
        notifications: updatedNotifications,
        unreadCount,
      });

      // Persist to localStorage
      localStorage.setItem(
        "notifications",
        JSON.stringify(
          updatedNotifications.map((n) => ({
            ...n,
            timestamp: n.timestamp.toISOString(), // Store as ISO string for reliable parsing
          })),
        ),
      );
    }
  },

  markAsRead: (id) => {
    const updatedNotifications = get().notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );

    const unreadCount = updatedNotifications.filter((n) => !n.read).length;

    set({
      notifications: updatedNotifications,
      unreadCount,
    });

    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  },

  markAllAsRead: () => {
    const updatedNotifications = get().notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    set({
      notifications: updatedNotifications,
      unreadCount: 0,
    });

    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  },
  fetchNotifications: async () => {
    try {
      console.log("Fetching notifications...");

      // First try to get from localStorage
      const stored = localStorage.getItem("notifications");
      let notifications: Notification[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log("LocalStorage data:", parsed);

          notifications = parsed.map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp),
            read: n.read || false, // Ensure read property exists
          }));
        } catch (parseError) {
          console.error("Error parsing localStorage data:", parseError);
          localStorage.removeItem("notifications"); // Clear corrupt data
        }
      }

      console.log("Notifications from localStorage:", notifications);

      // Then try to get from IndexedDB
      try {
        const indexedDBNotifications = await getNotificationsFromIndexedDB();
        console.log("IndexedDB notifications:", indexedDBNotifications);

        if (indexedDBNotifications && indexedDBNotifications.length > 0) {
          const formattedIndexedDBNotifications = (
            indexedDBNotifications as Notification[]
          ).map((n: Notification) => ({
            ...n,
            timestamp: new Date(n.timestamp),
            read: n.read || false,
          }));

          const allNotifications = [
            ...notifications,
            ...formattedIndexedDBNotifications,
          ];
          const uniqueNotifications = allNotifications.filter(
            (n, index, self) => index === self.findIndex((t) => t.id === n.id),
          );

          notifications = uniqueNotifications;

          try {
            await clearNotificationsFromIndexedDB();
          } catch (clearError) {
            console.log("Error clearing IndexedDB:", clearError);
          }
        }
      } catch (error) {
        console.log("IndexedDB access failed, using localStorage only:", error);
      }

      const unreadCount = notifications.filter(
        (n: Notification) => !n.read,
      ).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Error loading notifications:", error);
      set({ notifications: [], unreadCount: 0 });
    }
  },
  setUnreadCount: (count) => set({ unreadCount: count }),
}));
