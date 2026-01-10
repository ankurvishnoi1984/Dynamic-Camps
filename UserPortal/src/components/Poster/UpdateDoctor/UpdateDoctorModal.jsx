import "cropperjs/dist/cropper.css";
// import "./AddDoctorModal.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BASEURL } from "../../constant/constant";

export const UpdateDoctorModal = ({
  open,
  onClose,
  doctorData,
}) => {
  const [formData, setFormData] = useState({
    doctor_name: "",
    doctor_qualification: "",
    camp_date: "",
    camp_time: "",
    camp_venue: "",
    doctor_img: "",
  });

  useEffect(() => {
    if (doctorData) {
      setFormData({
        doctor_name: doctorData.doctor_name || "",
        doctor_qualification: doctorData.doctor_qualification || "",
        camp_date: doctorData.camp_date || "",
        camp_time: doctorData.camp_time || "",
        camp_venue: doctorData.camp_venue || "",
        doctor_img: doctorData.doctor_img || "",
      });
    }
  }, [doctorData]);

  if (!open || !doctorData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    handleUpdate({
      ...formData,
      doctor_id: doctorData.doctor_id,
    });
  };

  
  return ReactDOM.createPortal(
    <div className="addusermodel">
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">Update Doctor</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* Image Preview */}
              <div className="image-section">
                <label className="section-label">Doctor Photo</label>

                <div className="image-wrapper">
                  <img
                    src={`${BASEURL}/uploads/profile/${formData.doctor_img}`}
                    alt="Doctor"
                    className="image-preview"
                  />
                </div>
              </div>

              {/* FORM */}
              <div className="form-grid">

                <div className="form-field">
                  <label>Doctor Name</label>
                  <input
                    type="text"
                    name="doctor_name"
                    value={formData.doctor_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="doctor_qualification"
                    value={formData.doctor_qualification}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Camp Date</label>
                  <input
                    type="date"
                    name="camp_date"
                    value={formData.camp_date}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Camp Time</label>
                  <input
                    type="time"
                    name="camp_time"
                    value={formData.camp_time}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Camp Venue</label>
                  <input
                    type="text"
                    name="camp_venue"
                    value={formData.camp_venue}
                    onChange={handleChange}
                  />
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleSubmit}>
                Update Doctor
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
