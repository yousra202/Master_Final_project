"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Formik, Form, Field } from "formik"
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  MenuItem,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import dayjs from "dayjs"
import { doctorValidationSchema } from "../../utils/validation"
import { registerDoctor } from "../../services/authService"

const DoctorRegistration = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [openSnackbar, setOpenSnackbar] = useState(false)

  const initialValues = {
    username: "",
    email: "",
    password: "",
    phone: "",
    birth_date: null,
    gender: "",
    license_number: "",
    specialty: "",
  }

  const specialties = [
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Obstetrics",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Urology",
  ]

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Format date to YYYY-MM-DD
      const formattedValues = {
        ...values,
        birth_date: dayjs(values.birth_date).format("YYYY-MM-DD"),
      }

      await registerDoctor(formattedValues)
      setOpenSnackbar(true)
      resetForm()
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.detail || "Registration failed. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Doctor Registration
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik initialValues={initialValues} validationSchema={doctorValidationSchema} onSubmit={handleSubmit}>
          {({ errors, touched, values, handleChange, setFieldValue, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="username"
                    label="Username"
                    fullWidth
                    variant="outlined"
                    error={touched.username && Boolean(errors.username)}
                    helperText={touched.username && errors.username}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    fullWidth
                    variant="outlined"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="phone"
                    label="Phone Number"
                    fullWidth
                    variant="outlined"
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Birth Date"
                      value={values.birth_date}
                      onChange={(date) => setFieldValue("birth_date", date)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={touched.birth_date && Boolean(errors.birth_date)}
                          helperText={touched.birth_date && errors.birth_date}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.gender && Boolean(errors.gender)}>
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Select
                      labelId="gender-label"
                      name="gender"
                      value={values.gender}
                      onChange={handleChange}
                      label="Gender"
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                    {touched.gender && errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="license_number"
                    label="License Number"
                    fullWidth
                    variant="outlined"
                    error={touched.license_number && Boolean(errors.license_number)}
                    helperText={touched.license_number && errors.license_number}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth error={touched.specialty && Boolean(errors.specialty)}>
                    <InputLabel id="specialty-label">Specialty</InputLabel>
                    <Select
                      labelId="specialty-label"
                      name="specialty"
                      value={values.specialty}
                      onChange={handleChange}
                      label="Specialty"
                    >
                      {specialties.map((specialty) => (
                        <MenuItem key={specialty.toLowerCase()} value={specialty.toLowerCase()}>
                          {specialty}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.specialty && errors.specialty && <FormHelperText>{errors.specialty}</FormHelperText>}
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>

              <Box mt={2} textAlign="center">
                <Typography variant="body2">
                  Already have an account?{" "}
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    Login
                  </Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Registration successful! Redirecting to login...
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default DoctorRegistration
