import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminImport from "./pages/admin/AdminImport";
import AdminImportHistory from "./pages/admin/AdminImportHistory";
import MemberDashboard from "./pages/member/MemberDashboard";
import MemberDirectory from "./pages/shared/MemberDirectory";
import MemberProfile from "./pages/shared/MemberProfile";
import MyProfile from "./pages/shared/MyProfile";
import Settings from "./pages/shared/Settings";
import CommunicationDashboard from "./pages/shared/CommunicationDashboard";
import AdminExport from "./pages/admin/AdminExport";
import ComingSoon from "./pages/ComingSoon";

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <SettingsProvider isAuthenticated={!!user}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

          {/* Protected Routes inside AppLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
                <Route path="/admin/import" element={<AdminImport />} />
                <Route path="/admin/import-history" element={<AdminImportHistory />} />
                <Route path="/admin/communication" element={<CommunicationDashboard />} />
                {/* Excel Export */}
                <Route path="/admin/export" element={<AdminExport />} />
              </Route>

              {/* Member Routes */}
              <Route element={<ProtectedRoute allowedRoles={["member"]} />}>
                <Route path="/member/dashboard" element={<MemberDashboard />} />
                <Route path="/member/communication" element={<CommunicationDashboard />} />
              </Route>

              {/* Shared Routes (Both Admin and Member) */}
          <Route path="/directory" element={<MemberDirectory />} />
          <Route path="/directory/:id" element={<MemberProfile />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
          </Route>

          {/* Fallback routing */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </SettingsProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
