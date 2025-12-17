import ConfirmationPopup from "../popup/Popup";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {  BASEURL2 } from "../constant/constant";

export default function EditDoctorModal({
  setEditUserModel,
  empData,
  getfun,
  handleInputChange,
}) {

  const [formData, setFormData] = useState(empData);
  

  const [showConfirmation, setShowConfirmation] = useState(false);
  const loggedInUserId = sessionStorage.getItem("userId");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredFields = [
      "doctor_name",
      "speciality",
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


  const handleConfirm = async () => {
    try {
      const updatedData = {
        ...formData,
        userId: loggedInUserId,
      };

      await axios.put(`${BASEURL2}/doc/updateDoctor`, updatedData);
      alert("Doctor updated successfully");
      getfun();
      setEditUserModel(false);
    } catch (error) {
      alert(error?.response?.data?.message || "We are unable to process your request right now. Please try again later.");
      console.error(error);
    } finally {
      setShowConfirmation(false);
    }
  };


  const handleCancel = () => setShowConfirmation(false);
  const handleCloseModal = () => setEditUserModel(false);

  // 🔹 Define the text/number/date fields dynamically
  const fields = [
        { label: "Doctor Name", name: "doctor_name" },
        { label: "Speciality", name: "speciality" },
        { label: "Assigned Employee Code", name: "empcode" },
        { label: "Qualification", name: "qualification" },
        { label: "Subarea", name: "subarea" },
        { label: "Grade", name: "grade" },
    ];

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog"
        style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
        <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
          <div
            className="modal-header"
            style={{ backgroundColor: "#0c509f", color: "#fff" }}
          >
            <h5 className="modal-title">Edit Employee</h5>
            <button onClick={handleCloseModal} type="button" className="close-but">
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                {/* 🔹 Dynamic Input Fields */}
                {fields.map((f) => (
                  <div className="form-group col-md-4" key={f.name}>
                    <label>{f.label}</label>
                    <input
                      type={f.type}
                      name={f.name}
                      value={formData[f.name] || ""}
                      onChange={handleChange}
                      className="form-control"
                      placeholder={f.label}
                    />
                  </div>
                ))}
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
          message="Are you sure you want to edit this employee?"
          onConfirm={() => handleConfirm()}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
