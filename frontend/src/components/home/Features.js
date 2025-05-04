import "./Features.css"

const Features = () => {
  return (
    <section className="features">
      <div className="container">
        <div className="section-title">
          <h2>Nos Services</h2>
          <p>Découvrez tous les services que nous vous offrons</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>Rendez-vous en ligne</h3>
            <p>Prenez rendez-vous avec votre médecin en quelques clics, 24h/24 et 7j/7</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-video"></i>
            </div>
            <h3>Consultation vidéo</h3>
            <p>Consultez un médecin en vidéo sans vous déplacer depuis chez vous</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-file-medical"></i>
            </div>
            <h3>Diagnostic en ligne</h3>
            <p>Envoyez vos documents médicaux et obtenez un diagnostic à distance</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
