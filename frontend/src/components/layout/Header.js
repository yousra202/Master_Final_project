"use client"

import { Link, useNavigate, useLocation } from "react-router-dom"
import { getCurrentUser, logout } from "../../services/authService"
import "./Header.css"
import ProfileInitials from "../common/ProfileInitials"
import PatientHeader from "./PatientHeader"
import { Search } from "lucide-react"

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path))
  }

  // If user is a patient, show the PatientHeader
  if (currentUser && currentUser.userType === "patient") {
    return <PatientHeader />
  }

  return (
    <header className="main-header">
      <div className="container">
        <div className="header-top">
          <Link to="/" className="logo">
            Plateforme<span>Santé</span>
          </Link>
          <div className="auth-buttons">
            {currentUser ? (
              <>
                <div className="user-welcome">
                  {currentUser.userType === "doctor" ? (
                    <ProfileInitials name={currentUser.username} size={40} />
                  ) : (
                    <ProfileInitials name={currentUser.username} size={40} bgColor="#3498db" />
                  )}
                  <span className="welcome-text">Bonjour, {currentUser.username}</span>
                </div>
                {currentUser.userType === "doctor" ? (
                  <Link 
                    to="/doctor/dashboard" 
                    className={`btn btn-outline ${isActive('/doctor/dashboard') ? 'active' : ''}`}
                  >
                    Tableau de bord
                  </Link>
                ) : (
                  <Link 
                    to="/patient/dashboard" 
                    className={`btn btn-outline ${isActive('/patient/dashboard') ? 'active' : ''}`}
                  >
                    Tableau de bord
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-primary">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`btn btn-outline ${isActive('/login') ? 'active' : ''}`}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register/patient" 
                  className={`btn btn-primary ${isActive('/register') ? 'active' : ''}`}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>

        <nav>
          <div className="nav-menu">
            <ul className="nav-links">
              <li>
                <Link 
                  to="/" 
                  className={isActive("/") ? "active" : ""}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link 
                  to="/doctors" 
                  className={isActive("/doctors") ? "active" : ""}
                >
                  Médecins
                </Link>
              </li>
              <li>
                <Link 
                  to="/specialties" 
                  className={isActive("/specialties") ? "active" : ""}
                >
                  Spécialités
                </Link>
              </li>
              <li>
                <Link 
                  to="/blog" 
                  className={isActive("/blog") ? "active" : ""}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={isActive("/contact") ? "active" : ""}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header