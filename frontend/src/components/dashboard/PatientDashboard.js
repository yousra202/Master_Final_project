"use client"

import { useEffect, useState } from "react"
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CardHeader, Button, Divider } from "@mui/material"
import { Person as PersonIcon, Event as EventIcon, MedicalInformation as MedicalInfoIcon } from "@mui/icons-material"
import axios from "axios"
import { getCurrentUser } from "../../services/authService"
import { useNavigate } from "react-router-dom"

const PatientDashboard = () => {
  const navigate = useNavigate()
  const [patientData, setPatientData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:8000/api/patient/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setPatientData(response.data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load patient data")
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [])

  const currentUser = getCurrentUser()
  const username = currentUser ? currentUser.username : ""

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Hello {username}
        </Typography>
        <Typography variant="body1">
          Welcome to your dashboard. Here you can book appointments, view your medical records, and update your profile.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Appointments" avatar={<EventIcon color="primary" />} />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                You have no upcoming appointments.
              </Typography>
              <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/doctors")}>
                Book Appointment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Medical Records" avatar={<MedicalInfoIcon color="primary" />} />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                View your medical history and records.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => navigate("/patient/medical-record")}
              >
                View Records
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Profile" avatar={<PersonIcon color="primary" />} />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Update your personal information and preferences.
              </Typography>
              <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => navigate("/patient/settings")}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Paper sx={{ p: 2, mt: 3, bgcolor: "error.light" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
    </Container>
  )
}

export default PatientDashboard
