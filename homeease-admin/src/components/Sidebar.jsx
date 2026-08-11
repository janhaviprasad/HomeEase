import { NavLink } from "react-router-dom";
import {useContext} from "react";
import { AdminContext} from "../context/AdminContext";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../utils/auth";
import {
  FaThLarge,
  FaUsers,
  FaUserFriends,
  FaCalendarAlt,
  FaTools,
  FaWallet,
  FaCog,
  FaQuestionCircle,
} from "react-icons/fa";

import logo from "../assets/homeease-logo.png";

export default function Sidebar() {
  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FaThLarge />,
    },
    {
      title: "Providers",
      path: "/providers",
      icon: <FaUsers />,
    },
    {
      title: "Provider Earnings",
      path: "/earnings",
      icon: <FaWallet />,
    },
    {
      title: "Users",
      path: "/users",
      icon: <FaUserFriends />,
    },
    {
      title: "Bookings",
      path: "/booking",
      icon: <FaCalendarAlt />,
    },
    {
      title: "Services",
      path: "/services",
      icon: <FaTools />,
    },
  ];

  const { adminName, adminImage } =
    useContext(AdminContext);

  const navigate = useNavigate();

const handleLogout = () => {
  clearSession();
  navigate("/");
};

  return (
    <aside
      className="
        fixed
        top--2
        bottom-8
        left-0
        w-[260px]
        h-screen
        bg-white
        border-r
        border-gray-200
        hidden
        md:flex
        flex-col
      "
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <img
          src={logo}
          alt="HomeEase"
          className="w-60"
        />

        <p className="text-gray-500 text-sm mt-1">
          Admin Console
        </p>
      </div>

      {/* Navigation */}
      <nav className="px-0">
        {menuItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            className={({ isActive }) =>
              `
              flex
              items-center
              gap-4
              px-6
              py-4
              text-lg
              font-medium
              transition-all

              ${
                isActive
                  ? `
                    bg-teal-50
                    text-teal-700
                    border-l-4
                    border-teal-700
                  `
                  : `
                    text-gray-600
                    hover:bg-gray-50
                  `
              }
            `
            }
          >
            <span className="text-xl">
              {item.icon}
            </span>

            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 pb-6">
        <hr />

        <NavLink
  to="/settings"
  className="
    flex
    items-center
    gap-4
    py-4
    text-gray-600
  "
>
  <FaCog />
  Settings
</NavLink>

        
          <NavLink
  to="/help"
  className="
    flex
    items-center
    gap-4
    py-1
    text-gray-600
  "
>
  <FaQuestionCircle />

  Help
</NavLink>
        

        {/* User */}
        
        <div className="mt-8 flex items-center gap-3">
          <img
  src={adminImage}
  onClick={() => navigate("/profile")}
  alt="Admin"
  className="
    w-14
    h-14
    rounded-full
    object-cover
  "
/>

          <div>
            <h4 className="font-semibold">
              {adminName}
              </h4>

            <button
              className="
                text-sm
                text-gray-500
                hover:text-red-600
              "
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}