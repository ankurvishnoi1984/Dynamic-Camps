
import axios from 'axios';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom'
import { BASEURL2 } from '../constant/constant';

const Sidebar = ({toggleSideBar}) => {

  const designation = sessionStorage.getItem('designation');
  const role = sessionStorage.getItem('role');
  const [activeCamps, setActiveCamps] = useState([]);

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
    const res = await axios.post(`${BASEURL2}/monthlyCamps/getActiveCampsNavList`);
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

  console.log("activeCamps",activeCamps)

const filteredMenuItems =
    designation === "AREA BUSINESS MANAGER" && Number(role) === 4
      ? menuItems.filter(
          (item) =>
            ![
              "/empanormCampaign",
              "/bccDistribution",
              "/prescriptionUpload",
            ].includes(item.path)
        )
      : menuItems;

  return (
    <div>
        {/* ======= Sidebar ======= */}
        <aside className="sidebar" style={{ left: toggleSideBar ? "0" : "" }}>
            <ul className="sidebar-nav">

              {filteredMenuItems.map((item)=>(
                <li key={item.path} className="nav-item">
                <NavLink to={item.path} className={({isActive})=> isActive? "nav-link" :"nav-link collapsed"}>
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </NavLink>
                </li>
              ))}

          {activeCamps.length > 0 && (
            <>
              <li className="nav-heading mt-3">Active Monthly Camps</li>
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