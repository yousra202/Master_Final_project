"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { logout, getCurrentUser } from "../../../services/authService"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "./DoctorDashboard.css"
import Sidebar from "../../common/Sidebar"

import ProfileInitials from "../../common/ProfileInitials"

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const [doctorData, setDoctorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

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
        const response = await axios.get("http://localhost:8000/api/doctor/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setDoctorData(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching doctor data:", err)

        // If it's an authentication error, redirect to login
        if (err.response && err.response.status === 401) {
          logout()
          navigate("/login")
          return
        }

        // Otherwise, continue with default data
        setError("Impossible de charger les données du profil.")
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

 

  const openPatientModal = (patient) => {
    setSelectedPatient(patient)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    )
  }

  // Sample data for the dashboard
  const dashboardData = {
    appointmentsToday: 8,
    patientsThisMonth: 42,
    onlineConsultations: 5,
  }

  // Sample data for upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      name: "Fatima Zohra",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "15/06/2023",
      time: "09:30",
      reason: "Contrôle cardiaque",
      status: "confirmed",
    },
    {
      id: 2,
      name: "Mohamed Ali",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      date: "15/06/2023",
      time: "11:00",
      reason: "Première consultation",
      status: "pending",
    },
    {
      id: 3,
      name: "Leila Benmoussa",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      date: "15/06/2023",
      time: "14:30",
      reason: "Suivi post-opératoire",
      status: "confirmed",
    },
    {
      id: 4,
      name: "Karim Boukadoum",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      date: "16/06/2023",
      time: "10:15",
      reason: "Analyse des résultats",
      status: "confirmed",
    },
  ]

  // Sample data for recent patients
  const recentPatients = [
    {
      id: 1,
      name: "Fatima Zohra",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      age: 42,
      lastVisit: "01/06/2023",
      nextAppointment: "15/06/2023",
      hasMedicalRecord: true,
    },
    {
      id: 2,
      name: "Mohamed Ali",
      image: "https://randomuser.me/api/portraits/men/22.jpg",
      age: 35,
      lastVisit: "-",
      nextAppointment: "15/06/2023",
      hasMedicalRecord: false,
    },
    {
      id: 3,
      name: "Leila Benmoussa",
      image: "https://randomuser.me/api/portraits/women/33.jpg",
      age: 58,
      lastVisit: "25/05/2023",
      nextAppointment: "15/06/2023",
      hasMedicalRecord: true,
    },
  ]

  // Get doctor name from localStorage or doctorData
  const currentUser = getCurrentUser()
  const doctorName = doctorData?.user?.username || currentUser?.username || "Doctor"
  const specialty = doctorData?.specialty || "Médecin"

  return (
    <div className="doctor-dashboard">
      {/* Sidebar Navigation */}
      <Sidebar activePage="settings" />
        

      {/* Main Content Area */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <h1>Tableau de bord</h1>
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
                />
              ) : (
                <ProfileInitials name={doctorName} size={40} />
              )}
              <span>Dr. {doctorName}</span>
              <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Rendez-vous aujourd'hui</div>
              <div className="card-icon" style={{ backgroundColor: "var(--secondary-color)" }}>
                <i className="fas fa-calendar-day"></i>
              </div>
            </div>
            <div className="card-value">{dashboardData.appointmentsToday}</div>
            <div className="card-description">+2 par rapport à hier</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Patients ce mois</div>
              <div className="card-icon" style={{ backgroundColor: "var(--success-color)" }}>
                <i className="fas fa-user-injured"></i>
              </div>
            </div>
            <div className="card-value">{dashboardData.patientsThisMonth}</div>
            <div className="card-description">15 nouveaux patients</div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Consultations en ligne</div>
              <div className="card-icon" style={{ backgroundColor: "var(--accent-color)" }}>
                <i className="fas fa-video"></i>
              </div>
            </div>
            <div className="card-value">{dashboardData.onlineConsultations}</div>
            <div className="card-description">3 en attente</div>
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Prochains rendez-vous</div>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>

          <table>
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
              {upcomingAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={appointment.image || "/placeholder.svg"}
                        alt="Patient"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                      <span>{appointment.name}</span>
                    </div>
                  </td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.reason}</td>
                  <td>
                    <span className={`status status-${appointment.status}`}>
                      {appointment.status === "confirmed" ? "Confirmé" : "En attente"}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn btn-primary" onClick={() => openPatientModal(appointment)}>
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn btn-success">
                      <i className="fas fa-check"></i>
                    </button>
                    <button className="action-btn btn-danger">
                      <i className="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Patients Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-title">Patients récents</div>
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Rechercher..." />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Âge</th>
                <th>Dernière visite</th>
                <th>Prochain RDV</th>
                <th>Dossier médical</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={patient.image || "/placeholder.svg"}
                        alt="Patient"
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          marginRight: "10px",
                        }}
                      />
                      <span>{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.age}</td>
                  <td>{patient.lastVisit}</td>
                  <td>{patient.nextAppointment}</td>
                  <td>
                    <button className="action-btn btn-primary">
                      {patient.hasMedicalRecord ? "Voir dossier" : "Créer dossier"}
                    </button>
                  </td>
                  <td>
                    <button className="action-btn btn-primary" onClick={() => openPatientModal(patient)}>
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn btn-success">
                      <i className="fas fa-edit"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Error message if any */}
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Modal for Patient Details */}
      {showModal && (
        <div className={`modal-overlay ${showModal ? "show" : ""}`}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Détails du patient</div>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-container">
                <div className="form-row">
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Nom complet</label>
                      <input type="text" className="form-control" value={selectedPatient?.name || ""} readOnly />
                    </div>
                  </div>
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Date de naissance</label>
                      <input type="text" className="form-control" value="12/05/1981" readOnly />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`${selectedPatient?.name.toLowerCase().replace(" ", ".")}@example.com`}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Téléphone</label>
                      <input type="text" className="form-control" value="+213 123 456 789" readOnly />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse</label>
                  <input type="text" className="form-control" value="123 Rue des Jardins, Alger" readOnly />
                </div>

                <div className="form-group">
                  <label className="form-label">Antécédents médicaux</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    readOnly
                    value="Hypertension artérielle diagnostiquée en 2015. Allergie à la pénicilline. A subi une ablation de la vésicule biliaire en 2018."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Traitements en cours</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    readOnly
                    value="Atorvastatine 20mg 1x/jour - Bisoprolol 5mg 1x/jour - Aspirine 100mg 1x/jour"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary">Modifier</button>
              <button className="btn" onClick={closeModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
