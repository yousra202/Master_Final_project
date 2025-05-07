"use client"
import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { logout, getCurrentUser } from "../../services/authService"
import "./SidebarStyle.css"
import ProfileInitials from "./ProfileInitials"
import SidebarToggle from "./SidebarToggle"

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = getCurrentUser()
  const username = currentUser ? currentUser.username : "Doctor"
  const userType = currentUser ? currentUser.userType : ""
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isOpen, setIsOpen] = useState(!isMobile)

  // Determine active page from location if not provided
  const currentPage = activePage || location.pathname.split("/").pop()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile && !isOpen) {
        setIsOpen(true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <>
      <SidebarToggle isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <ProfileInitials name={username} size={50} />
          <div>
            <h3>
              {userType === "doctor" ? "Dr. " : ""}
              {username}
            </h3>
            <p>{userType === "doctor" ? "Médecin" : userType === "patient" ? "Patient" : ""}</p>
          </div>
        </div>

        <div className="sidebar-menu">
          <Link to="/doctor/dashboard">
            <div className={`menu-item ${currentPage === "dashboard" ? "active" : ""}`}>
              <i className="fas fa-tachometer-alt"></i>
              <span>Tableau de bord</span>
            </div>
          </Link>

          <Link to="/doctor/appointments">
            <div className={`menu-item ${currentPage === "appointments" ? "active" : ""}`}>
              <i className="fas fa-calendar-alt"></i>
              <span>Rendez-vous</span>
            </div>
          </Link>

          <Link to="/doctor/patients">
            <div className={`menu-item ${currentPage === "patients" ? "active" : ""}`}>
              <i className="fas fa-users"></i>
              <span>Patients</span>
            </div>
          </Link>

          <Link to="/doctor/medical-records">
            <div className={`menu-item ${currentPage === "medical-records" ? "active" : ""}`}>
              <i className="fas fa-file-medical"></i>
              <span>Dossiers médicaux</span>
            </div>
          </Link>

          <Link to="/doctor/operations">
            <div className={`menu-item ${currentPage === "operations" ? "active" : ""}`}>
              <i className="fas fa-procedures"></i>
              <span>Opérations</span>
            </div>
          </Link>

          <Link to="/doctor/consultations">
            <div className={`menu-item ${currentPage === "consultations" ? "active" : ""}`}>
              <i className="fas fa-comments"></i>
              <span>Consultations en ligne</span>
            </div>
          </Link>

          <Link to="/doctor/settings">
            <div className={`menu-item ${currentPage === "settings" ? "active" : ""}`}>
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
    </>
  )
}

export default Sidebar
