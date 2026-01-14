import { useState, useRef, useEffect } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./AddDoctorModal.css";
import ReactDOM from "react-dom";
import ImageCropperModal from "../Cropper/ImageCropperModal";
import { DeptId, BASEURL, BASEURL2 } from "../../constant/constant"
import toast from "react-hot-toast";
import axios from "axios";

export const AddDoctorModal = ({ open, onClose, getDoctorList }) => {
  const cropperRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const fileInputRef = useRef(null);
  const userId = sessionStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [doctorName, setDoctorName] = useState("")
  const [campDate, setCampDate] = useState("");
  const [venue, setVenue] = useState("");
  const [campTime, setCampTime] = useState("");
  const [speciality, setSpeciality] = useState("");


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    e.target.value = null; // 🔥 reset input
  };


  const handleCropSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      imageSmoothingQuality: "high",
    });

    const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(croppedImage);
    setImageSrc(null);
  };

  const handelAddDoctorData = async (event) => {
    event.preventDefault();
    // Validate required fields
    if (!doctorName || !preview || !campDate || !venue || !campTime) {
      toast.error("Missing Required Field");
      return;
    }



    try {
      const formData = new FormData();

      formData.append("doctorName", doctorName);
      formData.append("image", selectedFile);
      formData.append("campDate", campDate);
      formData.append("campTime", campTime);
      formData.append("campVenue", venue);
      formData.append("userId", userId);
      formData.append("speciality",speciality)
      formData.append("deptId", DeptId)
      const doctorResponse = await axios.post(
        `${BASEURL}/poster/addPosterDoctor`,
        formData
      );
      if (Number(doctorResponse?.data?.errorCode) === 1) {
        

        const docId = doctorResponse.data.docid;
        const posterReq = { docId, deptId: DeptId }
        try {
          const posterResponse = await axios.post(`${BASEURL}/poster/addPosterV2`, posterReq)
          toast.success("Poster generated")
        } catch (error) {
          toast.success("Something went wrong while generating poster", error)
        }

        toast.success("Doctor added successfully");
        getDoctorList();
        onClose();
        setDoctorName("");
        setPreview(null);
        setCampDate("");
        setCampTime("");
        setVenue("");
        setSpeciality("");
      }
    } catch (error) {
      console.error("Error in adding doctor:", error);
      toast.error("Error In Adding Doctor");
    }
  };




  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="addusermodel">
      <div className="modal fade show" style={{ display: "block" }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Doctor</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              {/* Image Upload / Preview */}
              <div className="image-section">

                {/* Hidden input ALWAYS present */}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />

                {preview ? (
                  <div className="image-wrapper">
                    <img
                      src={preview}
                      alt="Doctor"
                      className="image-preview"
                      onClick={() => setShowCropper(true)} // edit same image
                    />

                    <button
                      type="button"
                      className="change-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label
                    className="upload-box"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Photo
                  </label>
                )}
              </div>


              {/* Cropper */}
              {showCropper && (
                <ImageCropperModal
                  imageSrc={originalImage}
                  onClose={() => setShowCropper(false)}
                  /*onSave={(cropped) => {
                    setPreview(cropped);      // update preview
                    setShowCropper(false);
                  }}*/
                  onSave={(blob) => {
                    const file = new File([blob], "doctor.jpg", { type: "image/jpeg" });

                    setSelectedFile(file);          // 🔥 multer upload
                    setPreview(URL.createObjectURL(blob)); // 🔥 preview
                    setShowCropper(false);
                  }}

                />
              )}


              {/* Form */}
              <div className="form-grid">
                <input placeholder="Doctor Name"
                  type="text"
                  value={doctorName}
                  maxLength={30}
                  onChange={(e) => {
                    setDoctorName(e.target.value)
                  }}
                />

                <input placeholder="Speciality/Qualification"
                  type="text"
                  value={speciality}
                  onChange={(e) => {
                    setSpeciality(e.target.value)
                  }}
                />

                <input placeholder="Camp Date"
                  type="date"
                  value={campDate}
                  onChange={(e) => {
                    setCampDate(e.target.value)
                  }}
                />

                <input placeholder="Camp Venue"
                  type="text"
                  value={venue}
                  maxLength={16}
                  onChange={(e) => { setVenue(e.target.value) }}
                />

                <input placeholder="Camp Time"
                  type="time"
                  value={campTime}
                  onChange={(e) => { setCampTime(e.target.value) }}
                />

              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button className="secondary-btn" onClick={onClose}>
                  Cancel
                </button>
                <button className="primary-btn"
                  onClick={handelAddDoctorData}>
                  Save Doctor</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
