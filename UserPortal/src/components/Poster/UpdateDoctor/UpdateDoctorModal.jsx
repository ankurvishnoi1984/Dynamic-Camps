import "cropperjs/dist/cropper.css";
// import "./AddDoctorModal.css";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BASEURL, BASEURL2, DeptId } from "../../constant/constant";
import axios from "axios";
import toast from "react-hot-toast";
import Select from "react-select";


export const UpdateDoctorModal = ({
  open,
  onClose,
  onSuccess,
  infoData,
}) => {
  const [formData, setFormData] = useState({
    doctorName: "",
    campDate: "",
    campTime: "",
    campVenue: "",
    doctorImg: "",
    doctorId: "",
    fkId: "",
    speciality:""
  });
  const [doctorList, setDoctorList] = useState([])
  const empId = sessionStorage.getItem("empId")


  useEffect(() => {
    if (infoData) {
      setFormData({
        doctorName: infoData.doctor_name || "",
        campDate: infoData.camp_date || "",
        campTime: infoData.camp_time || "",
        campVenue: infoData.camp_venue || "",
        doctorImg: infoData.doctor_img || "",
        doctorId: infoData.doctor_id,
        fkId: infoData.fk_id,
        speciality:infoData.doctor_qualification,
      });
    }
  }, [infoData]);

  const getDoctorList = async () => {
    try {
      const res = await axios.post(`${BASEURL2}/doc/getDoctorList`, { empcode: empId, deptId: DeptId });
      setDoctorList(res?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctorList();
  }, [])



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
      payload.append("speciality",formData.speciality)
      payload.append("campDate", formData.campDate);
      payload.append("campTime", formData.campTime);
      payload.append("campVenue", formData.campVenue);
      payload.append("doctorImg", formData.doctorImg);
      payload.append("doctorId", formData.doctorId);
      payload.append("userId", sessionStorage.getItem("userId"));
      payload.append("deptId", DeptId);
      payload.append("fkId", formData.fkId)


      const doctorResponse = await axios.post(
        `${BASEURL}/poster/updatePosterDoctor`,
        formData
      );
      if (Number(doctorResponse?.data?.errorCode) === 1) {



        const posterReq = { docId: infoData.doctor_id, deptId: DeptId }
        try {
          const posterResponse = await axios.post(`${BASEURL}/poster/addPosterV2`, posterReq)
          toast.success("Poster generated")
        } catch (error) {
          toast.success("Something went wrong while generating poster", error)
        }
        onSuccess();
        onClose();
        setFormData({
          doctorName: "",
          campDate: "",
          campTime: "",
          campVenue: "",
          doctorImg: "",
          doctorId: "",
          userId: "",
          fkId: "",
          speciality:""
        })
        getDoctorList();
        toast.success("Doctor added successfully");
      }
    } catch (error) {
      console.error("Error in adding doctor:", error);
      toast.error("Error In Adding Doctor");
    }
  };

  const doctorOptions = doctorList.map((d) => ({
    value: d.doctor_id,
    label: d.doctor_name,
  }));
  const handelDoctorChange = (selectedOption) => {
    const docId = selectedOption ? selectedOption.value : "";

    if (docId) {
      // console.log("docId",docId)
      // setFormData({ ...formData, fkId: docId })
      const doctor = doctorList.find((e) => e.doctor_id == docId);
      setFormData({...formData,doctorName:doctor.doctor_name,fkId:docId})
    } else {

    }
  };

  if (!open ) return null;


  return ReactDOM.createPortal(
    <div className="addusermodel">
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-dialog-centered">
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
                {/* <label className="section-label">Doctor Photo</label> */}

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

                {/* <div className="form-field">
                  <label>Doctor Name</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                  />
                </div> */}

                <div>
                  <label>Doctor Name</label>

                  <Select
                    options={doctorOptions}
                    value={doctorOptions.find((opt) => opt.value === formData.fkId) || null}
                    onChange={handelDoctorChange}
                    placeholder="Doctor Name*"
                    // styles={customStyles}
                    menuPosition="fixed"
                  />
                </div>




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

                <div className="form-field">
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
