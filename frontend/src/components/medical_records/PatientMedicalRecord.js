"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./PatientMedicalRecord.css"

const PatientMedicalRecord = () => {
  const [activeTab, setActiveTab] = useState("summary")
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("/api/medical-records/records/my_record/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setMedicalRecord(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching medical record:", err)
        setError("Impossible de charger votre dossier médical. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchMedicalRecord()
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  if (loading) {
    return (
      <div className="medical-record-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Chargement de votre dossier médical...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="medical-record-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button className="btn btn-primary">Réessayer</button>
        </div>
      </div>
    )
  }

  // If no medical record exists yet
  if (!medicalRecord) {
    return (
      <div className="medical-record-container">
        <div className="no-record-message">
          <i className="fas fa-folder-open"></i>
          <h3>Aucun dossier médical trouvé</h3>
          <p>Vous n'avez pas encore de dossier médical dans notre système.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="medical-record-container">
      <div className="record-header">
        <div className="record-title">
          <h2>Mon Dossier Médical</h2>
          {medicalRecord.allergies && medicalRecord.allergies.length > 0 && (
            <div className="alert-badges">
              {medicalRecord.allergies.map((allergy) => (
                <div key={allergy.id} className="alert-badge badge-danger">
                  <i className="fas fa-exclamation-triangle"></i> Allergie: {allergy.allergen}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="record-actions">
          <button className="btn btn-outline">
            <i className="fas fa-print"></i> Imprimer
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-download"></i> Télécharger
          </button>
        </div>
      </div>

      <div className="patient-profile">
        <div className="profile-avatar">
          {medicalRecord.patient?.user?.profile_picture ? (
            <img src={medicalRecord.patient.user.profile_picture || "/placeholder.svg"} alt="Patient" />
          ) : (
            <div className="profile-initials">{medicalRecord.patient?.user?.username?.charAt(0) || "P"}</div>
          )}
        </div>
        <div className="profile-info">
          <h3>{medicalRecord.patient?.user?.username || "Patient"}</h3>
          <div className="profile-meta">
            <span>
              <i className="fas fa-id-card"></i> ID: {medicalRecord.id}
            </span>
            <span>
              <i className="fas fa-birthday-cake"></i> {medicalRecord.patient?.birth_date || "Non renseigné"}
            </span>
            <span>
              <i className="fas fa-phone"></i> {medicalRecord.patient?.user?.phone || "Non renseigné"}
            </span>
            <span>
              <i className="fas fa-tint"></i> Groupe sanguin: {medicalRecord.blood_type || "Non renseigné"}
            </span>
          </div>
          <div className="profile-meta">
            <span>
              <i className="fas fa-map-marker-alt"></i> {medicalRecord.patient?.address || "Adresse non renseignée"}
            </span>
            <span>
              <i className="fas fa-envelope"></i> {medicalRecord.patient?.user?.email || "Email non renseigné"}
            </span>
          </div>
        </div>
      </div>

      <div className="record-tabs">
        <div
          className={`record-tab ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => handleTabChange("summary")}
        >
          Résumé
        </div>
        <div
          className={`record-tab ${activeTab === "consultations" ? "active" : ""}`}
          onClick={() => handleTabChange("consultations")}
        >
          Consultations
        </div>
        <div
          className={`record-tab ${activeTab === "prescriptions" ? "active" : ""}`}
          onClick={() => handleTabChange("prescriptions")}
        >
          Ordonnances
        </div>
        <div className={`record-tab ${activeTab === "exams" ? "active" : ""}`} onClick={() => handleTabChange("exams")}>
          Examens
        </div>
        <div className={`record-tab ${activeTab === "ia" ? "active" : ""}`} onClick={() => handleTabChange("ia")}>
          Analyse IA
        </div>
      </div>

      {/* Summary Tab Content */}
      <div className={`tab-content ${activeTab === "summary" ? "active" : ""}`}>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>Antécédents Médicaux</h4>
            {medicalRecord.medical_histories && medicalRecord.medical_histories.length > 0 ? (
              <ul className="summary-list">
                {medicalRecord.medical_histories.map((history) => (
                  <li key={history.id}>
                    {history.condition}
                    <span>{new Date(history.diagnosis_date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">Aucun antécédent médical enregistré</p>
            )}
          </div>

          <div className="summary-card">
            <h4>Traitements en Cours</h4>
            {medicalRecord.medications && medicalRecord.medications.filter((med) => med.is_active).length > 0 ? (
              <ul className="summary-list">
                {medicalRecord.medications
                  .filter((med) => med.is_active)
                  .map((medication) => (
                    <li key={medication.id}>
                      {medication.name} {medication.dosage}
                      <span>{medication.frequency}</span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="no-data">Aucun traitement en cours</p>
            )}
          </div>

          <div className="summary-card">
            <h4>Derniers Résultats</h4>
            {medicalRecord.lab_results && medicalRecord.lab_results.length > 0 ? (
              <ul className="summary-list">
                {medicalRecord.lab_results
                  .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
                  .slice(0, 5)
                  .map((result) => (
                    <li key={result.id}>
                      {result.test_name}
                      <span>
                        {result.result_value} {result.unit}
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="no-data">Aucun résultat d'examen enregistré</p>
            )}
          </div>
        </div>

        {medicalRecord.vital_signs && medicalRecord.vital_signs.length > 0 && (
          <div className="summary-card">
            <h4>
              Dernières Constantes Vitales ({new Date(medicalRecord.vital_signs[0].date_recorded).toLocaleDateString()})
            </h4>
            <div className="vital-signs-grid">
              <div className="vital-sign">
                <i className="fas fa-heartbeat"></i>
                <span className="vital-value">{medicalRecord.vital_signs[0].heart_rate || "--"}</span>
                <span className="vital-label">Pouls (bpm)</span>
              </div>
              <div className="vital-sign">
                <i className="fas fa-stethoscope"></i>
                <span className="vital-value">
                  {medicalRecord.vital_signs[0].blood_pressure_systolic || "--"}/
                  {medicalRecord.vital_signs[0].blood_pressure_diastolic || "--"}
                </span>
                <span className="vital-label">Tension (mmHg)</span>
              </div>
              <div className="vital-sign">
                <i className="fas fa-thermometer-half"></i>
                <span className="vital-value">{medicalRecord.vital_signs[0].temperature || "--"}</span>
                <span className="vital-label">Température (°C)</span>
              </div>
              <div className="vital-sign">
                <i className="fas fa-weight"></i>
                <span className="vital-value">{medicalRecord.vital_signs[0].weight || "--"}</span>
                <span className="vital-label">Poids (kg)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Consultations Tab Content */}
      <div className={`tab-content ${activeTab === "consultations" ? "active" : ""}`}>
        {/* This would be populated from the consultations data */}
        <p className="no-data">Aucune consultation enregistrée</p>
      </div>

      {/* Prescriptions Tab Content */}
      <div className={`tab-content ${activeTab === "prescriptions" ? "active" : ""}`}>
        {/* This would be populated from the prescriptions data */}
        <p className="no-data">Aucune ordonnance enregistrée</p>
      </div>

      {/* Exams Tab Content */}
      <div className={`tab-content ${activeTab === "exams" ? "active" : ""}`}>
        {/* This would be populated from the lab results data */}
        <p className="no-data">Aucun examen enregistré</p>
      </div>

      {/* AI Analysis Tab Content */}
      <div className={`tab-content ${activeTab === "ia" ? "active" : ""}`}>
        {medicalRecord.ai_analyses && medicalRecord.ai_analyses.length > 0 ? (
          medicalRecord.ai_analyses.map((analysis) => (
            <div key={analysis.id} className="consultation-item">
              <div className="consultation-header">
                <span className="consultation-date">
                  Analyse IA - {new Date(analysis.analysis_date).toLocaleDateString()}
                </span>
                <span className="consultation-type type-online">Système IA</span>
              </div>
              <p className="consultation-notes">
                <strong>Synthèse:</strong> {analysis.summary}
              </p>
              {analysis.recommendations && (
                <p className="consultation-notes">
                  <strong>Recommandations:</strong> {analysis.recommendations}
                </p>
              )}
              {analysis.alerts && (
                <p className="consultation-notes">
                  <strong>Alertes:</strong> {analysis.alerts}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="no-data">Aucune analyse IA disponible</p>
        )}
      </div>
    </div>
  )
}

export default PatientMedicalRecord
