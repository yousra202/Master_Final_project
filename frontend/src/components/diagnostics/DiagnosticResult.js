// frontend/src/components/diagnostics/DiagnosticResult.js
import React from 'react';

const DiagnosticResult = ({ result }) => {
  if (!result) return null;
  
  const { result: diagnosis, confidence, image_url } = result;
  const isTumor = !diagnosis.includes('No');
  
  return (
    <div className="diagnostic-result">
      <h3>Résultat du diagnostic</h3>
      <div className={`result-card ${isTumor ? 'tumor' : 'no-tumor'}`}>
        <div className="result-icon">
          <i className={`fas ${isTumor ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
        </div>
        <div className="result-details">
          <h4>{diagnosis}</h4>
          <p>Confiance: {confidence.toFixed(2)}%</p>
          {isTumor && (
            <p className="recommendation">
              Nous vous recommandons de consulter un médecin dès que possible.
            </p>
          )}
        </div>
      </div>
      <div className="analyzed-image">
        <h4>Image analysée</h4>
        <img src={image_url} alt="Analyzed brain scan" />
      </div>
    </div>
  );
};

export default DiagnosticResult;