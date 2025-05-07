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
} from "@mui/material"
import {
  MedicalInformation as MedicalIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Image as ImageIcon,
  MonitorHeart as VitalsIcon,
  Warning as WarningIcon,
  Add as AddIcon,
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

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState("")
  const [formData, setFormData] = useState({})

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
        setError("Failed to load medical record data")
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

  const handleSubmitForm = async () => {
    try {
      const token = localStorage.getItem("token")
      let endpoint = ""

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
        default:
          console.error("Unknown dialog type")
          return
      }

      await axios.post(endpoint, formData, {
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
      handleCloseDialog()
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Failed to save data")
    }
  }

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <Typography>Loading medical record...</Typography>
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" gutterBottom>
            Patient Medical Record
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
            Back to Patient List
          </Button>
        </Box>

        {/* Alerts for allergies and conditions */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {medicalRecord.allergies &&
            medicalRecord.allergies.map((allergy) => (
              <Chip
                key={allergy.id}
                icon={<WarningIcon />}
                label={`Allergy: ${allergy.allergen} (${allergy.severity})`}
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
                  icon={<MedicalIcon />}
                  label={entry.condition}
                  color="warning"
                  variant="outlined"
                />
              ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Patient information */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              mr: 2,
            }}
          >
            {medicalRecord.patient?.user?.username.charAt(0).toUpperCase() || "P"}
          </Box>
          <Box>
            <Typography variant="h5">{medicalRecord.patient?.user?.username || "Patient"}</Typography>
            <Typography variant="body1" color="text.secondary">
              {medicalRecord.patient?.user?.email || "No email available"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Record created: {new Date(medicalRecord.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="medical record tabs">
            <Tab label="Summary" icon={<MedicalIcon />} iconPosition="start" />
            <Tab label="Medical History" icon={<MedicalIcon />} iconPosition="start" />
            <Tab label="Medications" icon={<MedicationIcon />} iconPosition="start" />
            <Tab label="Lab Results" icon={<ScienceIcon />} iconPosition="start" />
            <Tab label="Images" icon={<ImageIcon />} iconPosition="start" />
            <Tab label="Vital Signs" icon={<VitalsIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Summary Tab */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title="Active Conditions"
                  action={
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog("history")}>
                      Add
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
                                  ? `Diagnosed: ${new Date(entry.diagnosis_date).toLocaleDateString()}`
                                  : "No diagnosis date"
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No active conditions
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
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog("allergy")}>
                      Add
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
                            secondary={allergy.reaction || "No reaction details"}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No known allergies
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title="Current Medications"
                  action={
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => handleOpenDialog("medication")}>
                      Add
                    </Button>
                  }
                />
                <Divider />
                <CardContent>{/* Medications table similar to PatientMedicalRecord component */}</CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Other tabs similar to PatientMedicalRecord component */}

        {/* Add Data Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogType === "history" && "Add Medical History Entry"}
            {dialogType === "allergy" && "Add Allergy"}
            {dialogType === "medication" && "Add Medication"}
            {dialogType === "labResult" && "Add Lab Result"}
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
                  label="Diagnosis Date"
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
                  control={
                    <Checkbox checked={formData.is_active || true} onChange={handleFormChange} name="is_active" />
                  }
                  label="Active Condition"
                />
              </Box>
            )}

            {dialogType === "allergy" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <TextField
                  label="Allergen"
                  name="allergen"
                  value={formData.allergen || ""}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select name="severity" value={formData.severity || ""} onChange={handleFormChange} label="Severity">
                    <MenuItem value="mild">Mild</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="severe">Severe</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Reaction"
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
                  label="Medication Name"
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
                  label="Frequency"
                  name="frequency"
                  value={formData.frequency || ""}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date || ""}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="End Date (if applicable)"
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
                  control={
                    <Checkbox checked={formData.is_active || true} onChange={handleFormChange} name="is_active" />
                  }
                  label="Active Medication"
                />
              </Box>
            )}

            {dialogType === "labResult" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                <TextField
                  label="Test Name"
                  name="test_name"
                  value={formData.test_name || ""}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Test Date"
                  name="test_date"
                  type="date"
                  value={formData.test_date || ""}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="Result Value"
                  name="result_value"
                  value={formData.result_value || ""}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
                <TextField label="Unit" name="unit" value={formData.unit || ""} onChange={handleFormChange} fullWidth />
                <TextField
                  label="Reference Range"
                  name="reference_range"
                  value={formData.reference_range || ""}
                  onChange={handleFormChange}
                  fullWidth
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={formData.is_abnormal || false} onChange={handleFormChange} name="is_abnormal" />
                  }
                  label="Abnormal Result"
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
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmitForm} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}

export default DoctorMedicalRecordView
