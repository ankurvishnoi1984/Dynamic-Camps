import { useState } from "react";
import "../../../style/css/sb-admin-2.min.css";
import "./monthlycamps.css";
import Loader from "../utils/Loader";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useEffect } from "react";
import axios from "axios";
import { BASEURL2, DEPTID } from "../constant/constant";
import EditMonthlyCampModal from "./EditMonthlyCampsModal";
import UpdateStatusModal from "./UpdateStatusModal";

const MonthlyCamp = () => {
  const empcode = sessionStorage.getItem("empcode");
  const [myCampDetails, setMyCampDetails] = useState([]);
  const [campTypeList, setCampTypeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userId = sessionStorage.getItem("userId");
  const doctorFieldRequired = "N";
  const prescriptionFieldRequired = "N"; 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openActionId, setOpenActionId] = useState(null);
  const [showEditModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [newStatus, setNewStatus] = useState("Y");
  const deptId = DEPTID

  const handleStatusUpdate = (camp) => {
    setSelectedCamp(camp);
    setNewStatus(camp.is_active === "Y" ? "N" : "Y");
    setShowConfirmModal(true);
  }

  const handleStatusConfirm = () => {
    const payload = {
      userId,
      campId: selectedCamp.camp_id,
      status: newStatus
    }
    const endpoint = `${BASEURL2}/monthlyCamps/manageCampStatus`;
    axios
      .post(endpoint, payload)
      .then((res) => {
        alert(res.data.message || "Status Updated successfully!");
        setShowConfirmModal(false);
        getMonthlyCampDetails(); // refresh list
        setOpenActionId(null);
      })
      .catch((err) => {
        console.error("Error saving camp:", err);
        alert("Error while saving camp");
      });
  }


  const handleEditMonthlyCamp = (camp) => {
    setEditData(camp);
    setEditModal(true);
    setOpenActionId(null);
  };


  const [campName, setCampName] = useState("");
  const [campTypeId, setCampTypeId] = useState("");


  const getMonthlyCampDetails = async () => {
    setLoading(true)

    try {
      const res = await axios.post(`${BASEURL2}/monthlyCamps/getMonthlyCampsList`,
        { deptId }
      )
      setMyCampDetails(res.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const getCampTypeList = async () => {
    setLoading(true)

    try {
      const res = await axios.post(`${BASEURL2}/monthlyCamps/getAllCampType`, { deptId })
      setCampTypeList(res.data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      campName,
      deptId,
      campTypeId,
      userId,
      starDate: startDate, // 🟢 fixed typo ("starDate" → "startDate")
      endDate,
      isDrRequired: doctorFieldRequired,
      isPrescRequired: prescriptionFieldRequired,
    };

    try {
      const response = await axios.post(
        `${BASEURL2}/monthlyCamps/createMonthlyCamp`,
        payload
      );

      const data = response.data;

      if (data && data.errorCode === 1) {
        // ✅ success
        alert("Monthly camp created successfully!");
        getMonthlyCampDetails()
        setShowModal(false); // ✅ close modal
        // optional: clear form
        setCampName("");
        setCampTypeId("");
        setStartDate("");
        setEndDate("");
      } else {
        // ❌ error from API
        alert(data.errorDetail || "Failed to create camp. Please try again.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    getMonthlyCampDetails();
    getCampTypeList();
  }, [])


  return loading ? (
    <Loader />
  ) : (
    <div className="container-fluid">
      <div className="card shadow mb-4">

        <div className="card-header text-right py-3">
          <button
            className="d-none d-sm-inline-block btn btn-sm btn-success shadow-sm ml-2"
            onClick={() => setShowModal(true)}
          >
            <i className="fas fa-plus fa-sm text-white-50"></i> Add New Camp
          </button>
        </div>

        <div className="card-body">
          <div className="table-responsive">
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
            >
              <thead>
                <tr>
                  <th>Camp Name</th>
                  <th>Camp Type</th>
                  <th>Fields Names</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Is Doctor Required</th>
                  <th>Is Prescription Required</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myCampDetails &&
                  myCampDetails
                    .filter((e) => e.name !== "Admin")
                    .map((e) => {
                      // 🗓️ Convert dates to dd-mm-yyyy
                      const formatDate = (dateStr) => {
                        if (!dateStr) return "-";
                        const date = new Date(dateStr);
                        return date.toLocaleDateString("en-GB"); // dd/mm/yyyy
                      };

                      return (
                        <tr key={e.camp_id}

                        >
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}>{e.camp_name}</td>
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}>{e.camp_type_name}</td>
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}> <div className="d-flex flex-wrap gap-2">
                            {e.fields.map((el, i) => (
                              <span key={i} className="badge rounded-pill bg-primary-subtle text-primary fw-semibold px-3 py-2 shadow-sm">
                                {el.label}
                              </span>
                            ))}
                          </div></td>
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}>{formatDate(e.start_date)}</td>
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}>{formatDate(e.end_date)}</td>
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}>{e.is_doctor_required === "Y" ? "Yes" : "No"}</td>
                          <td className={e.is_active === "Y" ? "" : "text-muted"} style={{ opacity: e.is_active === "Y" ? 1 : 0.6 }}>{e.is_prescription_required === "Y" ? "Yes" : "No"}</td>
                          <td className={e.is_active === "Y" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                            {e.is_active === "Y" ? "Active" : "Deactivated"}
                          </td>
                          <td className="text-dark"
                            style={{
                              opacity: 1,
                              color: "inherit",
                            }}>
                            <div className="action-wrapper">
                              <button className="btn btn-sm btn-primary btn-circle border-0"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenActionId(prev => (prev === e.camp_id ? null : e.camp_id));
                                }}>
                                <BsThreeDotsVertical />
                              </button>
                              {openActionId === e.camp_id && (
                                <div className="action-dropdown">
                                  {(
                                    <button
                                      className="dropdown-item text-info"
                                      onClick={() => {
                                        handleEditMonthlyCamp(e)
                                      }}
                                    >
                                      Edit Monthly Camp
                                    </button>
                                  )}
                                  {(
                                    <button
                                      className={`dropdown-item fw-semibold ${e.is_active === "Y" ? "text-danger" : "text-success"
                                        }`}
                                      onClick={() => handleStatusUpdate(e)}
                                    >
                                      {e.is_active === "Y" ? "Deactivate" : "Activate"}
                                    </button>
                                  )}
                                </div>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block "
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="modal-header bg-primary text-white rounded-top-4">
                  <h5 className="modal-title fw-bold">
                    <i className="fas fa-building me-2"></i> Create Camp
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowModal(false)}
                  >
                    <span>&times;</span>
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div className="form-group mb-3">
                    <label className="fw-semibold text-secondary">Camp Name</label>
                    <input
                      type="text"
                      className="form-control rounded-pill px-3"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="Enter camp name..."
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="fw-semibold text-secondary">Camp Type</label>
                    <select
                      className="form-select form-control rounded-pill"
                      value={campTypeId}
                      onChange={(e) => setCampTypeId(e.target.value)}
                    >
                      <option value="">Select Camp Type</option>
                      {campTypeList.map((e) => (
                        <option key={e.camp_type_id} value={e.camp_type_id}>
                          {e.camp_type_name} Camp
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row">
                  </div>


                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold text-secondary">Start Date</label>
                      <input
                        type="date"
                        className="form-control rounded-pill px-3"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="fw-semibold text-secondary">End Date</label>
                      <input
                        type="date"
                        className="form-control rounded-pill px-3"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-danger rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success rounded-pill px-4">
                    <i className="fas fa-save me-2"></i> Create Camp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <EditMonthlyCampModal
          showEditModal={showEditModal}
          setEditModal={setEditModal}
          editData={editData}
          onSuccess={() => getMonthlyCampDetails()}
          campTypeList={campTypeList}
          userId={userId}
          deptId={deptId}
        />
      )}

      {showConfirmModal && (
        <UpdateStatusModal
          show={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          campName={selectedCamp?.camp_name}
          newStatus={newStatus}
          onConfirm={() => handleStatusConfirm()}
        />
      )}


    </div>
  );
};

export default MonthlyCamp;
