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
} from "@mui/material"
import {
  MedicalInformation,
  Medication,
  Science,
  Image,
  MonitorHeart,
  Warning,
  Add,
  ArrowBack,
  Save,
  Upload,
} from "@mui/icons-material"
import "./DoctorMedicalRecordView.css"

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

  if (loading) {
    return (
      <Container className="medical-record-container">
        <Box className="loading-container">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Chargement du dossier médical...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="medical-record-container">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container className="medical-record-container">
      <Paper className="medical-record-header">
        <Box className="header-actions">
          <IconButton onClick={() => navigate(-1)} color="primary">
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">Dossier Médical du Patient</Typography>
        </Box>

        {/* Alerts for allergies and conditions */}
        <Box className="medical-alerts">
          {medicalRecord.allergies &&
            medicalRecord.allergies.map((allergy) => (
              <Chip
                key={allergy.id}
                icon={<Warning />}
                label={`Allergie: ${allergy.allergen} (${allergy.severity})`}
                color="error"
                variant="outlined"
              />
            ))}

          {medicalRecord.history_entries &&
            medicalRecord.history_entries
              .filter((entry) => entry.is_active)
              .map((entry) => (
                <Chip
                  key={entry.id}
                  icon={<MedicalInformation />}
                  label={entry.condition}
                  color="warning"
                  variant="outlined"
                />
              ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Patient information */}
        <Box className="patient-info">
          <Box className="patient-avatar">{medicalRecord.patient?.user?.username.charAt(0).toUpperCase() || "P"}</Box>
          <Box>
            <Typography variant="h5">{medicalRecord.patient?.user?.username || "Patient"}</Typography>
            <Typography variant="body1" color="text.secondary">
              {medicalRecord.patient?.user?.email || "Aucun email disponible"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Dossier créé le: {new Date(medicalRecord.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="medical record tabs">
            <Tab label="Résumé" icon={<MedicalInformation />} iconPosition="start" />
            <Tab label="Consultations" icon={<MedicalInformation />} iconPosition="start" />
            <Tab label="Historique Médical" icon={<MedicalInformation />} iconPosition="start" />
            <Tab label="Médicaments" icon={<Medication />} iconPosition="start" />
            <Tab label="Résultats d'Analyses" icon={<Science />} iconPosition="start" />
            <Tab label="Documents" icon={<Image />} iconPosition="start" />
            <Tab label="Signes Vitaux" icon={<MonitorHeart />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Summary Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Conditions Actives"
                  action={
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog("history")}>
                      Ajouter
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord.history_entries &&
                  medicalRecord.history_entries.filter((entry) => entry.is_active).length > 0 ? (
                    <List>
                      {medicalRecord.history_entries
                        .filter((entry) => entry.is_active)
                        .map((entry) => (
                          <ListItem key={entry.id}>
                            <ListItemText
                              primary={entry.condition}
                              secondary={
                                entry.diagnosis_date
                                  ? `Diagnostiqué le: ${new Date(entry.diagnosis_date).toLocaleDateString()}`
                                  : "Aucune date de diagnostic"
                              }
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

            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Allergies"
                  action={
                    <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog("allergy")}>
                      Ajouter
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord.allergies && medicalRecord.allergies.length > 0 ? (
                    <List>
                      {medicalRecord.allergies.map((allergy) => (
                        <ListItem key={allergy.id}>
                          <ListItemText
                            primary={`${allergy.allergen} (${allergy.severity})`}
                            secondary={allergy.reaction || "Aucun détail de réaction"}
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

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Dernière Consultation"
                  action={
                    <Button variant="outlined" onClick={() => setValue(1)}>
                      Voir toutes
                    </Button>
                  }
                />
                <Divider />
                <CardContent>
                  {medicalRecord.consultations && medicalRecord.consultations.length > 0 ? (
                    <Paper className="consultation-item">
                      {(() => {
                        const consultation = medicalRecord.consultations[0]
                        return (
                          <>
                            <Box className="consultation-header">
                              <Typography variant="h6">
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
                            <Divider />
                            <Box className="consultation-details">
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
                              <Box className="consultation-diagnosis">
                                <Typography variant="subtitle2">Diagnostic:</Typography>
                                <Typography variant="body2">{consultation.diagnosis}</Typography>
                              </Box>
                            )}
                            {consultation.prescriptions && consultation.prescriptions.length > 0 && (
                              <Box className="consultation-prescriptions">
                                <Typography variant="subtitle2">Prescriptions:</Typography>
                                <List dense>
                                  {consultation.prescriptions.map((prescription, index) => (
                                    <ListItem key={index}>
                                      <ListItemText
                                        primary={prescription.medication}
                                        secondary={`${prescription.dosage}, ${prescription.frequency}, ${prescription.duration}`}
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
            </Grid>
          </Grid>
        </TabPanel>

        {/* Consultations Tab */}
        <TabPanel value={value} index={1}>
          <Card>
            <CardHeader title="Historique des Consultations" />
            <Divider />
            <CardContent>
              {medicalRecord.consultations && medicalRecord.consultations.length > 0 ? (
                <div className="consultations-list">
                  {medicalRecord.consultations.map((consultation) => (
                    <Paper key={consultation.id} className="consultation-item">
                      <Box className="consultation-header">
                        <Typography variant="h6">
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
                      <Divider />
                      <Box className="consultation-details">
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
                      {consultation.status === "confirmed" || consultation.status === "completed" ? (
                        <Box className="consultation-doctor-notes">
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1">Notes du Médecin</Typography>
                          <TextField
                            label="Diagnostic"
                            multiline
                            rows={2}
                            fullWidth
                            margin="normal"
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
                            margin="normal"
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
                          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <Button
                              variant="contained"
                              startIcon={<Save />}
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
                                      status: consultation.status === "confirmed" ? "completed" : consultation.status,
                                    },
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    },
                                  )

                                  // Refresh medical record data
                                  const response = await axios.get(`http://localhost:8000/api/records/${recordId}/`, {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  })

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
                      ) : null}

                      {/* Prescriptions */}
                      <Box className="consultation-prescriptions">
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="subtitle1">Prescriptions</Typography>
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
                              <ListItem key={index}>
                                <ListItemText
                                  primary={prescription.medication}
                                  secondary={`${prescription.dosage}, ${prescription.frequency}, ${prescription.duration}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Aucune prescription
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </div>
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
              {medicalRecord.history_entries && medicalRecord.history_entries.length > 0 ? (
                <div className="medical-history-timeline">
                  {medicalRecord.history_entries.map((entry) => (
                    <Paper key={entry.id} className="history-item">
                      <Box className="history-date">
                        {entry.diagnosis_date ? new Date(entry.diagnosis_date).toLocaleDateString() : "Date inconnue"}
                      </Box>
                      <Box className="history-content">
                        <Typography variant="h6">{entry.condition}</Typography>
                        <Chip
                          label={entry.is_active ? "Actif" : "Résolu"}
                          color={entry.is_active ? "primary" : "default"}
                          size="small"
                        />
                        {entry.notes && (
                          <Typography variant="body2" className="history-notes">
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </div>
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
              {medicalRecord.medications && medicalRecord.medications.length > 0 ? (
                <div className="medications-list">
                  <Grid container spacing={2}>
                    {medicalRecord.medications.map((medication) => (
                      <Grid item xs={12} md={6} key={medication.id}>
                        <Paper className="medication-item">
                          <Typography variant="h6" className="medication-name">
                            {medication.name}
                          </Typography>
                          <Chip
                            label={medication.is_active ? "En cours" : "Terminé"}
                            color={medication.is_active ? "success" : "default"}
                            size="small"
                            className="medication-status"
                          />
                          <Box className="medication-details">
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
                          </Box>
                          {medication.notes && (
                            <Typography variant="body2" className="medication-notes">
                              <strong>Notes:</strong> {medication.notes}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </div>
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
              {medicalRecord.lab_results && medicalRecord.lab_results.length > 0 ? (
                <div className="lab-results-list">
                  {medicalRecord.lab_results.map((result) => (
                    <Paper key={result.id} className="lab-result-item">
                      <Box className="lab-result-header">
                        <Typography variant="h6">{result.test_name}</Typography>
                        <Typography variant="body2" className="lab-result-date">
                          {new Date(result.test_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Divider />
                      <Box className="lab-result-details">
                        <Typography variant="body1" className="lab-result-value">
                          {result.result_value} {result.unit || ""}
                        </Typography>
                        {result.reference_range && (
                          <Typography variant="body2" className="lab-result-range">
                            <strong>Plage de référence:</strong> {result.reference_range}
                          </Typography>
                        )}
                        <Chip
                          label={result.is_abnormal ? "Anormal" : "Normal"}
                          color={result.is_abnormal ? "error" : "success"}
                          size="small"
                          className="lab-result-status"
                        />
                      </Box>
                      {result.notes && (
                        <Typography variant="body2" className="lab-result-notes">
                          <strong>Notes:</strong> {result.notes}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </div>
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
              {medicalRecord.documents && medicalRecord.documents.length > 0 ? (
                <Grid container spacing={3}>
                  {medicalRecord.documents.map((document) => (
                    <Grid item xs={12} sm={6} md={4} key={document.id}>
                      <Card className="document-card">
                        <CardContent>
                          <Typography variant="h6">{document.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Ajouté le: {new Date(document.upload_date).toLocaleDateString()}
                          </Typography>
                          <Box className="document-type-icon">
                            {document.file_type === "pdf" ? (
                              <img src="/pdf-icon.png" alt="PDF" width="48" />
                            ) : document.file_type === "image" ? (
                              <img src="/image-icon.png" alt="Image" width="48" />
                            ) : (
                              <img src="/document-icon.png" alt="Document" width="48" />
                            )}
                          </Box>
                          <Typography variant="body2" className="document-description">
                            {document.description || "Aucune description disponible"}
                          </Typography>
                          <Button
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={() => window.open(`http://localhost:8000${document.file}`, "_blank")}
                          >
                            Voir le document
                          </Button>
                        </CardContent>
                      </Card>
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
              {medicalRecord.vital_signs && medicalRecord.vital_signs.length > 0 ? (
                <div className="vital-signs-list">
                  {medicalRecord.vital_signs.map((vital) => (
                    <Paper key={vital.id} className="vital-sign-item">
                      <Typography variant="subtitle1" className="vital-sign-date">
                        {new Date(vital.date_recorded).toLocaleString()}
                      </Typography>
                      <Divider />
                      <Grid container spacing={2} className="vital-sign-grid">
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2">
                            <strong>Tension artérielle:</strong>
                          </Typography>
                          <Typography variant="body1">
                            {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                              ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic} mmHg`
                              : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2">
                            <strong>Fréquence cardiaque:</strong>
                          </Typography>
                          <Typography variant="body1">{vital.heart_rate ? `${vital.heart_rate} bpm` : "-"}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2">
                            <strong>Fréquence respiratoire:</strong>
                          </Typography>
                          <Typography variant="body1">
                            {vital.respiratory_rate ? `${vital.respiratory_rate} /min` : "-"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2">
                            <strong>Température:</strong>
                          </Typography>
                          <Typography variant="body1">{vital.temperature ? `${vital.temperature} °C` : "-"}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2">
                            <strong>Poids:</strong>
                          </Typography>
                          <Typography variant="body1">{vital.weight ? `${vital.weight} kg` : "-"}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2">
                            <strong>Taille:</strong>
                          </Typography>
                          <Typography variant="body1">{vital.height ? `${vital.height} cm` : "-"}</Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </div>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucun enregistrement de signes vitaux disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>
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
          <Button onClick={handleSubmitForm} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default DoctorMedicalRecordView
