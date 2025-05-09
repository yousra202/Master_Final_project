"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"
import { CircularProgress, Box, Typography } from "@mui/material"

const AuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const redirectUser = () => {
      const currentUser = getCurrentUser()

      if (!currentUser) {
        navigate("/login")
        return
      }

      switch (currentUser.userType) {
        case "doctor":
          navigate("/doctor/dashboard")
          break
        case "patient":
          // Redirect patients to the home page instead of dashboard
          navigate("/")
          break
        case "admin":
          navigate("/admin/dashboard")
          break
        default:
          navigate("/login")
      }
    }

    // Add a small delay to ensure the UI updates before redirect
    const timer = setTimeout(() => {
      redirectUser()
    }, 500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 4 }}>
        Redirection en cours...
      </Typography>
    </Box>
  )
}

export default AuthRedirect
