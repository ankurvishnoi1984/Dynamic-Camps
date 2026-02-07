
import axios from 'axios';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom'
import { BASEURL2, DeptId } from '../constant/constant';

const Sidebar = ({ toggleSideBar }) => {

  const [activeCamps, setActiveCamps] = useState([]);
  const [view_poster, setViewPoster] = useState("N")
  const [view_camp, setViewCamp] = useState("N")


  const getDeptPermissions = async () => {
    // setLoading(true);
    try {
      let res;
      res = await axios.post(
        `${BASEURL2}/department/getDepartmentPermissions`,
        { dept_id: DeptId }
      );
      if (Number(res?.data?.errorCode) === 1) {
        console.log(res.data.responseData);
        setViewPoster(res.data.responseData.view_poster)
        setViewCamp(res.data.responseData.view_camp)
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setLoading(false);
    }
  }

  useEffect(() => {

    getDeptPermissions();
  })

  // Configuration for sidebar menu items
  const menuItems = [
    { path: '/dashboard', icon: 'bi bi-grid', label: 'My Camps' },


  ];
  const dynamicCampLinks = activeCamps.map(camp => ({
    path: `/camp/${camp.camp_id}`,
    icon: 'bi bi-calendar-event',
    label: camp.camp_name,
  }));

  const fetchActiveCamps = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/monthlyCamps/getActiveCampsNavList`, { deptId: DeptId });
      console.log("res , ", res)
      if (res.data.errorCode === 1) {
        setActiveCamps(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching active camps:", err);
    }
  };
  useEffect(() => {
    fetchActiveCamps();
  }, []);




  return (
    <div>
      {/* ======= Sidebar ======= */}
      <aside className="sidebar" style={{ left: toggleSideBar ? "0" : "" }}>
        <ul className="sidebar-nav">
          {view_poster==="Y"&& (<li className="nav-item">
            <NavLink to={'/poster'} className={({ isActive }) => isActive ? "nav-link" : "nav-link collapsed"}>
              <i className="bi bi-image"></i>
              <span>Poster</span>
            </NavLink>
          </li>)}
          {activeCamps.length > 0 && view_camp==="Y"&& (
            <>
              <li className="nav-heading mt-3">Active Camps</li>
              {dynamicCampLinks.map((camp) => (
                <li key={camp.path} className="nav-item">
                  <NavLink to={camp.path} className={({ isActive }) => (isActive ? "nav-link" : "nav-link collapsed")}>
                    <i className={camp.icon}></i>
                    <span>{camp.label}</span>
                  </NavLink>
                </li>
              ))}
            </>
          )}

        </ul>
      </aside>
      {/* End Sidebar */}
    </div>
  )
}

export default Sidebar