import { Routes, Route, Navigate } from "react-router-dom";
import DoctorRegistration from "./components/auth/DoctorRegistration";
import PatientRegistration from "./components/auth/PatientRegistration";
import Login from "./components/auth/Login";
import DoctorDashboard from "./components/dashboard/doctor/DoctorDashboard";
import DoctorSettings from "./components/dashboard/doctor/DoctorSettings";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./styles/globals.css";

import DoctorAvailability from "./components/dashboard/doctor/DoctorAvailability";
import DoctorAppointments from "./components/dashboard/doctor/DoctorAppointments";
import PatientAppointments from "./components/dashboard/PatientAppointments";
import BookAppointment from "./components/appointments/BookAppointment";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import DoctorManagement from "./components/admin/DoctorManagement";

import PatientMedicalRecord from "./components/medical_records/PatientMedicalRecord";
import DoctorMedicalRecordView from "./components/medical_records/DoctorMedicalRecordView";
import DoctorMedicalRecords from "./components/medical_records/DoctorMedicalRecords";
import PatientProfileSettings from "./components/dashboard/PatientProfileSettings"

import PatientDashboard from "./components/dashboard/PatientDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import AuthRedirect from "./components/auth/AuthRedirect";
import DoctorLayout from "./components/layout/DoctorLayout";
import PatientLayout from "./components/layout/PatientLayout";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register/doctor" element={<DoctorRegistration />} />
      <Route path="/register/patient" element={<PatientRegistration />} />
      <Route path="/auth-redirect" element={<AuthRedirect />} />
      <Route path="/PatientProfileSettings" element={<PatientProfileSettings />} />

      {/* Doctor routes with layout */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute userType="doctor">
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="settings" element={<DoctorSettings />} />
        <Route path="appointments" element={<DoctorAppointments />} />
        <Route path="availability" element={<DoctorAvailability />} />
        <Route path="medical-records" element={<DoctorMedicalRecords />} />
        <Route path="medical-records/:recordId" element={<DoctorMedicalRecordView />} />
      </Route>

      {/* Patient routes with layout */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute userType="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
       
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
        <Route path="medical-record" element={<PatientMedicalRecord />} />
        <Route path="settings" element={<PatientProfileSettings />} />
      </Route>
      <Route
        path="/book-appointment/:doctorId"
        element={
          <ProtectedRoute userType="patient">
            <BookAppointment />
          </ProtectedRoute>
        }
      />
      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute userType="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="doctors" element={<DoctorManagement />} />
        <Route path="patients" element={<div>Gestion des patients (à venir)</div>} />
        <Route path="settings" element={<div>Paramètres (à venir)</div>} />
      </Route>

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
            <DoctorMedicalRecordView />
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
  );
}


export default App
