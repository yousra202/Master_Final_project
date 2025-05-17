"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import "./PatientProfileSettings.css"

const PatientProfileSettings = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Patient data state
  const [patientData, setPatientData] = useState({
    user: {
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      birth_date: "",
      phone: "",
      gender: "",
    },
    profile_picture: "",
    address: "",
    blood_group: "",
    medical_history: "",
    allergies: [],
    medications: [],
  })

  const fetchPatientData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      const response = await axios.get("http://localhost:8000/api/patient/profile/", {
        headers,
      })

      setPatientData(response.data)

      // Set profile image preview if exists
      if (response.data.profile_picture) {
        setProfileImagePreview(`http://localhost:8000${response.data.profile_picture}`)
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching patient data:", err)
      setError("Error loading data. Please try again later.")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatientData()
  }, [navigate])

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("user.")) {
      const userField = name.split(".")[1]
      setPatientData({
        ...patientData,
        user: {
          ...patientData.user,
          [userField]: value,
        },
      })
    } else {
      setPatientData({
        ...patientData,
        [name]: value,
      })
    }
  }

  // Handle profile image change
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
  
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  
    const formData = new FormData();
  
    // Append user data with 'user.' prefix
    formData.append("user.username", patientData.user.username);
    formData.append("user.email", patientData.user.email);
    formData.append("user.phone", patientData.user.phone);
    formData.append("user.birth_date", patientData.user.birth_date);
    formData.append("user.gender", patientData.user.gender);
  
    // Append patient data (direct fields)
    formData.append("address", patientData.address);
    formData.append("medical_history", patientData.medical_history || "");
  
    // Append profile image if changed
    if (profileImage) {
      formData.append("profile_picture", profileImage);
    }
  
    // Debug: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    try {
      const response = await axios.put(
        "http://localhost:8000/api/patient/profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setSuccess("Profile updated successfully!");
      // Refresh data
      fetchPatientData();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.detail || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle delete profile image
  const handleDeleteImage = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      }

      await axios.delete("http://localhost:8000/api/patient/profile/image/", {
        headers,
      })

      setProfileImage(null)
      setProfileImagePreview("")
      setPatientData({
        ...patientData,
        profile_picture: "",
      })

      setSuccess("Profile picture deleted successfully!")
    } catch (err) {
      console.error("Error deleting profile image:", err)
      setError("Error deleting profile picture. Please try again.")
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading data...</p>
      </div>
    )
  }

  return (
    <div className="profile-settings-container">
      {/* Header */}
      

      {/* Page Content */}
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="page-header">
            <h1>
              <i className="fas fa-cog"></i> Profile Settings
            </h1>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save Changes
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i> {success}
            </div>
          )}

          {/* Settings Tabs */}
          <div className="settings-tabs">
            <div
              className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </div>
            <div
              className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              Security
            </div>
            <div
              className={`settings-tab ${activeTab === "health" ? "active" : ""}`}
              onClick={() => setActiveTab("health")}
            >
              Health
            </div>
          </div>

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="settings-content">
              <div className="settings-section">
                <h3>
                  <i className="fas fa-id-card"></i> Profile Picture
                </h3>
                <div className="profile-photo-container">
                  <img
                    src={profileImagePreview || "/assets/default-profile.png"}
                    alt="Profile"
                    className="profile-photo-preview"
                  />
                  <div className="profile-photo-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => document.getElementById("photoUpload")?.click()}
                    >
                      <i className="fas fa-camera"></i> Change Photo
                    </button>
                    <input
                      type="file"
                      id="photoUpload"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                    {profileImagePreview && (
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={handleDeleteImage}
                      >
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    )}
                    <p className="text-muted">
                      Max size: 5MB. Formats: JPG, PNG.
                    </p>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <h3>
                  <i className="fas fa-user-edit"></i> Personal Information
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="user.username"
                      value={patientData.user.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      name="user.birth_date"
                      value={patientData.user.birth_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="user.email"
                      value={patientData.user.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="user.phone"
                      value={patientData.user.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      className="form-control"
                      name="user.gender"
                      value={patientData.user.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={patientData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Health Settings */}
          {activeTab === "health" && (
            <div className="settings-content">
              <div className="settings-section">
                <h3>
                  <i className="fas fa-allergies"></i> Health Information
                </h3>
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    className="form-control"
                    name="blood_group"
                    value={patientData.blood_group}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Medical History</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    name="medical_history"
                    value={patientData.medical_history}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              <div className="settings-section">
                <h3>
                  <i className="fas fa-prescription-bottle-alt"></i> Allergies
                </h3>
                {patientData.allergies.length > 0 ? (
                  <div className="allergies-list">
                    {patientData.allergies.map((allergy, index) => (
                      <div key={index} className="allergy-item">
                        <div className="allergy-info">
                          <strong>{allergy.name}</strong>
                          <span>{allergy.severity}</span>
                        </div>
                        <button type="button" className="btn btn-danger btn-sm">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No allergies recorded.</p>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Allergy Name</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Severity</label>
                    <select className="form-control">
                      <option value="">Select severity</option>
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
                <button type="button" className="btn btn-outline">
                  <i className="fas fa-plus"></i> Add Allergy
                </button>
              </div>

              <div className="settings-section">
                <h3>
                  <i className="fas fa-pills"></i> Medications
                </h3>
                {patientData.medications.length > 0 ? (
                  <div className="medications-list">
                    {patientData.medications.map((medication, index) => (
                      <div key={index} className="medication-item">
                        <div className="medication-info">
                          <strong>{medication.name}</strong>
                          <span>{medication.dosage}</span>
                        </div>
                        <button type="button" className="btn btn-danger btn-sm">
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No current medications.</p>
                )}
                <div className="form-grid">
                  <div className="form-group">
                    <label>Medication Name</label>
                    <input type="text" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Dosage</label>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <button type="button" className="btn btn-outline">
                  <i className="fas fa-plus"></i> Add Medication
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="settings-content">
              <div className="settings-section">
                <h3>
                  <i className="fas fa-lock"></i> Change Password
                </h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" className="form-control" />
                  </div>
                </div>
                <button type="button" className="btn btn-primary">
                  <i className="fas fa-key"></i> Update Password
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default PatientProfileSettings