import ConfirmationPopup from "../popup/Popup";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";

export default function InfoEmpModal({ setInfoUserModel, empData }) {
  const [formData, setFormData] = useState(empData);
  const [seniorEmpcodes, setSeniorEmpcodes] = useState([]);
  const [reportingEmp, setReportingEmp] = useState(null);

  const handleCloseModal = () => setInfoUserModel(false);

  // 🔹 Fetch senior employee list by designation
  const fetchSeniorEmpList = async () => {
    try {
      const res = await axios.post(
        `${BASEURL2}/employee/getSeniorEmpcodesByDesignation`,
        { designation: formData.designation }
      );
      setSeniorEmpcodes(res.data.seniors);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
    }
  };

  // 🔹 Fetch seniors when designation changes
  useEffect(() => {
    if (formData.designation) {
      fetchSeniorEmpList();
    }
  }, [formData.designation]);

  // 🔹 Update reporting employee info when list or reporting code changes
  useEffect(() => {
    if (seniorEmpcodes.length > 0 && formData.reporting) {
      const emp = seniorEmpcodes.find(
        (d) => String(d.empcode) === String(formData.reporting)
      );
      setReportingEmp(emp || null);
    }
  }, [seniorEmpcodes, formData.reporting]);

  const fields = [
    { label: "Employee Name", name: "name" },
    { label: "Employee Code", name: "empcode" },
    { label: "HQ", name: "hq" },
    { label: "Region", name: "region" },
    // { label: "Username", name: "usernamehq" },
    { label: "Password", name: "password" },
    { label: "Mobile", name: "mobile" },
    { label: "Email", name: "email" },
  ];

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
        <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
          <div
            className="modal-header"
            style={{ backgroundColor: "#0c509f", color: "#fff" }}
          >
            <h5 className="modal-title">Employee Info</h5>
            <button
              onClick={handleCloseModal}
              type="button"
              className="close-but"
            >
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="form-row">
              {/* 🔹 Basic Fields */}
              {fields.map((f) => (
                <div className="form-group col-md-4" key={f.name}>
                  <label>{f.label}</label>
                  <input
                    type="text"
                    name={f.name}
                    value={formData[f.name] || ""}
                    className="form-control"
                    disabled
                  />
                </div>
              ))}

              {/* 🔹 Zone */}
              <div className="form-group col-md-4">
                <label>Zone</label>
                <input
                  type="text"
                  value={formData.zone || ""}
                  className="form-control"
                  disabled
                />
              </div>

              {/* 🔹 Designation */}
              <div className="form-group col-md-4">
                <label>Designation</label>
                <input
                  type="text"
                  value={formData.designation || ""}
                  className="form-control"
                  disabled
                />
              </div>

              {/* 🔹 Reporting */}
              <div className="form-group col-md-6">
                <label>Reporting</label>
                <input
                  type="text"
                  value={
                    reportingEmp
                      ? `${reportingEmp.name} - ${reportingEmp.empcode}`
                      : formData.reporting || ""
                  }
                  className="form-control"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
