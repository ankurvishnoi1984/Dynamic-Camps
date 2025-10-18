import React from "react";
import "./CustomPopup.css";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";

const CustomPopup = ({ type, message, onClose }) => {
  if (!message) return null; // don’t render if no message

  return (
    <div className="custom-popup-overlay-2">
      <div className={`custom-popup-container-2 ${type}`}>
        <button className="custom-popup-close-2" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="custom-popup-content-2">
          <span className="custom-popup-icon-2">
            {type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          </span>
          <span className="custom-popup-message-2">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default CustomPopup;
