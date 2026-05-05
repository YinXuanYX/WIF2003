import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import ROICalculator from "./components/ROIcalculator";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";

function AppLayout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/calculator" element={<ROICalculator />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}