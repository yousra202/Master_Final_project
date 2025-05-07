"use client"
import "./SidebarToggle.css"

const SidebarToggle = ({ isOpen, toggleSidebar }) => {
  return (
    <button className="sidebar-toggle" onClick={toggleSidebar}>
      <span className={`toggle-icon ${isOpen ? "open" : ""}`}>
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
  )
}

export default SidebarToggle
