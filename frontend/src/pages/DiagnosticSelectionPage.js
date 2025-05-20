
import React from 'react';
import { Link } from 'react-router-dom';
import './DiagnosticSelectionPgae.css'; // Create this file for diagnostic-specific styles

const DiagnosticSelectionPage = () => {
  return (
    <div className="diagnostic-selection-page">
      <h1>Diagnostic en ligne</h1>
      <p className="page-description">
        Sélectionnez le type de diagnostic que vous souhaitez effectuer.
      </p>
      
      <div className="diagnostic-options">
        <Link to="/diagnostic/brain" className="diagnostic-option">
          <div className="diagnostic-icon">
            <i className="fas fa-brain"></i>
          </div>
          <h3>Diagnostic du cerveau</h3>
          <p>Détection de tumeurs cérébrales à partir d'images IRM</p>
        </Link>
        
        {/* Additional diagnostic options can be added here in the future */}
      </div>
      
      <div className="disclaimer">
        <p>
          <strong>Avertissement:</strong> Ce service est fourni à titre informatif 
          uniquement et ne remplace pas l'avis d'un professionnel de la santé. 
          Consultez toujours un médecin pour un diagnostic médical officiel.
        </p>
      </div>
    </div>
  );
};

export default DiagnosticSelectionPage;
