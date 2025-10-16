import React, { useState } from "react";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";
import "./CustomCss.css";

const CathlabComment = ({
  crid,
  show,
  handelCloseModal,
  campReportList,
  actionType,
  getMyCampDetailsByEmpcode,
  setPopup,
}) => {
  const campData = campReportList.find(
    (el) => Number(el.crid) === Number(crid)
  );

  const role = sessionStorage.getItem("role");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Get dynamic messages
  const getSuccessMessage = () => {
    if (actionType === 1) return "Camp approved";
    if (actionType === 2) return "Camp rejected";
    if (actionType === 3) return "Camp sent for reconsideration";
    return "Camp updated successfully";
  };

  const handleSubmit = async () => {
    // 🔹 Validation: remarks mandatory when NOT approve
    if (actionType !== 1 && !comment.trim()) {
      setMessage({ type: "error", text: "Remarks are required" });
      return;
    }

    try {
      const approvalRes = await axios.post(
        `${BASEURL2}/admin/approveCathlabRequest`,
        {
          designation: sessionStorage.getItem("designation"),
          role,
          crid,
          action: actionType,
        }
      );

      if (Number(approvalRes.data.errorCode) === 1) {
        const payload = { crid, role, comment };
        const commentRes = await axios.post(
          `${BASEURL2}/admin/submitCampComment`,
          payload
        );

        if (Number(commentRes.data.errorCode) === 1) {
          const successMsg = getSuccessMessage();
          setMessage({ type: "success", text: successMsg });
          setComment("");

          if (typeof getMyCampDetailsByEmpcode === "function") {
            getMyCampDetailsByEmpcode();
          }

          if (typeof setPopup === "function") {
            setPopup(successMsg);
          }

          handelCloseModal();
        } else {
          const errMsg = commentRes.data.message || "Failed to submit comment";
          setMessage({ type: "error", text: errMsg });
          if (typeof setPopup === "function") {
            setPopup(errMsg);
          }
          handelCloseModal();
        }
      } else {
        const errMsg = approvalRes.data.message || "Approval failed";
        setMessage({ type: "error", text: errMsg });
        if (typeof setPopup === "function") {
          setPopup(errMsg);
        }
        handelCloseModal();
      }
    } catch (error) {
      console.error(error);
      const errMsg = "An error occurred while processing request";
      setMessage({ type: "error", text: errMsg });
      if (typeof setPopup === "function") {
        setPopup(errMsg);
      }
      handelCloseModal();
    }
  };

  if (!show) return null;

  return (
    <div className="custom-modal-backdrop">
      <div className="custom-modal">
        <div className="custom-modal-header">
          <h5>
            {actionType === 1 ? "Add Remarks (Optional)" : "Add Remarks"}
          </h5>
          <button
            type="button"
            className="close-btn"
            onClick={handelCloseModal}
          >
            ×
          </button>
        </div>

        <div className="custom-modal-body">
          <form className="g-3">
            <div className="form-group col-md-12 did-floating-label-content">
              <input
                type="text"
                className="form-control did-floating-input"
                placeholder="Please provide remarks"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {message.text && (
              <div
                className={`message-box ${
                  message.type === "success" ? "text-success" : "text-danger"
                } mt-2`}
              >
                {message.text}
              </div>
            )}

            <div className="btn-wrapper text-center">
              <button
                type="button"
                className="btn-submit mx-auto"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CathlabComment;
