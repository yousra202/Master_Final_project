"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./DoctorDashboard.css"

// Utility function for conditional class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(" ")
}

function DoctorDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [patientRecords, setPatientRecords] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctorData, setDoctorData] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour accéder à cette page")
          setLoading(false)
          return
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        // Fetch doctor profile information - using the same endpoint as the sidebar
        try {
          const doctorResponse = await axios.get("http://localhost:8000/api/doctor/profile/", {
            headers,
          })
          setDoctorData(doctorResponse.data)
        } catch (err) {
          console.error("Error fetching doctor profile:", err)
        }

        // Fetch upcoming appointments
        const appointmentsResponse = await axios.get("http://localhost:8000/api/consultations/", {
          headers,
        })

        // Filter upcoming appointments
        const upcoming = appointmentsResponse.data
          .filter(
            (appointment) =>
              (appointment.status === "confirmed" || appointment.status === "pending") &&
              new Date(appointment.date) >= new Date(),
          )
          .sort((a, b) => new Date(a.date) - new Date(b.date))

        setUpcomingAppointments(upcoming.slice(0, 5)) // Get only the next 5 appointments

        // Fetch patient medical records - this matches the API call in DoctorMedicalRecordView
        try {
          const recordsResponse = await axios.get("http://localhost:8000/api/records/", {
            headers,
          })
          setPatientRecords(recordsResponse.data)

          // Log the first record to see its structure
          if (recordsResponse.data.length > 0) {
            console.log("Patient record structure:", recordsResponse.data[0])
          }
        } catch (err) {
          console.log("No patient records found or not accessible yet")
          // This is not a critical error, so we don't set the error state
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Erreur lors du chargement des données. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedPatient(null)
  }

  // Default image fallback
  const defaultProfileImage = "/assets/default-profile.png"

  // Calculate age from birth_date
  const calculateAge = (birthDate) => {
    if (!birthDate) return "-"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="header-title">Tableau de bord</h1>
        <div className="user-actions">
          <div className="notification-bell">
            <i className="fas fa-bell"></i>
            <div className="notification-count">3</div>
          </div>
          <div className="user-profile">
            {doctorData?.profile_picture ? (
              <img
                src={`http://localhost:8000${doctorData.profile_picture}`}
                alt="User Profile"
                className="profile-image"
                onError={(e) => {
                  e.target.src = defaultProfileImage
                }}
              />
            ) : (
              <img src={defaultProfileImage || "/placeholder.svg"} alt="User Profile" className="profile-image" />
            )}
            <span className="profile-name">{doctorData?.user?.username || "Dr. Ahmed Benali"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {/* Dashboard Cards */}
        <div className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Rendez-vous aujourd'hui</div>
              <div className="card-icon blue">
                <i className="fas fa-calendar-day"></i>
              </div>
            </div>
            <div className="card-content">
              <div className="card-value">
                {upcomingAppointments.filter((a) => new Date(a.date).toDateString() === new Date().toDateString()).length}
              </div>
              <div className="card-description">Rendez-vous programmés pour aujourd'hui</div>
            </div>
          </div>


          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Patients ce mois</div>
              <div className="card-icon green">
                <i className="fas fa-user-injured"></i>
              </div>
            </div>
            <div className="card-content">
            <div className="card-value">{patientRecords.length}</div>
            <div className="card-description">
              {
                patientRecords.filter((r) => new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                  .length
              }{" "}
              nouveaux patients
            </div>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title">Consultations en ligne</div>
              <div className="card-icon red">
                <i className="fas fa-video"></i>
              </div>
            </div>.
            <div className="card-content">
            <div className="card-value">
              {upcomingAppointments.filter((a) => a.consultation_type === "online").length}
            </div>
            <div className="card-description">
              {upcomingAppointments.filter((a) => a.consultation_type === "online" && a.status === "pending").length} en
              attente
            </div>
          </div>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Prochains rendez-vous</div>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." className="search-input" />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Motif</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>
                        <div className="patient-info">
                          <Avatar patient={appointment.patient} defaultImage={defaultProfileImage} />
                          <span>{appointment.patient.user.username}</span>
                        </div>
                      </td>
                      <td>{new Date(appointment.date).toLocaleDateString()}</td>
                      <td>{appointment.start_time}</td>
                      <td>{appointment.symptoms?.substring(0, 20) || "-"}</td>
                      <td>
                        <span
                          className={cn(
                            "status-badge",
                            appointment.status === "confirmed" ? "status-confirmed" : "status-pending",
                          )}
                        >
                          {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn view">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn approve">
                            <i className="fas fa-check"></i>
                          </button>
                          <button className="action-btn cancel">
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      Aucun rendez-vous à venir
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Patients récents</div>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." className="search-input" />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Âge</th>
                  <th>Dernière visite</th>
                  <th>Prochain RDV</th>
                  <th>Dossier médical</th>
                 
                </tr>
              </thead>
              <tbody>
                {patientRecords.length > 0 ? (
                  patientRecords.slice(0, 3).map((record) => {
                    // Find next appointment for this patient
                    const nextAppointment = upcomingAppointments.find((a) => a.patient.id === record.patient.id)

                    // Calculate age from birth_date
                    const patientAge = calculateAge(record.patient.user.birth_date)

                    return (
                      <tr key={record.id}>
                        <td>
                          <div className="patient-info">
                            <Avatar patient={record.patient} defaultImage={record.patient.user.profile_picture} />
                            <span>{record.patient.user.username}</span>
                          </div>
                        </td>
                        <td>{patientAge}</td>
                        <td>
                          {record.consultations && record.consultations.length > 0
                            ? new Date(record.consultations[0].date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{nextAppointment ? new Date(nextAppointment.date).toLocaleDateString() : "-"}</td>
                        <td>
                          <Link to={`/doctor/medical-records/${record.id}`} className="view-record-btn">
                            Voir dossier
                          </Link>
                        </td>
                        
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-table">
                      Aucun patient enregistré
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title">Détails du patient</div>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input type="text" className="form-input" value={selectedPatient.user.username || "-"} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Date de naissance</label>
                  <input type="text" className="form-input" value={selectedPatient.user.birth_date || "-"} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="text" className="form-input" value={selectedPatient.user.email || "-"} readOnly />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="text" className="form-input" value={selectedPatient.user.phone || "-"} readOnly />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adresse</label>
                <input type="text" className="form-input" value={selectedPatient.address || "-"} readOnly />
              </div>

              <div className="form-group">
                <label className="form-label">Antécédents médicaux</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  readOnly
                  value={selectedPatient.medical_history || "-"}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Genre</label>
                <input type="text" className="form-input" value={selectedPatient.user.gender || "-"} readOnly />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary">Modifier</button>
              <button className="btn-secondary" onClick={closeModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for patient avatars
function Avatar({ patient, defaultImage }) {
  // Check all possible locations for the profile image
  const getProfileImage = () => {
    if (patient.profile_picture) {
      return `http://localhost:8000${patient.profile_picture}`
    }

    if (patient.profile_image) {
      return patient.profile_image
    }

    if (patient.user ) {
      return `http://localhost:8000${patient.user.profile_picture}`
    }

    return defaultImage || "/placeholder.svg"
  }

  return (
    <img
      src={getProfileImage() }
      alt={`${patient.user.username}`}
      className="patient-avatar"
      onError={(e) => {
        e.target.src = defaultImage 
      }}
    />
  )
}

export default DoctorDashboard
