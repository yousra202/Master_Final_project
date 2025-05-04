import axios from "axios"
import jwtDecode from "jwt-decode"

const API_URL = "http://localhost:8000/api"

// Register doctor
export const registerDoctor = async (doctorData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/doctor/register/`, doctorData)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error")
  }
}

// Register patient
export const registerPatient = async (patientData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/patient/register/`, patientData)
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error")
  }
}

// Login user
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login/`, credentials)
    if (response.data.access) {
      localStorage.setItem("token", response.data.access)
      localStorage.setItem("refresh_token", response.data.refresh)
      localStorage.setItem("user_type", response.data.user_type)
      localStorage.setItem("username", response.data.username)
    }
    return response.data
  } catch (error) {
    throw error.response ? error.response.data : new Error("Network error")
  }
}

// Logout user
export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("refresh_token")
  localStorage.removeItem("user_type")
  localStorage.removeItem("username")
}

// Get current user
export const getCurrentUser = () => {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const decoded = jwtDecode(token)
    return {
      username: localStorage.getItem("username"),
      userType: localStorage.getItem("user_type"),
      exp: decoded.exp,
    }
  } catch (error) {
    return null
  }
}

// Check if token is expired
export const isTokenExpired = () => {
  const token = localStorage.getItem("token")
  if (!token) return true

  try {
    const decoded = jwtDecode(token)
    return decoded.exp < Date.now() / 1000
  } catch (error) {
    return true
  }
}

// Refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) throw new Error("No refresh token available")

    const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
      refresh: refreshToken,
    })

    if (response.data.access) {
      localStorage.setItem("token", response.data.access)
      return true
    }
    return false
  } catch (error) {
    logout()
    return false
  }
}

// Add a function to check if the token is valid
export const checkTokenValidity = async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) return false

    // Make a request to a protected endpoint to check if token is valid
    const response = await axios.get("http://localhost:8000/api/auth/verify-token/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return response.status === 200
  } catch (error) {
    console.error("Token validation error:", error)
    return false
  }
}

// Setup axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (await refreshToken()) {
        originalRequest.headers["Authorization"] = `Bearer ${localStorage.getItem("token")}`
        return axios(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)
