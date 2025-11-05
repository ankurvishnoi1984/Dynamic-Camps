import React, { useState, useEffect } from "react";
import { BsCalendarEvent } from "react-icons/bs";
import { FaUserDoctor, FaPills } from "react-icons/fa6";
import { BASEURL2 } from "../constant/constant";
import "../../../style/css/sb-admin-2.min.css";
import "./editClient.css";
import axios from "axios";

const EditClientModal = ({
  showEditModal,
  setEditModal,
  editData,
  onSuccess,
  userId,
}) => {
  const [clientName, setClientName] = useState("");
  const [clientLogo, setClientLogo] = useState(null);
  const [coName, setCoName] = useState("");
  const [coContact, setCoContact] = useState("");

  // Prefill values
  useEffect(() => {
    if (editData) {
      setClientName(editData.client_name || "");
      setCoName(editData.coordinator_name || "");
      setCoContact(editData.coordinator_contact || "");
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!clientName || !coName || !coContact) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("clientId", editData.client_id);
    formData.append("clientName", clientName);
    formData.append("coName", coName);
    formData.append("coContact", coContact);
    formData.append("userId", userId);

    if (clientLogo) formData.append("logo", clientLogo);

    try {
      const res = await axios.post(`${BASEURL2}/client/updateClient`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message || "Client updated successfully");
      setEditModal(false);
      if (onSuccess) onSuccess(); // refresh parent data
    } catch (err) {
      console.error("Error updating client:", err);
      alert("Failed to update client");
    }
  };

  if (!showEditModal) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        role="document"
      >
        <div className="modal-content shadow-lg border-0 rounded-4">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-edit me-2"></i> Edit Client
              </h5>
              <button
                type="button"
                className="close"
                onClick={() => setEditModal(false)}
              >
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="fw-semibold text-secondary">Client Name</label>
                <input
                  type="text"
                  className="form-control rounded-pill"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="fw-semibold text-secondary">Client Logo</label>
                <div className="d-flex align-items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClientLogo(e.target.files[0])}
                    style={{ display: "none" }}
                    id="clientLogoInput"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary rounded-pill me-3"
                    onClick={() =>
                      document.getElementById("clientLogoInput").click()
                    }
                  >
                    Browse
                  </button>
                  <span>
                    {clientLogo
                      ? clientLogo.name
                      : editData?.logo
                      ? editData.logo
                      : "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold text-secondary">
                    Coordinator Name
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    value={coName}
                    onChange={(e) => setCoName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold text-secondary">
                    Coordinator Contact
                  </label>
                  <input
                    type="tel"
                    className="form-control rounded-pill"
                    value={coContact}
                    onChange={(e) => setCoContact(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary rounded-pill"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-pill"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditClientModal;
