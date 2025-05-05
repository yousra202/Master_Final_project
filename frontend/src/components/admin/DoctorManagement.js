"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./DoctorManagement.css"

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:8000/api/doctors/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setDoctors(response.data)
        setFilteredDoctors(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError("Impossible de charger la liste des médecins.")
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  useEffect(() => {
    // Filtrer les médecins en fonction du terme de recherche et du statut
    let filtered = doctors

    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doctor.specialty && doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((doctor) => (filterStatus === "verified" ? doctor.is_verified : !doctor.is_verified))
    }

    setFilteredDoctors(filtered)
  }, [searchTerm, filterStatus, doctors])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
  }

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
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

      // Mettre à jour l'état local
      setDoctors(doctors.map((doctor) => (doctor.id === doctorId ? { ...doctor, is_verified: true } : doctor)))

      // Si le modal est ouvert pour ce médecin, mettre à jour également
      if (selectedDoctor && selectedDoctor.id === doctorId) {
        setSelectedDoctor({ ...selectedDoctor, is_verified: true })
      }
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

      // Supprimer le médecin de la liste
      setDoctors(doctors.filter((doctor) => doctor.id !== doctorId))

      // Fermer le modal si c'est ce médecin qui est affiché
      if (selectedDoctor && selectedDoctor.id === doctorId) {
        setIsModalOpen(false)
      }
    } catch (err) {
      console.error("Error rejecting doctor:", err)
      alert("Erreur lors du rejet du médecin.")
    }
  }

  if (loading) {
    return (
      <div className="doctor-management-loading">
        <div className="spinner"></div>
        <p>Chargement des médecins...</p>
      </div>
    )
  }

  return (
    <div className="doctor-management">
      <h1 className="page-title">Gestion des médecins</h1>

      {error && <div className="error-alert">{error}</div>}

      {/* Filtres et recherche */}
      <div className="filters-bar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Rechercher un médecin..." value={searchTerm} onChange={handleSearch} />
        </div>

        <div className="filter-options">
          <select value={filterStatus} onChange={handleFilterChange}>
            <option value="all">Tous les médecins</option>
            <option value="verified">Médecins vérifiés</option>
            <option value="pending">Médecins en attente</option>
          </select>
        </div>
      </div>

      {/* Liste des médecins */}
      {filteredDoctors.length > 0 ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Spécialité</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.user.username}</td>
                  <td>{doctor.user.email}</td>
                  <td>{doctor.specialty || "Non spécifié"}</td>
                  <td>
                    {doctor.is_verified ? (
                      <span className="status-badge status-verified">Vérifié</span>
                    ) : (
                      <span className="status-badge status-pending">En attente</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    {!doctor.is_verified && (
                      <>
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
                      </>
                    )}
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDoctor(doctor)}
                      title="Voir détails"
                    >
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
          <i className="fas fa-user-md"></i>
          <p>Aucun médecin trouvé</p>
        </div>
      )}

      {/* Modal de détails du médecin */}
      {isModalOpen && selectedDoctor && (
        <div className="modal-overlay">
          <div className="doctor-modal">
            <div className="modal-header">
              <h2>Détails du médecin</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="doctor-profile">
                <div className="doctor-avatar">{selectedDoctor.user.username.charAt(0).toUpperCase()}</div>

                <div className="doctor-info">
                  <h3>{selectedDoctor.user.username}</h3>
                  <p className="doctor-specialty">{selectedDoctor.specialty || "Spécialité non spécifiée"}</p>
                  <p className="doctor-status">
                    {selectedDoctor.is_verified ? (
                      <span className="status-badge status-verified">Vérifié</span>
                    ) : (
                      <span className="status-badge status-pending">En attente</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="info-section">
                <h4>Informations personnelles</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedDoctor.user.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Téléphone</span>
                    <span className="info-value">{selectedDoctor.user.phone || "Non spécifié"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date de naissance</span>
                    <span className="info-value">{selectedDoctor.user.birth_date || "Non spécifiée"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Genre</span>
                    <span className="info-value">{selectedDoctor.user.gender || "Non spécifié"}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Informations professionnelles</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Numéro de licence</span>
                    <span className="info-value">{selectedDoctor.license_number || "Non spécifié"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Adresse</span>
                    <span className="info-value">{selectedDoctor.address || "Non spécifiée"}</span>
                  </div>
                </div>

                <div className="info-item full-width">
                  <span className="info-label">Description</span>
                  <p className="info-value description">
                    {selectedDoctor.description || "Aucune description fournie."}
                  </p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {!selectedDoctor.is_verified && (
                <>
                  <button className="btn validate-doctor-btn" onClick={() => handleValidateDoctor(selectedDoctor.id)}>
                    <i className="fas fa-check"></i> Valider ce médecin
                  </button>
                  <button className="btn reject-doctor-btn" onClick={() => handleRejectDoctor(selectedDoctor.id)}>
                    <i className="fas fa-times"></i> Rejeter ce médecin
                  </button>
                </>
              )}
              <button className="btn close-btn" onClick={handleCloseModal}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorManagement
