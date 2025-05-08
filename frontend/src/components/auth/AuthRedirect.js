"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"

const AuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const user = getCurrentUser()

    if (user) {
      if (user.userType === "doctor") {
        navigate("/doctor/dashboard")
      } else if (user.userType === "admin") {
        navigate("/admin/dashboard")
      } else {
        // For patients, redirect to home page
        navigate("/")
      }
    } else {
      navigate("/login")
    }
  }, [navigate])

  return null
}

export default AuthRedirect
