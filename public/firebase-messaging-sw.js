/* eslint-env serviceworker */
/* global importScripts, firebase, clients */

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAcIlt_TdmzvQxTGm-MvxUhKjbwluGAAPo",
  authDomain: "preview-irai-yoga-v1.firebaseapp.com",
  projectId: "preview-irai-yoga-v1",
  storageBucket: "preview-irai-yoga-v1.firebasestorage.app",
  messagingSenderId: "82852910649",
  appId: "1:82852910649:web:ad223d26c479d1aae9dfe8",
  measurementId: "G-3CCD0D36M7",
});

const messaging = firebase.messaging();

// Store notifications in IndexedDB
const storeNotification = async (notification) => {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open("NotificationsDB", 1);

    openRequest.onerror = () => {
      reject(openRequest.error);
    };

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction(["notifications"], "readwrite");
      const store = transaction.objectStore("notifications");
      const request = store.add(notification);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    };

    openRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("notifications")) {
        db.createObjectStore("notifications", { keyPath: "id" });
      }
    };
  });
};

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received: ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || "/icon-192x192.png",
    data: payload.data,
  };

  // Store the notification
  storeNotification({
    id: Date.now().toString(),
    title: payload.notification.title,
    body: payload.notification.body,
    image: payload.notification.image,
    timestamp: new Date(),
    read: false,
    data: payload.data,
  }).catch((error) => {
    console.error("Error storing notification:", error);
  });

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Listen for notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.url || "/";
  console.log(targetUrl);
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
