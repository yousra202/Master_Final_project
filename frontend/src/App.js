import { Routes, Route } from "react-router-dom"
import DoctorRegistration from "./components/auth/DoctorRegistration"
import PatientRegistration from "./components/auth/PatientRegistration"
import Login from "./components/auth/Login"
import DoctorDashboard from "./components/dashboard/doctor/DoctorDashboard"
import DoctorSettings from "./components/dashboard/doctor/DoctorSettings"
import PatientDashboard from "./components/dashboard/PatientDashboard"
import HomePage from "./pages/HomePage"
import ProtectedRoute from "./components/common/ProtectedRoute"
import "./styles/globals.css"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register/doctor" element={<DoctorRegistration />} />
      <Route path="/register/patient" element={<PatientRegistration />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute userType="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/settings"
        element={
          <ProtectedRoute userType="doctor">
            <DoctorSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute userType="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      {/* Add placeholder routes for other menu items */}
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute userType="doctor">
            <div>Appointments Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute userType="doctor">
            <div>Patients Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/medical-records"
        element={
          <ProtectedRoute userType="doctor">
            <div>Medical Records Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/operations"
        element={
          <ProtectedRoute userType="doctor">
            <div>Operations Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/consultations"
        element={
          <ProtectedRoute userType="doctor">
            <div>Online Consultations Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/statistics"
        element={
          <ProtectedRoute userType="doctor">
            <div>Statistics Page (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
