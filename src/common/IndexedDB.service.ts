export const initIndexedDB = () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const openRequest = indexedDB.open("NotificationsDB", 1);

    openRequest.onerror = () => {
      const err = openRequest.error;
      reject(new Error(err?.message ?? "Failed to open IndexedDB"));
    };

    openRequest.onsuccess = () => {
      resolve(openRequest.result);
    };

    openRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("notifications")) {
        db.createObjectStore("notifications", { keyPath: "id" });
      }
    };
  });
};

export const getNotificationsFromIndexedDB = async (): Promise<unknown[]> => {
  try {
    const db = await initIndexedDB();

    return new Promise((resolve, reject) => {
      // Check if object store exists
      if (!db.objectStoreNames.contains("notifications")) {
        reject(new Error("Notifications object store not found"));
        return;
      }

      const transaction = db.transaction(["notifications"], "readonly");
      const store = transaction.objectStore("notifications");
      const request = store.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        const err = request.error;
        reject(new Error(err?.message ?? "IndexedDB request failed"));
      };
    });
  } catch (error) {
    console.error("Error accessing IndexedDB:", error);
    return [];
  }
};

export const clearNotificationsFromIndexedDB = async (): Promise<void> => {
  try {
    const db = await initIndexedDB();

    return new Promise((resolve, reject) => {
      // Check if object store exists
      if (!db.objectStoreNames.contains("notifications")) {
        resolve(); // If store doesn't exist, consider it cleared
        return;
      }
      const transaction = db.transaction(["notifications"], "readwrite");
      const store = transaction.objectStore("notifications");
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        const err = request.error;
        reject(new Error(err?.message ?? "IndexedDB request failed"));
      };
    });
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
    // Don't reject, just log the error
  }
};
