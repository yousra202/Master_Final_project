"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Alert,
  TextField,
  CircularProgress,
  Avatar,
} from "@mui/material"
import { Search, Add, Visibility } from "@mui/icons-material"

const DoctorMedicalRecords = () => {
  const navigate = useNavigate()
  const [patientRecords, setPatientRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const fetchPatientRecords = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        // Fetch all patient records
        const response = await axios.get("http://localhost:8000/api/records/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setPatientRecords(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching patient records:", err)
        setError("Impossible de charger les dossiers médicaux. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchPatientRecords()
  }, [navigate])

  // Filter patient records based on search term and status
  const filteredPatientRecords = patientRecords.filter((record) => {
    const matchesSearch =
      record.patient?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id?.toString().includes(searchTerm)

    if (filterStatus === "all") return matchesSearch
    if (filterStatus === "urgent") return matchesSearch && record.status === "urgent"
    if (filterStatus === "active") return matchesSearch && record.active_medications_count > 0

    return matchesSearch
  })

  const handleViewRecord = (recordId) => {
    navigate(`/doctor/medical-records/${recordId}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dossiers Médicaux
        </Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ bgcolor: "#27ae60", "&:hover": { bgcolor: "#219653" } }}>
          Nouveau Dossier
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ position: "relative", flexGrow: 1 }}>
            <TextField
              placeholder="Rechercher un patient..."
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant={filterStatus === "all" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilterStatus("all")}
            >
              Tous
            </Button>
            <Button
              variant={filterStatus === "active" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilterStatus("active")}
            >
              Actifs
            </Button>
            <Button
              variant={filterStatus === "urgent" ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilterStatus("urgent")}
            >
              Urgents
            </Button>
          </Box>
        </Box>
      </Paper>

      {filteredPatientRecords.length > 0 ? (
        <Grid container spacing={2}>
          {filteredPatientRecords.map((record) => (
            <Grid item xs={12} sm={6} md={4} key={record.id}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                    cursor: "pointer",
                  },
                }}
                onClick={() => handleViewRecord(record.id)}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: "#3498db",
                      mr: 2,
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {record.patient?.user?.username?.charAt(0).toUpperCase() || "P"}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                      {record.patient?.user?.username || "Patient"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {record.id}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 2, flexGrow: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Allergies:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {record.allergies_count || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Médicaments actifs:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {record.active_medications_count || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Dernière consultation:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {record.last_consultation_date
                        ? new Date(record.last_consultation_date).toLocaleDateString()
                        : "Aucune"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {record.allergies_count > 0 && (
                    <Chip
                      size="small"
                      label="Allergies"
                      sx={{ bgcolor: "#ffebee", color: "#c62828", borderColor: "#c62828" }}
                    />
                  )}
                  {record.status === "urgent" && <Chip size="small" label="Urgent" color="error" />}
                  {record.active_medications_count > 0 && (
                    <Chip
                      size="small"
                      label="Traitement en cours"
                      sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", borderColor: "#2e7d32" }}
                    />
                  )}
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewRecord(record.id)
                  }}
                >
                  Voir le dossier
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun dossier médical trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aucun dossier ne correspond à votre recherche ou vous n'avez pas encore de patients.
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default DoctorMedicalRecords
