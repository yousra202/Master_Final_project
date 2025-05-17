"use client"

import { useState } from "react"
import "./SearchForm.css"

const SearchForm = () => {
  const [activeTab, setActiveTab] = useState("doctors")

  return (
    <section className="search-form">
      <div className="container">
        <div className="search-tabs">
         
          
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
