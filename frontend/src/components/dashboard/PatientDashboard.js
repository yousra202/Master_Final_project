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
  Box,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  CalendarMonth as CalendarIcon,
  MedicalInformation as MedicalIcon,
  Search as SearchIcon,
  Notifications as NotificationIcon,
} from "@mui/icons-material"

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [medicalRecord, setMedicalRecord] = useState(null)

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

        setUpcomingAppointments(upcoming.slice(0, 3)) // Get only the next 3 appointments

        // Fetch medical record summary
        try {
          const medicalRecordResponse = await axios.get("http://localhost:8000/api/my-record/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          setMedicalRecord(medicalRecordResponse.data)
        } catch (err) {
          console.log("Medical record not found or not accessible yet")
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
                  to="/patient/appointments"
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
                  to="/patient/medical-record"
                  variant="outlined"
                  startIcon={<MedicalIcon />}
                  fullWidth
                  sx={{ height: "100%" }}
                >
                  Mon dossier médical
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  component={Link}
                  to="/"
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  fullWidth
                  sx={{ height: "100%" }}
                >
                  Rechercher un médecin
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button variant="outlined" startIcon={<NotificationIcon />} fullWidth sx={{ height: "100%" }} disabled>
                  Notifications
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
                        primary={`Dr. ${appointment.doctor.user.username} - ${appointment.consultation_type === "physical" ? "Présentiel" : "En ligne"}`}
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
              <Button component={Link} to="/patient/appointments" size="small" color="primary">
                Voir tous les rendez-vous
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Medical Record Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mon dossier médical
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {medicalRecord ? (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    <strong>Dossier créé le:</strong> {new Date(medicalRecord.created_at).toLocaleDateString()}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Informations importantes:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "error.light", color: "error.contrastText" }}>
                          <Typography variant="body2">Allergies: {medicalRecord.allergies_count || 0}</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 1, textAlign: "center", bgcolor: "info.light", color: "info.contrastText" }}>
                          <Typography variant="body2">
                            Médicaments actifs: {medicalRecord.active_medications_count || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Historique:
                    </Typography>
                    <Paper sx={{ p: 1, textAlign: "center", bgcolor: "primary.light", color: "primary.contrastText" }}>
                      <Typography variant="body2">Consultations: {medicalRecord.consultations_count || 0}</Typography>
                    </Paper>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Votre dossier médical sera créé lors de votre première consultation
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/patient/medical-record"
                size="small"
                color="primary"
                disabled={!medicalRecord}
              >
                Voir mon dossier médical
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default PatientDashboard
