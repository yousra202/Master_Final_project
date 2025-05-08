"use client"
import { Link, useNavigate } from "react-router-dom"
import { getCurrentUser, logout } from "../../services/authService"
import "./Header.css"
import ProfileInitials from "../common/ProfileInitials"
import PatientHeader from "./PatientHeader"

const Header = () => {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate("/login")
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
                  <Link to="/doctor/dashboard" className="btn btn-outline">
                    Tableau de bord
                  </Link>
                ) : (
                  <Link to="/patient/dashboard" className="btn btn-outline">
                    Tableau de bord
                  </Link>
                )}
                <button onClick={handleLogout} className="btn btn-primary">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Connexion
                </Link>
                <Link to="/register/patient" className="btn btn-primary">
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
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/doctors">Médecins</Link>
              </li>
              <li>
                <Link to="/specialties">Spécialités</Link>
              </li>
              <li>
                <Link to="/clinics">Cliniques</Link>
              </li>
              <li>
                <Link to="/pharmacies">Pharmacies</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>

            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
