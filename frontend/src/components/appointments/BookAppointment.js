"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"
import "./BookAppointment.css"

const BookAppointment = () => {
  const navigate = useNavigate()
  const { doctorId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [doctor, setDoctor] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [bookedSlots, setBookedSlots] = useState({})
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [consultationType, setConsultationType] = useState("physical")
  const [symptoms, setSymptoms] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    // Check if user is authenticated and is a patient
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token) {
      navigate("/login")
      return
    }

    if (userType !== "patient") {
      navigate("/")
      return
    }

    // Fetch doctor availability
    const fetchDoctorAvailability = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/doctors/${doctorId}/availability/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setDoctor({
          id: response.data.doctor_id,
          name: response.data.doctor_name,
          offersPhysicalConsultation: response.data.offers_physical_consultation,
          offersOnlineConsultation: response.data.offers_online_consultation,
          physicalConsultationFee: response.data.physical_consultation_fee,
          onlineConsultationFee: response.data.online_consultation_fee,
        })

        setAvailability(response.data.availability)
        setBookedSlots(response.data.booked_slots)

        // Set default consultation type based on what the doctor offers
        if (response.data.offers_physical_consultation) {
          setConsultationType("physical")
        } else if (response.data.offers_online_consultation) {
          setConsultationType("online")
        }

        // Set default selected date to the next available day
        if (
          response.data.availability &&
          response.data.availability.schedule &&
          response.data.availability.schedule.length > 0
        ) {
          const today = new Date()
          const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.

          // Map day names to day numbers
          const dayMap = {
            Lundi: 1,
            Mardi: 2,
            Mercredi: 3,
            Jeudi: 4,
            Vendredi: 5,
            Samedi: 6,
            Dimanche: 0,
          }

          // Find the next available day
          let nextAvailableDay = null
          let daysToAdd = 0

          while (!nextAvailableDay && daysToAdd < 7) {
            const checkDate = new Date(today)
            checkDate.setDate(today.getDate() + daysToAdd)
            const checkDayOfWeek = checkDate.getDay()

            // Find if this day is in the doctor's schedule
            const availableDay = response.data.availability.schedule.find((day) => dayMap[day.day] === checkDayOfWeek)

            if (availableDay) {
              nextAvailableDay = checkDate
            }

            daysToAdd++
          }

          if (nextAvailableDay) {
            setSelectedDate(nextAvailableDay.toISOString().split("T")[0])
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching doctor availability:", err)
        setError("Impossible de charger les disponibilités du médecin.")
        setLoading(false)
      }
    }

    fetchDoctorAvailability()
  }, [doctorId, navigate])

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Convert to French day names
    const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    return dayNames[dayOfWeek]
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDate || !availability || !availability.schedule) return []

    const dayOfWeek = getDayOfWeek(selectedDate)
    const daySchedule = availability.schedule.find((day) => day.day === dayOfWeek)

    if (!daySchedule) return []

    // Get all time slots for the day
    const allSlots = []
    const consultationDuration = availability.consultationDuration || 30

    daySchedule.slots.forEach((slot) => {
      const startTime = new Date(`2000-01-01T${slot.start}:00`)
      const endTime = new Date(`2000-01-01T${slot.end}:00`)

      // Create slots based on consultation duration
      let currentTime = new Date(startTime)
      while (currentTime.getTime() + consultationDuration * 60000 <= endTime.getTime()) {
        const slotEndTime = new Date(currentTime.getTime() + consultationDuration * 60000)

        allSlots.push({
          start: currentTime.toTimeString().substring(0, 5),
          end: slotEndTime.toTimeString().substring(0, 5),
        })

        currentTime = slotEndTime
      }
    })

    // Filter out booked slots
    const bookedSlotsForDate = bookedSlots[selectedDate] || []

    return allSlots.filter((slot) => {
      // Check if this slot overlaps with any booked slot
      return !bookedSlotsForDate.some((bookedSlot) => {
        return (
          (slot.start < bookedSlot.end && slot.end > bookedSlot.start) ||
          (slot.start === bookedSlot.start && slot.end === bookedSlot.end)
        )
      })
    })
  }

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
  }

  const handleConsultationTypeChange = (e) => {
    setConsultationType(e.target.value)
  }

  const handleSymptomsChange = (e) => {
    setSymptoms(e.target.value)
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedSlot) {
      setError("Veuillez sélectionner une date et un créneau horaire.")
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      const appointmentData = {
        doctor: doctorId,
        date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        consultation_type: consultationType,
        symptoms: symptoms,
      }

      console.log("Sending appointment data:", appointmentData)

      await axios.post("http://localhost:8000/api/consultations/", appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      setSuccessMessage(
        "Rendez-vous demandé avec succès! Vous serez notifié lorsque le médecin confirmera votre rendez-vous.",
      )

      // Reset form
      setSelectedSlot(null)
      setSymptoms("")

      // Redirect to patient dashboard after a delay
      setTimeout(() => {
        navigate("/patient/appointments")
      }, 3000)
    } catch (err) {
      console.error("Error booking appointment:", err)
      setError("Échec de la réservation du rendez-vous. Veuillez réessayer.")
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

  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <div className="book-appointment-container">
      <div className="appointment-header">
        <h1>Prendre rendez-vous</h1>
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Retour
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="appointment-content">
        <div className="doctor-info-card">
          <h2>Dr. {doctor?.name}</h2>

          <div className="consultation-types">
            <h3>Types de consultation disponibles:</h3>
            <div className="consultation-options">
              {doctor?.offersPhysicalConsultation && (
                <div className="consultation-option">
                  <i className="fas fa-hospital"></i>
                  <div>
                    <h4>Consultation physique</h4>
                     
                  </div>
                </div>
              )}

              {doctor?.offersOnlineConsultation && (
                <div className="consultation-option">
                  <i className="fas fa-video"></i>
                  <div>
                    <h4>Consultation en ligne</h4>
                   
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="booking-form">
          <div className="form-section">
            <h3>1. Choisissez le type de consultation</h3>
            <div className="consultation-type-selector">
              {doctor?.offersPhysicalConsultation && (
                <label className={`type-option ${consultationType === "physical" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="physical"
                    checked={consultationType === "physical"}
                    onChange={handleConsultationTypeChange}
                  />
                  <i className="fas fa-hospital"></i>
                  <span>Consultation physique</span>
                </label>
              )}

              {doctor?.offersOnlineConsultation && (
                <label className={`type-option ${consultationType === "online" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="consultationType"
                    value="online"
                    checked={consultationType === "online"}
                    onChange={handleConsultationTypeChange}
                  />
                  <i className="fas fa-video"></i>
                  <span>Consultation en ligne</span>
                </label>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>2. Sélectionnez une date</h3>
            <div className="date-selector">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split("T")[0]}
                className="date-input"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>3. Sélectionnez un créneau horaire</h3>
            {selectedDate ? (
              availableTimeSlots.length > 0 ? (
                <div className="time-slots">
                  {availableTimeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`time-slot ${selectedSlot && selectedSlot.start === slot.start ? "selected" : ""}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      {slot.start} - {slot.end}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-slots-message">
                  <i className="fas fa-calendar-times"></i>
                  <p>Aucun créneau disponible pour cette date. Veuillez sélectionner une autre date.</p>
                </div>
              )
            ) : (
              <div className="no-date-message">Veuillez d'abord sélectionner une date.</div>
            )}
          </div>

          <div className="form-section">
            <h3>4. Décrivez vos symptômes</h3>
            <textarea
              className="symptoms-input"
              placeholder="Décrivez vos symptômes ou la raison de votre consultation..."
              value={symptoms}
              onChange={handleSymptomsChange}
              rows="4"
            ></textarea>
          </div>

          <div className="form-section summary">
            <h3>Résumé de votre rendez-vous</h3>
            <div className="appointment-summary">
              <div className="summary-item">
                <span className="summary-label">Médecin:</span>
                <span className="summary-value">Dr. {doctor?.name}</span>
              </div>

              {selectedDate && (
                <div className="summary-item">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
              )}

              {selectedSlot && (
                <div className="summary-item">
                  <span className="summary-label">Heure:</span>
                  <span className="summary-value">
                    {selectedSlot.start} - {selectedSlot.end}
                  </span>
                </div>
              )}

              <div className="summary-item">
                <span className="summary-label">Type de consultation:</span>
                <span className="summary-value">
                  {consultationType === "physical" ? "Consultation physique" : "Consultation en ligne"}
                </span>
              </div>

              
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-book"
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedSlot || loading}
            >
              {loading ? "Traitement en cours..." : "Confirmer le rendez-vous"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookAppointment
