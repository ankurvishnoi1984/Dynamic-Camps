import "cropperjs/dist/cropper.css";
import "./AddDoctorModal.css";
import ReactDOM from "react-dom";
import { DeptId, BASEURL, BASEURL2 } from "../constant/constant"

export const InfoDoctorModal = ({ open, onClose, infoData }) => {

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
                                {/* <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    ref={fileInputRef}
                                /> */}

                                <div className="image-wrapper">
                                    <img
                                        src={`${BASEURL}/uploads/profile/${infoData.doctor_img}`}
                                        alt="Doctor"
                                        className="image-preview"

                                    />
                                </div>

                            </div>

                            {/* Form */}
                            <div className="form-grid">
                                <input placeholder="Doctor Name"
                                    type="text"
                                    value={infoData.doctor_name}
                                    disabled={true}
                                />
                                <input placeholder="Camp Date"
                                    type="date"
                                    value={infoData.camp_date}
                                    disabled={true}

                                />

                                <input placeholder="Camp Venue"
                                    type="text"
                                    value={infoData.camp_venue}
                                    disabled={true}

                                />

                                <input placeholder="Camp Time"
                                    type="time"
                                    value={infoData.camp_time}
                                    disabled={true}

                                />

                            </div>

                            {/* Actions */}
                            <div className="modal-actions">
                                <button className="secondary-btn" onClick={onClose}>
                                    Cancel
                                </button>
                                <button className="primary-btn"
                                //   onClick={handelAddDoctorData}
                                >
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
