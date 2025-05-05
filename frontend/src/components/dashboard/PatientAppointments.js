"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./PatientAppointments.css"

const PatientAppointments = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    // Check if user is authenticated and is a patient
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token || userType !== "patient") {
      navigate("/login")
      return
    }

    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/consultations/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setAppointments(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching appointments:", err)
        setError("Impossible de charger les rendez-vous.")
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [navigate])

  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `http://localhost:8000/api/consultations/${appointmentId}/`,
        { status: "cancelled" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      // Update the appointment in the local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, status: "cancelled" } : appointment,
      )

      setAppointments(updatedAppointments)

      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment({ ...selectedAppointment, status: "cancelled" })
      }
    } catch (err) {
      console.error("Error cancelling appointment:", err)
      setError("Échec de l'annulation du rendez-vous.")
    }
  }

  const filterAppointments = (status) => {
    if (status === "upcoming") {
      return appointments.filter(
        (appointment) =>
          (appointment.status === "pending" || appointment.status === "confirmed") &&
          new Date(appointment.date) >= new Date().setHours(0, 0, 0, 0),
      )
    } else if (status === "past") {
      return appointments.filter(
        (appointment) =>
          appointment.status === "completed" ||
          appointment.status === "cancelled" ||
          new Date(appointment.date) < new Date().setHours(0, 0, 0, 0),
      )
    }
    return appointments
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "status-badge status-pending"
      case "confirmed":
        return "status-badge status-confirmed"
      case "cancelled":
        return "status-badge status-cancelled"
      case "completed":
        return "status-badge status-completed"
      default:
        return "status-badge"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "confirmed":
        return "Confirmé"
      case "cancelled":
        return "Annulé"
      case "completed":
        return "Terminé"
      default:
        return status
    }
  }

  const getConsultationTypeText = (type) => {
    return type === "physical" ? "Physique" : "En ligne"
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  const filteredAppointments = filterAppointments(activeTab)

  return (
    <div className="patient-appointments-container">
      <div className="appointments-header">
        <h1>Mes rendez-vous</h1>
        <button className="btn-new-appointment" onClick={() => navigate("/doctors")}>
          <i className="fas fa-plus"></i> Nouveau rendez-vous
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="appointments-tabs">
        <button
          className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          Rendez-vous à venir
        </button>
        <button className={`tab-button ${activeTab === "past" ? "active" : ""}`} onClick={() => setActiveTab("past")}>
          Historique
        </button>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="no-appointments">
          <i className="fas fa-calendar-times"></i>
          <p>Aucun rendez-vous {activeTab === "upcoming" ? "à venir" : "passé"}</p>
          {activeTab === "upcoming" && (
            <button className="btn-book-now" onClick={() => navigate("/doctors")}>
              Prendre rendez-vous maintenant
            </button>
          )}
        </div>
      ) : (
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <div className="appointment-card" key={appointment.id}>
              <div className="appointment-header">
                <div className="appointment-date">
                  <i className="fas fa-calendar-day"></i>
                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                </div>
                <div className="appointment-time">
                  <i className="fas fa-clock"></i>
                  <span>
                    {appointment.start_time} - {appointment.end_time}
                  </span>
                </div>
                <div className="appointment-type">
                  <i className={appointment.consultation_type === "physical" ? "fas fa-hospital" : "fas fa-video"}></i>
                  <span>{getConsultationTypeText(appointment.consultation_type)}</span>
                </div>
                <div className={getStatusBadgeClass(appointment.status)}>{getStatusText(appointment.status)}</div>
              </div>

              <div className="appointment-body">
                <div className="doctor-info">
                  <h3>Dr. {appointment.doctor.user.username}</h3>
                  <p className="doctor-specialty">{appointment.doctor.specialty}</p>
                </div>

                {appointment.symptoms && (
                  <div className="symptoms">
                    <h4>Symptômes décrits:</h4>
                    <p>{appointment.symptoms}</p>
                  </div>
                )}
              </div>

              <div className="appointment-actions">
                <button className="btn btn-primary" onClick={() => handleViewAppointment(appointment)}>
                  <i className="fas fa-eye"></i> Voir détails
                </button>

                {(appointment.status === "pending" || appointment.status === "confirmed") &&
                  new Date(appointment.date) > new Date() && (
                    <button className="btn btn-danger" onClick={() => handleCancelAppointment(appointment.id)}>
                      <i className="fas fa-times"></i> Annuler
                    </button>
                  )}

                {appointment.status === "confirmed" &&
                  appointment.consultation_type === "online" &&
                  new Date(`${appointment.date}T${appointment.start_time}`) <= new Date() &&
                  new Date(`${appointment.date}T${appointment.end_time}`) >= new Date() && (
                    <button className="btn btn-success">
                      <i className="fas fa-video"></i> Rejoindre consultation
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="modal-overlay">
          <div className="appointment-modal">
            <div className="modal-header">
              <h2>Détails du rendez-vous</h2>
              <button className="close-modal" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="appointment-details">
                <div className="detail-row">
                  <div className="detail-label">Médecin:</div>
                  <div className="detail-value">Dr. {selectedAppointment.doctor.user.username}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Spécialité:</div>
                  <div className="detail-value">{selectedAppointment.doctor.specialty}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Date:</div>
                  <div className="detail-value">{new Date(selectedAppointment.date).toLocaleDateString()}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Heure:</div>
                  <div className="detail-value">
                    {selectedAppointment.start_time} - {selectedAppointment.end_time}
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Type:</div>
                  <div className="detail-value">{getConsultationTypeText(selectedAppointment.consultation_type)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Statut:</div>
                  <div className={getStatusBadgeClass(selectedAppointment.status)}>
                    {getStatusText(selectedAppointment.status)}
                  </div>
                </div>
              </div>

              {selectedAppointment.symptoms && (
                <div className="symptoms-section">
                  <h3>Symptômes décrits:</h3>
                  <p>{selectedAppointment.symptoms}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div className="notes-section">
                  <h3>Notes du médecin:</h3>
                  <p>{selectedAppointment.notes}</p>
                </div>
              )}

              {selectedAppointment.diagnosis && (
                <div className="diagnosis-section">
                  <h3>Diagnostic:</h3>
                  <p>{selectedAppointment.diagnosis}</p>
                </div>
              )}

              {selectedAppointment.treatment && (
                <div className="treatment-section">
                  <h3>Traitement recommandé:</h3>
                  <p>{selectedAppointment.treatment}</p>
                </div>
              )}

              {selectedAppointment.prescriptions && selectedAppointment.prescriptions.length > 0 && (
                <div className="prescriptions-section">
                  <h3>Prescriptions:</h3>
                  <div className="prescriptions-list">
                    {selectedAppointment.prescriptions.map((prescription, index) => (
                      <div className="prescription-item" key={index}>
                        <h4>{prescription.medication}</h4>
                        <div className="prescription-details">
                          <div className="prescription-detail">
                            <span className="detail-label">Dosage:</span>
                            <span>{prescription.dosage}</span>
                          </div>
                          <div className="prescription-detail">
                            <span className="detail-label">Fréquence:</span>
                            <span>{prescription.frequency}</span>
                          </div>
                          <div className="prescription-detail">
                            <span className="detail-label">Durée:</span>
                            <span>{prescription.duration}</span>
                          </div>
                          {prescription.notes && (
                            <div className="prescription-detail">
                              <span className="detail-label">Notes:</span>
                              <span>{prescription.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {(selectedAppointment.status === "pending" || selectedAppointment.status === "confirmed") &&
                new Date(selectedAppointment.date) > new Date() && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handleCancelAppointment(selectedAppointment.id)
                      handleCloseModal()
                    }}
                  >
                    <i className="fas fa-times"></i> Annuler ce rendez-vous
                  </button>
                )}

              {selectedAppointment.status === "confirmed" &&
                selectedAppointment.consultation_type === "online" &&
                new Date(`${selectedAppointment.date}T${selectedAppointment.start_time}`) <= new Date() &&
                new Date(`${selectedAppointment.date}T${selectedAppointment.end_time}`) >= new Date() && (
                  <button className="btn btn-success">
                    <i className="fas fa-video"></i> Rejoindre consultation
                  </button>
                )}

              <button className="btn btn-secondary" onClick={handleCloseModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientAppointments
