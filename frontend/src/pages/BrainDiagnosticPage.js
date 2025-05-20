
import React, { useState } from 'react';
import axios from 'axios';
import './DiagnosticSelectionPgae.css';

const BrainDiagnosticPage = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Veuillez sélectionner une image IRM');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await axios.post('http://localhost:8000/api/brain-scans/diagnose/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
    } catch (err) {
      setError('Une erreur est survenue lors du diagnostic. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brain-diagnostic-page">
      <h1>Diagnostic de tumeur cérébrale</h1>
      <p className="page-description">
        Notre système d'intelligence artificielle peut analyser les images IRM 
        du cerveau pour détecter la présence de tumeurs.
      </p>
      
      <div className="upload-container">
        <form onSubmit={handleSubmit}>
          <div className="upload-area">
            <input
              type="file"
              id="brain-scan"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="brain-scan" className="file-label">
              {preview ? (
                <img src={preview} alt="Preview" className="image-preview" />
              ) : (
                <>
                  <i className="fas fa-upload"></i>
                  <span>Sélectionner une image IRM</span>
                </>
              )}
            </label>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            className="submit-button" 
            disabled={!file || loading}
          >
            {loading ? 'Analyse en cours...' : 'Analyser l\'image'}
          </button>
        </form>
      </div>
      
      {result && (
        <div className="result-container">
          <h2>Résultat du diagnostic</h2>
          <div className={`result ${result.result.includes('No') ? 'no-tumor' : 'tumor-detected'}`}>
            <div className="result-icon">
              <i className={`fas ${result.result.includes('No') ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            </div>
            <div className="result-details">
              <h3>{result.result}</h3>
              <p className="confidence">Confiance: {result.confidence.toFixed(2)}%</p>
              {!result.result.includes('No') && (
                <p className="recommendation">
                  Nous vous recommandons de consulter un médecin dès que possible.
                </p>
              )}
            </div>
          </div>
          
          <div className="analyzed-image">
            <h3>Image analysée</h3>
            <img src={result.image_url || preview} alt="Analyzed brain scan" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainDiagnosticPage;
