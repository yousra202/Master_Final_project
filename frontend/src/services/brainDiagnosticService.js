// frontend/src/services/brainDiagnosticService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/brain-scans/';

export const uploadBrainScan = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}diagnose/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getBrainScanHistory = async (patientId) => {
  try {
    const response = await axios.get(API_URL, {
      params: { patient: patientId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};