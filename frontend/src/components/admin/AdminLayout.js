"use client"

import { useState, useEffect } from "react"
import { useNavigate, Outlet } from "react-router-dom"
import { logout, getCurrentUser } from "../../services/authService"
import "./AdminLayout.css"

const AdminLayout = () => {
  const navigate = useNavigate()
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié et est un administrateur
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token || userType !== "admin") {
      navigate("/login")
      return
    }
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem)
    setIsMobileMenuOpen(false)

    // Navigation vers la page correspondante
    switch (menuItem) {
      case "dashboard":
        navigate("/admin/dashboard")
        break
      case "doctors":
        navigate("/admin/doctors")
        break
      case "patients":
        navigate("/admin/patients")
        break
      case "settings":
        navigate("/admin/settings")
        break
      default:
        navigate("/admin/dashboard")
    }
  }

  // Obtenir le nom d'utilisateur actuel
  const currentUser = getCurrentUser()
  const username = currentUser ? currentUser.username : "Admin"

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">M</span>
            <span className="logo-text">MediConnect</span>
          </div>
          <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="admin-menu">
          <div
            className={`menu-item ${activeMenuItem === "dashboard" ? "active" : ""}`}
            onClick={() => handleMenuClick("dashboard")}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Tableau de bord</span>
          </div>

          <div className="menu-section">Gestion des utilisateurs</div>

          <div
            className={`menu-item ${activeMenuItem === "doctors" ? "active" : ""}`}
            onClick={() => handleMenuClick("doctors")}
          >
            <i className="fas fa-user-md"></i>
            <span>Médecins</span>
          </div>

          <div
            className={`menu-item ${activeMenuItem === "patients" ? "active" : ""}`}
            onClick={() => handleMenuClick("patients")}
          >
            <i className="fas fa-user"></i>
            <span>Patients</span>
          </div>

          <div className="menu-section">Configuration</div>

          <div
            className={`menu-item ${activeMenuItem === "settings" ? "active" : ""}`}
            onClick={() => handleMenuClick("settings")}
          >
            <i className="fas fa-cog"></i>
            <span>Paramètres</span>
          </div>

          <div className="menu-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Header */}
        <div className="admin-header">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>

          <div className="header-title">
            <h1>Administration</h1>
          </div>

          <div className="user-profile">
            <div className="notification-icon">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </div>

            <div className="user-info">
              <span className="user-name">{username}</span>
              <span className="user-role">Administrateur</span>
            </div>

            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        {/* Page Content */}
        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
