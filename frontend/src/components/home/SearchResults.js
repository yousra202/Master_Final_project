import React, { useState, useEffect, useRef, useCallback } from "react";
import "./SearchForm.css";

const SearchForm = () => {
  const [activeTab, setActiveTab] = useState("doctors");
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState({
    specialties: [],
    doctors: [],
    locations: []
  });
  const [showSpecialtySuggestions, setShowSpecialtySuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const specialtyInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const specialtySuggestionsRef = useRef(null);
  const locationSuggestionsRef = useRef(null);
  
  // Debounce function to prevent excessive API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(
    debounce(async (type, query) => {
      if (query.length < 2) {
        if (type === "specialty") {
          setSuggestions(prev => ({ ...prev, specialties: [], doctors: [] }));
          setShowSpecialtySuggestions(false);
        } else {
          setSuggestions(prev => ({ ...prev, locations: [] }));
          setShowLocationSuggestions(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (type === "specialty") {
          params.append("query", query);
        } else {
          params.append("location", query);
        }

        const response = await fetch(`http://localhost:8000/api/search/suggestions/?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        setSuggestions(data);
        
        if (type === "specialty") {
          setShowSpecialtySuggestions(data.specialties.length > 0 || data.doctors.length > 0);
        } else {
          setShowLocationSuggestions(data.locations.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        // Use mock data for demonstration if API fails
        if (type === "specialty") {
          setSuggestions(prev => ({
            ...prev,
            specialties: [
              { id: 1, name: "Dentiste" },
              { id: 2, name: "Chirurgien-dentiste" }
            ],
            doctors: [
              { id: 1, name: "Dr. Ahmed Benali", specialty: "Dentiste", address: "Casablanca" }
            ]
          }));
          setShowSpecialtySuggestions(true);
        } else {
          setSuggestions(prev => ({
            ...prev,
            locations: [
              { id: 1, name: "Casablanca" },
              { id: 2, name: "Rabat" }
            ]
          }));
          setShowLocationSuggestions(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change for specialty
  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    setSpecialtyQuery(value);
    setSelectedSpecialty(null);
    fetchSuggestions("specialty", value);
  };

  // Handle input change for location
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationQuery(value);
    setSelectedLocation(null);
    fetchSuggestions("location", value);
  };

  // Handle selection of a specialty suggestion
  const handleSelectSpecialty = (item, type) => {
    if (type === "specialty") {
      setSpecialtyQuery(item.name);
      setSelectedSpecialty(item);
    } else if (type === "doctor") {
      setSpecialtyQuery(item.name);
      setSelectedSpecialty({ name: item.name, id: item.id, type: "doctor" });
    }
    setShowSpecialtySuggestions(false);
    setActiveIndex(-1);
  };

  // Handle selection of a location suggestion
  const handleSelectLocation = (item) => {
    setLocationQuery(item.name);
    setSelectedLocation(item);
    setShowLocationSuggestions(false);
    setActiveIndex(-1);
  };

  // Handle search button click
  const handleSearch = () => {
    // Construct search URL based on selected values
    let searchParams = new URLSearchParams();
    
    if (selectedSpecialty) {
      if (selectedSpecialty.type === "doctor") {
        searchParams.append("doctor", selectedSpecialty.id);
      } else {
        searchParams.append("specialty", selectedSpecialty.name);
      }
    } else if (specialtyQuery) {
      searchParams.append("specialty", specialtyQuery);
    }
    
    if (selectedLocation) {
      searchParams.append("location", selectedLocation.name);
    } else if (locationQuery) {
      searchParams.append("location", locationQuery);
    }
    
    // Navigate to search results page
    window.location.href = `/search-results?${searchParams.toString()}`;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e, type) => {
    const suggestions = type === "specialty" 
      ? [...(suggestions.specialties || []), ...(suggestions.doctors || [])]
      : (suggestions.locations || []);
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        if (type === "specialty") {
          const allItems = [...(suggestions.specialties || []), ...(suggestions.doctors || [])];
          const selectedItem = allItems[activeIndex];
          const itemType = activeIndex < (suggestions.specialties || []).length ? "specialty" : "doctor";
          handleSelectSpecialty(selectedItem, itemType);
        } else {
          handleSelectLocation(suggestions.locations[activeIndex]);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      if (type === "specialty") {
        setShowSpecialtySuggestions(false);
      } else {
        setShowLocationSuggestions(false);
      }
      setActiveIndex(-1);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        specialtySuggestionsRef.current && 
        !specialtySuggestionsRef.current.contains(event.target) &&
        !specialtyInputRef.current.contains(event.target)
      ) {
        setShowSpecialtySuggestions(false);
      }
      
      if (
        locationSuggestionsRef.current && 
        !locationSuggestionsRef.current.contains(event.target) &&
        !locationInputRef.current.contains(event.target)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="search-form">
      <div className="container">
        <div className="search-inputs">
          <div className="input-group">
            <div className="input-wrapper">
              <i className="fas fa-search input-icon"></i>
              <input
                ref={specialtyInputRef}
                type="text"
                placeholder="Spécialité ou nom du médecin"
                value={specialtyQuery}
                onChange={handleSpecialtyChange}
                onFocus={() => specialtyQuery.length >= 2 && setShowSpecialtySuggestions(true)}
                onKeyDown={(e) => handleKeyDown(e, "specialty")}
                className={showSpecialtySuggestions ? "active" : ""}
              />
              {specialtyQuery && (
                <button 
                  className="clear-button"
                  onClick={() => {
                    setSpecialtyQuery("");
                    setSelectedSpecialty(null);
                    setShowSpecialtySuggestions(false);
                    specialtyInputRef.current.focus();
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            {showSpecialtySuggestions && (
              <div className="suggestions-dropdown" ref={specialtySuggestionsRef}>
                {isLoading ? (
                  <div className="suggestion-loading">
                    <i className="fas fa-spinner fa-spin"></i> Chargement...
                  </div>
                ) : (
                  <>
                    {suggestions.specialties && suggestions.specialties.length > 0 && (
                      <div className="suggestion-category">
                        <div className="category-title">Spécialités</div>
                        {suggestions.specialties.map((specialty, index) => (
                          <div
                            key={`specialty-${specialty.id}`}
                            className={`suggestion-item ${activeIndex === index ? "active" : ""}`}
                            onClick={() => handleSelectSpecialty(specialty, "specialty")}
                          >
                            <i className="fas fa-user-md"></i>
                            <span className="suggestion-text">{specialty.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {suggestions.doctors && suggestions.doctors.length > 0 && (
                      <div className="suggestion-category">
                        <div className="category-title">Médecins</div>
                        {suggestions.doctors.map((doctor, index) => (
                          <div
                            key={`doctor-${doctor.id}`}
                            className={`suggestion-item ${
                              activeIndex === index + (suggestions.specialties?.length || 0) ? "active" : ""
                            }`}
                            onClick={() => handleSelectSpecialty(doctor, "doctor")}
                          >
                            <i className="fas fa-user-md"></i>
                            <span className="suggestion-text">
                              <strong>{doctor.name}</strong>
                              <span className="suggestion-details">
                                {doctor.specialty} • {doctor.address}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {(!suggestions.specialties || suggestions.specialties.length === 0) && 
                     (!suggestions.doctors || suggestions.doctors.length === 0) && (
                      <div className="no-suggestions">
                        Aucun résultat trouvé
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <div className="input-wrapper">
              <i className="fas fa-map-marker-alt input-icon"></i>
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Localisation"
                value={locationQuery}
                onChange={handleLocationChange}
                onFocus={() => locationQuery.length >= 2 && setShowLocationSuggestions(true)}
                onKeyDown={(e) => handleKeyDown(e, "location")}
                className={showLocationSuggestions ? "active" : ""}
              />
              {locationQuery && (
                <button 
                  className="clear-button"
                  onClick={() => {
                    setLocationQuery("");
                    setSelectedLocation(null);
                    setShowLocationSuggestions(false);
                    locationInputRef.current.focus();
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            {showLocationSuggestions && (
              <div className="suggestions-dropdown" ref={locationSuggestionsRef}>
                {isLoading ? (
                  <div className="suggestion-loading">
                    <i className="fas fa-spinner fa-spin"></i> Chargement...
                  </div>
                ) : (
                  <>
                    {suggestions.locations && suggestions.locations.length > 0 ? (
                      <div className="suggestion-category">
                        <div className="category-title">Localisations</div>
                        {suggestions.locations.map((location, index) => (
                          <div
                            key={`location-${location.id}`}
                            className={`suggestion-item ${activeIndex === index ? "active" : ""}`}
                            onClick={() => handleSelectLocation(location)}
                          >
                            <i className="fas fa-map-marker-alt"></i>
                            <span className="suggestion-text">{location.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-suggestions">
                        Aucune localisation trouvée
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <button className="search-btn" onClick={handleSearch}>
            <i className="fas fa-search"></i> Rechercher
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchForm;
