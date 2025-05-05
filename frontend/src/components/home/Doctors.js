"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ProfileInitials from "../common/ProfileInitials"
import "./Doctors.css"

const Doctors = () => {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        console.log("Fetching doctors from API...")
        // Fetch doctors directly from the API
        const response = await fetch("http://localhost:8000/api/doctors/", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.error(`API responded with status: ${response.status} ${response.statusText}`)
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || `Erreur API: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Doctors data received:", data)
        setDoctors(data)
      } catch (err) {
        console.error("Error fetching doctors:", err)
        setError(
          `Erreur de connexion au serveur: ${err.message}. Vérifiez que le serveur Django est en cours d'exécution sur le port 8000.`,
        )

        if (err.message.includes("404")) {
          console.log("Utilisation des données fictives de secours...")
          // Données fictives en cas d'échec de l'API
          const mockDoctors = [
            {
              id: 1,
              user: {
                username: "Ahmed Benali",
                email: "ahmed.benali@example.com",
              },
              specialty: "dentiste",
              license_number: "DEN12345",
              description: "Dentiste avec 10 ans d'expérience, spécialisé en orthodontie.",
              address: "Casablanca",
              profile_picture: null,
              offers_online_consultation: true,
              offers_physical_consultation: true,
            },
            {
              id: 2,
              user: {
                username: "Fatima Zahra",
                email: "fatima.zahra@example.com",
              },
              specialty: "dermatologue",
              license_number: "DER54321",
              description: "Dermatologue spécialisée dans le traitement de l'acné et des maladies de la peau.",
              address: "Rabat",
              profile_picture: null,
              offers_online_consultation: true,
              offers_physical_consultation: true,
            },
            {
              id: 3,
              user: {
                username: "Karim El Mansouri",
                email: "karim.elmansouri@example.com",
              },
              specialty: "pédiatre",
              license_number: "PED98765",
              description: "Pédiatre avec une expertise particulière dans le développement de l'enfant.",
              address: "Marrakech",
              profile_picture: null,
              offers_online_consultation: false,
              offers_physical_consultation: true,
            },
          ]
          setDoctors(mockDoctors)
          setLoading(false)
          return
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const renderStars = (rating = 4.5) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt"></i>)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>)
    }

    return stars
  }

  const handleBookAppointment = (doctorId) => {
    const token = localStorage.getItem("token")
    const userType = localStorage.getItem("user_type")

    if (!token) {
      navigate("/login")
      return
    }

    if (userType !== "patient") {
      alert("Seuls les patients peuvent prendre rendez-vous.")
      return
    }

    navigate(`/book-appointment/${doctorId}`)
  }

  if (loading) {
    return (
      <section className="doctors">
        <div className="container">
          <div className="section-title">
            <h2>Nos Médecins</h2>
            <p>Découvrez nos médecins spécialistes</p>
          </div>
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="doctors">
        <div className="container">
          <div className="section-title">
            <h2>Nos Médecins</h2>
            <p>Découvrez nos médecins spécialistes</p>
          </div>
          <div className="error-container">
            <div className="error-message">{error}</div>
            <div className="connection-tips">
              <h4>Conseils de dépannage:</h4>
              <ul>
                <li>Vérifiez que le serveur Django est démarré sur le port 8000</li>
                <li>Assurez-vous que MySQL/XAMPP est en cours d'exécution</li>
                <li>
                  Vérifiez les migrations Django avec <code>python manage.py migrate</code>
                </li>
                <li>Créez un médecin dans l'interface d'administration Django</li>
              </ul>
              <button className="btn btn-primary retry-btn" onClick={() => window.location.reload()}>
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="doctors">
      <div className="container">
        <div className="section-title">
          <h2>Nos Médecins</h2>
          <p>Découvrez nos médecins spécialistes</p>
        </div>

        {doctors.length === 0 ? (
          <div className="no-doctors-message">
            Aucun médecin n'est disponible pour le moment. Veuillez revenir plus tard.
          </div>
        ) : (
          <div className="doctors-grid">
            {doctors.map((doctor) => (
              <div className="doctor-card" key={doctor.id}>
                {doctor.profile_picture ? (
                  <div
                    className="doctor-img"
                    style={{ backgroundImage: `url(http://localhost:8000${doctor.profile_picture})` }}
                  ></div>
                ) : (
                  <div className="doctor-initials">
                    <ProfileInitials name={doctor.user.username} size={80} />
                  </div>
                )}
                <div className="doctor-info">
                  <h3>Dr. {doctor.user.username}</h3>
                  <span className="doctor-specialty">
                    {doctor.specialty.charAt(0).toUpperCase() + doctor.specialty.slice(1)}
                  </span>
                  <div className="doctor-rating">
                    {renderStars()}
                    <span>(24)</span>
                  </div>
                  <div className="doctor-location">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{doctor.address || "Non spécifié"}</span>
                  </div>
                  <div className="doctor-consultation-types">
                    {doctor.offers_physical_consultation && (
                      <span className="consultation-type physical">
                        <i className="fas fa-hospital"></i> Consultation physique
                      </span>
                    )}
                    {doctor.offers_online_consultation && (
                      <span className="consultation-type online">
                        <i className="fas fa-video"></i> Consultation en ligne
                      </span>
                    )}
                  </div>
                  <button className="btn btn-primary" onClick={() => handleBookAppointment(doctor.id)}>
                    Prendre RDV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Doctors
