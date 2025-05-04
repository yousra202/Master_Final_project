import * as Yup from "yup"

export const doctorValidationSchema = Yup.object({
  username: Yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  phone: Yup.string()
    .matches(/^[0-9+\-\s]+$/, "Invalid phone number")
    .required("Phone number is required"),
  birth_date: Yup.date()
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), "You must be at least 18 years old")
    .required("Birth date is required"),
  gender: Yup.string().oneOf(["male", "female", "other"], "Invalid gender selection").required("Gender is required"),
  license_number: Yup.string()
    .min(5, "License number must be at least 5 characters")
    .required("License number is required"),
  specialty: Yup.string().required("Specialty is required"),
})

export const patientValidationSchema = Yup.object({
  username: Yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  phone: Yup.string()
    .matches(/^[0-9+\-\s]+$/, "Invalid phone number")
    .required("Phone number is required"),
  birth_date: Yup.date().required("Birth date is required"),
  gender: Yup.string().oneOf(["male", "female", "other"], "Invalid gender selection").required("Gender is required"),
  address: Yup.string().min(5, "Address must be at least 5 characters").required("Address is required"),
})

export const loginValidationSchema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
})
