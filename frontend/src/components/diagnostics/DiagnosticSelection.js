// frontend/src/components/diagnostics/DiagnosticSelection.js
import React from 'react';
import { Link } from 'react-router-dom';

const DiagnosticSelection = () => {
  return (
    <div className="diagnostic-selection">
      <h2>Choisissez un type de diagnostic</h2>
      <div className="diagnostic-options">
        <Link to="/diagnostic/brain" className="diagnostic-option">
          <div className="diagnostic-icon">
            <i className="fas fa-brain"></i>
          </div>
          <h3>Diagnostic du cerveau</h3>
          <p>Détection de tumeurs cérébrales à partir d'images IRM</p>
        </Link>
        {/* Other diagnostic options can be added here in the future */}
      </div>
    </div>
  );
};

export default DiagnosticSelection;