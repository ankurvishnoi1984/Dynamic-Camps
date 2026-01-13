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
    <div className="cropper-overlay">
      <div className="cropper-modal1">
        {/* Header */}
        <div className="cropper-header">
          <h3>Crop Image</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Cropper */}
        <div className="cropper-body">
          <Cropper
            ref={cropperRef}
            src={imageSrc}
            viewMode={1}
            guides={true}
            background={false}
            autoCropArea={0.8}
            responsive={true}
            checkOrientation={false}
            style={{ height: 350, width: "100%" }}
          />
        </div>

        {/* Footer */}
        <div className="cropper-footer">
          <button onClick={onClose} className="btn secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn primary">
            Crop & Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropperModal;
