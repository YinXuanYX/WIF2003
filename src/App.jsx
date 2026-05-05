import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthInitializer from "./components/auth/AuthInitializer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ROICalculator from "./components/ROIcalculator";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — redirects to /login if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/calculator" element={<ROICalculator />} />
              <Route path="/profile" element={<ProfilePage />} />
              {/* Other team members' routes will be added here */}
            </Route>
          </Route>
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
}