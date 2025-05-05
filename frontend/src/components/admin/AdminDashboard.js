"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { logout, getCurrentUser } from "../../services/authService"
import "./AdminDashboard.css"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard")

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié et est un administrateur
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token || userType !== "admin") {
      navigate("/login")
      return
    }

    // Récupérer les données du tableau de bord
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/admin/dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setDashboardData(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err)
        setError("Impossible de charger les données du tableau de bord.")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

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

      // Rafraîchir les données
      window.location.reload()
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

      // Rafraîchir les données
      window.location.reload()
    } catch (err) {
      console.error("Error rejecting doctor:", err)
      alert("Erreur lors du rejet du médecin.")
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

  // Utiliser des données fictives si les données réelles ne sont pas disponibles
  const stats = dashboardData?.statistics || {
    verified_doctors: 0,
    pending_doctors: 0,
    rejected_doctors: 0,
    total_patients: 0,
  }

  const pendingRequests = dashboardData?.pending_requests || []
  const recentActivities = dashboardData?.recent_activities || []

  // Obtenir le nom d'utilisateur actuel
  const currentUser = getCurrentUser()
  const username = currentUser ? currentUser.username : "Admin"

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img src="/placeholder.svg?height=32&width=32" alt="Logo" />
            <span>MediConnect</span>
          </div>
        </div>

        <div className="sidebar-menu">
          <div
            className={`menu-item ${activeMenuItem === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveMenuItem("dashboard")}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Tableau de bord</span>
          </div>
          <div
            className={`menu-item ${activeMenuItem === "admins" ? "active" : ""}`}
            onClick={() => setActiveMenuItem("admins")}
          >
            <i className="fas fa-user-shield"></i>
            <span>Administrateurs</span>
          </div>
          <div
            className={`menu-item ${activeMenuItem === "validation" ? "active" : ""}`}
            onClick={() => setActiveMenuItem("validation")}
          >
            <i className="fas fa-users-cog"></i>
            <span>Validation comptes</span>
            <span className="menu-badge">{pendingRequests.length}</span>
          </div>
          <div
            className={`menu-item ${activeMenuItem === "config" ? "active" : ""}`}
            onClick={() => setActiveMenuItem("config")}
          >
            <i className="fas fa-cogs"></i>
            <span>Configuration</span>
          </div>
          <div
            className={`menu-item ${activeMenuItem === "analytics" ? "active" : ""}`}
            onClick={() => setActiveMenuItem("analytics")}
          >
            <i className="fas fa-chart-bar"></i>
            <span>Analytiques</span>
          </div>
          <div
            className={`menu-item ${activeMenuItem === "transactions" ? "active" : ""}`}
            onClick={() => setActiveMenuItem("transactions")}
          >
            <i className="fas fa-file-invoice-dollar"></i>
            <span>Transactions</span>
          </div>
          <div className="menu-item" style={{ marginTop: "20px" }} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Déconnexion</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="header-title">
            <h1>Tableau de bord Administrateur</h1>
            <p>Gestion centrale de la plateforme MediConnect</p>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{username.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{username}</div>
              <small style={{ fontSize: "0.8rem", color: "var(--gray)" }}>Super Admin</small>
            </div>
            <i className="fas fa-chevron-down" style={{ marginLeft: "10px", fontSize: "0.9rem" }}></i>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card" style={{ borderTop: "4px solid #3a86ff" }}>
            <i className="fas fa-user-check stat-icon" style={{ color: "#3a86ff" }}></i>
            <h3>Comptes validés</h3>
            <div className="stat-value">{stats.verified_doctors}</div>
            <div className="stat-change change-up">
              <i className="fas fa-arrow-up"></i> 8% ce mois
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #ffc107" }}>
            <i className="fas fa-user-clock stat-icon" style={{ color: "#ffc107" }}></i>
            <h3>En attente</h3>
            <div className="stat-value">{stats.pending_doctors}</div>
            <div className="stat-change change-down">
              <i className="fas fa-arrow-down"></i> 3% cette semaine
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #dc3545" }}>
            <i className="fas fa-user-slash stat-icon" style={{ color: "#dc3545" }}></i>
            <h3>Comptes rejetés</h3>
            <div className="stat-value">{stats.rejected_doctors || 0}</div>
            <div className="stat-change change-up">
              <i className="fas fa-arrow-up"></i> 2% ce mois
            </div>
          </div>

          <div className="stat-card" style={{ borderTop: "4px solid #28a745" }}>
            <i className="fas fa-users stat-icon" style={{ color: "#28a745" }}></i>
            <h3>Total patients</h3>
            <div className="stat-value">{stats.total_patients}</div>
            <div className="stat-change change-up">
              <i className="fas fa-arrow-up"></i> 15% ce mois
            </div>
          </div>
        </div>

        {/* Demandes en attente */}
        <div className="data-card">
          <h3>Demandes en attente de validation</h3>

          {pendingRequests.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Spécialité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.user.username}</td>
                    <td>{doctor.user.email}</td>
                    <td>Médecin</td>
                    <td>{doctor.specialty || "Non spécifié"}</td>
                    <td>
                      <span className="status-badge status-pending">En attente</span>
                    </td>
                    <td>
                      <button className="action-btn" title="Valider" onClick={() => handleValidateDoctor(doctor.id)}>
                        <i className="fas fa-check-circle"></i>
                      </button>
                      <button
                        className="action-btn"
                        title="Rejeter"
                        style={{ color: "var(--danger)" }}
                        onClick={() => handleRejectDoctor(doctor.id)}
                      >
                        <i className="fas fa-times-circle"></i>
                      </button>
                      <button className="action-btn" title="Voir détails">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fas fa-check-circle"></i>
              <p>Aucune demande en attente de validation</p>
            </div>
          )}
        </div>

        {/* Dernières activités */}
        <div className="data-card">
          <h3>Journal des activités</h3>

          {recentActivities.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date/Heure</th>
                  <th>Action</th>
                  <th>Utilisateur</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={activity.id}>
                    <td>{new Date(activity.timestamp).toLocaleString()}</td>
                    <td>{activity.action}</td>
                    <td>{activity.user.username}</td>
                    <td>{activity.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <i className="fas fa-history"></i>
              <p>Aucune activité récente</p>
            </div>
          )}
        </div>

        {/* Afficher les erreurs s'il y en a */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

export default AdminDashboard
