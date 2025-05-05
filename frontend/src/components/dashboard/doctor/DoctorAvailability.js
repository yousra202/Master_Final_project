"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../../common/Sidebar"
import Header from "../../common/Header"
import "./DoctorSettings.css"

const DoctorAvailability = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Availability state
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

  // Consultation options
  const [consultationOptions, setConsultationOptions] = useState({
    offersPhysicalConsultation: true,
    offersOnlineConsultation: false,
    physicalConsultationFee: 0,
    onlineConsultationFee: 0,
  })

  // New time slot inputs
  const [newSlot, setNewSlot] = useState({
    day: "Lundi",
    start: "",
    end: "",
  })

  useEffect(() => {
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

        // Set availability
        if (doctorData.availability) {
          setAvailability(doctorData.availability)
        }

        // Set consultation options
        setConsultationOptions({
          offersPhysicalConsultation: doctorData.offers_physical_consultation || true,
          offersOnlineConsultation: doctorData.offers_online_consultation || false,
          physicalConsultationFee: doctorData.physical_consultation_fee || 0,
          onlineConsultationFee: doctorData.online_consultation_fee || 0,
        })

        setLoading(false)
      } catch (err) {
        console.error("Error fetching doctor data:", err)
        setError("Impossible de charger les données du profil.")
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [navigate])

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
    const duration = Number.parseInt(e.target.value, 10)
    setAvailability({
      ...availability,
      consultationDuration: duration,
    })
  }

  const handleConsultationOptionChange = (e) => {
    const { name, value, type, checked } = e.target
    setConsultationOptions({
      ...consultationOptions,
      [name]: type === "checkbox" ? checked : Number.parseFloat(value),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      // Prepare data for update
      const updateData = new FormData()

      // Add availability with consultation duration
      const availabilityData = {
        ...availability,
        consultationDuration: availability.consultationDuration,
      }
      updateData.append("availability", JSON.stringify(availabilityData))

      // Add consultation options
      updateData.append("offers_physical_consultation", consultationOptions.offersPhysicalConsultation)
      updateData.append("offers_online_consultation", consultationOptions.offersOnlineConsultation)
      updateData.append("physical_consultation_fee", consultationOptions.physicalConsultationFee)
      updateData.append("online_consultation_fee", consultationOptions.onlineConsultationFee)

      // Also add consultation_duration as a separate field to ensure it's updated
      updateData.append("consultation_duration", availability.consultationDuration)

      console.log("Sending update with data:", {
        availability: availabilityData,
        offers_physical_consultation: consultationOptions.offersPhysicalConsultation,
        offers_online_consultation: consultationOptions.offersOnlineConsultation,
        physical_consultation_fee: consultationOptions.physicalConsultationFee,
        online_consultation_fee: consultationOptions.onlineConsultationFee,
        consultation_duration: availability.consultationDuration,
      })

      // Update doctor profile
      await axios.put("http://localhost:8000/api/doctor/profile/", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setSuccessMessage("Disponibilités mises à jour avec succès!")
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error("Error updating doctor availability:", err)
      setError("Échec de la mise à jour des disponibilités. Veuillez réessayer.")
      setTimeout(() => {
        setError("")
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="doctor-settings-container">
      <Sidebar activePage="availability" />

      <div className="main-content">
        <Header title="Gestion des disponibilités" />

        {error && <div className="alert alert-danger">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <form onSubmit={handleSubmit}>
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

          {/* Consultation Options */}
          <div className="settings-card">
            <h2>
              <i className="fas fa-stethoscope"></i> Options de consultation
            </h2>

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="offersPhysicalConsultation"
                  name="offersPhysicalConsultation"
                  checked={consultationOptions.offersPhysicalConsultation}
                  onChange={handleConsultationOptionChange}
                />
                <label htmlFor="offersPhysicalConsultation">Proposer des consultations physiques</label>
              </div>
            </div>

            {consultationOptions.offersPhysicalConsultation && (
              <div className="form-group">
                <label>Tarif consultation physique (€)</label>
                <input
                  type="number"
                  className="form-control"
                  name="physicalConsultationFee"
                  value={consultationOptions.physicalConsultationFee}
                  onChange={handleConsultationOptionChange}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="offersOnlineConsultation"
                  name="offersOnlineConsultation"
                  checked={consultationOptions.offersOnlineConsultation}
                  onChange={handleConsultationOptionChange}
                />
                <label htmlFor="offersOnlineConsultation">Proposer des consultations en ligne</label>
              </div>
            </div>

            {consultationOptions.offersOnlineConsultation && (
              <div className="form-group">
                <label>Tarif consultation en ligne (€)</label>
                <input
                  type="number"
                  className="form-control"
                  name="onlineConsultationFee"
                  value={consultationOptions.onlineConsultationFee}
                  onChange={handleConsultationOptionChange}
                  min="0"
                  step="0.01"
                />
              </div>
            )}
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

export default DoctorAvailability
