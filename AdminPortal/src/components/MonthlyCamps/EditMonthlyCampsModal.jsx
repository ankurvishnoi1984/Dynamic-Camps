import React, { useState, useEffect } from "react";
import { BsCalendarEvent } from "react-icons/bs";
import { FaUserDoctor, FaPills } from "react-icons/fa6";
import { BASEURL2 } from "../constant/constant";
import "../../../style/css/sb-admin-2.min.css";
import "./monthlycamps.css";
import axios from "axios";

const EditMonthlyCampModal = ({
  showEditModal,
  setEditModal,
  editData,
  onSuccess,
  campTypeList,
  userId,
  deptId,
}) => {
  const [campName, setCampName] = useState("");
  const [campTypeId, setCampTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const isDoctorRequired = "N";
  const isPrescriptionRequired = "N";

  // Pre-fill values when editing
  useEffect(() => {
    if (editData) {
      setCampName(editData.camp_name || "");
      setCampTypeId(editData.camp_type_id || "");
      setStartDate(editData.start_date ? editData.start_date.split("T")[0] : "");
      setEndDate(editData.end_date ? editData.end_date.split("T")[0] : "");
      // setIsDoctorRequired(editData.is_doctor_required || "N");
      // setIsPrescriptionRequired(editData.is_prescription_required || "N");
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      campId: editData.camp_id,
      campName,
      campTypeId,
      startDate,
      endDate,
      isDoctorRequired,
      isPrescriptionRequired,
      userId, // replace with logged-in user id
      deptId
    };
    const endpoint = `${BASEURL2}/monthlyCamps/updateMonthlyCamp` 
      axios
          .post(endpoint, payload)
          .then((res) => {
              alert(res.data.message || "Monthly Camp Updated successfully!");
              setEditModal(false);
              if (onSuccess) onSuccess(); // refresh parent
          })
          .catch((err) => {
              console.error("Error saving camp:", err);
              alert("Error while saving camp");
          });
  };

  if (!showEditModal) return null;

  return (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog"
        style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-calendar-alt me-2"></i> Edit Monthly Camp
              </h5>
              <button
                type="button"
                className="close text-white"
                onClick={() => setEditModal(false)}
              >
                <span>&times;</span>
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Camp Name */}
              <div className="form-group mb-3">
                <label className="fw-semibold text-secondary">Camp Name</label>
                <input
                  type="text"
                  className="form-control rounded-pill px-3"
                  placeholder="Enter camp name..."
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  required
                />
              </div>

              {/* Camp Type */}
              <div className="form-group mb-3">
                <label className="fw-semibold text-secondary">Camp Type</label>
                <select
                  className="form-select form-control rounded-pill"
                  value={campTypeId}
                  onChange={(e) => setCampTypeId(e.target.value)}
                  required
                >
                  <option value="">Select Camp Type</option>
                  {campTypeList.map((ct) => (
                    <option key={ct.camp_type_id} value={ct.camp_type_id}>
                      {ct.camp_type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="fw-semibold text-secondary">
                    <BsCalendarEvent className="me-1" /> Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control rounded-pill px-3"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="fw-semibold text-secondary">
                    <BsCalendarEvent className="me-1" /> End Date
                  </label>
                  <input
                    type="date"
                    className="form-control rounded-pill px-3"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Flags */}
              {/* <div className="row g-3 mt-3">
                <div className="col-md-6">
                  <label className="fw-semibold text-secondary">
                    <FaUserDoctor className="me-1" /> Is Doctor Required
                  </label>
                  <select
                    className="form-select form-control rounded-pill"
                    value={isDoctorRequired}
                    onChange={(e) => setIsDoctorRequired(e.target.value)}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="fw-semibold text-secondary">
                    <FaPills className="me-1" /> Is Prescription Required
                  </label>
                  <select
                    className="form-select form-control rounded-pill"
                    value={isPrescriptionRequired}
                    onChange={(e) => setIsPrescriptionRequired(e.target.value)}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                </div>
              </div> */}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success rounded-pill px-4">
                <i className="fas fa-save me-2"></i> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backdrop */}
      {/* <div
        className="modal-backdrop fade show"
        onClick={() => setEditModal(false)}
      ></div> */}
    </div>
    );
};

export default EditMonthlyCampModal;
