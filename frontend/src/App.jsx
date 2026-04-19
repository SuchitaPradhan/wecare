import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Booking from "./pages/Booking";
import DoctorDashboard from "./pages/DoctorDashboard";
import Patientdashboard from "./pages/Patientdashboard";
import AdminDashboard from "./pages/Admindashboard";
import Doctors from "./pages/Doctors";
import ForgotPassword from "./pages/ForgotPassword";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!token || !user) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/doctors" element={<Doctors />} />
      
      <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
      <Route path="/Patientdashboard" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><Patientdashboard /></ProtectedRoute>} />
      <Route path="/DoctorDashboard" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/AdminDashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}

