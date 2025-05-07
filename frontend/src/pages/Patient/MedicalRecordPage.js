"use client"

import { useEffect, useState } from "react"
import MainLayout from "../../components/layout/MainLayout"
import { getCurrentUser } from "../../services/authService"
import axios from "axios"
import "./MedicalRecordPage.css"

const MedicalRecordPage = () => {
  const [medicalRecord, setMedicalRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("summary")
  const currentUser = getCurrentUser()

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:8000/api/medical-records/my-record/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setMedicalRecord(response.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching medical record:", error)
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchMedicalRecord()
    }
  }, [currentUser])

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement de votre dossier médical...</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="medical-record-page">
        <div className="record-header">
          <h1>Mon Dossier Médical</h1>
          <div className="record-actions">
            <button className="btn btn-outline">
              <i className="fas fa-print"></i> Imprimer
            </button>
            <button className="btn btn-primary">
              <i className="fas fa-download"></i> Télécharger
            </button>
          </div>
        </div>

        {medicalRecord ? (
          <>
            <div className="patient-profile">
              <div className="profile-info">
                <h3>{currentUser.username}</h3>
                <div className="profile-meta">
                  <span>
                    <i className="fas fa-id-card"></i> ID: {medicalRecord.id}
                  </span>
                  <span>
                    <i className="fas fa-birthday-cake"></i> {medicalRecord.patient_age} ans
                  </span>
                  <span>
                    <i className="fas fa-tint"></i> Groupe sanguin: {medicalRecord.blood_group || "Non renseigné"}
                  </span>
                </div>
              </div>
            </div>

            <div className="record-tabs">
              <div
                className={`record-tab ${activeTab === "summary" ? "active" : ""}`}
                onClick={() => setActiveTab("summary")}
              >
                Résumé
              </div>
              <div
                className={`record-tab ${activeTab === "consultations" ? "active" : ""}`}
                onClick={() => setActiveTab("consultations")}
              >
                Consultations
              </div>
              <div
                className={`record-tab ${activeTab === "prescriptions" ? "active" : ""}`}
                onClick={() => setActiveTab("prescriptions")}
              >
                Ordonnances
              </div>
              <div
                className={`record-tab ${activeTab === "exams" ? "active" : ""}`}
                onClick={() => setActiveTab("exams")}
              >
                Examens
              </div>
              <div
                className={`record-tab ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Historique
              </div>
            </div>

            <div className="tab-content">
              {activeTab === "summary" && (
                <div className="summary-tab">
                  <div className="summary-grid">
                    <div className="summary-card">
                      <h4>Antécédents Médicaux</h4>
                      {medicalRecord.medical_history && medicalRecord.medical_history.length > 0 ? (
                        <ul className="summary-list">
                          {medicalRecord.medical_history.map((item, index) => (
                            <li key={index}>
                              {item.condition} <span>{item.diagnosis_date}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">Aucun antécédent médical enregistré</p>
                      )}
                    </div>

                    <div className="summary-card">
                      <h4>Allergies</h4>
                      {medicalRecord.allergies && medicalRecord.allergies.length > 0 ? (
                        <ul className="summary-list">
                          {medicalRecord.allergies.map((allergy, index) => (
                            <li key={index}>
                              {allergy.allergen}{" "}
                              <span className={`severity-${allergy.severity}`}>{allergy.severity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">Aucune allergie enregistrée</p>
                      )}
                    </div>

                    <div className="summary-card">
                      <h4>Traitements en Cours</h4>
                      {medicalRecord.medications && medicalRecord.medications.length > 0 ? (
                        <ul className="summary-list">
                          {medicalRecord.medications
                            .filter((med) => med.is_active)
                            .map((medication, index) => (
                              <li key={index}>
                                {medication.name} <span>{medication.dosage}</span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="no-data">Aucun traitement en cours</p>
                      )}
                    </div>
                  </div>

                  <div className="summary-card">
                    <h4>Derniers Résultats</h4>
                    {medicalRecord.lab_results && medicalRecord.lab_results.length > 0 ? (
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Test</th>
                            <th>Date</th>
                            <th>Résultat</th>
                            <th>Référence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medicalRecord.lab_results
                            .sort((a, b) => new Date(b.test_date) - new Date(a.test_date))
                            .slice(0, 5)
                            .map((result, index) => (
                              <tr key={index} className={result.is_abnormal ? "abnormal" : ""}>
                                <td>{result.test_name}</td>
                                <td>{result.test_date}</td>
                                <td>
                                  {result.result_value} {result.unit}
                                </td>
                                <td>{result.reference_range}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-data">Aucun résultat d'analyse disponible</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "consultations" && (
                <div className="consultations-tab">
                  {medicalRecord.consultations && medicalRecord.consultations.length > 0 ? (
                    medicalRecord.consultations.map((consultation, index) => (
                      <div className="consultation-item" key={index}>
                        <div className="consultation-header">
                          <span className="consultation-date">
                            {consultation.date} - {consultation.time}
                          </span>
                          <span className={`consultation-type type-${consultation.type.toLowerCase()}`}>
                            {consultation.type}
                          </span>
                        </div>
                        <p className="consultation-doctor">
                          <strong>Médecin:</strong> Dr. {consultation.doctor_name}
                        </p>
                        <p className="consultation-diagnosis">
                          <strong>Diagnostic:</strong> {consultation.diagnosis}
                        </p>
                        <p className="consultation-notes">
                          <strong>Notes:</strong> {consultation.notes}
                        </p>
                        <div className="consultation-actions">
                          <button className="btn btn-outline btn-sm">
                            <i className="fas fa-file-prescription"></i> Ordonnance
                          </button>
                          <button className="btn btn-outline btn-sm">
                            <i className="fas fa-print"></i> Imprimer
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data-container">
                      <i className="fas fa-calendar-times no-data-icon"></i>
                      <p>Vous n'avez pas encore de consultations enregistrées</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "prescriptions" && (
                <div className="prescriptions-tab">
                  {medicalRecord.prescriptions && medicalRecord.prescriptions.length > 0 ? (
                    <table className="prescription-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Médecin</th>
                          <th>Médicaments</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicalRecord.prescriptions.map((prescription, index) => (
                          <tr key={index}>
                            <td>{prescription.date}</td>
                            <td>Dr. {prescription.doctor_name}</td>
                            <td>
                              <ul className="medication-list">
                                {prescription.medications.map((med, idx) => (
                                  <li key={idx}>
                                    {med.name} - {med.dosage}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td>
                              <span className={`status-badge status-${prescription.status.toLowerCase()}`}>
                                {prescription.status}
                              </span>
                            </td>
                            <td>
                              <button className="btn btn-outline btn-sm">
                                <i className="fas fa-print"></i>
                              </button>
                              <button className="btn btn-outline btn-sm">
                                <i className="fas fa-download"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-data-container">
                      <i className="fas fa-prescription-bottle no-data-icon"></i>
                      <p>Vous n'avez pas encore d'ordonnances enregistrées</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "exams" && (
                <div className="exams-tab">
                  {medicalRecord.medical_images && medicalRecord.medical_images.length > 0 ? (
                    <div className="exams-grid">
                      {medicalRecord.medical_images.map((image, index) => (
                        <div className="exam-card" key={index}>
                          <div className="exam-image">
                            <img src={image.image_file || "/placeholder.svg"} alt={image.image_type} />
                          </div>
                          <div className="exam-info">
                            <h4>{image.image_type}</h4>
                            <p className="exam-date">{image.image_date}</p>
                            <p className="exam-description">{image.description}</p>
                            <button className="btn btn-outline btn-sm">
                              <i className="fas fa-eye"></i> Voir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-data-container">
                      <i className="fas fa-x-ray no-data-icon"></i>
                      <p>Vous n'avez pas encore d'examens médicaux enregistrés</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="history-tab">
                  <div className="timeline">
                    {medicalRecord.timeline && medicalRecord.timeline.length > 0 ? (
                      medicalRecord.timeline.map((event, index) => (
                        <div className={`timeline-item ${event.type}`} key={index}>
                          <div className="timeline-date">{event.date}</div>
                          <div className="timeline-content">
                            <h4>{event.title}</h4>
                            <p>{event.description}</p>
                            {event.details && <div className="timeline-details">{event.details}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data-container">
                        <i className="fas fa-history no-data-icon"></i>
                        <p>Aucun historique médical disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-record">
            <i className="fas fa-folder-open no-data-icon"></i>
            <h3>Aucun dossier médical trouvé</h3>
            <p>
              Vous n'avez pas encore de dossier médical dans notre système. Veuillez consulter un médecin pour créer
              votre dossier.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default MedicalRecordPage
