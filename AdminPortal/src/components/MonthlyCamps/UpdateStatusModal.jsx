import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";

const UpdateStatusModal = ({ show, onClose, campName, newStatus, onConfirm }) => {
  if (!show) return null;

  const isActivating = newStatus === "Y";
  const statusText = isActivating ? "Activate" : "Deactivate";
  const statusColor = isActivating ? "success" : "danger";

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        className="modal-backdrop d-flex align-items-center justify-content-center"
        style={{
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 1050,
          position: "fixed",
          inset: 0,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-dialog modal-dialog-centered"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="modal-content border-0 shadow-lg"
            style={{
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              className={`modal-header bg-${statusColor} text-white`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.25rem",
              }}
            >
              <h5 className="modal-title fw-bold d-flex align-items-center mb-0">
                <FaExclamationTriangle className="me-2" />
                Confirm {statusText}
              </h5>
              <button
             type="button"
                className="close text-white"
                onClick={onClose}
                aria-label="Close"
              >   <span>&times;</span></button>
            </div>

            {/* Body */}
            <div className="modal-body text-center py-4">
              <p className="fw-semibold text-secondary mb-2 fs-5">
                Are you sure you want to{" "}
                <strong className={`text-${statusColor}`}>{statusText}</strong> the camp:
              </p>
              <h5 className="text-primary fw-bold mb-0">“{campName}”</h5>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 justify-content-center pb-4">
              <button
                className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold"
                onClick={onClose}
              >
                No, Cancel
              </button>
              <button
                className={`btn btn-${statusColor} rounded-pill px-4 py-2 fw-semibold shadow-sm`}
                onClick={onConfirm}
              >
                Yes, {statusText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateStatusModal;
