"use client"

import { useState } from "react"
import "./SearchForm.css"

const SearchForm = () => {
  const [activeTab, setActiveTab] = useState("doctors")

  return (
    <div className="container">
      <div className="search-form">
        <div className="search-tabs">
          <div
            className={`search-tab ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            Médecins
          </div>
          <div
            className={`search-tab ${activeTab === "clinics" ? "active" : ""}`}
            onClick={() => setActiveTab("clinics")}
          >
            Cliniques
          </div>
          <div
            className={`search-tab ${activeTab === "pharmacies" ? "active" : ""}`}
            onClick={() => setActiveTab("pharmacies")}
          >
            Pharmacies
          </div>
          <div className={`search-tab ${activeTab === "labs" ? "active" : ""}`} onClick={() => setActiveTab("labs")}>
            Laboratoires
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="specialty">Spécialité</label>
            <select id="specialty" className="form-control">
              <option value="">Choisir une spécialité</option>
              <option value="1">Dentiste</option>
              <option value="2">Dermatologue</option>
              <option value="3">Gynécologue</option>
              <option value="4">Pédiatre</option>
              <option value="5">Généraliste</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Localisation</label>
            <select id="location" className="form-control">
              <option value="">Tout le Maroc</option>
              <option value="1">Casablanca</option>
              <option value="2">Rabat</option>
              <option value="3">Marrakech</option>
              <option value="4">Tanger</option>
              <option value="5">Fès</option>
            </select>
          </div>
        </div>

        <button className="btn btn-primary btn-block">Rechercher</button>
      </div>
    </div>
  )
}

export default SearchForm
