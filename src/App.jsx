import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from './components/Splash'
import AuthInitializer from "./components/auth/AuthInitializer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import GoalsPage from "./pages/GoalsPage";
import CashFlowPage from "./pages/CashFlowPage";
import CalculatorPage from "./pages/CalculatorPage";
import MarketInsightsPage from "./pages/MarketInsightsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import InvestmentStrategy from "./components/InvestmentStrategy";

export default function App() {
  return (
    <>
      <Splash />
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
              <Route path="/strategy" element={<InvestmentStrategy />} />
              <Route path="/cashflow" element={<CashFlowPage />} />
              <Route path="/market" element={<MarketInsightsPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/goals" element={<GoalsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
    </>
  );
}
