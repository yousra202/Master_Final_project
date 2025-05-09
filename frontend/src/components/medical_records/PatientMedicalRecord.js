"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  CircularProgress,
} from "@mui/material"
import { MedicalInformation, Medication, Science, Image, MonitorHeart, Warning } from "@mui/icons-material"
import "./PatientMedicalRecord.css"

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

const PatientMedicalRecord = () => {
  const navigate = useNavigate()
  const [value, setValue] = useState(0)
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          navigate("/login")
          return
        }

        const response = await axios.get("http://localhost:8000/api/my-record/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setMedicalRecord(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medical record:", err)
        setError("Impossible de charger votre dossier médical. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchMedicalRecord()
  }, [navigate])

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  if (loading) {
    return (
      <Container className="medical-record-container">
        <Box className="loading-container">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Chargement de votre dossier médical...
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

  // If no medical record data is available yet
  if (!medicalRecord) {
    return (
      <Container className="medical-record-container">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            Aucun dossier médical trouvé. Votre dossier médical sera créé lors de votre première consultation.
          </Alert>
        </Box>
      </Container>
    )
  }

  return (
    <Container className="medical-record-container">
      <Paper className="medical-record-header">
        <Typography variant="h4" gutterBottom>
          Mon Dossier Médical
        </Typography>

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
            <Tab label="Historique Médical" icon={<MedicalInformation />} iconPosition="start" />
            <Tab label="Médicaments" icon={<Medication />} iconPosition="start" />
            <Tab label="Résultats d'Analyses" icon={<Science />} iconPosition="start" />
            <Tab label="Images Médicales" icon={<Image />} iconPosition="start" />
            <Tab label="Signes Vitaux" icon={<MonitorHeart />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Summary Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Conditions Actives" />
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
                <CardHeader title="Allergies" />
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
                <CardHeader title="Consultations Récentes" />
                <Divider />
                <CardContent>
                  {medicalRecord.consultations && medicalRecord.consultations.length > 0 ? (
                    <div className="consultations-list">
                      {medicalRecord.consultations.slice(0, 5).map((consultation) => (
                        <Paper key={consultation.id} className="consultation-item">
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
                        </Paper>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune consultation récente
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Medical History Tab */}
        <TabPanel value={value} index={1}>
          <Card>
            <CardHeader
              title="Historique Médical"
              action={
                <Button variant="outlined" disabled>
                  Demander une correction
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
        <TabPanel value={value} index={2}>
          <Card>
            <CardHeader title="Médicaments" />
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
        <TabPanel value={value} index={3}>
          <Card>
            <CardHeader title="Résultats d'Analyses" />
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

        {/* Medical Images Tab */}
        <TabPanel value={value} index={4}>
          <Card>
            <CardHeader title="Images Médicales" />
            <Divider />
            <CardContent>
              {medicalRecord.medical_images && medicalRecord.medical_images.length > 0 ? (
                <Grid container spacing={3}>
                  {medicalRecord.medical_images.map((image) => (
                    <Grid item xs={12} sm={6} md={4} key={image.id}>
                      <Card className="medical-image-card">
                        <CardContent>
                          <Typography variant="h6">{image.image_type}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(image.image_date).toLocaleDateString()}
                          </Typography>
                          <Box className="medical-image-container">
                            <img
                              src={`http://localhost:8000${image.image_file}`}
                              alt={image.image_type}
                              className="medical-image"
                            />
                          </Box>
                          <Typography variant="body2" className="medical-image-description">
                            {image.description || "Aucune description disponible"}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucune image médicale disponible
                </Typography>
              )}
            </CardContent>
          </Card>
        </TabPanel>

        {/* Vital Signs Tab */}
        <TabPanel value={value} index={5}>
          <Card>
            <CardHeader title="Signes Vitaux" />
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
    </Container>
  )
}

export default PatientMedicalRecord
