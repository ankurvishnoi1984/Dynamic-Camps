import ConfirmationPopup from "../popup/Popup";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import {  BASEURL2 } from "../constant/constant";

export default function EditEmployeeModal({
  setEditUserModel,
  empData,
  getfun,
  handleInputChange,
  deptId,
}) {
  const [formData, setFormData] = useState(empData);


  const [seniorEmpcodes, setSeniorEmpcodes] = useState([]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const loggedInUserId = sessionStorage.getItem("userId");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const fetchSeniorEmpList = async () => {
    try {
      const res = await axios.post(
        `${BASEURL2}/employee/getSeniorEmpcodesByDesignation`,
        { designation: formData.designation,deptId:deptId }
      );
      setSeniorEmpcodes(res.data.seniors)
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
    }
  };

  useEffect(() => {
    if (formData.designation) {
      fetchSeniorEmpList();
    }
  }, [formData.designation]);


  const handleConfirm = async () => {
    // ✅ Field-specific validation
    if (!/^\d{5}$/.test(formData.empcode)) {
      toast.error("Employee code must be exactly 5 digits");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      toast.error("Name should contain only letters and spaces");
      return;
    }

    if (
      formData.email &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      const updatedData = {
        ...formData,
        user_id: empData.user_id,       // ✅ attach employee id being edited
        modified_by: loggedInUserId,    // ✅ attach logged-in user id
      };

      await axios.put(`${BASEURL2}/employee/updateEmp`, updatedData);
      toast.success("Employee updated successfully");
      getfun();
      setEditUserModel(false);
    } catch (error) {
      toast.error("Error updating employee");
      console.error(error);
    } finally {
      setShowConfirmation(false);
    }
  };


  const handleCancel = () => setShowConfirmation(false);
  const handleCloseModal = () => setEditUserModel(false);

  // 🔹 Define the text/number/date fields dynamically
  const fields = [
    { label: "Employee Name", name: "name", type: "text" },
    { label: "Employee Code", name: "empcode", type: "number" },
    // { label: "State", name: "state", type: "text" },
    { label: "HQ", name: "hq", type: "text" },
    { label: "Region", name: "region", type: "text" },
    // { label: "Username", name: "usernamehq", type: "text" },
    { label: "Password", name: "password", type: "text" },
    { label: "Mobile", name: "mobile", type: "number" },
    { label: "Email", name: "email", type: "email" },
    // { label: "Date of Birth", name: "dob", type: "date" },
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

                {/* 🔹 Zone Dropdown */}
                <div className="form-group col-md-4">
                  <label>Zone</label>
                  <select
                    name="zone"
                    value={formData.zone || ""}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select</option>
                    {["South", "North", "East", "West"].map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🔹 Designation Dropdown */}
                <div className="form-group col-md-4">
                  <label htmlFor="designation">Designation</label>
                  <select
                    id="designation"
                    name="designation"
                    className="form-control"
                    value={formData.designation}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    {[
                      "MARKETING EXECUTIVE",
                      "AREA BUSINESS MANAGER",
                      "SENIOR AREA BUSINESS MANAGER",
                      "REGIONAL MANAGER",
                      "SENIOR REGIONAL MANAGER",
                      "DIVISIONAL SALES MANAGER",
                      "ZONAL SALES MANAGER",
                      "SALES MANAGER",
                      "ASSOCIATE GENERAL MANAGER - SALES",
                      "NATIONAL SALES MANAGER",
                    ].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🔹 Reporting Dropdown */}
                <div className="form-group col-md-4">
                  <label>Reporting (Emp Code)</label>
                  <select
                    name="reporting"
                    value={formData.reporting || ""}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="">Select</option>
                    {seniorEmpcodes.map((d) => (
                      <option key={d.empcode} value={d.empcode}>
                        {d.name + " - " + d.empcode}
                      </option>
                    ))}
                  </select>
                </div>
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
          onConfirm={() => handleConfirm(empData.user_id)}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
