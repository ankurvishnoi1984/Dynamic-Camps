import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASEURL, BASEURL2 } from "../constant/constant";
import Sidebar from "./Sidebar";

const Header = () => {
  const navigate = useNavigate();

  const [toggleSideBar, setToggleSideBar] = useState(false);

  const sessionId = sessionStorage.getItem("sessionId");
  const handleLogout = async () => {
    sessionStorage.removeItem("IsUserLoggedIn");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("empId");
    sessionStorage.removeItem("role");
    navigate("/");
    try {
      const res = await axios.post(`${BASEURL2}/auth/logout`, { sessionId });
    } catch (error) {
      console.log(error);
    }
  };

  const handelSidebarChange = () => {
    setToggleSideBar(!toggleSideBar);
  };

  return (
    <div>
      {/* ======= Header ======= */}
      <header
        id="header"
        className="header fixed-top d-flex align-items-center"
      >
        <div className="d-flex align-items-center justify-content-between">
          <i
            onClick={handelSidebarChange}
            className="bi bi-list toggle-sidebar-btn"
          ></i>
          <Link to={"/dashboard"} className="logo d-flex align-items-center">
            <img src="/images/logo.svg" alt="" />
          </Link>
          {/* <div>Logo</div> */}
        </div>

        <nav className="header-nav ms-auto">
          <ul className="d-flex align-items-center">
            <li className="nav-item dropdown pe-3">
              <a
                className="nav-link nav-profile d-flex align-items-center pe-0"
                href="#"
                data-bs-toggle="dropdown"
              >
                <img
                  src="/images/userimg.png"
                  alt="Profile"
                  className="rounded-circle"
                />
                <span className="d-none d-md-block dropdown-toggle ps-2">
                  User
                </span>
              </a>

              <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                <li>
                  <div
                    onClick={handleLogout}
                    className="dropdown-item d-flex align-items-center"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Sign Out</span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>

      <Sidebar toggleSideBar={toggleSideBar}></Sidebar>
    </div>
  );
};

export default Header;
