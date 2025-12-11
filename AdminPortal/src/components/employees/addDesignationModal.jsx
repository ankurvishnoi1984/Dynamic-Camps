import React, { useState } from "react";
import axios from "axios";
import { BASEURL2, DEPTID } from "../constant/constant";

const AddDesignationModal = ({ show, onClose, onSuccess }) => {
  const [designations, setDesignations] = useState([
    { role_id: "", designation: "", dept_id: DEPTID,reporting:"",isTop:"" }
  ]);

  const handleAddRow = () => {
    setDesignations([
      ...designations,
      { role_id: "", designation: "", dept_id: DEPTID,reporting:"",isTop:"" }
    ]);
  };

  const handleRemoveRow = (index) => {
    const updated = [...designations];
    updated.splice(index, 1);
    setDesignations(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...designations];
    updated[index][field] = value;

    // If top hierarchy selected, force reporting = "Admin"
    if (field === "isTop" && value === "Y") {
      updated[index].reporting = "Admin";
    }

    // If changed back to "N", allow editing reporting again
    if (field === "isTop" && value === "N") {
      updated[index].reporting = "";
    }

    setDesignations(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BASEURL2}/designation/insertDesignations`, {
        designations: designations.map((d) => ({
          ...d,
          dept_id: DEPTID // Just to be safe, force override
        })),
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error("Error inserting designations:", err);
    }
  };

  if (!show) return null;

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
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-user-tie me-2"></i> Add Designations
              </h5>

              <button type="button" className="close" onClick={onClose}>
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              {designations.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-4 p-4 mb-4 bg-light position-relative"
                >
                  <div className="row g-3">

                    <div className="col-md-3">
                      <label className="fw-semibold text-secondary">Role ID</label>
                      <input
                        type="number"
                        className="form-control rounded-pill"
                        value={item.role_id}
                        onChange={(e) =>
                          handleChange(index, "role_id", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-md-5">
                      <label className="fw-semibold text-secondary">Designation</label>
                      <input
                        type="text"
                        className="form-control rounded-pill"
                        value={item.designation}
                        onChange={(e) =>
                          handleChange(index, "designation", e.target.value)
                        }
                        required
                      />
                    </div>

                    {item.isTop !== "Y" && (
                      <div className="col-md-3">
                        <label className="fw-semibold text-secondary">Reporting</label>
                        <input
                          type="text"
                          className="form-control rounded-pill"
                          value={item.reporting}
                          onChange={(e) =>
                            handleChange(index, "reporting", e.target.value)
                          }
                        />
                      </div>
                    )} 

                    <div className="col-md-3 mt-3">
                      <label className="fw-semibold text-secondary">Is Top Hierarchy</label>
                      <select
                        className="form-select form-control rounded-pill"
                        value={item.isTop}
                        onChange={(e) =>
                          handleChange(index, "isTop", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    </div>    
                    
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm position-absolute rounded-pill"
                    style={{ top: "12px", right: "12px" }}
                    onClick={() => handleRemoveRow(index)}
                    disabled={designations.length === 1}
                  >
                    <i className="fas fa-trash-alt"></i> Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={handleAddRow}
              >
                <i className="fas fa-plus me-2"></i> Add More
              </button>
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4"
                onClick={onClose}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-success rounded-pill px-4">
                <i className="fas fa-save me-2"></i> Save All
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDesignationModal;
