"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "../../common/Sidebar"
import Header from "../../common/Header"
import "./DoctorAppointments.css"

const DoctorAppointments = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [appointments, setAppointments] = useState([])
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [consultationNotes, setConsultationNotes] = useState({
    notes: "",
    diagnosis: "",
    treatment: "",
  })
  const [prescriptions, setPrescriptions] = useState([
    { medication: "", dosage: "", frequency: "", duration: "", notes: "" },
  ])

  useEffect(() => {
    // Check if user is authenticated and is a doctor
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token || userType !== "doctor") {
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
    setConsultationNotes({
      notes: appointment.notes || "",
      diagnosis: appointment.diagnosis || "",
      treatment: appointment.treatment || "",
    })
    setPrescriptions(
      appointment.prescriptions && appointment.prescriptions.length > 0
        ? appointment.prescriptions
        : [{ medication: "", dosage: "", frequency: "", duration: "", notes: "" }],
    )
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAppointment(null)
  }

  const handleNotesChange = (e) => {
    const { name, value } = e.target
    setConsultationNotes({
      ...consultationNotes,
      [name]: value,
    })
  }

  const handlePrescriptionChange = (index, e) => {
    const { name, value } = e.target
    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions[index] = {
      ...updatedPrescriptions[index],
      [name]: value,
    }
    setPrescriptions(updatedPrescriptions)
  }

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { medication: "", dosage: "", frequency: "", duration: "", notes: "" }])
  }

  const handleRemovePrescription = (index) => {
    const updatedPrescriptions = [...prescriptions]
    updatedPrescriptions.splice(index, 1)
    setPrescriptions(updatedPrescriptions)
  }

  const handleUpdateAppointment = async (status) => {
    if (!selectedAppointment) return

    try {
      const token = localStorage.getItem("token")
      const updateData = {
        status,
        notes: consultationNotes.notes,
        diagnosis: consultationNotes.diagnosis,
        treatment: consultationNotes.treatment,
        prescriptions: JSON.stringify(prescriptions.filter((p) => p.medication.trim() !== "")),
      }

      await axios.put(`http://localhost:8000/api/consultations/${selectedAppointment.id}/`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Update the appointment in the local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? {
              ...appointment,
              status,
              notes: consultationNotes.notes,
              diagnosis: consultationNotes.diagnosis,
              treatment: consultationNotes.treatment,
              prescriptions: prescriptions.filter((p) => p.medication.trim() !== ""),
            }
          : appointment,
      )

      setAppointments(updatedAppointments)
      handleCloseModal()
    } catch (err) {
      console.error("Error updating appointment:", err)
      setError("Échec de la mise à jour du rendez-vous.")
    }
  }

  const filterAppointments = (status) => {
    if (status === "upcoming") {
      return appointments.filter(
        (appointment) => appointment.status === "pending" || appointment.status === "confirmed",
      )
    } else if (status === "past") {
      return appointments.filter(
        (appointment) => appointment.status === "completed" || appointment.status === "cancelled",
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
    <div className="doctor-appointments-container">
      <Sidebar activePage="appointments" />

      <div className="main-content">
        <Header title="Gestion des rendez-vous" />

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
                    <i
                      className={appointment.consultation_type === "physical" ? "fas fa-hospital" : "fas fa-video"}
                    ></i>
                    <span>{getConsultationTypeText(appointment.consultation_type)}</span>
                  </div>
                  <div className={getStatusBadgeClass(appointment.status)}>{getStatusText(appointment.status)}</div>
                </div>

                <div className="appointment-body">
                  <div className="patient-info">
                    <h3>Patient: {appointment.patient.user.username}</h3>
                    <p>
                      <i className="fas fa-envelope"></i> {appointment.patient.user.email}
                    </p>
                    <p>
                      <i className="fas fa-phone"></i> {appointment.patient.user.phone || "Non spécifié"}
                    </p>
                  </div>

                  {appointment.symptoms && (
                    <div className="symptoms">
                      <h4>Symptômes:</h4>
                      <p>{appointment.symptoms}</p>
                    </div>
                  )}
                </div>

                <div className="appointment-actions">
                  <button className="btn btn-primary" onClick={() => handleViewAppointment(appointment)}>
                    <i className="fas fa-eye"></i> Voir détails
                  </button>

                  {appointment.status === "pending" && (
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        handleUpdateAppointment("confirmed")
                      }}
                    >
                      <i className="fas fa-check"></i> Confirmer
                    </button>
                  )}

                  {(appointment.status === "pending" || appointment.status === "confirmed") && (
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        handleUpdateAppointment("cancelled")
                      }}
                    >
                      <i className="fas fa-times"></i> Annuler
                    </button>
                  )}

                  {appointment.status === "confirmed" && (
                    <button
                      className="btn btn-info"
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        handleUpdateAppointment("completed")
                      }}
                    >
                      <i className="fas fa-check-double"></i> Terminer
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
                    <div className="detail-label">Patient:</div>
                    <div className="detail-value">{selectedAppointment.patient.user.username}</div>
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
                    <h3>Symptômes décrits par le patient:</h3>
                    <p>{selectedAppointment.symptoms}</p>
                  </div>
                )}

                <div className="consultation-notes">
                  <h3>Notes de consultation:</h3>
                  <div className="form-group">
                    <label>Notes générales:</label>
                    <textarea
                      name="notes"
                      value={consultationNotes.notes}
                      onChange={handleNotesChange}
                      rows="3"
                      className="form-control"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Diagnostic:</label>
                    <textarea
                      name="diagnosis"
                      value={consultationNotes.diagnosis}
                      onChange={handleNotesChange}
                      rows="2"
                      className="form-control"
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Traitement recommandé:</label>
                    <textarea
                      name="treatment"
                      value={consultationNotes.treatment}
                      onChange={handleNotesChange}
                      rows="2"
                      className="form-control"
                    ></textarea>
                  </div>
                </div>

                <div className="prescriptions-section">
                  <h3>Prescriptions:</h3>
                  {prescriptions.map((prescription, index) => (
                    <div className="prescription-item" key={index}>
                      <div className="prescription-header">
                        <h4>Prescription #{index + 1}</h4>
                        <button
                          type="button"
                          className="remove-prescription"
                          onClick={() => handleRemovePrescription(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      <div className="prescription-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Médicament:</label>
                            <input
                              type="text"
                              name="medication"
                              value={prescription.medication}
                              onChange={(e) => handlePrescriptionChange(index, e)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label>Dosage:</label>
                            <input
                              type="text"
                              name="dosage"
                              value={prescription.dosage}
                              onChange={(e) => handlePrescriptionChange(index, e)}
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Fréquence:</label>
                            <input
                              type="text"
                              name="frequency"
                              value={prescription.frequency}
                              onChange={(e) => handlePrescriptionChange(index, e)}
                              className="form-control"
                            />
                          </div>
                          <div className="form-group">
                            <label>Durée:</label>
                            <input
                              type="text"
                              name="duration"
                              value={prescription.duration}
                              onChange={(e) => handlePrescriptionChange(index, e)}
                              className="form-control"
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Notes:</label>
                          <textarea
                            name="notes"
                            value={prescription.notes}
                            onChange={(e) => handlePrescriptionChange(index, e)}
                            rows="2"
                            className="form-control"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-outline" onClick={handleAddPrescription}>
                    <i className="fas fa-plus"></i> Ajouter une prescription
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                {selectedAppointment.status === "pending" && (
                  <button className="btn btn-success" onClick={() => handleUpdateAppointment("confirmed")}>
                    <i className="fas fa-check"></i> Confirmer
                  </button>
                )}

                {(selectedAppointment.status === "pending" || selectedAppointment.status === "confirmed") && (
                  <button className="btn btn-danger" onClick={() => handleUpdateAppointment("cancelled")}>
                    <i className="fas fa-times"></i> Annuler
                  </button>
                )}

                {selectedAppointment.status === "confirmed" && (
                  <button className="btn btn-info" onClick={() => handleUpdateAppointment("completed")}>
                    <i className="fas fa-check-double"></i> Terminer
                  </button>
                )}

                <button className="btn btn-primary" onClick={() => handleUpdateAppointment(selectedAppointment.status)}>
                  <i className="fas fa-save"></i> Enregistrer les notes
                </button>

                <button className="btn btn-secondary" onClick={handleCloseModal}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DoctorAppointments
