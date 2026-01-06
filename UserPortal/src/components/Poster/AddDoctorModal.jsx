import { useState, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./AddDoctorModal.css";
import ReactDOM from "react-dom";
import ImageCropperModal from "./ImageCropperModal";

export const AddDoctorModal = ({ open, onClose }) => {
  const cropperRef = useRef(null);

const [imageSrc, setImageSrc] = useState(null);
const [preview, setPreview] = useState(null);
const [showCropper, setShowCropper] = useState(false);
const [originalImage, setOriginalImage] = useState(null);
const fileInputRef = useRef(null);

const handleImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

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
    onSave={(cropped) => {
      setPreview(cropped);      // update preview
      setShowCropper(false);
    }}
  />
)}


              {/* Form */}
              <div className="form-grid">
                <input placeholder="Doctor Name" />
                <input placeholder="Speciality" />
                <input placeholder="Mobile Number" />
                <input placeholder="City" />
                <input placeholder="State" />
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button className="secondary-btn" onClick={onClose}>
                  Cancel
                </button>
                <button className="primary-btn">Save Doctor</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
