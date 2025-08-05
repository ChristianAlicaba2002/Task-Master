import "../../public/css/sidebar.css"
import { NavLink, useNavigate } from "react-router-dom"
import { CiLogout } from "react-icons/ci";


export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="sidebar-container">
      <h1 className="sidebar-title">Task Master</h1>
      <NavLink to={'/dashboard'} className="sidebar-button" style={({ isActive }) => ({
        color:
          isActive ? "white" : "gray"
      })} >
        Dashboard
      </NavLink>
      {/* <NavLink to={'/user-profile'} className="sidebar-button" style={({ isActive }) => ({
        color: isActive ? "blue" : "gray"
      })}>
        User Profile
      </NavLink>
      <NavLink to={'/history-logs'} className="sidebar-button" style={({ isActive }) => ({
        color: isActive ? "blue" : "gray"
      })}>
        History Logs
      </NavLink> */}
      <div className="logout" >
        <CiLogout onClick={handleLogout} className="logout-icon" />
      </div>
    </div>
  )
}
