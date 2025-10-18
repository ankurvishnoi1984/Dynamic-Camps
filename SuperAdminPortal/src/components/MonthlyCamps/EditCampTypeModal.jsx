import React, { useEffect, useState } from "react";
import axios from "axios"; // adjust to your actual config path
import { BASEURL2 } from "../constant/constant";

const EditCampTypeModal = ({
  setEditModal,
  editData = null,      // when editing, pass the camp_type object here
  userId,               // current logged-in user's ID
  onSuccess,            // callback to refresh parent list
}) => {
  const [campTypeName, setCampTypeName] = useState("");
  const [fields, setFields] = useState([]);

  // 🧠 Initialize modal data
  useEffect(() => {
    if (editData) {
      setCampTypeName(editData.camp_type_name || "");
      setFields(
        (editData.fields || []).map((f) => ({
          field_id: f.field_id,
          label: f.label || "",
          field_type: f.field_type || "text",
          is_required: f.is_required || "N",
          options_json: f.options_json || "",
          order_index: f.order_index || 1,
        }))
      );
    } else {
      // For add mode
      setCampTypeName("");
      setFields([
        {
          label: "",
          field_type: "text",
          is_required: "N",
          options_json: "",
          order_index: 1,
        },
      ]);
    }
  }, [editData, setEditModal]);

  // 🧠 Handle field changes
  const handleFieldChange = (index, key, value) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  // ➕ Add a new field
  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      {
        label: "",
        field_type: "text",
        is_required: "N",
        options_json: "",
        order_index: prev.length + 1,
      },
    ]);
  };

  // ❌ Remove field
  const handleRemoveField = (index) => {
    if (window.confirm("Are you sure you want to remove this field?")) {
      setFields((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // 💾 Submit (Callback-style, no async/await)
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      camp_type_id: editData?.camp_type_id || null,
      camp_type_name: campTypeName.trim(),
      userId: userId,
      fields: fields.map((f) => ({
        field_id: f.field_id || null,
        label: f.label.trim(),
        field_type: f.field_type,
        is_required: f.is_required,
        options_json: f.options_json,
        order_index: f.order_index,
      })),
    };

    const endpoint = `${BASEURL2}/monthlyCamps/updateCampType`

    axios
      .post(endpoint, payload)
      .then((res) => {
        alert(res.data.message || "Camp Type saved successfully!");
        setEditModal(false);
        if (onSuccess) onSuccess(); // refresh parent
      })
      .catch((err) => {
        console.error("Error saving camp type:", err);
        alert("Error while saving camp type");
      });
  };

  // 🧱 Modal JSX
  if (!setEditModal) return null;

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
                <i className="fas fa-toolbox me-2"></i>{" "}
                {"Edit Camp Type Configuration"}
              </h5>
              <button
                type="button"
                className="close text-white"
                onClick={() => setEditModal(false)}
              >
                <span>&times;</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group mb-4">
                <label className="fw-semibold text-secondary">Camp Type Name</label>
                <input
                  type="text"
                  className="form-control rounded-pill px-3"
                  placeholder="Enter camp type name..."
                  value={campTypeName}
                  onChange={(e) => setCampTypeName(e.target.value)}
                  required
                />
              </div>

              <h6 className="mt-3 mb-3 fw-bold text-primary">
                <i className="fas fa-sliders-h me-2"></i> Field Configurations
              </h6>

              {fields.map((field, index) => (
                <div
                  key={index}
                  className="field-card border rounded-4 p-4 mb-4 bg-light position-relative"
                >
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="fw-semibold text-secondary">Label</label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        value={field.label}
                        onChange={(e) =>
                          handleFieldChange(index, "label", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="fw-semibold text-secondary">Field Type</label>
                      <select
                        className="form-select form-control rounded-pill"
                        value={field.field_type}
                        onChange={(e) =>
                          handleFieldChange(index, "field_type", e.target.value)
                        }
                      >
                        <option value="text">Text</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="image">Image</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                    </div>

                    <div className="col-md-2">
                      <label className="fw-semibold text-secondary">Required</label>
                      <select
                        className="form-select form-control rounded-pill"
                        value={field.is_required}
                        onChange={(e) =>
                          handleFieldChange(index, "is_required", e.target.value)
                        }
                      >
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    </div>

                    <div className="col-md-2">
                      <label className="fw-semibold text-secondary">Order</label>
                      <input
                        type="number"
                        className="form-control rounded-pill text-center"
                        value={field.order_index}
                        onChange={(e) =>
                          handleFieldChange(index, "order_index", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {field.field_type === "dropdown" && (
                    <div className="mt-3">
                      <label className="fw-semibold text-secondary">
                        Dropdown Options (comma separated)
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-pill px-3"
                        placeholder="e.g. Option1, Option2, Option3"
                        value={field.options_json || ""}
                        onChange={(e) =>
                          handleFieldChange(index, "options_json", e.target.value)
                        }
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm position-absolute rounded-pill"
                    style={{ top: "12px", right: "12px" }}
                    onClick={() => handleRemoveField(index)}
                    disabled={fields.length === 1}
                  >
                    <i className="fas fa-trash-alt"></i> Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary rounded-pill px-4"
                onClick={handleAddField}
              >
                <i className="fas fa-plus me-2"></i> Add Field
              </button>
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-danger rounded-pill px-4"
                onClick={() => setEditModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-success rounded-pill px-4">
                <i className="fas fa-save me-2"></i> Save Configuration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCampTypeModal;
