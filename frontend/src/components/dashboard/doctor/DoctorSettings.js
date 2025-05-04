"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../../common/Sidebar"
import Header from "../../common/Header"
import "./DoctorSettings.css"

const DoctorSettings = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    profilePicture: null,
  })

  const [professionalInfo, setProffesionalInfo] = useState({
    specialty: "",
    otherSpecialties: [],
    licenseNumber: "",
    description: "",
  })

  const [availability, setAvailability] = useState({
    schedule: [
      {
        day: "Lundi",
        slots: [
          { start: "08:00", end: "10:00" },
          { start: "14:00", end: "17:00" },
        ],
      },
      {
        day: "Mardi",
        slots: [
          { start: "09:00", end: "12:00" },
          { start: "15:00", end: "18:00" },
        ],
      },
      { day: "Mercredi", slots: [{ start: "08:00", end: "12:00" }] },
      {
        day: "Jeudi",
        slots: [
          { start: "10:00", end: "13:00" },
          { start: "16:00", end: "19:00" },
        ],
      },
      { day: "Vendredi", slots: [{ start: "08:00", end: "11:00" }] },
    ],
    consultationDuration: 30,
  })

  const [notifications, setNotifications] = useState({
    newAppointments: true,
    appointmentReminders: true,
    onlineConsultations: false,
    patientMessages: true,
  })

  // New specialty input
  const [newSpecialty, setNewSpecialty] = useState("")

  // New time slot inputs
  const [newSlot, setNewSlot] = useState({
    day: "Lundi",
    start: "",
    end: "",
  })

  // Mock logout function
  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user_type")
    navigate("/login")
  }

  // Mock currentUser object
  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"))
      return user
    } catch (error) {
      console.error("Error parsing user from localStorage:", error)
      return null
    }
  }

  useEffect(() => {
    // Add this at the beginning of the useEffect to get the current user
    const currentUser = getCurrentUser()

    // Check if user is authenticated and is a doctor
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token || userType !== "doctor") {
      navigate("/login")
      return
    }

    // Fetch doctor data
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem("token")
        console.log("Fetching doctor data with token:", token)

        const response = await axios.get("http://localhost:8000/api/doctor/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Doctor data response:", response.data)
        const doctorData = response.data

        // Set personal info
        setPersonalInfo({
          fullName: doctorData.user?.username || "",
          email: doctorData.user?.email || "",
          phone: doctorData.user?.phone || "",
          birthDate: doctorData.user?.birth_date || "",
          address: doctorData.address || "",
          profilePicture: null,
        })

        // Set professional info
        setProffesionalInfo({
          specialty: doctorData.specialty || "",
          otherSpecialties: ["Médecine interne", "Échocardiographie"], // Example data
          licenseNumber: doctorData.license_number || "",
          description:
            doctorData.description ||
            "Docteur en cardiologie avec plus de 15 ans d'expérience. Spécialisé dans les maladies cardiaques congénitales et les interventions coronariennes.",
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching doctor data:", err)

        // Check if it's an authentication error
        if (err.response && err.response.status === 401) {
          console.log("Authentication error, redirecting to login")
          logout()
          navigate("/login")
          return
        }

        // If the doctor profile doesn't exist, create default values
        setPersonalInfo({
          fullName: currentUser ? currentUser.username : "",
          email: "",
          phone: "",
          birthDate: "",
          address: "",
          profilePicture: null,
        })

        setProffesionalInfo({
          specialty: "cardiologie",
          otherSpecialties: [],
          licenseNumber: "",
          description: "",
        })

        setError("Impossible de charger les données du profil. Veuillez remplir le formulaire pour créer votre profil.")
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [navigate])

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo({
      ...personalInfo,
      [name]: value,
    })
  }

  const handleProfessionalInfoChange = (e) => {
    const { name, value } = e.target
    setProffesionalInfo({
      ...professionalInfo,
      [name]: value,
    })
  }

  const handleFileChange = (e) => {
    setPersonalInfo({
      ...personalInfo,
      profilePicture: e.target.files[0],
    })
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotifications({
      ...notifications,
      [name]: checked,
    })
  }

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() !== "") {
      setProffesionalInfo({
        ...professionalInfo,
        otherSpecialties: [...professionalInfo.otherSpecialties, newSpecialty.trim()],
      })
      setNewSpecialty("")
    }
  }

  const handleRemoveSpecialty = (index) => {
    const updatedSpecialties = [...professionalInfo.otherSpecialties]
    updatedSpecialties.splice(index, 1)
    setProffesionalInfo({
      ...professionalInfo,
      otherSpecialties: updatedSpecialties,
    })
  }

  const handleNewSlotChange = (e) => {
    const { name, value } = e.target
    setNewSlot({
      ...newSlot,
      [name]: value,
    })
  }

  const handleAddTimeSlot = () => {
    if (newSlot.start && newSlot.end) {
      const updatedSchedule = [...availability.schedule]
      const dayIndex = updatedSchedule.findIndex((item) => item.day === newSlot.day)

      if (dayIndex !== -1) {
        updatedSchedule[dayIndex].slots.push({
          start: newSlot.start,
          end: newSlot.end,
        })
      } else {
        updatedSchedule.push({
          day: newSlot.day,
          slots: [{ start: newSlot.start, end: newSlot.end }],
        })
      }

      setAvailability({
        ...availability,
        schedule: updatedSchedule,
      })

      setNewSlot({
        ...newSlot,
        start: "",
        end: "",
      })
    }
  }

  const handleRemoveTimeSlot = (dayIndex, slotIndex) => {
    const updatedSchedule = [...availability.schedule]
    updatedSchedule[dayIndex].slots.splice(slotIndex, 1)

    // If no slots left for this day, remove the day
    if (updatedSchedule[dayIndex].slots.length === 0) {
      updatedSchedule.splice(dayIndex, 1)
    }

    setAvailability({
      ...availability,
      schedule: updatedSchedule,
    })
  }

  const handleConsultationDurationChange = (e) => {
    setAvailability({
      ...availability,
      consultationDuration: Number.parseInt(e.target.value),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      // Create form data for file upload
      const formData = new FormData()
      formData.append("username", personalInfo.fullName)
      formData.append("email", personalInfo.email)
      formData.append("phone", personalInfo.phone)
      formData.append("birth_date", personalInfo.birthDate)
      formData.append("address", personalInfo.address)
      formData.append("specialty", professionalInfo.specialty)
      formData.append("license_number", professionalInfo.licenseNumber)
      formData.append("description", professionalInfo.description)
      formData.append("other_specialties", JSON.stringify(professionalInfo.otherSpecialties))
      formData.append("availability", JSON.stringify(availability))
      formData.append("notifications", JSON.stringify(notifications))

      if (personalInfo.profilePicture) {
        formData.append("profile_picture", personalInfo.profilePicture)
      }

      // Update doctor profile
      await axios.put("http://localhost:8000/api/doctor/profile/update/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccessMessage("Profil mis à jour avec succès!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating doctor profile:", err)
      setError("Échec de la mise à jour du profil. Veuillez réessayer.")
      setTimeout(() => {
        setError("")
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !personalInfo.fullName) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="doctor-settings-container">
      <Sidebar activePage="settings" />

      <div className="main-content">
        <Header title="Paramètres du compte" />

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
          {/* Profile Settings */}
          <div className="settings-card">
            <h2>
              <i className="fas fa-user"></i> Informations personnelles
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  type="text"
                  className="form-control"
                  name="fullName"
                  value={personalInfo.fullName}
                  onChange={handlePersonalInfoChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                />
              </div>
              <div className="form-group">
                <label>Date de naissance</label>
                <input
                  type="date"
                  className="form-control"
                  name="birthDate"
                  value={personalInfo.birthDate}
                  onChange={handlePersonalInfoChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Adresse du cabinet</label>
              <input
                type="text"
                className="form-control"
                name="address"
                value={personalInfo.address}
                onChange={handlePersonalInfoChange}
              />
            </div>

            <div className="form-group">
              <label>Photo de profil</label>
              <input type="file" className="form-control" onChange={handleFileChange} />
            </div>
          </div>

          {/* Professional Information */}
          <div className="settings-card">
            <h2>
              <i className="fas fa-briefcase-medical"></i> Informations professionnelles
            </h2>

            <div className="form-group">
              <label>Spécialité principale</label>
              <select
                className="form-control"
                name="specialty"
                value={professionalInfo.specialty}
                onChange={handleProfessionalInfoChange}
              >
                <option value="cardiologie">Cardiologie</option>
                <option value="dermatologie">Dermatologie</option>
                <option value="neurologie">Neurologie</option>
                <option value="pédiatrie">Pédiatrie</option>
                <option value="chirurgie">Chirurgie</option>
              </select>
            </div>

            <div className="form-group">
              <label>Autres spécialités</label>
              <div className="specialties-list">
                {professionalInfo.otherSpecialties.map((specialty, index) => (
                  <div className="specialty-tag" key={index}>
                    {specialty} <i className="fas fa-times" onClick={() => handleRemoveSpecialty(index)}></i>
                  </div>
                ))}
              </div>
              <div className="add-specialty">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ajouter une spécialité"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                />
                <button type="button" className="btn btn-outline" onClick={handleAddSpecialty}>
                  Ajouter
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Numéro de licence médicale</label>
              <input
                type="text"
                className="form-control"
                name="licenseNumber"
                value={professionalInfo.licenseNumber}
                onChange={handleProfessionalInfoChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                rows="4"
                name="description"
                value={professionalInfo.description}
                onChange={handleProfessionalInfoChange}
              ></textarea>
            </div>
          </div>

          {/* Availability Settings */}
          <div className="settings-card">
            <h2>
              <i className="fas fa-calendar-check"></i> Disponibilités
            </h2>

            <div className="form-group">
              <label>Jours de consultation</label>
              <div className="availability-schedule">
                {availability.schedule.map((day, dayIndex) => (
                  <div className="day-schedule" key={dayIndex}>
                    <div className="day-label">{day.day}</div>
                    <div className="time-slots">
                      {day.slots.map((slot, slotIndex) => (
                        <div className="time-slot" key={slotIndex}>
                          {slot.start} - {slot.end}
                          <i className="fas fa-times" onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}></i>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-slot">
                <select className="form-control" name="day" value={newSlot.day} onChange={handleNewSlotChange}>
                  <option value="Lundi">Lundi</option>
                  <option value="Mardi">Mardi</option>
                  <option value="Mercredi">Mercredi</option>
                  <option value="Jeudi">Jeudi</option>
                  <option value="Vendredi">Vendredi</option>
                  <option value="Samedi">Samedi</option>
                  <option value="Dimanche">Dimanche</option>
                </select>
                <input
                  type="time"
                  className="form-control"
                  name="start"
                  value={newSlot.start}
                  onChange={handleNewSlotChange}
                />
                <input
                  type="time"
                  className="form-control"
                  name="end"
                  value={newSlot.end}
                  onChange={handleNewSlotChange}
                />
                <button type="button" className="btn btn-outline" onClick={handleAddTimeSlot}>
                  Ajouter
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Durée des consultations (minutes)</label>
              <select
                className="form-control"
                value={availability.consultationDuration}
                onChange={handleConsultationDurationChange}
              >
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
                <option value="60">60</option>
              </select>
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-card">
            <h2>
              <i className="fas fa-lock"></i> Sécurité
            </h2>

            <div className="security-settings">
              <div className="security-item">
                <div className="security-info">
                  <h4>Changer le mot de passe</h4>
                  <p>Mettez à jour votre mot de passe régulièrement</p>
                </div>
                <button type="button" className="btn btn-outline">
                  Changer
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-card">
            <h2>
              <i className="fas fa-bell"></i> Notifications
            </h2>

            <div className="notification-settings">
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Nouveaux rendez-vous</h4>
                  <p>Recevoir des notifications pour les nouveaux rendez-vous</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="newAppointments"
                    checked={notifications.newAppointments}
                    onChange={handleNotificationChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Rappels de rendez-vous</h4>
                  <p>Recevoir des rappels pour les rendez-vous à venir</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="appointmentReminders"
                    checked={notifications.appointmentReminders}
                    onChange={handleNotificationChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Consultations en ligne</h4>
                  <p>Recevoir des notifications pour les demandes de consultation en ligne</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="onlineConsultations"
                    checked={notifications.onlineConsultations}
                    onChange={handleNotificationChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-info">
                  <h4>Messages des patients</h4>
                  <p>Recevoir des notifications pour les nouveaux messages</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    name="patientMessages"
                    checked={notifications.patientMessages}
                    onChange={handleNotificationChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button type="button" className="btn btn-outline" onClick={() => navigate("/doctor/dashboard")}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DoctorSettings
