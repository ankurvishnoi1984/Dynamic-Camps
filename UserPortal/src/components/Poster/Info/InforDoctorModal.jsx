import "cropperjs/dist/cropper.css";
import "./InfoModal.css";
import ReactDOM from "react-dom";
import { BASEURL } from "../../constant/constant";

export const InfoDoctorModal = ({ open, onClose, infoData }) => {
    if (!open || !infoData) return null;

    return ReactDOM.createPortal(
        <div className="addusermodel">
            <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">

                        {/* HEADER */}
                        <div className="modal-header">
                            <h5 className="modal-title">Doctor Details</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                            />
                        </div>

                        {/* BODY */}
                        <div className="modal-body">

                            {/* Doctor Image */}
                            <div className="image-section">
                                <label className="section-label">Doctor Photo</label>

                                <div className="image-wrapper">
                                    <img
                                        src={`${BASEURL}/uploads/profile/${infoData.doctor_img}`}
                                        alt={infoData.doctor_name || "Doctor"}
                                        className="image-preview"
                                    />
                                </div>
                            </div>

                            {/* Doctor Info */}
                            <div className="form-grid read-only-grid">

                                <div className="form-field">
                                    <label>Doctor Name</label>
                                    <span>{infoData.doctor_name || "-"}</span>
                                </div>

                                <div className="form-field">
                                    <label>Qualification</label>
                                    <span>{infoData.doctor_qualification || "-"}</span>
                                </div>

                                <div className="form-field">
                                    <label>Camp Date</label>
                                    <span>{infoData.camp_date || "-"}</span>
                                </div>

                                <div className="form-field">
                                    <label>Camp Time</label>
                                    <span>{infoData.camp_time || "-"}</span>
                                </div>

                                <div className="form-field full-width">
                                    <label>Camp Venue</label>
                                    <span>{infoData.camp_venue || "-"}</span>
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="modal-footer">
                            <button
                                className="secondary-btn"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
