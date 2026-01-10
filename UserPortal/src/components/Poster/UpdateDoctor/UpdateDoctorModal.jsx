import "cropperjs/dist/cropper.css";
// import "./AddDoctorModal.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BASEURL, DeptId } from "../../constant/constant";
import axios from "axios";
import toast from "react-hot-toast";

export const UpdateDoctorModal = ({
  open,
  onClose,
  doctorData,
}) => {
  const [formData, setFormData] = useState({
    doctorName: "",
    campDate: "",
    campTime: "",
    campVenue: "",
    doctorImg: "",
    doctorId: "",
  });

  useEffect(() => {
    if (doctorData) {
      setFormData({
        doctorName: doctorData.doctor_name || "",
        campDate: doctorData.camp_date || "",
        campTime: doctorData.camp_time || "",
        campVenue: doctorData.camp_venue || "",
        doctorImg: doctorData.doctor_img || "",
        doctorId: doctorData.doctor_id,
      });
    }
  }, [doctorData]);

  if (!open || !doctorData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Validate required fields
    if (!formData.doctorName || !formData.doctorImg || !formData.campDate || !formData.campVenue || !formData.campTime) {
      toast.error("Missing Required Field");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("doctorName", formData.doctorName);
      payload.append("campDate", formData.campDate);
      payload.append("campTime", formData.campTime);
      payload.append("campVenue", formData.campVenue);
      payload.append("doctorImg", formData.doctorImg);
      payload.append("doctorId", formData.doctorId);
      payload.append("userId", sessionStorage.getItem("userId"));
      payload.append("deptId", DeptId);



      const doctorResponse = await axios.post(
        `${BASEURL}/poster/updatePosterDoctor`,
        formData
      );
      if (Number(doctorResponse?.data?.errorCode) === 1) {
        setFormData({
          doctorName: "",
          campDate: "",
          campTime: "",
          campVenue: "",
          doctorImg: "",
          doctorId: "",
          userId: ""
        })


        const posterReq = { docId: doctorData.doctor_id, deptId: DeptId }
        try {
          const posterResponse = await axios.post(`${BASEURL}/poster/addPoster`, posterReq)
          toast.success("Poster generated")
        } catch (error) {
          toast.success("Something went wrong while generating poster", error)
        }

        toast.success("Doctor added successfully");
        getDoctorList();
        onClose();
      }
    } catch (error) {
      console.error("Error in adding doctor:", error);
      toast.error("Error In Adding Doctor");
    }
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
                    src={`${BASEURL}/uploads/profile/${formData.doctorImg}`}
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
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                  />
                </div>

                {/* <div className="form-field">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="doctor_qualification"
                    value={formData.doctor_qualification}
                    onChange={handleChange}
                  />
                </div> */}

                <div className="form-field">
                  <label>Camp Date</label>
                  <input
                    type="date"
                    name="campDate"
                    value={formData.campDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field">
                  <label>Camp Time</label>
                  <input
                    type="time"
                    name="campTime"
                    value={formData.campTime}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Camp Venue</label>
                  <input
                    type="text"
                    name="campVenue"
                    value={formData.campVenue}
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
