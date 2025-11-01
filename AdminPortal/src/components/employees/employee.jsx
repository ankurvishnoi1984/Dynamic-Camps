import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL, BASEURL2,DEPTID } from "../constant/constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationPopup from "../popup/Popup";
import EditModel from "./editEmpModel";
import InfoModel from "./infoEmpModal";
import "./employee.css";
import { BsThreeDotsVertical } from "react-icons/bs";

function Employee() {
  const [formData, setFormData] = useState({
    name: "",
    empcode: "",
    hq: "",
    password: "",
    designation: "",
    zone: "",
    region: "",
    username: "",
    reporting: "",
    mobile: "",
    email: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmationDel, setShowConfirmationDel] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openActionId,setOpenActionId] = useState(null);

  const [modals, setModals] = useState({
    add: false,
    edit: false,
     info: false,
  });

  const [empData, setEmpData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [seniorEmpcodes, setSeniorEmpcodes] = useState([]);

  const entriesPerPage = 20;
  const empCode = sessionStorage.getItem("empcode");
  const userId = sessionStorage.getItem("userId");
  const deptId = DEPTID;
  const [loading,setLoading] = useState(false);

  // ----------------- Data Fetching -----------------
  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchQuery]);

  const fetchEmployees = async () => {
    if(!deptId)return;
    try {
      const res = await axios.get(
        `${BASEURL2}/employee/getAllEmployee?page=${currentPage}&limit=${entriesPerPage}&searchName=${searchQuery}&empcode=${empCode}&deptId=${deptId}`
      );
      console.log(res.data.users)
      setEmpData(res.data?.users || []);
      console.log("userdata",res.data?.users);
      
      setTotalCount(res.data?.totalCount || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
    }
  };

  const fetchSeniorEmpList = async () => {
    try {
      const res = await axios.post(
        `${BASEURL2}/employee/getSeniorEmpcodesByDesignation`,
        { designation: formData.designation }
      );
      setSeniorEmpcodes(res.data.seniors)
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch seniors list");
    }
  };



  useEffect(() => {
    if (formData.designation) {
      fetchSeniorEmpList();
    }
  }, [formData])

  const fetchEmployeeById = async (id) => {
    try {
      const res = await axios.get(`${BASEURL2}/employee/getEmpWithId/${id}`);
      setSelectedEmp(res.data?.user?.[0] || {});
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employee details");
    }
  };

  // ----------------- Handlers -----------------
  const handleAddUser = () => setModals((prev) => ({ ...prev, add: true }));

  const handleEdit = async (id) => {
    await fetchEmployeeById(id);
    setModals((prev) => ({ ...prev, edit: true }));
    setOpenActionId(null);
  };

   const handleInfo = async (id) => {
    await fetchEmployeeById(id);
    setModals((prev) => ({ ...prev, info: true }));
    setOpenActionId(null);
  };
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowConfirmationDel(true);
    setOpenActionId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await axios.delete(`${BASEURL2}/admin/deleteEmployee/${deleteId}`);
      if (res.data.errorCode === "1") {
        toast.success("Employee deleted successfully");
        fetchEmployees();
      } else {
        toast.error("Failed to delete employee");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setShowConfirmationDel(false);
    }
  };

  const handleModalClose = () => setModals({ add: false, edit: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = ["name",
      "empcode",
      "hq",
      "reporting",
      "password",
      "designation",
      "zone",
      "region",
      "username",
      "mobile",
      "email",
    ];
    const missing = requiredFields.filter((f) => !formData[f]);
    if (missing.length) {
      toast.error(`Missing required fields: ${missing.join(", ")}`);
      return;
    }
    setShowConfirmation(true);
  };

  const handleAddConfirm = async () => {
    try {
      const payload = {
        name: formData.name,
        empcode: formData.empcode,
        hq: formData.hq,
        reporting: formData.reporting,
        password: formData.password,
        designation: formData.designation,
        joiningDate: formData.joiningDate,
        zone: formData.zone,
        region: formData.region,
        usernamehq: formData.username, // maps to usernamehq column
        mobile: formData.mobile,
        email: formData.email,
        dob: formData.dateOfBirth,
        created_by: userId, // assuming you have userId stored (e.g. from login)
        deptId,
      };

      const res = await axios.post(`${BASEURL2}/employee/addEmp`, payload);

      if (res.data.errorCode === "1") {
        toast.success("Employee created successfully");
        fetchEmployees();
        handleModalClose();
      } else {
        toast.error(res.data.message || "Failed to add employee");
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message);
    } finally {
      setShowConfirmation(false);
      setFormData({
        name: "",
        empcode: "",
        hq: "",
        reporting: "",
        password: "",
        designation: "",
        zone: "",
        region: "",
        username: "",
        mobile: "",
        email: "",
      });
    }
  };


  // ----------------- Pagination -----------------
  const handleNext = () => {
    if (currentPage * entriesPerPage < totalCount) setCurrentPage((p) => p + 1);
  };
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const startingEntry = (currentPage - 1) * entriesPerPage + 1;
  const endingEntry = Math.min(startingEntry + entriesPerPage - 1, totalCount);

  // ----------------- JSX -----------------
  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="input-group mb-0 w-50">
          <input
            type="text"
            className="form-control bg-light border-1 small"
            placeholder="Search employee..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary">
            <i className="fas fa-search fa-sm"></i>
          </button>
        </div>
        <button className="btn btn-primary btn-icon-split mt-3" onClick={handleAddUser}>
          <span className="icon text-white-50">
            <i className="fas fa-plus"></i>
          </span>
          <span className="text">Add Employee</span>
        </button>
      </div>

      {/* Table */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee Code</th>
                  <th>HQ</th>
             
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {empData
                  ?.filter((e) => e.name !== "Admin")
                  .map((e) => (
                    <tr key={e.user_id}>
                      <td>{e.name}</td>
                      <td>{e.empcode}</td>
                      <td>{e.hq}</td>
                     
                      {/* <td>
                        <button
                          className="btn-sm btn-primary btn-circle m-1 border-0"
                          onClick={() => handleEdit(e.user_id)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn-sm btn-danger btn-circle m-1 border-0"
                          onClick={() => handleDelete(e.user_id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td> */}
                      <td>
                        <div className="action-wrapper">
                          <button
                            className="btn btn-sm btn-primary btn-circle border-0"
                            onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenActionId(prev => (prev === e.user_id ? null : e.user_id));
                                    }}
                          >
                           <BsThreeDotsVertical />
                          </button>

                          {openActionId === e.user_id && (
                            <div className="action-dropdown">
                              <button
                                className="dropdown-item text-info"
                                onClick={() => handleInfo(e.user_id)}
                              >
                                Info
                              </button>
                              <button
                                className="dropdown-item text-success"
                                onClick={() => handleEdit(e.user_id)}
                              >
                                Edit
                              </button>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(e.user_id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                Showing {startingEntry} to {endingEntry} of {totalCount} entries
              </div>
              <div>
                <button className="btn btn-light pag-but" onClick={handlePrevious}>
                  Previous
                </button>
                <button className="btn btn-light pag-but pag-but-bg">{currentPage}</button>
                <button className="btn btn-light pag-but" onClick={handleNext}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {modals.add && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog"
        style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add Employee</h5>
                <button onClick={handleModalClose} type="button" className="close-but">
                  <span>&times;</span>
                </button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    {[
                      { label: "Employee Name", name: "name", type: "text" },
                      { label: "Employee Code", name: "empcode", type: "number" },
                      { label: "HQ", name: "hq", type: "text" },
                      { label: "Region", name: "region", type: "text" },
                      { label: "UserName", name: "username", type: "username" },
                      { label: "Mobile", name: "mobile", type: "number" },
                      { label: "Password", name: "password", type: "text" },
                      { label: "Email", name: "email", type: "text" },
                    ].map((f) => (
                      <div className="form-group col-md-4" key={f.name}>
                        <label htmlFor={f.name}>{f.label}</label>
                        <input
                          type={f.type}
                          name={f.name}
                          id={f.name}
                          value={formData[f.name]}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      </div>
                    ))}

                    <div className="form-group col-md-4">
                      <label htmlFor="zone">Zone</label>
                      <select
                        id="zone"
                        name="zone"
                        className="form-control"
                        value={formData.zone}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        {[
                          "South",
                          "North",
                          "EAST",
                          "WEST",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group col-md-4">
                      <label htmlFor="designation">Designation</label>
                      <select
                        id="designation"
                        name="designation"
                        className="form-control"
                        value={formData.designation}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        {[
                          "MARKETING EXECUTIVE",
                          "AREA BUSINESS MANAGER",
                          "SENIOR AREA BUSINESS MANAGER",
                          "REGIONAL MANAGER",
                          "SENIOR REGIONAL MANAGER",
                          "DIVISIONAL SALES MANAGER",
                          "ZONAL SALES MANAGER",
                          "SALES MANAGER",
                          "ASSOCIATE GENERAL MANAGER - SALES",
                          "NATIONAL SALES MANAGER",
                        ].map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group col-md-4">
                      <label htmlFor="zone">Reporting</label>
                      <select
                        id="reporting"
                        name="reporting"
                        className="form-control"
                        value={formData.reporting}
                        onChange={handleInputChange}
                      >
                        <option value="">Select</option>
                        {seniorEmpcodes.map((d) => (
                          <option key={d.empcode} value={d.empcode}>
                            {d.name + " - " + d.empcode}
                          </option>
                        ))}
                      </select>
                    </div>


                  </div>

                  <div className="text-center">
                    <button type="submit" className="btn btn-primary mx-auto">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {showConfirmation && (
            <ConfirmationPopup
              message="Are you sure you want to add this employee?"
              onConfirm={handleAddConfirm}
              onCancel={() => setShowConfirmation(false)}
            />
          )}
        </div>
      )}

      {showConfirmationDel && (
        <ConfirmationPopup
          message="Are you sure you want to delete this employee?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirmationDel(false)}
        />
      )}

      {modals.edit && (
        <EditModel
          empData={selectedEmp}
          getfun={fetchEmployees}
          setEditUserModel={(val) => setModals((prev) => ({ ...prev, edit: val }))}
          handleInputChange={handleInputChange}
        />
      )}
        {modals.info && (
        <InfoModel
          empData={selectedEmp}
          getfun={fetchEmployees}
          setInfoUserModel={(val) => setModals((prev) => ({ ...prev, info: val }))}
          handleInputChange={handleInputChange}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default Employee;
