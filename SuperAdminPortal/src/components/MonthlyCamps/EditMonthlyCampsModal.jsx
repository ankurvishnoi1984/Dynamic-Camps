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

  // --- helper: convert ISO timestamp to YYYY-MM-DD (UTC) for <input type="date">
  const toInputDate = (dateStr) => {
    if (!dateStr) return "";
    // Use UTC so the date doesn't shift due to client's timezone offset
    try {
      return new Date(dateStr).toISOString().split("T")[0];
    } catch (err) {
      // fallback to naive split if value is already YYYY-MM-DD or unexpected
      return dateStr.split("T")[0];
    }
  };

  // Pre-fill values when editing
  useEffect(() => {
    if (editData) {
      setCampName(editData.camp_name || "");
      setCampTypeId(editData.camp_type_id || "");
      // use toInputDate to avoid timezone shift (do NOT use local timezone conversion)
      setStartDate(editData.start_date ? toInputDate(editData.start_date) : "");
      setEndDate(editData.end_date ? toInputDate(editData.end_date) : "");
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      campId: editData.camp_id,
      campName,
      campTypeId,
      startDate, // YYYY-MM-DD (UTC)
      endDate,   // YYYY-MM-DD (UTC)
      isDoctorRequired,
      isPrescriptionRequired,
      userId,
      deptId,
    };

    const endpoint = `${BASEURL2}/monthlyCamps/updateMonthlyCamp`;
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
    <div
      className="modal fade show d-block"
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

              {/* Flags (commented out) */}
              {/* <div className="row g-3 mt-3">
                ...
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
    </div>
  );
};

export default EditMonthlyCampModal;
