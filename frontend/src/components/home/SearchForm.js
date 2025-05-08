"use client"

import { useState } from "react"
import "./SearchForm.css"

const SearchForm = () => {
  const [activeTab, setActiveTab] = useState("doctors")

  return (
    <section className="search-form">
      <div className="container">
        <div className="search-tabs">
          <button
            className={activeTab === "doctors" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("doctors")}
          >
            Médecins
          </button>
          <button
            className={activeTab === "clinics" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("clinics")}
          >
            Cliniques
          </button>
          <button
            className={activeTab === "pharmacies" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("pharmacies")}
          >
            Pharmacies
          </button>
          <button className={activeTab === "labs" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("labs")}>
            Laboratoires
          </button>
        </div>

        <div className="search-inputs">
          <div className="input-group">
            <input
              type="text"
              placeholder={
                activeTab === "doctors"
                  ? "Spécialité ou nom du médecin"
                  : activeTab === "clinics"
                    ? "Nom de la clinique"
                    : activeTab === "pharmacies"
                      ? "Nom de la pharmacie"
                      : "Nom du laboratoire"
              }
            />
          </div>
          <div className="input-group">
            <input type="text" placeholder="Localisation" />
          </div>
          <button className="search-btn">Rechercher</button>
        </div>
      </div>
    </section>
  )
}

export default SearchForm
