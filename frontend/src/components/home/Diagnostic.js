import "./Diagnostic.css"

const Diagnostic = () => {
  return (
    <section className="diagnostic-section">
      <div className="container diagnostic-container">
        <h2>Diagnostics d'Images Médicales</h2>
        <p>Téléchargez votre image médicale et recevez un rapport détaillé</p>

        <div className="diagnostic-box">
          <div className="upload-icon">
            <i className="fas fa-plus"></i>
          </div>
          <p>Glissez-déposez votre image ici ou cliquez pour parcourir</p>
          <a href="#" className="upload-btn">
            Télécharger
          </a>
        </div>
      </div>
    </section>
  )
}

export default Diagnostic
