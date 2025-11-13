import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./employee.css";
import { BASEURL2 } from "../constant/constant";

const UploadCsvModal = ({ closeModal, deptId, getfun, userId }) => {
  const [file, setFile] = useState(null);
  const empcode = sessionStorage.getItem("empcode");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("deptId", deptId);
    formData.append("created_by", userId);
    formData.append("empcode", empcode);

    try {
      const res = await axios.post(`${BASEURL2}/employee/bulkUpload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.info(res?.data?.message || "Employee data uploaded infofully ✅");
      getfun();
      closeModal();
    } catch (err) {
      console.log(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Upload Failed ❌";
      toast.error(msg);
    }
  };

  const handleDownloadSampleCSV = () => {
    const requiredColumns = [
      "empcode",
      "name",
      "designation",
      "reporting",
      "mobile",
      "email",
      "password",
      "state",
      "region",
      "hq",
    ];

    const csvHeader = requiredColumns.join(",") + "\n";
    const blob = new Blob([csvHeader], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "sample_employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-primary text-white rounded-top-4">
            <h5 className="modal-title fw-bold">Upload Employee Data</h5>
          <button type="button" className="close-but" onClick={closeModal}> <span>&times;</span> </button>
          </div>

          <div className="modal-body px-4 py-4">
            <button
              type="button"
              className="btn btn-outline-success w-100 mb-3"
              onClick={handleDownloadSampleCSV}
            >
              <i className="fas fa-download me-2"></i>
              Download Sample Template
            </button>

            <form onSubmit={handleUpload}>
              <label className="form-label fw-semibold">
                Select Employee CSV File
              </label>

              <div
                className="upload-box text-center p-4 mb-3 border border-2 border-dashed rounded-3"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <i className="fas fa-file-csv fa-3x text-primary mb-2"></i>
                <p className="mb-0">
                  {file ? (
                    <span className="text-primary fw-semibold">
                      {file.name}
                    </span>
                  ) : (
                    <span className="text-muted">
                      Click to select a CSV file
                    </span>
                  )}
                </p>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="text-center">
               
                <button type="submit" className="btn btn-primary px-4">
                  <i className="fas fa-upload me-2"></i> Start Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCsvModal;
