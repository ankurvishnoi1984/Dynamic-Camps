import axios from 'axios';
import { useEffect, useState } from 'react';
import { BASEURL } from '../constant/constant';
import { FaClipboardList, FaUsers, FaUserCheck, FaPrescriptionBottleAlt } from 'react-icons/fa';


const DashboardBox = () => {
  const userId = sessionStorage.getItem("userId");
  const [summaryData, setSummaryData] = useState({});

  const boxItem = [
    { label: 'Total Camp Report', class: 'box1', icon: <FaClipboardList />, dataField: 'totalCampReport' },
    { label: 'Patients Attended', class: 'box2', icon: <FaUsers />, dataField: 'totalPaAttended' },
    { label: 'Patients Screened', class: 'box3', icon: <FaUserCheck />, dataField: 'totalPaScreened' },
    { label: 'Prescription Generated', class: 'box4', icon: <FaPrescriptionBottleAlt />, dataField: 'totalPrescription' },
  ];

  const getSummaryData = async () => {
    try {
      const res = await axios.post(`${BASEURL}/dashboard/getCampDataSummary`, { userId });
      if (res.data.errorCode === "1") {
        setSummaryData(res.data.data[0]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSummaryData();
  }, []);

  return (
    <div className="row justify-content-center">
      {boxItem.map((item) => (
        <div key={item.label} className="col-xl-3 col-md-3 col-sm-6 mb-4 mx-auto">
          <div className={`dashboard-box ${item.class}`}>
            <div className="icon">{item.icon}</div>
            <div className="info">
              <div className="label">{item.label}</div>
              <div className="value">{summaryData[item.dataField] || 0}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardBox;
