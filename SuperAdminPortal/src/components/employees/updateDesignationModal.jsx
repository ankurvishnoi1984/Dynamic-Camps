import axios from "axios";
import { useEffect, useState } from "react";
import { BASEURL2 } from "../constant/constant";

const UpdateDesignationModal = ({ show, onClose, onSuccess, data,deptId }) => {

  const [designations, setDesignations] = useState([]);

  useEffect(() => {
    if (data) {
      // Load existing designations into modal state
      setDesignations(
        data.map((d) => ({
          ...d,
          isTop: d.is_top_hierarchy,
        }))
      );
    }
  }, [data]);

  const handleChange = (index, field, value) => {
    const updated = [...designations];
    updated[index][field] = value;

    if (field === "isTop") {
      if (value === "Y") {
        updated[index].reporting = "Admin";

        // Only one row can be Top
        updated.forEach((item, i) => {
          if (i !== index) {
            item.isTop = "N";
            if (item.reporting === "Admin") item.reporting = "";
          }
        });

      } else if (value === "N") {
        updated[index].reporting = "";
      }
    }

    setDesignations(updated);
  };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.put(`${BASEURL2}/designation/updateDesignations`, {
                designations: designations.map((d) => ({
                    id: d.id,
                    role_id: d.role_id,
                    designation: d.designation,
                    reporting: d.reporting,
                    is_top_hierarchy: d.isTop,
                    status: d.status,
                    dept_id: d.dept_id
                }))
            });

            if (Number(res.data.errorCode) === 1) {
                alert("Updated Successfully")
            }
            onClose();

        } catch (error) {
            alert(error.data.err || "Update failed:")
            console.error("Update failed:", error);
        }
    };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content rounded-4">

          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-warning text-dark rounded-top-4">
              <h5 className="modal-title fw-bold">
                <i className="fas fa-edit me-2"></i> Update Designations
              </h5>
              <button className="close" onClick={onClose}><span>&times;</span></button>
            </div>

            <div className="modal-body">
              {designations.map((item, index) => (
                <div key={index} className="border rounded-4 p-4 mb-4 bg-light">

                  <div className="row g-3">

                    <div className="col-md-3">
                      <label>Role ID</label>
                      <input
                        type="number"
                        className="form-control rounded-pill"
                        value={item.role_id}
                        onChange={(e) =>
                          handleChange(index, "role_id", e.target.value)
                        }
                      />
                    </div>

                    <div className="col-md-5">
                      <label>Designation</label>
                      <input
                        type="text"
                        className="form-control rounded-pill"
                        value={item.designation}
                        onChange={(e) =>
                          handleChange(index, "designation", e.target.value)
                        }
                      />
                    </div>

                    {item.isTop !== "Y" && (
                      <div className="col-md-3">
                        <label>Reporting</label>
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

                    {item.isTop === "Y" && (
                      <div className="col-md-3">
                        <label>Reporting</label>
                        <input
                          type="text"
                          className="form-control rounded-pill bg-secondary text-white"
                          value="Admin"
                          disabled
                        />
                      </div>
                    )}

                    <div className="col-md-3 mt-3">
                      <label>Is Top Hierarchy</label>
                      <select
                        className="form-select rounded-pill"
                        value={item.isTop}
                        onChange={(e) =>
                          handleChange(index, "isTop", e.target.value)
                        }
                      >
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer border-0">
              <button className="btn btn-danger rounded-pill" onClick={onClose}>
                Cancel
              </button>

              <button type="submit" className="btn btn-success rounded-pill px-4">
                <i className="fas fa-save me-2"></i> Update All
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
export default UpdateDesignationModal