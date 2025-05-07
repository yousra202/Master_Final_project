import Sidebar from "../common/Sidebar"
import { Outlet } from "react-router-dom"
import "./DoctorLayout.css"

const DoctorLayout = ({ activePage }) => {
  return (
    <div className="doctor-layout">
      <Sidebar activePage={activePage} />
      <div className="doctor-content">
        <Outlet />
      </div>
    </div>
  )
}

export default DoctorLayout
