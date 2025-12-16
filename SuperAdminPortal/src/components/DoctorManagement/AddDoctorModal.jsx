// src/components/AddDoctorModal.jsx
import React from "react";
import ConfirmationPopup from "../popup/Popup";

const AddDoctorModal = ({
  show,
  onClose,
  formData,
  onChange,
  onSubmit,
  showConfirmation,
  handleAddConfirm,
  setShowConfirmation,
}) => {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">

          {/* HEADER */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Add Doctor</h5>
            <button onClick={onClose} type="button" className="close-but">
              <span>&times;</span>
            </button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            <form onSubmit={onSubmit}>
              <div className="form-row">

                {[
                  { label: "Doctor Name", name: "doctor_name", type: "text" },
                  { label: "Speciality", name: "speciality", type: "text" },
                  { label: "Garnet Code", name: "garnet_code", type: "text" },
                  { label: "Assigned Employee Code", name: "empcode", type: "text" },
                  { label: "Qualification", name: "qualification", type: "text" },
                  { label: "Subarea", name: "subarea", type: "text" },
                  { label: "Grade", name: "grade", type: "text" },
                ].map((field) => (
                  <div className="form-group col-md-4" key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      id={field.name}
                      value={formData[field.name]}
                      onChange={onChange}
                      className="form-control"
                    />
                  </div>
                ))}

                {/* RPS Flag */}
                {/* <div className="form-group col-md-4">
                  <label htmlFor="rps_flag">RPS Flag</label>
                  <select
                    id="rps_flag"
                    name="rps_flag"
                    className="form-control"
                    value={formData.rps_flag}
                    onChange={onChange}
                  >
                    <option value="RPS">RPS</option>
                    <option value="Non-RPS">Non-RPS</option>
                  </select>
                </div> */}

                {/* Status */}
                {/* <div className="form-group col-md-4">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={onChange}
                  >
                    <option value="Y">Active</option>
                    <option value="N">Inactive</option>
                  </select>
                </div> */}

              </div>

              <div className="text-center mt-3">
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
          message="Are you sure you want to add this Doctor?"
          onConfirm={handleAddConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default AddDoctorModal;
