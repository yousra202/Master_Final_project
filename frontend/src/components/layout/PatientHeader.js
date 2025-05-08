"use client"

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authService";
import ProfileInitials from "../common/ProfileInitials";
import { Search, ChevronDown, Settings, LogOut, LayoutDashboard } from "lucide-react";
import "./PatientHeader.css";

const PatientHeader = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="patient-header" role="banner">
      <div className="header-container">
        <Link to="/" className="logo" aria-label="Retour à l'accueil">
          Plateforme<span>Santé</span>
        </Link>

        <nav className="main-nav" aria-label="Navigation principale">
          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link">
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/doctors" className="nav-link">
                Médecins
              </Link>
            </li>
            <li>
              <Link to="/patient/appointments" className="nav-link">
                Mes rendez-vous
              </Link>
            </li>
            <li>
              <Link to="/patient/medical-record" className="nav-link">
                Mon dossier
              </Link>
            </li>
            <li>
              <Link to="/patient/messages" className="nav-link">
                Messages
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-right">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              aria-label="Rechercher sur le site"
            />
          </div>

          <div className="user-profile" ref={dropdownRef}>
            <button 
              className="profile-trigger"
              onClick={toggleDropdown}
              aria-expanded={dropdownOpen}
              aria-label="Menu utilisateur"
            >
              {currentUser && currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt={`Profil de ${currentUser.username}`}
                  className="profile-image"
                  width={35}
                  height={35}
                />
              ) : (
                <ProfileInitials 
                  name={currentUser?.username || "User"} 
                  size={40} 
                  bgColor="#3498db" 
                />
              )}
              <span className="username">{currentUser?.username}</span>
              <ChevronDown 
                className={`dropdown-icon ${dropdownOpen ? "rotate" : ""}`} 
                size={16} 
              />
            </button>

            {dropdownOpen && (
              <ul className="profile-dropdown" role="menu">
                <li role="none">
                  <Link 
                    to="/patient/dashboard" 
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <LayoutDashboard size={16} />
                    <span>Tableau de bord</span>
                  </Link>
                </li>
                <li role="none">
                  <Link 
                    to="/patient/settings" 
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <Settings size={16} />
                    <span>Paramètres</span>
                  </Link>
                </li>
                <li role="none">
                  <button 
                    className="dropdown-item"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;