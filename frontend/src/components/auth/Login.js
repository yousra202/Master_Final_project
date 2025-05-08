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
  Alert,
  Card,
  CardContent,
  CardActions,
} from "@mui/material"
import { loginValidationSchema } from "../../utils/validation"
import { login } from "../../services/authService"

const Login = () => {
  const navigate = useNavigate()
  const [error, setError] = useState("")

  const initialValues = {
    username: "",
    password: "",
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await login(values)

      if (response.user_type === "doctor") {
        navigate("/doctor/dashboard")
      } else if (response.user_type === "patient") {
        navigate("/")
      } else if (response.user_type === "admin") {
        navigate("/admin/dashboard")
      }
    } catch (err) {
      setError(err.detail || "Invalid credentials. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik initialValues={initialValues} validationSchema={loginValidationSchema} onSubmit={handleSubmit}>
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
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
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 3, mb: 2 }}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>

              <Box mt={2} textAlign="center">
                <Typography variant="body2">Don't have an account?</Typography>
              </Box>
            </Form>
          )}
        </Formik>

        <Box mt={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Doctor
                  </Typography>
                  <Typography variant="body2" align="center">
                    Register as a doctor to manage patients
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button fullWidth component={Link} to="/register/doctor" color="primary">
                    Register as Doctor
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" align="center" gutterBottom>
                    Patient
                  </Typography>
                  <Typography variant="body2" align="center">
                    Register as a patient to book appointments
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button fullWidth component={Link} to="/register/patient" color="primary">
                    Register as Patient
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  )
}

export default Login
