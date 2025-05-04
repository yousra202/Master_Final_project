"use client"
import { useNavigate, Link } from "react-router-dom"
import { logout, getCurrentUser } from "../../services/authService"
import "./SidebarStyle.css"
import ProfileInitials from "./ProfileInitials"

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const username = currentUser ? currentUser.username : "Doctor"
  const userType = currentUser ? currentUser.userType : ""

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <ProfileInitials name={username} size={50} />
        <div>
          <h3>Dr. {username}</h3>
          <p>{userType === "doctor" ? "Médecin" : ""}</p>
        </div>
      </div>

      <div className="sidebar-menu">
        <Link to="/doctor/dashboard">
          <div className={`menu-item ${activePage === "dashboard" ? "active" : ""}`}>
            <i className="fas fa-tachometer-alt"></i>
            <span>Tableau de bord</span>
          </div>
        </Link>

        <Link to="/doctor/appointments">
          <div className={`menu-item ${activePage === "appointments" ? "active" : ""}`}>
            <i className="fas fa-calendar-alt"></i>
            <span>Rendez-vous</span>
          </div>
        </Link>

        <Link to="/doctor/patients">
          <div className={`menu-item ${activePage === "patients" ? "active" : ""}`}>
            <i className="fas fa-users"></i>
            <span>Patients</span>
          </div>
        </Link>

        <Link to="/doctor/medical-records">
          <div className={`menu-item ${activePage === "medical-records" ? "active" : ""}`}>
            <i className="fas fa-file-medical"></i>
            <span>Dossiers médicaux</span>
          </div>
        </Link>

        <Link to="/doctor/operations">
          <div className={`menu-item ${activePage === "operations" ? "active" : ""}`}>
            <i className="fas fa-procedures"></i>
            <span>Opérations</span>
          </div>
        </Link>

        <Link to="/doctor/consultations">
          <div className={`menu-item ${activePage === "consultations" ? "active" : ""}`}>
            <i className="fas fa-comments"></i>
            <span>Consultations en ligne</span>
          </div>
        </Link>

        <Link to="/doctor/settings">
          <div className={`menu-item ${activePage === "settings" ? "active" : ""}`}>
            <i className="fas fa-cog"></i>
            <span>Paramètres</span>
          </div>
        </Link>

        <div className="menu-item" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Déconnexion</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
