import ReactDOM from "react-dom";
import Cropper from "react-cropper";
import { useRef } from "react";
import "./cropper.css";

const ImageCropperModal = ({ imageSrc, onClose, onSave }) => {
  const cropperRef = useRef(null);

  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      imageSmoothingQuality: "high",
    });

    // onSave(canvas.toDataURL("image/jpeg", 0.9));
    canvas.toBlob(
      (blob) => {
        onSave(blob); // 🔥 send Blob instead of Base64
      },
      "image/jpeg",
      0.9
    );

  };

  return ReactDOM.createPortal(
    <div className="addusermodel">
      <div className="">
        <Cropper
          ref={cropperRef}
          src={imageSrc}
          style={{ height: 400, width: "100%" }}
          viewMode={1}
          guides
          background
          autoCropArea={0.7}
          cropBoxMovable
          cropBoxResizable
        />

        <div className="cropper-actions">
          <button onClick={onClose} className="secondary-btn">
            Cancel
          </button>
          <button onClick={handleSave} className="primary-btn">
            Crop & Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropperModal;
