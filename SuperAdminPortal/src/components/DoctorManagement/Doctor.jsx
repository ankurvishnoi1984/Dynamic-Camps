import { useEffect, useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmationPopup from "../popup/Popup";
import "./doctor.css";
import { BsThreeDotsVertical } from "react-icons/bs";
import AddDoctorModal from "./AddDoctorModal";
import InfoDrModal from "./InfoDrMotal";
import EditDoctorModal from "./EditDoctorModal";
import UploadDoctorCsvModal from "./UploadDrCSVModal";

function DoctorManagement() {
  const [formData, setFormData] = useState({
    doctor_name: "",
    speciality: "",
    empcode: "",
    qualification: "",
    designation: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmationDel, setShowConfirmationDel] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  const [modals, setModals] = useState({
    add: false,
    edit: false,
    info: false,
    bulkUpload: false,
  });

  const [empData, setEmpData] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [clientList, setClientList] = useState([]);
  const [clientId, setClientId] = useState("");
  const [deptList, setDeptList] = useState([]);
  const [deptId, setDeptId] = useState("");

  const entriesPerPage = 20;
  const empCode = sessionStorage.getItem("empcode");
  const userId = sessionStorage.getItem("userId");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery) {
      let timer = setTimeout(() => {
        fetchEmployees();

      }, 400);

      return () => {
        clearTimeout(timer);
      };
    }
    fetchEmployees();
  }, [currentPage, searchQuery, deptId])


  useEffect(() => {
    getClientList();
  }, [])


  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        `${BASEURL2}/doc/getAllDoctors?page=${currentPage}&limit=${entriesPerPage}&searchName=${searchQuery}&empcode=${empCode}&deptId=${deptId}`
      );
      setEmpData(res.data?.doctors || []);
      console.log("userdata", res.data?.users);

      setTotalCount(res.data?.totalCount || 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
    }
  };

  // ----------------- Handlers -----------------
  const handleAddUser = () => setModals((prev) => ({ ...prev, add: true }));

  const handleEdit = async (el) => {
    setSelectedEmp(el)
    setModals((prev) => ({ ...prev, edit: true }));
    setOpenActionId(null);
  };

  const handleInfo = async (el) => {
    setSelectedEmp(el)
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
      const res = await axios.delete(`${BASEURL2}/doc/deleteDoctor/${deleteId}`);
      if (res.data.errorCode === "1") {
        alert("Doctor deleted successfully");
        fetchEmployees();
      } else {
        alert("Failed to delete doctor");
      }
    } catch (error) {
      alert(error.message);
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
    const requiredFields = [
      "doctor_name",
      "speciality",
      // "garnet_code",
      "empcode",
      "qualification",
      "subarea",
      "grade",
    ];
    const missing = requiredFields.filter((f) => !formData[f]);
    if (missing.length) {
      alert(`Missing required fields: ${missing.join(", ")}`);
      return;
    }
    setShowConfirmation(true);
  };

  const handleAddConfirm = async () => {
    try {
      const payload = {
        doctor_name: formData.doctor_name,
        speciality: formData.speciality,
        // garnet_code: formData.garnet_code,
        empcode: formData.empcode,
        qualification: formData.qualification,
        subarea: formData.subarea,
        grade: formData.grade,
        userId: userId,
        deptId:deptId,
      };

      const res = await axios.post(`${BASEURL2}/doc/doctorUpsertSingle`, payload);

      if (Number(res.data.errorCode) === 1) {
        alert("Doctor created successfully");
        fetchEmployees();
        handleModalClose();
      } else {
        alert(res.data.message || "Failed to add doctor");
      }
    } catch (error) {
      console.log(error)
      alert(error.response.data.message);
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

  const getClientList = async () => {
    setLoading(true)

    try {
      const res = await axios.post(`${BASEURL2}/client/getClientDetails`)
      const clients = res.data.data;
      setClientList(res.data.data)
      // Auto-select first client and load its departments
      if (clients && clients.length > 0) {
        const firstClientId = clients[0].client_id;
        setClientId(firstClientId);
        await getDepartmentList(firstClientId);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const getDepartmentList = async (clientId) => {
    setLoading(true)
    try {
      const res = await axios.post(`${BASEURL2}/department/getDepartmentDetails`,
        { clientId }
      )
      setDeptList(res.data.data)
      setDeptId(res.data.data[0].dept_id)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  // ----------------- JSX -----------------
  return (
    <div className="container-fluid">
      {/* Header */}


      <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between mb-4">

        {/* LEFT: SEARCH BAR */}
        <div className="d-flex align-items-center">

          {/* Client */}
          <div className="form-group mr-3 mb-0">
            <label htmlFor="clientId">Select Client:</label>
            <select
              className="form-control selectStyle"
              id="clientId"
              value={clientId}
              onChange={(e) => {
                const val = e.target.value;
                setClientId(val);
                getDepartmentList(val);
              }}
              style={{ width: "200px" }}
            >
              {clientList?.map((e) => (
                <option key={e.client_id} value={e.client_id}>
                  {e.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* Dept */}
          <div className="form-group mr-3 mb-0">
            <label htmlFor="deptId">Select Dept:</label>
            <select
              className="form-control selectStyle"
              id="deptId"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              style={{ width: "200px" }}
            >
              {deptList?.map((e) => (
                <option key={e.dept_id} value={e.dept_id}>
                  {e.dept_name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box (same size as dropdown) */}
          <div className="form-group mr-3 mb-0">
            <label>Search:</label>
            <div className="d-flex">
              <input
                type="text"
                className="form-control"
                placeholder="Search employee..."
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "200px" }}
              />
              <button className="btn btn-primary ml-2">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT: BUTTON GROUP */}
        <div className="d-flex flex-column flex-sm-row justify-content-md-end w-100 w-md-auto">

          {/* Add Employee */}
          <button
            className="btn btn-primary btn-icon-split mb-2 mb-sm-0 mr-sm-2"
            onClick={handleAddUser}
          >
            <span className="icon text-white-50">
              <i className="fas fa-plus"></i>
            </span>
            <span className="text">Add Doctor</span>
          </button>

          {/* Upload CSV */}
          <button
            className="btn btn-upload-employee btn-icon-split"
            onClick={() => setModals((prev) => ({ ...prev, bulkUpload: true }))}
          >
            <span className="icon text-white-50">
              <i className="fas fa-file-upload"></i>
            </span>
            <span className="text">Upload CSV</span>
          </button>

        </div>
      </div>




      {/* Table */}
      <div className="card shadow mb-4">
        <div className="card-body">
          {/* <small className="msgnote mt-2">*Scroll left for other column of table</small> */}
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  {/* <th>Garnet Code</th> */}
                  <th>Speciality</th>
                  <th>Qualification</th>
                  <th>Sub Area</th>

                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {empData
                  ?.filter((e) => e.name !== "Admin")
                  .map((e) => (
                    <tr key={e.doctor_id}>
                      <td>{e.doctor_name}</td>
                      {/* <td>{e.garnet_code}</td> */}
                      <td>{e.speciality}</td>
                      <td>{e.qualification}</td>
                      <td>{e.subarea}</td>


                      <td>
                        <div className="action-wrapper">
                          <button
                            className="btn btn-sm btn-primary btn-circle border-0"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenActionId(prev => (prev === e.doctor_id ? null : e.doctor_id));
                            }}
                          >
                            <BsThreeDotsVertical />
                          </button>

                          {openActionId === e.doctor_id && (
                            <div className="action-dropdown">
                              <button
                                className="dropdown-item text-info"
                                onClick={() => handleInfo(e)}
                              >
                                Info
                              </button>
                              <button
                                className="dropdown-item text-success"
                                onClick={() => handleEdit(e)}
                              >
                                Edit
                              </button>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(e.doctor_id)}
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
      <AddDoctorModal
        show={modals.add}
        onClose={handleModalClose}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        setShowConfirmation={setShowConfirmation}
        handleAddConfirm={handleAddConfirm}
        showConfirmation={showConfirmation}
      />

      {showConfirmationDel && (
        <ConfirmationPopup
          message="Are you sure you want to delete this doctor?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirmationDel(false)}
        />
      )}

      {modals.edit && (
        <EditDoctorModal
          empData={selectedEmp}
          getfun={fetchEmployees}
          setEditUserModel={(val) => setModals((prev) => ({ ...prev, edit: val }))}
          handleInputChange={handleInputChange}
        />
      )}
      {modals.info && (
        <InfoDrModal
          empData={selectedEmp}
          getfun={fetchEmployees}
          setInfoUserModel={(val) => setModals((prev) => ({ ...prev, info: val }))}
          handleInputChange={handleInputChange}
        />
      )}

      {modals.bulkUpload && (
        <UploadDoctorCsvModal
          closeModal={() => setModals((prev) => ({ ...prev, bulkUpload: false }))}
          refreshList={fetchEmployees} // same pattern as edit modal
          userId={userId}
          deptId={deptId}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default DoctorManagement;
