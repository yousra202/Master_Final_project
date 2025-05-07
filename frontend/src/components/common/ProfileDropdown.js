"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logout } from "../../services/authService"
import ProfileInitials from "./ProfileInitials"
import "./ProfileDropdown.css"

const ProfileDropdown = ({ user, size = 40, bgColor }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSettings = () => {
    if (user.userType === "doctor") {
      navigate("/doctor/settings")
    } else if (user.userType === "patient") {
      navigate("/patient/settings")
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <div className="profile-trigger" onClick={toggleDropdown}>
        <ProfileInitials name={user.username} size={size} bgColor={bgColor} />
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <ProfileInitials name={user.username} size={40} bgColor={bgColor} />
            <div className="user-info">
              <p className="user-name">{user.userType === "doctor" ? `Dr. ${user.username}` : user.username}</p>
              <p className="user-email">{user.email || "No email provided"}</p>
            </div>
          </div>
          <div className="dropdown-divider"></div>
          <div className="dropdown-item" onClick={handleSettings}>
            <i className="fas fa-cog"></i>
            <span>Paramètres</span>
          </div>
          <div className="dropdown-item" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
