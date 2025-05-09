"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  CalendarMonth as CalendarIcon,
  MedicalInformation as MedicalIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material"

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [patientRecords, setPatientRecords] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour accéder à cette page")
          setLoading(false)
          return
        }

        // Fetch upcoming appointments
        const appointmentsResponse = await axios.get("http://localhost:8000/api/consultations/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Filter upcoming appointments
        const upcoming = appointmentsResponse.data
          .filter(
            (appointment) =>
              (appointment.status === "confirmed" || appointment.status === "pending") &&
              new Date(appointment.date) >= new Date(),
          )
          .sort((a, b) => new Date(a.date) - new Date(b.date))

        setUpcomingAppointments(upcoming.slice(0, 5)) // Get only the next 5 appointments

        // Fetch patient medical records
        try {
          const recordsResponse = await axios.get("http://localhost:8000/api/records/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setPatientRecords(recordsResponse.data)
        } catch (err) {
          console.log("No patient records found or not accessible yet")
          // This is not a critical error, so we don't set the error state
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    )
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/doctor/appointments"
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  fullWidth
                  sx={{ height: "100%" }}
                >
                  Mes rendez-vous
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/doctor/settings"
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  fullWidth
                  sx={{ height: "100%" }}
                >
                  Paramètres
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Prochains rendez-vous
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {upcomingAppointments.length > 0 ? (
                <List>
                  {upcomingAppointments.map((appointment) => (
                    <ListItem key={appointment.id} divider>
                      <ListItemText
                        primary={`Patient: ${appointment.patient.user.username} - ${appointment.consultation_type === "physical" ? "Présentiel" : "En ligne"}`}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {new Date(appointment.date).toLocaleDateString()} à {appointment.start_time}
                            </Typography>
                            <br />
                            <Chip
                              size="small"
                              label={appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                              color={appointment.status === "confirmed" ? "success" : "warning"}
                              sx={{ mt: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun rendez-vous à venir
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button component={Link} to="/doctor/appointments" size="small" color="primary">
                Voir tous les rendez-vous
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Patient Records */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dossiers médicaux des patients
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {patientRecords && patientRecords.length > 0 ? (
                <List>
                  {patientRecords.slice(0, 5).map((record) => (
                    <ListItem key={record.id} divider>
                      <ListItemText
                        primary={record.patient.user.username}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Allergies: {record.allergies_count || 0} | Médicaments actifs:{" "}
                              {record.active_medications_count || 0}
                            </Typography>
                          </>
                        }
                      />
                      <Button
                        component={Link}
                        to={`/doctor/medical-records/${record.id}`}
                        size="small"
                        variant="outlined"
                        startIcon={<MedicalIcon />}
                      >
                        Voir
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun dossier médical de patient disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default DoctorDashboard
