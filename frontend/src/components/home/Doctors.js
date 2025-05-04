import "./Doctors.css"

const Doctors = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Ahmed Benali",
      specialty: "Dentiste",
      rating: 4.5,
      reviews: 24,
      location: "Casablanca",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 2,
      name: "Dr. Fatima Zahra",
      specialty: "Dermatologue",
      rating: 4.0,
      reviews: 18,
      location: "Rabat",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 3,
      name: "Dr. Karim El Mansouri",
      specialty: "Pédiatre",
      rating: 5.0,
      reviews: 32,
      location: "Marrakech",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
    {
      id: 4,
      name: "Dr. Leila Amrani",
      specialty: "Gynécologue",
      rating: 4.5,
      reviews: 27,
      location: "Tanger",
      image:
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    },
  ]

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star"></i>)
    }

    if (hasHalfStar) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt"></i>)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>)
    }

    return stars
  }

  return (
    <section className="doctors">
      <div className="container">
        <div className="section-title">
          <h2>Nos Médecins</h2>
          <p>Découvrez nos médecins spécialistes</p>
        </div>

        <div className="doctors-grid">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor.id}>
              <div className="doctor-img" style={{ backgroundImage: `url(${doctor.image})` }}></div>
              <div className="doctor-info">
                <h3>{doctor.name}</h3>
                <span className="doctor-specialty">{doctor.specialty}</span>
                <div className="doctor-rating">
                  {renderStars(doctor.rating)}
                  <span>({doctor.reviews})</span>
                </div>
                <div className="doctor-location">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{doctor.location}</span>
                </div>
                <button className="btn btn-primary">Prendre RDV</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Doctors
