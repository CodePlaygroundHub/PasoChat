import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import IncomingCallModal from "./components/call/IncomingCallModal.jsx";
import CallRoom from "./components/call/CallRoom";
import OutgoingCallModal from "./components/call/OutgoingCallModal";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import ForgotPasswordPage from "./pages/ForgotPassword.jsx";
import ContributePage from "./components/ContributePage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    console.log("AUTH USER:", authUser);
  }, [authUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser) return;
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [authUser]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme} className={`flex flex-col ${isLandingPage ? 'min-h-screen' : 'h-screen overflow-hidden'}`}>
      {authUser && <IncomingCallModal />}
      {authUser && <OutgoingCallModal />}
      {authUser && <CallRoom />}
      {authUser && authUser.role !== "admin" && !isLandingPage && <Navbar />}

      {/* MAIN CONTENT */}
      <div className={`flex-1 ${isLandingPage ? '' : 'overflow-y-auto'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/chat"
            element={
              authUser ? (
                authUser.role === "admin" ? (
                  <Navigate to="/admin" />
                ) : (
                  <HomePage />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/signup"
            element={!authUser ? <SignUpPage /> : <Navigate to="/chat" />}
          />
          <Route
            path="/verify-email" 
            element= {!authUser?<VerifyEmailPage/>: <Navigate to="/chat"/>}
          />
          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/chat" />}
          />
          <Route
            path="/forgot-password"
            element={!authUser ? <ForgotPasswordPage /> : <Navigate to="/chat" />}
          />
          <Route
            path="/settings"
            element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route path="/contribute" element={<ContributePage />} />
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
        </Routes>
      </div>

      <Toaster />
    </div>
  );
};

export default App;
