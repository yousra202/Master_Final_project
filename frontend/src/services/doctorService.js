import axios from "axios"

const API_URL = "http://localhost:8000/api"

// Get all doctors
export const getAllDoctors = async () => {
  try {
    const response = await axios.get(`${API_URL}/doctors/`)
    return response.data
  } catch (error) {
    console.error("Error fetching doctors:", error)
    throw error
  }
}

// Get doctor by ID
export const getDoctorById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/doctors/${id}/`)
    return response.data
  } catch (error) {
    console.error(`Error fetching doctor with ID ${id}:`, error)
    throw error
  }
}

// Get doctors by specialty
export const getDoctorsBySpecialty = async (specialty) => {
  try {
    const response = await axios.get(`${API_URL}/doctors/?specialty=${specialty}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching doctors with specialty ${specialty}:`, error)
    throw error
  }
}

// Mock function to get doctors when the API is not available
export const getMockDoctors = async () => {
  // This is a fallback function that returns mock data
  return [
    {
      id: 1,
      user: {
        username: "Ahmed Benali",
        email: "ahmed.benali@example.com",
      },
      specialty: "dentiste",
      license_number: "DEN12345",
      description: "Dentiste avec 10 ans d'expérience, spécialisé en orthodontie.",
      address: "Casablanca",
      profile_picture: null,
    },
    {
      id: 2,
      user: {
        username: "Fatima Zahra",
        email: "fatima.zahra@example.com",
      },
      specialty: "dermatologue",
      license_number: "DER54321",
      description: "Dermatologue spécialisée dans le traitement de l'acné et des maladies de la peau.",
      address: "Rabat",
      profile_picture: null,
    },
    {
      id: 3,
      user: {
        username: "Karim El Mansouri",
        email: "karim.elmansouri@example.com",
      },
      specialty: "pédiatre",
      license_number: "PED98765",
      description: "Pédiatre avec une expertise particulière dans le développement de l'enfant.",
      address: "Marrakech",
      profile_picture: null,
    },
    {
      id: 4,
      user: {
        username: "Leila Amrani",
        email: "leila.amrani@example.com",
      },
      specialty: "gynécologue",
      license_number: "GYN56789",
      description: "Gynécologue spécialisée en fertilité et santé reproductive.",
      address: "Tanger",
      profile_picture: null,
    },
  ]
}
