import { useNavigate } from "react-router-dom"
import { getCurrentUser } from "../../services/authService"
import "./Header.css"
import ProfileInitials from "./ProfileInitials"

const Header = ({ title }) => {
  const navigate = useNavigate()
  const currentUser = getCurrentUser()
  const username = currentUser ? currentUser.username : "Doctor"

  return (
    <div className="header">
      <h1>{title}</h1>
      <div className="user-profile">
        <ProfileInitials name={username} size={40} />
        <span>Dr. {username}</span>
      </div>
    </div>
  )
}

export default Header
