"use client"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { getCurrentUser, isTokenExpired, refreshToken } from "../../services/authService"
import { CircularProgress, Box } from "@mui/material"

const ProtectedRoute = ({ children, userType }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser()

      if (!currentUser) {
        console.log("No current user found")
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      if (isTokenExpired()) {
        console.log("Token is expired, attempting to refresh")
        const refreshed = await refreshToken()
        if (!refreshed) {
          console.log("Token refresh failed")
          setIsAuthenticated(false)
          setIsLoading(false)
          return
        }
      }

      if (userType && currentUser.userType !== userType) {
        console.log(`User type mismatch: expected ${userType}, got ${currentUser.userType}`)
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      console.log("Authentication successful")
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [userType])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

export default ProtectedRoute
