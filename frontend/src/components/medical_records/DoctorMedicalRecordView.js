"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Badge,
} from "@mui/material"
import {
  MedicalInformation,
  Medication,
  Science,
  Image as ImageIcon,
  MonitorHeart,
  Warning,
  Add,
  ArrowBack,
  Save,
  Upload,
  Search,
  Notifications,
  Print,
} from "@mui/icons-material"

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-record-tabpanel-${index}`}
      aria-labelledby={`medical-record-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const DoctorMedicalRecordView = () => {
  const { recordId } = useParams()
  const navigate = useNavigate()
  const [value, setValue] = useState(0)
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [patientRecords, setPatientRecords] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [formData, setFormData] = useState({})
  const [fileUpload, setFileUpload] = useState(null)

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const response = await axios.get(`http://localhost:8000/api/records/${recordId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setMedicalRecord(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medical record:", err)
        setError("Impossible de charger le dossier médical. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchMedicalRecord()
  }, [recordId, navigate])

  useEffect(() => {
    const fetchPatientRecords = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        // Fetch all patient records - this matches the API call in the dashboard
        const response = await axios.get("http://localhost:8000/api/records/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setPatientRecords(response.data)
        setLoadingPatients(false)
      } catch (err) {
        console.error("Error fetching patient records:", err)
        setLoadingPatients(false)
      }
    }

    fetchPatientRecords()
  }, [navigate])

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleOpenDialog = (type) => {
    setDialogType(type)
    setFormData({})
    setFileUpload(null)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleFileChange = (e) => {
    setFileUpload(e.target.files[0])
  }

  const handlePatientClick = (patientRecordId) => {
    navigate(`/doctor/medical-records/${patientRecordId}`)
  }

  const handleSubmitForm = async () => {
    try {
      const token = localStorage.getItem("token")
      let endpoint = ""
      let data = formData

      switch (dialogType) {
        case "history":
          endpoint = `http://localhost:8000/api/records/${recordId}/history/`
          break
        case "allergy":
          endpoint = `http://localhost:8000/api/records/${recordId}/allergies/`
          break
        case "medication":
          endpoint = `http://localhost:8000/api/records/${recordId}/medications/`
          break
        case "labResult":
          endpoint = `http://localhost:8000/api/records/${recordId}/lab-results/`
          break
        case "vitalSign":
          endpoint = `http://localhost:8000/api/records/${recordId}/vital-signs/`
          break
        case "document":
          endpoint = `http://localhost:8000/api/records/${recordId}/documents/`
          // Use FormData for file uploads
          if (fileUpload) {
            data = new FormData()
            for (const key in formData) {
              data.append(key, formData[key])
            }
            data.append("file", fileUpload)
          }
          break
        default:
          console.error("Unknown dialog type")
          return
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Add content type header if not a file upload
      if (dialogType !== "document") {
        config.headers["Content-Type"] = "application/json"
      }

      await axios.post(endpoint, data, config)

      // Refresh medical record data
      const response = await axios.get(`http://localhost:8000/api/records/${recordId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMedicalRecord(response.data)
      handleCloseDialog()
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Échec de l'enregistrement des données. Veuillez réessayer.")
    }
  }

  const handleAddPrescription = async (consultationId, prescriptionData) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(`http://localhost:8000/api/consultations/${consultationId}/prescriptions/`, prescriptionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Refresh medical record data
      const response = await axios.get(`http://localhost:8000/api/records/${recordId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMedicalRecord(response.data)
    } catch (err) {
      console.error("Error adding prescription:", err)
      setError("Échec de l'ajout de la prescription. Veuillez réessayer.")
    }
  }

  // Filter patient records based on search term
  const filteredPatientRecords = patientRecords.filter(
    (record) =>
      record.patient?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id?.toString().includes(searchTerm),
  )

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={50} sx={{ mb: 2 }} />
          <Typography variant="h6">Chargement du dossier médical...</Typography>
        </Box>
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
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <IconButton color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: "#2c3e50" }}>
              Dossier Médical du Patient
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton color="inherit" sx={{ position: "relative" }}>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#3498db" }}>
                  {medicalRecord?.doctor?.user?.username?.charAt(0).toUpperCase() || "D"}
                </Avatar>
                <Typography variant="body2" sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                  Dr. {medicalRecord?.doctor?.user?.username || "Médecin"}
                </Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          {/* Patient List */}
          <Box
            sx={{
              width: 300,
              flexShrink: 0,
              borderRight: "1px solid #eee",
              display: { xs: "none", md: "block" },
              overflow: "auto",
            }}
          >
            <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "#2c3e50" }}>
                  Liste des Patients
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  sx={{ bgcolor: "#27ae60", "&:hover": { bgcolor: "#219653" } }}
                >
                  Nouveau
                </Button>
              </Box>

              <Box sx={{ position: "relative", mb: 2 }}>
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
                  sx={{ bgcolor: "#f8f9fa" }}
                />
              </Box>

              <Box sx={{ display: "flex", borderBottom: "1px solid #ddd" }}>
                <Button
                  sx={{
                    px: 2,
                    py: 1,
                    color: "#3498db",
                    borderBottom: "2px solid #3498db",
                    borderRadius: 0,
                    fontWeight: "medium",
                  }}
                >
                  Tous
                </Button>
                <Button sx={{ px: 2, py: 1, color: "text.secondary", borderRadius: 0 }}>Actifs</Button>
                <Button sx={{ px: 2, py: 1, color: "text.secondary", borderRadius: 0 }}>Urgents</Button>
              </Box>
            </Box>

            <Box sx={{ p: 1 }}>
              {loadingPatients ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : filteredPatientRecords.length > 0 ? (
                filteredPatientRecords.map((record) => (
                  <Paper
                    key={record.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: record.id === Number(recordId) ? "#e3f2fd" : "white",
                      border: record.id === Number(recordId) ? "1px solid #3498db" : "1px solid #eee",
                      cursor: "pointer",
                      "&:hover": { bgcolor: record.id === Number(recordId) ? "#e3f2fd" : "#f8f9fa" },
                    }}
                    onClick={() => handlePatientClick(record.id)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ width: 40, height: 40, mr: 1.5, bgcolor: "grey.300" }}>
                        {record.patient?.user?.username?.charAt(0).toUpperCase() || "P"}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: "#2c3e50",
                              fontWeight: "medium",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {record.patient?.user?.username || "Patient"}
                          </Typography>
                          {record.allergies_count > 0 && (
                            <Chip
                              label="Allergies"
                              size="small"
                              sx={{ ml: 1, bgcolor: "#ffebee", color: "#c62828", borderColor: "#c62828", height: 20 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          ID: {record.id || "N/A"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                          {record.created_at
                            ? `Créé le: ${new Date(record.created_at).toLocaleDateString()}`
                            : "Date inconnue"}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
                  Aucun patient trouvé
                </Typography>
              )}
            </Box>
          </Box>

          {/* Medical Record Content */}
          <Box sx={{ flexGrow: 1, overflow: "auto", bgcolor: "#f8f9fa", p: 3 }}>
            <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {medicalRecord?.allergies &&
                    medicalRecord.allergies.map((allergy) => (
                      <Chip
                        key={allergy.id}
                        icon={<Warning />}
                        label={`Allergie: ${allergy.allergen}`}
                        sx={{ bgcolor: "#ffebee", color: "#c62828", borderColor: "#c62828" }}
                        variant="outlined"
                      />
                    ))}

                  {medicalRecord?.history_entries &&
                    medicalRecord.history_entries
                      .filter((entry) => entry.is_active)
                      .map((entry) => (
                        <Chip
                          key={entry.id}
                          icon={<MedicalInformation />}
                          label={entry.condition}
                          sx={{ bgcolor: "#fff8e1", color: "#ff8f00", borderColor: "#ff8f00" }}
                          variant="outlined"
                        />
                      ))}
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" startIcon={<Print />} size="small">
                    Imprimer
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    size="small"
                    sx={{ bgcolor: "#3498db", "&:hover": { bgcolor: "#2980b9" } }}
                  >
                    Nouvelle consultation
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "#3498db",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {medicalRecord?.patient?.user?.username?.charAt(0).toUpperCase() || "P"}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ color: "#2c3e50", fontWeight: "medium" }}>
                    {medicalRecord?.patient?.user?.username || "Patient"}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, color: "text.secondary" }}>
                    <Typography variant="body2">ID: {medicalRecord?.patient?.id || "N/A"}</Typography>
                    <Typography variant="body2">Email: {medicalRecord?.patient?.user?.email || "N/A"}</Typography>
                    <Typography variant="body2">
                      Dossier créé le: {new Date(medicalRecord?.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Tabs
                value={value}
                onChange={handleTabChange}
                aria-label="medical record tabs"
                sx={{
                  bgcolor: "white",
                  borderRadius: 1,
                  "& .MuiTabs-indicator": { backgroundColor: "#3498db" },
                  "& .Mui-selected": { color: "#3498db" },
                }}
              >
                <Tab label="Résumé" icon={<MedicalInformation />} iconPosition="start" />
                <Tab label="Consultations" icon={<MedicalInformation />} iconPosition="start" />
                <Tab label="Historique Médical" icon={<MedicalInformation />} iconPosition="start" />
                <Tab label="Médicaments" icon={<Medication />} iconPosition="start" />
                <Tab label="Résultats d'Analyses" icon={<Science />} iconPosition="start" />
                <Tab label="Documents" icon={<ImageIcon />} iconPosition="start" />
              </Tabs>
            </Box> 

            {/* Summary Tab */}
            <TabPanel value={value} index={0}>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader
                      title="Conditions Actives"
                      action={
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          size="small"
                          onClick={() => handleOpenDialog("history")}
                        >
                          Ajouter
                        </Button>
                      }
                      sx={{ pb: 1 }}
                    />
                    <Divider />
                    <CardContent>
                      {medicalRecord?.history_entries &&
                      medicalRecord.history_entries.filter((entry) => entry.is_active).length > 0 ? (
                        <List disablePadding>
                          {medicalRecord.history_entries
                            .filter((entry) => entry.is_active)
                            .map((entry) => (
                              <ListItem key={entry.id} sx={{ px: 0, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                                <ListItemText
                                  primary={entry.condition}
                                  secondary={
                                    entry.diagnosis_date
                                      ? `Diagnostiqué le: ${new Date(entry.diagnosis_date).toLocaleDateString()}`
                                      : "Aucune date de diagnostic"
                                  }
                                  primaryTypographyProps={{ fontWeight: "medium" }}
                                />
                              </ListItem>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucune condition active
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader
                      title="Allergies"
                      action={
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          size="small"
                          onClick={() => handleOpenDialog("allergy")}
                        >
                          Ajouter
                        </Button>
                      }
                      sx={{ pb: 1 }}
                    />
                    <Divider />
                    <CardContent>
                      {medicalRecord?.allergies && medicalRecord.allergies.length > 0 ? (
                        <List disablePadding>
                          {medicalRecord.allergies.map((allergy) => (
                            <ListItem key={allergy.id} sx={{ px: 0, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                              <ListItemText
                                primary={`${allergy.allergen} (${allergy.severity})`}
                                secondary={allergy.reaction || "Aucun détail de réaction"}
                                primaryTypographyProps={{ fontWeight: "medium" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucune allergie connue
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardHeader
                      title="Médicaments Actifs"
                      action={
                        <Button
                          variant="outlined"
                          startIcon={<Add />}
                          size="small"
                          onClick={() => handleOpenDialog("medication")}
                        >
                          Ajouter
                        </Button>
                      }
                      sx={{ pb: 1 }}
                    />
                    <Divider />
                    <CardContent>
                      {medicalRecord?.medications &&
                      medicalRecord.medications.filter((med) => med.is_active).length > 0 ? (
                        <List disablePadding>
                          {medicalRecord.medications
                            .filter((med) => med.is_active)
                            .map((medication) => (
                              <ListItem key={medication.id} sx={{ px: 0, py: 1, borderBottom: "1px solid #f0f0f0" }}>
                                <ListItemText
                                  primary={medication.name}
                                  secondary={`${medication.dosage}, ${medication.frequency}`}
                                  primaryTypographyProps={{ fontWeight: "medium" }}
                                />
                              </ListItem>
                            ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Aucun médicament actif
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Card>
                <CardHeader
                  title="Dernière Consultation"
                  action={
                    <Button variant="outlined" size="small" onClick={() => setValue(1)}>
                      Voir toutes
                    </Button>
                  }
                  sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent>
                  {medicalRecord?.consultations && medicalRecord.consultations.length > 0 ? (
                    <Paper sx={{ p: 2, border: "1px solid #eee" }} elevation={0}>
                      {(() => {
                        const consultation = medicalRecord.consultations[0]
                        return (
                          <>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                                Consultation du {new Date(consultation.date).toLocaleDateString()}
                              </Typography>
                              <Chip
                                label={consultation.status}
                                color={
                                  consultation.status === "completed"
                                    ? "success"
                                    : consultation.status === "cancelled"
                                      ? "error"
                                      : "primary"
                                }
                                size="small"
                              />
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                <strong>Médecin:</strong> Dr. {consultation.doctor.user.username}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Type:</strong>{" "}
                                {consultation.consultation_type === "physical" ? "Présentiel" : "En ligne"}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Heure:</strong> {consultation.start_time} - {consultation.end_time}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Symptômes:</strong> {consultation.symptoms || "Non spécifiés"}
                              </Typography>
                            </Box>
                            {consultation.diagnosis && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                                  Diagnostic:
                                </Typography>
                                <Typography variant="body2">{consultation.diagnosis}</Typography>
                              </Box>
                            )}
                            {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: "medium", mb: 0.5 }}>
                                  Prescriptions:
                                </Typography>
                                <List dense>
                                  {consultation.prescriptions.map((prescription, index) => (
                                    <ListItem key={index} sx={{ pl: 2, borderLeft: "2px solid #eee" }}>
                                      <ListItemText
                                        primary={prescription.medication}
                                        secondary={`${prescription.dosage}, ${prescription.frequency}, ${prescription.duration}`}
                                        primaryTypographyProps={{ fontWeight: "medium" }}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </>
                        )
                      })()}
                    </Paper>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune consultation enregistrée
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Consultations Tab */}
            <TabPanel value={value} index={1}>
              <Card>
                <CardHeader title="Historique des Consultations" />
                <Divider />
                <CardContent>
                  {medicalRecord?.consultations && medicalRecord.consultations.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {medicalRecord.consultations.map((consultation) => (
                        <Paper key={consultation.id} sx={{ p: 2, border: "1px solid #eee" }} elevation={0}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                              Consultation du {new Date(consultation.date).toLocaleDateString()}
                            </Typography>
                            <Chip
                              label={
                                consultation.status === "completed"
                                  ? "Terminée"
                                  : consultation.status === "cancelled"
                                    ? "Annulée"
                                    : consultation.status === "confirmed"
                                      ? "Confirmée"
                                      : "En attente"
                              }
                              color={
                                consultation.status === "completed"
                                  ? "success"
                                  : consultation.status === "cancelled"
                                    ? "error"
                                    : "primary"
                              }
                              size="small"
                            />
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Médecin:</strong> Dr. {consultation.doctor.user.username}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Type:</strong>{" "}
                              {consultation.consultation_type === "physical" ? "Présentiel" : "En ligne"}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Heure:</strong> {consultation.start_time} - {consultation.end_time}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Symptômes:</strong> {consultation.symptoms || "Non spécifiés"}
                            </Typography>
                          </Box>

                          {/* Editable fields for doctor */}
                          {(consultation.status === "confirmed" || consultation.status === "completed") && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Notes du Médecin
                              </Typography>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <TextField
                                  label="Diagnostic"
                                  multiline
                                  rows={2}
                                  fullWidth
                                  defaultValue={consultation.diagnosis || ""}
                                  onChange={(e) => {
                                    // Update consultation locally
                                    const updatedConsultations = [...medicalRecord.consultations]
                                    const index = updatedConsultations.findIndex((c) => c.id === consultation.id)
                                    if (index !== -1) {
                                      updatedConsultations[index] = {
                                        ...updatedConsultations[index],
                                        diagnosis: e.target.value,
                                      }
                                      setMedicalRecord({
                                        ...medicalRecord,
                                        consultations: updatedConsultations,
                                      })
                                    }
                                  }}
                                />
                                <TextField
                                  label="Traitement"
                                  multiline
                                  rows={2}
                                  fullWidth
                                  defaultValue={consultation.treatment || ""}
                                  onChange={(e) => {
                                    // Update consultation locally
                                    const updatedConsultations = [...medicalRecord.consultations]
                                    const index = updatedConsultations.findIndex((c) => c.id === consultation.id)
                                    if (index !== -1) {
                                      updatedConsultations[index] = {
                                        ...updatedConsultations[index],
                                        treatment: e.target.value,
                                      }
                                      setMedicalRecord({
                                        ...medicalRecord,
                                        consultations: updatedConsultations,
                                      })
                                    }
                                  }}
                                />
                                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                  <Button
                                    variant="contained"
                                    startIcon={<Save />}
                                    sx={{ bgcolor: "#3498db", "&:hover": { bgcolor: "#2980b9" } }}
                                    onClick={async () => {
                                      try {
                                        const token = localStorage.getItem("token")
                                        const consultationToUpdate = medicalRecord.consultations.find(
                                          (c) => c.id === consultation.id,
                                        )
                                        await axios.put(
                                          `http://localhost:8000/api/consultations/${consultation.id}/`,
                                          {
                                            diagnosis: consultationToUpdate.diagnosis,
                                            treatment: consultationToUpdate.treatment,
                                            status:
                                              consultation.status === "confirmed" ? "completed" : consultation.status,
                                          },
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          },
                                        )

                                        // Refresh medical record data
                                        const response = await axios.get(
                                          `http://localhost:8000/api/records/${recordId}/`,
                                          {
                                            headers: {
                                              Authorization: `Bearer ${token}`,
                                            },
                                          },
                                        )

                                        setMedicalRecord(response.data)
                                      } catch (err) {
                                        console.error("Error updating consultation:", err)
                                        setError("Échec de la mise à jour de la consultation. Veuillez réessayer.")
                                      }
                                    }}
                                  >
                                    Enregistrer
                                  </Button>
                                </Box>
                              </Box>
                            </Box>
                          )}

                          {/* Prescriptions */}
                          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #f0f0f0" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="subtitle2">Prescriptions</Typography>
                              {(consultation.status === "confirmed" || consultation.status === "completed") && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Add />}
                                  onClick={() => {
                                    setDialogType("prescription")
                                    setFormData({ consultation_id: consultation.id })
                                    setOpenDialog(true)
                                  }}
                                >
                                  Ajouter Prescription
                                </Button>
                              )}
                            </Box>
                            {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                              <List dense>
                                {consultation.prescriptions.map((prescription, index) => (
                                  <ListItem key={index} sx={{ pl: 2, borderLeft: "2px solid #eee" }}>
                                    <ListItemText
                                      primary={prescription.medication}
                                      secondary={`${prescription.dosage}, ${prescription.frequency}, ${prescription.duration}`}
                                      primaryTypographyProps={{ fontWeight: "medium" }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Aucune prescription
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune consultation enregistrée
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Medical History Tab */}
            <TabPanel value={value} index={2}>
              <Card>
                <CardHeader
                  title="Historique Médical"
                  action={
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog("history")}>
                      Ajouter
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord?.history_entries && medicalRecord.history_entries.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {medicalRecord.history_entries.map((entry) => (
                        <Paper
                          key={entry.id}
                          sx={{ p: 2, border: "1px solid #eee", position: "relative" }}
                          elevation={0}
                        >
                          <Box sx={{ display: "flex" }}>
                            <Box sx={{ minWidth: 100, color: "text.secondary", fontSize: "0.875rem" }}>
                              {entry.diagnosis_date
                                ? new Date(entry.diagnosis_date).toLocaleDateString()
                                : "Date inconnue"}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "medium", mr: 1 }}>
                                  {entry.condition}
                                </Typography>
                                <Chip
                                  label={entry.is_active ? "Actif" : "Résolu"}
                                  color={entry.is_active ? "primary" : "default"}
                                  size="small"
                                />
                              </Box>
                              {entry.notes && <Typography variant="body2">{entry.notes}</Typography>}
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun historique médical disponible
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Medications Tab */}
            <TabPanel value={value} index={3}>
              <Card>
                <CardHeader
                  title="Médicaments"
                  action={
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog("medication")}>
                      Ajouter
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord?.medications && medicalRecord.medications.length > 0 ? (
                    <Grid container spacing={2}>
                      {medicalRecord.medications.map((medication) => (
                        <Grid item xs={12} md={6} key={medication.id}>
                          <Paper sx={{ p: 2, border: "1px solid #eee" }} elevation={0}>
                            <Box
                              sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                                {medication.name}
                              </Typography>
                              <Chip
                                label={medication.is_active ? "En cours" : "Terminé"}
                                color={medication.is_active ? "success" : "default"}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ fontSize: "0.875rem" }}>
                              <Typography variant="body2">
                                <strong>Dosage:</strong> {medication.dosage}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Fréquence:</strong> {medication.frequency}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Début:</strong> {new Date(medication.start_date).toLocaleDateString()}
                              </Typography>
                              {medication.end_date && (
                                <Typography variant="body2">
                                  <strong>Fin:</strong> {new Date(medication.end_date).toLocaleDateString()}
                                </Typography>
                              )}
                              {medication.notes && (
                                <Typography variant="body2" sx={{ mt: 1, pt: 1, borderTop: "1px solid #f0f0f0" }}>
                                  <strong>Notes:</strong> {medication.notes}
                                </Typography>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun médicament enregistré
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Lab Results Tab */}
            <TabPanel value={value} index={4}>
              <Card>
                <CardHeader
                  title="Résultats d'Analyses"
                  action={
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog("labResult")}>
                      Ajouter
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord?.lab_results && medicalRecord.lab_results.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {medicalRecord.lab_results.map((result) => (
                        <Paper key={result.id} sx={{ p: 2, border: "1px solid #eee" }} elevation={0}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                              {result.test_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(result.test_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {result.result_value} {result.unit || ""}
                              </Typography>
                              <Chip
                                label={result.is_abnormal ? "Anormal" : "Normal"}
                                color={result.is_abnormal ? "error" : "success"}
                                size="small"
                              />
                            </Box>
                            {result.reference_range && (
                              <Typography variant="body2" color="text.secondary">
                                <strong>Plage de référence:</strong> {result.reference_range}
                              </Typography>
                            )}
                            {result.notes && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, pt: 1, borderTop: "1px solid #f0f0f0" }}
                              >
                                <strong>Notes:</strong> {result.notes}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun résultat d'analyse disponible
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Documents Tab */}
            <TabPanel value={value} index={5}>
              <Card>
                <CardHeader
                  title="Documents Médicaux"
                  action={
                    <Button variant="outlined" startIcon={<Upload />} onClick={() => handleOpenDialog("document")}>
                      Téléverser
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord?.documents && medicalRecord.documents.length > 0 ? (
                    <Grid container spacing={2}>
                      {medicalRecord.documents.map((document) => (
                        <Grid item xs={12} sm={6} md={4} key={document.id}>
                          <Paper sx={{ p: 2, border: "1px solid #eee", height: "100%" }} elevation={0}>
                            <Typography variant="subtitle1" sx={{ fontWeight: "medium", mb: 0.5 }}>
                              {document.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Ajouté le: {new Date(document.upload_date).toLocaleDateString()}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                              <Avatar sx={{ width: 48, height: 48, bgcolor: "#f5f5f5" }}>
                                <ImageIcon sx={{ color: "#757575" }} />
                              </Avatar>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {document.description || "Aucune description disponible"}
                            </Typography>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => window.open(`http://localhost:8000${document.file}`, "_blank")}
                            >
                              Voir le document
                            </Button>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun document médical disponible
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>

            {/* Vital Signs Tab */}
            <TabPanel value={value} index={6}>
              <Card>
                <CardHeader
                  title="Signes Vitaux"
                  action={
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog("vitalSign")}>
                      Ajouter
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord?.vital_signs && medicalRecord.vital_signs.length > 0 ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {medicalRecord.vital_signs.map((vital) => (
                        <Paper key={vital.id} sx={{ p: 2, border: "1px solid #eee" }} elevation={0}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            {new Date(vital.date_recorded).toLocaleString()}
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Tension artérielle
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                                  ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic} mmHg`
                                  : "-"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Fréquence cardiaque
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {vital.heart_rate ? `${vital.heart_rate} bpm` : "-"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Fréquence respiratoire
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {vital.respiratory_rate ? `${vital.respiratory_rate} /min` : "-"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Température
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {vital.temperature ? `${vital.temperature} °C` : "-"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Poids
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {vital.weight ? `${vital.weight} kg` : "-"}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={4}>
                              <Typography variant="body2" color="text.secondary">
                                Taille
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                                {vital.height ? `${vital.height} cm` : "-"}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun enregistrement de signes vitaux disponible
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </TabPanel>
          </Box>
        </Box>
      </Box>

      {/* Add Data Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === "history" && "Ajouter un Antécédent Médical"}
          {dialogType === "allergy" && "Ajouter une Allergie"}
          {dialogType === "medication" && "Ajouter un Médicament"}
          {dialogType === "labResult" && "Ajouter un Résultat d'Analyse"}
          {dialogType === "vitalSign" && "Ajouter des Signes Vitaux"}
          {dialogType === "document" && "Téléverser un Document"}
          {dialogType === "prescription" && "Ajouter une Prescription"}
        </DialogTitle>
        <DialogContent>
          {dialogType === "history" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Condition"
                name="condition"
                value={formData.condition || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Date de Diagnostic"
                name="diagnosis_date"
                type="date"
                value={formData.diagnosis_date || ""}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
              <FormControlLabel
                control={<Checkbox checked={formData.is_active || true} onChange={handleFormChange} name="is_active" />}
                label="Condition Active"
              />
            </Box>
          )}

          {dialogType === "allergy" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Allergène"
                name="allergen"
                value={formData.allergen || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Sévérité</InputLabel>
                <Select name="severity" value={formData.severity || ""} onChange={handleFormChange} label="Sévérité">
                  <MenuItem value="mild">Légère</MenuItem>
                  <MenuItem value="moderate">Modérée</MenuItem>
                  <MenuItem value="severe">Sévère</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Réaction"
                name="reaction"
                value={formData.reaction || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          )}

          {dialogType === "medication" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Nom du Médicament"
                name="name"
                value={formData.name || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Dosage"
                name="dosage"
                value={formData.dosage || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Fréquence"
                name="frequency"
                value={formData.frequency || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Date de Début"
                name="start_date"
                type="date"
                value={formData.start_date || ""}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label="Date de Fin (si applicable)"
                name="end_date"
                type="date"
                value={formData.end_date || ""}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
              <FormControlLabel
                control={<Checkbox checked={formData.is_active || true} onChange={handleFormChange} name="is_active" />}
                label="Médicament Actif"
              />
            </Box>
          )}

          {dialogType === "labResult" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Nom du Test"
                name="test_name"
                value={formData.test_name || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Date du Test"
                name="test_date"
                type="date"
                value={formData.test_date || ""}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label="Valeur du Résultat"
                name="result_value"
                value={formData.result_value || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField label="Unité" name="unit" value={formData.unit || ""} onChange={handleFormChange} fullWidth />
              <TextField
                label="Plage de Référence"
                name="reference_range"
                value={formData.reference_range || ""}
                onChange={handleFormChange}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox checked={formData.is_abnormal || false} onChange={handleFormChange} name="is_abnormal" />
                }
                label="Résultat Anormal"
              />
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          )}

          {dialogType === "vitalSign" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Date et Heure"
                name="date_recorded"
                type="datetime-local"
                value={formData.date_recorded || ""}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tension Artérielle Systolique (mmHg)"
                    name="blood_pressure_systolic"
                    type="number"
                    value={formData.blood_pressure_systolic || ""}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Tension Artérielle Diastolique (mmHg)"
                    name="blood_pressure_diastolic"
                    type="number"
                    value={formData.blood_pressure_diastolic || ""}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fréquence Cardiaque (bpm)"
                    name="heart_rate"
                    type="number"
                    value={formData.heart_rate || ""}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fréquence Respiratoire (/min)"
                    name="respiratory_rate"
                    type="number"
                    value={formData.respiratory_rate || ""}
                    onChange={handleFormChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Température (°C)"
                    name="temperature"
                    type="number"
                    value={formData.temperature || ""}
                    onChange={handleFormChange}
                    fullWidth
                    inputProps={{ step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Poids (kg)"
                    name="weight"
                    type="number"
                    value={formData.weight || ""}
                    onChange={handleFormChange}
                    fullWidth
                    inputProps={{ step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Taille (cm)"
                    name="height"
                    type="number"
                    value={formData.height || ""}
                    onChange={handleFormChange}
                    fullWidth
                    inputProps={{ step: 0.1 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {dialogType === "document" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Titre du Document"
                name="title"
                value={formData.title || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Type de Document</InputLabel>
                <Select
                  name="document_type"
                  value={formData.document_type || ""}
                  onChange={handleFormChange}
                  label="Type de Document"
                >
                  <MenuItem value="medical_report">Rapport Médical</MenuItem>
                  <MenuItem value="lab_result">Résultat d'Analyse</MenuItem>
                  <MenuItem value="prescription">Prescription</MenuItem>
                  <MenuItem value="imaging">Imagerie</MenuItem>
                  <MenuItem value="other">Autre</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*,application/pdf"
                  style={{ display: "none" }}
                  id="document-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="document-file">
                  <Button variant="contained" component="span" startIcon={<Upload />}>
                    Sélectionner un Fichier
                  </Button>
                </label>
                {fileUpload && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Fichier sélectionné: {fileUpload.name}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {dialogType === "prescription" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Médicament"
                name="medication"
                value={formData.medication || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Dosage"
                name="dosage"
                value={formData.dosage || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Fréquence"
                name="frequency"
                value={formData.frequency || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Durée"
                name="duration"
                value={formData.duration || ""}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleFormChange}
                multiline
                rows={4}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            sx={{ bgcolor: "#3498db", "&:hover": { bgcolor: "#2980b9" } }}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DoctorMedicalRecordView
