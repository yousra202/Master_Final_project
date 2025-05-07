"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./PatientHeader.css"
import { getCurrentUser, logout } from "../../services/authService"

const PatientHeader = () => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
  }

  return (
    <header className="patient-header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">PlateformeSanté</Link>
        </div>

        <div className="search-container">
          <input type="text" placeholder="Rechercher..." className="search-input" />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="mobile-menu-button" onClick={toggleMobileMenu}>
          <i className={showMobileMenu ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <div className="user-profile" onClick={toggleDropdown}>
          <div className="profile-image">
            {currentUser?.profilePicture ? (
              <img src={currentUser.profilePicture || "/placeholder.svg"} alt="Profile" />
            ) : (
              <div className="profile-initials">{currentUser?.username?.charAt(0) || "U"}</div>
            )}
          </div>
          <span className="profile-name">{currentUser?.username || "User"}</span>
          <i className={`fas fa-chevron-${showDropdown ? "up" : "down"}`}></i>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/patient/profile" className="dropdown-item">
                <i className="fas fa-user"></i> Mon profil
              </Link>
              <Link to="/patient/settings" className="dropdown-item">
                <i className="fas fa-cog"></i> Paramètres
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className={`main-nav ${showMobileMenu ? "show" : ""}`}>
        <ul className="nav-links">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Accueil
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/doctors" className="nav-link">
              Médecins
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/appointments" className="nav-link">
              Mes rendez-vous
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/consultations" className="nav-link">
              Mes consultations
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/medical-record" className="nav-link">
              Mon dossier
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/patient/messages" className="nav-link">
              Messages
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default PatientHeader
