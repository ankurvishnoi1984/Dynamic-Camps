import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // if you use toast
import { BASEURL2 } from "../constant/constant";

const UploadCsvModal = ({ closeModal, deptId, getfun,userId }) => {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("deptId", deptId);
    formData.append("created_by", userId);

    try {
      const res = await axios.post(`${BASEURL2}/employee/bulkUpload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res?.data?.message || "Bulk Upload Successful ✅");
      getfun(); // refresh list
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


  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">

          <div className="modal-header bg-warning text-white">
            <h5 className="modal-title">Bulk Upload Employees</h5>
            <button type="button" className="close-but" onClick={closeModal}>
              <span>&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="text-center mt-3">
                <button type="submit" className="btn btn-warning">
                  Upload
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
