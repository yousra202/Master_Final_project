// frontend/src/components/diagnostics/BrainScanUpload.js
import React, { useState } from 'react';
import { uploadBrainScan } from '../../services/brainDiagnosticService';

const BrainScanUpload = () => {
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
      
      const response = await uploadBrainScan(formData);
      setResult(response);
    } catch (err) {
      setError('Une erreur est survenue lors du diagnostic. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brain-scan-upload">
      <h2>Diagnostic de tumeur cérébrale</h2>
      <p>Téléchargez une image IRM du cerveau pour obtenir un diagnostic</p>
      
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
      
      {result && (
        <div className="result-container">
          <h3>Résultat du diagnostic</h3>
          <div className={`result ${result.result.includes('No') ? 'no-tumor' : 'tumor-detected'}`}>
            <p className="result-text">{result.result}</p>
            <p className="confidence">Confiance: {result.confidence.toFixed(2)}%</p>
          </div>
          <div className="result-image">
            <img src={result.image_url} alt="Analyzed brain scan" />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainScanUpload;