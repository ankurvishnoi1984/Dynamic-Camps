import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASEURL2 } from "../constant/constant";
import "./doctor.css"

export default function UploadDoctorCsvModal({ closeModal, refreshList,deptId }) {
  const [file, setFile] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [resultRows, setResultRows] = useState([]);
  const userId = sessionStorage.getItem("userId");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("deptId", deptId);

    try {
      const res = await axios.post(
        `${BASEURL2}/doc/doctorCSVUpsert`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert(res.data.message);

      setSuccessCount(res.data.successCount || 0);
      setFailedCount(res.data.failedCount || 0);

      const combined = [
        ...(res.data.successList || []),
        ...(res.data.failedList || [])
      ];

      setResultRows(combined);

      refreshList();
      
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "We are unable to process your request right now. Please try again later.");
    }
  };

  const handleDownloadSampleCSV = () => {
    const requiredColumns = [
      "doctor_name",
      "empcode",
      "speciality",
      "qualification",
    ];

    const csvHeader = requiredColumns.join(",") + "\n";
    const blob = new Blob([csvHeader], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_doctors.csv");
    link.click();

    URL.revokeObjectURL(url);
  };

  const downloadCombinedCSV = () => {
    if (resultRows.length === 0) return toast.error("No results to download");

    const headers = Object.keys(resultRows[0]).join(",") + "\n";
    const rows = resultRows
      .map((r) =>
        Object.values(r)
          .map((v) => `"${v}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "doctor_upload_results.csv");
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-primary text-white rounded-top-4">
            <h5 className="modal-title fw-bold">Upload Doctor CSV</h5>
            <button
              type="button"
              className="close-but"
              onClick={closeModal}
            >
              ×
            </button>
          </div>

          <div className="modal-body px-4 py-4">
            
            {/* DOWNLOAD TEMPLATE BUTTON */}
            <button
              type="button"
              className="btn btn-outline-success w-100 mb-3"
              onClick={handleDownloadSampleCSV}
            >
              <i className="fas fa-download me-2"></i>
              Download Sample CSV Template
            </button>

            {/* FILE UPLOAD */}
            <form onSubmit={handleUpload}>
              <label className="form-label fw-semibold">Select Doctor CSV File</label>

              <div
                className="upload-box text-center p-4 mb-3 border border-2 border-dashed rounded-3"
                onClick={() => document.getElementById("doctorFileInput").click()}
              >
                <i className="fas fa-file-csv fa-3x text-primary mb-2"></i>

                <p className="mb-0">
                  {file ? (
                    <span className="text-primary fw-semibold">{file.name}</span>
                  ) : (
                    <span className="text-muted">Click to select a CSV file</span>
                  )}
                </p>

                <input
                  id="doctorFileInput"
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

            {/* UPLOAD RESULT SECTION */}
            {(failedCount > 0 || successCount > 0) && (
              <div className="mt-4">
                <div className="result-card result-combined p-3">

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <h6 className="mb-1">
                        <b><span className="status-badge status-failed">Failed: {failedCount}</span></b>
                        <span className="mx-2"></span>
                        <span className="status-badge status-success">Success: {successCount}</span>
                      </h6>
                      <small className="text-muted">Upload results summary</small>
                    </div>

                    <button
                      className="btn btn-outline-primary result-download-btn"
                      onClick={downloadCombinedCSV}
                      type="button"
                    >
                      <i className="fas fa-download"></i> Download Results
                    </button>
                  </div>

                  <p className="text-muted small">
                    The CSV includes all processed rows with <b>Status</b> and <b>Remark</b> columns.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
