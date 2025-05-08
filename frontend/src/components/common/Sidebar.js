"use client"

import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { logout, getCurrentUser } from "../../services/authService";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Stethoscope, 
  MessageSquare, 
  Settings, 
  LogOut 
} from "lucide-react";
import ProfileInitials from "./ProfileInitials";
import SidebarToggle from "./SidebarToggle";
import "./SidebarStyle.css";

const Sidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get base user from localStorage
  const currentUser = getCurrentUser();
  const userType = currentUser?.userType || "";

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || userType !== "doctor") {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/doctor/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDoctorData(response.data);
      } catch (err) {
        console.error("Error fetching doctor data:", err);
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !isOpen) setIsOpen(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate, isOpen, userType]);

  const doctorName = doctorData?.user?.username || currentUser?.username || "Doctor";
  const specialty = doctorData?.specialty || "Médecin";
  const profilePicture = doctorData?.profile_picture;

  if (loading) {
    return (
      <div className="sidebar-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const menuItems = [
    { path: "dashboard", icon: <LayoutDashboard size={20} />, label: "Tableau de bord" },
    { path: "appointments", icon: <Calendar size={20} />, label: "Rendez-vous" },
    { path: "patients", icon: <Users size={20} />, label: "Patients" },
    { path: "medical-records", icon: <FileText size={20} />, label: "Dossiers médicaux" },
    { path: "operations", icon: <Stethoscope size={20} />, label: "Opérations" },
    { path: "consultations", icon: <MessageSquare size={20} />, label: "Consultations" },
    { path: "settings", icon: <Settings size={20} />, label: "Paramètres" },
  ];

  const currentPage = activePage || location.pathname.split("/")[2] || "dashboard";

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => isMobile && setIsOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <SidebarToggle isOpen={isOpen} toggleSidebar={toggleSidebar} />
      
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
     


      <div className="sidebar-header">
        <div className="doctor-profile-card">
          {profilePicture ? (
            <img
              src={`http://localhost:8000${profilePicture}`}
              alt={`Profile of Dr. ${doctorName}`}
              className="doctor-avatar"
            />
          ) : (
            <ProfileInitials 
              name={doctorName} 
              size={72}
              fontSize="1.8rem"
              className="doctor-avatar"
            />
          )}
          <div className="doctor-details">
            <h2 className="doctor-title">
              Dr. {doctorName}
              <span className="verified-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#3498db">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </span>
            </h2>
            <p className="doctor-specialization">{specialty}</p>
            <div className="doctor-meta">
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#95a5a6">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                </svg>
                12 years exp.
              </span>
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#95a5a6">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                245 patients
              </span>
            </div>
          </div>
        </div>
      </div>

        <nav className="sidebar-menu">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={`/doctor/${item.path}`}
                  className={`menu-item ${currentPage === item.path ? "active" : ""}`}
                  onClick={closeSidebar}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
            <li>
              <button className="menu-item logout-button" onClick={handleLogout}>
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;