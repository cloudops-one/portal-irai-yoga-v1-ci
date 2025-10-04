import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { storage, useStore } from "./common/App.store";
import ResponsiveDrawer from "./module/layout/Layout.component";
import Auth from "./module/auth/Auth.component";
import Dashboard from "./module/dashboard/Dashboard.component";
import OrganizationComponent from "./module/organization/Organization.component";
import Profile from "./module/setting/Profile.component";
import User from "./module/user/User.component";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { KEYCLOAK_USER, ROUTE_PATHS } from "./common/App.const";
import Practice from "./module/practice/Practice.component";
import Program from "./module/program/Program.component";
import PoemComponent from "./module/poem/poem.component";
import ShortsComponent from "./module/shorts/Shorts.component";
import EventsComponent from "./module/event/Events.component";
import PracticeCategory from "./module/practiceCategory/PracticeCategory.component";
import StorageComponent from "./module/storage/Storage.component";
import NewsComponent from "./module/news/News.component";

import CircularProgress from "@mui/material/CircularProgress";
import { Stack } from "@mui/material";
import { generateToken, messaging } from "./notifications/firebase";
import { onMessage } from "firebase/messaging";
import { NotificationProvider } from "./common/NotificationContext";
import { useNotificationStore } from "./common/Notification.store";
interface ExtendedJwtPayload extends JwtPayload {
  sub: string;
  authorities: { authority: string }[];
  organizationId: string;
  level: string;
  permissions: string[];
  iat: number;
  exp: number;
}
const queryClient = new QueryClient();
const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode<ExtendedJwtPayload>(token);
    const buffer = 30000; // 30 seconds buffer
    return decoded.exp ? decoded.exp * 1000 < Date.now() + buffer : true;
  } catch {
    return true;
  }
};

const isKeycloakAuthenticated = (): boolean => {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  return role === KEYCLOAK_USER && !!token;
};
const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { token, refreshAccessToken, isAuthenticated } = useStore();
  const [isAuthResolved, setIsAuthResolved] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      const hasKeycloakParams =
        hashParams.has("state") ||
        hashParams.has("session_state") ||
        hashParams.has("code") ||
        searchParams.has("state") ||
        searchParams.has("session_state") ||
        searchParams.has("code");

      // If returning from Keycloak at root route, allow it
      if (
        hasKeycloakParams &&
        window.location.pathname === ROUTE_PATHS?.ROOT_ROUTE
      ) {
        setIsAuthorized(true);
        setIsAuthResolved(true);
        return;
      }
      if (isKeycloakAuthenticated()) {
        setIsAuthorized(true);
        setIsAuthResolved(true);
        return;
      }
      if (!isAuthenticated) {
        setIsAuthResolved(true);
        return;
      }
      const currentToken = token ?? storage.get<string | null>("token", null);

      if (!currentToken) {
        setIsAuthorized(false);
        setIsAuthResolved(true);
        return;
      }

      try {
        if (isTokenExpired(currentToken)) {
          await refreshAccessToken();
        }
        setIsAuthorized(true);
      } catch {
        setIsAuthorized(false);
      } finally {
        setIsAuthResolved(true);
      }
    };

    checkAuth();
  }, [token]);
  if (!isAuthResolved) {
    return (
      <Stack
        className="flex justify-center items-center"
        sx={{ color: "grey.500" }}
        spacing={2}
        direction="row"
      >
        <CircularProgress color="success" />
      </Stack>
    );
  }

  return isAuthorized ? (
    children
  ) : (
    <Navigate to={ROUTE_PATHS?.ROOT_ROUTE} replace />
  );
};
//  Public Route with Auth Check
const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { isAuthenticated } = useStore();
  return isAuthenticated ? (
    <Navigate to={ROUTE_PATHS?.DASHBOARD} replace />
  ) : (
    children
  );
};

const App = () => {
  const { isAuthenticated } = useStore();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    if (!isAuthenticated) return;
    const setupNotifications = async () => {
      try {
        await generateToken();

        // Listen for messages
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log("Message received. ", payload);

          // Add notification to store
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
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    setupNotifications();
  }, [addNotification, isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route
              path={ROUTE_PATHS?.ROOT_ROUTE}
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              }
            />

            {/* Private Routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <ResponsiveDrawer>
                    {/* Wrap all routes in a Routes component */}
                    <Routes>
                      <Route
                        path={ROUTE_PATHS?.DASHBOARD}
                        element={<Dashboard />}
                      />
                      <Route
                        path={ROUTE_PATHS?.ORGANIZATION}
                        element={<OrganizationComponent />}
                      />
                      <Route path={ROUTE_PATHS?.USER} element={<User />} />
                      <Route
                        path={ROUTE_PATHS?.PROFILE}
                        element={<Profile />}
                      />
                      <Route
                        path={ROUTE_PATHS?.PRACTICE}
                        element={<Practice />}
                      />
                      <Route
                        path={ROUTE_PATHS?.POEM}
                        element={<PoemComponent />}
                      />
                      <Route
                        path={ROUTE_PATHS?.EVENT}
                        element={<EventsComponent />}
                      />
                      <Route
                        path={ROUTE_PATHS?.SHORTS}
                        element={<ShortsComponent />}
                      />
                      <Route
                        path={ROUTE_PATHS?.PRACTICE_CATEGORY}
                        element={<PracticeCategory />}
                      />
                      <Route
                        path={ROUTE_PATHS?.STORAGE}
                        element={<StorageComponent />}
                      />
                      <Route
                        path={ROUTE_PATHS?.PROGRAM}
                        element={<Program />}
                      />
                      <Route
                        path={ROUTE_PATHS?.NEWS}
                        element={<NewsComponent />}
                      />

                      {/* Catch-all for unmatched private routes */}
                      <Route
                        path="*"
                        element={
                          <Navigate to={ROUTE_PATHS?.DASHBOARD} replace />
                        }
                      />
                    </Routes>
                  </ResponsiveDrawer>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  );
};

export default App;
