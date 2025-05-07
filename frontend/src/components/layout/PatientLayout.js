import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import "./PatientLayout.css"

const PatientLayout = () => {
  return (
    <div className="patient-layout">
      <Header />
      <div className="patient-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

export default PatientLayout
