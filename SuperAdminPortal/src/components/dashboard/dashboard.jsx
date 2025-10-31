import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css"
import axios from "axios";
import { BASEURL, BASEURL2 } from "../constant/constant";
import * as XLSX from 'xlsx/xlsx.mjs';
import { ToastContainer, toast } from 'react-toastify';
import "./dashboard.css"
import 'react-toastify/dist/ReactToastify.css';
import ConfirmationPopup from "../popup/Popup";
import ImgDownload from "../Modals/ImgDownload";



function Dashboard() {


  const [catData, SetCatData] = useState([]);
  const [filter, setFilter] = useState('')
  const loginEmpCode = sessionStorage.getItem('empcode')
  const[loading,setLoading] = useState(false)
 const [show,setShow]= useState(false);

  const [name, SetName] = useState("");
  const [empcode, SetEmpcode] = useState("");
  const [state, SetState] = useState("");
  const [hq, SetHq] = useState("");
  const [city, SetCity] = useState("");
  const [pincode, SetPincode] = useState("");
  const [reporting, SetReporting] = useState("");
  const [password, SetPassword] = useState("");
  const [role, SetRole] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recentClients,setRecentClients] = useState([]);
  const [recentCamps,setRecentCamps] = useState([]);


  const [addUserModel, setAddUserModel] = useState(false)

  const [dashboardSummary, setDashSummary] = useState([]);

    const [filters, setFilters] = useState({
      fromDate: "",
      toDate: "",
      campType: ""
    });


  const [totals, setTotals] = useState({
   totalClient:0,
   totalDept:0,
   totalEmp:0,
   totalCamps:0
  });


  const handelCloseModel = () => {
    setAddUserModel(false)
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !empcode || !state || !hq || !city || !pincode || !reporting || !password || !role) {
      toast.error("Missing required fields");
      return;
    }
    setShowConfirmation(true);

  }

  const handleCancel = () => {
    setShowConfirmation(false);
  };

    const getRecentClients = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${BASEURL2}/dashboard/getRecentClientDetails`)
      setRecentClients(res.data.data)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false);
    }
  }

  const getRecentCamps = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${BASEURL2}/dashboard/getRecentCampDetails`)
      setRecentCamps(res.data.data)
      console.log("res.data.data", res.data)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false);
    }
  }

  const getTotalCountDetails = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${BASEURL2}/dashboard/totalCountDetails`)
      setTotals(res.data.data)
      console.log("res.data.data", res.data)
    } catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    getSummaryByActivity();
    getRecentClients();
    getRecentCamps();
    getTotalCountDetails();
  }, [])

  const handleOpenModal = (action, crid) => {

  setShow(true);
};
   const handleCloseModal = () => {
  setShow(false);
 
};


  const getSummaryByActivity = async () => {
      const payload = {
      empcode: loginEmpCode,
      isExecuted: "Y",
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null,
      campType: filters.campType || null
    };
    try {
      const res = await axios.post(`${BASEURL2}/admin/summaryByActivity`, payload);
      setDashSummary(res.data.data)
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-xl-3 col-md-4 mx-auto mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Clients
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{totals.totalClients}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Repeat similar card elements for Total Doctors, Patients Screened, and Patients Diagnosed */}

        <div className="col-xl-3 col-md-4 mx-auto mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Departments
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{totals.totalDepartments}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-users  fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-4 mx-auto mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                       Total Employees
                  </div>
                  <div className="row no-gutters align-items-center">
                    <div className="col-auto">
                      <div className="h5 mb-0 font-weight-bold text-gray-800">{totals.totalEmployees}</div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-user-tie fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-4 mx-auto mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                   Total Camps
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">{totals.totalCamps}</div>
                </div>
                <div className="col-auto">
                  <i className="fas fa-hospital-alt fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className="card shadow mb-4">
 <div className="row pt-5">
  {/* Recent Clients Table */}
  <div className="col-lg-5 mb-4">
    <div className="card shadow mb-4">
      <div className="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold text-primary">Recent Clients</h6>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered" width="100%" cellSpacing="0">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Department</th>
                <th>Contact Person</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((client, i) => (
                <tr key={i}>
                  <td>{client.client_name}</td>
                  <td>{client.dept_name}</td>
                  <td>{client.coordinator_name}</td>
                  <td>{new Date(client.created_date).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  {/* Recent Camps Table */}
  <div className="col-lg-7 mb-4">
    <div className="card shadow mb-4">
      <div className="card-header py-3 d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold text-primary">Recent Camps</h6>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-bordered" width="100%" cellSpacing="0">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Department</th>
                <th>Camp Name</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {console.log("recentCamps : ",recentCamps)}
              {recentCamps.map((camp, i) => (
                <tr key={i}>
                  <td>{camp.client_name}</td>
                  <td>{camp.dept_name}</td>
                  <td>{camp.camp_name}</td>
                  <td>{new Date(camp.start_date).toLocaleDateString("en-GB")}</td>
                  <td>{new Date(camp.end_date).toLocaleDateString("en-GB")}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>


      </div>
 <ImgDownload
           show={show}
    handelCloseModal={handleCloseModal}
        />

      {addUserModel && (<div className="addusermodel">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header" style={{ backgroundColor: '#0c509f', color: '#fff' }}>
              <h5 className="modal-title">Add Employee</h5>
              <button onClick={handelCloseModel} type="button" className="close-but">
                <span >&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label htmlFor="inputName4">Name Of Employee</label>
                    <input type="text" onChange={(e) => {
                      SetName(e.target.value)
                    }}
                      className="form-control" id="inputName4" name="name" placeholder="Name" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="Code">Employee Code</label>
                    <input type="number" onChange={(e) => {
                      SetEmpcode(e.target.value)
                    }}
                      className="form-control" id="Code" name="code" placeholder="Code" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="state">State</label>
                    <input type="text" onChange={(e) => {
                      SetState(e.target.value)
                    }}
                      className="form-control" id="state" name="state" placeholder="State" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="city">City</label>
                    <input type="text" onChange={(e) => {
                      SetCity(e.target.value)
                    }}
                      className="form-control" id="city" name="city" placeholder="City" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="HQ">HQ</label>
                    <input type="text"
                      onChange={(e) => {
                        SetHq(e.target.value)
                      }}
                      className="form-control" id="HQ" name="hq" placeholder="HQ" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="pincode">Pin Code</label>
                    <input type="number"
                      onChange={(e) => {
                        SetPincode(e.target.value)
                      }}
                      className="form-control" id="pincode" name="pincode" placeholder="Pin Code" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="reporting">Reporting</label>
                    <input type="number" onChange={(e) => {
                      SetReporting(e.target.value)
                    }}
                      className="form-control" id="reporting" name="reporting" placeholder="Employee Code" />
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="inputState">Designation</label>
                    <select id="inputState" onChange={(e) => {
                      SetRole(e.target.value)
                    }}
                      className="form-control" name="designation" >
                      <option value={1}>Top Line</option>
                      <option value={2}>5th Line</option>
                      <option value={3}>4th Line</option>
                      <option value={4}>3rd Line</option>
                      <option value={5}>2nd Line</option>
                      <option value={6}>1st Line</option>
                      <option value={7}>MR</option>

                    </select>
                  </div>
                  <div className="form-group col-md-6">
                    <label htmlFor="password">Password</label>
                    <input type="text" onChange={(e) => {
                      SetPassword(e.target.value)
                    }}
                      className="form-control" id="password" name="password" placeholder="Password" />
                  </div>
                </div>
                <div className="text-center">
                  <button type="submit" className="btn btn-primary mx-auto">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
       
        {showConfirmation && (
          <ConfirmationPopup
            message="Are you sure you want to Add Employee?"
            onConfirm={() => handleConfirm()}
            onCancel={handleCancel}
          />
        )}
      </div>)}
      <ToastContainer />
    </div>
  );
}

export default Dashboard;
