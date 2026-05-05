import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import CashFlowPage from "./pages/CashFlowPage";
import ROICalculator from "./components/ROIcalculator";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login</div>} />
        <Route path="/register" element={<div>Register</div>} />

        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/cashflow" element={<CashFlowPage />} />
          <Route path="/calculator" element={<ROICalculator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}