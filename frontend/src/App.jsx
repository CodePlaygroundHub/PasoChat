
import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";

// Components
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import IncomingCallModal from "./components/call/IncomingCallModal";
import OutgoingCallModal from "./components/call/OutgoingCallModal";
import CallRoom from "./components/call/CallRoom";
import ContributePage from "./components/ContributePage.jsx";
import GitHubStarPopup from "./components/GitHubStarPopup";
import LoadingScreen from "./components/LoadingScreen";

// Stores
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";

// Notifications
import { Toaster } from "react-hot-toast";

const App = () => {
  const location = useLocation();

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  const {
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { theme } = useThemeStore();

  // Check authentication when application loads
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Subscribe to chat messages when user is authenticated
  useEffect(() => {
    if (!authUser) return;

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [authUser, subscribeToMessages, unsubscribeFromMessages]);

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div data-theme={theme}>
        <LoadingScreen label="Checking session..." />
      </div>
    );
  }

  // Landing page needs vertical scrolling
  const isLandingPage = location.pathname === "/" && !authUser;

  return (
    <div
      data-theme={theme}
      className="flex h-screen flex-col overflow-hidden bg-base-200"
    >
      {/* Call Components */}
      {authUser && <IncomingCallModal />}
      {authUser && <OutgoingCallModal />}
      {authUser && <CallRoom />}

      {/* Main Application Content */}
      <main
        className={`relative min-h-0 flex-1 ${
          isLandingPage ? "overflow-y-auto" : "overflow-hidden"
        }`}
      >
        <Routes>

          {/* PUBLIC LANDING PAGE */}
          <Route
            path="/"
            element={
              authUser ? (
                authUser.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/app" replace />
                )
              ) : (
                <LandingPage />
              )
            }
          />

          {/* AUTHENTICATION ROUTES */}
          <Route
            path="/signup"
            element={
              !authUser ? (
                <SignUpPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/login"
            element={
              !authUser ? (
                <LoginPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/verify-email"
            element={
              !authUser ? (
                <VerifyEmailPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/forgot-password"
            element={
              !authUser ? (
                <ForgotPasswordPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* MAIN CHAT APPLICATION */}
          <Route
            path="/app"
            element={
              authUser ? (
                authUser.role === "admin" ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <HomePage />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* USER ROUTES */}
          <Route
            path="/profile"
            element={
              authUser ? (
                <ProfilePage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/settings"
            element={
              authUser ? (
                <SettingsPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* CONTRIBUTION PAGE */}
          <Route
            path="/contribute"
            element={<ContributePage />}
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminLayout>
                  <AdminReports />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* FALLBACK FOR UNKNOWN ROUTES */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </main>

      {/* GitHub Star Popup */}
      {authUser && <GitHubStarPopup />}

      {/* Global Toast Notifications */}
      <Toaster position="top-center" />
    </div>
  );
};

export default App;
