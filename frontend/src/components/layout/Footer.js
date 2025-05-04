import { Link } from "react-router-dom"
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>PlateformeSanté</h3>
            <p>La première plateforme marocaine de prise de rendez-vous médicaux en ligne.</p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h3>Liens rapides</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Accueil</Link>
              </li>
              <li>
                <Link to="/doctors">Médecins</Link>
              </li>
              <li>
                <Link to="/clinics">Cliniques</Link>
              </li>
              <li>
                <Link to="/pharmacies">Pharmacies</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Spécialités</h3>
            <ul className="footer-links">
              <li>
                <Link to="/specialties/dentists">Dentistes</Link>
              </li>
              <li>
                <Link to="/specialties/dermatologists">Dermatologues</Link>
              </li>
              <li>
                <Link to="/specialties/gynecologists">Gynécologues</Link>
              </li>
              <li>
                <Link to="/specialties/pediatricians">Pédiatres</Link>
              </li>
              <li>
                <Link to="/specialties/general-practitioners">Généralistes</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact</h3>
            <ul className="footer-links">
              <li>
                <i className="fas fa-map-marker-alt"></i> Casablanca, Maroc
              </li>
              <li>
                <i className="fas fa-phone"></i> +212 6 00 00 00 00
              </li>
              <li>
                <i className="fas fa-envelope"></i> contact@plateformesante.ma
              </li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Plateforme Santé. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
