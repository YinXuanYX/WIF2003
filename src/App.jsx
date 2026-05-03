import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ROICalculator from "./components/ROIcalculator";
import Navbar from "./Navbar";

function AppLayout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>

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