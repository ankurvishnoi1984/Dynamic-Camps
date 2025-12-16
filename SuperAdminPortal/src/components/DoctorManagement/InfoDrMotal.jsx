import ConfirmationPopup from "../popup/Popup";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { BASEURL2 } from "../constant/constant";

export default function InfoDrModal({ setInfoUserModel, empData }) {

    const handleCloseModal = () => setInfoUserModel(false);

    // 🔹 Fetch seniors when designation changes
    //   useEffect(() => {
    //     if (formData.designation) {
    //       fetchSeniorEmpList();
    //     }
    //   }, [formData.designation]);

    // 🔹 Update reporting employee info when list or reporting code changes
    //   useEffect(() => {
    //     if (seniorEmpcodes.length > 0 && formData.reporting) {
    //       const emp = seniorEmpcodes.find(
    //         (d) => String(d.empcode) === String(formData.reporting)
    //       );
    //       setReportingEmp(emp || null);
    //     }
    //   }, [seniorEmpcodes, formData.reporting]);

    const fields = [
        { label: "Doctor Name", name: "doctor_name" },
        { label: "Speciality", name: "speciality" },
        { label: "Garnet Code", name: "garnet_code" },
        { label: "Assigned Employee Code", name: "empcode" },
        { label: "Qualification", name: "qualification" },
        { label: "Subarea", name: "subarea" },
        { label: "Grade", name: "grade" },
    ];

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ background: "rgba(0,0,0,0.5)" }}
        >
            <div
                className="modal-dialog modal-lg modal-dialog-centered"
                role="document"
            >
                <div className="modal-content shadow-lg border-0 rounded-4 animate-modal">
                    <div
                        className="modal-header"
                        style={{ backgroundColor: "#0c509f", color: "#fff" }}
                    >
                        <h5 className="modal-title">Employee Info</h5>
                        <button
                            onClick={handleCloseModal}
                            type="button"
                            className="close-but"
                        >
                            <span>&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="form-row">
                            {/* 🔹 Basic Fields */}
                            {fields.map((f) => (
                                <div className="form-group col-md-4" key={f.name}>
                                    <label>{f.label}</label>
                                    <input
                                        type="text"
                                        name={f.name}
                                        value={empData[f.name] || ""}
                                        className="form-control"
                                        disabled
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
