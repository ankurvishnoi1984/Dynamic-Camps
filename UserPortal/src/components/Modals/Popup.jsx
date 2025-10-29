import React from "react";
import "./CustomCss.css";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";

const Popup = ({ type, message, onClose }) => {
    console.log("type is",type);
    
  return (
    <div className="popup-overlay">
      <div className={`popup-container ${type}`}>
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="popup-content">
          <span className="popup-icon">
         {String(type).toLowerCase() === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
          </span>
          <span className="popup-message">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default Popup;
