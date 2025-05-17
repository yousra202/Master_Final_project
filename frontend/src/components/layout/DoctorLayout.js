"use client"

import React from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  LocalHospital as OperationsIcon,
  Chat as ChatIcon,
} from "@mui/icons-material"
import { getCurrentUser, logout } from "../../services/authService";
import Sidebar from "../common/Sidebar"
import "./DoctorLayout.css"

const drawerWidth = 240

const DoctorLayout = ({ activePage }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const menuItems = [
    {
      text: "Tableau de bord",
      icon: <DashboardIcon />,
      path: "/doctor/dashboard",
    },
    {
      text: "Rendez-vous",
      icon: <EventIcon />,
      path: "/doctor/appointments",
    },
    {
      text: "Patients",
      icon: <PeopleIcon />,
      path: "/doctor/patients",
    },
    {
      text: "Dossiers médicaux",
      icon: <DescriptionIcon />,
      path: "/doctor/medical-records",
    },
    {
      text: "Opérations",
      icon: <OperationsIcon />,
      path: "/doctor/operations",
    },
    {
      text: "Consultations",
      icon: <ChatIcon />,
      path: "/doctor/consultations",
    },
  ]

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
