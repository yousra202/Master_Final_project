"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"

const AuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (currentUser) {
      if (currentUser.userType === "doctor") {
        navigate("/doctor/dashboard")
      } else if (currentUser.userType === "patient") {
        navigate("/patient/dashboard")
      } else if (currentUser.userType === "admin") {
        navigate("/admin/dashboard")
      }
    } else {
      navigate("/login")
    }
  }, [navigate])

  return null
}

export default AuthRedirect
