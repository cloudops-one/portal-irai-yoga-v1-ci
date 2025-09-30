// Import the functions you need from the SDKs you need
import { getDeviceInfo } from "../common/App.const";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { sendFcmTokenToServer } from "./notification.service"; // Import the new function

const firebaseConfig = {
  apiKey: "AIzaSyAcIlt_TdmzvQxTGm-MvxUhKjbwluGAAPo",
  authDomain: "preview-irai-yoga-v1.firebaseapp.com",
  projectId: "preview-irai-yoga-v1",
  storageBucket: "preview-irai-yoga-v1.firebasestorage.app",
  messagingSenderId: "82852910649",
  appId: "1:82852910649:web:ad223d26c479d1aae9dfe8",
  measurementId: "G-3CCD0D36M7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log(permission);
    const deviceInfo = await getDeviceInfo();

    if (permission === "granted") {
      serviceWorkerRegistration ??= await navigator.serviceWorker.ready;

      const FCMtoken = await getToken(messaging, {
        vapidKey:
          "BPbQWULkaMIRBuGyBJk8DgEQwZyjcQULsfCepCJq91rUX9rgfKhzLACz9U6wj7euAJeHLEtj3zfpMqesvflh6tk",
        serviceWorkerRegistration: await navigator.serviceWorker.ready,
      });

      await sendFcmTokenToServer({
        fcmToken: FCMtoken,
        deviceCode: deviceInfo.deviceCode,
      });
    }
  } catch (error) {
    console.error("Error generating token:", error);
  }
};
