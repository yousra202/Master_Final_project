"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./Dashboard.css"

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    pendingDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
  })
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:8000/api/admin/dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // Mettre à jour les statistiques
        setStats({
          totalDoctors: response.data.statistics.total_doctors || 0,
          pendingDoctors: response.data.statistics.pending_doctors || 0,
          totalPatients: response.data.statistics.total_patients || 0,
          totalAppointments: 0, // À implémenter plus tard
        })

        // Mettre à jour les médecins en attente
        setPendingDoctors(response.data.pending_requests || [])

        // Mettre à jour les activités récentes
        setRecentActivities(response.data.recent_activities || [])

        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Impossible de charger les données du tableau de bord.")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleValidateDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.post(
        `http://localhost:8000/api/admin/doctors/validate/${doctorId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Mettre à jour la liste des médecins en attente
      setPendingDoctors(pendingDoctors.filter((doctor) => doctor.id !== doctorId))

      // Mettre à jour les statistiques
      setStats({
        ...stats,
        totalDoctors: stats.totalDoctors + 1,
        pendingDoctors: stats.pendingDoctors - 1,
      })

      // Ajouter une nouvelle activité
      const newActivity = {
        id: Date.now(),
        action: "account_validation",
        user: { username: localStorage.getItem("username") || "Admin" },
        details: "Validation d'un compte médecin",
        timestamp: new Date().toISOString(),
      }

      setRecentActivities([newActivity, ...recentActivities])
    } catch (err) {
      console.error("Error validating doctor:", err)
      alert("Erreur lors de la validation du médecin.")
    }
  }

  const handleRejectDoctor = async (doctorId) => {
    try {
      const reason = prompt("Veuillez indiquer la raison du rejet:")
      if (!reason) return

      const token = localStorage.getItem("token")
      await axios.post(
        `http://localhost:8000/api/admin/doctors/reject/${doctorId}/`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Mettre à jour la liste des médecins en attente
      setPendingDoctors(pendingDoctors.filter((doctor) => doctor.id !== doctorId))

      // Mettre à jour les statistiques
      setStats({
        ...stats,
        pendingDoctors: stats.pendingDoctors - 1,
      })

      // Ajouter une nouvelle activité
      const newActivity = {
        id: Date.now(),
        action: "account_rejection",
        user: { username: localStorage.getItem("username") || "Admin" },
        details: `Rejet d'un compte médecin. Raison: ${reason}`,
        timestamp: new Date().toISOString(),
      }

      setRecentActivities([newActivity, ...recentActivities])
    } catch (err) {
      console.error("Error rejecting doctor:", err)
      alert("Erreur lors du rejet du médecin.")
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement des données...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <h1 className="page-title">Tableau de bord</h1>

      {error && <div className="error-alert">{error}</div>}

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon doctor-icon">
            <i className="fas fa-user-md"></i>
          </div>
          <div className="stat-content">
            <h3>Médecins</h3>
            <div className="stat-value">{stats.totalDoctors}</div>
            <div className="stat-label">Total des médecins</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending-icon">
            <i className="fas fa-user-clock"></i>
          </div>
          <div className="stat-content">
            <h3>En attente</h3>
            <div className="stat-value">{stats.pendingDoctors}</div>
            <div className="stat-label">Médecins à valider</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon patient-icon">
            <i className="fas fa-user"></i>
          </div>
          <div className="stat-content">
            <h3>Patients</h3>
            <div className="stat-value">{stats.totalPatients}</div>
            <div className="stat-label">Total des patients</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon appointment-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>Rendez-vous</h3>
            <div className="stat-value">{stats.totalAppointments}</div>
            <div className="stat-label">Total des rendez-vous</div>
          </div>
        </div>
      </div>

      {/* Médecins en attente */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Médecins en attente de validation</h2>
          <span className="badge">{pendingDoctors.length}</span>
        </div>

        {pendingDoctors.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Spécialité</th>
                  <th>Date d'inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.user.username}</td>
                    <td>{doctor.user.email}</td>
                    <td>{doctor.specialty || "Non spécifié"}</td>
                    <td>{new Date(doctor.user.date_joined || Date.now()).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        className="action-btn validate-btn"
                        onClick={() => handleValidateDoctor(doctor.id)}
                        title="Valider"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleRejectDoctor(doctor.id)}
                        title="Rejeter"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <button className="action-btn view-btn" title="Voir détails">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <p>Aucun médecin en attente de validation</p>
          </div>
        )}
      </div>

      {/* Activités récentes */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2>Activités récentes</h2>
        </div>

        {recentActivities.length > 0 ? (
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-icon">
                  {activity.action === "account_validation" && <i className="fas fa-check-circle"></i>}
                  {activity.action === "account_rejection" && <i className="fas fa-times-circle"></i>}
                  {activity.action === "login" && <i className="fas fa-sign-in-alt"></i>}
                  {activity.action === "logout" && <i className="fas fa-sign-out-alt"></i>}
                  {activity.action === "admin_creation" && <i className="fas fa-user-plus"></i>}
                  {!["account_validation", "account_rejection", "login", "logout", "admin_creation"].includes(
                    activity.action,
                  ) && <i className="fas fa-history"></i>}
                </div>
                <div className="activity-content">
                  <div className="activity-header">
                    <span className="activity-user">{activity.user.username}</span>
                    <span className="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="activity-details">{activity.details}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-history"></i>
            <p>Aucune activité récente</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
