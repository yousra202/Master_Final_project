import { getCurrentUser } from "../../services/authService"
import "./DashboardLayout.css"
import Sidebar from "../common/SideBar"

const DashboardLayout = ({ children, activePage }) => {
  const currentUser = getCurrentUser()
  const userType = currentUser ? currentUser.userType : ""

  // Only show sidebar for doctors
  const showSidebar = userType === "doctor"

  return (
    <div className="dashboard-layout">
      {showSidebar && <Sidebar activePage={activePage} />}
      <div className={`dashboard-content ${showSidebar ? "with-sidebar" : ""}`}>{children}</div>
    </div>
  )
}

export default DashboardLayout
