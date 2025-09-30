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

export const getNotificationsFromIndexedDB = () => {
  return new Promise<unknown[]>((resolve, reject) => {
    const openRequest = indexedDB.open("NotificationsDB", 1);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
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
    };

    openRequest.onerror = () => {
      const err = openRequest.error;
      reject(new Error(err?.message ?? "IndexedDB open request failed"));
    };
  });
};

export const clearNotificationsFromIndexedDB = () => {
  return new Promise<void>((resolve, reject) => {
    const openRequest = indexedDB.open("NotificationsDB", 1);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
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
    };

    openRequest.onerror = () => {
      const err = openRequest.error;
      reject(new Error(err?.message ?? "IndexedDB open request failed"));
    };
  });
};
