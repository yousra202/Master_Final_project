"use client"

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authService";
import ProfileInitials from "../common/ProfileInitials";
import { Search, ChevronDown, User, Calendar, MessageSquare, Home, Stethoscope, Settings, LogOut, LayoutDashboard  } from "lucide-react";
import "./PatientHeader.css";

const PatientHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="patient-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-primary">Plateforme</span>
          <span className="logo-secondary">Santé</span>
        </Link>

        <nav className="main-nav">
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={`nav-link ${isActive("/") ? "active" : ""}`}
              >
                <Home size={18} className="nav-icon" />
                <span>Accueil</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/doctors" 
                className={`nav-link ${isActive("/doctors") ? "active" : ""}`}
              >
                <Stethoscope size={18} className="nav-icon" />
                <span>Médecins</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/patient/appointments" 
                className={`nav-link ${isActive("/patient/appointments") ? "active" : ""}`}
              >
                <Calendar size={18} className="nav-icon" />
                <span>Mes rendez-vous</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/patient/medical-record" 
                className={`nav-link ${isActive("/patient/medical-record") ? "active" : ""}`}
              >
                <User size={18} className="nav-icon" />
                <span>Mon dossier</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/patient/messages" 
                className={`nav-link ${isActive("/patient/messages") ? "active" : ""}`}
              >
                <MessageSquare size={18} className="nav-icon" />
                <span>Messages</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-right">
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
                  name={currentUser?.username } 
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
                    className={`dropdown-item ${isActive("/patient/dashboard") ? "active" : ""}`}
                    role="menuitem"
                  >
                    <LayoutDashboard size={16} />
                    <span>Tableau de bord</span>
                  </Link>
                </li>
                <li role="none">
                  <Link 
                    to="/patient/settings" 
                    className={`dropdown-item ${isActive("/patient/settings") ? "active" : ""}`}
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