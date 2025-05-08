import { Outlet } from "react-router-dom"
import PatientHeader from "./PatientHeader"
import Footer from "./Footer"

const PatientLayout = () => {
  return (
    <div className="main-layout">
      <PatientHeader />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PatientLayout
